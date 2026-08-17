// Explorer UI conductor: wires the controls to the render worker, runs draw(), and keeps
// the URL hash in sync. #321: the Explorer is STATIC; no code path here starts an animation clock.
import { runJob, runInline, usesWorker, initWorker } from "./worker-client.ts";
import { shouldTurn, runTurn, cancelTurn, turnTiming } from "./sheet-turn.ts";
import { toggleFlip, isFlipped, rebuildVerso, paintVersoTrack, clearVersoTrack } from "./verso.ts";
import { sliderToLand, updateLandReadout, syncAutoSlider } from "./sea-level.ts";
import { sliderToCoast, updateCoastReadout, parkCoastDefault } from "./coast-warp.ts";
import { startArrival } from "./draw-ceremony.ts";
import { readHash, writeHash } from "./hash-sync.ts";
import { forwardTarget, prospectTarget } from "./address.ts";
import { createGlass } from "./glass.ts";
import { wireControls } from "./controls.ts";
import { wireFootnotes } from "./footnotes.ts";
import { installExplorerHooks } from "./hooks.ts";
import { wireSurveyToggle, armOnLanding, deferLandingArm } from "./survey-arm.ts";
import { createTourOrder } from "./tour-order.ts";
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
  $, seedInput, styleSel, typeSel, bandSel, themeSel, legendChk, armsChk, beastsChk, landSlider,
  coastSlider, status, mapDiv, mapViewport, sheetEl, innerEl, caption, versoEl, versoBtn,
  agesChk, orderLink, journalLink, hashControls,
} from "./elements.ts";

let lastSvg = "";
let lastTitle = "";
let lastSubtitle = "";
let lastSeed = 0;
let lastManifest: PlaceManifest | null = null; // the on-screen chart's manifest; feeds a voyage toggled on without a redraw
// #120: assigned beside lastManifest from the SAME draw; a mismatched pair would route this world's ports over another world's roads.
let lastSurvey: Survey | null = null;

// #55/#137: shared BY REFERENCE with controls.ts; until touched, a draw is the natural world.
const touched = { land: false, coast: false };

let pendingCamera: Camera | null = null;

let drawGen = 0;
let drawing = false;

function prefersReduce(): boolean {
  return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}

// #373: the #184 travel matrix runs in the render worker, so the arm no longer blocks the #127 arrival ceremony.
const tourOrder = createTourOrder({ runJob });

const lc = createLivingChart({
  mapEl: mapDiv,
  statusEl: status,
  tourOrder,
  // #242: read at show time, so the card's link always carries the hash on screen.
  prospectHref: (idx) => prospectTarget(location.hash, idx),
  // #387/#388: at k=1 this rect IS the chart box, and under the Glass it is the room actually on screen, which is why one box serves both errata.
  clampBox: () => mapViewport.getBoundingClientRect(),
  restingTrackSink: {
    paint: (points, viewBox) => paintVersoTrack(versoEl, points, viewBox),
    clear: () => clearVersoTrack(versoEl),
  },
});

let redraftEnabled = true;
// #169: semantic redraft is antique-only (the epic's ratified decision); the survey track and the verso keep the world sheet.
function regionEligible(): boolean {
  return redraftEnabled && styleSel.value === "antique" && !agesChk.checked && !isFlipped(sheetEl) && !!lastSvg;
}
// #165/#169/#192: the ONE hash writer, every trigger funnels through here; #321: the box IS the flag and the Explorer never authors year=.
function syncHash(): void {
  writeHash(hashControls, touched.land, touched.coast, glass.cameraNow(),
    agesChk.checked ? { kind: "survey" } : null);
  journalLink.href = "/reading-room/" + (location.hash || "");
}

