import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld, regionTitle } from "../../src/world/region.ts";
import type { World } from "../../src/world/types.ts";
import type { UvWindow } from "../../src/terrain/heightfield.ts";
import { createRng } from "../../src/core/rng.ts";
import { minMax } from "../../src/core/grid.ts";
import { largestBlob } from "../../src/render/blobs.ts";
import { createLabelArena, type RenderCtx } from "../../src/render/context.ts";
import { boxesOverlap, centroidOf, spacedTextBox, WIDTH_FACTOR, type Box } from "../../src/render/geometry.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { renderSvg } from "../../src/render/svg.ts";
import { STYLES } from "../../src/render/style.ts";
import { createProjection, marginFor, type Projection } from "../../src/render/transform.ts";
import { boxMeetsRiver } from "../../src/render/layers/river-clearance.ts";
import { insideSheet } from "../../src/render/layers/sheet-room.ts";
import { nameSetting, settlementsLayer } from "../../src/render/layers/settlements.ts";
import { glyphPoly, textNodes, type Poly } from "../../test-support/label-geometry.ts";

const WIDTH = 1500;

const win = (u0: number, v0: number, size: number): UvWindow => ({ u0, v0, u1: u0 + size, v1: v0 + size });

function closeUp(seed: number, window: UvWindow): World {
  const world = generateWorld(defaultRecipe(seed));
  return generateRegionWorld(world, {
    window,
    gridW: 320,
    gridH: 240,
    title: regionTitle(world, window),
    detail: true,
  });
}

const sheetOf = (world: World): string => renderMap(world, { style: "antique", widthPx: WIDTH, legend: true });

const projOf = (world: World): Projection => createProjection(world.elev.w, world.elev.h, WIDTH, marginFor(WIDTH));

function boundsOf(poly: Poly): Box {
  const xs = poly.map((p) => p.x);
  const ys = poly.map((p) => p.y);
  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    w: Math.max(...xs) - Math.min(...xs),
    h: Math.max(...ys) - Math.min(...ys),
  };
}

function drawnRealm(svg: string, name: string): Box {
  const at = svg.indexOf('<g id="layer-feature-labels"');
  assert.notEqual(at, -1, "the feature-labels layer is drawn");
  const nodes = textNodes(svg.slice(at)).filter((n) => n.text === name.toUpperCase());
  assert.equal(nodes.length, 1, `${name} is drawn once`);
  return boundsOf(glyphPoly(nodes[0]!));
}

function drawnPlace(svg: string, name: string): Box {
  const at = svg.indexOf(`data-name="${name}"`);
  assert.notEqual(at, -1, `${name} has a settlement group`);
  const nextGroup = svg.indexOf('<g class="settlement"', at);
  const labels = svg.indexOf('<g id="layer-feature-labels"', at);
  assert.notEqual(labels, -1, "the feature-labels layer follows the settlements");
  const end = nextGroup !== -1 && nextGroup < labels ? nextGroup : labels;
  const nodes = textNodes(svg.slice(at, end));
  assert.equal(nodes.length, 1, `${name}'s name is drawn once`);
  return boundsOf(glyphPoly(nodes[0]!));
}

function centreRung(region: World, name: string): Box {
  const proj = projOf(region);
  const realm = region.names.realms.indexOf(name);
  assert.notEqual(realm, -1, `${name} is a realm of the close-up`);
  const blob = largestBlob(region.elev.w, region.elev.h, (i) => region.realms.labels[i] === realm);
  const c = centroidOf(blob.map((i) => ({ x: proj.px(i % region.elev.w), y: proj.py((i / region.elev.w) | 0) })));
  return spacedTextBox(c.x, c.y, name, 16.5, 4, WIDTH_FACTOR.caps);
}

function keyBox(svg: string): Box {
  const at = svg.indexOf('<g id="layer-legend"');
  assert.notEqual(at, -1, "the key is drawn");
  const m = svg.slice(at).match(/<rect x="([-\d.]+)" y="([-\d.]+)" width="([-\d.]+)" height="([-\d.]+)"/);
  assert.ok(m, "the key opens with its panel");
  return { x: Number(m[1]), y: Number(m[2]), w: Number(m[3]), h: Number(m[4]) };
}

const inMap = (b: Box, proj: Projection): boolean =>
  b.x >= proj.margin &&
  b.x + b.w <= proj.widthPx - proj.margin &&
  b.y >= proj.margin &&
  b.y + b.h <= proj.heightPx - proj.margin;

const wet = (region: World, b: Box, proj: Projection): boolean =>
  boxMeetsRiver(b, { cells: region.riverCells, w: region.elev.w, h: region.elev.h }, proj);

test("on a close-up a realm name stays whole inside the map", () => {
  const witnesses: ReadonlyArray<readonly [string, number, UvWindow, string]> = [
    ["chart 42, P6 band 5", 42, win(0.43359375, 0.30078125, 1 / 32), "The Chiefdom of Rekekoa"],
    ["chart 11, P10 band 3", 11, win(0.484375, 0.1875, 1 / 8), "The Tararu Atolls"],
    ["chart 1, band 2", 1, win(0.375, 0.21875, 1 / 4), "The Fifth Sun of Tzanic"],
    ["chart 1, band 4", 1, win(0.6171875, 0.484375, 1 / 16), "The Tiayi Dominion"],
  ];
  for (const [where, seed, window, name] of witnesses) {
    const region = closeUp(seed, window);
    const proj = projOf(region);
    const label = `${name} (${where})`;
    assert.equal(inMap(centreRung(region, name), proj), false, `${label}: its first rung leaves the map`);
    assert.equal(inMap(drawnRealm(sheetOf(region), name), proj), true, `${label} is drawn inside the map`);
  }
});

