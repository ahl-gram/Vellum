import { test } from "node:test";
import assert from "node:assert/strict";
import { snapBordersToFeatures } from "../../src/society/border-snap.ts";

// One all-land landmass, two realms split down the vertical midline (0 = left,
// 1 = right; the boundary sits between x=9 and x=10). A feature (river or divide)
// runs as a vertical line at some column. Snapping should pull the realm boundary
// onto the feature where it runs alongside the border, and leave it alone where
// no feature is near.
const W = 20;
const H = 9;
const ROW = 4; // an interior row, away from top/bottom edges

function midlineWorld(): { labels: Int16Array; lm: Int32Array } {
  const labels = new Int16Array(W * H);
  for (let i = 0; i < W * H; i++) labels[i] = i % W < 10 ? 0 : 1;
  const lm = new Int32Array(W * H); // single landmass, id 0, all land
  return { labels, lm };
}
function verticalFeature(col: number): Uint8Array {
  const f = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) f[col + y * W] = 1;
  return f;
}
const at = (labels: Int16Array, x: number, y = ROW) => labels[x + y * W] as number;

test("a river offset from the midline pulls the border onto it", () => {
  const { labels, lm } = midlineWorld();
  const river = verticalFeature(13); // 3 cells right of the x=9|10 boundary
  snapBordersToFeatures(labels, W, H, lm, river, 4, []);

  // the border has moved onto the river: realm 0 now reaches x=12 (was realm 1),
  // and the river column x=13 is the frontier owned by the right realm.
  assert.equal(at(labels, 11), 0, "x=11 flipped from realm 1 to realm 0");
  assert.equal(at(labels, 12), 0, "x=12 (just left of the river) is realm 0");
  assert.equal(at(labels, 13), 1, "the river column is the frontier (right realm)");
  // untouched deep interiors
  assert.equal(at(labels, 2), 0, "deep left unchanged");
  assert.equal(at(labels, 18), 1, "deep right unchanged");
});

test("no feature means no movement (straight fallback preserved)", () => {
  const { labels, lm } = midlineWorld();
  const before = Int16Array.from(labels);
  snapBordersToFeatures(labels, W, H, lm, new Uint8Array(W * H), 4, []);
  assert.deepEqual(labels, before, "an empty feature mask is a no-op");
});

test("a feature farther than the corridor does not move the border", () => {
  const { labels, lm } = midlineWorld();
  const before = Int16Array.from(labels);
  const farRiver = verticalFeature(17); // Chebyshev 7 from the x=10 border, beyond D=4
  snapBordersToFeatures(labels, W, H, lm, farRiver, 4, []);
  assert.deepEqual(labels, before, "a distant feature is not walled, so no wiggle is invented");
});

test("snapping is deterministic", () => {
  const a = midlineWorld();
  const b = midlineWorld();
  snapBordersToFeatures(a.labels, W, H, a.lm, verticalFeature(12), 4, []);
  snapBordersToFeatures(b.labels, W, H, b.lm, verticalFeature(12), 4, []);
  assert.deepEqual(a.labels, b.labels);
});

test("snapping never leaves a labelled cell unassigned", () => {
  const { labels, lm } = midlineWorld();
  snapBordersToFeatures(labels, W, H, lm, verticalFeature(13), 4, []);
  for (let i = 0; i < W * H; i++) assert.ok((labels[i] as number) >= 0, `cell ${i} still assigned`);
});

test("a seat inside the corridor is never relabeled (frozen anchor)", () => {
  // realm 0's seat sits at x=8, inside the D=3 corridor of the x=9|10 border. A wall
  // at x=7 cuts the seat off from realm 0's body, so a naive re-flood lets realm 1
  // reach the seat from the right and steal it. Freezing the seat keeps realm 0 --
  // and prevents a realm from being hollowed out or eliminated.
  const { labels, lm } = midlineWorld();
  const seatCell = 8 + ROW * W;
  assert.equal(labels[seatCell], 0, "seat starts in realm 0");
  snapBordersToFeatures(labels, W, H, lm, verticalFeature(7), 3, [seatCell]);
  assert.equal(labels[seatCell], 0, "the seat cell keeps its own realm");
});

test("the re-flood does not leak diagonally across a feature", () => {
  // A single all-land landmass, realm 0 (left) / realm 1 (right) split at x=9|10, with
  // a diagonal river descending through the corridor. Without a corner-cut, the
  // 8-connected re-flood slips between two diagonally-adjacent river cells and the
  // border fails to trace the diagonal. Every land cell strictly on realm 0's side of
  // the diagonal (upper-left of it) must stay realm 0 -- no realm-1 island behind the river.
  const labels = new Int16Array(W * H);
  for (let i = 0; i < W * H; i++) labels[i] = i % W < 10 ? 0 : 1;
  const lm = new Int32Array(W * H);
  // diagonal river through the corridor: (12,0),(11,1),(10,2),(9,3),(8,4),(7,5),(6,6)
  const river = new Uint8Array(W * H);
  const diag: Array<[number, number]> = [];
  for (let k = 0; k < 7; k++) diag.push([12 - k, k]);
  for (const [x, y] of diag) river[x + y * W] = 1;
  snapBordersToFeatures(labels, W, H, lm, river, 4, []);
  // Cells well upper-left of the diagonal (realm 0 territory) must not have flipped to 1.
  for (const [x, y] of diag) {
    for (let dx = -2; dx <= -1; dx++) {
      const cx = x + dx;
      if (cx < 0) continue;
      assert.equal(labels[cx + y * W], 0, `no realm-1 leak behind the river at (${cx},${y})`);
    }
  }
});
