import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld, windowAround } from "../../src/world/region.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { FONT_SIZE, REGION_FONT_SIZE } from "../../src/render/layers/settlements.ts";
import { BIOMES } from "../../src/climate/biomes.ts";
import { createRng } from "../../src/core/rng.ts";
import { createField } from "../../src/core/grid.ts";
import { lodWindowFor } from "../../src/world/lod.ts";
import { EDGE_MARGIN } from "../../src/society/sites.ts";
import {
  HAMLET_LATTICE_WORLD_CELLS,
  HAMLET_SPACING_WORLD_CELLS,
  hamletCandidates,
  hamletName,
  placeHamlets,
  worldNameSet,
} from "../../src/society/hamlets.ts";
import type { UvWindow } from "../../src/terrain/heightfield.ts";

// #171 Hamlets: a region-only tier on the deepest band's sheets (sizeUV 0.125). Candidates sit on a fixed world-space lattice, each point hashed independently off the seed, so existence, spot, and name are window- and interaction-order-independent, and no hamlet name collides with a world-sheet name.

const world = generateWorld(defaultRecipe(42, { gridW: 320, gridH: 240 }));
const DEEP = 0.125;

const count = (svg: string, needle: string): number => svg.split(needle).length - 1;

// The anchor window: the settlement environs with the richest candidate crop, resolved once and reused (deterministic by construction).
let cachedRich: UvWindow | null = null;
function richWindow(): UvWindow {
  if (cachedRich) return cachedRich;
  let best: { win: UvWindow; n: number } | null = null;
  for (const s of world.settlements) {
    const win = windowAround(world, s, DEEP);
    const n = hamletCandidates(world, win).length;
    if (!best || n > best.n) best = { win, n };
  }
  assert.ok(best, "the world has settlements to anchor a window on");
  assert.ok(
    best.n >= 3,
    `some deepest-band window grows a healthy crop of hamlets (best had ${best.n})`,
  );
  cachedRich = best.win;
  return best.win;
}

test("worldNameSet gathers the settlements and every feature name, lowercased", () => {
  const taken = worldNameSet(world);
  for (const s of world.settlements) {
    assert.ok(taken.has(s.name.toLowerCase()), `settlement ${s.name} is in the set`);
  }
  assert.ok(taken.has(world.names.sea.toLowerCase()), "the sea name is in the set");
  for (const name of world.names.rivers.values()) {
    assert.ok(taken.has(name.toLowerCase()), `river ${name} is in the set`);
  }
  for (const lake of world.names.lakes) {
    assert.ok(taken.has(lake.name.toLowerCase()), `lake ${lake.name} is in the set`);
  }
  for (const realm of world.names.realms) {
    assert.ok(taken.has(realm.toLowerCase()), `realm ${realm} is in the set`);
  }
  if (world.names.range) assert.ok(taken.has(world.names.range.toLowerCase()));
  if (world.names.forest) assert.ok(taken.has(world.names.forest.toLowerCase()));
});

test("hamletName is deterministic and draws past a taken name", () => {
  const culture = world.culture;
  const first = hamletName(createRng(7).fork("hamlet-name-test"), culture, new Set());
  assert.ok(first, "an open namespace yields a name");
  assert.equal(
    hamletName(createRng(7).fork("hamlet-name-test"), culture, new Set()),
    first,
    "the same rng stream yields the same name",
  );
  const second = hamletName(
    createRng(7).fork("hamlet-name-test"),
    culture,
    new Set([first.toLowerCase()]),
  );
  assert.ok(second, "a single collision does not exhaust the namespace");
  assert.notEqual(second.toLowerCase(), first.toLowerCase(), "the taken name is never returned");
});

test("candidates are deterministic, and stable across a regeneration of the world", () => {
  const win = richWindow();
  assert.deepEqual(hamletCandidates(world, win), hamletCandidates(world, win));
  // The download-redraw path regenerates the base world from the recovered recipe; hamlets must reproduce identically over that fresh world.
  const regen = generateWorld(defaultRecipe(42, { gridW: 320, gridH: 240 }));
  assert.deepEqual(hamletCandidates(regen, win), hamletCandidates(world, win));
});

