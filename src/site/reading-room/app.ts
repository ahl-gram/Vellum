// The Reading Room conductor (#221): takes a world from the URL hash (read ONCE at boot,
// no hashchange listener), draws it through the SHARED render worker, and mounts the
// reading frame (#219) driving the fused ages instrument (#220). The room is ALWAYS
// armed, and arrival is at rest on every path (ratified 2026-07-29 on #221); since #418
// that arrival COMPLETES one travel order later than the chart on an uncached world.
// #463: a chart room on the #462 pattern. The frame still builds its parts; seatFrame
// moves the chart into the stage's fitted sheet (the Glass's gesture box), the instrument
// onto the bottom strip and the journal into the slip, the last two INSIDE the panel the
// engine hides, so #220's teardown reaches them unchanged.
import { runJob, runInline, usesWorker, initWorker, type DrawResult } from "../explorer/worker-client.ts";
import { installHostHooks } from "../shared/host-hooks.ts";
import { startArrival } from "../explorer/draw-ceremony.ts";
import { afterNextPaint } from "../explorer/survey-arm.ts";
import { createTourOrder } from "../explorer/tour-order.ts";
import { createRoomArm } from "./arm.ts";
import { createProspectStage } from "./prospect-stage.ts";
import { storyBeats, type StoryBeat } from "./beats.ts";
import { armsBearing, plateForTold, plateSpecsFor, surveyPlateRows, type PlateSpec } from "./told-plate.ts";
import { plateDressFor } from "../explorer/prospect-job.ts";
import { seedForDate } from "../../world/seed-of-the-day.ts";
import { parseLive, emitLive, finalizeHash, liveNow, type Live } from "../explorer/address.ts";
import { createReadingFrame } from "../reading-frame/index.ts";
import { bindReadingRoom, drawScale, seatFrame, writeFolio } from "./seats.ts";
import { createLivingChart, type AgesPos, type LivingChart, type ToldEntry } from "../living-chart/index.ts";
import type { MapType } from "../../terrain/heightfield.ts";
import type { ClimateBand } from "../../climate/climate.ts";
import type { StyleName } from "../../render/style.ts";
import type { ThemeName } from "../../render/layers/field.ts";

// #320: the ages hook is typed as the engine's own ReturnType, so tsc breaks this file if the hook ever grows, loses a member, or silently narrows again.
declare global {
  interface Window {
    __vellumReadingRoomUsesWorker?: typeof usesWorker;
    __vellumReadingRoomState?: () => { seed: number; title: string };
    __vellumReadingRoomAges?: LivingChart["agesState"];
  }
}

// Boundary discipline: allowlists mirrored from the Explorer's <select> values; unknown keys (an Explorer link's cx/cy/k camera) are ignored, not errors.
const STYLES = ["antique", "topographic", "ink", "nautical"];
const TYPES = ["island", "archipelago", "continent", "citystate"];
const BANDS = ["temperate", "tropical", "polar"];
const THEMES = ["vegetation", "climate", "moisture", "population"];

const $ = (id: string): HTMLElement => document.getElementById(id) as HTMLElement;
const q = <T extends HTMLElement = HTMLElement>(sel: string): T => document.querySelector<T>(sel) as T;
const mount = $("rr-mount");
const warning = $("rr-warning");
// #318's colophon, re-seated as the folio's one control (#462 ruling 2): the page carries the row, the classes stay the suites' handles.
const seedInput = q<HTMLInputElement>(".rr-colophon input");
const diceBtn = q<HTMLButtonElement>(".rr-dice");
const readBtn = q<HTMLButtonElement>(".rr-read");
const furniture = {
  stage: q(".stage"), sheet: $("sheet"), viewport: $("map-viewport"), strip: q(".strip"), scale: q(".scale"),
  slip: $("journal"), tab: q(".slip-tab"), journalDock: q(".journal-dock"), folioTitle: $("folio-title"), folioSub: $("folio-sub"),
};

