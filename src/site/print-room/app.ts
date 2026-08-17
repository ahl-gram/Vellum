// The Print Room controller (#133, epic #132): takes a world by URL hash or manual seed
// entry and pulls a modest proof through the SHARED render worker. Since the fold (#208)
// this page is bundled like the Explorer: worker-client is inlined into this bundle and
// initWorker takes no URL here.
import { runJob, usesWorker, initWorker } from "../explorer/worker-client.ts";
import { startArrival } from "../explorer/draw-ceremony.ts";
import { seedForDate } from "../../world/seed-of-the-day.ts";
import { POSTER_PRESETS, CHART_PRESET, clampPosterWidth, posterFilename, posterPngFilename, chartFilename, type PosterPreset } from "./poster-presets.ts";
import { rasterizeSvg } from "../lib/rasterize.ts";
import { initBoundAtlas, clearBoundAtlas, enableBind, type PosterBasis } from "./bound-atlas.ts";
import type { MapType } from "../../terrain/heightfield.ts";
import type { ClimateBand } from "../../climate/climate.ts";
import type { StyleName } from "../../render/style.ts";
import type { ThemeName } from "../../render/layers/field.ts";

declare global {
  interface Window {
    __vellumPrintRoomUsesWorker?: typeof usesWorker;
    __vellumPrintRoomState?: () => { seed: number; title: string };
    __vellumClampPosterWidth?: typeof clampPosterWidth;
    __vellumLastPoster?: { svg: string; filename: string; width: number; seed: number; style: StyleName };
    __vellumLastPng?: {
      filename: string;
      type: string;
      size: number;
      width: number;
      height: number;
      scale: number;
      clamped: boolean;
      seed: number;
      style: StyleName;
    };
  }
}

const PREVIEW_WIDTH = 900; // a modest proof; the real outputs are downloads

// Boundary discipline: allowlists mirrored from the Explorer's <select> values, so a crafted hash can never inject an unknown recipe param.
const STYLES = ["antique", "topographic", "ink", "nautical"];
const TYPES = ["island", "archipelago", "continent", "citystate"];
const BANDS = ["temperate", "tropical", "polar"];
const THEMES = ["vegetation", "climate", "moisture", "population"];

const $ = <T extends HTMLElement = HTMLElement>(id: string): T => document.getElementById(id) as T;
const seedInput = $<HTMLInputElement>("pr-seed");
const styleSel = $<HTMLSelectElement>("pr-style");
const status = $("pr-status");
const preview = $("pr-preview");
const caption = $("pr-caption");
const warning = $("pr-warning");
const posterStatus = $("pr-poster-status");
const plateButtons = [...document.querySelectorAll<HTMLButtonElement>("[data-poster]")];
const formatSel = $<HTMLSelectElement>("pr-format"); // the "Pressed as" select (#135); greyed out during a draw (#212)
// #217: the chart plate rides the same order path as the posters; its divergences branch inside orderPoster.
const presetByKey = new Map([...POSTER_PRESETS, CHART_PRESET].map((p): [string, PosterPreset] => [p.key, p]));

// Recipe params with no visible control here: carried from a deep link and re-serialized on every draw, so the URL stays a shareable Explorer link (#137 added coast: a warped world must print warped).
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

let drawGen = 0;
// True from a draw's synchronous start until its own settle (#212): pairs with `ordering` so the order surface stays closed for the whole round-trip.
let drawing = false;
let lastSeed = 0;
let lastTitle = "";

// #134: the world of the CURRENT proof, snapshotted on every successful draw so an order reproduces the sheet on screen, not the live controls at click time; null until the first proof lands (the plate buttons start disabled in the HTML).
let posterBasis: PosterBasis | null = null;
let ordering = false; // an order is at the press; the plates are disabled meanwhile
let posterGen = 0; // drawGen-style stale guard; the button-disable is the operative guard

function randomSeed(): number {
  return Math.floor(Math.random() * 0xffffffff);
}

// #212: the single gate for the order surface. Consulting BOTH `drawing` and `ordering` closes the race in both directions: a redraw finishing during an order, and an order finishing during a redraw, each leave the counter closed until the world settles.
// The #pr-format select greys out for the draw round-trip only; its value is snapshotted at order time.
function refreshOrderControls(): void {
  const platesReady = posterBasis != null && !drawing && !ordering;
  for (const b of plateButtons) b.disabled = !platesReady;
  if (formatSel) formatSel.disabled = drawing;
}

