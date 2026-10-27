import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld } from "../../src/world/region.ts";
import type { NamedSettlement, World } from "../../src/world/types.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { nameSetting } from "../../src/render/layers/settlements.ts";
import type { SettlementTier } from "../../src/render/layers/settlement-marks.ts";
import { boxMeetsRiver } from "../../src/render/layers/river-clearance.ts";
import { createProjection, marginFor } from "../../src/render/transform.ts";
import { textNodes } from "../../test-support/label-geometry.ts";

const WIDTH = 1500;

function closeUp(seed: number, window: { u0: number; v0: number; u1: number; v1: number }): World {
  const world = generateWorld(defaultRecipe(seed));
  return generateRegionWorld(world, { window, gridW: 320, gridH: 240, title: "The Environs (band 5)", detail: true });
}

const TZE_B5 = closeUp(23, { u0: 0.546875, v0: 0.671875, u1: 0.578125, v1: 0.703125 });
const MANGKOA_B5 = closeUp(42, { u0: 0.49609375, v0: 0.3828125, u1: 0.52734375, v1: 0.4140625 });

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
): { readonly index: number; readonly wet: boolean; readonly firstWet: boolean; readonly labels: number } {
  const proj = projOf(region);
  const rivers = { cells: region.riverCells, w: region.elev.w, h: region.elev.h };
  const nodes = textNodes(drawn.slice);
  const { tries } = nameSetting(region, proj, s, drawn.tier);
  const node = nodes[0]!;
  const index = tries.findIndex(({ at }) => at.x === node.x && at.y === node.y && at.anchor === node.anchor);
  assert.ok(index >= 0, `${s.name}'s drawn label is one of its candidates`);
  return {
    index,
    wet: boxMeetsRiver(tries[index]!.box, rivers, proj),
    firstWet: boxMeetsRiver(tries[0]!.box, rivers, proj),
    labels: nodes.length,
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
  assert.equal(read.labels, 1, "the mill's name is drawn once");
  assert.equal(textNodes(drawn.slice)[0]!.text, "Mangkoa Mill");
  assert.equal(read.wet, true, "it came through the second pass, on its river");
});
