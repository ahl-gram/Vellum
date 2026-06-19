import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { buildOgCard, OG_WIDTH, OG_HEIGHT } from "../../src/render/og-card.ts";

function heroChart(): string {
  return renderMap(generateWorld(defaultRecipe(42)), { style: "antique" });
}

test("the OG card is a 1200x630 SVG document", () => {
  const card = buildOgCard(heroChart());
  assert.equal(OG_WIDTH, 1200);
  assert.equal(OG_HEIGHT, 630);
  // The root <svg> must carry integer width/height in that order so the
  // headless rasterizer's svgDimensions() regex can read them.
  const root = /^<svg\b[^>]*\swidth="(\d+)"[^>]*\sheight="(\d+)"/.exec(card);
  assert.ok(root, "card should open with an <svg> carrying width then height");
  assert.equal(root[1], "1200");
  assert.equal(root[2], "630");
  assert.match(card, /viewBox="0 0 1200 630"/);
  assert.ok(card.trimEnd().endsWith("</svg>"));
});

test("the card carries the Vellum wordmark and tagline", () => {
  const card = buildOgCard(heroChart(), { tagline: "an atelier of imaginary cartography" });
  assert.match(card, />VELLUM</);
  assert.match(card, /an atelier of imaginary cartography/);
});

test("the embedded hero chart keeps its recipe metadata and is letterboxed", () => {
  const card = buildOgCard(heroChart());
  // The chart root is rewritten in place, not stripped, so its embedded
  // recipe (data-vellum-seed, viewBox) survives into the card.
  assert.match(card, /data-vellum-seed="42"/);
  assert.match(card, /preserveAspectRatio="xMidYMid meet"/);
  // exactly one nested chart (two <svg> opens total: outer card + chart)
  assert.equal((card.match(/<svg\b/g) ?? []).length, 2);
});

test("the embedded chart root is resized to the card viewport, not 1500x1158", () => {
  const card = buildOgCard(heroChart());
  // isolate the nested chart's opening tag (the second <svg ...> in the doc).
  const nestedStart = card.indexOf("<svg", card.indexOf("<svg") + 1);
  const nestedTag = card.slice(nestedStart, card.indexOf(">", nestedStart) + 1);
  // the root tag carries the card-region size, not the chart's native size
  // (width="1500" still appears deeper in the chart's own coordinate space).
  assert.doesNotMatch(nestedTag, /width="1500"/);
  assert.doesNotMatch(nestedTag, /height="1158"/);
  assert.match(nestedTag, /\sx="\d+"/);
  assert.match(nestedTag, /preserveAspectRatio="xMidYMid meet"/);
});

test("the card copy contains no em-dash (published-copy rule)", () => {
  const card = buildOgCard(heroChart(), {
    tagline: "an atelier of imaginary cartography",
    footnote: "every chart is reproducible from the number in its margin",
  });
  assert.ok(!card.includes("—"), "OG card copy must not contain em-dashes");
});
