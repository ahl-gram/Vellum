import { test } from "node:test";
import assert from "node:assert/strict";
import { createField } from "../../src/core/grid.ts";
import { partitionRealms } from "../../src/society/realms.ts";
import type { Settlement } from "../../src/society/sites.ts";

// #140: a major river passed as opts.barrier is a HARD frontier -- the realm flood
// may claim a barrier cell but never propagate across it, so where two realms grow
// toward each other across the river they meet ON it. These drive the opt-in barrier
// path with hand-drawn masks (no River/flow construction), mirroring border-snap's
// synthetic-grid style. Seats must sit > MIN_SEAT_SPACING (24) apart to be picked.

const SEA = 0.5;
const allLand = (w: number, h: number) => createField(w, h, () => 1);
const settle = (x: number, y: number, kind: Settlement["kind"], score = 1): Settlement => ({
  x, y, kind, harbor: false, onRiver: false, score,
});
const noRivers = (w: number, h: number) => new Uint8Array(w * h);
function vBarrier(w: number, h: number, col: number, y0 = 0, y1 = h - 1): Uint8Array {
  const b = new Uint8Array(w * h);
  for (let y = y0; y <= y1; y++) b[col + y * w] = 1;
  return b;
}
function diagBarrier(w: number, h: number): Uint8Array {
  const b = new Uint8Array(w * h);
  for (let k = 0; k < Math.min(w, h); k++) b[k + k * w] = 1; // the (k,k) staircase
  return b;
}
const at = (labels: Int16Array, x: number, y: number, w: number) => labels[x + y * w] as number;
function counts(labels: Int16Array): Map<number, number> {
  const m = new Map<number, number>();
  for (const v of labels) if ((v as number) >= 0) m.set(v as number, (m.get(v as number) ?? 0) + 1);
  return m;
}

test("#140 a major-river barrier is the frontier: it walls a realm off from land it would otherwise win", () => {
  const W = 60, H = 20, ROW = 10;
  const elev = allLand(W, H);
  const settlements = [settle(8, ROW, "capital"), settle(52, ROW, "town")];
  // barrier well inside realm 0's natural territory (a plain flood's bisector sits ~x=30)
  const realms = partitionRealms(elev, SEA, noRivers(W, H), settlements, { barrier: vBarrier(W, H, 20) });
  assert.equal(realms.seats.length, 2, "two realms");
  const r0 = at(realms.labels, 8, ROW, W);
  const r1 = at(realms.labels, 52, ROW, W);
  assert.notEqual(r0, r1);
  // west of the barrier stays realm 0; the barrier column is realm 0's frontier edge
  assert.equal(at(realms.labels, 19, ROW, W), r0, "x=19 (just west) is realm 0");
  assert.equal(at(realms.labels, 20, ROW, W), r0, "the barrier column is realm 0's frontier");
  // east of the barrier flips to realm 1 -- realm 0 is walled off from land a plain flood gives it
  assert.equal(at(realms.labels, 21, ROW, W), r1, "x=21 (just east of the river) flipped to realm 1");
  assert.equal(at(realms.labels, 29, ROW, W), r1, "x=29 flipped to realm 1");
});

test("#140 control: without the barrier that same land is realm 0 (the flip is caused by the barrier)", () => {
  const W = 60, H = 20, ROW = 10;
  const elev = allLand(W, H);
  const settlements = [settle(8, ROW, "capital"), settle(52, ROW, "town")];
  const realms = partitionRealms(elev, SEA, noRivers(W, H), settlements); // no barrier
  const r0 = at(realms.labels, 8, ROW, W);
  assert.equal(at(realms.labels, 21, ROW, W), r0, "x=21 is realm 0 under a plain flood");
  assert.equal(at(realms.labels, 29, ROW, W), r0, "x=29 is realm 0 under a plain flood");
});

test("#140 no land is stranded: a barrier that seals off a seatless region is still fully assigned", () => {
  const W = 60, H = 20;
  const elev = allLand(W, H);
  // both seats LEFT of a full-height barrier -> the right region has no seat and is walled off
  const settlements = [settle(8, 10, "capital"), settle(38, 10, "town")];
  const realms = partitionRealms(elev, SEA, noRivers(W, H), settlements, { barrier: vBarrier(W, H, 48) });
  for (let i = 0; i < W * H; i++) {
    assert.ok((realms.labels[i] as number) >= 0, `land cell (${i % W},${(i / W) | 0}) left unassigned`);
  }
});