test("candidates are window-independent: a shared lattice point is identical in both windows", () => {
  const win = richWindow();
  const step = HAMLET_LATTICE_WORLD_CELLS / (world.recipe.gridW - 1);
  // a second deepest-band window one lattice step east (clamped like lodWindowFor)
  const u0 = Math.min(win.u0 + step, 0.99 - DEEP);
  const winB: UvWindow = { u0, v0: win.v0, u1: u0 + DEEP, v1: win.v1 };
  const a = hamletCandidates(world, win);
  const b = hamletCandidates(world, winB);
  const du = DEEP;
  const inset = 0.02; // the same open-window inset region.ts applies to settlements
  const inB = (u: number, v: number): boolean =>
    u >= winB.u0 + du * inset && u <= winB.u1 - du * inset &&
    v >= winB.v0 + du * inset && v <= winB.v1 - du * inset;
  const shared = a.filter((c) => inB(c.u, c.v));
  assert.ok(shared.length >= 1, "the windows overlap on at least one candidate");
  const byPoint = new Map(b.map((c) => [`${c.u},${c.v}`, c]));
  for (const c of shared) {
    assert.deepEqual(
      byPoint.get(`${c.u},${c.v}`),
      c,
      `candidate ${c.name} at (${c.u.toFixed(4)}, ${c.v.toFixed(4)}) is identical from window B`,
    );
  }
});

test("candidates obey the placeSettlements screens on the base world", () => {
  const win = richWindow();
  const { gridW, gridH } = world.recipe;
  let worldMax = -Infinity;
  for (const v of world.elev.data) worldMax = Math.max(worldMax, v as number);
  const span = Math.max(1e-9, worldMax - world.seaLevel);

  const cands = hamletCandidates(world, win);
  assert.ok(cands.length >= 3, "the rich window has candidates to screen");
  for (const c of cands) {
    const wx = Math.round(c.u * (gridW - 1));
    const wy = Math.round(c.v * (gridH - 1));
    const i = wx + wy * gridW;
    const e = world.elev.data[i] as number;
    assert.ok(e > world.seaLevel, `${c.name} stands on base-world land`);
    const biome = world.biomes[i] as number;
    assert.ok(
      biome !== BIOMES.snow && biome !== BIOMES.alpine,
      `${c.name} avoids snow and alpine ground`,
    );
    assert.ok((e - world.seaLevel) / span <= 0.6, `${c.name} keeps to the settled elevation band`);
    assert.ok(
      wx >= EDGE_MARGIN && wy >= EDGE_MARGIN &&
        wx < gridW - EDGE_MARGIN && wy < gridH - EDGE_MARGIN,
      `${c.name} keeps the world-border margin`,
    );
    for (const s of world.settlements) {
      assert.ok(
        Math.hypot(s.x - c.u * (gridW - 1), s.y - c.v * (gridH - 1)) >=
          HAMLET_SPACING_WORLD_CELLS,
        `${c.name} keeps its distance from ${s.name}`,
      );
    }
    assert.ok(
      c.founded >= 1 && c.founded < world.title.year,
      `${c.name} was founded within the world's history`,
    );
  }
});

test("no candidate name collides with any world-sheet name for the seed", () => {
  const taken = worldNameSet(world);
  const cands = hamletCandidates(world, richWindow());
  assert.ok(cands.length >= 3, "candidates exist to check");
  for (const c of cands) {
    assert.ok(c.name.length > 0, "every hamlet is named");
    assert.ok(!taken.has(c.name.toLowerCase()), `${c.name} collides with a world name`);
  }
});

test("placeHamlets projects candidates onto region land, appended by the region pipeline", () => {
  const win = richWindow();
  const region = generateRegionWorld(world, {
    window: win, gridW: 320, gridH: 240, title: "Hamlet Environs",
  });
  const hamlets = region.settlements.filter((s) => s.kind === "hamlet");
  assert.ok(hamlets.length >= 3, "the deepest survey grows hamlets");

  const candNames = new Set(hamletCandidates(world, win).map((c) => c.name));
  for (const h of hamlets) {
    assert.ok(candNames.has(h.name), `${h.name} came from the lattice candidates`);
    assert.equal(h.ruined, false, "hamlets are never ruins");
    const i = h.x + h.y * region.elev.w;
    assert.ok((region.elev.data[i] as number) > region.seaLevel, `${h.name} stands on region land`);
  }

  assert.deepEqual(placeHamlets(world, win, region.elev, region.seaLevel), hamlets);

  // Verified INDEPENDENTLY (review: the round-trip above runs the same code on the same inputs, so it cannot catch a deterministic scaling bug): each hamlet must land within one snap-cell of this test's own uv->cell math.
  const byName = new Map(hamletCandidates(world, win).map((c) => [c.name, c]));
  for (const h of hamlets) {
    const c = byName.get(h.name);
    assert.ok(c, `${h.name} has a candidate`);
    const ex = Math.round(((c.u - win.u0) / (win.u1 - win.u0)) * (region.elev.w - 1));
    const ey = Math.round(((c.v - win.v0) / (win.v1 - win.v0)) * (region.elev.h - 1));
    assert.ok(
      Math.max(Math.abs(h.x - ex), Math.abs(h.y - ey)) <= 1,
      `${h.name} projects to its candidate's cell: got (${h.x},${h.y}), expected (${ex},${ey}) +-1 snap`,
    );
  }
});

