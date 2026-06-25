// Explorer UI conductor. Wires the controls to the render worker (via
// worker-client.js), runs draw()/bind, and keeps the URL hash in sync. The heavy
// world-gen + SVG render runs off the main thread; the feature logic lives in
// sibling modules (worker-client, atlas-view, living-chart, sea-level) and this
// file is the glue: DOM refs, the draw/bind race guards, the listener wiring, and
// the bootstrap. Listeners attach here at module-eval time (module scripts are
// deferred, so the DOM is parsed first).
import { runJob, runInline, usesWorker, initWorker } from "./worker-client.js";
import { clearAtlas, renderAtlas } from "./atlas-view.js";
import { sliderToLand, landToSlider, updateLandReadout, syncAutoSlider } from "./sea-level.js";
import {
  buildPlaceOverlay,
  applyScrub,
  exitScrub,
  clearScrub,
  cancelScrubRaf,
  pauseScrub,
  togglePlay,
  onManualScrub,
  onDocKeydown,
  onDocClick,
} from "./living-chart.js";

const $ = (id) => document.getElementById(id);
const seedInput = $("seed");
const styleSel = $("style");
const typeSel = $("type");
const bandSel = $("band");
const themeSel = $("theme");
const legendChk = $("legend");
const armsChk = $("arms");
const landSlider = $("land");
const status = $("status");
const mapDiv = $("map");
const caption = $("caption");
const bindBtn = $("bind");
const chronicleChk = $("chronicle");
const scrubPlayBtn = $("scrub-play");
const scrubRangeEl = $("scrub-range");

let lastSvg = "";
let lastTitle = "";
let lastSeed = 0;
let lastOverrides = {};
let lastStyle = "antique";
let lastTheme = "";

// Sea-level slider (#55) gate. landTouched gates the manual override and the land=
// hash param; until the user moves the slider, it auto-tracks each world's natural
// waterline. landDebounce throttles the redraw during a drag.
let landTouched = false;
let landDebounce = 0;

// Monotonic guards. drawGen is bumped by every draw; both a draw's own result and
// any pending bind check it, so a fresh draw cancels a stale draw and a stale bind
// (the bound atlas must always match the chart on screen). bindSeq guards rapid
// re-binds of the same chart against one another.
let drawGen = 0;
let bindSeq = 0;
// True while a draw's result is still in flight. Binding is suppressed during this
// window so the bound atlas can never be composed from a seed the chart is about to
// replace (the draw-then-bind race).
let drawing = false;

function randomSeed() {
  return Math.floor(Math.random() * 0xffffffff);
}

function readHash() {
  const params = new URLSearchParams(location.hash.slice(1));
  const seed = Number(params.get("seed"));
  if (Number.isInteger(seed) && seed >= 0) seedInput.value = String(seed);
  const style = params.get("style");
  if (style && [...styleSel.options].some((o) => o.value === style)) {
    styleSel.value = style;
  }
  const type = params.get("type") ?? "";
  if ([...typeSel.options].some((o) => o.value === type)) typeSel.value = type;
  const band = params.get("band") ?? "";
  if ([...bandSel.options].some((o) => o.value === band)) bandSel.value = band;
  const theme = params.get("theme") ?? "";
  if ([...themeSel.options].some((o) => o.value === theme)) themeSel.value = theme;
  const legend = params.get("legend");
  if (legend !== null) legendChk.checked = legend === "1";
  const arms = params.get("arms");
  if (arms !== null) armsChk.checked = arms === "1";
  const land = params.get("land");
  if (land !== null) {
    const f = Number(land) / 1000;
    if (Number.isFinite(f)) {
      landTouched = true;
      landSlider.value = String(landToSlider(f));
      updateLandReadout();
    }
  }
}

function writeHash() {
  const params = new URLSearchParams();
  params.set("seed", seedInput.value);
  params.set("style", styleSel.value);
  if (typeSel.value) params.set("type", typeSel.value);
  if (bandSel.value) params.set("band", bandSel.value);
  if (themeSel.value) params.set("theme", themeSel.value);
  params.set("legend", legendChk.checked ? "1" : "0");
  params.set("arms", armsChk.checked ? "1" : "0");
  if (landTouched) params.set("land", String(Math.round(sliderToLand(landSlider.value) * 1000)));
  history.replaceState(null, "", "#" + params.toString());
}

