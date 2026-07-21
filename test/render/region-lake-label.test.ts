import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld, windowAround, regionTitle } from "../../src/world/region.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { seaMask } from "../../src/hydrology/sea-mask.ts";
import { createProjection, marginFor } from "../../src/render/transform.ts";
import type { World } from "../../src/world/types.ts";

/**
 * #234: on a regional survey the sea caption placed on the deepest water landed on
 * whatever water was deepest in the window, even a landlocked LAKE, because
 * `oceanDist` cannot tell a lake from the open sea. Worse, a region-local sea/lake
 * test does not fix it: cropping reconnects an inland lake to the window edge, so
 * the region's OWN `seaMask` floods it as sea. The classification has to be
 * inherited from the PARENT world. These tests measure the placed caption against
 * the parent world's authoritative sea/lake partition, and check that the parent's
 * named lakes are carried into the window so a lake reads as a lake.
 */

function capitalRegion(seed: number, size = 0.38): { world: World; region: World; win: ReturnType<typeof windowAround> } {
  const world = generateWorld(defaultRecipe(seed, { gridW: 320, gridH: 240 }));
  const capital = world.settlements.find((s) => s.kind === "capital") ?? world.settlements[0]!;
  const win = windowAround(world, capital, size);
  const region = generateRegionWorld(world, {
    window: win, gridW: 320, gridH: 240, title: regionTitle(world, win),
  });
  return { world, region, win };
}

const escapeRe = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The pixel center of the placed sea caption, or null if the sea name is not drawn. */
function seaCaptionCenter(svg: string, seaName: string): { px: number; py: number } | null {
  const m = new RegExp(`<text x="([\\d.]+)" y="([\\d.]+)"[^>]*>${escapeRe(seaName)}</text>`).exec(svg);
  return m ? { px: parseFloat(m[1]!), py: parseFloat(m[2]!) } : null;
}

/** Invert the render projection (px -> grid cell) for a region rendered at widthPx. */
function pxToGrid(region: World, widthPx: number): (px: number, py: number) => { gx: number; gy: number } {
  const proj = createProjection(region.elev.w, region.elev.h, widthPx, marginFor(widthPx));
  const scale = (proj.px(1) - proj.px(0));
  return (px, py) => ({
    gx: Math.round((px - proj.px(0)) / scale),
    gy: Math.round((py - proj.py(0)) / scale),
  });
}

/** Classify a region cell by the PARENT world's sea/lake partition: 1 = genuine sea. */
function parentSeaAt(world: World, win: ReturnType<typeof windowAround>, gx: number, gy: number, region: World): number {
  const worldSea = seaMask(world.elev, world.seaLevel);
  const W = world.recipe.gridW, H = world.recipe.gridH;
  const u = win.u0 + (gx / (region.elev.w - 1)) * (win.u1 - win.u0);
  const v = win.v0 + (gy / (region.elev.h - 1)) * (win.v1 - win.v0);
  const wx = Math.min(W - 1, Math.max(0, Math.round(u * (W - 1))));
  const wy = Math.min(H - 1, Math.max(0, Math.round(v * (H - 1))));
  return worldSea[wx + wy * W]!;
}

const WIDTH = 1500;

test("region sea caption never lands on a parent-world lake (#234, seed 42)", () => {
  const { world, region, win } = capitalRegion(42);
  const svg = renderMap(region, { style: "antique", widthPx: WIDTH });
  const center = seaCaptionCenter(svg, region.names.sea);
  // The invariant is: EITHER the sea caption is not drawn, OR it sits on genuine
  // parent-sea. On seed 42's capital plate the deepest water is the parent lake
  // "The Mairoa Pool", so before the fix the caption is drawn on a lake and this
  // fails on the assertion below (not on a missing element).
  if (center !== null) {
    const { gx, gy } = pxToGrid(region, WIDTH)(center.px, center.py);
    assert.equal(
      parentSeaAt(world, win, gx, gy, region), 1,
      `sea caption at region(${gx},${gy}) sits on a parent-world lake, not the sea`,
    );
  }
});

test("a genuinely coastal region still captions its sea, on real ocean (#234 guard)", () => {
  // seed 7's capital environs are open coast: the caption must survive the gate and
  // sit on genuine parent-sea. Guards the fix against over-suppression.
  const { world, region, win } = capitalRegion(7);
  const svg = renderMap(region, { style: "antique", widthPx: WIDTH });
  const center = seaCaptionCenter(svg, region.names.sea);
  assert.ok(center, "a coastal region must still draw its sea caption");
  const { gx, gy } = pxToGrid(region, WIDTH)(center.px, center.py);
  assert.equal(
    parentSeaAt(world, win, gx, gy, region), 1,
    `coastal sea caption at region(${gx},${gy}) must sit on genuine parent-sea`,
  );
});

test("region carries the parent world's named lakes, and a lake reads as a lake (#234)", () => {
  const { world, region } = capitalRegion(42);
  // The parent's lakes that fall inside the window are carried in, by name.
  assert.ok(region.names.lakes.length > 0, "region inherits the parent's in-window lakes");
  const names = new Set(region.names.lakes.map((l) => l.name));
  const parentInWindow = world.names.lakes.filter((l) => {
    const u = l.x / (world.recipe.gridW - 1), v = l.y / (world.recipe.gridH - 1);
    const win = windowAround(world, world.settlements.find((s) => s.kind === "capital")!, 0.38);
    return u >= win.u0 && u <= win.u1 && v >= win.v0 && v <= win.v1;
  });
  assert.ok(parentInWindow.length > 0, "precondition: seed 42's window contains parent lakes");
  for (const l of parentInWindow) assert.ok(names.has(l.name), `carried lake name "${l.name}"`);

  // and at least one of those lake names is actually drawn on the plate
  const svg = renderMap(region, { style: "antique", widthPx: WIDTH });
  assert.ok(
    [...names].some((n) => svg.includes(`>${n}</text>`)),
    "at least one inherited lake name is rendered as a label",
  );
});

test("region lake projection is deterministic across a regeneration (#234, redraw path)", () => {
  const a = capitalRegion(42).region.names.lakes;
  const b = capitalRegion(42).region.names.lakes;
  assert.deepEqual(a, b, "names.lakes must be a pure function of (world, window)");
});

test("world charts are un-gated: the sea gate is region-only (#234 byte-identity)", () => {
  const world = generateWorld(defaultRecipe(42, { gridW: 320, gridH: 240 }));
  assert.equal(world.region, undefined, "a standalone world carries no region metadata");
  // the world path is the un-gated path: its sea caption is still placed as before
  const svg = renderMap(world, { style: "antique", widthPx: WIDTH });
  assert.ok(seaCaptionCenter(svg, world.names.sea), "world sea caption still drawn (gate inactive)");
});
