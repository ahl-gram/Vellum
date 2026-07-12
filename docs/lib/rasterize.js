// The atelier's rasterizer (#135, epic #132 Sub 3). SVG string in, PNG Blob out, with
// zero dependencies: a blob-URL Image, a canvas, and toBlob. It is deliberately the
// site's first cross-page client library (docs/lib/), page-agnostic and importing
// nothing, so the Print Room's poster PNGs, the Surveyor's Dispatch (#123 v3), and any
// future card compositor share one code path.
//
// PNGs are OUT of the determinism covenant: the CLI already never byte-compared rasters,
// and a canvas PNG bakes the VIEWER's installed serif fonts, so two machines can differ
// subtly. The SVG download stays the byte-faithful archival artifact; PNG is the
// convenience copy. Never add a PDF/PNG byte check on the strength of this module.
//
// DOM discipline: every browser reference (Image, canvas, document, URL, Blob) lives
// INSIDE rasterizeSvg's body, so the pure decision core below (readSvgSize,
// fitScaleToBudget, rasterizeErrorMessage) imports cleanly into Node for unit testing.

// The pixel budget a browser canvas imposes that the CLI's headless screenshot never
// did. Over this ceiling toBlob can silently return a smaller image or null, so a
// too-large request is fitted DOWN to the budget with a visible notice rather than
// failing quietly. 24 megapixels clears every in-envelope poster at x1 (Grand 4200 is
// ~13.2 Mpx) and forces the fallback exactly where it should: Grand and Wall at x2. Note
// older iOS Safari caps its canvas well below this, which is why the failure paths below
// surface a message instead of a silent null.
export const MAX_PIXELS = 24_000_000;

// Read the ROOT <svg>'s pixel width/height. Scoped to the opening tag and anchored on a
// leading space (`\swidth=`), so the data-vellum-grid-w / grid-h attributes a naive
// `width=` regex would grab (320x240) are never mistaken for the render size (4200x3150).
export function readSvgSize(svg) {
  const root = /<svg\b[^>]*>/i.exec(String(svg));
  if (!root) throw new Error("no <svg> root found in the markup to rasterize");
  const tag = root[0];
  const w = /\swidth="(\d+(?:\.\d+)?)"/.exec(tag);
  const h = /\sheight="(\d+(?:\.\d+)?)"/.exec(tag);
  if (!w || !h) throw new Error("the <svg> root carries no width/height to rasterize");
  return { width: Number(w[1]), height: Number(h[1]) };
}

// Fit a requested scale under the pixel budget. Returns the requested scale untouched
// when width*height*scale^2 fits; otherwise the largest scale that sits the render
// EXACTLY on the budget (area * scale^2 == maxPixels), flagged clamped so the caller can
// tell the visitor the resolution was reduced. Pure; the continuous fit maximizes
// resolution within budget and generalizes past the x1/x2 poster presets for #123.
export function fitScaleToBudget(width, height, requestedScale, maxPixels) {
  const area = width * height;
  if (!Number.isFinite(area) || area <= 0 || !Number.isFinite(maxPixels) || maxPixels <= 0) {
    return { scale: requestedScale, clamped: false };
  }
  const maxScale = Math.sqrt(maxPixels / area);
  if (requestedScale <= maxScale) return { scale: requestedScale, clamped: false };
  return { scale: maxScale, clamped: true };
}

// In-voice failure copy, one line per path, so a rasterize failure is a legible notice at
// the counter, never a silent null. Survey-office register, em-dash-free (published copy).
const RASTERIZE_MESSAGES = {
  decode: "The proof would not resolve into an image, so the plate could not be pulled as a PNG.",
  toBlob: "The press pulled a blank plate: the browser returned no image data.",
  context: "This browser would not lend a drawing canvas, so no PNG could be pressed.",
};
const RASTERIZE_FALLBACK = "The plate could not be pulled as a PNG.";

export function rasterizeErrorMessage(kind) {
  return RASTERIZE_MESSAGES[kind] || RASTERIZE_FALLBACK;
}

// Rasterize an SVG string to a PNG Blob. Returns the blob plus the actual output size and
// the fitted scale (and whether it was clamped) so the caller can name the file and post
// a resolution notice. Resolves the return object, not a bare Blob, precisely because the
// clamp flag has to reach the UI. Every failure path rejects with an in-voice message.
export async function rasterizeSvg(svgString, opts = {}) {
  const requestedScale = Number(opts.scale) > 0 ? Number(opts.scale) : 1;
  const maxPixels = Number(opts.maxPixels) > 0 ? Number(opts.maxPixels) : MAX_PIXELS;
  const { width, height } = readSvgSize(svgString);
  const { scale, clamped } = fitScaleToBudget(width, height, requestedScale, maxPixels);
  const outW = Math.max(1, Math.round(width * scale));
  const outH = Math.max(1, Math.round(height * scale));

  const url = URL.createObjectURL(new Blob([svgString], { type: "image/svg+xml" }));
  try {
    const img = new Image();
    await new Promise((resolve, reject) => {
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
    const blob = await new Promise((resolve, reject) => {
      // A tainted canvas (an SVG with external resources) makes toBlob throw a
      // SecurityError synchronously; our charts are self-contained, but map it anyway so a
      // future external-asset SVG surfaces a notice rather than an uncaught throw.
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
