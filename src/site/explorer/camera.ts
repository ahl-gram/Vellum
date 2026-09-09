// The camera <-> transform bridge (#165): a link stores cx/cy (the world-uv centre of the viewport, 0..1) and k rather than the raw d3 translate in px, which is what lets a deep link restore the same framing on any device.

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

export function cameraFromTransform(
  t: CameraTransform,
  W: number,
  H: number,
): Camera {
  return { cx: (W / 2 - t.x) / (t.k * W), cy: (H / 2 - t.y) / (t.k * H), k: t.k };
}

export function transformFromCamera(
  c: Camera,
  W: number,
  H: number,
): CameraTransform {
  return { x: W / 2 - c.cx * c.k * W, y: H / 2 - c.cy * c.k * H, k: c.k };
}
