// Explorer UI conductor. Wires the controls to the render worker (via worker-client),
// runs draw(), and keeps the URL hash in sync. The heavy world-gen + SVG render runs
// off the main thread; the animated machinery lives in the living-chart ENGINE
// (src/site/living-chart/, host-agnostic since #191) and the Glass cluster (glass.ts),
// and this file is the glue: DOM refs, the draw race guard, the ceremony arbitration
// (turn vs settle vs flip, chronicle vs voyage), and the bootstrap. The plain control
// plumbing is wired by controls.ts; the window.__vellum* seams by hooks.ts. Listeners
// attach at module-eval time (module scripts are deferred, so the DOM is parsed first).
import { runJob, runInline, usesWorker, initWorker } from "./worker-client.ts";
import { shouldTurn, runTurn, cancelTurn, turnTiming } from "./sheet-turn.ts";
import { toggleFlip, isFlipped, rebuildVerso, paintVersoTrack, clearVersoTrack } from "./verso.ts";
import { sliderToLand, updateLandReadout, syncAutoSlider } from "./sea-level.ts";
import { sliderToCoast, updateCoastReadout, parkCoastDefault } from "./coast-warp.ts";
import { startArrival } from "./draw-ceremony.ts";
import { readHash, writeHash } from "./hash-sync.ts";
import { createGlass } from "./glass.ts";
import { wireControls } from "./controls.ts";
import { installExplorerHooks } from "./hooks.ts";
import { createLivingChart } from "../living-chart/index.ts";
import { seedForDate } from "../../world/seed-of-the-day.ts";
import type { PlaceManifest } from "../../render/place-manifest.ts";
import type { Survey } from "../../render/survey.ts";
import type { MapType } from "../../terrain/heightfield.ts";
import type { ClimateBand } from "../../climate/climate.ts";
import type { StyleName } from "../../render/style.ts";
import type { ThemeName } from "../../render/layers/field.ts";
import type { Camera } from "./camera.ts";

const $ = <T extends HTMLElement = HTMLElement>(id: string): T => document.getElementById(id) as T;
const seedInput = $<HTMLInputElement>("seed");
const styleSel = $<HTMLSelectElement>("style");
const typeSel = $<HTMLSelectElement>("type");
const bandSel = $<HTMLSelectElement>("band");
const themeSel = $<HTMLSelectElement>("theme");
const legendChk = $<HTMLInputElement>("legend");
const armsChk = $<HTMLInputElement>("arms");
const landSlider = $<HTMLInputElement>("land");
const coastSlider = $<HTMLInputElement>("coast");
const status = $("status");
const mapDiv = $("map");
const mapViewport = $("map-viewport"); // #164: the zoom clipping/gesture box wrapping #map
const sheetEl = $("sheet");
const innerEl = $("sheet-inner");
const caption = $("caption");
const versoEl = $("verso");
const versoBtn = $<HTMLButtonElement>("verso-turn");
const chronicleChk = $<HTMLInputElement>("chronicle");
const voyageChk = $<HTMLInputElement>("voyage");
const orderLink = $<HTMLAnchorElement>("order-plates"); // #133: "Take to the Print Room", href kept current in draw()

// #183: the controls readHash/writeHash (hash-sync.ts) mirror to and from location.hash.
const hashControls = { seedInput, styleSel, typeSel, bandSel, themeSel, legendChk, armsChk, landSlider, coastSlider };

let lastSvg = "";
let lastTitle = "";
let lastSubtitle = "";
let lastSeed = 0;
let lastManifest: PlaceManifest | null = null; // the place manifest of the chart on screen; feeds a voyage toggled on without a redraw
// #120: the same chart's world facts (land mask + roads), which the voyage router walks.
// Assigned beside lastManifest, from the SAME draw: a manifest paired with another draw's
// survey would route this world's ports over that world's roads.
let lastSurvey: Survey | null = null;

// #55/#137: the slider gates, shared BY REFERENCE with controls.ts (its handlers set
// them, draw()/syncHash read them). Until touched, a draw is the natural world.
const touched = { land: false, coast: false };

