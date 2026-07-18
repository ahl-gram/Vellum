// Explorer UI conductor. Wires the controls to the render worker (via
// worker-client.js), runs draw(), and keeps the URL hash in sync. The heavy
// world-gen + SVG render runs off the main thread; the feature logic lives in
// sibling modules (worker-client, living-chart, sea-level) and this file is the
// glue: DOM refs, the draw race guard, the listener wiring, and the bootstrap.
// Listeners attach here at module-eval time (module scripts are deferred, so the
// DOM is parsed first). The bound atlas moved to the Print Room (#199); the
// Explorer's own "Bind as atlas" was retired now that page owns it.
import { runJob, runInline, usesWorker, initWorker } from "./worker-client.js";
import { shouldTurn, runTurn, cancelTurn } from "./sheet-turn.js";
import { toggleFlip, isFlipped, rebuildVerso } from "./verso.js";
import { sliderToLand, updateLandReadout, syncAutoSlider } from "./sea-level.js";
import { sliderToCoast, updateCoastReadout, parkCoastDefault } from "./coast-warp.js";
import { startArrival } from "./draw-ceremony.js";
import { createZoomController } from "../shared/zoom-controller.js";
import { readHash, writeHash } from "./hash-sync.js";
import { seedForDate } from "./engine/world/seed-of-the-day.js";
import {
  buildPlaceOverlay,
  applyScrub,
  exitScrub,
  clearScrub,
  cancelScrubRaf,
  pauseScrub,
  togglePlay,
  onManualScrub,
  scrubSnapToPresent,
  onDocKeydown,
  onDocClick,
} from "./living-chart.js";
import {
  applyVoyage,
  rearmVoyage,
  exitVoyage,
  clearVoyage,
  cancelVoyageRaf,
  voyageStepTo,
  voyagePaintAt,
  voyagePlan,
  voyageLog,
  voyageLegGeometry,
  voyageSnapToRest,
  syncVersoTrack,
} from "./voyage.js";

const $ = (id) => document.getElementById(id);
const seedInput = $("seed");
const styleSel = $("style");
const typeSel = $("type");
const bandSel = $("band");
const themeSel = $("theme");
const legendChk = $("legend");
const armsChk = $("arms");
const landSlider = $("land");
const coastSlider = $("coast");
const status = $("status");
const mapDiv = $("map");
const mapViewport = $("map-viewport"); // #164: the zoom clipping/gesture box wrapping #map
const sheetEl = $("sheet");
const innerEl = $("sheet-inner");
const caption = $("caption");
const versoEl = $("verso");
const versoBtn = $("verso-turn");
const chronicleChk = $("chronicle");
const voyageChk = $("voyage");
const orderLink = $("order-plates"); // #133: "Take to the Print Room", href kept current in draw()
const scrubPlayBtn = $("scrub-play");
const scrubRangeEl = $("scrub-range");

// #183: the controls readHash/writeHash (hash-sync.js) mirror to and from location.hash.
const hashControls = { seedInput, styleSel, typeSel, bandSel, themeSel, legendChk, armsChk, landSlider, coastSlider };

let lastSvg = "";
let lastTitle = "";
let lastSubtitle = "";
let lastSeed = 0;
let lastManifest = null; // the place manifest of the chart on screen; feeds a voyage toggled on without a redraw
// #120: the same chart's world facts (land mask + roads), which the voyage router walks.
// Assigned beside lastManifest, from the SAME draw: a manifest paired with another draw's
// survey would route this world's ports over that world's roads.
let lastSurvey = null;

// Sea-level slider (#55) gate. landTouched gates the manual override and the land=
// hash param; until the user moves the slider, it auto-tracks each world's natural
// waterline. landDebounce throttles the redraw during a drag.
let landTouched = false;
let landDebounce = 0;

// #137: the coast slider's gate, sibling of landTouched. False until the visitor
// moves the slider; until then draw() sends no coastWarp override and re-parks the
// slider at the natural 0.55, so an untouched draw is byte-identical to today. There
// is deliberately NO coast debounce (unlike landDebounce): every coastWarp is a
// different ~0.6s world, so the slider redraws on release only, not mid-drag.
let coastTouched = false;

// Monotonic guard. drawGen is bumped by every draw; a draw's own result checks it,
// so a fresh draw cancels a stale one (the chart that lands must always be the
// latest requested).
let drawGen = 0;
// True while a draw's result is still in flight. Its one remaining reader is the
// verso flip guard below: belt-and-suspenders, since the Turn button is already
// `.disabled` for the whole draw round-trip, so this only makes that guard explicit.
let drawing = false;

