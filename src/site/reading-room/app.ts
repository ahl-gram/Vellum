// The Reading Room conductor (#221, the last sub of epic #190). The destination page:
// it takes a world from the URL hash (the Explorer's recipe keys plus #192's live
// address), draws it once through the SHARED render worker, and mounts the reading
// frame (#219) driving the fused ages instrument (#220). The room is ALWAYS armed:
// there is no ages checkbox here, the instrument IS the page. Arrival is at rest on
// every path (ratified 2026-07-29 on #221): a bare visit parks at the present, a deep
// link parks at its addressed rest, and Play is the visitor's gesture.
//
// Like the Print Room, the page renders ONCE at load and has no hashchange listener;
// unlike it, there are no draw controls at all, so there is no redraw path and no
// drawGen race to guard. The engine's overlays never write the status line mid-draw
// (the settle signal is it becoming ""), and this conductor is its only other writer.
import { runJob, usesWorker, initWorker } from "../explorer/worker-client.ts";
import { startArrival } from "../explorer/draw-ceremony.ts";
import { seedForDate } from "../../world/seed-of-the-day.ts";
import { parseLive, emitLive, finalizeHash, liveNow, type Live } from "../explorer/address.ts";
import { createReadingFrame } from "../reading-frame/index.ts";
import { createLivingChart, type AgesPos } from "../living-chart/index.ts";
import type { MapType } from "../../terrain/heightfield.ts";
import type { ClimateBand } from "../../climate/climate.ts";
import type { StyleName } from "../../render/style.ts";
import type { ThemeName } from "../../render/layers/field.ts";

// The window.__vellum* verification hooks assigned in this file, typed once here.
declare global {
  interface Window {
    __vellumReadingRoomUsesWorker?: typeof usesWorker;
    __vellumReadingRoomState?: () => { seed: number; title: string };
    __vellumReadingRoomAges?: () => { chamber: "survey" | "ages"; year: number | null } | null;
  }
}

// The valid option sets, mirrored from the Explorer's <select> values (the Print
// Room's boundary discipline): a crafted hash can never inject an unknown recipe
// param. Unknown keys (an Explorer link's cx/cy/k camera) are ignored, not errors.
const STYLES = ["antique", "topographic", "ink", "nautical"];
const TYPES = ["island", "archipelago", "continent", "citystate"];
const BANDS = ["temperate", "tropical", "polar"];
const THEMES = ["vegetation", "climate", "moisture", "population"];

const mount = document.getElementById("rr-mount") as HTMLElement;
const warning = document.getElementById("rr-warning") as HTMLElement;

// The frame builds the room's DOM (#219) and the engine animates over it (#191).
// onPark is #192's seam: Play's parks are the one rest no input event announces.
const frame = createReadingFrame(mount, { onPark: () => syncHash() });
const lc = createLivingChart(frame.host);

let seed = 0;
let style: StyleName = "antique";
let lastTitle = "";
// #192/#220: a deep link's live key, one-shot. It becomes the arm's rest position on
// the first (and only) draw, and liveNow reads it so an early sync cannot drop the
// address before the instrument has adopted it.
let pendingLive: Live | null = null;

// Recipe params with no visible control here: they ride along from a deep link so an
// Explorer or Print Room world reproduces faithfully, and are re-serialized on every
// sync so this page's URL stays a valid, shareable link for all three surfaces.
const carried: {
  type: MapType | "";
  band: ClimateBand | "";
  theme: ThemeName | "";
  legend: boolean;
  arms: boolean;
  land: number | null;
  coast: number | null;
} = { type: "", band: "", theme: "", legend: true, arms: false, land: null, coast: null };

function applyHash(): void {
  const p = new URLSearchParams(location.hash.slice(1));
  const seedRaw = p.get("seed");
  const s = Number(seedRaw);
  // Gate on PRESENCE, not just validity: Number(null) === 0 would pass the integer
  // guard and silently pin every bare visit to seed 0. A missing OR invalid seed
  // both fall through to today's seed-of-the-day below.
  if (seedRaw !== null && Number.isInteger(s) && s >= 0) seed = s >>> 0;
  else seed = seedForDate(new Date());
  const st = p.get("style");
  if (st !== null && STYLES.includes(st)) style = st as StyleName;
  const type = p.get("type");
  if (type !== null && TYPES.includes(type)) carried.type = type as MapType;
  const band = p.get("band");
  if (band !== null && BANDS.includes(band)) carried.band = band as ClimateBand;
  const theme = p.get("theme");
  if (theme !== null && THEMES.includes(theme)) carried.theme = theme as ThemeName;
  const legend = p.get("legend");
  if (legend !== null) carried.legend = legend === "1";
  const arms = p.get("arms");
  if (arms !== null) carried.arms = arms === "1";
  const land = p.get("land");
  if (land !== null) {
    const f = Number(land) / 1000;
    if (Number.isFinite(f)) carried.land = Math.min(0.7, Math.max(0.1, f));
  }
  const coast = p.get("coast");
  if (coast !== null) {
    const w = Number(coast) / 100;
    if (Number.isFinite(w)) carried.coast = Math.min(1, Math.max(0, w));
  }
  // #192: the live address. parseLive ignores a nonsensical both-keys hash WHOLE.
  pendingLive = parseLive(p);
}

