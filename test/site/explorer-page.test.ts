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
