import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { GALLERY_PAGE_CSS, cardFigureHtml, galleryCards } from "../../src/cli/gallery.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";

// #464 (Landfall Sub 9, ruled 2026-09-02 on the issue): the Gallery hangs its twelve plates on the deep as twelve sheets, a chart room without a stage. The room's name and dateline stand in the folio corner with no control, the plates are the roads into their own worlds, the legend row is one gold road back to the Explorer; the interim desk, the RoomHead on the sheet and the intro line retire.
const REPO = resolve(import.meta.dirname, "..", "..");
const page = readFileSync(resolve(REPO, "src/pages/gallery/index.astro"), "utf8");
const css = GALLERY_PAGE_CSS;
const kit = readFileSync(resolve(REPO, "public/atelier.css"), "utf8");

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

test("GR3 the plates hang on the deep: the fog, the grid of figures, then the corner and the legend; no vignettes (a fixed darkening band over scrolling captions washed them to 2.86:1 at its edge, skeptic on PR #501), no stage, no Glass, no slip, no chart folio", () => {
  const order = ["<Fog />", '<div class="grid" set:html={figures}></div>', "<RoomFolio", '<nav class="legend"'].map((m) => page.indexOf(m));
  assert.ok(order.every((i, n) => i >= 0 && (n === 0 || i > order[n - 1]!)), `fog, grid, folio, legend: ${order.join(",")}`);
  for (const gone of ["<Vignettes", 'class="vignette', 'class="stage"', "<ChartStage", 'id="map-viewport"', "<Glass", "<Slip", "<ChartFolio", "legend-dock"]) {
    assert.ok(!page.includes(gone), `${gone} belongs to a stage room, not the Gallery`);
  }
});

test("GR4 the legend row is one gold road back to the Explorer (ruling 2)", () => {
  const legend = between('<nav class="legend"', "</nav>");
  assert.match(legend, /<nav class="legend" aria-label="The road out">/);
  assert.match(legend, /<p class="legend-head">[^<]+<\/p>/, "the row keeps its flourish line");
  assert.equal([...legend.matchAll(/<LegendButton /g)].length, 1, "one road, no more");
  assert.match(legend, /<LegendButton gold href="\/explorer\/" verb="Return to" room="The Explorer" \/>/, "the gold road home, as the other rooms carry it (the kit's, #487)");
});

test("GR5 every plate is a road into its own world: the Explorer at the plate's seed, drawing the plate's own dress (antique, no legend), so the tip rides a real link (#289) and the plate opens the plate", () => {
  const cards = galleryCards(42, 2);
  assert.equal(cards.length, 2);
  for (const card of cards) {
    const html = cardFigureHtml(card);
    assert.ok(html.includes(`<a href="/explorer/#seed=${card.seed}&amp;style=antique&amp;legend=0"><img src="${card.file}"`), `the plate links the Explorer at seed ${card.seed} in the plate's dress: ${html}`);
    assert.ok(!html.includes(`href="${card.file}"`), "the raw svg is no longer the road (it had no road back)");
  }
  // The Explorer's default is the legend on (its checkbox ships checked); the plate is drawn without one, so the road says so (skeptic on PR #501).
  const world = generateWorld(defaultRecipe(42));
  const plate = renderMap(world, { style: "antique", widthPx: 900 });
  assert.equal(renderMap(world, { style: "antique", widthPx: 900, legend: false }), plate, "legend=0 is the plate's own dress");
  assert.notEqual(renderMap(world, { style: "antique", widthPx: 900, legend: true }), plate, "the Explorer's default dress is a different drawing");
});