// #165: a deep link's camera (cx/cy/k), stashed at bootstrap and applied ONCE, on the
// first chart to land (the viewport must exist to convert uv -> transform). Strictly
// one-shot: draw() rebases home at its top and every draw re-runs syncZoom, so a camera
// left live here would re-frame the user on every subsequent Draw. Nulled the moment it
// is applied.
let pendingCamera: Camera | null = null;

// Monotonic guard. drawGen is bumped by every draw; a draw's own result checks it,
// so a fresh draw cancels a stale one (the chart that lands must always be the
// latest requested).
let drawGen = 0;
// True while a draw's result is still in flight. Its one remaining reader is the
// verso flip guard below: belt-and-suspenders, since the Turn button is already
// `.disabled` for the whole draw round-trip, so this only makes that guard explicit.
let drawing = false;

function prefersReduce(): boolean {
  return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}

// The living-chart engine (#191): cards + chronicle + voyage behind one host-agnostic
// boundary. This conductor is the Explorer host: it hands its elements in, and mirrors
// the resting voyage track onto the verso back face (#174) through the sink.
const lc = createLivingChart({
  mapEl: mapDiv,
  statusEl: status,
  scrubber: {
    panel: $("scrubber"),
    playBtn: $<HTMLButtonElement>("scrub-play"),
    range: $<HTMLInputElement>("scrub-range"),
    year: $("scrub-year"),
    strip: $("chronicle-strip"),
  },
  voyageLog: { panel: $("voyage-log"), sig: $("voyage-log-sig"), strip: $("voyage-log-strip") },
  restingTrackSink: {
    paint: (points, viewBox) => paintVersoTrack(versoEl, points, viewBox),
    clear: () => clearVersoTrack(versoEl),
  },
});

// #169: the redraft test seam, ON by default (production); hooks.ts exposes the setter.
let redraftEnabled = true;
// #169: whether a settle should redraft. Semantic LOD is antique-only (the epic's ratified
// decision); geometric zoom on the other three styles just writes the hash. Off while the
// chronicle, the voyage, or the verso owns the sheet, and until a chart exists. Voyage is
// excluded for the same reason as the chronicle: its track is a WORLD-survey overlay (world
// coordinates, world roads), so a finer regional survey under it would carry a track that no
// longer follows the roads it describes.
function regionEligible(): boolean {
  return redraftEnabled && styleSel.value === "antique" && !chronicleChk.checked && !voyageChk.checked && !isFlipped(sheetEl) && !!lastSvg;
}
// #165/#169: the ONE hash writer. Every trigger funnels through here so the hash carries
// the complete current state, camera included. The camera is world-relative at every band,
// so it writes straight into the hash; writeHash drops cx/cy/k when the camera is home.
function syncHash(): void {
  writeHash(hashControls, touched.land, touched.coast, glass.cameraNow());
}

const glass = createGlass({
  mapViewport,
  mapDiv,
  runJob,
  buildPlaceOverlay: lc.buildPlaceOverlay,
  setCaption: (t) => { caption.textContent = t; },
  prefersReduce,
  regionEligible,
  syncHash,
  buttons: { zoomIn: $("zoom-in"), zoomOut: $("zoom-out"), reset: $("zoom-reset"), cluster: $("zoom-controls") },
});

