import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addressCamera,
  cameraFromTransform,
  framingCamera,
  gestureBox,
  transformFromCamera,
} from "../../src/site/shared/camera.ts";
import { DEEPEST_K } from "../../src/world/lod.ts";

// The camera <-> transform bridge a shared link stores as cx/cy/k; the centre is in uv (viewport-size independent), so the round-trip is asserted across two viewport sizes; the live hash restore is the e2e suite-zoom's.

test("cameraFromTransform reads the world-uv centre a transform is framing (#165)", () => {
  // A centred 4x: the sheet point at the viewport centre is the sheet centre, so cx/cy are 0.5 regardless of k.
  assert.deepEqual(cameraFromTransform({ x: -1500, y: -1200, k: 4 }, 1000, 800), {
    cx: 0.5,
    cy: 0.5,
    k: 4,
  });
  // Off-centre 2x arithmetic: cx=(500+100)/2000=0.3, cy=(400+50)/1600=0.28125.
  assert.deepEqual(cameraFromTransform({ x: -100, y: -50, k: 2 }, 1000, 800), {
    cx: 0.3,
    cy: 0.28125,
    k: 2,
  });
  assert.deepEqual(cameraFromTransform({ x: 0, y: 0, k: 1 }, 1000, 800), {
    cx: 0.5,
    cy: 0.5,
    k: 1,
  });
});

test("transformFromCamera is the exact inverse: framing a camera in a viewport (#165)", () => {
  assert.deepEqual(transformFromCamera({ cx: 0.5, cy: 0.5, k: 4 }, 1000, 800), {
    x: -1500,
    y: -1200,
    k: 4,
  });
  assert.deepEqual(transformFromCamera({ cx: 0.3, cy: 0.28125, k: 2 }, 1000, 800), {
    x: -100,
    y: -50,
    k: 2,
  });
});

test("a camera round-trips through a transform and back, independent of viewport size (#165)", () => {
  const cam = { cx: 0.62, cy: 0.41, k: 5.5 };
  for (const [W, H] of [
    [1000, 800],
    [1500, 1125], // the Explorer draws at widthPx 1500
    [375, 640], // a phone
  ] as const) {
    const t = transformFromCamera(cam, W, H);
    const back = cameraFromTransform(t, W, H);
    assert.ok(Math.abs(back.cx - cam.cx) < 1e-12, `cx ${W}x${H}: ${back.cx}`);
    assert.ok(Math.abs(back.cy - cam.cy) < 1e-12, `cy ${W}x${H}: ${back.cy}`);
    assert.equal(back.k, cam.k);
  }
});

const at = (h: string) => addressCamera(new URLSearchParams(h), DEEPEST_K);

test("a shared link's camera is read up to the deepest band's k, 32, and refused past it (Issue #954)", () => {
  assert.deepEqual(at("cx=0.5&cy=0.25&k=32"), { cx: 0.5, cy: 0.25, k: 32 });
  assert.deepEqual(at("cx=0.5&cy=0.25&k=8"), { cx: 0.5, cy: 0.25, k: 8 });
  assert.equal(at("cx=0.5&cy=0.25&k=32.0001"), null);
  assert.equal(at("cx=0.5&cy=0.25&k=0.99"), null);
});

test("a link missing a key, or carrying one that is not a number, carries no camera (the parse readHash made, moved, Issue #954)", () => {
  assert.equal(at("cx=0.5&k=2"), null);
  assert.equal(at("cy=0.5&k=2"), null);
  assert.equal(at("cx=0.5&cy=x&k=2"), null);
  assert.equal(at(""), null);
});

test("FC1 a room's camera holds the framing across a refit, never the raw transform: the centre held in one gesture box is re-seated in the next, and a hold before the first layout is the sheet at rest (Issue #1010)", () => {
  const seated: { x: number; y: number; k: number }[] = [];
  const zoom = {
    getState: () => ({ x: -100, y: -50, k: 2 }),
    refit: (t: { x: number; y: number; k: number }) => void seated.push(t),
  };
  const box = { clientWidth: 1000, clientHeight: 800 };
  const cam = framingCamera(zoom, box);
  const held = cam.hold();
  box.clientWidth = 1200;
  box.clientHeight = 900;
  cam.restore(held);
  assert.deepEqual(seated, [{ x: -120, y: -56.25, k: 2 }]);

  const atRest = framingCamera(
    { getState: () => ({ x: 0, y: 0, k: 1 }), refit: () => {} },
    { clientWidth: 0, clientHeight: 0 },
  );
  assert.deepEqual(atRest.hold(), { cx: 0.5, cy: 0.5, k: 1 });
});

test("FC2 the gesture box reads a box not yet laid out as one pixel square, so a camera taken before the first layout is finite (Issue #1010)", () => {
  assert.deepEqual(gestureBox({ clientWidth: 0, clientHeight: 0 }), { W: 1, H: 1 });
  assert.deepEqual(gestureBox({ clientWidth: 1200, clientHeight: 900 }), { W: 1200, H: 900 });
});
