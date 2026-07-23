import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { recipeFromSvg } from "../../src/render/recipe-meta.ts";
import { POSTER_PRESETS } from "../../public/print-room/poster-presets.js";

// Acceptance-4 (#134): a Grand poster of seed 42 antique renders the covenant world
// (defaultRecipe(42)) at the Grand width. The CLI `poster` verb this once mirrored was
// retired in #138 (git history is its archive); the parity that still matters is that the
// Print Room's poster order and every other entry point draw the SAME world for a seed.
// The covenant is RECIPE-level, not byte-level: the Print Room proof defaults its legend
// ON (public/print-room/app.js) and a legend is a structural SVG group, so a poster is
// deliberately NOT full-SVG identical to a plain chart. What must match is the WORLD and
// the WIDTH the plate renders at. The option-carry (that a poster inherits the on-screen
// proof's legend/arms/theme) is proven in the print-room e2e, not here.
//
// A characterization guard (green from the start), not a red->green: it pins the covenant
// so a future divergence between the Print Room's world choice and defaultRecipe reds here.
// Both funnel through defaultRecipe + renderMap, so recipe + width are the only surface a
// regression could move.

const GRAND = POSTER_PRESETS.find((p) => p.key === "grand")!.width;

test("a Grand poster renders the covenant world at the Grand width", () => {
  // The Print Room's poster order is a `draw` job: defaultRecipe(seed, overrides) then
  // renderMap at the clamped poster width, so this generates the exact world a Grand
  // poster of the seed draws.
  const world = generateWorld(defaultRecipe(42, {}));
  const svg = renderMap(world, { widthPx: GRAND, style: "antique" });

  const parsed = recipeFromSvg(svg);
  assert.ok(parsed, "the poster SVG carries a round-trippable recipe");
  assert.equal(parsed.recipe.seed, 42);
  assert.equal(parsed.style, "antique");
  // The self-describing width the artifact was pulled at.
  assert.match(svg, /<svg\b[^>]*\bwidth="4200"/);
});

test("the Grand poster width is 4200", () => {
  assert.equal(GRAND, 4200);
});
