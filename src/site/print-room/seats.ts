// The Print Room's chart-room seats: the Glass on the sheet, the fit with the turned plate's own aspect, the folio's lines and the sheet's two faces (the proof, a bound plate turned onto it). app.ts stays the conductor.
import { createZoomController } from "../shared/zoom-controller.ts";
import { bindGlassKeys } from "../shared/glass-keys.ts";
import { bindRoom, type Room } from "../shared/room.ts";
import { cameraFromTransform, transformFromCamera } from "../explorer/camera.ts";
import { PAGE_MEASURE_WIDTH, pageAspect } from "./matter-markup.ts";

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

// Re-laying the page out at the sheet's own font drifted 19px of per-line rounding at 390 (measured 2026-09-01), so the inner scales as a unit instead.
function bindPageScale(roomEls: RoomFurniture): void {
  const fit = () => {
    const s = roomEls.page.clientWidth / PAGE_MEASURE_WIDTH;
    if (s > 0) roomEls.pageInner.style.transform = `scale(${s})`;
  };
  new ResizeObserver(fit).observe(roomEls.page);
}

export function bindPrintRoom(roomEls: RoomFurniture, aspect: () => number | null): Sheet {
  bindPageScale(roomEls);
  const zoom = createZoomController({
    viewportEl: roomEls.viewport,
    targetEl: roomEls.map,
    scaleExtent: [1, 8],
    glideMs: () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--glide")),
  });
  zoom.attach();
  bindGlassKeys(roomEls.viewport, zoom);
  const box = () => ({ W: roomEls.viewport.clientWidth || 1, H: roomEls.viewport.clientHeight || 1 });
  const room = bindRoom({ frame: roomEls.stage, sheet: roomEls.sheet, aspect, camera: {
    hold: () => { const { W, H } = box(); return cameraFromTransform(zoom.getState(), W, H); },
    restore: (cam) => { const { W, H } = box(); zoom.refit(transformFromCamera(cam, W, H)); },
  } });
  return { room, rebase: () => zoom.rebase() };
}

export function writeFolio(roomEls: RoomFurniture, res: { title: string; subtitle: string }, seed: number): void {
  roomEls.folioTitle.textContent = `${res.title} · Chart № ${seed}`;
  const year = /in the year .+$/.exec(res.subtitle);
  roomEls.folioSub.textContent = year ? `surveyed ${year[0]}` : res.subtitle;
}

export interface Matter {
  readonly html: string;
  readonly line: string;
  readonly title: string;
}

export function showProof(roomEls: RoomFurniture): void {
  roomEls.turned.hidden = true;
  roomEls.turned.removeAttribute("src");
  roomEls.turned.alt = "";
  roomEls.page.hidden = true;
  roomEls.pageInner.innerHTML = "";
  roomEls.preview.hidden = false;
  roomEls.plateLine.textContent = "";
  restoreLabel(roomEls);
}

export function showPlate(roomEls: RoomFurniture, plate: Plate): void {
  roomEls.turned.src = plate.href;
  roomEls.turned.alt = plate.title;
  roomEls.turned.hidden = false;
  roomEls.page.hidden = true;
  roomEls.pageInner.innerHTML = "";
  roomEls.preview.hidden = true;
  roomEls.plateLine.textContent = plate.line;
  restoreLabel(roomEls);
}

// innerHTML takes trusted input only: matter.html is matterPage's engine-composed section with every value escaped, the bound-atlas.ts invariant's second sink.
export function showMatter(roomEls: RoomFurniture, matter: Matter): void {
  roomEls.measure.innerHTML = matter.html;
  roomEls.page.dataset.aspect = String(pageAspect(roomEls.measure.offsetHeight));
  roomEls.measure.innerHTML = "";
  roomEls.pageInner.innerHTML = matter.html;
  roomEls.page.hidden = false;
  roomEls.turned.hidden = true;
  roomEls.turned.removeAttribute("src");
  roomEls.turned.alt = "";
  roomEls.preview.hidden = true;
  roomEls.plateLine.textContent = matter.line;
  roomEls.viewport.dataset.baseLabel ??= roomEls.viewport.getAttribute("aria-label") ?? "";
  roomEls.viewport.setAttribute("aria-label", `A page of the bound atlas: ${matter.title}. Arrow keys pan, plus and minus keys zoom, 0 shows the full sheet.`);
}

function restoreLabel(roomEls: RoomFurniture): void {
  const base = roomEls.viewport.dataset.baseLabel;
  if (base) roomEls.viewport.setAttribute("aria-label", base);
}

export function matterAspect(roomEls: RoomFurniture): number | null {
  if (roomEls.page.hidden) return null;
  const a = Number(roomEls.page.dataset.aspect);
  return Number.isFinite(a) && a > 0 ? a : null;
}