// opts.quiet suppresses the arrival ceremony, used only by the sea-level drag's
// throttled mid-drag redraws, so the coastline does not perpetually redraw itself
// while the slider moves. The release (change) redraw runs the full ceremony.
function draw(opts?: { quiet?: boolean; turn?: boolean }): void {
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
  // #165 reset policy: any world-sheet-changing action snaps the camera home FIRST, before
  // its own ceremony. rebase() (not reset()) because the chart under the camera is being
  // replaced: it drops the transform to home with no spurious settle, so this draw's own
  // syncHash below is the authoritative hash write (home => cx/cy/k dropped). Sea-level and
  // coast drags run through draw(), so they are covered here for free.
  glass.rebase();
  glass.cancelRedraft(); // #169: drop any in-flight redraft; a fresh world is being drawn
  drawing = true;
  lc.cancelScrubRaf(); // a redraw is about to wipe the overlay; stop any running sweep
  lc.cancelVoyageRaf(); // #119: likewise stop a running voyage sweep before the wipe
  versoBtn.disabled = true; // #116: no flip mid-draw; re-enabled when the draw resolves
  status.textContent = "Drafting…";
  caption.textContent = "";
  syncHash();
  // #133: writeHash just set location.hash to this world; carry it to the Print Room
  // link so "Take to the Print Room" (and a copied link / middle-click) always opens
  // the CURRENT world, never the one from page load.
  if (orderLink) orderLink.href = "../print-room/" + (location.hash || "");
  const overrides: { mapType?: MapType; band?: ClimateBand; landFraction?: number; coastWarp?: number } = {};
  if (typeSel.value) overrides.mapType = typeSel.value as MapType;
  if (bandSel.value) overrides.band = bandSel.value as ClimateBand;
  if (touched.land) overrides.landFraction = sliderToLand(landSlider.value);
  else syncAutoSlider(seed, overrides);
  updateLandReadout();
  // #137: coast warp is additive and independent of the waterline. Touched sends the
  // override; untouched re-parks the slider at the natural 0.55 (mirroring
  // syncAutoSlider), so the slider position always matches the world on screen.
  if (touched.coast) overrides.coastWarp = sliderToCoast(coastSlider.value);
  else parkCoastDefault();
  updateCoastReadout();
  const style = styleSel.value as StyleName;
  const theme = themeSel.value as ThemeName | "";
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
          lc.buildPlaceOverlay(res.manifest);
          if (chronicleChk.checked) lc.applyScrub();
          else lc.clearScrub();
          // #119: re-arm the voyage to the new chart, resting on the full track (only
          // an explicit toggle-on animates the sweep). Mutually exclusive with chronicle.
          if (voyageChk.checked) lc.rearmVoyage(res.manifest, res.survey, seed, res.subtitle, { quiet });
          else lc.clearVoyage();
          glass.syncZoom(); // #164/#165: attach the zoom to the just-landed chart (every style)
          // #169: record the (re-dressed) world sheet so a settle can redraft over it.
          glass.setWorld({ seed, overrides, render: { style, widthPx: 1500, legend, arms, theme: theme || undefined }, manifest: res.manifest });
        });
      } else {
        // Settle (#127): inject the chart and run the arrival ceremony (unless this is
        // a quiet mid-drag redraw). Order preserved from the pre-#131 path. When
        // flipped, this updates the hidden recto beneath the verso (the ceremony runs
        // out of sight); the visible verso is refreshed by rebuildVerso below.
        mapDiv.innerHTML = res.svg;
        lc.buildPlaceOverlay(res.manifest); // #53: marks + card, appended after innerHTML wipes #map
        if (!quiet) startArrival(mapDiv.querySelector("svg")); // #127: the arrival ceremony
        // #54: if the chronicle toggle is on, re-apply the scrubber to THIS new world
        // (fresh manifest, range, layers); applyScrub hides the just-rendered layers
        // synchronously, so there is no flash of the present-day chart.
        if (chronicleChk.checked) lc.applyScrub();
        else lc.clearScrub();
        // #119: re-arm the voyage to the new chart, resting on the full track (only
        // an explicit toggle-on animates the sweep). Mutually exclusive with chronicle.
        // #174: `quiet` rides along so a mid-drag re-arm leaves the back face alone; the
        // verso's ghost and its track must always come from the same draw.
        // #120: re-arm from THIS draw's survey, never lastSurvey. A sea-level drag moves the
        // waterline, so the roads and open water the router walks moved with it.
        if (voyageChk.checked) lc.rearmVoyage(res.manifest, res.survey, seed, res.subtitle, { quiet });
        else lc.clearVoyage();
        glass.syncZoom(); // #164/#165: attach the zoom to the just-drawn chart (every style)
        // #169: record this world sheet BEFORE a deep-link camera is applied, so the settle
        // that camera triggers can redraft a region over the SAME base world (cache hit).
        glass.setWorld({ seed, overrides, render: { style, widthPx: 1500, legend, arms, theme: theme || undefined }, manifest: res.manifest });
        // #165: restore a deep link's camera once the first chart (and so the viewport) is
        // up. One-shot: consumed and nulled so no later Draw re-frames. applyCamera clamps,
        // so a centre that would pull an edge past the viewport at that zoom stays in bounds.
        if (pendingCamera) {
          const cam = pendingCamera;
          pendingCamera = null;
          glass.applyCamera(cam);
        }
      }
      // #116: refresh the back face for the chart just drawn. Skipped on quiet mid-
      // drag redraws (like the arrival ceremony) so a sea-level drag does not churn an
      // invisible verso Blob every frame; the release's non-quiet draw rebuilds it.
      // #174: renderVerso's replaceChildren WIPES the verso's voyage track, exactly as
      // mapDiv.innerHTML wipes the recto overlay above, so repaint it on the far side of
      // the wipe. syncRestingTrack is silent (safe inside this settle) and a no-op with no
      // voyage. In the settle path the voyage was re-armed just above, so it paints the new
      // world. In the TURN path the re-arm is still ~900ms out, so this paints the outgoing
      // session: harmless, because only styleSel turns and a style turn re-dresses the SAME
      // world, making those points identical to the ones the landing re-arm will paint.
      // Both invariants (turn => same world, turn => never flipped) are pinned by e2e W16.
      if (!quiet) {
        rebuildVerso(versoEl, res, seed);
        lc.syncRestingTrack();
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
      lc.pauseScrub();
      status.textContent = "The cartographer spilled the ink: " + err.message;
    });
}

