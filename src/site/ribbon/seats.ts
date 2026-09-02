// The Wayfarer's Ribbon's chart-room seats (#463 part 4/4): the scroll as the sheet's one face, the Glass on it, the fit at the scroll's own aspect, the journey row docking into the phone sheet by the legend's own rule, the folio's lines and the itinerary on the slip, each row leaning the Glass on its stretch. app.ts stays the conductor.
import { createZoomController } from "../shared/zoom-controller.ts";
import { bindGlassKeys } from "../shared/glass-keys.ts";
import { bindRoom, dockLegend, legendSeat, type Room } from "../shared/room.ts";
import { cameraFromTransform, transformFromCamera } from "../explorer/camera.ts";
import { RIBBON_W, RIBBON_H } from "../../itinerary/finished.ts";
import { rowText } from "./row-text.ts";
import type { RibbonPlateData, RibbonRow } from "../explorer/ribbon-job.ts";
import type { PlateDress } from "../explorer/prospect-job.ts";

export const LEAN_K = 2.6;
const NARROW = "(max-width: 900px)";

export interface RoomFurniture {
  readonly stage: HTMLElement;
  readonly sheet: HTMLElement;
  readonly viewport: HTMLElement;
  readonly map: HTMLElement;
  readonly plate: HTMLImageElement;
  readonly corner: HTMLElement;
  readonly journey: HTMLElement;
  readonly journeyDock: HTMLElement;
  readonly swap: HTMLElement;
  readonly slipTitle: HTMLElement;
  readonly slipWhere: HTMLElement;
  readonly itinerary: HTMLElement;
  readonly folioTitle: HTMLElement;
  readonly folioSub: HTMLElement;
  readonly unrolled: HTMLElement;
}

export interface Sheet {
  readonly room: Room;
  readonly rebase: () => void;
  readonly lean: (nx: number, ny: number) => void;
}

export function bindRibbonRoom(f: RoomFurniture): Sheet {
  const zoom = createZoomController({
    viewportEl: f.viewport,
    targetEl: f.map,
    scaleExtent: [1, 8],
    glideMs: () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--glide")),
  });
  zoom.attach();
  bindGlassKeys(f.viewport, zoom);
  const box = () => ({ W: f.viewport.clientWidth || 1, H: f.viewport.clientHeight || 1 });
  // Seated BEFORE bindRoom registers its own listener on the same query, so on a live 900px crossing the journey docks first and the kit's layout then measures the corner it left (listeners fire in registration order).
  const narrow = window.matchMedia(NARROW);
  const home = { legend: f.journey, dock: f.journeyDock, stage: f.corner, next: f.swap };
  const seatJourney = () => dockLegend<HTMLElement>(home, legendSeat({ narrow: narrow.matches, hasSlip: true }));
  seatJourney();
  narrow.addEventListener("change", seatJourney);
  const room = bindRoom({ frame: f.stage, sheet: f.sheet, aspect: () => RIBBON_W / RIBBON_H, camera: {
    hold: () => { const { W, H } = box(); return cameraFromTransform(zoom.getState(), W, H); },
    restore: (cam) => { const { W, H } = box(); zoom.refit(transformFromCamera(cam, W, H)); },
  } });
  return {
    room,
    rebase: () => zoom.rebase(),
    lean: (nx, ny) => { const { W, H } = box(); zoom.zoomTo(transformFromCamera({ cx: nx, cy: ny, k: LEAN_K }, W, H)); },
  };
}

type Facts = Omit<RibbonPlateData, "svg" | "options" | "reachable">;

export function showPlate(f: RoomFurniture, res: Pick<Facts, "fromName" | "toName">, seed: number, url: string): void {
  f.plate.src = url;
  f.plate.alt = `The road from ${res.fromName} to ${res.toName}, chart ${seed}`;
  f.plate.hidden = false;
}

export function writeFolio(f: RoomFurniture, res: Facts, seed: number, dress: PlateDress, ms: number): void {
  f.folioTitle.textContent = `${res.fromName} to ${res.toName} · Chart № ${seed}`;
  f.folioSub.textContent = `${res.title} · the road as the wayfarers' chain measured it, An. ${res.year}`;
  f.unrolled.textContent = `unrolled in ${ms}ms · ${Math.round(res.leagues)} leagues · ${dress}`;
}

function rowNode(r: RibbonRow, onLean: (row: RibbonRow, li: HTMLLIElement) => void): HTMLLIElement {
  const li = document.createElement("li");
  li.className = r.kind;
  li.dataset.nx = String(r.nx);
  li.dataset.ny = String(r.ny);
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "lean";
  btn.title = "Lean the Glass on this stretch";
  const num = document.createElement("span");
  num.className = "cr-num";
  num.textContent = String(Math.round(r.leagues));
  const text = document.createElement("span");
  text.className = "cr-text";
  const { strong, em } = rowText(r);
  if (strong !== null) {
    const s = document.createElement("strong");
    s.textContent = strong;
    text.append(s, " ");
  }
  if (em !== "") {
    const e = document.createElement("em");
    e.textContent = em;
    text.append(e);
  }
  btn.append(num, text);
  btn.addEventListener("click", () => onLean(r, li));
  li.append(btn);
  return li;
}

export function writeItinerary(f: RoomFurniture, res: Facts, onLean: (row: RibbonRow, li: HTMLLIElement) => void): void {
  f.slipTitle.textContent = `${res.fromName} to ${res.toName}`;
  f.slipWhere.textContent = `${Math.round(res.leagues)} leagues · in ${res.realm ?? res.title} · An. ${res.year}`;
  f.itinerary.replaceChildren(...res.events.map((r) => rowNode(r, onLean)));
}

export function markLeaned(f: RoomFurniture, li: HTMLLIElement | null): void {
  for (const el of f.itinerary.children) el.classList.toggle("on", el === li);
}