test("#140 a seat sitting on a barrier cell still governs a full realm (seat exemption)", () => {
  const W = 60, H = 20;
  const elev = allLand(W, H);
  const settlements = [settle(8, 10, "capital"), settle(38, 10, "town")];
  // the barrier runs straight through the town seat's cell
  const realms = partitionRealms(elev, SEA, noRivers(W, H), settlements, { barrier: vBarrier(W, H, 38) });
  const townRealm = at(realms.labels, 38, 10, W);
  const capitalRealm = at(realms.labels, 8, 10, W);
  assert.ok(townRealm >= 0, "the seat cell is labeled");
  assert.notEqual(townRealm, capitalRealm);
  // (30,10) sits west of the barrier but east of the plain bisector (x=23): only the
  // town seat's own propagation wins it. Drop the exemption and the walled seat cannot
  // reach here -- the cell flips to the capital (or is merely backfilled) -- so this,
  // not count>1, is what actually guards the exemption.
  assert.equal(at(realms.labels, 30, 10, W), townRealm, "the seat's propagation wins land past the bisector");
});

test("#140 the diagonal-slip guard stops a flood leaking across a diagonal river", () => {
  const W = 30, H = 30;
  const elev = allLand(W, H);
  // Asymmetric seats so the cost bisector does NOT coincide with the diagonal: (14,0)
  // lies in the town's upper-right triangle yet is Euclidean-nearer the capital, so
  // only the diagonal barrier + its slip-guard keep it the town's. (hypot 24.7 > 24.)
  const settlements = [settle(1, 4, "capital"), settle(25, 10, "town")];
  const withBarrier = partitionRealms(elev, SEA, noRivers(W, H), settlements, { barrier: diagBarrier(W, H) });
  const townRealm = at(withBarrier.labels, 25, 10, W);
  const capitalRealm = at(withBarrier.labels, 1, 4, W);
  assert.notEqual(townRealm, capitalRealm);
  assert.equal(at(withBarrier.labels, 14, 0, W), townRealm,
    "the slip-guard walls the capital's flood out of the town's triangle");
  // control: with no barrier the capital is the natural (nearer) owner of (14,0), so the
  // assertion above is caused by the guard, not by geometry.
  const bare = partitionRealms(elev, SEA, noRivers(W, H), settlements);
  assert.equal(at(bare.labels, 14, 0, W), at(bare.labels, 1, 4, W),
    "without the barrier the capital wins (14,0)");
});

test("#140 the fill backfills only stranded (-1) land, never a cell the barrier already placed", () => {
  const W = 64, H = 20, ROW = 10;
  const elev = allLand(W, H);
  const settlements = [settle(8, ROW, "capital"), settle(40, ROW, "town")];
  // col 20 reshapes the frontier (walls the capital off from land the plain bisector at
  // x=24 gives it); col 50 strands the seatless east, forcing the barrier-free backfill.
  const barrier = vBarrier(W, H, 20);
  const east = vBarrier(W, H, 50);
  for (let i = 0; i < barrier.length; i++) if (east[i]) barrier[i] = 1;
  const realms = partitionRealms(elev, SEA, noRivers(W, H), settlements, { barrier });
  const townRealm = at(realms.labels, 40, ROW, W);
  // (22,10) is a reshaped-frontier cell the barrier handed to the town; a fill that
  // overwrote non-(-1) cells with the plain flood would flip it back to the capital.
  assert.equal(at(realms.labels, 22, ROW, W), townRealm, "the reshaped frontier survives the stranded-land backfill");
  for (let i = 0; i < W * H; i++) assert.ok((realms.labels[i] as number) >= 0, "no land left unassigned");
});

test("#140 the barrier partition is deterministic", () => {
  const W = 60, H = 20;
  const elev = allLand(W, H);
  const settlements = [settle(8, 10, "capital"), settle(52, 10, "town")];
  const a = partitionRealms(elev, SEA, noRivers(W, H), settlements, { barrier: vBarrier(W, H, 20) });
  const b = partitionRealms(elev, SEA, noRivers(W, H), settlements, { barrier: vBarrier(W, H, 20) });
  assert.deepEqual(a.labels, b.labels);
});