const glass = createGlass({
  mapViewport,
  mapDiv,
  runJob,
  buildPlaceOverlay: lc.buildPlaceOverlay,
  reclampCard: lc.reclampCard,
  setCaption: (t) => { caption.textContent = t; },
  prefersReduce,
  regionEligible,
  syncHash,
  buttons: { zoomIn: $("zoom-in"), zoomOut: $("zoom-out"), reset: $("zoom-reset"), cluster: $("zoom-controls") },
});

// opts.quiet suppresses the arrival ceremony, used only by the sea-level drag's throttled mid-drag redraws.
function draw(opts?: { quiet?: boolean; turn?: boolean }): void {
  const quiet = !!(opts && opts.quiet);
  const isTurn = !!(opts && opts.turn);
  const seed = Number(seedInput.value) >>> 0;
  const myGen = ++drawGen;
  cancelTurn();
  // #165: rebase(), not reset(): the chart under the camera is being replaced, so drop to home with no spurious settle.
  glass.rebase();
  glass.cancelRedraft();
  drawing = true;
  versoBtn.disabled = true;
  status.textContent = "Drafting…";
  caption.textContent = "";
  syncHash();
  // #133: syncHash just wrote location.hash, so this link always opens the CURRENT world, never the one from page load.
  if (orderLink) orderLink.href = "../print-room/" + (location.hash || "");
  const overrides: { mapType?: MapType; band?: ClimateBand; landFraction?: number; coastWarp?: number } = {};
  if (typeSel.value) overrides.mapType = typeSel.value as MapType;
  if (bandSel.value) overrides.band = bandSel.value as ClimateBand;
  if (touched.land) overrides.landFraction = sliderToLand(landSlider.value);
  else syncAutoSlider(seed, overrides);
  updateLandReadout();
  if (touched.coast) overrides.coastWarp = sliderToCoast(coastSlider.value);
  else parkCoastDefault();
  updateCoastReadout();
  const style = styleSel.value as StyleName;
  const theme = themeSel.value as ThemeName | "";
  const legend = legendChk.checked;
  const arms = armsChk.checked;
  const beasts = beastsChk.checked;
  // Whether this draw TURNS is decided at the swap; capture the presence while the outgoing chart is still on screen.
  const hadChart = !!mapDiv.querySelector("svg");
  const t0 = performance.now();
  runJob({
    kind: "draw",
    seed,
    overrides,
    render: { style, widthPx: 1500, legend, arms, beasts, theme: theme || undefined },
  })
    .then((res) => {
      if (myGen !== drawGen) return;
      drawing = false;
      versoBtn.disabled = false;
      lastSvg = res.svg;
      lastTitle = res.title;
      lastSubtitle = res.subtitle;
      lastSeed = seed;
      lastManifest = res.manifest;
      lastSurvey = res.survey;
      const ms = (performance.now() - t0).toFixed(0);
      status.textContent = "";
      caption.textContent = `${res.title} · ${res.mapType} · ${res.band} · drawn in ${ms}ms`;
      const flipped = isFlipped(sheetEl);
      const deferArm = deferLandingArm(quiet, flipped); // #366: survey-arm.ts carries the why
      if (shouldTurn({ isTurn, reduceMotion: prefersReduce(), usesWorker: usesWorker(), hasChart: hadChart, flipped })) {
        const t = turnTiming();
        runTurn({ sheetEl, innerEl, mapEl: mapDiv, newSvg: res.svg, durationMs: t.ms, easing: t.ease }).then(() => {
          if (myGen !== drawGen) return;
          lc.buildPlaceOverlay(res.manifest);
          armOnLanding({ arm: surveyArm, armed: agesChk.checked, defer: deferArm, clear: lc.clearAges,
            rearm: () => lc.rearmVoyage(res.manifest, res.survey, seed, res.subtitle, { quiet }) });
          glass.syncZoom();
          glass.setWorld({ seed, overrides, render: { style, widthPx: 1500, legend, arms, beasts, theme: theme || undefined }, manifest: res.manifest });
          syncHash();
        });
      } else {
        // Settle (#127): when flipped this updates the hidden recto beneath the verso; rebuildVerso refreshes the visible face.
        mapDiv.innerHTML = res.svg;
        lc.buildPlaceOverlay(res.manifest);
        if (!quiet) startArrival(mapDiv.querySelector("svg"));
        // #120: re-arm from THIS draw's survey, never lastSurvey; a sea-level drag moved the waterline the router walks.
        armOnLanding({ arm: surveyArm, armed: agesChk.checked, defer: deferArm, clear: lc.clearAges,
          rearm: () => lc.rearmVoyage(res.manifest, res.survey, seed, res.subtitle, { quiet }) });
        glass.syncZoom();
        // #169: record this world sheet BEFORE a deep-link camera is applied, so the settle that camera triggers redrafts over the SAME base world.
        glass.setWorld({ seed, overrides, render: { style, widthPx: 1500, legend, arms, beasts, theme: theme || undefined }, manifest: res.manifest });
        syncHash();
        if (pendingCamera) {
          const cam = pendingCamera;
          pendingCamera = null;
          glass.applyCamera(cam);
        }
      }
      // #174/#366: whoever paints the track LAST owns this repaint; a DEFERRED arm owns it, so the settle leaves the back face to the arm (e2e SV2k/SV2m/SV2o).
      const armPaintsVerso = agesChk.checked && deferArm;
      if (!quiet) {
        rebuildVerso(versoEl, res, seed);
        if (!armPaintsVerso) lc.syncRestingTrack();
      }
    })
    .catch((err) => {
      if (myGen !== drawGen) return;
      drawing = false;
      versoBtn.disabled = false;
      cancelTurn();
      status.textContent = "The cartographer spilled the ink: " + err.message;
    });
}

