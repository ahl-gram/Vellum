// The Specimen Book's conductor (Issue #487 item 4): the kit's own binders fit the sheet, bind the slip and run the Glass, so every state the page shows is reached the way a room reaches it. The corner's select names the state, the dice rolls one, the primary rests the room, and the foot's button empties and refills the status pill.
import { createZoomController } from "../shared/zoom-controller.ts";
import { bindGlassKeys, ZOOM_STEP } from "../shared/glass-keys.ts";
import { pageSlideAway } from "../shared/slide-away-page.ts";
import { fillPress } from "../shared/slide-away.ts";
import { FOLD_SETTLE_MS } from "../shared/slip.ts";
import { bindRoom } from "../shared/room.ts";
import { cameraFromTransform, transformFromCamera } from "../explorer/camera.ts";

declare global {
  interface Window {
    __vellumSpecimenState?: () => { state: string; folded: boolean; zoomed: boolean; pill: string };
  }
}

const STATES = ["rest", "folded", "leaned", "slid"] as const;
type State = (typeof STATES)[number];

const $ = <T extends HTMLElement = HTMLElement>(id: string): T => document.getElementById(id) as T;
const viewport = $("map-viewport");
const map = $("map");
const slip = document.querySelector<HTMLElement>(".slip")!;
const plate = $<HTMLImageElement>("sb-plate");
const stateSel = $<HTMLSelectElement>("sb-state");
const pill = $("sb-status");
const PILL_TEXT = pill.textContent;

const slide = pageSlideAway({
  frame: document.querySelector<HTMLElement>(".stage")!,
  sheet: $("sheet"),
  gesture: viewport,
  step: ZOOM_STEP,
});
const zoom = createZoomController({
  viewportEl: viewport,
  targetEl: map,
  scaleExtent: [1, 8],
  glideMs: () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--glide")),
  onApply: (s) => slide.follow(s.k),
});
zoom.attach();
bindGlassKeys(viewport, zoom);
const box = () => ({ W: viewport.clientWidth || 1, H: viewport.clientHeight || 1 });
const room = bindRoom({
  frame: document.querySelector<HTMLElement>(".stage")!,
  sheet: $("sheet"),
  aspect: () => (plate.naturalWidth > 0 ? plate.naturalWidth / plate.naturalHeight : null),
  camera: {
    hold: () => {
      const { W, H } = box();
      return cameraFromTransform(zoom.getState(), W, H);
    },
    restore: (cam) => {
      const { W, H } = box();
      zoom.refit(transformFromCamera(cam, W, H));
    },
  },
});

// The folio is written before the first layout: the legend row is placed from the folio's text (room-seats.ts), as a room lays out after its draw.
$("folio-title").textContent = `The Specimen Book · Chart № ${$<HTMLInputElement>("sb-seed").value}`;
$("folio-sub").textContent = "the chart folio: the title line above, this survey line, the small-caps line, the note";
$("folio-coords").textContent = "the folio's small-caps line";
$("folio-note").textContent = "The folio's note, a sentence or two a room writes at the draw.";
room.layout();
plate.addEventListener("load", room.layout);

const folded = (): boolean => slip.classList.contains("folded");
const press = (sel: string): void => document.querySelector<HTMLElement>(sel)?.click();
const glideTo = (k: number): void => zoom.glideBy(k / (zoom.glideTarget() ?? zoom.getState().k));
function setState(s: State): void {
  stateSel.value = s;
  const unfolding = s !== "folded" && folded();
  if (s === "folded" && !folded()) press(".slip-fold");
  if (unfolding) press(".slip-tab");
  if (s === "slid") slide.arm();
  if (s === "leaned") glideTo(ZOOM_STEP);
  else if (s === "slid" && unfolding)
    window.setTimeout(() => {
      if (stateSel.value === "slid") glideTo(fillPress(slide.fill(), ZOOM_STEP));
    }, FOLD_SETTLE_MS);
  else if (s === "slid") glideTo(fillPress(slide.fill(), ZOOM_STEP));
  else zoom.glideHome();
}
stateSel.addEventListener("change", () => setState(stateSel.value as State));
$("sb-random").addEventListener("click", () => setState(STATES[Math.floor(Math.random() * STATES.length)]!));
$("sb-rest").addEventListener("click", () => setState("rest"));
$("sb-report").addEventListener("click", () => {
  const empty = pill.textContent === "";
  pill.textContent = empty ? PILL_TEXT : "";
  $("sb-report").textContent = empty ? "Empty the pill" : "Fill the pill";
});
window.__vellumSpecimenState = () => ({
  state: stateSel.value,
  folded: folded(),
  zoomed: viewport.classList.contains("zoomed"),
  pill: pill.textContent,
});
