// The Reading Room's chart-room seats (#463): where the reading frame's parts go, the Glass, the fit, the folio and the scale. app.ts stays the conductor.
import type { DrawResult } from "../explorer/worker-client.ts";
import type { ReadingFrame } from "../reading-frame/index.ts";
import type { LivingChart } from "../living-chart/index.ts";
import type { ProspectStage } from "./prospect-stage.ts";
import { createZoomController } from "../shared/zoom-controller.ts";
import { bindGlassKeys } from "../shared/glass-keys.ts";
import { bindRoom, type Room } from "../shared/room.ts";
import { renderScale, scaleTicks } from "../shared/instrument-scale.ts";

export interface RoomFurniture {
  readonly stage: HTMLElement;
  readonly sheet: HTMLElement;
  readonly viewport: HTMLElement;
  readonly strip: HTMLElement;
  readonly scale: HTMLElement;
  readonly slip: HTMLElement;
  readonly tab: HTMLElement;
  readonly journalDock: HTMLElement;
  readonly folioTitle: HTMLElement;
  readonly folioSub: HTMLElement;
}

// The frame's root stays where it is, the arrival ceremony's host (RS26).
export function seatFrame(frame: ReadingFrame, plate: ProspectStage, f: RoomFurniture): void {
  f.viewport.appendChild(frame.host.mapEl);
  f.stage.appendChild(frame.host.statusEl);
  const well = document.createElement("div");
  well.className = "scale-well";
  frame.host.scrubber.range.replaceWith(well);
  well.append(frame.host.scrubber.range, f.scale);
  f.strip.appendChild(frame.strip);
  f.journalDock.append(plate.root, frame.log.panel);
  frame.host.scrubber.panel.append(f.strip, f.slip, f.tab);
}

// #167 the Glass, geometric only (no card to counter-scale: every hit is inert here, RR11b), the kit's keys, and the room's fit; the strip's height seats the chart folio and the Glass above it (--strip-h) and bounds the fit, holding its last value while the panel is down.
export function bindReadingRoom(frame: ReadingFrame, f: RoomFurniture): { readonly room: Room; readonly rebase: () => void } {
  const zoom = createZoomController({
    viewportEl: f.viewport,
    targetEl: frame.host.mapEl,
    scaleExtent: [1, 8],
    glideMs: () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--glide")),
  });
  zoom.attach();
  bindGlassKeys(f.viewport, zoom);
  const room = bindRoom({ frame: f.stage, sheet: f.sheet, camera: { hold: () => zoom.getState(), restore: (state) => zoom.refit(state) } });
  let stripH = 0;
  new ResizeObserver(() => {
    const h = f.strip.offsetHeight;
    if (h === 0 || h === stripH) return;
    stripH = h;
    document.body.style.setProperty("--strip-h", `${h}px`);
    room.layout();
  }).observe(f.strip);
  return { room, rebase: () => zoom.rebase() };
}

export function writeFolio(f: RoomFurniture, res: DrawResult, forSeed: number): void {
  f.folioTitle.textContent = `${res.title} · Chart № ${forSeed}`;
  f.folioSub.textContent = res.subtitle;
}

// Drawn once the instrument is armed, since the days come from the travel order.
export function drawScale(lc: LivingChart, scale: HTMLElement): void {
  const a = lc.agesState();
  const entries = lc.voyageLog()?.entries ?? [];
  renderScale(scale, scaleTicks({
    days: entries.length > 0 ? { first: entries[0].day, last: entries[entries.length - 1].day } : null,
    years: a ? { min: a.min, max: a.max } : null,
  }));
}