// Roughly 3x the slowest matrix measured on CI (2.1s), against the Explorer's 20s: the instrument IS this surface, so a dead worker must not hold the unfurl back for twenty seconds, and a timeout costs a main-thread block, never a different itinerary (voyage-session.ts orderItinerary computes the SAME order inline).
const ROOM_TOUR_TIMEOUT_MS = 6000;

// onPark is #192's seam: Play's parks are the one rest no input event announces; onAgesTold is #402's, widened at #442 to the entry the story is telling in EITHER half.
const frame = createReadingFrame(mount, { onPark: () => syncHash(), onAgesTold: (t) => onTold(t) });
const tourOrder = createTourOrder({ runJob, timeoutMs: ROOM_TOUR_TIMEOUT_MS });
const lc = createLivingChart({ ...frame.host, tourOrder });
// #402 the stage nests INSIDE the panel between the bar and the journal (ruled 2026-08-22: the scrubber and the plate share a screen), inheriting the panel's hidden teardowns on purpose; #318's colophon stays the panel's SIBLING because it must stand through them.
const stage = createProspectStage();
seatFrame(frame, stage, furniture);
const { room, rebase } = bindReadingRoom(frame, furniture);

let seed = 0;
// The seed of the world actually ON SCREEN, advanced only by a successful settle: the rollback target when a counter draw fails.
let shownSeed = 0;
let style: StyleName = "antique";
let lastTitle = "";
// The last draw that SETTLED, so a failure can restore the instrument for the world still on screen.
let lastRes: DrawResult | null = null;
// #192/#220: a deep link's live key, one-shot; it becomes the arm's rest on the first draw, and liveNow reads it so an early sync cannot drop the address.
let pendingLive: Live | null = null;

// Recipe params with no visible control here: they ride along from a deep link and re-serialize on every sync, so the URL stays a shareable link for all three surfaces.
const carried: {
  type: MapType | "";
  band: ClimateBand | "";
  theme: ThemeName | "";
  legend: boolean;
  arms: boolean;
  beasts: boolean;
  land: number | null;
  coast: number | null;
} = { type: "", band: "", theme: "", legend: true, arms: false, beasts: false, land: null, coast: null };

function applyHash(): void {
  const p = new URLSearchParams(location.hash.slice(1));
  const seedRaw = p.get("seed");
  const s = Number(seedRaw);
  // Gate on PRESENCE, not just validity: Number(null) === 0 would pass the integer guard and silently pin every bare visit to seed 0.
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
  const beasts = p.get("beasts");
  if (beasts !== null) carried.beasts = beasts === "1";
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
  pendingLive = parseLive(p);
}

// #402 the plate's way in: canonical recipe keys (the room owns this writer, no verbatim rule) plus the plate's own settlement and year, so the page opens on exactly the engraving shown.
function prospectHrefFor(forSeed: number, b: PlateSpec): string {
  const p = new URLSearchParams();
  p.set("seed", String(forSeed));
  p.set("style", style);
  if (carried.type) p.set("type", carried.type);
  if (carried.band) p.set("band", carried.band);
  if (carried.land != null) p.set("land", String(Math.round(carried.land * 1000)));
  if (carried.coast != null) p.set("coast", String(Math.round(carried.coast * 100)));
  p.set("i", String(b.index));
  p.set("year", String(b.year));
  return "/prospect/#" + p.toString();
}

// The one hash writer: recipe plus the live key, in the Explorer's exact format, so a copied link opens the same world at the same rest in any surface.
function syncHash(): void {
  const p = new URLSearchParams();
  p.set("seed", String(seed));
  p.set("style", style);
  if (carried.type) p.set("type", carried.type);
  if (carried.band) p.set("band", carried.band);
  if (carried.theme) p.set("theme", carried.theme);
  p.set("legend", carried.legend ? "1" : "0");
  p.set("arms", carried.arms ? "1" : "0");
  p.set("beasts", carried.beasts ? "1" : "0");
  if (carried.land != null) p.set("land", String(Math.round(carried.land * 1000)));
  if (carried.coast != null) p.set("coast", String(Math.round(carried.coast * 100)));
  const a = lc.agesState();
  // ages is unconditionally true: the room's instrument is always armed, the page equivalent of the Explorer's ticked checkbox.
  emitLive(p, liveNow({ ages: true, chamber: a?.chamber ?? null, year: a?.year, pending: pendingLive }));
  history.replaceState(null, "", "#" + finalizeHash(p));
}

