import { test } from "node:test";
import assert from "node:assert/strict";
import {
  POSTER_PRESETS,
  clampPosterWidth,
  posterFilename,
  posterPngFilename,
} from "../../src/site/print-room/poster-presets.ts";

// #134 (epic #132) Sub 2: the Print Room's poster plates. The pure logic lives in a
// DOM-free browser module (mirrors sheet-turn.js), so the width clamp -- the guard
// against a hand-edited width killing the tab -- is unit-testable here. The worker
// wiring and download are proven by the print-room e2e suite (PR10-PR14).

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

// Grand's 4200 is the largest poster width. The Print Room poster and every other entry
// point share defaultRecipe + renderMap, so the render OPTIONS (width, legend/arms/theme)
// are the only divergence surface; pinning Grand to 4200 pins the width side of the
// acceptance-4 covenant (the SVG side is in test/cli/poster-parity.test.ts).
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

test("posterFilename is a self-describing artifact name", () => {
  assert.equal(posterFilename(42, "antique", 4200), "vellum-poster-42-antique-4200.svg");
  assert.equal(posterFilename(100, "nautical", 2400), "vellum-poster-100-nautical-2400.svg");
});

// The PNG twin (#135). It takes the OUTPUT pixel width (post scale + budget fit), not the
// plate width, so Desk x1 (2400) and Desk x2 (4800) never collide on one name, and a
// budget-clamped Grand carries its real reduced width.
test("posterPngFilename names a PNG by its output pixel width", () => {
  assert.equal(posterPngFilename(42, "antique", 2400), "vellum-poster-42-antique-2400.png");
  assert.equal(posterPngFilename(42, "antique", 4800), "vellum-poster-42-antique-4800.png");
  assert.equal(posterPngFilename(100, "nautical", 5657), "vellum-poster-100-nautical-5657.png");
});
