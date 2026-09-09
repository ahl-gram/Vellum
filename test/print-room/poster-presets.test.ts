import { test } from "node:test";
import assert from "node:assert/strict";
import {
  POSTER_PRESETS,
  CHART_PRESET,
  clampPosterWidth,
  posterFilename,
  posterPngFilename,
  chartFilename,
} from "../../src/site/print-room/poster-presets.ts";

// The width clamp is unit-testable in the DOM-free module; the worker wiring and download are the print-room e2e's (PR10-PR14).

test("the three plate presets are Desk 2400, Wall 3300, Grand 4200", () => {
  assert.deepEqual(
    POSTER_PRESETS.map((p) => [p.key, p.width]),
    [
      ["desk", 2400],
      ["wall", 3300],
      ["grand", 4200],
    ],
  );
});

// The width side of the acceptance-4 covenant; the SVG side is test/cli/poster-parity.test.ts.
test("the Grand preset is the 4200 poster width", () => {
  const grand = POSTER_PRESETS.find((p) => p.key === "grand");
  assert.ok(grand);
  assert.equal(grand.width, 4200);
});

test("clampPosterWidth bounds a tab-killing width to the Grand ceiling", () => {
  assert.equal(clampPosterWidth(999999), 4200);
  assert.equal(clampPosterWidth(50000), 4200);
  assert.equal(clampPosterWidth(4201), 4200);
});

test("clampPosterWidth bounds an under-size width to the Desk floor", () => {
  assert.equal(clampPosterWidth(2399), 2400);
  assert.equal(clampPosterWidth(10), 2400);
  assert.equal(clampPosterWidth(0), 2400);
  assert.equal(clampPosterWidth(-5), 2400);
});

test("clampPosterWidth passes the presets through unchanged", () => {
  assert.equal(clampPosterWidth(2400), 2400);
  assert.equal(clampPosterWidth(3300), 3300);
  assert.equal(clampPosterWidth(4200), 4200);
});

test("clampPosterWidth falls back to Grand for a non-number", () => {
  assert.equal(clampPosterWidth(Number.NaN), 4200);
  assert.equal(clampPosterWidth("nonsense"), 4200);
  assert.equal(clampPosterWidth(undefined), 4200);
});

test("the chart plate is its own preset at the covenant width, outside the poster envelope", () => {
  assert.equal(CHART_PRESET.key, "chart");
  assert.equal(CHART_PRESET.label, "Chart");
  assert.equal(CHART_PRESET.width, 1500);
  assert.ok(!POSTER_PRESETS.some((p) => p.key === CHART_PRESET.key));
  assert.equal(clampPosterWidth(CHART_PRESET.width), 2400);
});

// These pins ARE the naming contract, warts included (an apostrophe becomes a dash run).
test("chartFilename mirrors the Explorer's download name, title slug included", () => {
  assert.equal(chartFilename(42, "antique", "The Isle of Rahai"), "vellum-42-antique-the-isle-of-rahai.svg");
  assert.equal(chartFilename(100, "nautical", "The Great Woaku"), "vellum-100-nautical-the-great-woaku.svg");
  assert.equal(chartFilename(7, "ink", "Wayfarer's Rest"), "vellum-7-ink-wayfarer-s-rest.svg");
});

test("posterFilename is a self-describing artifact name", () => {
  assert.equal(posterFilename(42, "antique", 4200), "vellum-poster-42-antique-4200.svg");
  assert.equal(posterFilename(100, "nautical", 2400), "vellum-poster-100-nautical-2400.svg");
});

test("posterPngFilename names a PNG by its output pixel width", () => {
  assert.equal(posterPngFilename(42, "antique", 2400), "vellum-poster-42-antique-2400.png");
  assert.equal(posterPngFilename(42, "antique", 4800), "vellum-poster-42-antique-4800.png");
  assert.equal(posterPngFilename(100, "nautical", 5657), "vellum-poster-100-nautical-5657.png");
});