// #442 the plate's world, bound in lockstep with lastRes. hasArms is the capital-or-seat
// test finished.ts draws by, and PlaceMark carries the two halves separately: realm seats
// are indices, so a kind-only read would miss every one of them.
interface RoomPlates {
  readonly beats: ReadonlyArray<StoryBeat>;
  readonly hasArms: (index: number) => boolean;
  readonly presentYear: number;
}
let plates: RoomPlates | null = null;
// The survey half's per-row plates, memoized: they need the TRAVEL order, which exists only once the instrument has armed.
let surveyRows: ReadonlyArray<PlateSpec | null> | null = null;
// #442 ruled 2026-08-22: a plain visit opens with NO plate. A deep link of either kind is the reader asking for a moment, so it arms on arrival; otherwise Play or a slider move does.
let plateArmed = false;

// voyageLog() is the engine's own row list, in travel order, already on the 34-name surface: nothing here recomputes an itinerary the engine has already decided.
function rowsForSurvey(): ReadonlyArray<PlateSpec | null> {
  if (surveyRows) return surveyRows;
  if (!plates) return [];
  const log = lc.voyageLog();
  if (!log) return [];
  surveyRows = surveyPlateRows(log.entries.map((e) => e.idx), plates.hasArms, plates.presentYear);
  return surveyRows;
}

// The ONE told handler: the live row mirrors every entry, the plate waits for the gesture.
function onTold(told: ToldEntry | null): void {
  frame.setTold(told);
  stage.show(plateArmed && plates ? plateForTold(told, plates.beats, rowsForSurvey()) : null);
}

// A reader's own gesture arms the plate; the paint it triggers is what reveals one.
function armPlate(): void {
  plateArmed = true;
}

let drawGen = 0;
const roomArm = createRoomArm({ afterPaint: afterNextPaint, worldGen: () => drawGen });

// #321: the arrival unfurl runs ONCE per visit, retired by CLASS REMOVAL the moment nothing is unfurling: display:none terminates a CSS animation and restoring display starts it AFRESH, so a class left in place would replay the unfurl as a flash on every dice roll (e2e RS28).
// Chrome has never implemented animationcancel (a Blink gap), so a mid-ceremony hidden toggle fires no event there; draw() retires the class deterministically at its top, and the cancel listener stays for engines that do fire it.
let arrived = false;
const retireArrival = (e: AnimationEvent): void => {
  if (e.animationName !== "paperUnfurl") return;
  const unfurling = frame.root
    .getAnimations({ subtree: true })
    .some((a) => a.playState === "running" && (a as CSSAnimation).animationName === "paperUnfurl");
  if (unfurling) return;
  frame.root.classList.remove("rf-arrival");
  frame.root.removeEventListener("animationend", retireArrival);
  frame.root.removeEventListener("animationcancel", retireArrival);
};
frame.root.addEventListener("animationend", retireArrival);
frame.root.addEventListener("animationcancel", retireArrival);

// The carried recipe as the engine's override bag: only the keys a link actually pinned, so an unpinned dial stays the world's own.
function recipeOverrides(): { mapType?: MapType; band?: ClimateBand; landFraction?: number; coastWarp?: number } {
  return {
    ...(carried.type ? { mapType: carried.type } : {}),
    ...(carried.band ? { band: carried.band } : {}),
    ...(carried.land != null ? { landFraction: carried.land } : {}),
    ...(carried.coast != null ? { coastWarp: carried.coast } : {}),
  };
}

