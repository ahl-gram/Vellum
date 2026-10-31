// The camera <-> transform bridge (Issue #165): a link stores cx/cy (the world-uv centre of the viewport, 0..1) and k rather than the raw d3 translate in px, which is what lets a deep link restore the same framing on any device.
import type { RoomCamera } from "./room.ts";
import type { ZoomController } from "./zoom-controller.ts";

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

export function cameraFromTransform(t: CameraTransform, W: number, H: number): Camera {
  return { cx: (W / 2 - t.x) / (t.k * W), cy: (H / 2 - t.y) / (t.k * H), k: t.k };
}

export function transformFromCamera(c: Camera, W: number, H: number): CameraTransform {
  return { x: W / 2 - c.cx * c.k * W, y: H / 2 - c.cy * c.k * H, k: c.k };
}

export function addressCamera(params: URLSearchParams, ceiling: number): Camera | null {
  const cx = params.get("cx");
  const cy = params.get("cy");
  const k = params.get("k");
  if (cx === null || cy === null || k === null) return null;
  const camera = { cx: Number(cx), cy: Number(cy), k: Number(k) };
  const finite = [camera.cx, camera.cy, camera.k].every(Number.isFinite);
  return finite && camera.k >= 1 && camera.k <= ceiling ? camera : null;
}

export function gestureBox(viewport: Pick<HTMLElement, "clientWidth" | "clientHeight">): { W: number; H: number } {
  return { W: viewport.clientWidth, H: viewport.clientHeight };
}

export function framingCamera(
  zoom: Pick<ZoomController, "getState" | "refit">,
  viewport: Pick<HTMLElement, "clientWidth" | "clientHeight">,
): RoomCamera<Camera> {
  void viewport;
  return {
    hold: () => {
      const s = zoom.getState();
      return { cx: s.x, cy: s.y, k: s.k };
    },
    restore: (c) => zoom.refit({ x: c.cx, y: c.cy, k: c.k }),
  };
}
