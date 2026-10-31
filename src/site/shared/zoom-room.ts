// The plain chart room's zoom, bound once for every room whose camera is purely geometric (Issue #1010): the slide-away, the Glass's controller with its keys and presses, and the chart room's fit holding the framing across a refit. The Daily Hunt builds its own controller (vellum/hunt-fixed-world) and the Explorer its LOD camera (glass.ts).
import { createZoomController, type ZoomController } from "./zoom-controller.ts";
import { bindGlassKeys } from "./glass-keys.ts";
import { pageSlideAway, type RoomSlide } from "./slide-away-page.ts";
import { bindRoom, type Room } from "./room.ts";
import { framingCamera } from "./camera.ts";
import { glideMs, ZOOM_STEP } from "./zoom-keys.ts";

export interface ZoomRoomParts {
  readonly frame: HTMLElement;
  readonly sheet: HTMLElement;
  readonly viewport: HTMLElement;
  readonly target: HTMLElement;
  readonly aspect?: () => number | null;
}

export interface ZoomRoom {
  readonly zoom: ZoomController;
  readonly slide: RoomSlide;
  readonly room: Room;
}

export function bindZoomRoom({ frame, sheet, viewport, target, aspect }: ZoomRoomParts): ZoomRoom {
  const slide = pageSlideAway({ frame, sheet, gesture: viewport, step: ZOOM_STEP });
  const zoom = createZoomController({
    viewportEl: viewport,
    targetEl: target,
    glideMs,
    onApply: (s) => slide.follow(s.k),
  });
  zoom.attach();
  bindGlassKeys(viewport, zoom);
  const room = bindRoom({ frame, sheet, aspect, camera: framingCamera(zoom, viewport) });
  return { zoom, slide, room };
}
