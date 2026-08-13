import { test } from "node:test";
import assert from "node:assert/strict";
import { reachPlacements, straightestReach } from "../../src/render/layers/river-label-placement.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { renderMap } from "../../src/render/map-renderer.ts";

// River labels used to follow the winding course via <textPath>, smearing glyphs at bends; they now sit as straight, gently-rotated text along the straightest reach long enough to hold the name.

test("a straight horizontal reach yields ~0 degrees near the middle", () => {
  const pts = Array.from({ length: 11 }, (_, i) => [i * 10, 100] as const);
  const p = straightestReach(pts, 40);
  assert.ok(p, "expected a placement");
  assert.ok(Math.abs(p!.angleDeg) < 1, `expected ~0 deg, got ${p!.angleDeg}`);
  assert.ok(p!.x > 20 && p!.x < 80, `mid x in range, got ${p!.x}`);
  assert.equal(p!.y, 100);
});

test("an L-shaped river labels along the straight arm, not the corner", () => {
  const horiz = Array.from({ length: 11 }, (_, i) => [i * 10, 0] as const);
  const vert = Array.from({ length: 10 }, (_, i) => [100, (i + 1) * 10] as const);
  const p = straightestReach([...horiz, ...vert], 40);
  assert.ok(p, "expected a placement");
  assert.ok(Math.abs(p!.angleDeg) < 5, `expected the flat arm, got ${p!.angleDeg}`);
  assert.ok(Math.abs(p!.y) < 15, `expected placement on the horizontal arm, got y=${p!.y}`);
});

test("rotation is clamped to a readable range on steep reaches", () => {
  const pts = Array.from({ length: 11 }, (_, i) => [i * 2, i * 20] as const);
  const p = straightestReach(pts, 40);
  assert.ok(p, "expected a placement");
  assert.ok(Math.abs(p!.angleDeg) <= 50, `angle should be clamped, got ${p!.angleDeg}`);
});

test("the reach reads left to right (placement never inverts)", () => {
  // points run right-to-left; placement should still yield a readable angle
  const pts = Array.from({ length: 11 }, (_, i) => [100 - i * 10, 50] as const);
  const p = straightestReach(pts, 40);
  assert.ok(p, "expected a placement");
  assert.ok(Math.abs(p!.angleDeg) < 1, `expected ~0 deg (not flipped), got ${p!.angleDeg}`);
});

test("returns null for a degenerate single-point river", () => {
  assert.equal(straightestReach([[5, 5]], 40), null);
});

// A named river used to get exactly ONE shot (its straightest reach); reachPlacements offers spread alternatives so a collided label falls back to a free stretch, with straightestReach as element 0 (already-placed labels never move).

test("reachPlacements offers several spread candidates along a long river", () => {
  const pts = Array.from({ length: 31 }, (_, i) => [i * 10, 100] as const); // x 0..300
  const places = reachPlacements(pts, 40);
  assert.ok(places.length >= 2, `expected multiple candidates, got ${places.length}`);
  assert.deepEqual(places[0], straightestReach(pts, 40));
  const xs = places.map((p) => p.x);
  assert.ok(Math.max(...xs) - Math.min(...xs) >= 40, `candidates should spread, got ${xs}`);
});

test("reachPlacements returns [] for a degenerate river and one reach for a short one", () => {
  assert.deepEqual(reachPlacements([[5, 5]], 40), []);
  const shortRiver = reachPlacements([[0, 0], [10, 0], [20, 0]], 40); // total 20 < 40
  assert.equal(shortRiver.length, 1, "a course shorter than the label gets one whole-reach candidate");
});

// #95 follow-up: crowded seed 20260701 once cited a river name printed nowhere. The recovery MECHANISM is unit-tested via reachPlacements above; this integration pin only asserts the crowded seed keeps a visible river label (#235 re-pinned it to "The Silver Lathfi").
test("a crowded named river recovers a label via an alternative reach", () => {
  const world = generateWorld(defaultRecipe(20260701, {}));
  assert.ok(world.names.rivers.size > 0, "fixture names rivers");
  assert.ok(
    [...world.names.rivers.values()].includes("The Silver Lathfi"),
    "fixture still names The Silver Lathfi",
  );
  const svg = renderMap(world, { style: "antique", legend: true });
  assert.ok(
    svg.includes(">The Silver Lathfi<"),
    "the crowded river now carries a visible label",
  );
});

// #23: the hard cap of 3 labeled rivers is gone (labels stay collision-limited, so the count is size-adaptive); river labels are the only chart element that emits <tspan dy=...>.
test("more than three named rivers are labeled when they fit", () => {
  const world = generateWorld(defaultRecipe(42, {}));
  assert.ok(world.names.rivers.size > 3, "fixture should name more than three rivers");
  const svg = renderMap(world, { style: "antique" });
  const labels = (svg.match(/<tspan dy=/g) ?? []).length;
  assert.ok(labels > 3, `expected more than 3 river labels, got ${labels}`);
});
