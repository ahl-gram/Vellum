import { test } from "node:test";
import assert from "node:assert/strict";
import type { Pt } from "../../src/core/rdp.ts";
import {
  buildLegGeometry,
  pointAtDistance,
  headingAt,
  tiltFor,
  resolveFacing,
  netFacing,
  MAX_TILT,
  LOOKAHEAD,
  FACING_DEADBAND,
  type Facing,
} from "../../src/render/voyage-geometry.ts";

const p = (x: number, y: number): Pt => ({ x, y });
const near = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} !== ${b}`);

// --- arc length -------------------------------------------------------------

test("cumulative arc length runs 0 to total along the polyline", () => {
  const g = buildLegGeometry([p(0, 0), p(3, 4), p(3, 14)]); // 5 then 10
  assert.deepEqual(Array.from(g.cum), [0, 5, 15]);
  assert.equal(g.total, 15);
});

test("pointAtDistance hits the endpoints exactly", () => {
  const g = buildLegGeometry([p(0, 0), p(10, 0), p(10, 10)]);
  assert.deepEqual(pointAtDistance(g, 0), p(0, 0));
  assert.deepEqual(pointAtDistance(g, g.total), p(10, 10));
});

test("progress is by DISTANCE, not vertex index (the whole point of arc length)", () => {
  // One long segment then one short. Halfway by distance lands inside the long one,
  // which a vertex-index walk would wrongly place at the joint.
  const g = buildLegGeometry([p(0, 0), p(90, 0), p(100, 0)]);
  assert.equal(g.total, 100);
  assert.deepEqual(pointAtDistance(g, 50), p(50, 0));
  assert.deepEqual(pointAtDistance(g, 95), p(95, 0));
});

test("equal distance steps advance equal distance across a joint", () => {
  const g = buildLegGeometry([p(0, 0), p(10, 0), p(10, 10)]);
  const a = pointAtDistance(g, 8);
  const b = pointAtDistance(g, 12);
  near(Math.hypot(a.x - 8, a.y - 0), 0);
  near(Math.hypot(b.x - 10, b.y - 2), 0);
});

test("pointAtDistance clamps outside [0, total]", () => {
  const g = buildLegGeometry([p(0, 0), p(10, 0)]);
  assert.deepEqual(pointAtDistance(g, -5), p(0, 0));
  assert.deepEqual(pointAtDistance(g, 999), p(10, 0));
});

test("a degenerate leg (one vertex, zero length) does not divide by zero", () => {
  const g = buildLegGeometry([p(7, 7)]);
  assert.equal(g.total, 0);
  assert.deepEqual(pointAtDistance(g, 0), p(7, 7));
  assert.deepEqual(pointAtDistance(g, 5), p(7, 7));
});

test("repeated vertices (a zero-length segment) do not break the lookup", () => {
  const g = buildLegGeometry([p(0, 0), p(0, 0), p(10, 0)]);
  assert.equal(g.total, 10);
  assert.deepEqual(pointAtDistance(g, 5), p(5, 0));
});

// --- tilt -------------------------------------------------------------------
// SVG y grows DOWNWARD. Bow-up on a northbound leg means a NEGATIVE rotate, which
// is counter-clockwise on screen.

test("due east and due west are level", () => {
  near(tiltFor(1, 0), 0);
  near(tiltFor(-1, 0), 0);
});

test("due north tilts the bow up by the full MAX_TILT", () => {
  near(tiltFor(0, -1), -MAX_TILT);
});

test("due south tilts the bow down by the full MAX_TILT", () => {
  near(tiltFor(0, 1), MAX_TILT);
});

test("north-east and north-west both tilt bow-up by the same damped amount", () => {
  // scale(-1,1) mirrors the rotation too, so ONE unsigned tilt serves both facings.
  near(tiltFor(1, -1), tiltFor(-1, -1));
  assert.ok(tiltFor(1, -1) < 0, "bow up");
  near(tiltFor(1, -1), -MAX_TILT * Math.SQRT1_2);
});

test("the tilt never exceeds MAX_TILT on any bearing", () => {
  for (let deg = 0; deg < 360; deg++) {
    const r = (deg * Math.PI) / 180;
    const t = tiltFor(Math.cos(r), Math.sin(r));
    assert.ok(Math.abs(t) <= MAX_TILT + 1e-9, `bearing ${deg} tilted ${t}`);
  }
});

test("the tilt is monotonic in climb, never the literal bearing (gotcha 1)", () => {
  // A literal rotate(angleDeg) would return -90 here; the damped tilt returns -24.
  near(tiltFor(0, -1), -MAX_TILT);
  const shallow = tiltFor(10, -1);
  const steep = tiltFor(1, -1);
  assert.ok(Math.abs(shallow) < Math.abs(steep), "a shallower climb tilts less");
});

test("a zero-length heading is level, not NaN", () => {
  near(tiltFor(0, 0), 0);
});

// --- facing -----------------------------------------------------------------

test("a decisive east heading faces east, a decisive west heading faces west", () => {
  assert.equal(resolveFacing(10, 10, -1), 1);
  assert.equal(resolveFacing(-10, 10, 1), -1);
});

test("inside the deadband the facing HOLDS (this is the hysteresis)", () => {
  const len = 10;
  const dx = FACING_DEADBAND * len * 0.5; // clearly inside the band
  assert.equal(resolveFacing(dx, len, -1), -1, "held west");
  assert.equal(resolveFacing(dx, len, 1), 1, "held east");
});

test("a perfectly vertical heading has no east-ness, so the previous facing carries (gotcha 3)", () => {
  assert.equal(resolveFacing(0, 10, -1), -1);
  assert.equal(resolveFacing(0, 10, 1), 1);
});

test("a degenerate zero-length heading carries the previous facing", () => {
  assert.equal(resolveFacing(0, 0, -1), -1);
  assert.equal(resolveFacing(0, 0, 1), 1);
});

test("netFacing reads a leg's overall east/west sense, defaulting east", () => {
  assert.equal(netFacing([p(0, 0), p(10, 5)]), 1);
  assert.equal(netFacing([p(10, 0), p(0, 5)]), -1);
  assert.equal(netFacing([p(0, 0), p(0, 5)]), 1, "a due-north leg defaults to bow east");
  assert.equal(netFacing([]), 1);
});

// --- heading smoothing + the anti-flicker property --------------------------

test("headingAt averages over a forward window, not the current segment", () => {
  const g = buildLegGeometry([p(0, 0), p(10, 0), p(20, 0)]);
  const hd = headingAt(g, 0, 10);
  near(hd.x, 10);
  near(hd.y, 0);
});

test("headingAt near the leg's end looks BACKWARD, keeping a full-length window", () => {
  const g = buildLegGeometry([p(0, 0), p(100, 0)]);
  const hd = headingAt(g, 100, 20);
  near(hd.x, 20, 1e-6);
  assert.ok(hd.x > 0, "still pointing the way the leg ran");
});

test("headingAt on a shorter-than-window leg spans the whole leg", () => {
  const g = buildLegGeometry([p(0, 0), p(5, 0)]);
  const hd = headingAt(g, 0, 100);
  near(hd.x, 5);
});

/** Walk a leg at a fixed step, applying the real rule, and count facing changes. */
function facingChanges(points: Pt[], startFacing: Facing = netFacing(points)): number {
  const g = buildLegGeometry(points);
  let facing = startFacing;
  let changes = 0;
  for (let s = 0; s <= g.total; s += 2) {
    const hd = headingAt(g, s);
    const next = resolveFacing(hd.x, Math.hypot(hd.x, hd.y), facing);
    if (next !== facing) changes++;
    facing = next;
  }
  return changes;
}

test("a switchbacking road does NOT flip the rider (the bug this sub creates)", () => {
  // Climbs north while x oscillates east/west by 4px every 6px of climb. The RAW
  // per-segment dx flips sign at every vertex; smoothed over LOOKAHEAD it nets ~0,
  // lands inside the deadband, and the facing holds.
  const zig: Pt[] = [];
  for (let i = 0; i <= 20; i++) zig.push(p(i % 2 === 0 ? 0 : 4, -6 * i));
  assert.ok(buildLegGeometry(zig).total > LOOKAHEAD * 2, "the leg is long enough to matter");
  assert.equal(facingChanges(zig), 0, "the rider must not flicker");
});

test("...and the raw per-segment sign WOULD have flipped, proving the test has teeth", () => {
  const zig: Pt[] = [];
  for (let i = 0; i <= 20; i++) zig.push(p(i % 2 === 0 ? 0 : 4, -6 * i));
  let raw = 0;
  let facing: Facing = 1;
  for (let i = 1; i < zig.length; i++) {
    const dx = zig[i]!.x - zig[i - 1]!.x;
    const next: Facing = dx >= 0 ? 1 : -1;
    if (next !== facing) raw++;
    facing = next;
  }
  assert.ok(raw > 5, `expected the naive rule to flicker, it flipped ${raw} times`);
});

test("a genuine reversal (a hairpin) still turns the mark around, exactly once", () => {
  const hairpin = [p(0, 0), p(120, 0), p(120, 10), p(0, 10)];
  assert.equal(facingChanges(hairpin, 1), 1);
});

test("a straight east leg never changes facing", () => {
  assert.equal(facingChanges([p(0, 0), p(200, 0)], 1), 0);
});

test("a due-north leg holds whatever facing it started with", () => {
  assert.equal(facingChanges([p(0, 0), p(0, -200)], -1), 0);
  assert.equal(facingChanges([p(0, 0), p(0, -200)], 1), 0);
});

test("geometry helpers do not mutate their inputs (immutability rule)", () => {
  const pts = [p(0, 0), p(10, 0)];
  const copy = pts.map((q) => ({ ...q }));
  const g = buildLegGeometry(pts);
  pointAtDistance(g, 5);
  headingAt(g, 5);
  assert.deepEqual(pts, copy);
});