// #221: a deep link's key becomes the arm's rest, one-shot, and it reaches the instrument through rearmAges rather than applyAges (a restored link is a photograph, not an arming gesture).
function restFor(live: Live | null): AgesPos | undefined {
  if (live?.kind === "year") return { chamber: "ages", year: live.year };
  if (live?.kind === "survey") return { chamber: "survey", t: 1 };
  return undefined;
}

// The arm and the ceremony it carries, run once the travel order is in hand (#418). The quiet flag stays UNSET: quiet skips the matrix COMPUTE (not a primed answer), so it only bites when the source has nothing ready, and there it ships the straight-line tour (test/site/voyage-tour-order.test.ts).
// It does NOT write the status line: the settle path clears it after this returns and the failure path reports an error instead, so the one signal the suites gate on stays with the caller that knows which happened.
function armRoom(res: DrawResult, forSeed: number, rest: AgesPos | undefined): void {
  lc.rearmAges(res.manifest, res.survey, forSeed, res.subtitle, { rest });
  drawScale(lc, furniture.scale);
  room.layout();
  // #321: added AFTER the arm so the panel is visible when the animation starts (see the flag's comment above).
  if (!arrived) {
    arrived = true;
    frame.root.classList.add("rf-arrival");
  }
  // Converge the address after the arm, so the URL carries the rest the reader actually landed at.
  syncHash();
}

function draw(): void {
  const myGen = ++drawGen;
  // #418: every draw is a fresh ARRIVAL, so the plate goes back to bare until this world is asked for one. Held, because a draw that FAILS leaves the previous world on screen and its plate state must come back with it.
  const wasArmed = plateArmed;
  plateArmed = false;
  // pauseScrub rather than a bare raf cancel: a sweep interrupted by a read is PARKED (playing flag, Play label) even if the draw then fails, and it never fires onPark, so nothing writes the address mid-draft.
  lc.pauseScrub();
  lc.cancelVoyageRaf();
  // #321: a read supersedes the arrival ceremony and must retire the class HERE, deterministically (see retireArrival above for the Chrome gap).
  frame.root.classList.remove("rf-arrival");
  seedInput.value = String(seed);
  // #165: rebase, not reset: the chart under the camera is being replaced.
  rebase();
  frame.host.statusEl.textContent = "Drafting…";
  const overrides = recipeOverrides();
  runJob({
    kind: "draw",
    seed,
    overrides,
    render: { style, widthPx: 1500, legend: carried.legend, arms: carried.arms, beasts: carried.beasts, theme: carried.theme || undefined },
  })
    .then((res) => {
      if (myGen !== drawGen) return;
      // res.svg is engine-rendered markup, not user content: the only inputs are the uint32 seed and allowlisted recipe params, the same trusted-string injection the Explorer and Print Room do.
      frame.host.mapEl.innerHTML = res.svg;
      lc.buildPlaceOverlay(res.manifest);
      writeFolio(furniture, res, seed);
      room.layout();
      startArrival(frame.host.mapEl.querySelector("svg"));
      lastTitle = res.title;
      shownSeed = seed;
      const rest = restFor(pendingLive);
      // #442: a deep link of either kind (year=N, or a bare survey parking at the return to the capital) is a reader asking for that moment, so it shows its plate on arrival; a plain visit asked for nothing in particular and opens bare.
      const armedByLink = pendingLive !== null;
      pendingLive = null;
      lastRes = res;
      const forSeed = seed;
      // #402: the stage's world binds in lockstep with lastRes, so the failure path's re-arm can never paint one world's plate over another's chart; fetches are on demand, prefetch is the arm's step.
      const dress = plateDressFor(style);
      plates = {
        beats: storyBeats(res.manifest.events),
        hasArms: armsBearing(res.manifest.places),
        presentYear: res.manifest.presentYear,
      };
      surveyRows = null;
      stage.setWorld(
        (s) =>
          runJob({ kind: "prospect", seed: forSeed, overrides, index: s.index, dress, year: s.year })
            .then((r) => ({ svg: r.svg, name: r.name })),
        (s) => prospectHrefFor(forSeed, s),
      );
      // #318/#418: every draw is a fresh ARRIVAL, so the prior session is dropped in the task that swaps the chart, never with the deferred arm (e2e RR22 pins the drop, RR25 the timing).
      lc.clearAges();
      // #120: both halves close over THIS draw's res, never module state, so an arm landing late cannot meet another world's chart.
      roomArm.schedule({
        prime: () => tourOrder.prime(res.manifest, res.survey, forSeed),
        arm: () => {
          plateArmed = armedByLink;
          armRoom(res, forSeed, rest);
          // #442: AFTER the arm, since the survey half's plates are keyed by the travel order the arm decides. Every plate either half can reach is pulled in one step, so no reveal can stall the sweep (#311).
          stage.prefetch(plateSpecsFor(plates!.beats, rowsForSurvey()));
          frame.host.statusEl.textContent = "";
        },
      });
    })
    .catch((err) => {
      if (myGen !== drawGen) return;
      // The previous world is still on screen: converge the module state back onto it, or the next park would serialize the failed seed into a shareable wrong address.
      seed = shownSeed;
      seedInput.value = String(shownSeed);
      // #418: a read that supersedes an arm still WAITING drops that arm, so a superseding draw that then fails would leave a chart with no instrument at all and no way back (the hash is read once, at boot). Re-arm the world actually on screen, so #221's "arrival is at rest on every path" survives this path too; already armed, this is a no-op.
      // #442: the plate state converges onto the surviving world too. draw() disarmed it at the top for the world that never arrived, and this path keeps the PREVIOUS one on screen, so leaving it false would let a plate the reader asked for sit there until the next paint silently pulled it. It was armed for this world or it was not; that is what wasArmed holds.
      plateArmed = wasArmed;
      if (!lc.agesState() && lastRes) armRoom(lastRes, shownSeed, undefined);
      frame.host.statusEl.textContent = "The cartographer spilled the ink: " + err.message;
    });
}