function randomSeed() {
  return Math.floor(Math.random() * 0xffffffff);
}

function prefersReduce() {
  return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}

// #131: the sheet turn's duration + easing come from /motion.css (the single timing
// source). Read lazily so the stylesheet is applied, with the ratified fallback if a
// custom property is unreadable (e.g. the stylesheet has not loaded yet).
function turnTiming() {
  const cs = getComputedStyle(document.documentElement);
  const ms = parseFloat(cs.getPropertyValue("--turn")) || 900;
  const ease = cs.getPropertyValue("--ease-turn").trim() || "cubic-bezier(0.62, 0, 0.34, 1)";
  return { ms, ease };
}

// #164 The Surveyor's Glass: geometric pan/zoom on the antique chart. The controller
// binds to the STABLE #map-viewport (never wiped by a redraw) and lands its live CSS
// transform on #map, so the chart SVG and its %-positioned overlays (place hits, cards,
// voyage track) ride one composited frame with no redraw. Antique-only in this sub:
// syncZoom() (called on every draw resolve, both the settle and the turn landing)
// attaches the gestures on antique and snaps home + detaches on any other style, so a
// non-antique chart is never left magnified. There is deliberately NO snap-home on a
// same-style redraw yet -- a redraw while zoomed stays zoomed; the camera-home policy
// for world-changing actions is Sub 4's (#165).
// #164: publish the current zoom k onto the place card (a LEAF, sibling of the chart
// svg) so the card counter-scales to a constant, readable size. It is written to the
// CARD, never to #map: a per-frame non-transform style write on #map re-rasterizes the
// baked SVG labels and makes them jiggle (only #map's `transform` may change per frame).
function setCardZoom(k) {
  const card = document.getElementById("place-card");
  if (!card) return;
  if (k === 1) card.style.removeProperty("--zoom-k");
  else card.style.setProperty("--zoom-k", String(k));
}
const zoomController = createZoomController({
  viewportEl: mapViewport,
  targetEl: mapDiv,
  scaleExtent: [1, 8],
  reducedMotion: prefersReduce(),
  onApply: (state) => setCardZoom(state.k),
});
function syncZoom() {
  if (styleSel.value === "antique") {
    zoomController.attach();
    // The overlay (and #place-card) was just rebuilt by this draw; re-publish the current
    // zoom onto the fresh card so a card shown before the next gesture is counter-scaled.
    setCardZoom(zoomController.getState().k);
  } else {
    zoomController.detach();
    zoomController.reset();
  }
}

