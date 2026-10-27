import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld, windowAround } from "../../src/world/region.ts";
import type { NamedSettlement, World } from "../../src/world/types.ts";
import { createRng } from "../../src/core/rng.ts";
import { minMax } from "../../src/core/grid.ts";
import { createLabelArena, type RenderCtx } from "../../src/render/context.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { renderSvg } from "../../src/render/svg.ts";
import { STYLES } from "../../src/render/style.ts";
import { nameSetting } from "../../src/render/layers/settlements.ts";
import type { SettlementTier } from "../../src/render/layers/settlement-marks.ts";
import { boxMeetsRiver } from "../../src/render/layers/river-clearance.ts";
import { glyphsLayer, markStandsOn } from "../../src/render/layers/glyphs.ts";
import { SYMBOL_EXTENT } from "../../src/render/layers/glyph-symbols.ts";
import type { MarkKind } from "../../src/render/layers/glyph-clearance.ts";
import { createProjection, marginFor } from "../../src/render/transform.ts";
import { glyphPoly, polysOverlap, textNodes, type Poly } from "../../test-support/label-geometry.ts";

const WIDTH = 1500;

function closeUp(seed: number, window: { u0: number; v0: number; u1: number; v1: number }): World {
  const world = generateWorld(defaultRecipe(seed));
  return generateRegionWorld(world, { window, gridW: 320, gridH: 240, title: "The Environs (band 5)", detail: true });
}

const TZE_B5 = closeUp(23, { u0: 0.546875, v0: 0.671875, u1: 0.578125, v1: 0.703125 });
const MANGKOA_B5 = closeUp(42, { u0: 0.49609375, v0: 0.3828125, u1: 0.52734375, v1: 0.4140625 });
const SEVEN_B5 = closeUp(7, { u0: 0.26171875, v0: 0.29296875, u1: 0.29296875, v1: 0.32421875 });

const STAL_PLATE = ((): World => {
  const world = generateWorld(defaultRecipe(15));
  const stal = world.settlements.find((s) => s.name === "Stal");
  assert.ok(stal, "Stal is a settlement of chart 15");
  return generateRegionWorld(world, {
    window: windowAround(world, stal, 0.38),
    gridW: world.recipe.gridW,
    gridH: world.recipe.gridH,
    title: "The Environs of Stal",
  });
})();

const sheetOf = (region: World): string => renderMap(region, { style: "antique", widthPx: WIDTH, legend: true });

function projOf(region: World): ReturnType<typeof createProjection> {
  return createProjection(region.elev.w, region.elev.h, WIDTH, marginFor(WIDTH));
}

type DrawnName = { readonly tier: SettlementTier; readonly slice: string };

function drawnGroup(svg: string, name: string): DrawnName {
  const at = svg.indexOf(`data-name="${name}"`);
  assert.notEqual(at, -1, `${name} has a settlement group`);
  const tier = svg.slice(0, at).match(/data-tier="([a-z]+)" $/)?.[1];
  assert.ok(tier, `${name} group carries its tier`);
  const nextGroup = svg.indexOf('<g class="settlement"', at);
  const labels = svg.indexOf('<g id="layer-feature-labels"', at);
  assert.notEqual(labels, -1, "the feature-labels layer follows the settlements");
  const end = nextGroup !== -1 && nextGroup < labels ? nextGroup : labels;
  return { tier: tier as SettlementTier, slice: svg.slice(at, end) };
}

function drawnCandidate(
  region: World,
  s: NamedSettlement,
  drawn: DrawnName,
): { readonly index: number; readonly wet: boolean; readonly firstWet: boolean } {
  const proj = projOf(region);
  const rivers = { cells: region.riverCells, w: region.elev.w, h: region.elev.h };
  const nodes = textNodes(drawn.slice);
  const { tries } = nameSetting(region, proj, s, drawn.tier);
  assert.equal(nodes.length, 1, `${s.name}'s name is drawn once`);
  const node = nodes[0]!;
  const index = tries.findIndex(({ at }) => at.x === node.x && at.y === node.y && at.anchor === node.anchor);
  assert.ok(index >= 0, `${s.name}'s drawn label is one of its candidates`);
  return {
    index,
    wet: boxMeetsRiver(tries[index]!.box, rivers, proj),
    firstWet: boxMeetsRiver(tries[0]!.box, rivers, proj),
  };
}

const settlementNamed = (region: World, name: string): NamedSettlement => {
  const s = region.settlements.find((c) => c.name === name);
  assert.ok(s, `${name} is a settlement of the close-up`);
  return s;
};

test("a place name steps off its river on a close-up (Tze, chart 23, band 5)", () => {
  const read = drawnCandidate(TZE_B5, settlementNamed(TZE_B5, "Tze"), drawnGroup(sheetOf(TZE_B5), "Tze"));
  assert.equal(read.firstWet, true, "Tze's first choice sits on its river");
  assert.equal(read.wet, false, "the drawn spot covers no river cell");
});

test("a place name with no dry spot free keeps its place on its river (Mangkoa Mill, chart 42, band 5)", () => {
  const drawn = drawnGroup(sheetOf(MANGKOA_B5), "Mangkoa");
  assert.equal(drawn.tier, "mill");
  const read = drawnCandidate(MANGKOA_B5, settlementNamed(MANGKOA_B5, "Mangkoa"), drawn);
  assert.equal(textNodes(drawn.slice)[0]!.text, "Mangkoa Mill");
  assert.equal(read.wet, true, "it came through the second pass, on its river");
});