// The one hash writer: recipe plus the live key, in the Explorer's exact format, so
// a copied link opens the same world at the same rest in any surface that reads it.
function syncHash(): void {
  const p = new URLSearchParams();
  p.set("seed", String(seed));
  p.set("style", style);
  if (carried.type) p.set("type", carried.type);
  if (carried.band) p.set("band", carried.band);
  if (carried.theme) p.set("theme", carried.theme);
  p.set("legend", carried.legend ? "1" : "0");
  p.set("arms", carried.arms ? "1" : "0");
  if (carried.land != null) p.set("land", String(Math.round(carried.land * 1000)));
  if (carried.coast != null) p.set("coast", String(Math.round(carried.coast * 100)));
  const a = lc.agesState();
  // ages is unconditionally true: the room's instrument is always armed, the page
  // equivalent of the Explorer's ticked checkbox.
  emitLive(p, liveNow({ ages: true, chamber: a?.chamber ?? null, year: a?.year, pending: pendingLive }));
  history.replaceState(null, "", "#" + finalizeHash(p));
}

function draw(): void {
  frame.host.statusEl.textContent = "Drafting…";
  const overrides: { mapType?: MapType; band?: ClimateBand; landFraction?: number; coastWarp?: number } = {};
  if (carried.type) overrides.mapType = carried.type;
  if (carried.band) overrides.band = carried.band;
  if (carried.land != null) overrides.landFraction = carried.land;
  if (carried.coast != null) overrides.coastWarp = carried.coast;
  runJob({
    kind: "draw",
    seed,
    overrides,
    render: { style, widthPx: 1500, legend: carried.legend, arms: carried.arms, theme: carried.theme || undefined },
  })
    .then((res) => {
      // res.svg is engine-rendered markup, not user content: the only inputs are the
      // uint32 seed and recipe params validated against fixed allowlists in applyHash,
      // the same trusted-string injection the Explorer and Print Room already do.
      frame.host.mapEl.innerHTML = res.svg;
      lc.buildPlaceOverlay(res.manifest);
      startArrival(frame.host.mapEl.querySelector("svg"));
      lastTitle = res.title;
      // At-rest arrival, every path (#221 ratification): the deep link's key becomes
      // the arm's rest, one-shot; with no key the arm's default parks at the present.
      // rearmAges, never applyAges: a restored link is a photograph, not an arming
      // gesture, and the room has no interactive arming ceremony at all. The quiet
      // flag stays UNSET: it also suppresses the #184 travel-order matrix, and an
      // arm path that pins it ships an unordered itinerary.
      const rest: AgesPos | undefined =
        pendingLive?.kind === "year" ? { chamber: "ages", year: pendingLive.year }
        : pendingLive?.kind === "survey" ? { chamber: "survey", t: 1 } : undefined;
      pendingLive = null;
      lc.rearmAges(res.manifest, res.survey, seed, res.subtitle, { rest });
      frame.host.statusEl.textContent = "";
      // Converge the address after the arm, so a bare visit's URL immediately carries
      // the world it landed on (agesState knows the parked rest by now).
      syncHash();
    })
    .catch((err) => {
      frame.host.statusEl.textContent = "The cartographer spilled the ink: " + err.message;
    });
}

// The conductor owns wiring, the engine owns behavior (the Explorer's controls.ts
// idiom, mirrored): Play, the bar, the detent's pointer pair, and the release sync.
frame.host.scrubber.playBtn.addEventListener("click", lc.togglePlay);
frame.host.scrubber.range.addEventListener("input", lc.onManualScrub);
frame.host.scrubber.range.addEventListener("change", syncHash);
frame.host.scrubber.range.addEventListener("pointerdown", lc.agesDragStart);
frame.host.scrubber.range.addEventListener("pointerup", lc.agesDragEnd);
frame.host.scrubber.range.addEventListener("pointercancel", lc.agesDragEnd);
// #53: the doc-level card dismiss pair (page-global listeners are a host decision).
document.addEventListener("keydown", lc.onDocKeydown);
document.addEventListener("click", lc.onDocClick);

await initWorker();
window.__vellumReadingRoomUsesWorker = usesWorker;
window.__vellumReadingRoomState = () => ({ seed, title: lastTitle });
window.__vellumReadingRoomAges = () => {
  const a = lc.agesState();
  return a ? { chamber: a.chamber, year: a.year } : null;
};
if (!usesWorker()) warning.hidden = false;

applyHash();
draw();