test("GR6 the css: twelve sheets at the house depth on the deep, captions lettered in parchment, the chart room's scroll lock lifted, the grid landing, the legend centred and standing on a phone, print standing down", () => {
  assert.match(css, /html:has\(body\.chart-room\), body\.chart-room\s*\{[^}]*height:\s*auto;[^}]*overflow:\s*visible/, "the kit locks a stage room's scroll; the plates scroll in flow");
  assert.match(css, /(^|\n)main\s*\{[^}]*padding:[^}]*var\(--band-h\)/, "the first row clears the cluster's band");
  assert.match(css, /(^|\n)\.grid\s*\{[^}]*animation:\s*sheet-land/, "the plates land as one sheet (#461 ruling 6)");
  assert.match(css, /(^|\n)figure img\s*\{[^}]*border:\s*1px solid var\(--line-tan\);[^}]*box-shadow:\s*var\(--sheet-shadow\)/, "each plate rests at the house depth, via the token");
  assert.match(css, /(^|\n)figure img:hover\s*\{[^}]*rotate\([^}]*box-shadow:\s*var\(--stage-shadow\)/, "the tip stays (the plate navigates), and a plate picked up rises to the chart-room depth, via the token");
  assert.match(css, /(^|\n)figcaption\s*\{[^}]*color:\s*var\(--parchment\)/, "captions letter in parchment on the deep (line-tan measured 4.03:1, under the 4.5 floor)");
  const screen = css.slice(0, css.indexOf("@media print"));
  assert.doesNotMatch(screen, /figcaption[^{]*\{[^}]*var\(--ink-(dark|brown|faded)\)/, "no ink lettering on the deep outside print");
  assert.match(css, /(^|\n)\.legend\s*\{\s*left:\s*50%;\s*\}/, "no slip to stand beside: the legend row is centred (placement is the page's, the dress the kit's)");
  // The pool is the kit's, for the class (a chart room without a stage), not the page's for the cluster alone: the folio corner and the legend row sit over the same pale plates (tagline 2.26:1, rooms 2.0:1 measured under the cluster, plate read 2026-09-02; skeptic on PR #501).
  assert.doesNotMatch(css, /header\.chrome/, "the page does not pool its own cluster");
  const pool = kit.match(/\n([^\n]*body\.chart-room:not\(:has\(\.stage\)\) :is\(header\.chrome, \.corner, \.legend\)::before[^{]*)\{([^}]*)\}/);
  assert.ok(pool, "the kit pools every chrome of a stage-less chart room");
  assert.match(pool![2]!, /background:\s*rgb\(from var\(--chart-ink\) r g b \/ 0\.92\);[^}]*filter:\s*blur\(16px\)/, "the #480 pool, the zoomed chart rooms' own");
  assert.match(pool![1]!, /body:has\(#map-viewport\.zoomed\) :is\(header\.chrome, \.corner, \.legend, \.strip\)::before/, "one rule with the zoomed rooms' pool, so the two cannot drift");
  assert.doesNotMatch(css, /\/\*/, "the shipped sheet carries no prose (public/gallery/index.css ships it verbatim)");
  const phone = css.slice(css.indexOf("@media (max-width: 900px)"), css.indexOf("@media print"));
  assert.match(phone, /\.legend\s*\{[^}]*display:\s*block/, "the kit hides the row for a slip to dock it; the Gallery has no slip and no script, so the row stays");
  assert.doesNotMatch(css, /(^|\n)\s*(header|footer|p\.sub|main\.desk-panel)\s*[{,]/, "no rule targets furniture a chart room no longer has");
  assert.doesNotMatch(css, /(^|\n)\s*\.(legend-btn|legend-row|legend-head|folio-room|room-name|dateline|fog|vignette|corner)\b[^{]*\{/, "the page css does not re-dress the kit (#302)");
  const print = css.match(/@media print\s*\{([\s\S]*)\}\s*$/);
  assert.ok(print, "the page css ends with its print stand-down");
  assert.match(print[1], /figure img\s*\{[^}]*box-shadow:\s*none/, "print is paper: no depth");
  assert.match(print[1], /figcaption\s*\{[^}]*color:\s*var\(--ink-dark\)/, "captions print in ink");
});
