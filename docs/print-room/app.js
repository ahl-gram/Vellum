// The Print Room controller (#133, epic #132). A sixth hand-authored page: the
// atelier's print shop. It takes a world by URL hash (deep-linked from the Explorer's
// "Take to the Print Room" link) or by manual seed entry, and pulls a modest proof
// through the SHARED render worker so the heavy work stays off the main thread. The
// ordering surface (poster plates, the bound atlas) is filled in by Subs 2-4; Sub 1
// is the shell plus this preview.
//
// Worker reuse: the render worker and its inline fallback already live in the
// Explorer's worker-client.js. We import it root-absolute so its own ./engine/...
// imports resolve against /explorer/, and we hand initWorker the root-absolute worker
// URL because `new Worker("./worker.js")` resolves against THIS document's base
// (/print-room/), not the module's, and would 404 into a silent inline fallback. The
// Explorer keeps the "./worker.js" default, so its bytes, the worker/inline parity
// (e2e R2/R3), and the fallback path (B1-B3) are all unchanged.
import { runJob, usesWorker, initWorker } from "/explorer/worker-client.js";
import { startArrival } from "/explorer/draw-ceremony.js";
import { seedForDate } from "/explorer/engine/world/seed-of-the-day.js";
// #134 poster plates. Same-dir module (resolves against this module's URL, /print-room/),
// unlike the root-absolute worker spawn above. Pure clamp + presets; unit-tested in Node.
import { POSTER_PRESETS, clampPosterWidth, posterFilename, posterPngFilename } from "./poster-presets.js";
// #135 the rasterizer: the site's first shared cross-page client library (docs/lib/,
// served at /lib/). Root-absolute like the worker so the path is stable from /print-room/.
// SVG string in, PNG blob out, fitted under a canvas pixel budget; the pure decision core
// is unit-tested in Node and its failure paths surface in-voice messages, never silent nulls.
import { rasterizeSvg } from "/lib/rasterize.js";
// #136 the bound atlas: bind the full atlas off-thread, print it to PDF, or download a
// self-contained single file. Same-dir module (resolves against /print-room/); it reuses
// the shared worker + the engine's atlasDocument.
import { initBoundAtlas, clearBoundAtlas, enableBind } from "./bound-atlas.js";

const PREVIEW_WIDTH = 900; // a modest proof; the real outputs are downloads (Subs 2-4).

// The valid option sets, mirrored from the Explorer's <select> values, so a crafted
// hash can never inject an unknown recipe param (validate at the boundary).
const STYLES = ["antique", "topographic", "ink", "nautical"];
const TYPES = ["island", "archipelago", "continent", "citystate"];
const BANDS = ["temperate", "tropical", "polar"];
const THEMES = ["vegetation", "climate", "moisture", "population"];

const $ = (id) => document.getElementById(id);
const seedInput = $("pr-seed");
const styleSel = $("pr-style");
const status = $("pr-status");
const preview = $("pr-preview");
const caption = $("pr-caption");
const warning = $("pr-warning");
const posterStatus = $("pr-poster-status");
const plateButtons = [...document.querySelectorAll("[data-poster]")];
const presetByKey = new Map(POSTER_PRESETS.map((p) => [p.key, p]));

// Recipe params with no visible control in Sub 1: they ride along from a deep-link's
// hash (type/band/theme/legend/arms/land) so an Explorer world reproduces faithfully,
// and are re-serialized on every draw so the Print Room's own URL stays a valid,
// shareable Explorer link too.
const carried = { type: "", band: "", theme: "", legend: true, arms: false, land: null };

// Monotonic guard: a fresh draw cancels a stale in-flight one, so a slow proof can
// never overwrite a newer chart the visitor asked for.
let drawGen = 0;
let lastSeed = 0;
let lastTitle = "";

// #134 poster state. posterBasis is the world of the CURRENT proof, snapshotted on every
// successful draw so an order reproduces exactly the sheet on screen, not whatever the
// live controls read at click time. Null until the first proof lands, which is why the
// plate buttons start disabled in the HTML.
let posterBasis = null;
let ordering = false; // an order is at the press; the plates are disabled meanwhile
let posterGen = 0; // drawGen-style stale guard (belt-and-suspenders: the button-disable
// is the operative guard, since only one order can run at a time)

function randomSeed() {
  return Math.floor(Math.random() * 0xffffffff);
}

function setPlatesEnabled(on) {
  for (const b of plateButtons) b.disabled = !on;
}

