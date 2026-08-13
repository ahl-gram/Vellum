// The camera <-> transform bridge (#165). A link stores the camera as cx/cy/k, where
// cx/cy is the world-uv centre of the viewport (0..1) and k the continuous zoom; storing
// the CENTRE in uv rather than the raw d3 translate in px is what lets a deep link
// restore the same FRAMING on any device. Pure and DOM-free (test/explorer/camera.test.ts).
// The sheet fills the viewport at k=1, so its px extent IS [0,W]x[0,H]; d3 maps a sheet
// point p to screen = p*k + t, so the sheet point under the viewport centre is
// ((W/2 - x)/k, (H/2 - y)/k), and its uv is that over (W, H).

export interface CameraTransform {
  x: number;
  y: number;
  k: number;
}

export interface Camera {
  cx: number;
  cy: number;
  k: number;
}

/** The camera (world-uv centre + zoom) that a d3 transform is framing; W/H are the viewport px size. */
export function cameraFromTransform(
  t: CameraTransform,
  W: number,
  H: number,
): Camera {
  return { cx: (W / 2 - t.x) / (t.k * W), cy: (H / 2 - t.y) / (t.k * H), k: t.k };
}

/** The exact inverse of cameraFromTransform, so a hash round-trip restores the framing; the caller clamps the result through the controller. */
export function transformFromCamera(
  c: Camera,
  W: number,
  H: number,
): CameraTransform {
  return { x: W / 2 - c.cx * c.k * W, y: H / 2 - c.cy * c.k * H, k: c.k };
}
