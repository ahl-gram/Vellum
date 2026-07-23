import { test } from "node:test";
import assert from "node:assert/strict";
import { zoomTransformToCss, constrainZoom, nextGlideTarget } from "../../src/site/shared/zoom-controller.ts";

// Sub 3 of the Surveyor's Glass epic (#164): the glass itself. The controller
// leans on d3-zoom for the gesture handling (wheel/drag/pinch/double-click), but
// two pieces are ours and load-bearing, so they are unit-tested here in isolation.
// Per the project testing rules, these validate the NEW behavior of a DOM/gesture
// feature (there is no prior bug to reproduce); the live gestures, the clamp in a
// real browser, and getState round-tripping are proven by e2e suite-zoom (Z1-Z4).
// The translate clamp deliberately mirrors d3-zoom's defaultConstrain (the sheet is
// the viewport, so the world extent IS the viewport extent), recomputed against a
// scale that has itself been clamped to the extent.

test("zoomTransformToCss emits a px-suffixed, browser-valid transform (#164)", () => {
  // d3's ZoomTransform.toString() emits `translate(x,y)` with NO unit, which the CSS
  // `transform` property silently rejects, so a live gesture would set an ignored
  // value and nothing would move. The controller's own builder must add px.
  assert.equal(zoomTransformToCss({ x: 3, y: 4, k: 2 }), "translate(3px, 4px) scale(2)");
  assert.equal(zoomTransformToCss({ x: -12.5, y: 0, k: 1 }), "translate(-12.5px, 0px) scale(1)");
});

// A 100x100 viewport; the sheet fills it exactly at k=1, so the world extent used by
// the clamp IS the viewport extent.
const EXTENT = [[0, 0], [100, 100]];
const SCALE = [1, 8];

test("constrainZoom clamps the scale to the extent [1,8] (#164)", () => {
  assert.equal(constrainZoom({ x: 0, y: 0, k: 20 }, EXTENT, SCALE).k, 8);
  assert.equal(constrainZoom({ x: 0, y: 0, k: 0.2 }, EXTENT, SCALE).k, 1);
  assert.equal(constrainZoom({ x: 0, y: 0, k: 4 }, EXTENT, SCALE).k, 4);
});

test("constrainZoom pins the sheet home at k=1: no pan when not zoomed (#164)", () => {
  // At k=1 the sheet exactly fills the viewport, so any offset is pulled back to 0 0.
  const c = constrainZoom({ x: 50, y: -30, k: 1 }, EXTENT, SCALE);
  assert.deepEqual({ x: c.x, y: c.y, k: c.k }, { x: 0, y: 0, k: 1 });
});

test("constrainZoom keeps the zoomed sheet covering the viewport at every edge (#164)", () => {
  // k=2 over a 100px viewport: the world is 200px wide, so x is valid only in [-100, 0].
  // Panning past the left edge (x>0) clamps to 0; past the right edge clamps to -100.
  assert.equal(constrainZoom({ x: 100, y: 0, k: 2 }, EXTENT, SCALE).x, 0);
  assert.equal(constrainZoom({ x: -300, y: 0, k: 2 }, EXTENT, SCALE).x, -100);
  assert.equal(constrainZoom({ x: 0, y: 400, k: 2 }, EXTENT, SCALE).y, 0);
  assert.equal(constrainZoom({ x: 0, y: -260, k: 2 }, EXTENT, SCALE).y, -100);
});

// Sub 9 (#170): the voiced glide's target arithmetic. The glide flies to an ABSOLUTE k
// (d3 scaleTo) computed here, compounding against the pending target when presses stack,
// so the DOM path stays a thin d3-transition wrapper around this pure decision.

test("nextGlideTarget compounds a step from the base k (#170)", () => {
  assert.ok(Math.abs(nextGlideTarget(1, 1.4, SCALE) - 1.4) < 1e-9);
  // A second press mid-flight compounds against the pending TARGET (1.4), not the
  // mid-flight k, so two rapid presses land 1.96 exactly like two settled ones.
  assert.ok(Math.abs(nextGlideTarget(1.4, 1.4, SCALE) - 1.96) < 1e-9);
  assert.ok(Math.abs(nextGlideTarget(1.96, 1 / 1.4, SCALE) - 1.4) < 1e-9);
});

test("nextGlideTarget clamps at both ends of the scaleExtent (#170)", () => {
  assert.equal(nextGlideTarget(7, 1.4, SCALE), 8);
  assert.equal(nextGlideTarget(8, 1.4, SCALE), 8);
  assert.equal(nextGlideTarget(1.2, 1 / 1.4, SCALE), 1);
  assert.equal(nextGlideTarget(1, 1 / 1.4, SCALE), 1);
});
