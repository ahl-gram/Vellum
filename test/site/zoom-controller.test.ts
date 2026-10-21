import { test } from "node:test";
import assert from "node:assert/strict";
import {
  zoomTransformToCss,
  constrainZoom,
  nextGlideTarget,
  gestureAllowed,
  createZoomController,
} from "../../src/site/shared/zoom-controller.ts";
import { El } from "../../test-support/element-shim.ts";

const el = () => Object.assign(new El("div"), { clientWidth: 1000, clientHeight: 800 }) as unknown as HTMLElement;

// The Glass (Issue #164): d3-zoom handles the gestures; the translate clamp mirrors d3-zoom's defaultConstrain (the sheet is the viewport, so the world extent IS the viewport extent), recomputed against a scale itself clamped to the extent. Live gestures are proven by e2e suite-zoom Z1-Z4.

test("zoomTransformToCss emits a px-suffixed, browser-valid transform (#164)", () => {
  // d3's ZoomTransform.toString() emits translate(x,y) with NO unit, which the CSS transform property silently rejects: a live gesture would set an ignored value and nothing would move.
  assert.equal(zoomTransformToCss({ x: 3, y: 4, k: 2 }), "translate(3px, 4px) scale(2)");
  assert.equal(zoomTransformToCss({ x: -12.5, y: 0, k: 1 }), "translate(-12.5px, 0px) scale(1)");
});

// A 100x100 viewport; the sheet fills it exactly at k=1, so the world extent IS the viewport extent.
const EXTENT = [
  [0, 0],
  [100, 100],
] as const;
const SCALE = [1, 8] as const;

test("constrainZoom clamps the scale to the extent [1,8] (#164)", () => {
  assert.equal(constrainZoom({ x: 0, y: 0, k: 20 }, EXTENT, SCALE).k, 8);
  assert.equal(constrainZoom({ x: 0, y: 0, k: 0.2 }, EXTENT, SCALE).k, 1);
  assert.equal(constrainZoom({ x: 0, y: 0, k: 4 }, EXTENT, SCALE).k, 4);
});

test("constrainZoom pins the sheet home at k=1: no pan when not zoomed (#164)", () => {
  const c = constrainZoom({ x: 50, y: -30, k: 1 }, EXTENT, SCALE);
  assert.deepEqual({ x: c.x, y: c.y, k: c.k }, { x: 0, y: 0, k: 1 });
});

test("constrainZoom keeps the zoomed sheet covering the viewport at every edge (#164)", () => {
  // k=2 over a 100px viewport: the world is 200px wide, so x is valid only in [-100, 0].
  assert.equal(constrainZoom({ x: 100, y: 0, k: 2 }, EXTENT, SCALE).x, 0);
  assert.equal(constrainZoom({ x: -300, y: 0, k: 2 }, EXTENT, SCALE).x, -100);
  assert.equal(constrainZoom({ x: 0, y: 400, k: 2 }, EXTENT, SCALE).y, 0);
  assert.equal(constrainZoom({ x: 0, y: -260, k: 2 }, EXTENT, SCALE).y, -100);
});

// Sub 9 (Issue #170): the glide flies to an ABSOLUTE k computed here, compounding against the pending target when presses stack, so the DOM path stays a thin d3-transition wrapper around this pure decision.

test("nextGlideTarget compounds a step from the base k (#170)", () => {
  assert.ok(Math.abs(nextGlideTarget(1, 1.4, SCALE) - 1.4) < 1e-9);
  // A second press mid-flight compounds against the pending TARGET (1.4), not the mid-flight k: two rapid presses land 1.96 exactly like two settled ones.
  assert.ok(Math.abs(nextGlideTarget(1.4, 1.4, SCALE) - 1.96) < 1e-9);
  assert.ok(Math.abs(nextGlideTarget(1.96, 1 / 1.4, SCALE) - 1.4) < 1e-9);
});

test("nextGlideTarget clamps at both ends of the scaleExtent (#170)", () => {
  assert.equal(nextGlideTarget(7, 1.4, SCALE), 8);
  assert.equal(nextGlideTarget(8, 1.4, SCALE), 8);
  assert.equal(nextGlideTarget(1.2, 1 / 1.4, SCALE), 1);
  assert.equal(nextGlideTarget(1, 1 / 1.4, SCALE), 1);
});