// #318: Number(...) >>> 0 is the Print Room's exact boundary shape (a uint32 or 0); a counter draw changes the seed, not the dress.
function readSeed(): void {
  // A counter gesture retires any unconsumed deep-link key: boot-only means boot-only (e2e RR23 pins the race).
  pendingLive = null;
  seed = Number(seedInput.value) >>> 0;
  draw();
}

// #442: Play and a slider move are the two gestures that ask for a picture; the paint each one triggers is what reveals it, so nothing here forces a show.
frame.host.scrubber.playBtn.addEventListener("click", () => { armPlate(); lc.togglePlay(); });
frame.host.scrubber.range.addEventListener("input", () => { armPlate(); lc.onManualScrub(); });
frame.host.scrubber.range.addEventListener("change", syncHash);
frame.host.scrubber.range.addEventListener("pointerdown", lc.agesDragStart);
frame.host.scrubber.range.addEventListener("pointerup", lc.agesDragEnd);
frame.host.scrubber.range.addEventListener("pointercancel", lc.agesDragEnd);
document.addEventListener("keydown", lc.onDocKeydown);
document.addEventListener("click", lc.onDocClick);

await initWorker();
window.__vellumReadingRoomUsesWorker = usesWorker;
window.__vellumReadingRoomState = () => ({ seed, title: lastTitle });
// #320: published whole, never narrowed; both names below are the same function object, so they cannot disagree.
window.__vellumReadingRoomAges = lc.agesState;
installHostHooks({ livingChart: lc, runInline });
if (!usesWorker()) warning.hidden = false;

applyHash();
shownSeed = seed; // a boot failure rolls back to the boot world itself
draw();
// Wired after the first draw() so a click can never reach a worker still shaking hands.
readBtn.addEventListener("click", readSeed);
seedInput.addEventListener("keydown", (e) => { if (e.key === "Enter") readSeed(); });
diceBtn.addEventListener("click", () => {
  seedInput.value = String(Math.floor(Math.random() * 0xffffffff));
  readSeed();
});
