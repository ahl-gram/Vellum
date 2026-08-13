// The atelier's rasterizer (#135): SVG string in, PNG Blob out (a blob-URL Image, a
// canvas, toBlob); the site's first cross-page client library, page-agnostic. PNGs are
// OUT of the determinism covenant: a canvas PNG bakes the VIEWER's installed serif
// fonts, so never add a PDF/PNG byte check on the strength of this module (the SVG stays
// the byte-faithful archival artifact). Every browser reference lives INSIDE
// rasterizeSvg's body, so the pure decision core imports cleanly into Node for testing.

// Over the budget toBlob can silently return a smaller image or null, so a too-large request is fitted DOWN with a visible notice; older iOS Safari caps well below this.
export const MAX_PIXELS: number = 24_000_000;

export interface SvgSize {
  width: number;
  height: number;
}

// Scoped to the opening tag and anchored on a leading space (`\swidth=`), so the data-vellum-grid-w / grid-h attributes a naive `width=` regex would grab (320x240) are never mistaken for the render size (4200x3150).
export function readSvgSize(svg: string): SvgSize {
  const root = /<svg\b[^>]*>/i.exec(String(svg));
  if (!root) throw new Error("no <svg> root found in the markup to rasterize");
  const tag = root[0];
  const w = /\swidth="(\d+(?:\.\d+)?)"/.exec(tag);
  const h = /\sheight="(\d+(?:\.\d+)?)"/.exec(tag);
  if (!w || !h) throw new Error("the <svg> root carries no width/height to rasterize");
  return { width: Number(w[1]), height: Number(h[1]) };
}

export interface ScaleFit {
  /** The scale to render at: the request if it fits, else the largest that does. */
  scale: number;
  /** True when the request was reduced to sit under the pixel budget. */
  clamped: boolean;
}

// Pure: the requested scale untouched when width*height*scale^2 fits, else the largest scale sitting EXACTLY on the budget, flagged clamped so the caller can tell the visitor.
export function fitScaleToBudget(
  width: number,
  height: number,
  requestedScale: number,
  maxPixels: number,
): ScaleFit {
  const area = width * height;
  if (!Number.isFinite(area) || area <= 0 || !Number.isFinite(maxPixels) || maxPixels <= 0) {
    return { scale: requestedScale, clamped: false };
  }
  const maxScale = Math.sqrt(maxPixels / area);
  if (requestedScale <= maxScale) return { scale: requestedScale, clamped: false };
  return { scale: maxScale, clamped: true };
}

// In-voice failure copy, one line per path, so a rasterize failure is a legible notice, never a silent null. Survey-office register, em-dash-free (published copy).
const RASTERIZE_MESSAGES: Record<string, string> = {
  decode: "The proof would not resolve into an image, so the plate could not be pulled as a PNG.",
  toBlob: "The press pulled a blank plate: the browser returned no image data.",
  context: "This browser would not lend a drawing canvas, so no PNG could be pressed.",
};
const RASTERIZE_FALLBACK = "The plate could not be pulled as a PNG.";

export function rasterizeErrorMessage(kind: string): string {
  return RASTERIZE_MESSAGES[kind] || RASTERIZE_FALLBACK;
}

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

// Resolves the whole result object, not a bare Blob, precisely because the clamp flag has to reach the UI; every failure path rejects with an in-voice message.
export async function rasterizeSvg(
  svgString: string,
  opts: RasterizeOptions = {},
): Promise<RasterizeResult> {
  const requestedScale = Number(opts.scale) > 0 ? Number(opts.scale) : 1;
  const maxPixels = Number(opts.maxPixels) > 0 ? Number(opts.maxPixels) : MAX_PIXELS;
  const { width, height } = readSvgSize(svgString);
  const { scale, clamped } = fitScaleToBudget(width, height, requestedScale, maxPixels);
  const outW = Math.max(1, Math.round(width * scale));
  const outH = Math.max(1, Math.round(height * scale));

  const url = URL.createObjectURL(new Blob([svgString], { type: "image/svg+xml" }));
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(rasterizeErrorMessage("decode")));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error(rasterizeErrorMessage("context"));
    ctx.drawImage(img, 0, 0, outW, outH);
    const blob = await new Promise<Blob>((resolve, reject) => {
      // A tainted canvas (an SVG with external resources) makes toBlob throw a SecurityError synchronously; our charts are self-contained, but map it anyway so a future external-asset SVG surfaces a notice rather than an uncaught throw.
      try {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error(rasterizeErrorMessage("toBlob")));
        }, "image/png");
      } catch {
        reject(new Error(rasterizeErrorMessage("toBlob")));
      }
    });
    return { blob, width: outW, height: outH, scale, clamped };
  } finally {
    URL.revokeObjectURL(url);
  }
}
