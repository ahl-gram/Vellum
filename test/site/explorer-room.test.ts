import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// #463: the Explorer as a chart room on the #462 pattern (rulings 1 to 10).
const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");
const page = read("src/pages/explorer/index.astro");
const css = read("public/explorer/index.css");
const app = read("src/site/explorer/app.ts");

const between = (from: string, to: string): string => {
  const a = page.indexOf(from);
  assert.ok(a >= 0, `the page is missing ${from}`);
  const b = page.indexOf(to, a);
  assert.ok(b > a, `${to} does not follow ${from}`);
  return page.slice(a, b);
};

test("ER1 the Explorer is a chart room: chartRoom on the layout, the RoomFolio in place of the RoomHead", () => {
  const open = page.match(/<BaseLayout([\s\S]*?)>/);
  assert.ok(open, "the page renders through BaseLayout");
  assert.match(open[1], /\bchartRoom\b/, "the Explorer passes chartRoom (no band, no footer)");
  assert.ok(page.includes("<RoomFolio room={room} tagline={tagline}>"), "the room's name stands in the folio corner");
  assert.ok(!page.includes("<RoomHead"), "the RoomHead on the sheet retires with the conversion");
});

test("ER2 the seed row is the folio's one control: seed, dice and Draw stand top right (#462 ruling 8)", () => {
  const folio = between("<RoomFolio", "</RoomFolio>");
  for (const id of ['id="seed"', 'id="random"', 'id="draw"']) {
    assert.ok(folio.includes(id), `the folio corner lost ${id}`);
  }
  assert.match(folio, /<button id="draw" class="primary"/, "Draw stays the room's sole primary");
  const slip = between("<Slip", "</Slip>");
  assert.ok(!slip.includes('id="draw"') && !slip.includes('id="seed"'), "the seed row does not also sit on the slip");
});

test("ER3 the Broadside is the slip: The Land and The Hand ride it, the Press does not", () => {
  const slip = between("<Slip", "</Slip>");
  assert.match(slip, /<Slip id="broadside"/, "the slip is the Broadside");
  assert.ok(slip.includes('aria-labelledby="grp-land"') && slip.includes('aria-labelledby="grp-hand"'), "the slip carries the Land and the Hand");
  for (const id of ['id="verso-turn"', 'id="order-plates"', 'id="journal-link"']) {
    assert.ok(!slip.includes(id), `${id} is a road out, not a slip control`);
  }
});

test("ER4 the rest of the Press is the legend row: Turn the sheet, then the two gold roads (#462 ruling 4)", () => {
  const legend = between('<nav class="legend"', "</nav>");
  assert.match(legend, /<button id="verso-turn" class="legend-btn"/, "Turn the sheet is a legend button");
  assert.match(legend, /<a id="order-plates" class="legend-btn gold"/, "the Print Room road is gold");
  assert.match(legend, /<a id="journal-link" class="legend-btn gold"/, "the Reading Room road is gold");
  assert.ok(legend.indexOf('id="verso-turn"') < legend.indexOf('id="order-plates"'), "Turn the sheet leads the row");
  assert.ok(!page.includes("action-link"), "the #270 action-link dress retires with the Press strip");
  assert.match(legend, /<p class="legend-head" id="grp-press">/, "the Press keeps its head, now the legend's");
});

test("ER5 the sheet stays the Glass's gesture box, so a bookmark's cx/cy stay sheet fractions; the Glass stands at the chart's corner outside it", () => {
  assert.match(
    page,
    /<div class="stage">[\s\S]*<div class="sheet" id="sheet">\s*<div class="sheet-inner" id="sheet-inner">\s*<div id="map-viewport"[^>]*>\s*<div id="map" class="living-chart"><\/div>\s*<\/div>\s*<div id="verso" aria-hidden="true"><\/div>/,
    "the stage holds the fitted sheet, whose leaf holds the gesture box round #map and the verso beside it",
  );
  const viewport = between('<div id="map-viewport"', 'id="verso"');
  assert.ok(!viewport.includes("zoom-controls"), "the Glass no longer sits inside the viewport");
  assert.match(page, /<div class="chrome corner br zoomery" id="zoom-controls" role="group" aria-label="The Surveyor's Glass">/, "the Glass is the corner cluster, its id kept for glass.ts and the suites");
  assert.match(page, /<p class="status" id="status" role="status" aria-live="polite"><\/p>/, "the status line keeps its id (the suites' settle probe)");
  const folio = between('<div class="chrome corner bl folio">', "</div>");
  assert.match(folio, /id="folio-title"/, "the chart's folio carries the world's name");
  assert.match(folio, /<p class="folio-coords" id="caption">/, "the caption is the folio's coords line (the suites read #caption)");
});

test("ER6 the page css fits the sheet to what the chrome leaves and stands print down (#462 rulings 1 and 10)", () => {
  assert.match(css, /\.stage\s*\{[^}]*padding:\s*var\(--reserve-top/, "the stage reserves the chrome's edges as padding, measured by room.ts");
  assert.ok(!/max-width:\s*1100px/.test(css), "the 1100px column is gone: the chart is the room");
  assert.match(css, /#map-viewport\.zoomable\s*\{[^}]*touch-action:\s*none/, "touch-action:none stays on the gesture box");
  assert.match(css, /#map\s*\{[^}]*transform-origin:\s*0\s+0/, "#map keeps the top-left pivot");
  assert.match(css, /#map svg\[data-vellum-style\]\s*\{[^}]*height:\s*100%/, "the chart fills its fitted box");
  assert.match(css, /#sheet\s*\{[^}]*box-shadow:\s*var\(--stage-shadow\)/, "the sheet rests at the chart-room depth, via the token");
  const print = css.match(/@media print\s*\{([\s\S]*)\}\s*$/);
  assert.ok(print, "the page css ends with its print stand-down");
  assert.match(print[1], /\.stage\s*\{[^}]*position:\s*static/, "the chart prints in flow");
  assert.match(print[1], /#map\s*\{[^}]*transform:\s*none\s*!important/, "the chart prints unzoomed");
});

test("ER7 app.ts fits the room after the chart lands on BOTH draw paths and writes the folio's lines", () => {
  assert.match(app, /import\s*\{\s*bindRoom\s*\}\s*from\s*"\.\.\/shared\/room\.ts"/, "app.ts binds the shared room");
  // The turn lands the chart in runTurn's then; a settle writes #map directly. Each path must refit once the chart is in the DOM, or the room fits an empty sheet on that path (guard-prover hole A: one call satisfied a whole-file grep).
  const turnPath = app.slice(app.indexOf("runTurn({"), app.indexOf("} else {", app.indexOf("runTurn({")));
  const settlePath = app.slice(app.indexOf("mapDiv.innerHTML = res.svg;"), app.indexOf("if (pendingCamera)"));
  assert.ok(turnPath.includes("room.layout()"), "the turn path refits once the leaf lands");
  assert.ok(settlePath.includes("room.layout()"), "the settle path refits once #map holds the chart");
  assert.ok(settlePath.indexOf("room.layout()") > settlePath.indexOf("lc.buildPlaceOverlay(res.manifest)"), "the settle refits after the overlay is built, so the fit measures the chart as drawn");
  for (const id of ["folioTitle", "folioSub"]) {
    assert.ok(app.includes(id), `app.ts writes ${id}`);
  }
});
