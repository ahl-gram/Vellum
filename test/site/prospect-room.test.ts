import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// #463 part 4/4: the Prospect is a chart room on the #462 pattern, ruled on #494 (2026-08-30): the engraving full-bleed at the plate's own aspect, the year as the room's one control (viewed in the year N, Engrave), the engraver's note on the slip (the gazetteer's note, the plate's lettered key, the era line), the Explorer and the Ribbon as the roads out, print standing down.
const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => (existsSync(resolve(REPO, p)) ? readFileSync(resolve(REPO, p), "utf8") : "");
const page = read("src/pages/prospect/index.astro");
const css = read("public/prospect/index.css");
const app = read("src/site/prospect/app.ts");
const seats = read("src/site/prospect/seats.ts");

const between = (from: string, to: string): string => {
  const a = page.indexOf(from);
  assert.ok(a >= 0, `the page is missing ${from}`);
  const b = page.indexOf(to, a);
  assert.ok(b > a, `${to} does not follow ${from}`);
  return page.slice(a, b);
};

const folioLines = (): string[][] => {
  const m = page.match(/<ChartFolio lines=\{(\[[^\n]*\])\} \/>/);
  assert.ok(m, "the page stands the kit's chart folio");
  return JSON.parse(m![1]!) as string[][];
};

test("PPR1 the Prospect is a chart room: chartRoom on the layout, the RoomFolio in place of the RoomHead, the figure and its caption retired", () => {
  const open = page.match(/<BaseLayout([\s\S]*?)>/);
  assert.ok(open, "the page renders through BaseLayout");
  assert.match(open[1], /\bchartRoom\b/, "the Prospect passes chartRoom (no band, no footer)");
  assert.ok(page.includes("<RoomFolio room={room} tagline={tagline}>"), "the room's name stands in the folio corner");
  assert.ok(!page.includes("<RoomHead"), "the RoomHead on the sheet retires with the conversion");
  for (const gone of ['class="intro"', 'class="plate-figure"', 'class="actions"', 'id="pp-caption"']) {
    assert.ok(!page.includes(gone), `${gone} left with the sheet`);
  }
});

test("PPR2 the corner is the year control (#494 ruling 2): viewed in the year, the year, Engrave", () => {
  const folio = between("<RoomFolio", "</RoomFolio>");
  assert.match(folio, /<form class="folio-controls" id="pp-year-form" aria-label="[^"]+">/, "the control row is a form, so Enter engraves");
  assert.match(folio, /<label class="year-label" for="pp-year">viewed in the year<\/label>/, "the label names the control");
  assert.match(folio, /<input id="pp-year" class="control" type="text" inputmode="numeric" pattern="\[0-9\]\*" autocomplete="off">/, "text with a numeric keypad and a digits pattern (home's seed input, the iOS precedent); no aria-label, so the visible label IS the accessible name (WCAG 2.5.3; a display:none label still names its control)");
  assert.match(folio, /<button id="pp-engrave" class="primary" type="submit">Engrave<\/button>/, "Engrave is the room's primary");
  assert.ok(folio.indexOf('for="pp-year"') < folio.indexOf('id="pp-year"') && folio.indexOf('id="pp-year"') < folio.indexOf('id="pp-engrave"'), "label, year, Engrave");
  assert.match(folio, /<p class="gloss">turn the year back, even to the ground before it rose<\/p>/, "the corner's gloss");
});

