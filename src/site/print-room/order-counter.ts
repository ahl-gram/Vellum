// The Print Room's order counter: the head's two dropdowns, the four presses and the line under them; it presses a poster through the shared worker, or the road from the capital the room asked for when the proof landed, and keeps the head in step with whatever is on the sheet.
import { runJob, type DrawResult } from "../explorer/worker-client.ts";
import {
  POSTER_PRESETS,
  CHART_PRESET,
  clampPosterWidth,
  posterFilename,
  posterPngFilename,
  chartFilename,
  type PosterPreset,
} from "./poster-presets.ts";
import { rasterizeSvg, type RasterizeResult } from "../shared/rasterize.ts";
import { plateDressFor, type ProspectDress } from "../../prospect/dress/context.ts";
import { plateAspect } from "./plate-aspect.ts";
import { turnToSection, type PosterBasis, type SheetFace } from "./bound-atlas.ts";
import {
  ROAD_PRESETS,
  caveatTail,
  pressVerb,
  pressesFor,
  pressingLabel,
  roadAtWidth,
  roadChoice,
  roadFilename,
  roadLine,
  roadOnOffer,
  roadPngFilename,
  roadTitle,
  type Pressing,
  type RoadState,
} from "./road-press.ts";
import { errorText } from "../shared/error-text.ts";
import { $ } from "../shared/by-id.ts";
import { downloadBlob } from "../shared/object-url.ts";
import type { StyleName } from "../../render/style.ts";