// Read the same hash keys the Explorer writes, applying only present + valid values.
function applyHash(): void {
  const p = new URLSearchParams(location.hash.slice(1));
  const seedRaw = p.get("seed");
  const seed = Number(seedRaw);
  // Gate on PRESENCE, not just validity: Number(null) === 0 would pass the integer guard and silently pin every bare visit to seed 0.
  if (seedRaw !== null && Number.isInteger(seed) && seed >= 0) seedInput.value = String(seed);
  const style = p.get("style");
  if (style !== null && STYLES.includes(style)) styleSel.value = style;
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
  // #137: coast= carries coastWarp x 100, the Explorer's encoding; clamp so a crafted hash can never push the engine out of range.
  const coast = p.get("coast");
  if (coast !== null) {
    const w = Number(coast) / 100;
    if (Number.isFinite(w)) carried.coast = Math.min(1, Math.max(0, w));
  }
}

// Mirror the current recipe into location.hash in the Explorer's exact format, so a Print Room link opens the same world in either page.
function writeHash(seed: number, style: string): void {
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
  history.replaceState(null, "", "#" + p.toString());
}

function draw(): void {
  const seed = Number(seedInput.value) >>> 0;
  const style = STYLES.includes(styleSel.value) ? (styleSel.value as StyleName) : "antique";
  const myGen = ++drawGen;
  drawing = true;
  status.textContent = "Pulling a proof…";
  caption.textContent = "";
  // #212/#136: a fresh proof supersedes any bound atlas AND any pending poster order; close the whole order surface SYNCHRONOUSLY before the async render, or a plate clicked mid-redraw presses the previous world's poster.
  clearBoundAtlas();
  refreshOrderControls();
  posterStatus.textContent = ""; // a new proof clears any stale poster-order status
  const overrides: { mapType?: MapType; band?: ClimateBand; landFraction?: number; coastWarp?: number } = {};
  if (carried.type) overrides.mapType = carried.type;
  if (carried.band) overrides.band = carried.band;
  if (carried.land != null) overrides.landFraction = carried.land;
  if (carried.coast != null) overrides.coastWarp = carried.coast;
  runJob({
    kind: "draw",
    seed,
    overrides,
    render: { style, widthPx: PREVIEW_WIDTH, legend: carried.legend, arms: carried.arms, beasts: carried.beasts, theme: carried.theme || undefined },
  })
    .then((res) => {
      if (myGen !== drawGen) return;
      // res.svg is engine-rendered markup from the uint32 seed and allowlisted params: no user string reaches the SVG, the same trusted-string injection the Explorer does.
      preview.innerHTML = res.svg;
      startArrival(preview.querySelector("svg"));
      writeHash(seed, style);
      status.textContent = "";
      caption.textContent = `${res.title} · seed ${seed}`;
      lastSeed = seed;
      lastTitle = res.title;
      // overrides is built fresh per draw and never mutated, so holding the reference is safe.
      posterBasis = { seed, style, overrides, legend: carried.legend, arms: carried.arms, beasts: carried.beasts, theme: carried.theme || undefined };
      drawing = false;
      refreshOrderControls(); // the new world is on the desk: re-open the counter (unless an order still holds it)
      enableBind();
    })
    .catch((err) => {
      if (myGen !== drawGen) return;
      drawing = false;
      status.textContent = "The press jammed: " + err.message;
      // The previous proof is still on the desk and posterBasis still matches it: re-open the order surface, or a worker crash mid-redraw would leave the plates and Bind stuck disabled.
      refreshOrderControls();
      enableBind();
    });
}

$("pr-draw").addEventListener("click", draw);
seedInput.addEventListener("keydown", (e) => { if (e.key === "Enter") draw(); });
styleSel.addEventListener("change", draw);
$("pr-random").addEventListener("click", () => { seedInput.value = String(randomSeed()); draw(); });
// #217: a fresh Pressed-as choice makes a pulled plate's status stale, so dismiss it; an in-flight order keeps its line (its completion rewrites it either way).
formatSel.addEventListener("change", () => {
  if (!ordering) posterStatus.textContent = "";
});

