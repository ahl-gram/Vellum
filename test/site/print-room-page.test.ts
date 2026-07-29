import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// #217 Part 1: the Print Room's order desk. The "Pressed as" labels speak in the period
// voice (ratified 2026-07-29 on #217), the chart joins the plate row at its own width,
// and the caveat teaches the split. Source-text assertions in the astro-scaffold idiom;
// the behavior (SVG-only pull, filename, clamp bypass) is proven in the print-room e2e.
const page = readFileSync(new URL("../../src/pages/print-room/index.astro", import.meta.url), "utf8");

// The option VALUES are the contract app.ts keys on (svg/png1/png2): the labels may move,
// the values may not.
test("the Pressed as options carry the period labels over the stable values", () => {
  assert.match(page, /<option value="svg"[^>]*>The engraving itself \(SVG\)<\/option>/);
  assert.match(page, /<option value="png1">An impression \(PNG\)<\/option>/);
  assert.match(page, /<option value="png2">A finer impression \(PNG &times;2\)<\/option>/);
});

test("the caveat teaches engraving vs impression in the same register", () => {
  assert.ok(page.includes("The engraving is exact at any size; an impression is pressed with your"));
  assert.ok(page.includes("The chart is pulled only as the engraving."));
});

test("the chart joins the plate row at 1500 px, ahead of the posters", () => {
  const chart = page.indexOf('data-poster="chart"');
  const desk = page.indexOf('data-poster="desk"');
  assert.ok(chart !== -1, "no chart plate button");
  assert.ok(desk !== -1, "no desk plate button");
  assert.ok(chart < desk, "the chart button belongs ahead of the posters (ascending width)");
  assert.match(page, /data-poster="chart"[^>]*>Chart<span class="plate-dim">1500 px<\/span>/);
});
