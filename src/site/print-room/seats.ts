// The Print Room's chart-room seats (#463 part 3/4): the Glass on the sheet, the fit with the turned plate's own aspect, the folio's lines and the sheet's two faces (the proof, a bound plate turned onto it). app.ts stays the conductor.
import { createZoomController } from "../shared/zoom-controller.ts";
import { bindGlassKeys } from "../shared/glass-keys.ts";
import { bindRoom, type Room } from "../shared/room.ts";
import { cameraFromTransform, transformFromCamera } from "../explorer/camera.ts";
import { pageAspect } from "./matter-markup.ts";

export interface RoomFurniture {
  readonly stage: HTMLElement;
  readonly sheet: HTMLElement;
  readonly viewport: HTMLElement;
  readonly map: HTMLElement;
  readonly preview: HTMLElement;
  readonly turned: HTMLImageElement;
  readonly page: HTMLElement;
  readonly pageInner: HTMLElement;
  readonly measure: HTMLElement;
  readonly folioTitle: HTMLElement;
  readonly folioSub: HTMLElement;
  readonly plateLine: HTMLElement;
}

export interface Sheet {
  readonly room: Room;
  readonly rebase: () => void;
}

export interface Plate {
  readonly href: string;
  readonly title: string;
  readonly line: string;
}

export function bindPrintRoom(f: RoomFurniture, aspect: () => number | null): Sheet {
  const zoom = createZoomController({
    viewportEl: f.viewport,
    targetEl: f.map,
    scaleExtent: [1, 8],
    glideMs: () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--glide")),
  });
  zoom.attach();
  bindGlassKeys(f.viewport, zoom);
  const box = () => ({ W: f.viewport.clientWidth || 1, H: f.viewport.clientHeight || 1 });
  const room = bindRoom({ frame: f.stage, sheet: f.sheet, aspect, camera: {
    hold: () => { const { W, H } = box(); return cameraFromTransform(zoom.getState(), W, H); },
    restore: (cam) => { const { W, H } = box(); zoom.refit(transformFromCamera(cam, W, H)); },
  } });
  return { room, rebase: () => zoom.rebase() };
}

export function writeFolio(f: RoomFurniture, res: { title: string; subtitle: string }, seed: number): void {
  f.folioTitle.textContent = `${res.title} · Chart № ${seed}`;
  const year = /in the year .+$/.exec(res.subtitle);
  f.folioSub.textContent = year ? `surveyed ${year[0]}` : res.subtitle;
}

export interface Matter {
  readonly html: string;
  readonly line: string;
}

export function showProof(f: RoomFurniture): void {
  f.turned.hidden = true;
  f.turned.removeAttribute("src");
  f.turned.alt = "";
  f.page.hidden = true;
  f.pageInner.innerHTML = "";
  f.preview.hidden = false;
  f.plateLine.textContent = "";
}

export function showPlate(f: RoomFurniture, plate: Plate): void {
  f.turned.src = plate.href;
  f.turned.alt = plate.title;
  f.turned.hidden = false;
  f.page.hidden = true;
  f.pageInner.innerHTML = "";
  f.preview.hidden = true;
  f.plateLine.textContent = plate.line;
}

export function showMatter(f: RoomFurniture, matter: Matter): void {
  f.measure.innerHTML = matter.html;
  f.page.dataset.aspect = String(pageAspect(f.measure.offsetHeight));
  f.measure.innerHTML = "";
  f.pageInner.innerHTML = matter.html;
  f.page.hidden = false;
  f.turned.hidden = true;
  f.turned.removeAttribute("src");
  f.turned.alt = "";
  f.preview.hidden = true;
  f.plateLine.textContent = matter.line;
}

export function matterAspect(f: RoomFurniture): number | null {
  if (f.page.hidden) return null;
  const a = Number(f.page.dataset.aspect);
  return Number.isFinite(a) && a > 0 ? a : null;
}
