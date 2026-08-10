import { test } from "node:test";
import assert from "node:assert/strict";
import { createField } from "../../src/core/grid.ts";
import {
  sampleBilinear,
  viewDirection,
  viewRight,
  linePoints,
} from "../../src/prospect/transect.ts";

test("bilinear sampling reproduces a planar field exactly", () => {
  const f = createField(8, 6, (x, y) => 2 + 3 * x - 5 * y);
  for (const [x, y] of [
    [0, 0],
    [2.25, 3.5],
    [6.75, 0.25],
    [3.5, 4.999],
  ] as const) {
    const expected = 2 + 3 * x - 5 * y;
    assert.ok(
      Math.abs(sampleBilinear(f, x, y) - expected) < 1e-9,
      `plane at (${x}, ${y})`,
    );
  }
});

test("bilinear sampling clamps outside the grid", () => {
  const f = createField(8, 6, (x, y) => 2 + 3 * x - 5 * y);
  assert.equal(sampleBilinear(f, -3, 2), sampleBilinear(f, 0, 2));
  assert.equal(sampleBilinear(f, 40, 2), sampleBilinear(f, 7, 2));
  assert.equal(sampleBilinear(f, 3, -1), sampleBilinear(f, 3, 0));
  assert.equal(sampleBilinear(f, 3, 99), sampleBilinear(f, 3, 5));
});

test("linePoints spans the half-width symmetrically around the center", () => {
  const pts = linePoints(10, 10, { dx: 1, dy: 0 }, 4, 5);
  assert.deepEqual(
    pts.map((p) => [p.x, p.y]),
    [
      [6, 10],
      [8, 10],
      [10, 10],
      [12, 10],
      [14, 10],
    ],
  );
});

test("viewRight turns a north-facing view to read west-to-east", () => {
  assert.deepEqual(viewRight({ dx: 0, dy: -1 }), { dx: 1, dy: 0 });
});

test("inland sites look uphill", () => {
  const f = createField(40, 40, (x) => x); // rises east
  const v = viewDirection(f, -1, { x: 20, y: 20, harbor: false });
  assert.ok(v.dx > 0.999, `uphill is east, got dx=${v.dx}`);
  assert.ok(Math.abs(v.dy) < 1e-9, `no north-south slope, got dy=${v.dy}`);
  assert.ok(Math.abs(v.dx * v.dx + v.dy * v.dy - 1) < 1e-9, "unit length");
});

test("flat ground falls back to the view from the south", () => {
  const f = createField(40, 40, () => 5);
  assert.deepEqual(viewDirection(f, 0, { x: 20, y: 20, harbor: false }), {
    dx: 0,
    dy: -1,
  });
});

test("harbor sites are viewed from the sea", () => {
  // A single water column two cells west: inside the sea search radius but
  // invisible to the gradient stencil (x +/- 3 lands on land either side),
  // so this fixture discriminates the sea rule from the slope rule. The sea
  // rule gives {dx: 1}; deleting it gives the {dx: 0, dy: -1} fallback; an
  // un-negated sea direction gives {dx: -1}. A half-water world cannot tell
  // those apart because uphill points away from the sea there anyway.
  const f = createField(40, 40, (x) => (x === 18 ? 0 : 1));
  const v = viewDirection(f, 0.5, { x: 20, y: 20, harbor: true });
  assert.ok(v.dx > 0.9, `viewer at sea looks east, got dx=${v.dx}`);
  assert.ok(Math.abs(v.dy) < 1e-9, `sea is due west, got dy=${v.dy}`);
});

test("a harbor with no water nearby falls back to the slope rule", () => {
  const f = createField(40, 40, (x) => x + 100); // all land, rises east
  const v = viewDirection(f, 0, { x: 20, y: 20, harbor: true });
  assert.ok(v.dx > 0.999, `slope rule applies, got dx=${v.dx}`);
});