test("with the chart not taking touch, a finger never starts a camera gesture, and neither does the mouse event a tap fires (Issue #778)", () => {
  for (const type of ["touchstart", "touchmove", "touchend", "touchcancel", "mousedown", "dblclick"]) {
    assert.equal(gestureAllowed({ type }, "touch", false), false, `${type} after a touch, press off`);
    assert.equal(gestureAllowed({ type }, "touch", true), true, `${type} after a touch, press on`);
  }
  assert.equal(gestureAllowed({ type: "mousedown", button: 0 }, "mouse", false), true);
  assert.equal(gestureAllowed({ type: "dblclick" }, "mouse", false), true);
});

test("otherwise the camera keeps d3-zoom's own filter: a ctrl-held wheel is a trackpad pinch and passes, a ctrl-held press and a second button are refused (Issue #778)", () => {
  assert.equal(gestureAllowed({ type: "wheel", ctrlKey: true }, "touch", false), true);
  assert.equal(gestureAllowed({ type: "mousedown", ctrlKey: true }, "mouse", true), false);
  assert.equal(gestureAllowed({ type: "mousedown", button: 2 }, "mouse", true), false);
});

test("a glide stopped before its first frame leaves no pending target (Issue #751)", () => {
  const zc = createZoomController({ viewportEl: el(), targetEl: el(), reducedMotion: false, glideMs: 300 });
  zc.glideBy(1.4);
  assert.equal(zc.glideTarget(), 1.4, "a press queues a glide toward 1.4");
  zc.zoomTo({ k: 2, x: 0, y: 0 });
  assert.equal(zc.glideTarget(), null);
});

test("a settle is still to come while a glide is queued or the settle debounce is armed, and not once it has run (Issue #751)", async () => {
  const glider = createZoomController({ viewportEl: el(), targetEl: el(), reducedMotion: false, glideMs: 300 });
  glider.glideBy(1.4);
  assert.equal(glider.settlePending(), true, "a queued glide counts as a settle to come");
  glider.rebase();

  const settled: number[] = [];
  const zc = createZoomController({
    viewportEl: el(),
    targetEl: el(),
    settleMs: 20,
    onSettle: (s) => settled.push(s.k),
  });
  assert.equal(zc.settlePending(), false, "a camera that never moved has no settle to come");
  zc.zoomTo({ k: 2, x: 0, y: 0 });
  assert.equal(zc.settlePending(), true, "a move arms the settle");
  await new Promise((r) => setTimeout(r, 60));
  assert.deepEqual(settled, [2], "the armed settle ran");
  assert.equal(zc.settlePending(), false, "once it has run, none is to come");
});

const dblclick = {
  type: "dblclick",
  pageX: 500,
  pageY: 400,
  clientX: 500,
  clientY: 400,
  shiftKey: false,
  button: 0,
  preventDefault: () => {},
  stopImmediatePropagation: () => {},
};
const doubleClick = (vp: El) => {
  for (const h of vp.handlers.get("dblclick") ?? []) h.call(vp, dblclick);
};
const centred = (k: number) => ({ k, x: 500 - 0.5 * k * 1000, y: 400 - 0.5 * k * 800 });
const viewport = () =>
  Object.assign(new El("div"), { clientWidth: 1000, clientHeight: 800, clientLeft: 0, clientTop: 0 });

test("lowering the ceiling stops a double-click's glide where it stands, and raising it leaves the glide to land (Issue #751)", async () => {
  const held = viewport();
  const zc = createZoomController({
    viewportEl: held as unknown as HTMLElement,
    targetEl: el(),
    scaleExtent: [1, 8],
    reducedMotion: false,
  });
  zc.attach();
  zc.setScaleMax(24);
  zc.zoomTo(centred(6));
  doubleClick(held);
  zc.setScaleMax(8);
  await new Promise((r) => setTimeout(r, 400));
  assert.deepEqual(
    zc.getState(),
    { x: -2500, y: -2000, k: 6 },
    "the double-click's glide toward 12 stopped where it stood",
  );

  const free = viewport();
  const zf = createZoomController({
    viewportEl: free as unknown as HTMLElement,
    targetEl: el(),
    scaleExtent: [1, 8],
    reducedMotion: false,
  });
  zf.attach();
  zf.zoomTo(centred(3));
  doubleClick(free);
  zf.setScaleMax(24);
  await new Promise((r) => setTimeout(r, 400));
  assert.deepEqual(
    zf.getState(),
    { x: -2500, y: -2000, k: 6 },
    "raising the ceiling left the double-click's glide to land on 6",
  );
});