test("a deepest survey is byte-identical when regenerated from scratch", () => {
  const win = richWindow();
  const spec = { window: win, gridW: 320, gridH: 240, title: "Hamlet Environs" };
  const regen = generateWorld(defaultRecipe(42, { gridW: 320, gridH: 240 }));
  const a = renderMap(generateRegionWorld(world, spec), { style: "antique", legend: true });
  const b = renderMap(generateRegionWorld(regen, spec), { style: "antique", legend: true });
  assert.ok(a === b, "same seed + window draws the same bytes (same machine)");
  assert.ok(count(a, 'data-tier="hamlet"') >= 3, "the sheet carries hamlet marks");
});

test("hamlet marks are smaller than the village dot and label at the smallest size", () => {
  const win = richWindow();
  const region = generateRegionWorld(world, {
    window: win, gridW: 320, gridH: 240, title: "Hamlet Environs",
  });
  const svg = renderMap(region, { style: "antique" });
  // each hamlet group's mark radius sits under the village dot's 2.3 * k (k = 1 at 1500px)
  const groups = [...svg.matchAll(/<g class="settlement" data-idx="\d+" data-tier="hamlet"[^>]*>(.*?)<\/g>/gs)];
  assert.ok(groups.length >= 3, "hamlet groups are drawn");
  for (const g of groups) {
    const r = g[1]!.match(/\br="([\d.]+)"/);
    assert.ok(r, "a hamlet draws a circle mark");
    assert.ok(Number(r[1]) < 2.3, `hamlet mark r=${r[1]} sits under the village dot`);
  }
});

test("label pressure drops hamlet labels first and never force-places them (#171)", () => {
  // The AC "tier order preserved in label pressure": a hamlet may go label-less while capital/seat/town always keep one; the whole rule is one clause in settlementsLayer, and nothing else would catch its reversal.
  const win = richWindow();
  const region = generateRegionWorld(world, {
    window: win, gridW: 320, gridH: 240, title: "Crowded Environs",
  });
  const svg = renderMap(region, { style: "antique" });

  // the settlements layer only (labels of other layers must not leak into the check)
  const layerStart = svg.indexOf('<g id="layer-settlements">');
  assert.ok(layerStart >= 0);
  const nextLayer = svg.indexOf('<g id="layer-', layerStart + 10);
  const layer = svg.slice(layerStart, nextLayer > 0 ? nextLayer : undefined);

  const marks = [...layer.matchAll(/<g class="settlement" data-idx="\d+" data-tier="([a-z]+)"[^>]*>/g)];
  assert.ok(marks.length > 0, "settlement groups drawn");
  const groups = marks.map((m, i) => ({
    tier: m[1] as string,
    labeled: layer
      .slice((m.index as number) + m[0].length, i + 1 < marks.length ? marks[i + 1]!.index : undefined)
      .includes("<text"),
  }));

  const hamlets = groups.filter((g) => g.tier === "hamlet");
  assert.ok(hamlets.length >= 3, "hamlet groups drawn");
  assert.ok(
    hamlets.some((g) => !g.labeled),
    "at least one hamlet lost the contest and went label-less (the drop path is live)",
  );
  for (const g of groups) {
    if (g.tier === "village" || g.tier === "hamlet") continue;
    assert.ok(g.labeled, `a ${g.tier} keeps its label even in a crowd`);
  }
});