// Read the same hash keys the Explorer writes (docs/explorer/hash-sync.js), applying
// only present + valid values: the visible controls (seed, style) and the carried
// params; everything else stays at its default.
function applyHash() {
  const p = new URLSearchParams(location.hash.slice(1));
  const seedRaw = p.get("seed");
  const seed = Number(seedRaw);
  // Gate on PRESENCE, not just validity: Number(null) === 0 would pass the integer
  // guard and silently pin every bare visit to seed 0. A missing OR invalid seed both
  // fall through to today's seed-of-the-day at bootstrap.
  if (seedRaw !== null && Number.isInteger(seed) && seed >= 0) seedInput.value = String(seed);
  const style = p.get("style");
  if (STYLES.includes(style)) styleSel.value = style;
  const type = p.get("type");
  if (TYPES.includes(type)) carried.type = type;
  const band = p.get("band");
  if (BANDS.includes(band)) carried.band = band;
  const theme = p.get("theme");
  if (THEMES.includes(theme)) carried.theme = theme;
  const legend = p.get("legend");
  if (legend !== null) carried.legend = legend === "1";
  const arms = p.get("arms");
  if (arms !== null) carried.arms = arms === "1";
  const land = p.get("land");
  if (land !== null) {
    const f = Number(land) / 1000;
    if (Number.isFinite(f)) carried.land = Math.min(0.7, Math.max(0.1, f));
  }
}

// Mirror the current recipe into location.hash in the Explorer's exact format, so a
// Print Room link opens the same world in either page.
function writeHash(seed, style) {
  const p = new URLSearchParams();
  p.set("seed", String(seed));
  p.set("style", style);
  if (carried.type) p.set("type", carried.type);
  if (carried.band) p.set("band", carried.band);
  if (carried.theme) p.set("theme", carried.theme);
  p.set("legend", carried.legend ? "1" : "0");
  p.set("arms", carried.arms ? "1" : "0");
  if (carried.land != null) p.set("land", String(Math.round(carried.land * 1000)));
  history.replaceState(null, "", "#" + p.toString());
}

function draw() {
  const seed = Number(seedInput.value) >>> 0;
  const style = STYLES.includes(styleSel.value) ? styleSel.value : "antique";
  const myGen = ++drawGen;
  status.textContent = "Pulling a proof…";
  caption.textContent = "";
  // A fresh proof supersedes any bound atlas: the old one no longer matches the world
  // about to be drawn, so clear it (and disable Print/Download) before the redraw.
  clearBoundAtlas();
  posterStatus.textContent = ""; // a new proof clears any stale poster-order status in the desk
  const overrides = {};
  if (carried.type) overrides.mapType = carried.type;
  if (carried.band) overrides.band = carried.band;
  if (carried.land != null) overrides.landFraction = carried.land;
  runJob({
    kind: "draw",
    seed,
    overrides,
    render: { style, widthPx: PREVIEW_WIDTH, legend: carried.legend, arms: carried.arms, theme: carried.theme || undefined },
  })
    .then((res) => {
      if (myGen !== drawGen) return; // a newer draw superseded this one
      // res.svg is engine-rendered markup, not user content: the only inputs are the
      // uint32 seed (`>>> 0`) and recipe params validated against fixed allowlists in
      // applyHash, so no user string reaches the SVG. Same trusted-string injection the
      // Explorer (mapDiv.innerHTML = res.svg) and the seed-of-the-day page already do.
      preview.innerHTML = res.svg;
      startArrival(preview.querySelector("svg")); // #127 arrival ceremony (shared motion vocab)
      writeHash(seed, style); // keep the Print Room URL a shareable, round-tripping Explorer link
      status.textContent = "";
      caption.textContent = `${res.title} · seed ${seed}`;
      lastSeed = seed;
      lastTitle = res.title;
      // Snapshot the world just proofed (its seed, style, and render options) so a poster
      // order reproduces THIS sheet. overrides is built fresh per draw and never mutated,
      // so holding the reference is safe.
      posterBasis = { seed, style, overrides, legend: carried.legend, arms: carried.arms, theme: carried.theme || undefined };
      if (!ordering) setPlatesEnabled(true);
      enableBind(); // a world is on the desk: the atlas can be bound from this proof
    })
    .catch((err) => {
      if (myGen !== drawGen) return;
      status.textContent = "The press jammed: " + err.message;
      // The draw failed, but the previous proof (if any) is still on the desk and bindable,
      // so re-enable Bind (clearBoundAtlas disabled it at the start of this draw). Without
      // this, a worker crash during a redraw would leave Bind stuck disabled until the next
      // successful draw. Mirrors the Explorer, which re-enables its Bind on draw failure too.
      enableBind();
    });
}

$("pr-draw").addEventListener("click", draw);
seedInput.addEventListener("keydown", (e) => { if (e.key === "Enter") draw(); });
styleSel.addEventListener("change", draw);
$("pr-random").addEventListener("click", () => { seedInput.value = String(randomSeed()); draw(); });

