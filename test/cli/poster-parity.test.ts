import { test } from "node:test";
import assert from "node:assert/strict";
import { generateWorld } from "../../src/world/generate.ts";
import { recipeForCommand } from "../../src/cli/recipe.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { recipeFromSvg } from "../../src/render/recipe-meta.ts";
import { POSTER_PRESETS } from "../../docs/print-room/poster-presets.js";

// Acceptance-4 (#134): a Grand poster of seed 42 antique reproduces the old
// `npm run poster --seed 42 --style antique` output. The covenant is RECIPE-level, not
// byte-level: the Print Room proof defaults its legend ON (docs/print-room/app.js), the
// CLI poster defaults it OFF (src/cli/main.ts), and a legend is a structural SVG group,
// so the two are deliberately NOT full-SVG identical. What must match is the WORLD and
// the WIDTH the plate renders at. The option-carry (that a poster inherits the on-screen
// proof's legend/arms/theme) is proven in the print-room e2e, not here.
//
// This is a characterization guard (green from the start), not a red->green: it pins the
// covenant so a future divergence between the CLI poster path and the Print Room's world
// choice reds here. Both paths funnel through defaultRecipe + renderMap, so the recipe +
// width are the only surface a regression could move.

const GRAND = POSTER_PRESETS.find((p) => p.key === "grand")!.width;

test("a Grand poster renders the CLI poster's world at the CLI poster's width", () => {
  // The Print Room's poster order is a `draw` job: defaultRecipe(seed, overrides) then
  // renderMap at the clamped poster width. recipeForCommand("poster", ...) IS
  // defaultRecipe (src/cli/recipe.ts), so this generates the exact world the CLI poster
  // drafts for the same seed.
  const world = generateWorld(recipeForCommand("poster", 42, {}));
  const svg = renderMap(world, { widthPx: GRAND, style: "antique" });

  const parsed = recipeFromSvg(svg);
  assert.ok(parsed, "the poster SVG carries a round-trippable recipe");
  assert.equal(parsed.recipe.seed, 42);
  assert.equal(parsed.style, "antique");
  // The self-describing width the artifact was pulled at.
  assert.match(svg, /<svg\b[^>]*\bwidth="4200"/);
});

test("the Grand width equals the CLI poster default (4200)", () => {
  assert.equal(GRAND, 4200);
});
