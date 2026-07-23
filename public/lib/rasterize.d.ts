// Types for rasterize.js, consumed from TypeScript by the unit tests
// (test/print-room/rasterize.test.ts). Only the pure decision core (readSvgSize,
// fitScaleToBudget, rasterizeErrorMessage, MAX_PIXELS) is exercised in Node; rasterizeSvg
// is browser-only (Image/canvas/toBlob) and proven by the print-room e2e (PR17+).

/** The canvas pixel budget: 24 megapixels. A larger render is fitted down to it. */
export const MAX_PIXELS: number;

export interface SvgSize {
  width: number;
  height: number;
}

/** Read the ROOT svg's pixel width/height (not the data-vellum-grid-w/h decoys). */
export function readSvgSize(svg: string): SvgSize;

export interface ScaleFit {
  /** The scale to render at: the request if it fits, else the largest that does. */
  scale: number;
  /** True when the request was reduced to sit under the pixel budget. */
  clamped: boolean;
}

/** Fit a requested scale under a pixel budget, maximizing resolution within it. */
export function fitScaleToBudget(
  width: number,
  height: number,
  requestedScale: number,
  maxPixels: number,
): ScaleFit;

/** An in-voice, em-dash-free failure line per path; unknown kinds get a generic line. */
export function rasterizeErrorMessage(kind: string): string;

export interface RasterizeOptions {
  /** Requested output scale (x1, x2); fitted down if it busts the budget. */
  scale?: number;
  /** Pixel budget override; defaults to MAX_PIXELS. */
  maxPixels?: number;
}

export interface RasterizeResult {
  blob: Blob;
  /** Actual output pixel dimensions after any budget fit. */
  width: number;
  height: number;
  /** The scale actually rendered at, and whether it was clamped down. */
  scale: number;
  clamped: boolean;
}

/** SVG string to PNG Blob via blob-URL Image + canvas + toBlob. Browser-only. */
export function rasterizeSvg(svg: string, opts?: RasterizeOptions): Promise<RasterizeResult>;
