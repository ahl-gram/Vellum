// Explorer UI conductor. Wires the controls to the render worker (via worker-client),
// runs draw(), and keeps the URL hash in sync. The heavy world-gen + SVG render runs
// off the main thread; the animated machinery lives in the living-chart ENGINE
// (src/site/living-chart/, host-agnostic since #191) and the Glass cluster (glass.ts),
// and this file is the glue: the draw race guard, the ceremony arbitration (turn vs
// settle vs flip, chronicle vs voyage), and the bootstrap. The DOM refs live in
// elements.ts; the plain control plumbing is wired by controls.ts; the window.__vellum*
// seams by hooks.ts. Listeners attach at module-eval time (modules are deferred).
import { runJob, runInline, usesWorker, initWorker } from "./worker-client.ts";
import { shouldTurn, runTurn, cancelTurn, turnTiming } from "./sheet-turn.ts";
import { toggleFlip, isFlipped, rebuildVerso, paintVersoTrack, clearVersoTrack } from "./verso.ts";
import { sliderToLand, updateLandReadout, syncAutoSlider } from "./sea-level.ts";
import { sliderToCoast, updateCoastReadout, parkCoastDefault } from "./coast-warp.ts";
import { startArrival } from "./draw-ceremony.ts";
import { readHash, writeHash } from "./hash-sync.ts";
import { liveNow } from "./address.ts";
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
import {
  $, seedInput, styleSel, typeSel, bandSel, themeSel, legendChk, armsChk, landSlider,
  coastSlider, status, mapDiv, mapViewport, sheetEl, innerEl, caption, versoEl, versoBtn,
  agesChk, orderLink, hashControls,
} from "./elements.ts";
import type { AgesPos } from "../living-chart/index.ts";
import type { Live } from "./address.ts";

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
// #192/#220: the address's live key (bare `survey` or `year=N`), the instrument half of
// a deep link. Same one-shot discipline: rearmAges parks every draw at the present, so
// this is consumed by the first settle only (it becomes the arm's rest position);
// liveNow reads it so the address survives draw()'s early syncHash.
let pendingLive: Live | null = null;

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
    sig: $("scrub-sig"),
    strip: $("chronicle-strip"),
    onPark: () => syncHash(), // #192: Play's parks are the one un-evented rest
  },
  restingTrackSink: {
    paint: (points, viewBox) => paintVersoTrack(versoEl, points, viewBox),
    clear: () => clearVersoTrack(versoEl),
  },
});

