import { test } from "node:test";
import assert from "node:assert/strict";
import { outlineSegments, signedDistance } from "../../src/terrain/outline-distance.ts";

const ASPECT = 319 / 239;

test("the distance to an outline is in sheet heights both ways (Issue #851)", () => {
  const segs = outlineSegments("round", ASPECT);
  const near = (actual: number, expected: number, what: string): void =>
    assert.ok(Math.abs(actual - expected) < 0.002, `${what}: read ${actual}, expected ${expected}`);
  near(signedDistance(segs, 0.5, 0.5), -0.44, "the centre of the round form");
  near(signedDistance(segs, 0.83 + 0.05 / ASPECT, 0.5), 0.05, "0.05 sheet heights right of the rightmost vertex");
  near(signedDistance(segs, 0.5, 0.99), 0.05, "0.05 sheet heights below the lowest vertex");
});

test("a point in the ring's hole is sea, and a point in its band is land (Issue #851)", () => {
  const segs = outlineSegments("ring", ASPECT);
  assert.ok(signedDistance(segs, 0.5, 0.5) > 0, "the ring's centre is its hole");
  assert.ok(signedDistance(segs, 0.5 + 0.34 / ASPECT, 0.5) < 0, "0.34 sheet heights right of the centre is its band");
});