function draw() {
  const seed = Number(seedInput.value) >>> 0;
  const myGen = ++drawGen;
  drawing = true;
  cancelScrubRaf(); // a redraw is about to wipe the overlay; stop any running sweep
  bindBtn.disabled = true;
  status.textContent = "Drafting…";
  caption.textContent = "";
  clearAtlas();
  writeHash();
  const overrides = {};
  if (typeSel.value) overrides.mapType = typeSel.value;
  if (bandSel.value) overrides.band = bandSel.value;
  if (landTouched) overrides.landFraction = sliderToLand(landSlider.value);
  else syncAutoSlider(seed, overrides);
  updateLandReadout();
  const style = styleSel.value;
  const theme = themeSel.value;
  const legend = legendChk.checked;
  const arms = armsChk.checked;
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
      bindBtn.disabled = false;
      lastSvg = res.svg;
      lastTitle = res.title;
      lastSeed = seed;
      lastOverrides = overrides;
      lastStyle = style;
      lastTheme = theme;
      mapDiv.innerHTML = res.svg;
      buildPlaceOverlay(res.manifest); // #53: marks + card, appended after innerHTML wipes #map
      // #54: if the chronicle toggle is on, re-apply the scrubber to THIS new world
      // (fresh manifest, range, layers); applyScrub hides the just-rendered layers
      // synchronously, so there is no flash of the present-day chart.
      if (chronicleChk.checked) applyScrub(style);
      else clearScrub();
      const ms = (performance.now() - t0).toFixed(0);
      status.textContent = "";
      caption.textContent = `${res.title} · ${res.mapType} · ${res.band} · drawn in ${ms}ms`;
    })
    .catch((err) => {
      if (myGen !== drawGen) return;
      drawing = false;
      bindBtn.disabled = false;
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
bindBtn.addEventListener("click", () => {
  if (!lastSvg || drawing) return;
  const myGen = drawGen;
  const mySeq = ++bindSeq;
  const style = lastStyle;
  const theme = lastTheme;
  clearAtlas();
  status.textContent = "Binding the atlas…";
  runJob({ kind: "atlas", seed: lastSeed, overrides: lastOverrides, width: 1500 })
    .then((res) => {
      // discard if a redraw or a newer bind has superseded this one
      if (myGen !== drawGen || mySeq !== bindSeq) return;
      renderAtlas(res.atlas, style, theme);
      status.textContent = "";
    })
    .catch((err) => {
      if (myGen !== drawGen || mySeq !== bindSeq) return;
      status.textContent = "The bindery faltered: " + err.message;
    });
});
seedInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    landTouched = false;
    draw();
  }
});
for (const sel of [styleSel, bandSel, themeSel, legendChk, armsChk]) {
  sel.addEventListener("change", draw);
}
// Changing the map type reshapes the terrain, so a manual tide no longer applies:
// reset to auto so the slider re-derives from the new world.
typeSel.addEventListener("change", () => {
  landTouched = false;
  draw();
});
// Drag: live readout + debounced redraw on input, an authoritative redraw on
// release. Both bump drawGen, so a stale in-flight frame is discarded.
landSlider.addEventListener("input", () => {
  landTouched = true;
  updateLandReadout();
  clearTimeout(landDebounce);
  landDebounce = setTimeout(draw, 100);
});
landSlider.addEventListener("change", () => {
  landTouched = true;
  clearTimeout(landDebounce);
  draw();
});

// Chronicle scrubber (#54): the toggle enters/leaves scrub mode without a redraw
// (no re-roll); Play/Pause runs the event-proportional sweep; a manual drag pauses
// Play and rebases it so the next Play restarts from the beginning.
chronicleChk.addEventListener("change", () => {
  if (chronicleChk.checked) applyScrub(lastStyle);
  else exitScrub();
});
scrubPlayBtn.addEventListener("click", togglePlay);
scrubRangeEl.addEventListener("input", onManualScrub);

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

seedInput.value = String(randomSeed());
readHash();
draw();