// #134: a wide poster SVG goes STRAIGHT to a Blob download, NEVER injected into the live DOM (a multi-MB innerHTML swap is the epic's one hard warning).
function downloadBlob(blob: Blob, filename: string): void {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function downloadSvg(svg: string, filename: string): void {
  downloadBlob(new Blob([svg], { type: "image/svg+xml" }), filename);
}

// Read at click time, like the basis snapshot; defaults to SVG (png1/png2 map to the rasterizer's x1/x2 scale).
function selectedFormat(): string {
  const el = document.getElementById("pr-format") as HTMLSelectElement | null;
  return el ? el.value : "svg";
}

function orderPoster(key: string): void {
  const preset = presetByKey.get(key);
  // #212: the plates are disabled during a draw, so a real click cannot land mid-redraw, but a programmatic call must not press the stale, about-to-change posterBasis either.
  if (!preset || ordering || drawing || !posterBasis) return;
  // Snapshot synchronously: the preview controls stay live during a render, so a style change could redraw and reassign posterBasis mid-flight.
  const basis = posterBasis;
  // #217: the chart IGNORES the format select rather than pinning it (the plates are instant-order buttons), and its width skips clampPosterWidth (the 2400 poster floor would silently raise 1500).
  const isChart = preset.key === CHART_PRESET.key;
  const format = isChart ? "svg" : selectedFormat(); // snapshot alongside the basis; a later click can change it
  const width = isChart ? CHART_PRESET.width : clampPosterWidth(preset.width);
  const myGen = ++posterGen;
  ordering = true;
  refreshOrderControls();
  posterStatus.textContent = `The press is rolling at ${width}px…`;
  runJob({
    kind: "draw",
    seed: basis.seed,
    overrides: basis.overrides,
    render: { style: basis.style, widthPx: width, legend: basis.legend, arms: basis.arms, beasts: basis.beasts, theme: basis.theme },
  })
    .then(async (res) => {
      if (myGen !== posterGen) return;
      if (format === "svg") {
        // The chart reuses the Explorer's exact artifact name (byte-parity by construction: same worker, same draw kind, same widthPx); the posters keep width-stamped names.
        const filename = isChart
          ? chartFilename(basis.seed, basis.style, res.title)
          : posterFilename(basis.seed, basis.style, width);
        downloadSvg(res.svg, filename);
        // e2e observation point: the poster the press pulled, which never touches the DOM.
        window.__vellumLastPoster = { svg: res.svg, filename, width, seed: basis.seed, style: basis.style };
        posterStatus.textContent = isChart
          ? `The chart is pulled as the engraving: ${filename}`
          : `${preset.label} plate pulled: ${filename}`;
        return;
      }
      // PNG: rasterized client-side off a blob-URL Image, still never entering the DOM; failures reject with an in-voice full sentence, shown directly.
      const scale = format === "png2" ? 2 : 1;
      let png;
      try {
        png = await rasterizeSvg(res.svg, { scale });
      } catch (err) {
        if (myGen !== posterGen) return;
        posterStatus.textContent = (err as Error).message;
        return;
      }
      if (myGen !== posterGen) return; // a newer order landed while rasterizing
      const filename = posterPngFilename(basis.seed, basis.style, png.width);
      downloadBlob(png.blob, filename);
      // e2e observation point: dimensions + blob size, never the bytes.
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
      // #212: re-open ONLY if no draw is now in flight; a redraw started while this order rolled must keep the plates closed until its own proof settles.
      ordering = false;
      refreshOrderControls();
    });
}

for (const b of plateButtons) b.addEventListener("click", () => orderPoster(b.dataset.poster as string));

await initWorker();
// #136: getBasis reads the LIVE posterBasis at click time, the same snapshot the poster order uses.
initBoundAtlas(() => posterBasis);
window.__vellumPrintRoomUsesWorker = usesWorker;
window.__vellumPrintRoomState = () => ({ seed: lastSeed, title: lastTitle });
window.__vellumClampPosterWidth = clampPosterWidth; // e2e: the tab-killing-width guard
if (!usesWorker()) warning.hidden = false; // inline fallback: large plates will pause the tab

applyHash();
// A bare visit lands on today's seed-of-the-day (UTC), the same default world as the Explorer and the Today page.
if (!seedInput.value) seedInput.value = String(seedForDate(new Date()));
draw();