// The plain control plumbing (Draw/random/Download, seed Enter, selects, sliders, the
// scrubber's Play + range, the doc-level card dismiss) lives in controls.ts; this
// conductor keeps the handlers that arbitrate ceremonies below.
wireControls({
  seedInput, styleSel, typeSel, bandSel, themeSel, legendChk, armsChk, landSlider, coastSlider,
  drawBtn: $("draw"), randomBtn: $("random"), downloadBtn: $("download"),
  scrubPlayBtn: $("scrub-play"), scrubRangeEl: $("scrub-range"),
  touched, draw,
  committedRegion: () => glass.committedRegion(),
  lastChart: () => ({ svg: lastSvg, title: lastTitle }),
  togglePlay: lc.togglePlay, onManualScrub: lc.onManualScrub,
  onDocKeydown: lc.onDocKeydown, onDocClick: lc.onDocClick,
});

// #116: turn the sheet over to read its back, or turn it back. Guarded so the flip
// never starts mid-draw (the verso is being rebuilt) or mid-#131-turn (the turn owns
// #sheet-inner's rotateY); the button is also disabled for the whole draw round-trip.
versoBtn.addEventListener("click", () => {
  if (!lastSvg || drawing || sheetEl.classList.contains("turning")) return;
  // #165 reset policy: the flip snaps the camera home FIRST, so the sheet turns over at
  // k=1 rather than mid-magnification (the flip and the zoom share no transform, but a
  // zoomed sheet flipping reads wrong). Unlike draw()'s rebase(), reset() is right here:
  // the SAME chart stays, we only re-home it. syncHash writes the now-home hash EXPLICITLY
  // rather than trusting reset()'s debounced settle, so a link copied right after the flip
  // never carries a stale cx/cy/k. reset() is a no-op when already home (turning back).
  glass.homeToWorld(); // #169: drop a committed region inset before the flip
  glass.reset();
  syncHash();
  // #174: interaction interrupts the animation. A running sweep (10-16s measured, #185)
  // is snapped to its resting track (on both faces) before the sheet turns, so the back
  // never shows a half-drawn survey and no rAF loop narrates into #status behind a
  // hidden face. The button is deliberately NOT disabled for the sweep: a control that
  // goes dead for many seconds with no stated reason reads as a bug.
  // #180: the chronicle scrubber is the same class as the voyage track. It mutates the
  // baked recto (per-glyph display) that the <img> ghost cannot mirror, so instead of
  // painting the back face we snap the scrubber to the present before turning: the parked
  // recto then IS the chart the pristine ghost holds, so the two faces agree by construction.
  // Both snaps no-op when their feature is off, and chronicle and voyage are mutually
  // exclusive, so at most one fires.
  lc.voyageSnapToRest();
  lc.scrubSnapToPresent();
  const flipped = toggleFlip(sheetEl);
  versoBtn.textContent = flipped ? "Turn back" : "Turn the sheet";
});