test("on a close-up a forced place name stays whole inside the map, under the key with its mark where it must", () => {
  const witnesses: ReadonlyArray<readonly [string, number, UvWindow, string, "capital" | "town"]> = [
    ["chart 2, band 4", 2, win(0.4375, 0.578125, 1 / 16), "Vunsvyov", "capital"],
    ["chart 4, band 1", 4, win(0.01, 0.3125, 1 / 2), "Maimaiwapua", "town"],
  ];
  for (const [where, seed, window, name, tier] of witnesses) {
    const region = closeUp(seed, window);
    const proj = projOf(region);
    const s = region.settlements.find((c) => c.name === name);
    assert.ok(s, `${name} is a settlement of the close-up`);
    const first = nameSetting(region, proj, s, tier).tries[0]!.box;
    assert.equal(inMap(first, proj), false, `${name} (${where}): its first spot leaves the map`);
    assert.equal(inMap(drawnPlace(sheetOf(region), name), proj), true, `${name} (${where}) is drawn inside the map`);
  }
});

test("on a close-up a forced realm name keeps off the key where one of its spots allows", () => {
  const name = "The Gweil Compact";
  const region = closeUp(6, win(0.125, 0.01, 1 / 2));
  const svg = sheetOf(region);
  assert.equal(boxesOverlap(centreRung(region, name), keyBox(svg)), true, "its first rung stands on the key");
  assert.equal(boxesOverlap(drawnRealm(svg, name), keyBox(svg)), false, "it is drawn clear of the key");
});

test("on a close-up a realm name steps off its river where a dry spot is free", () => {
  const name = "The Chiefdom of Rekekoa";
  const world = generateWorld(defaultRecipe(42));
  const windows: ReadonlyArray<readonly [string, UvWindow]> = [
    ["P1 band 4", win(0.4765625, 0.3671875, 1 / 16)],
    ["P1 band 5", win(0.49609375, 0.3828125, 1 / 32)],
  ];
  for (const [where, window] of windows) {
    const region = generateRegionWorld(world, {
      window,
      gridW: 320,
      gridH: 240,
      title: regionTitle(world, window),
      detail: true,
    });
    const proj = projOf(region);
    assert.equal(wet(region, centreRung(region, name), proj), true, `${where}: its first rung lies on a river`);
    assert.equal(wet(region, drawnRealm(sheetOf(region), name), proj), false, `${where}: it is drawn off the rivers`);
  }
});

test("a world sheet keeps a realm name where it always stood, past the edge", () => {
  const name = "The Mandate of Chibida";
  const world = generateWorld(defaultRecipe(35));
  const proj = projOf(world);
  const drawn = drawnRealm(sheetOf(world), name);
  const rung = centreRung(world, name);

  assert.equal(inMap(drawn, proj), false, "it is drawn past the edge");
  assert.ok(Math.abs(drawn.x + drawn.w / 2 - (rung.x + rung.w / 2)) < 1e-6, "it is drawn at its centre rung");
});

test("a world sheet forces a capital's name into its first spot, even past the edge", () => {
  const region = closeUp(2, win(0.4375, 0.578125, 1 / 16));
  const sheetLike: World = { ...region, region: undefined };
  const proj = projOf(sheetLike);
  const { max } = minMax(sheetLike.elev);
  const ctx: RenderCtx = {
    world: sheetLike,
    style: STYLES.antique,
    proj,
    coastRings: [],
    elevSpan: Math.max(1e-9, max - sheetLike.seaLevel),
    rng: createRng(sheetLike.recipe.seed).fork("render"),
    realmTint: [],
    labels: createLabelArena(),
  };
  const idx = sheetLike.settlements.findIndex((s) => s.name === "Vunsvyov");
  assert.notEqual(idx, -1, "Vunsvyov is a settlement of the sheet");
  const { tries } = nameSetting(sheetLike, proj, sheetLike.settlements[idx]!, "capital");
  assert.equal(insideSheet(tries[0]!.box, proj), false, "its first spot leaves the sheet");
  assert.equal(insideSheet(tries[1]!.box, proj), true, "its second spot fits");
  for (const t of tries) ctx.labels.claim(t.box);

  const svg = renderSvg(settlementsLayer(ctx).finish().node);
  const at = svg.indexOf(`data-idx="${idx}"`);
  assert.notEqual(at, -1, "the capital has a settlement group");
  const end = svg.indexOf('<g class="settlement"', at + 1);
  const nodes = textNodes(svg.slice(at, end === -1 ? undefined : end));
  assert.equal(nodes.length, 1, "its name is drawn once");
  const drawn = nodes[0]!;
  assert.deepEqual(
    { x: drawn.x, y: drawn.y, anchor: drawn.anchor },
    { x: tries[0]!.at.x, y: tries[0]!.at.y, anchor: tries[0]!.at.anchor },
  );
});
