import { test } from "node:test";
import assert from "node:assert/strict";
import { GALLERY_PAGE_CSS, cardFigureHtml, galleryCards } from "../../src/cli/gallery.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";

// The Gallery (Issue #464, ruled 2026-09-02 on the issue): twelve plates on the deep as twelve sheets, a chart room without a stage; the plates are the roads into their own worlds, the legend row the one gold road back to the Explorer.
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
