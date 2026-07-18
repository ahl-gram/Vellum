import { test } from "node:test";
import assert from "node:assert/strict";
import { cameraFromTransform, transformFromCamera } from "../../docs/explorer/camera.js";

// The Surveyor's Glass, Sub 4 (#165): the camera <-> transform bridge that a shared
// link stores as cx/cy/k (world-uv centre + continuous zoom). These validate the NEW
// behaviour of the pure math (there is no prior bug to reproduce); the live hash
// round-trip and the on-load restore are proven end to end by e2e suite-zoom. Storing
// the centre in uv is the whole point: it must be viewport-size independent, so the
// round-trip is asserted across two different viewport sizes.

test("cameraFromTransform reads the world-uv centre a transform is framing (#165)", () => {
  // A centred 4x magnification: the sheet point at the viewport centre is the sheet
  // centre, so cx/cy are 0.5 regardless of k.
  assert.deepEqual(cameraFromTransform({ x: -1500, y: -1200, k: 4 }, 1000, 800), {
    cx: 0.5,
    cy: 0.5,
    k: 4,
  });
  // An off-centre 2x: the arithmetic, not the centre. cx=(500+100)/2000=0.3,
  // cy=(400+50)/1600=0.28125.
  assert.deepEqual(cameraFromTransform({ x: -100, y: -50, k: 2 }, 1000, 800), {
    cx: 0.3,
    cy: 0.28125,
    k: 2,
  });
  // Home (k=1, no offset) frames the sheet centre.
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
  ]) {
    const t = transformFromCamera(cam, W, H);
    const back = cameraFromTransform(t, W, H);
    assert.ok(Math.abs(back.cx - cam.cx) < 1e-12, `cx ${W}x${H}: ${back.cx}`);
    assert.ok(Math.abs(back.cy - cam.cy) < 1e-12, `cy ${W}x${H}: ${back.cy}`);
    assert.equal(back.k, cam.k);
  }
});