// opts.quiet suppresses the arrival ceremony, used only by the sea-level drag's
// throttled mid-drag redraws, so the coastline does not perpetually redraw itself
// while the slider moves. The release (change) redraw runs the full ceremony.
function draw(opts) {
  const quiet = !!(opts && opts.quiet);
  const isTurn = !!(opts && opts.turn); // a style change turns the sheet (#131)
  const seed = Number(seedInput.value) >>> 0;
  const myGen = ++drawGen;
  // #131: tear down any in-flight turn NOW, synchronously, not only when this draw's
  // worker resolves. A turn's natural landing commits its chart gated on `settled`,
  // not drawGen, so a turn superseded late (a settle arriving in the last worker-
  // duration of the 900ms turn) would otherwise self-commit its stale chart and wipe
  // the overlay before this draw resolves. Aborting leaves #map's pre-turn chart and
  // overlay intact (a turn never wipes #map until it commits); runTurn cancels again.
  cancelTurn();
  drawing = true;
  cancelScrubRaf(); // a redraw is about to wipe the overlay; stop any running sweep
  cancelVoyageRaf(); // #119: likewise stop a running voyage sweep before the wipe
  versoBtn.disabled = true; // #116: no flip mid-draw; re-enabled when the draw resolves
  status.textContent = "Drafting…";
  caption.textContent = "";
  writeHash(hashControls, landTouched, coastTouched);
  // #133: writeHash just set location.hash to this world; carry it to the Print Room
  // link so "Take to the Print Room" (and a copied link / middle-click) always opens
  // the CURRENT world, never the one from page load.
  if (orderLink) orderLink.href = "../print-room/" + (location.hash || "");
  const overrides = {};
  if (typeSel.value) overrides.mapType = typeSel.value;
  if (bandSel.value) overrides.band = bandSel.value;
  if (landTouched) overrides.landFraction = sliderToLand(landSlider.value);
  else syncAutoSlider(seed, overrides);
  updateLandReadout();
  // #137: coast warp is additive and independent of the waterline. Touched sends the
  // override; untouched re-parks the slider at the natural 0.55 (mirroring
  // syncAutoSlider), so the slider position always matches the world on screen.
  if (coastTouched) overrides.coastWarp = sliderToCoast(coastSlider.value);
  else parkCoastDefault();
  updateCoastReadout();
  const style = styleSel.value;
  const theme = themeSel.value;
  const legend = legendChk.checked;
  const arms = armsChk.checked;
  // Whether this draw TURNS is decided at the swap, while the outgoing chart is still
  // on screen; capture the presence here so the closure is stable across the round-trip.
  const hadChart = !!mapDiv.querySelector("svg");
  const t0 = performance.now();
  runJob({
    kind: "draw",
    seed,
    overrides,
    render: { style, widthPx: 1500, legend, arms, theme: theme || undefined },
  })
    .then((res) => {
      if (myGen !== drawGen) return; // a newer draw superseded this one
      drawing = false;
      versoBtn.disabled = false;
      // Any prior turn was already torn down synchronously at draw() start; a turn for
      // THIS draw (if any) is created below and cancels again on its own.
      lastSvg = res.svg;
      lastTitle = res.title;
      lastSubtitle = res.subtitle;
      lastSeed = seed;
      lastManifest = res.manifest; // #119: the current world's manifest, for a voyage toggled on later
      lastSurvey = res.survey; // #120: paired with it, so a later voyage routes THIS world
      // Clear "Drafting…" and caption now, so a 900ms turn never holds the status
      // line; Download already has the new bytes (lastSvg, above).
      const ms = (performance.now() - t0).toFixed(0);
      status.textContent = "";
      caption.textContent = `${res.title} · ${res.mapType} · ${res.band} · drawn in ${ms}ms`;
      // #116: a style change while flipped to the verso rebuilds it in place (see
      // below) instead of turning; the flip and the #131 turn must never both drive
      // #sheet-inner's rotateY. flipped is read at the swap, when the state is settled.
      if (shouldTurn({ isTurn, reduceMotion: prefersReduce(), usesWorker: usesWorker(), hasChart: hadChart, chronicle: chronicleChk.checked, flipped: isFlipped(sheetEl) })) {
        // #131 The style turn: the same world in a new dress. The sheet turns over,
        // and the overlay/scrub rebuild against the new chart only after it LANDS (so
        // the marks never rebuild over the outgoing chart). The turn suppresses the
        // #127 settle ceremony: a draw is either a turn or a settle, never both.
        const t = turnTiming();
        runTurn({ sheetEl, innerEl, mapEl: mapDiv, newSvg: res.svg, durationMs: t.ms, easing: t.ease }).then(() => {
          if (myGen !== drawGen) return; // superseded while turning; the latest draw owns #map
          buildPlaceOverlay(res.manifest);
          if (chronicleChk.checked) applyScrub();
          else clearScrub();
          // #119: re-arm the voyage to the new chart, resting on the full track (only
          // an explicit toggle-on animates the sweep). Mutually exclusive with chronicle.
          if (voyageChk.checked) rearmVoyage(res.manifest, res.survey, seed, res.subtitle, { quiet });
          else clearVoyage();
          syncZoom(); // #164: attach/reset the zoom to the just-landed chart's style
        });
      } else {
        // Settle (#127): inject the chart and run the arrival ceremony (unless this is
        // a quiet mid-drag redraw). Order preserved from the pre-#131 path. When
        // flipped, this updates the hidden recto beneath the verso (the ceremony runs
        // out of sight); the visible verso is refreshed by rebuildVerso below.
        mapDiv.innerHTML = res.svg;
        buildPlaceOverlay(res.manifest); // #53: marks + card, appended after innerHTML wipes #map
        if (!quiet) startArrival(mapDiv.querySelector("svg")); // #127: the arrival ceremony
        // #54: if the chronicle toggle is on, re-apply the scrubber to THIS new world
        // (fresh manifest, range, layers); applyScrub hides the just-rendered layers
        // synchronously, so there is no flash of the present-day chart.
        if (chronicleChk.checked) applyScrub();
        else clearScrub();
        // #119: re-arm the voyage to the new chart, resting on the full track (only
        // an explicit toggle-on animates the sweep). Mutually exclusive with chronicle.
        // #174: `quiet` rides along so a mid-drag re-arm leaves the back face alone; the
        // verso's ghost and its track must always come from the same draw.
        // #120: re-arm from THIS draw's survey, never lastSurvey. A sea-level drag moves the
        // waterline, so the roads and open water the router walks moved with it.
        if (voyageChk.checked) rearmVoyage(res.manifest, res.survey, seed, res.subtitle, { quiet });
        else clearVoyage();
        syncZoom(); // #164: attach/reset the zoom to the just-drawn chart's style
      }
      // #116: refresh the back face for the chart just drawn. Skipped on quiet mid-
      // drag redraws (like the arrival ceremony) so a sea-level drag does not churn an
      // invisible verso Blob every frame; the release's non-quiet draw rebuilds it.
      // #174: renderVerso's replaceChildren WIPES the verso's voyage track, exactly as
      // mapDiv.innerHTML wipes the recto overlay above, so repaint it on the far side of
      // the wipe. syncVersoTrack is silent (safe inside this settle) and a no-op with no
      // voyage. In the settle path the voyage was re-armed just above, so it paints the new
      // world. In the TURN path the re-arm is still ~900ms out, so this paints the outgoing
      // session: harmless, because only styleSel turns and a style turn re-dresses the SAME
      // world, making those points identical to the ones the landing re-arm will paint.
      // Both invariants (turn => same world, turn => never flipped) are pinned by e2e W16.
      if (!quiet) {
        rebuildVerso(versoEl, res, seed);
        syncVersoTrack();
      }
    })
    .catch((err) => {
      if (myGen !== drawGen) return;
      drawing = false;
      versoBtn.disabled = false;
      cancelTurn(); // #131: tear down any in-flight turn on a failed redraw
      // A redraw that fails leaves the OLD overlay in place; if a sweep was running,
      // its rAF was already cancelled at draw() start, so restore the button to a
      // consistent paused state rather than a frozen "Pause" with nothing animating.
      pauseScrub();
      status.textContent = "The cartographer spilled the ink: " + err.message;
    });
}