// #134 Order a poster plate. The press pulls the CURRENT proof's world at a preset width
// through the SHARED worker, and the wide SVG goes STRAIGHT to a Blob download: it is
// NEVER injected into the live DOM (a multi-MB innerHTML swap is the epic's one hard
// warning), so the on-page preview stays at PREVIEW_WIDTH.
function downloadBlob(blob, filename) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function downloadSvg(svg, filename) {
  downloadBlob(new Blob([svg], { type: "image/svg+xml" }), filename);
}

// Step one, "how it's pressed": the reproducible vector SVG, or a PNG image at x1 or x2.
// Read at click time (like the basis snapshot), and defaults to SVG so the Sub 2 SVG path
// and its e2e (PR13-PR16) are unchanged. png1/png2 map to the rasterizer's x1/x2 scale.
function selectedFormat() {
  const el = document.getElementById("pr-format");
  return el ? el.value : "svg";
}

function orderPoster(key) {
  const preset = presetByKey.get(key);
  if (!preset || ordering || !posterBasis) return;
  // Snapshot the basis synchronously: the preview controls stay live during a render, so
  // a style change could redraw and mutate posterBasis mid-flight. Bind the world NOW,
  // exactly as the Explorer's bind handler snapshots lastStyle/lastTheme before runJob.
  const basis = posterBasis;
  const format = selectedFormat(); // snapshot alongside the basis; a later click can change it
  const width = clampPosterWidth(preset.width);
  const myGen = ++posterGen;
  ordering = true;
  setPlatesEnabled(false);
  posterStatus.textContent = `The press is rolling at ${width}px…`;
  runJob({
    kind: "draw",
    seed: basis.seed,
    overrides: basis.overrides,
    render: { style: basis.style, widthPx: width, legend: basis.legend, arms: basis.arms, theme: basis.theme },
  })
    .then(async (res) => {
      if (myGen !== posterGen) return; // superseded by a newer order
      if (format === "svg") {
        const filename = posterFilename(basis.seed, basis.style, width);
        downloadSvg(res.svg, filename);
        // e2e observation point: the poster the press pulled, which never touches the DOM.
        window.__vellumLastPoster = { svg: res.svg, filename, width, seed: basis.seed, style: basis.style };
        posterStatus.textContent = `${preset.label} plate pulled: ${filename}`;
        return;
      }
      // PNG: rasterize the wide SVG client-side. It still never enters the DOM
      // (rasterizeSvg draws it off a blob-URL Image, not innerHTML). A too-large plate is
      // fitted DOWN to the browser's pixel budget; a decode/toBlob/canvas failure rejects
      // with an in-voice line, shown directly (it is already a full sentence, so no
      // "press jammed" prefix).
      const scale = format === "png2" ? 2 : 1;
      let png;
      try {
        png = await rasterizeSvg(res.svg, { scale });
      } catch (err) {
        if (myGen !== posterGen) return;
        posterStatus.textContent = err.message;
        return;
      }
      if (myGen !== posterGen) return; // a newer order landed while rasterizing
      const filename = posterPngFilename(basis.seed, basis.style, png.width);
      downloadBlob(png.blob, filename);
      // e2e observation point: dimensions + blob size, never the bytes. The wide SVG and
      // the PNG both stay out of the DOM.
      window.__vellumLastPng = {
        filename, type: png.blob.type, size: png.blob.size,
        width: png.width, height: png.height, scale: png.scale, clamped: png.clamped,
        seed: basis.seed, style: basis.style,
      };
      posterStatus.textContent = png.clamped
        ? `${preset.label} plate pressed at reduced resolution to fit this browser: ${filename}`
        : `${preset.label} plate pressed: ${filename}`;
    })
    .catch((err) => {
      if (myGen !== posterGen) return;
      posterStatus.textContent = "The press jammed: " + err.message;
    })
    .finally(() => {
      // Only one order runs at a time (the plates are disabled meanwhile), so this always
      // clears the in-flight order and re-opens the counter.
      ordering = false;
      setPlatesEnabled(true);
    });
}

for (const b of plateButtons) b.addEventListener("click", () => orderPoster(b.dataset.poster));

await initWorker("/explorer/worker.js");
// #136: wire the bound atlas. getBasis reads the LIVE posterBasis at click time, so a
// bind reproduces exactly the world on the desk (the same snapshot the poster order uses).
initBoundAtlas(() => posterBasis);
window.__vellumPrintRoomUsesWorker = usesWorker;
window.__vellumPrintRoomState = () => ({ seed: lastSeed, title: lastTitle });
window.__vellumClampPosterWidth = clampPosterWidth; // e2e: the tab-killing-width guard
if (!usesWorker()) warning.hidden = false; // inline fallback: large plates will pause the tab

applyHash();
// A bare visit (no valid seed in the hash) lands on today's seed-of-the-day (UTC), the
// same default world the Explorer and the Today page use.
if (!seedInput.value) seedInput.value = String(seedForDate(new Date()));
draw();