test("PPR3 the engraver's note is the slip (#494 ruling 4): the gazetteer's note, the key to the plate in the kit's contents row, the era line, the legend's phone dock", () => {
  assert.match(page, /<Slip id="note" verb="The engraver's note" title="The Engraver's Note" where="[^"]+" fold="Fold the engraver's note away">/, "the slip carries the mockup's head; the title is the tab's name, the h2 takes the place at the draw");
  const slip = between("<Slip", "</Slip>");
  assert.match(slip, /<p class="note-prose" id="pp-note"><\/p>/, "the note, filled at the draw");
  assert.match(slip, /<p class="key-head" id="pp-key-head">The key to the plate<\/p>/, "the key's head");
  assert.match(slip, /<ol class="contents plate-key" id="pp-key"><\/ol>/, "the key is the kit's contents row (#487, its third use)");
  assert.match(slip, /<p class="era" id="pp-era"><\/p>/, "the era line");
  assert.match(slip, /<p class="era-gloss">The same place, chart and year always press the same plate\./, "the intro's one surviving line rides the era (the mockup's seat for it)");
  assert.ok(slip.includes('class="legend-dock"'), "the slip body carries the dock the legend row moves into on a phone");
  const order = ['id="pp-note"', 'id="pp-key-head"', 'id="pp-key"', 'id="pp-era"', 'class="era-gloss"', 'class="legend-dock"'].map((m) => slip.indexOf(m));
  assert.ok(order.every((i, n) => i >= 0 && (n === 0 || i > order[n - 1]!)), "note, key head, key, era, gloss, dock");
  assert.ok(page.indexOf("</Slip>") < page.indexOf("<ChartFolio"), "the slip precedes the chart's folio in the page");
});

test("PPR4 the legend row is the roads out (#494 ruling 3): the Explorer in gold, then the road from this town in the Ribbon", () => {
  const legend = between('<nav class="legend"', "</nav>");
  assert.match(legend, /<nav class="legend" aria-label="The roads out">/);
  assert.match(legend, /<p class="legend-head">The roads out<\/p>/);
  assert.match(legend, /<LegendButton id="pp-chart-link" gold href="\/explorer\/" verb="Return to" room="The Explorer" \/>/, "the road back keeps the id the suite reads, in gold (the kit's, #487)");
  assert.match(legend, /<LegendButton id="pp-ribbon-link" href="\/ribbon\/" verbId="pp-ribbon-verb" verb="[^"]*" room="The Wayfarer's Ribbon" \/>/, "the road out to the Ribbon, its verb naming the town at the draw");
  assert.ok(legend.indexOf('id="pp-chart-link"') < legend.indexOf('id="pp-ribbon-link"'), "the gold road first");
});

test("PPR5 the stage holds the fitted sheet with the plate as the one face in the gesture box; the status pill, the Glass and the chart's folio keep their ids", () => {
  assert.match(
    page,
    /<ChartStage label="The plate\. [^"]+">\s*<img id="pp-plate" class="plate" alt="" hidden>\s*<Fragment slot="after">/,
    "the kit's stage (#487): its gesture box's transform target holds the plate (a blob img, never inline svg)",
  );
  const stage = between("<ChartStage", "<Vignettes />");
  assert.match(stage, /<p class="status" id="pp-status" role="status" aria-live="polite"><\/p>/, "the status line keeps its id (the suite's settle probe) and is the stage's pill");
  assert.match(stage, /<p id="pp-warning" class="warning" hidden>/, "the inline-fallback warning stands in the stage");
  assert.match(stage, /<noscript>/, "scripts off is said in the stage");
  assert.ok(page.includes("<Glass />"), "the Glass is the kit's corner cluster (#487; its presses carry data-zoom for the shared keys binding, atelier-kit.test.ts)");
  assert.deepEqual(folioLines(), [["folio-title", "folio-title"], ["folio-sub", "folio-sub"], ["folio-coords", "pp-pressed"]], "the plate's title line, the world's line, the pressing's line");
});