$("draw").addEventListener("click", draw);
$("random").addEventListener("click", () => {
  seedInput.value = String(randomSeed());
  landTouched = false;
  coastTouched = false; // #137: a fresh world starts from its natural coastline
  draw();
});
$("download").addEventListener("click", () => {
  if (!lastSvg) return;
  const blob = new Blob([lastSvg], { type: "image/svg+xml" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  const slug = lastTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  a.download = `vellum-${seedInput.value}-${styleSel.value}-${slug}.svg`;
  a.click();
  URL.revokeObjectURL(a.href);
});
// #116: turn the sheet over to read its back, or turn it back. Guarded so the flip
// never starts mid-draw (the verso is being rebuilt) or mid-#131-turn (the turn owns
// #sheet-inner's rotateY); the button is also disabled for the whole draw round-trip.
versoBtn.addEventListener("click", () => {
  if (!lastSvg || drawing || sheetEl.classList.contains("turning")) return;
  // #174: interaction interrupts the animation. A running 12s sweep is snapped to its
  // resting track (on both faces) before the sheet turns, so the back never shows a
  // half-drawn survey and no rAF loop narrates into #status behind a hidden face. The
  // button is deliberately NOT disabled for the sweep's duration: the existing
  // disable-during-draw covers a sub-second round trip, and a control that goes dead for
  // 12 seconds with no stated reason reads as a bug. No-op when not voyaging.
  // #180: the chronicle scrubber is the same class as the voyage track. It mutates the
  // baked recto (per-glyph display) that the <img> ghost cannot mirror, so instead of
  // painting the back face we snap the scrubber to the present before turning: the parked
  // recto then IS the chart the pristine ghost holds, so the two faces agree by construction.
  // Both snaps no-op when their feature is off, and chronicle and voyage are mutually
  // exclusive, so at most one fires.
  voyageSnapToRest();
  scrubSnapToPresent();
  const flipped = toggleFlip(sheetEl);
  versoBtn.textContent = flipped ? "Turn back" : "Turn the sheet";
});
seedInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    landTouched = false;
    coastTouched = false; // #137: a new seed starts from its natural coastline
    draw();
  }
});
for (const sel of [bandSel, themeSel, legendChk, armsChk]) {
  sel.addEventListener("change", draw);
}
// #131: a style change re-dresses the SAME world, so it turns the sheet over rather
// than settling. Every other control draws a new/changed world and settles (#127).
styleSel.addEventListener("change", () => draw({ turn: true }));
// Changing the map type reshapes the terrain, so a manual tide (and warp) no longer
// applies: reset both to auto so the sliders re-derive from the new world.
typeSel.addEventListener("change", () => {
  landTouched = false;
  coastTouched = false; // #137: a reshaped world starts from its natural coastline
  draw();
});
// Drag: live readout + debounced redraw on input, an authoritative redraw on
// release. Both bump drawGen, so a stale in-flight frame is discarded.
landSlider.addEventListener("input", () => {
  landTouched = true;
  updateLandReadout();
  clearTimeout(landDebounce);
  // #127: the mid-drag redraws are quiet (no arrival ceremony); the release (change)
  // handler below runs the full ceremony once the tide settles.
  landDebounce = setTimeout(() => draw({ quiet: true }), 100);
});
landSlider.addEventListener("change", () => {
  landTouched = true;
  clearTimeout(landDebounce);
  draw();
});
// #137: the coast slider. Unlike sea-level (which debounces a QUIET mid-drag redraw
// because re-leveling reuses the SAME terrain), every coastWarp value is a different
// ~0.6s world, so this updates the readout live on input but redraws only on release
// (change). Both set coastTouched so the override + the coast= hash param take effect.
coastSlider.addEventListener("input", () => {
  coastTouched = true;
  updateCoastReadout();
});
coastSlider.addEventListener("change", () => {
  coastTouched = true;
  draw();
});

