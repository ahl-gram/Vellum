import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// #217 Part 2: the Explorer's Download SVG is retired. The Print Room's Chart plate
// (Part 1, live since PR #322) is the covenant take-home, Explorer-named, so the button
// would be a duplicate path; the region-sheet download it also carried was consciously
// dropped (ruling recorded on #217, 2026-07-29). A revisit is a NEW issue (a
// region-aware take-home), not a quiet re-add, which is what these pins are for.
const here = (p: string): string => readFileSync(new URL(p, import.meta.url), { encoding: "utf8" });
const page = here("../../src/pages/explorer/index.astro");
const app = here("../../src/site/explorer/app.ts");
const controls = here("../../src/site/explorer/controls.ts");

test("the Explorer page carries no Download button", () => {
  assert.ok(!page.includes('id="download"'), "the #download button regrew in the Explorer page");
  assert.ok(!page.includes("Download SVG"), "Download SVG copy regrew in the Explorer page");
});

test("the Explorer wiring carries no download plumbing", () => {
  assert.ok(!app.includes("downloadBtn"), "app.ts re-threads a download button");
  assert.ok(!controls.includes("downloadBtn"), "controls.ts re-grew the download handler");
});

// #321 (Survey & Story Sub 4): the Explorer is static. The scrubber panel, Play, the
// bar, the readout, and the journal strip left the page ENTIRELY (gone from the DOM,
// not hidden, per the acceptance); the one checkbox wears the ratified `survey` label
// (#317 decision 1, ratified 2026-07-29) and inks the completed track the way `arms`
// inks the banners. Time lives in the Reading Room.
test("the Explorer page carries no scrubber panel or journal strip (#321)", () => {
  assert.ok(!page.includes('id="scrubber"'), "the #scrubber region regrew in the Explorer page");
  assert.ok(!page.includes('id="scrub-play"'), "the Play button regrew in the Explorer page");
  assert.ok(!page.includes('id="scrub-range"'), "the ages bar regrew in the Explorer page");
  assert.ok(!page.includes("chronicle-strip"), "the journal strip regrew in the Explorer page");
});

test("the one checkbox wears the ratified survey label (#317 decision 1)", () => {
  assert.match(page, /survey <input id="ages"/, "the checkbox label is not the ratified `survey`");
});

test("the Explorer wiring carries no Play/bar plumbing (#321)", () => {
  assert.ok(!controls.includes("scrubPlayBtn"), "controls.ts re-grew the Play wiring");
  assert.ok(!controls.includes("scrubRangeEl"), "controls.ts re-grew the bar wiring");
  assert.ok(!controls.includes("togglePlay"), "controls.ts re-threads the engine's Play clock");
  assert.ok(!app.includes("agesSnapToRest"), "app.ts still snaps an instrument that no longer exists");
  assert.ok(!app.includes("cancelScrubRaf"), "app.ts still cancels a sweep no Explorer path can start");
});
