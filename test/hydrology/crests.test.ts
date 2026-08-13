import { test } from "node:test";
import assert from "node:assert/strict";
import { createField, quantile } from "../../src/core/grid.ts";
import { gateDivideElevation, mountainCrests } from "../../src/hydrology/crests.ts";
import { buildHeightfield } from "../../src/terrain/heightfield.ts";
import { pickSeaLevel } from "../../src/terrain/sealevel.ts";
import { computeFlow } from "../../src/hydrology/flow.ts";
import { computeBasins, watershedDivides } from "../../src/hydrology/basins.ts";

// #141 LOOSE elevation gate: a watershed divide is a hard realm frontier only where it runs through the top half of land elevation (quantile ~0.5); it does NOT try to select "only the biggest ranges", MAJOR_BASIN_FRACTION already does. Driven from a hand-drawn divides mask + elevation.

const SEA = 0.5;
const W = 6, H = 3;

// Land rises with x (0.60..0.85, identical rows, all 18 cells land); sorted, the median (index floor(0.5*17)=8) is 0.70, so the LOOSE gate keeps x >= 2 and drops x=0,1.
const risingLand = () => createField(W, H, (x) => 0.6 + x * 0.05);
function divideAt(cols: ReadonlyArray<number>): Uint8Array {
  const d = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (const c of cols) d[c + y * W] = 1;
  return d;
}
const at = (m: Uint8Array, x: number, y: number) => m[x + y * W] as number;

test("#141 the gate keeps a divide through high terrain and drops one through a plain", () => {
  // x=1 (0.65) is the plain crossing, x=4 (0.80) the crest; x=2 sits EXACTLY on the 0.70 median and must be kept: the gate is inclusive, so this bites a >= to > off-by-one.
  const gated = gateDivideElevation(divideAt([1, 2, 4]), risingLand(), SEA, 0.5);
  for (let y = 0; y < H; y++) {
    assert.equal(at(gated, 4, y), 1, `high divide at (4,${y}) is kept`);
    assert.equal(at(gated, 2, y), 1, `divide exactly at the median threshold (2,${y}) is kept`);
    assert.equal(at(gated, 1, y), 0, `low divide at (1,${y}) is dropped`);
  }
});

test("#141 the gate only ever keeps divide cells, never bare high ground", () => {
  // x=5 is the highest land but carries no divide, so it must stay 0.
  const gated = gateDivideElevation(divideAt([4]), risingLand(), SEA, 0.5);
  for (let y = 0; y < H; y++) assert.equal(at(gated, 5, y), 0, `bare high ground (5,${y}) is not a crest`);
});

test("#141 the gate is deterministic", () => {
  const a = gateDivideElevation(divideAt([1, 4]), risingLand(), SEA, 0.5);
  const b = gateDivideElevation(divideAt([1, 4]), risingLand(), SEA, 0.5);
  assert.deepEqual(a, b);
});

test("#141 with no land the gate keeps nothing (no threshold to clear)", () => {
  const allOcean = createField(W, H, () => 0.2); // every cell <= SEA
  const gated = gateDivideElevation(divideAt([1, 2, 3, 4]), allOcean, SEA, 0.5);
  assert.ok(gated.every((v) => v === 0), "a landless field yields an empty crest mask");
});

test("#141 mountainCrests on a real island: the gate drops below-median divides, keeps the crest", () => {
  // Seed 16: 213 major divides, 38 below the land median, so crest < divides bites the wiring (a gate-disconnected mutation makes crest == divides). Seed 7, the obvious pick, has EVERY divide above median, so the gate is a no-op there and that mutation slips the whole suite (per the #141 review).
  const gw = 120, gh = 90;
  const f = buildHeightfield({ seed: 16, gridW: gw, gridH: gh, mapType: "island" });
  const sea = pickSeaLevel(f, 0.35);
  const flow = computeFlow(f, sea);
  const crest = mountainCrests(f, flow, sea);
  const divides = watershedDivides(computeBasins(f, flow, sea), gw, gh, 0.03);

  const land = [...f.data].filter((v) => (v as number) > sea);
  const median = quantile(land, 0.5);
  let crestCount = 0, divideCount = 0;
  for (let i = 0; i < f.data.length; i++) {
    if (divides[i]) divideCount++;
    if (crest[i]) {
      crestCount++;
      assert.equal(divides[i], 1, `crest cell ${i} is a divide`);
      assert.ok((f.data[i] as number) >= median, `crest cell ${i} is on high ground`);
    }
  }
  assert.ok(crestCount > 0, "a mountainous island keeps crests");
  assert.ok(
    crestCount < divideCount,
    `the gate drops the below-median divides (crests ${crestCount} < divides ${divideCount})`,
  );
});
