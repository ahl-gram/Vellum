import { test } from "node:test";
import assert from "node:assert/strict";
import { straightestReach } from "../../src/render/layers/feature-labels.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { renderMap } from "../../src/render/map-renderer.ts";

// River labels used to follow the whole winding course via <textPath>, which
// smeared the glyphs at bends. They now sit as straight, gently-rotated text
// along the straightest reach long enough to hold the name. These pin that.

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

// #23: a chart named ~9 rivers but drew only the longest three, leaving
// prominent rivers blank. Labels are still collision-limited (tryClaim), so
// the count is size-adaptive; this only pins that the hard cap of 3 is gone.
// River labels are the only thing in the chart that emits <tspan dy=...>.
test("more than three named rivers are labeled when they fit", () => {
  const world = generateWorld(defaultRecipe(42, {}));
  assert.ok(world.names.rivers.size > 3, "fixture should name more than three rivers");
  const svg = renderMap(world, { style: "antique" });
  const labels = (svg.match(/<tspan dy=/g) ?? []).length;
  assert.ok(labels > 3, `expected more than 3 river labels, got ${labels}`);
});