// #169: the redraft test seam, ON by default (production); hooks.ts exposes the setter.
let redraftEnabled = true;
// #169: whether a settle should redraft. Semantic LOD is antique-only (the epic's ratified
// decision); geometric zoom on the other three styles just writes the hash. Off while the
// ages instrument or the verso owns the sheet, and until a chart exists. The instrument is
// excluded because both of its chambers drive the WORLD chart: the chronicle half reveals
// baked world layers a region does not carry, and the survey half's track is a WORLD
// overlay (world coordinates, world roads) a finer regional sheet would orphan.
function regionEligible(): boolean {
  return redraftEnabled && styleSel.value === "antique" && !agesChk.checked && !isFlipped(sheetEl) && !!lastSvg;
}
// #165/#169/#192: the ONE hash writer. Every trigger funnels through here so the hash
// carries the complete current state, camera and live address included. writeHash drops
// cx/cy/k when the camera is home and the live key when the instrument is off.
function syncHash(): void {
  const a = lc.agesState();
  writeHash(hashControls, touched.land, touched.coast, glass.cameraNow(),
    liveNow({ ages: agesChk.checked, chamber: a?.chamber ?? null, year: a?.year, pending: pendingLive }));
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
      // #220: the turn stays suppressed while the CHRONICLE half holds the sheet (its
      // per-glyph mutations cannot ride a turn); a survey-chamber rest keeps the turn,
      // preserving the voyage's pre-fusion behaviour (pinned by e2e W16).
      if (shouldTurn({ isTurn, reduceMotion: prefersReduce(), usesWorker: usesWorker(), hasChart: hadChart, chronicle: lc.agesState()?.chamber === "ages", flipped: isFlipped(sheetEl) })) {
        // #131 The style turn: the same world in a new dress. The sheet turns over,
        // and the overlay/scrub rebuild against the new chart only after it LANDS (so
        // the marks never rebuild over the outgoing chart). The turn suppresses the
        // #127 settle ceremony: a draw is either a turn or a settle, never both.
        const t = turnTiming();
        runTurn({ sheetEl, innerEl, mapEl: mapDiv, newSvg: res.svg, durationMs: t.ms, easing: t.ease }).then(() => {
          if (myGen !== drawGen) return; // superseded while turning; the latest draw owns #map
          lc.buildPlaceOverlay(res.manifest);
          // #220: re-arm the instrument to the just-landed chart, parked at the present
          // (only Play animates a story; a landing never replays one).
          if (agesChk.checked) lc.rearmAges(res.manifest, res.survey, seed, res.subtitle, { quiet });
          else lc.clearAges();
          glass.syncZoom(); // #164/#165: attach the zoom to the just-landed chart (every style)
          // #169: record the (re-dressed) world sheet so a settle can redraft over it.
          glass.setWorld({ seed, overrides, render: { style, widthPx: 1500, legend, arms, theme: theme || undefined }, manifest: res.manifest });
          syncHash(); // #192: converge the address after the landing re-arms
        });
      } else {
        // Settle (#127): inject the chart and run the arrival ceremony (unless this is
        // a quiet mid-drag redraw). Order preserved from the pre-#131 path. When
        // flipped, this updates the hidden recto beneath the verso (the ceremony runs
        // out of sight); the visible verso is refreshed by rebuildVerso below.
        mapDiv.innerHTML = res.svg;
        lc.buildPlaceOverlay(res.manifest); // #53: marks + card, appended after innerHTML wipes #map
        if (!quiet) startArrival(mapDiv.querySelector("svg")); // #127: the arrival ceremony
        // #220: re-arm the instrument to THIS new world. The default rest is the present
        // park; a deep link's live key becomes the arm's rest, one-shot (#192). scrubTo's
        // clamping lives in the engine, so a hand-edited year parks at the boundary.
        // #174: `quiet` rides along so a mid-drag re-arm leaves the back face alone; the
        // verso's ghost and its track must always come from the same draw.
        // #120: re-arm from THIS draw's survey, never lastSurvey. A sea-level drag moves the
        // waterline, so the roads and open water the router walks moved with it.
        if (agesChk.checked) {
          const rest: AgesPos | undefined =
            pendingLive?.kind === "year" ? { chamber: "ages", year: pendingLive.year }
            : pendingLive?.kind === "survey" ? { chamber: "survey", t: 1 } : undefined;
          pendingLive = null;
          lc.rearmAges(res.manifest, res.survey, seed, res.subtitle, { quiet, rest });
        } else lc.clearAges();
        glass.syncZoom(); // #164/#165: attach the zoom to the just-drawn chart (every style)
        // #169: record this world sheet BEFORE a deep-link camera is applied, so the settle
        // that camera triggers can redraft a region over the SAME base world (cache hit).
        glass.setWorld({ seed, overrides, render: { style, widthPx: 1500, legend, arms, theme: theme || undefined }, manifest: res.manifest });
        syncHash(); // #192: re-sync after the arms, so the address converges every settle
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

// The plain control plumbing (Draw/random, seed Enter, selects, sliders, the
// scrubber's Play + range, the doc-level card dismiss) lives in controls.ts; this
// conductor keeps the handlers that arbitrate ceremonies below. (The Download SVG
// button retired at #217 Part 2; the Print Room's Chart plate is the take-home.)
wireControls({
  seedInput, styleSel, typeSel, bandSel, themeSel, legendChk, armsChk, landSlider, coastSlider,
  drawBtn: $("draw"), randomBtn: $("random"),
  scrubPlayBtn: $("scrub-play"), scrubRangeEl: $("scrub-range"),
  touched, draw, syncHash,
  togglePlay: lc.togglePlay, onManualScrub: lc.onManualScrub,
  agesDragStart: lc.agesDragStart, agesDragEnd: lc.agesDragEnd,
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
  // the SAME chart stays, we only re-home it. reset() is a no-op when already home.
  glass.homeToWorld(); // #169: drop a committed region inset before the flip
  glass.reset();
  // #174/#180/#220: interaction interrupts the animation. The flip snaps the instrument
  // to its CURRENT chamber's rest: a survey-chamber flip rests on the full track (both
  // faces agree through the sink), an ages-chamber flip parks at the present (the parked
  // recto then IS the chart the pristine ghost holds). No rAF loop narrates into #status
  // behind a hidden face. The button is deliberately NOT disabled for a running story: a
  // control that goes dead for many seconds with no stated reason reads as a bug. No-op
  // when the instrument is off.
  lc.agesSnapToRest();
  // #165/#192: sync AFTER the snaps, explicit and synchronous rather than on a debounced
  // settle, so a link copied right after the flip carries neither a stale cx/cy/k nor a
  // mid-scrub year (the hash records the parked present).
  syncHash();
  const flipped = toggleFlip(sheetEl);
  versoBtn.textContent = flipped ? "Turn back" : "Turn the sheet";
});

// #220 the ages instrument: the one toggle enters/leaves the fused scrubber without a
// redraw (no re-roll). Arming PARKS at the present, the world exactly as drawn and the
// journal fully told; Play is the story's one entry. A manual drag pauses Play; the
// bar, Play, and the detent's pointer wiring live in controls.ts.
agesChk.addEventListener("change", () => {
  if (agesChk.checked) {
    // Ratified 2026-07-26: arming snaps the camera home, the #165 world-sheet reset
    // extended across the WHOLE instrument (it supersedes the standalone voyage's
    // no-snap entry); the seam never moves the camera, and a hash restore skips this
    // handler entirely (the boot ticks the box with no change event). #169: both
    // chambers drive the WORLD chart, so a committed region inset drops first.
    glass.homeToWorld();
    glass.reset();
    lc.applyAges(lastManifest, lastSurvey, lastSeed, lastSubtitle);
  } else lc.exitAges();
  // #192: sync AFTER the arm (agesState now knows the parked rest) and in both
  // directions; still synchronous in the handler, so a copied link drops cx/cy/k now.
  syncHash();
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
// #192/#220: the address's instrument. Tick the box only (no change event, so no
// interactive arming ceremony fires): the first settle arms it silently through the
// re-arm branch at the addressed rest, then applies the camera. A restored link is a
// photograph, never an arming gesture.
if (hashed.live) { agesChk.checked = true; pendingLive = hashed.live; }
draw();
