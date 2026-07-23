import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MAX_PIXELS,
  readSvgSize,
  fitScaleToBudget,
  rasterizeErrorMessage,
  rasterizeSvg,
} from "../../public/lib/rasterize.js";

// #135 (epic #132) Sub 3: the client-side SVG->PNG rasterizer. The platform half
// (blob-URL Image + canvas + toBlob) is browser-only and proven by the print-room e2e;
// the DECISION math is pure and DOM-free, so it lives here as the honest unit RED:
// reading the plate's native size, fitting a scale under the pixel budget, and the
// in-voice failure copy. rasterize.js keeps every DOM reference inside a function body,
// so this Node import touches only the pure exports.

// A poster-shaped SVG root: width BEFORE height (the engine's order, verified against the
// committed hero chart), and the decoy data-vellum-grid-w/h that a naive `width=` regex
// would wrongly capture as 320x240 instead of 4200x3150.
const POSTER_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="4200" height="3150" ' +
  'viewBox="0 0 4200 3150" data-vellum-grid-w="320" data-vellum-grid-h="240"></svg>';

test("readSvgSize reads the ROOT width/height, not the grid-w/grid-h decoys", () => {
  assert.deepEqual(readSvgSize(POSTER_SVG), { width: 4200, height: 3150 });
});

test("readSvgSize throws a friendly error when there is no svg root", () => {
  assert.throws(() => readSvgSize("<div>not a chart</div>"), /svg/i);
});

// The second validation branch: a real <svg> root that carries no width/height (the exact
// case the \swidth/\sheight guard exists to catch). Without a test, a regression that broke
// that guard would silently return {width:NaN,height:NaN} and every other test would pass.
test("readSvgSize throws when the svg root has no width/height", () => {
  assert.throws(() => readSvgSize('<svg viewBox="0 0 1 1"></svg>'), /width|height/i);
});

// The budget guardrail (24 megapixels by default). A browser canvas has a hard pixel
// ceiling the CLI never faced; over it, toBlob silently returns a smaller or null image.
test("MAX_PIXELS is the 24 megapixel default budget", () => {
  assert.equal(MAX_PIXELS, 24_000_000);
});

test("fitScaleToBudget passes a request through untouched when it fits (Desk 2400 x2)", () => {
  // 2400x1800 * 2^2 = 17.28 Mpx <= 24 Mpx.
  const fit = fitScaleToBudget(2400, 1800, 2, MAX_PIXELS);
  assert.equal(fit.scale, 2);
  assert.equal(fit.clamped, false);
});

test("fitScaleToBudget passes x1 through untouched (Desk 2400 x1)", () => {
  const fit = fitScaleToBudget(2400, 1800, 1, MAX_PIXELS);
  assert.equal(fit.scale, 1);
  assert.equal(fit.clamped, false);
});

test("fitScaleToBudget clamps a request that busts the budget (Grand 4200 x2)", () => {
  // 4200x3150 * 2^2 = 52.9 Mpx > 24 Mpx, so x2 must be reduced.
  const fit = fitScaleToBudget(4200, 3150, 2, MAX_PIXELS);
  assert.equal(fit.clamped, true);
  assert.ok(fit.scale > 1 && fit.scale < 2, `scale ${fit.scale} should be between 1 and 2`);
  // The clamped scale sits the render EXACTLY on the budget (area * scale^2 == budget),
  // never over it.
  assert.ok(
    4200 * 3150 * fit.scale * fit.scale <= MAX_PIXELS + 1e-3,
    `clamped area ${4200 * 3150 * fit.scale * fit.scale} exceeds budget`,
  );
});

test("fitScaleToBudget never returns a scale larger than requested", () => {
  const fit = fitScaleToBudget(4200, 3150, 2, MAX_PIXELS);
  assert.ok(fit.scale <= 2);
});

// The module's reuse contract (#123 with arbitrary art): even a request of x1 is fitted
// BELOW 1 when the source alone busts the budget, so a would-be consumer never over-
// allocates. 8000x6000 = 48 Mpx > 24 Mpx even at x1.
test("fitScaleToBudget clamps below x1 when the source alone busts the budget", () => {
  const fit = fitScaleToBudget(8000, 6000, 1, MAX_PIXELS);
  assert.equal(fit.clamped, true);
  assert.ok(fit.scale < 1, `scale ${fit.scale} should be below 1`);
  assert.ok(8000 * 6000 * fit.scale * fit.scale <= MAX_PIXELS + 1e-3);
});

test("rasterizeErrorMessage gives a distinct, in-voice message per failure kind", () => {
  const decode = rasterizeErrorMessage("decode");
  const toBlob = rasterizeErrorMessage("toBlob");
  const context = rasterizeErrorMessage("context");
  for (const m of [decode, toBlob, context]) {
    assert.equal(typeof m, "string");
    assert.ok(m.length > 0, "message should be non-empty");
    assert.ok(!m.includes("—"), "published copy is em-dash-free");
  }
  // Each failure path says something specific, never one generic null-swallowing line.
  assert.notEqual(decode, toBlob);
  assert.notEqual(toBlob, context);
  assert.notEqual(decode, context);
});

test("rasterizeErrorMessage falls back to a generic line for an unknown kind", () => {
  const generic = rasterizeErrorMessage("something-unexpected");
  assert.equal(typeof generic, "string");
  assert.ok(generic.length > 0);
});

// Integration proof of the "never a silent null" acceptance for the one failure path that
// is reachable without a DOM: rasterizeSvg reads the svg size BEFORE touching a canvas, so
// malformed markup REJECTS (never resolves undefined). The Image/canvas/toBlob failure
// paths are browser-only and covered by the print-room e2e; this pins the reject wiring.
test("rasterizeSvg rejects on malformed markup instead of resolving a silent null", async () => {
  await assert.rejects(() => rasterizeSvg("<div>not a chart</div>"), /svg/i);
});
