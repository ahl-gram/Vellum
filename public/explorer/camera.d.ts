// Types for public/explorer/camera.js, the pure camera <-> transform bridge (#165).
// Declared DOM-free so the project tsconfig (no "dom" lib) can type-check the test
// that imports it, mirroring verso.d.ts / sheet-turn.d.ts.

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

/** The world-uv centre + zoom a d3 transform is framing, in a viewport of size (W, H). */
export function cameraFromTransform(t: CameraTransform, W: number, H: number): Camera;

/** The d3 transform that frames a camera in a viewport of size (W, H); inverse of cameraFromTransform. */
export function transformFromCamera(c: Camera, W: number, H: number): CameraTransform;
