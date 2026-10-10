import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { GALLERY_PAGE_CSS, cardFigureHtml, galleryCards } from "../../src/cli/gallery.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";

// The Gallery (Issue #464, ruled 2026-09-02 on the issue): twelve plates on the deep as twelve sheets, a chart room without a stage; the plates are the roads into their own worlds, the legend row the one gold road back to the Explorer.
const REPO = resolve(import.meta.dirname, "..", "..");
const page = readFileSync(resolve(REPO, "src/pages/gallery/index.astro"), "utf8");
const css = GALLERY_PAGE_CSS;

test("GR5 every plate is a road into its own world: the Explorer at the plate's seed, drawing the plate's own dress (antique, no legend), so the tip rides a real link (#289) and the plate opens the plate", () => {
  const cards = galleryCards(42, 2);
  assert.equal(cards.length, 2);
  for (const card of cards) {
    const html = cardFigureHtml(card);
    assert.ok(
      html.includes(`<a href="/explorer/#seed=${card.seed}&amp;style=antique&amp;legend=0"><img src="${card.file}"`),
      `the plate links the Explorer at seed ${card.seed} in the plate's dress: ${html}`,
    );
    assert.ok(!html.includes(`href="${card.file}"`), "the raw svg is no longer the road (it had no road back)");
  }
  // The Explorer's default is the legend on, and the plate is drawn without one, so the road says so.
  const world = generateWorld(defaultRecipe(42));
  const plate = renderMap(world, { style: "antique", widthPx: 900 });
  assert.equal(
    renderMap(world, { style: "antique", widthPx: 900, legend: false }),
    plate,
    "legend=0 is the plate's own dress",
  );
  assert.notEqual(
    renderMap(world, { style: "antique", widthPx: 900, legend: true }),
    plate,
    "the Explorer's default dress is a different drawing",
  );
});

// The room as served (a chart room, its corner, its road, its dress, print) is e2e RH21 to RH23 beside RH10; what stays below no browser can see: a chart room ignores a desk prop, the layout re-seats the desk slot so the source order across slots never reaches the page, the trail rule always overrides the base padding, a page pool loses to the kit's, and a comment or an absent rule paints nothing (Issue #779 part 2f, for part 2i).
test("GR1 the Gallery's layout call carries no desk, and its source keeps the fog and the grid ahead of the corner and the legend", () => {
  const open = page.match(/<BaseLayout([\s\S]*?)>/);
  assert.ok(open, "the page renders through BaseLayout");
  assert.ok(!open[1]!.includes("desk="), "the interim desk retires with the conversion");
  const order = ["<Fog />", '<div class="grid"', "<RoomFolio", '<nav class="legend"'].map((m) => page.indexOf(m));
  assert.ok(
    order.every((i, n) => i >= 0 && (n === 0 || i > order[n - 1]!)),
    `fog, grid, folio, legend: ${order.join(",")}`,
  );
});

test("GR6 the Gallery's sheet carries no prose and no rule for what it lacks or the kit dresses, and its base padding names the band", () => {
  assert.match(css, /(^|\n)main\s*\{[^}]*padding:[^}]*var\(--band-h\)/, "the first row clears the cluster's band");
  assert.doesNotMatch(css, /header\.chrome/, "the page does not pool its own cluster");
  assert.doesNotMatch(css, /\/\*/, "the shipped sheet carries no prose (public/gallery/index.css ships it verbatim)");
  assert.doesNotMatch(
    css,
    /(^|\n)\s*(header|footer|p\.sub|main\.desk-panel)\s*[{,]/,
    "no rule targets furniture a chart room no longer has",
  );
  assert.doesNotMatch(
    css,
    /(^|\n)\s*\.(legend-btn|legend-row|legend-head|folio-room|room-name|dateline|fog|vignette|corner)\b[^{]*\{/,
    "the page css does not re-dress the kit (#302)",
  );
});
