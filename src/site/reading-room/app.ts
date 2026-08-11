// The Reading Room conductor (#221, the last sub of epic #190). The destination page:
// it takes a world from the URL hash (the Explorer's recipe keys plus #192's live
// address), draws it once through the SHARED render worker, and mounts the reading
// frame (#219) driving the fused ages instrument (#220). The room is ALWAYS armed:
// there is no ages checkbox here, the instrument IS the page. Arrival is at rest on
// every path (ratified 2026-07-29 on #221): a bare visit parks at the present, a deep
// link parks at its addressed rest, and Play is the visitor's gesture.
//
// Like the Print Room, the page has no hashchange listener: the hash is read once at
// boot. The colophon dice (#318) is the one draw control, a seed counter at the
// journal's foot, so draws carry the Print Room's drawGen monotonic guard and a
// counter draw parks at the present (pendingLive stays boot-only). The engine's
// overlays never write the status line mid-draw (the settle signal is it becoming
// ""), and this conductor is its only other writer.
import { runJob, runInline, usesWorker, initWorker } from "../explorer/worker-client.ts";
import { installHostHooks } from "../shared/host-hooks.ts";
import { startArrival } from "../explorer/draw-ceremony.ts";
import { seedForDate } from "../../world/seed-of-the-day.ts";
import { parseLive, emitLive, finalizeHash, liveNow, type Live } from "../explorer/address.ts";
import { createReadingFrame } from "../reading-frame/index.ts";
import { createColophon } from "./colophon.ts";
import { createLivingChart, type AgesPos, type LivingChart } from "../living-chart/index.ts";
import type { MapType } from "../../terrain/heightfield.ts";
import type { ClimateBand } from "../../climate/climate.ts";
import type { StyleName } from "../../render/style.ts";
import type { ThemeName } from "../../render/layers/field.ts";

// The window.__vellum* verification hooks assigned in this file, typed once here.
//
// #320: the ages hook publishes the engine's WHOLE instrument state rather than the
// {chamber, year} the room needed for its own address checks. The live-animation
// coverage re-hosted here reads the sweep through t / u / held / min / max / playing,
// all of which the Explorer's __vellumAgesState has always carried. Typing it as the
// engine's own ReturnType (the #319 no-bar.ts idiom) means tsc breaks this file if
// agesState ever grows or loses a member, so the hook cannot silently narrow again.
declare global {
  interface Window {
    __vellumReadingRoomUsesWorker?: typeof usesWorker;
    __vellumReadingRoomState?: () => { seed: number; title: string };
    __vellumReadingRoomAges?: LivingChart["agesState"];
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
// #318 the colophon dice, mounted as the instrument panel's SIBLING in the reading
// column, never inside it (the ratified placement: the engine hides the panel
// through every teardown, and the colophon must stand through all of them).
const colophon = createColophon();
frame.reading.appendChild(colophon.root);

let seed = 0;
// The seed of the world actually ON SCREEN, advanced only by a successful settle:
// the rollback target when a counter draw fails, so the hash writer, the state
// hook, and the counter never name a world that never arrived.
let shownSeed = 0;
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

// #318: the Print Room's monotonic guard, needed the day the colophon gave the room
// a second draw. A superseded draw can never land over a newer one.
let drawGen = 0;

// #321 the arrival ceremony (ratified by Alex 2026-08-11, candidate C of the
// out/321-unfurl variants): the reading column unfurls ONCE per visit, on the first
// successful settle. One-shot by CLASS REMOVAL, not by this flag alone: the engine
// drives the panel's hidden flag on every counter read, display:none terminates a
// CSS animation, and restoring display starts it AFRESH, so a class left in place
// would replay the unfurl as a flash on every dice roll. The journal is the later
// stage (one --paper-quick beat behind), so its animationend is when the whole
// ceremony has landed and the class can retire.
let arrived = false;
frame.log.panel.addEventListener("animationend", function onUnfurled(e: AnimationEvent) {
  if (e.animationName !== "paperUnfurl") return;
  frame.root.classList.remove("rf-arrival");
  frame.log.panel.removeEventListener("animationend", onUnfurled);
});

function draw(): void {
  const myGen = ++drawGen;
  // Park the outgoing world's sweep for the draft round-trip. The stake is the
  // VISIBLE second or so of "Drafting…": the settle's own teardown (clearAges, and
  // the voyage rearm's raf cancel) runs synchronously with the innerHTML swap, so
  // no raf can tick over dead DOM with or without this (guard-prover verified).
  // pauseScrub rather than a bare raf cancel, so a sweep interrupted by a read is
  // PARKED (playing flag, Play label) even if the draw then fails; it never fires
  // onPark, so nothing writes the address mid-draft.
  lc.pauseScrub();
  lc.cancelVoyageRaf();
  // The chart number IS the seed, so the counter always shows the world on screen;
  // a visitor reads the next number over whatever the last draw left behind.
  colophon.seedInput.value = String(seed);
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
      if (myGen !== drawGen) return; // a newer draw superseded this one
      // res.svg is engine-rendered markup, not user content: the only inputs are the
      // uint32 seed and recipe params validated against fixed allowlists in applyHash,
      // the same trusted-string injection the Explorer and Print Room already do.
      frame.host.mapEl.innerHTML = res.svg;
      lc.buildPlaceOverlay(res.manifest);
      startArrival(frame.host.mapEl.querySelector("svg"));
      lastTitle = res.title;
      shownSeed = seed;
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
      // #318: every draw here is a fresh ARRIVAL, never the Explorer's redraw of the
      // world on screen, so drop any prior session before arming. Without this a
      // re-arm adopts the interrupted CHAMBER's rest (the #220 Explorer rule), so a
      // read mid-play landed at the survey rest instead of the present park the #221
      // ratification owes every path (caught by e2e RR22). clearAges is the
      // post-wipe teardown: the old chart DOM already left with the innerHTML swap.
      lc.clearAges();
      lc.rearmAges(res.manifest, res.survey, seed, res.subtitle, { rest });
      // #321: the arrival unfurl, first settle only, added AFTER the arm so the panel
      // is visible when the animation starts (see the flag's comment above).
      if (!arrived) {
        arrived = true;
        frame.root.classList.add("rf-arrival");
      }
      frame.host.statusEl.textContent = "";
      // Converge the address after the arm, so a bare visit's URL immediately carries
      // the world it landed on (agesState knows the parked rest by now).
      syncHash();
    })
    .catch((err) => {
      if (myGen !== drawGen) return;
      // The previous world is still on screen with its instrument armed: converge
      // the module state back onto it, or the next park would serialize the failed
      // seed against the old world's rest into a shareable wrong address.
      seed = shownSeed;
      colophon.seedInput.value = String(shownSeed);
      frame.host.statusEl.textContent = "The cartographer spilled the ink: " + err.message;
    });
}