test("region sheets set settlement labels larger; world sheets keep their type (readability)", () => {
  // On a regional survey the labels are the reveal and the inset is viewed near viewport width, so region sheets scale settlement type by REGION_TYPE_SCALE; world sheets keep FONT_SIZE exactly (golden-locked).
  const win = richWindow();
  const region = generateRegionWorld(world, {
    window: win, gridW: 320, gridH: 240, title: "Legible Environs",
  });
  const regionSvg = renderMap(region, { style: "antique" });
  const worldSvg = renderMap(world, { style: "antique" });

  // Every labeled settlement is set at its tier's SCALED size, bounded to the settlements layer so the cartouche and feature labels cannot leak into the last slice.
  const layerStart = regionSvg.indexOf('<g id="layer-settlements">');
  assert.ok(layerStart >= 0);
  const nextLayer = regionSvg.indexOf('<g id="layer-', layerStart + 10);
  const layer = regionSvg.slice(layerStart, nextLayer > 0 ? nextLayer : undefined);
  const marks = [...layer.matchAll(/<g class="settlement" data-idx="\d+" data-tier="([a-z]+)"[^>]*>/g)];
  const labeled: Array<{ tier: keyof typeof FONT_SIZE; fs: number }> = [];
  marks.forEach((m, i) => {
    const body = layer.slice(
      (m.index as number) + m[0].length,
      i + 1 < marks.length ? marks[i + 1]!.index : undefined,
    );
    const fs = body.match(/<text[^>]*font-size="([\d.]+)"/);
    if (fs) labeled.push({ tier: m[1] as keyof typeof FONT_SIZE, fs: Number(fs[1]) });
  });
  assert.ok(
    labeled.some((l) => l.tier === "hamlet"),
    "the survey labels at least one hamlet",
  );
  for (const l of labeled) {
    const expected = Number(REGION_FONT_SIZE[l.tier].toFixed(1));
    assert.equal(l.fs, expected, `a region ${l.tier} label is set at ${expected}, not ${l.fs}`);
  }
  for (const tier of Object.keys(FONT_SIZE) as Array<keyof typeof FONT_SIZE>) {
    assert.ok(REGION_FONT_SIZE[tier] > FONT_SIZE[tier], `region ${tier} type grows`);
  }
  assert.ok(
    REGION_FONT_SIZE.hamlet / FONT_SIZE.hamlet > REGION_FONT_SIZE.capital / FONT_SIZE.capital,
    "the smallest tier gains the most",
  );
  assert.ok(
    REGION_FONT_SIZE.capital > REGION_FONT_SIZE.seat &&
      REGION_FONT_SIZE.seat > REGION_FONT_SIZE.town &&
      REGION_FONT_SIZE.town > REGION_FONT_SIZE.village &&
      REGION_FONT_SIZE.village > REGION_FONT_SIZE.hamlet,
    "the tier hierarchy holds at region sizes",
  );
  assert.ok(REGION_FONT_SIZE.hamlet >= 12.5, "hamlet type is laptop-legible at display scale");

  // The world sheet is untouched: data-tier is region-only, so read the world label size off any village text.
  const worldVillage = worldSvg.match(
    new RegExp(`<text[^>]*font-size="${FONT_SIZE.village}"`),
  );
  assert.ok(worldVillage, "world villages keep their base type (golden-locked)");
});

test("the legend keys a Hamlet row only on sheets that contain hamlets", () => {
  const win = richWindow();
  const region = generateRegionWorld(world, {
    window: win, gridW: 320, gridH: 240, title: "Hamlet Environs",
  });
  const withHamlets = renderMap(region, { style: "antique", legend: true });
  assert.ok(withHamlets.includes(">Hamlet<"), "the deepest survey keys its hamlets");

  const shallow = generateRegionWorld(world, {
    window: windowAround(world, world.settlements[0]!, 0.3),
    gridW: 320, gridH: 240, title: "Shallow Environs",
  });
  const without = renderMap(shallow, { style: "antique", legend: true });
  assert.ok(!without.includes(">Hamlet<"), "a shallower survey keys no hamlet row");
});

test("hamlets snap on the band's radius too, not the old 8-neighbour scan (#399)", () => {
  const world = generateWorld(defaultRecipe(2));
  const window = lodWindowFor(0.5625, 0.4375, 0.125);
  const candidates = hamletCandidates(world, window);
  assert.ok(candidates.length >= 4, "the fixture window carries hamlet candidates");

  const du = window.u1 - window.u0;
  const dv = window.v1 - window.v0;
  const OFFSET = 5; // beyond the old 8-neighbour reach, inside the band's radius of 8
  const shore = new Set(
    candidates.map((c) => {
      const gx = Math.round(((c.u - window.u0) / du) * 319);
      const gy = Math.round(((c.v - window.v0) / dv) * 239);
      return Math.min(gx + OFFSET, 319) + gy * 320;
    }),
  );
  // Every candidate lands in water with its only land OFFSET cells east: the old scan drops
  // them all, the band-scaled snap walks every one of them ashore.
  const elev = createField(320, 240, (x, y) => (shore.has(x + y * 320) ? 1 : -1));

  const placed = placeHamlets(world, window, elev, 0);
  assert.equal(placed.length, candidates.length, "no candidate is lost to the receded shore");
  for (const h of placed) {
    assert.ok((elev.data[h.x + h.y * 320] as number) > 0, `${h.name} stands on land`);
  }
});