// Chronicle scrubber (#54): the toggle enters/leaves scrub mode without a redraw
// (no re-roll); Play/Pause runs the event-proportional sweep; a manual drag pauses
// Play and rebases it so the next Play restarts from the beginning.
chronicleChk.addEventListener("change", () => {
  if (chronicleChk.checked) {
    // #119: chronicle and voyage are mutually exclusive; entering one leaves the other.
    if (voyageChk.checked) { voyageChk.checked = false; exitVoyage(); }
    applyScrub();
  } else exitScrub();
});
scrubPlayBtn.addEventListener("click", togglePlay);
scrubRangeEl.addEventListener("input", onManualScrub);

// #119 The Wayfarer's Passage: the toggle enters/leaves voyage mode without a redraw
// (no re-roll), animating the survey track over the current world; it is mutually
// exclusive with the chronicle scrubber (both own the same overlay substrate).
voyageChk.addEventListener("change", () => {
  if (voyageChk.checked) {
    if (chronicleChk.checked) { chronicleChk.checked = false; exitScrub(); }
    // #174: the sweep is a recto ceremony. Ticking voyage while the sheet rests on its
    // verso paints the resting track on both faces and skips the animation, following the
    // precedent above where a style change while flipped rebuilds in place rather than
    // turning. The checkbox is never disabled while flipped, for the same reason the Turn
    // button is never disabled by a sweep.
    applyVoyage(lastManifest, lastSurvey, lastSeed, lastSubtitle, { skipSweep: isFlipped(sheetEl) });
  } else exitVoyage();
});

// Living Chart overlay (#53): dismiss a pinned card with Escape or a click/tap off
// any mark. Added once; both read living-chart's current overlay so they stay
// correct across redraws.
document.addEventListener("keydown", onDocKeydown);
document.addEventListener("click", onDocClick);

await initWorker();
window.__vellumUsesWorker = usesWorker;
// Verification hooks for the headless byte-identity check (harmless in prod).
window.__vellumRunJob = runJob;
window.__vellumRunInline = runInline;
// #119: deterministic voyage hooks for the e2e (drive the sweep by port, read the plan).
window.__vellumVoyageStepTo = voyageStepTo;
// #120: voyageStepTo can only land ON a port (legT = 0), so it can never sample a MID-leg
// frame, which is exactly where the tilt varies and where a switchbacking road would
// flicker the rider's facing.
window.__vellumVoyagePaintAt = voyagePaintAt;
window.__vellumVoyagePlan = voyagePlan;
window.__vellumVoyageLog = voyageLog; // #121: the margin log (entries, summary, reveal state)
window.__vellumVoyageLegGeometry = voyageLegGeometry; // #120: projected leg points, for W20b
// #164: deterministic zoom hooks for the e2e (Z1-Z4). zoomTo drives the camera through
// the same clamp a live gesture uses; zoomState reads back the settled {x,y,k}.
window.__vellumZoomTo = (t) => zoomController.zoomTo(t);
window.__vellumZoomState = () => zoomController.getState();

// A bare visit (no seed in the hash) lands on today's seed-of-the-day (UTC), the same
// default world the Print Room and the Today page use. readHash overrides it only when
// the link actually carries a seed (it presence-gates the key, so it no longer clobbers
// this default down to seed 0).
seedInput.value = String(seedForDate(new Date()));
const hashed = readHash(hashControls);
if (hashed.land) landTouched = true;
if (hashed.coast) coastTouched = true; // #137: a shared coast= link opens warped
draw();