// #318 the colophon's read (the conductor owns wiring, the furniture module owns
// none). Number(...) >>> 0 is the Print Room's exact boundary shape: a uint32 or 0.
// The carried recipe params ride along untouched: a counter draw changes the seed,
// not the dress.
function readSeed(): void {
  // A counter gesture retires any unconsumed deep-link key. Without this, a read
  // that supersedes the boot draft adopts the link's rest for the NEW world (the
  // superseded settle bails at the gen guard before consuming the one-shot).
  // Boot-only means boot-only; e2e RR23 pins the race.
  pendingLive = null;
  seed = Number(colophon.seedInput.value) >>> 0;
  draw();
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
// #320: published whole, not narrowed. The room is the host that now carries the
// live-animation coverage, so its hook owes the same read the Explorer's does. Kept
// under its own name ALONGSIDE the shared surface below because RR4/RR6/RR7/RR8/RR18/
// RR22/RR23 already read it: this sub adds coverage and weakens none. Both names are
// the same function object, so they cannot disagree.
window.__vellumReadingRoomAges = lc.agesState;
// The seams every LivingChart host publishes, so the live-animation checks re-hosted
// here read the same hook names they read on the Explorer (#320 decision B).
installHostHooks({ livingChart: lc, runInline });
if (!usesWorker()) warning.hidden = false;

applyHash();
shownSeed = seed; // a boot failure rolls back to the boot world itself
draw();
// The colophon arms only once the boot draft is underway: wired after the first
// draw() so a click can never reach a worker still shaking hands (it would render
// inline on the main thread only to be discarded by the boot draft's supersession).
colophon.readBtn.addEventListener("click", readSeed);
colophon.seedInput.addEventListener("keydown", (e) => { if (e.key === "Enter") readSeed(); });
colophon.diceBtn.addEventListener("click", () => {
  colophon.seedInput.value = String(Math.floor(Math.random() * 0xffffffff));
  readSeed();
});