// Chronicle scrubber (#54): the toggle enters/leaves scrub mode without a redraw
// (no re-roll). A manual drag pauses Play; both live in controls.ts wiring.
chronicleChk.addEventListener("change", () => {
  if (chronicleChk.checked) {
    // #165 reset policy: entering the chronicle snaps the camera home first (zoom and the
    // scrubber are mutually exclusive per the epic; the scrub reveals baked layers on the
    // home sheet). Explicit syncHash for the same reason as the verso flip: drop cx/cy/k
    // now, not on a debounced settle. Leaving the chronicle needs no reset (already home).
    // #169: the scrubber drives the WORLD chart's baked layers (a region carries no
    // chronicle), so drop a committed region inset first.
    glass.homeToWorld();
    glass.reset();
    syncHash();
    // #119: chronicle and voyage are mutually exclusive; entering one leaves the other.
    if (voyageChk.checked) { voyageChk.checked = false; lc.exitVoyage(); }
    lc.applyScrub();
  } else lc.exitScrub();
});

// #119 The Wayfarer's Passage: the toggle enters/leaves voyage mode without a redraw
// (no re-roll), animating the survey track over the current world; it is mutually
// exclusive with the chronicle scrubber (both own the same overlay substrate).
voyageChk.addEventListener("change", () => {
  if (voyageChk.checked) {
    if (chronicleChk.checked) { chronicleChk.checked = false; lc.exitScrub(); }
    // #169: the voyage narrates the WORLD survey (lastManifest/lastSurvey), so a committed
    // region inset must drop first or the world-scale track would paint over the finer sheet.
    // Unlike the chronicle, the camera is NOT reset: voyage + geometric zoom were always
    // compatible, and regionEligible above keeps the sheet geometric while the voyage is on.
    glass.homeToWorld();
    // #174: the sweep is a recto ceremony. Ticking voyage while the sheet rests on its
    // verso paints the resting track on both faces and skips the animation, following the
    // precedent above where a style change while flipped rebuilds in place rather than
    // turning. The checkbox is never disabled while flipped, for the same reason the Turn
    // button is never disabled by a sweep.
    lc.applyVoyage(lastManifest, lastSurvey, lastSeed, lastSubtitle, { skipSweep: isFlipped(sheetEl) });
  } else lc.exitVoyage();
});

await initWorker();
installExplorerHooks({
  livingChart: lc, glass, usesWorker, runJob, runInline,
  setRedraftEnabled: (v) => { redraftEnabled = !!v; },
});

// A bare visit (no seed in the hash) lands on today's seed-of-the-day (UTC), the same
// default world the Print Room and the Today page use. readHash overrides it only when
// the link actually carries a seed (it presence-gates the key, so it no longer clobbers
// this default down to seed 0).
seedInput.value = String(seedForDate(new Date()));
const hashed = readHash(hashControls);
if (hashed.land) touched.land = true;
if (hashed.coast) touched.coast = true; // #137: a shared coast= link opens warped
// #165: stash a deep link's camera BEFORE draw() (draw's own syncHash rewrites the hash to
// home, so it must be read first). It is applied once the first chart lands (settle branch).
pendingCamera = hashed.camera;
draw();
