import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { GALLERY_PAGE_CSS, cardFigureHtml, galleryCards } from "../../src/cli/gallery.ts";

// #464 (Landfall Sub 9, ruled 2026-09-02 on the issue): the Gallery hangs its twelve plates on the deep as twelve sheets, a chart room without a stage. The room's name and dateline stand in the folio corner with no control, the plates are the roads into their own worlds, the legend row is one gold road back to the Explorer; the interim desk, the RoomHead on the sheet and the intro line retire.
const REPO = resolve(import.meta.dirname, "..", "..");
const page = readFileSync(resolve(REPO, "src/pages/gallery/index.astro"), "utf8");
const css = GALLERY_PAGE_CSS;

const between = (from: string, to: string): string => {
  const a = page.indexOf(from);
  assert.ok(a >= 0, `the page is missing ${from}`);
  const b = page.indexOf(to, a);
  assert.ok(b > a, `${to} does not follow ${from}`);
  return page.slice(a, b);
};

test("GR1 the Gallery is a chart room: chartRoom on the layout, the RoomFolio in place of the RoomHead, the intro line retired, no script", () => {
  const open = page.match(/<BaseLayout([\s\S]*?)>/);
  assert.ok(open, "the page renders through BaseLayout");
  assert.match(open[1], /\bchartRoom\b/, "the Gallery passes chartRoom (no band, no footer)");
  assert.ok(!open[1].includes("desk="), "the interim desk retires with the conversion");
  assert.ok(page.includes("<RoomFolio room={room} tagline={tagline}>"), "the room's name stands in the folio corner");
  assert.ok(!page.includes("<RoomHead"), "the RoomHead on the sheet retires with the conversion");
  assert.ok(!page.includes('class="sub intro"'), "the intro line retires; its fact moves to the dateline");
  assert.ok(!page.includes("<script"), "the Gallery is composed at build time and ships no engine bundle (ruling 2)");
});

test("GR2 the corner carries the name and its dateline, no control (ruling 2)", () => {
  const folio = between("<RoomFolio", "</RoomFolio>");
  assert.match(folio, /<p class="dateline">\{dateline\}<\/p>/, "the dateline is the corner's line");
  assert.ok(!folio.includes("folio-controls"), "the corner holds no control: the dozen is fixed at build time");
  assert.match(page, /const dateline = `\$\{GALLERY_COUNT\} charts, from seed \$\{GALLERY_SEED\}`;/, "the dateline is derived from the composer's constants, never a literal count");
});

test("GR3 the plates hang on the deep: the fog under them, the grid of figures, the vignettes over, then the corner and the legend; no stage, no Glass, no slip, no chart folio", () => {
  const order = ['<div class="fog a"', '<div class="fog b"', '<div class="grid" set:html={figures}></div>', '<div class="vignette top"', '<div class="vignette bottom"', "<RoomFolio", '<nav class="legend"'].map((m) => page.indexOf(m));
  assert.ok(order.every((i, n) => i >= 0 && (n === 0 || i > order[n - 1]!)), `fog, grid, vignettes, folio, legend: ${order.join(",")}`);
  for (const gone of ['class="stage"', 'id="map-viewport"', "zoomery", "<Slip", 'class="chrome corner bl folio"', "legend-dock"]) {
    assert.ok(!page.includes(gone), `${gone} belongs to a stage room, not the Gallery`);
  }
});

test("GR4 the legend row is one gold road back to the Explorer (ruling 2)", () => {
  const legend = between('<nav class="legend"', "</nav>");
  assert.match(legend, /<nav class="legend" aria-label="The road out">/);
  assert.match(legend, /<p class="legend-head">[^<]+<\/p>/, "the row keeps its flourish line");
  assert.equal([...legend.matchAll(/class="legend-btn/g)].length, 1, "one road, no more");
  assert.match(legend, /<a class="legend-btn gold" href="\/explorer\/"><span class="verb">Return to<\/span><span class="room">The Explorer<\/span><\/a>/, "the gold road home, as the other rooms carry it");
});

test("GR5 every plate is a road into its own world: the Explorer at the plate's seed, so the tip rides a real link (#289)", () => {
  const cards = galleryCards(42, 2);
  assert.equal(cards.length, 2);
  for (const card of cards) {
    const html = cardFigureHtml(card);
    assert.ok(html.includes(`<a href="/explorer/#seed=${card.seed}"><img src="${card.file}"`), `the plate links the Explorer at seed ${card.seed}: ${html}`);
    assert.ok(!html.includes(`href="${card.file}"`), "the raw svg is no longer the road (it had no road back)");
  }
});

test("GR6 the css: twelve sheets at the house depth on the deep, captions lettered in parchment, the chart room's scroll lock lifted, the grid landing, the legend centred and standing on a phone, print standing down", () => {
  assert.match(css, /html:has\(body\.chart-room\), body\.chart-room\s*\{[^}]*height:\s*auto;[^}]*overflow:\s*visible/, "the kit locks a stage room's scroll; the plates scroll in flow");
  assert.match(css, /(^|\n)main\s*\{[^}]*padding:[^}]*var\(--band-h\)/, "the first row clears the cluster's band");
  assert.match(css, /(^|\n)\.grid\s*\{[^}]*animation:\s*sheet-land/, "the plates land as one sheet (#461 ruling 6)");
  assert.match(css, /(^|\n)figure img\s*\{[^}]*border:\s*1px solid var\(--line-tan\);[^}]*box-shadow:\s*var\(--sheet-shadow\)/, "each plate rests at the house depth, via the token");
  assert.match(css, /(^|\n)figure img:hover\s*\{[^}]*rotate\(/, "the tip stays: the plate navigates");
  assert.match(css, /(^|\n)figcaption\s*\{[^}]*color:\s*var\(--parchment\)/, "captions letter in parchment on the deep (line-tan measured 4.03:1, under the 4.5 floor)");
  const screen = css.slice(0, css.indexOf("@media print"));
  assert.doesNotMatch(screen, /figcaption[^{]*\{[^}]*var\(--ink-(dark|brown|faded)\)/, "no ink lettering on the deep outside print");
  assert.match(css, /(^|\n)\.legend\s*\{\s*left:\s*50%;\s*\}/, "no slip to stand beside: the legend row is centred (placement is the page's, the dress the kit's)");
  const phone = css.slice(css.indexOf("@media (max-width: 900px)"), css.indexOf("@media print"));
  assert.match(phone, /\.legend\s*\{[^}]*display:\s*block/, "the kit hides the row for a slip to dock it; the Gallery has no slip and no script, so the row stays");
  assert.doesNotMatch(css, /(^|\n)\s*(header|footer|p\.sub|main\.desk-panel)\s*[{,]/, "no rule targets furniture a chart room no longer has");
  assert.doesNotMatch(css, /(^|\n)\s*\.(legend-btn|legend-row|legend-head|folio-room|room-name|dateline|fog|vignette|corner)\b[^{]*\{/, "the page css does not re-dress the kit (#302)");
  const print = css.match(/@media print\s*\{([\s\S]*)\}\s*$/);
  assert.ok(print, "the page css ends with its print stand-down");
  assert.match(print[1], /figure img\s*\{[^}]*box-shadow:\s*none/, "print is paper: no depth");
  assert.match(print[1], /figcaption\s*\{[^}]*color:\s*var\(--ink-dark\)/, "captions print in ink");
});
