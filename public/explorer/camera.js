// The Surveyor's Glass, Sub 4 (#165): the camera <-> transform bridge. A shared,
// bookmarkable link stores the camera as cx/cy/k, where cx/cy is the world-uv centre
// of the viewport (fraction of the sheet, 0..1) and k is the continuous zoom. Storing
// the CENTRE in uv (not the raw d3 translate in px) is what lets a deep link restore
// the same FRAMING on any device: the translate depends on the viewport pixel size,
// the uv centre does not.
//
// These two functions are pure and DOM-free so they are unit-tested in isolation
// (test/explorer/camera.test.ts); the live plumbing (reading location.hash, driving
// the controller) lives in app.js / hash-sync.js and is proven by e2e suite-zoom.
//
// The sheet fills the viewport exactly at k=1, so the sheet's px extent IS the
// viewport extent [0,W]x[0,H]; the d3 transform maps a sheet point p to screen as
// screen = p*k + t. The viewport centre is (W/2, H/2), so the sheet point under it is
// ((W/2 - x)/k, (H/2 - y)/k), and its uv is that over (W, H).

/**
 * The camera (world-uv centre + zoom) that a d3 transform is framing.
 * @param {{x:number, y:number, k:number}} t  the live d3 transform
 * @param {number} W  viewport width in px (the sheet width at k=1)
 * @param {number} H  viewport height in px
 * @returns {{cx:number, cy:number, k:number}}
 */
export function cameraFromTransform(t, W, H) {
  return { cx: (W / 2 - t.x) / (t.k * W), cy: (H / 2 - t.y) / (t.k * H), k: t.k };
}

/**
 * The d3 transform that frames a given camera in a viewport of size (W, H). The
 * exact inverse of cameraFromTransform, so a hash round-trip restores the framing.
 * The caller clamps the result through the controller (a deep link may name a centre
 * that would pull an edge past the viewport at that zoom).
 * @param {{cx:number, cy:number, k:number}} c
 * @param {number} W
 * @param {number} H
 * @returns {{x:number, y:number, k:number}}
 */
export function transformFromCamera(c, W, H) {
  return { x: W / 2 - c.cx * c.k * W, y: H / 2 - c.cy * c.k * H, k: c.k };
}