test("PPR6 seats.ts binds the Glass and the room at the plate's own aspect; app.ts redraws in place for the year, writes the address and the roads, refits after the folio, and never scrolls the page", () => {
  assert.match(seats, /import\s*\{\s*bindRoom, type Room\s*\}\s*from\s*"\.\.\/shared\/room\.ts"/, "the shared room");
  assert.match(seats, /import\s*\{\s*createZoomController\s*\}\s*from\s*"\.\.\/shared\/zoom-controller\.ts"/, "the Glass is the shared controller");
  assert.match(seats, /import\s*\{\s*bindGlassKeys\s*\}\s*from\s*"\.\.\/shared\/glass-keys\.ts"/, "its keys and buttons are the kit's");
  assert.match(seats, /import\s*\{\s*PLATE_W, PLATE_H\s*\}\s*from\s*"\.\.\/\.\.\/prospect\/geometry\.ts"/, "the plate's own size");
  assert.match(seats, /bindRoom\(\{[^}]*aspect: \(\) => PLATE_W \/ PLATE_H/, "the fit takes the plate's aspect explicitly: an img gives the svg scan nothing, and the chart's fallback mis-fits the plate by 4.5%");
  assert.match(seats, /restore: \(cam\) =>[\s\S]*?\.refit\(/, "the room's refit is the silent one (no settle, no hash)");
  assert.match(app, /yearHash\(location\.hash, /, "an Engrave writes the year into the address");
  assert.match(app, /ribbonTarget\(location\.hash, /, "the road to the Ribbon carries the world and the town");
  assert.match(app, /chartTarget\(location\.hash\)/, "the road back sheds the page's own keys (PB7b)");
  assert.match(app, /parseYear\(/, "the control reads the year through parseYear, the one grammar the address reads year= with");
  assert.match(app, /ribbonLink\.style\.display = res\.roads \? "" : "none"/, "the Ribbon's road stands only where a road leaves the town, by display (the kit's .legend-btn display makes hidden inert)");
  assert.match(app.slice(0, app.indexOf("await initWorker()")), /ribbonLink\.style\.display = "none"/, "and stands down until the first plate resolves the town");
  assert.match(app, /addEventListener\("submit"/, "Engrave is the form's submit");
  const settle = app.slice(app.indexOf("showPlate("), app.indexOf("last = {"));
  assert.ok(settle.includes("writeFolio(") && settle.includes("room.layout()"), "the settle path writes the folio and refits");
  assert.ok(settle.indexOf("room.layout()") > settle.indexOf("writeFolio("), "the refit follows the folio write, since the fit measures the folio's rect");
  assert.match(app, /revokeObjectURL\(/, "a redraw revokes the previous plate's blob (the Ribbon's discipline)");
  for (const [name, src] of [["app.ts", app], ["seats.ts", seats]] as const) {
    assert.doesNotMatch(src, /scrollIntoView|window\.scrollTo|\.scrollTop\s*=/, `${name} moves the page`);
  }
});

test("PPR7 the css: the sheet fitted to what the chrome leaves, the plate as the sheet's face, the year label standing down on a phone, print standing down (#462 ruling 10)", () => {
  assert.match(css, /\.stage\s*\{[^}]*padding:\s*var\(--reserve-top/, "the stage reserves the chrome's edges as padding, measured by room.ts");
  assert.match(css, /#sheet\s*\{[^}]*box-shadow:\s*var\(--stage-shadow\)/, "the sheet rests at the chart-room depth, via the token");
  assert.match(css, /#map-viewport\.zoomable\s*\{[^}]*touch-action:\s*none/, "touch-action:none stays on the gesture box");
  assert.match(css, /#map\s*\{[^}]*transform-origin:\s*0\s+0/, "#map keeps the top-left pivot");
  assert.match(css, /#pp-plate\s*\{[^}]*position:\s*absolute;[^}]*inset:\s*0;[^}]*width:\s*100%;[^}]*height:\s*100%/, "the plate fills the sheet");
  assert.match(css, /#pp-plate\[hidden\]\s*\{[^}]*display:\s*none/, "hidden stays hidden under the author display");
  assert.doesNotMatch(css, /(^|\n)(\.contents )?\.cr-(num|text)\s*\{/, "the page css does not re-dress the kit's row (#302)");
  assert.doesNotMatch(css, /(^|\n)\s*(header|footer|\.plate-figure|\.actions|main)\s*[{,]/, "no rule targets furniture a chart room no longer has");
  const phone = css.slice(css.indexOf("@media (max-width: 900px)"), css.indexOf("@media print"));
  assert.match(phone, /\.year-label\s*\{[^}]*display:\s*none/, "the label stands down on a phone (the mockup); the input keeps its aria-label");
  const print = css.match(/@media print\s*\{([\s\S]*)\}\s*$/);
  assert.ok(print, "the page css ends with its print stand-down");
  assert.match(print[1], /\.stage\s*\{[^}]*position:\s*static/, "the plate prints in flow");
  assert.match(print[1], /#map\s*\{[^}]*transform:\s*none\s*!important/, "unzoomed");
  assert.match(print[1], /#pp-plate\s*\{[^}]*position:\s*static;[^}]*height:\s*auto/, "at its own proportion");
});
