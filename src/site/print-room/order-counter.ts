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
import type { PosterBasis, SheetFace } from "./bound-atlas.ts";
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

const posterStatus = $("pr-poster-status");
const plateButtons = [...document.querySelectorAll<HTMLButtonElement>("[data-poster]")];
const formatSel = $<HTMLSelectElement>("pr-format"); // the "Pressed as" select; greyed out during a draw
// The chart plate rides the same order path as the posters; its divergences branch inside orderPoster.
const presetByKey = new Map([...POSTER_PRESETS, CHART_PRESET].map((p): [string, PosterPreset] => [p.key, p]));

let host: CounterHost = {
  basis: () => null,
  drawing: () => false,
  face: { showProof: () => {}, showPlate: () => {}, showMatter: () => {} },
};
let ordering = false; // an order is at the press; the plates are disabled meanwhile
let posterGen = 0; // drawGen-style stale guard; the button-disable is the operative guard

// The single gate for the order surface: consulting BOTH `drawing` and `ordering` closes the race in both directions (a redraw finishing during an order, an order finishing during a redraw); the format select greys out for the draw round-trip only, its value snapshotted at order time.
export function refreshOrderControls(): void {
  const platesReady = host.basis() != null && !host.drawing() && !ordering;
  for (const b of plateButtons) b.disabled = !platesReady;
  formatSel.disabled = host.drawing();
}

export function clearPosterStatus(): void {
  posterStatus.textContent = "";
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

export function initOrderCounter(counterHost: CounterHost): void {
  host = counterHost;
  // A fresh Pressed-as choice makes a pulled plate's status stale, so dismiss it; an in-flight order keeps its line (its completion rewrites it either way).
  formatSel.addEventListener("change", () => {
    if (!ordering) posterStatus.textContent = "";
  });
  for (const b of plateButtons) b.addEventListener("click", () => orderPoster(b.dataset.poster as string));
}