wireControls({
  seedInput, styleSel, typeSel, bandSel, themeSel, legendChk, armsChk, beastsChk, landSlider, coastSlider,
  drawBtn: $("draw"), randomBtn: $("random"),
  touched, draw,
  onDocKeydown: lc.onDocKeydown, onDocClick: lc.onDocClick,
});
wireFootnotes();

versoBtn.addEventListener("click", () => {
  if (!lastSvg || drawing || sheetEl.classList.contains("turning")) return;
  // #165: reset(), not rebase(): the SAME chart stays, it is only re-homed before the flip.
  glass.homeToWorld(); // #169: drop a committed region inset before the flip
  glass.reset();
  syncHash();
  const flipped = toggleFlip(sheetEl);
  versoBtn.textContent = flipped ? "Turn back" : "Turn the sheet";
});

// #300/#366: survey-arm.ts owns the box's wiring AND the one slot every arm goes through; rearmVoyage, never applyVoyage (the settle discipline).
const surveyArm = wireSurveyToggle({
  box: agesChk,
  worldGen: () => drawGen,
  home: () => { glass.homeToWorld(); glass.reset(); },
  arm: () => { lc.rearmVoyage(lastManifest, lastSurvey, lastSeed, lastSubtitle); },
  prime: () => tourOrder.prime(lastManifest, lastSurvey, lastSeed),
  exit: lc.exitAges,
  syncHash,
});

const fwd = forwardTarget(location.hash);
if (fwd) {
  location.replace(fwd);
} else {
  await initWorker();
  installExplorerHooks({
    glass, usesWorker, runJob, runInline,
    setRedraftEnabled: (v) => { redraftEnabled = !!v; },
  });

  // A bare visit lands on today's seed-of-the-day (UTC); readHash presence-gates the seed key, so a seedless link cannot clobber this down to 0.
  seedInput.value = String(seedForDate(new Date()));
  const hashed = readHash(hashControls);
  if (hashed.land) touched.land = true;
  if (hashed.coast) touched.coast = true;
  pendingCamera = hashed.camera;
  if (hashed.live) agesChk.checked = true;
  draw();
}
