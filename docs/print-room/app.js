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

function randomSeed() {
  return Math.floor(Math.random() * 0xffffffff);
}

// Read the same hash keys the Explorer writes (docs/explorer/hash-sync.js), applying
// only present + valid values: the visible controls (seed, style) and the carried
// params; everything else stays at its default.
function applyHash() {
  const p = new URLSearchParams(location.hash.slice(1));
  const seedRaw = p.get("seed");
  const seed = Number(seedRaw);
  // Gate on PRESENCE, not just validity: Number(null) === 0 would pass the integer
  // guard and silently pin every bare visit to seed 0, defeating the random-world
  // fallback at bootstrap. A missing OR invalid seed both fall through to random.
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
    })
    .catch((err) => {
      if (myGen !== drawGen) return;
      status.textContent = "The press jammed: " + err.message;
    });
}

$("pr-draw").addEventListener("click", draw);
seedInput.addEventListener("keydown", (e) => { if (e.key === "Enter") draw(); });
styleSel.addEventListener("change", draw);
$("pr-random").addEventListener("click", () => { seedInput.value = String(randomSeed()); draw(); });

await initWorker("/explorer/worker.js");
window.__vellumPrintRoomUsesWorker = usesWorker;
window.__vellumPrintRoomState = () => ({ seed: lastSeed, title: lastTitle });
if (!usesWorker()) warning.hidden = false; // inline fallback: large plates will pause the tab

applyHash();
if (!seedInput.value) seedInput.value = String(randomSeed());
draw();