declare global {
  interface Window {
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

export interface CounterHost {
  readonly basis: () => PosterBasis | null;
  readonly drawing: () => boolean;
  readonly face: SheetFace;
}

interface Road {
  readonly svg: string;
  readonly href: string;
  readonly title: string;
  readonly line: string;
  readonly dress: ProspectDress;
  readonly seed: number;
}

const posterStatus = $("pr-poster-status");
const plateButtons = [...document.querySelectorAll<HTMLButtonElement>("[data-poster]")];
const formatSel = $<HTMLSelectElement>("pr-format"); // the "Pressed as" select; greyed out during a draw
// The chart plate rides the same order path as the posters; its divergences branch inside orderPoster.
const presetByKey = new Map([...POSTER_PRESETS, CHART_PRESET].map((p): [string, PosterPreset] => [p.key, p]));
const pressingSel = $<HTMLSelectElement>("pr-pressing");
const roadOption = pressingSel.querySelector<HTMLOptionElement>('option[value="road"]')!;
const legendNav = document.querySelector<HTMLElement>("nav.legend")!;
const legendRow = legendNav.querySelector<HTMLElement>(".legend-row")!;
const noteTail = $("pr-note-tail");

let host: CounterHost = {
  basis: () => null,
  drawing: () => false,
  face: { showProof: () => {}, showPlate: () => {}, showMatter: () => {} },
};
let ordering = false; // an order is at the press; the plates are disabled meanwhile
let posterGen = 0; // drawGen-style stale guard; the button-disable is the operative guard
let roadGen = 0;
let road: Road | null = null;
let roadState: RoadState = "pending";
let pressing: Pressing = "poster";

// The single gate for the order surface: consulting BOTH `drawing` and `ordering` closes the race in both directions (a redraw finishing during an order, an order finishing during a redraw); the format select greys out for the draw round-trip only, its value snapshotted at order time.
export function refreshOrderControls(): void {
  const platesReady = host.basis() != null && !host.drawing() && !ordering;
  for (const b of plateButtons) b.disabled = !platesReady;
  formatSel.disabled = host.drawing();
  pressingSel.disabled = host.drawing();
}

export function clearPosterStatus(): void {
  posterStatus.textContent = "";
}

function paintRoadChoice(): void {
  const choice = roadChoice(roadState);
  roadOption.textContent = choice.text;
  roadOption.disabled = choice.disabled;
}

export function dropRoad(): void {
  roadGen++;
  if (road !== null) URL.revokeObjectURL(road.href);
  road = null;
  roadState = "pending";
  paintRoadChoice();
}

export function askRoad(basis: PosterBasis): void {
  const myGen = ++roadGen;
  const dress = plateDressFor(basis.style);
  runJob({ kind: "ribbon", seed: basis.seed, overrides: basis.overrides, from: null, to: null, dress })
    .then((res) => {
      if (myGen !== roadGen) return;
      if (roadOnOffer(res)) {
        road = {
          svg: res.svg,
          href: URL.createObjectURL(new Blob([res.svg], { type: "image/svg+xml" })),
          title: roadTitle(res.fromName, res.toName),
          line: roadLine(res.fromName, res.toName),
          dress,
          seed: basis.seed,
        };
      }
      roadState = road === null ? "none" : "drawn";
      paintRoadChoice();
    })
    .catch(() => {
      if (myGen !== roadGen) return;
      roadState = "none";
      paintRoadChoice();
    });
}

export function sheetShows(shown: Pressing): void {
  pressing = shown === "road" && road !== null ? "road" : "poster";
  pressingSel.value = pressing;
  const presses = pressesFor(pressing);
  for (const [i, b] of plateButtons.entries()) {
    const preset = presses[i]!;
    b.dataset.poster = preset.key;
    b.querySelector(".verb")!.textContent = pressVerb(preset);
    b.querySelector(".room")!.textContent = preset.label;
  }
  const label = pressingLabel(pressing);
  legendNav.setAttribute("aria-label", label);
  legendRow.setAttribute("aria-label", label);
  noteTail.textContent = caveatTail(pressing);
  refreshOrderControls();
}

function layRoad(): void {
  if (road === null) return;
  host.face.showPlate({
    href: road.href,
    title: road.title,
    line: road.line,
    section: "ribbon",
    aspect: plateAspect(road.svg),
  });
}

function choosePressing(): void {
  if (!ordering) posterStatus.textContent = "";
  if (pressingSel.value === "road") {
    if (!turnToSection("ribbon")) layRoad();
  } else if (!turnToSection("hero")) host.face.showProof();
}

// A wide poster SVG goes STRAIGHT to a Blob download, NEVER injected into the live DOM (a multi-MB innerHTML swap is the Issue #132 epic's one hard warning).
function downloadSvg(svg: string, filename: string): void {
  downloadBlob(new Blob([svg], { type: "image/svg+xml" }), filename);
}

// Read at click time, like the basis snapshot; defaults to SVG (png1/png2 map to the rasterizer's x1/x2 scale).
function selectedFormat(): string {
  const el = document.getElementById("pr-format") as HTMLSelectElement | null;
  return el ? el.value : "svg";
}

function orderShape(preset: Readonly<PosterPreset>): { isChart: boolean; format: string; width: number } {
  // The chart IGNORES the format select rather than pinning it (the plates are instant-order buttons), and its width skips clampPosterWidth (the 2400 poster floor would silently raise 1500).
  const isChart = preset.key === CHART_PRESET.key;
  const format = isChart ? "svg" : selectedFormat(); // snapshot alongside the basis; a later click can change it
  const width = isChart ? CHART_PRESET.width : clampPosterWidth(preset.width);
  return { isChart, format, width };
}

function pullSvg(
  res: Readonly<DrawResult>,
  basis: Readonly<PosterBasis>,
  isChart: boolean,
  width: number,
  preset: Readonly<PosterPreset>,
): void {
  // The chart reuses the Explorer's exact artifact name (byte-parity by construction: same worker, same draw kind, same widthPx); the posters keep width-stamped names.
  const filename = isChart
    ? chartFilename(basis.seed, basis.style, res.title)
    : posterFilename(basis.seed, basis.style, width);
  downloadSvg(res.svg, filename);
  window.__vellumLastPoster = { svg: res.svg, filename, width, seed: basis.seed, style: basis.style };
  posterStatus.textContent = isChart
    ? `The chart is pulled as the engraving: ${filename}`
    : `${preset.label} plate pulled: ${filename}`;
}

function pressPng(png: Readonly<RasterizeResult>, basis: Readonly<PosterBasis>, preset: Readonly<PosterPreset>): void {
  const filename = posterPngFilename(basis.seed, basis.style, png.width);
  downloadBlob(png.blob, filename);
  window.__vellumLastPng = {
    filename,
    type: png.blob.type,
    size: png.blob.size,
    width: png.width,
    height: png.height,
    scale: png.scale,
    clamped: png.clamped,
    seed: basis.seed,
    style: basis.style,
  };
  posterStatus.textContent = png.clamped
    ? `${preset.label} plate pressed at reduced resolution to fit this browser: ${filename}`
    : `${preset.label} plate pressed: ${filename}`;
}

function orderSettled(): void {
  // Re-open ONLY if no draw is now in flight; a redraw started while this order rolled must keep the plates closed until its own proof settles.
  ordering = false;
  refreshOrderControls();
}

function orderPoster(key: string): void {
  const preset = presetByKey.get(key);
  // The plates are disabled during a draw, so a real click cannot land mid-redraw, but a programmatic call must not press the stale, about-to-change posterBasis either.
  if (!preset || ordering || host.drawing() || !host.basis()) return;
  // Snapshot synchronously: the preview controls stay live during a render, so a style change could redraw and reassign posterBasis mid-flight.
  const basis = host.basis()!;
  const { isChart, format, width } = orderShape(preset);
  const myGen = ++posterGen;
  ordering = true;
  refreshOrderControls();
  posterStatus.textContent = `The press is rolling at ${width}px…`;
  runJob({
    kind: "draw",
    seed: basis.seed,
    overrides: basis.overrides,
    render: {
      style: basis.style,
      widthPx: width,
      legend: basis.legend,
      arms: basis.arms,
      beasts: basis.beasts,
      theme: basis.theme,
    },
  })
    .then(async (res) => {
      if (myGen !== posterGen) return;
      if (format === "svg") {
        pullSvg(res, basis, isChart, width, preset);
        return;
      }
      // PNG: rasterized client-side off a blob-URL Image, still never entering the DOM; failures reject with an in-voice full sentence, shown directly.
      const scale = format === "png2" ? 2 : 1;
      let png;
      try {
        png = await rasterizeSvg(res.svg, { scale });
      } catch (err) {
        if (myGen !== posterGen) return;
        posterStatus.textContent = errorText(err);
        return;
      }
      if (myGen !== posterGen) return; // a newer order landed while rasterizing
      pressPng(png, basis, preset);
    })
    .catch((err: unknown) => {
      if (myGen !== posterGen) return;
      posterStatus.textContent = "The press jammed: " + errorText(err);
    })
    .finally(() => orderSettled());
}

function pullRoad(svg: string, held: Road, preset: Readonly<PosterPreset>): void {
  const filename = roadFilename(held.seed, held.dress, preset.width);
  downloadSvg(svg, filename);
  window.__vellumLastPoster = { svg, filename, width: preset.width, seed: held.seed, style: held.dress };
  posterStatus.textContent = `${preset.label} plate pulled: ${filename}`;
}

function pressRoadPng(png: Readonly<RasterizeResult>, held: Road, preset: Readonly<PosterPreset>): void {
  const filename = roadPngFilename(held.seed, held.dress, png.width);
  downloadBlob(png.blob, filename);
  window.__vellumLastPng = {
    filename,
    type: png.blob.type,
    size: png.blob.size,
    width: png.width,
    height: png.height,
    scale: png.scale,
    clamped: png.clamped,
    seed: held.seed,
    style: held.dress,
  };
  posterStatus.textContent = png.clamped
    ? `${preset.label} plate pressed at reduced resolution to fit this browser: ${filename}`
    : `${preset.label} plate pressed: ${filename}`;
}

function orderRoad(key: string): void {
  const preset = ROAD_PRESETS.find((p) => p.key === key);
  const held = road;
  if (!preset || !held || ordering || host.drawing() || !host.basis()) return;
  const format = selectedFormat();
  const myGen = ++posterGen;
  ordering = true;
  refreshOrderControls();
  posterStatus.textContent = `The press is rolling at ${preset.width}px…`;
  Promise.resolve()
    .then(async () => {
      const svg = roadAtWidth(held.svg, preset.width);
      if (myGen !== posterGen) return;
      if (format === "svg") {
        pullRoad(svg, held, preset);
        return;
      }
      const scale = format === "png2" ? 2 : 1;
      let png;
      try {
        png = await rasterizeSvg(svg, { scale });
      } catch (err) {
        if (myGen !== posterGen) return;
        posterStatus.textContent = errorText(err);
        return;
      }
      if (myGen !== posterGen) return;
      pressRoadPng(png, held, preset);
    })
    .catch((err: unknown) => {
      if (myGen !== posterGen) return;
      posterStatus.textContent = "The press jammed: " + errorText(err);
    })
    .finally(() => orderSettled());
}

function orderAt(key: string): void {
  if (pressing === "road") orderRoad(key);
  else orderPoster(key);
}

export function initOrderCounter(counterHost: CounterHost): void {
  host = counterHost;
  // A fresh Pressed-as choice makes a pulled plate's status stale, so dismiss it; an in-flight order keeps its line (its completion rewrites it either way).
  formatSel.addEventListener("change", () => {
    if (!ordering) posterStatus.textContent = "";
  });
  pressingSel.addEventListener("change", choosePressing);
  for (const b of plateButtons)
    b.addEventListener("click", () => {
      const key = b.dataset.poster as string;
      orderAt(key);
    });
}