type ReadMark = { readonly symbol: string; readonly x: number; readonly y: number; readonly poly: Poly };

const MARK_USE = /<use href="#([a-z0-9-]+)"[^>]*transform="translate\((-?[\d.]+) (-?[\d.]+)\) scale\(([\d.]+)\)"/g;

function marksIn(layerSvg: string): ReadMark[] {
  const at = layerSvg.indexOf('<g id="layer-glyphs"');
  assert.notEqual(at, -1, "the glyph layer is drawn");
  const end = layerSvg.indexOf("</g>", at);
  assert.notEqual(end, -1, "the glyph layer closes");
  const slice = layerSvg.slice(at, end);
  const marks = [...slice.matchAll(MARK_USE)].map((m) => {
    const [symbol, x, y, scale] = [m[1] as string, Number(m[2]), Number(m[3]), Number(m[4])];
    const [x0, y0, x1, y1] = SYMBOL_EXTENT[symbol]!;
    const poly = [
      { x: x + x0 * scale, y: y + y0 * scale },
      { x: x + x1 * scale, y: y + y0 * scale },
      { x: x + x1 * scale, y: y + y1 * scale },
      { x: x + x0 * scale, y: y + y1 * scale },
    ];
    return { symbol, x, y, poly };
  });
  assert.equal(marks.length, slice.split("<use ").length - 1, "every mark of the layer is read");
  return marks;
}

function namePolys(region: World, svg: string): { readonly place: Poly[]; readonly realm: Poly[] } {
  const settlements = svg.indexOf('<g id="layer-settlements"');
  const labels = svg.indexOf('<g id="layer-feature-labels"');
  assert.notEqual(settlements, -1, "the settlements layer is drawn");
  assert.notEqual(labels, -1, "the feature-labels layer is drawn");
  const realmNames = new Set(region.names.realms.map((r) => r.toUpperCase()));
  return {
    place: textNodes(svg.slice(settlements, labels)).map((n) => glyphPoly(n)),
    realm: textNodes(svg.slice(labels))
      .filter((n) => realmNames.has(n.text))
      .map((n) => glyphPoly(n)),
  };
}

const marksMeeting = (marks: ReadonlyArray<ReadMark>, names: ReadonlyArray<Poly>): number =>
  marks.filter((m) => names.some((n) => polysOverlap(m.poly, n))).length;

function witnessCtx(region: World): RenderCtx {
  const { max } = minMax(region.elev);
  return {
    world: region,
    style: STYLES.antique,
    proj: projOf(region),
    coastRings: [],
    elevSpan: Math.max(1e-9, max - region.seaLevel),
    rng: createRng(region.recipe.seed).fork("render"),
    realmTint: [],
    labels: createLabelArena(),
  };
}

function readClearance(region: World): {
  readonly witnessPlace: number;
  readonly witnessRealm: number;
  readonly place: number;
  readonly realm: number;
  readonly placeNames: number;
  readonly realmNames: number;
} {
  const svg = sheetOf(region);
  const names = namePolys(region, svg);
  const uncleared = marksIn(renderSvg(glyphsLayer(witnessCtx(region), [])!));
  const built = marksIn(svg);
  return {
    witnessPlace: marksMeeting(uncleared, names.place),
    witnessRealm: marksMeeting(uncleared, names.realm),
    place: marksMeeting(built, names.place),
    realm: marksMeeting(built, names.realm),
    placeNames: names.place.length,
    realmNames: names.realm.length,
  };
}

function assertCleared(region: World): void {
  const read = readClearance(region);
  assert.ok(read.placeNames > 0 && read.realmNames > 0, "a place name and a realm name are drawn");
  assert.ok(read.witnessPlace > 0, "uncleared, marks stand on place names");
  assert.ok(read.witnessRealm > 0, "uncleared, marks stand on realm names");
  assert.equal(read.place, 0, "no mark meets a place name");
  assert.equal(read.realm, 0, "no mark meets a realm name");
}

test("on a close-up no terrain mark meets a place or realm name (chart 7, band 5)", () => {
  assertCleared(SEVEN_B5);
});

test("the bound atlas's regional plate clears its names too (chart 15, the plate round Stal)", () => {
  assertCleared(STAL_PLATE);
});

const KIND_OF_PREFIX: ReadonlyArray<readonly [string, MarkKind]> = [
  ["gl-mtn", "mtn"],
  ["gl-hill", "hill"],
  ["gl-tree", "tree"],
  ["gl-marsh", "marsh"],
  ["gl-dune", "dune"],
];

test("every terrain mark on a close-up stands on ground of its own kind", () => {
  for (const region of [SEVEN_B5, STAL_PLATE]) {
    const proj = projOf(region);
    const { elevSpan } = witnessCtx(region);
    const { w, data } = region.elev;
    const marks = marksIn(sheetOf(region));
    assert.ok(marks.length > 0, "the sheet draws marks");
    const strays = marks.filter((m) => {
      const kind = KIND_OF_PREFIX.find(([prefix]) => m.symbol.startsWith(prefix))![1];
      const gx = Math.round((m.x - proj.margin) / proj.scale);
      const gy = Math.round((m.y - proj.margin) / proj.scale);
      const i = gx + gy * w;
      const e = data[i] as number;
      return !(e > region.seaLevel && markStandsOn(kind, (e - region.seaLevel) / elevSpan, region.biomes[i] as number));
    });
    assert.equal(strays.length, 0, `${strays.length} marks stand on ground not their own`);
  }
});
