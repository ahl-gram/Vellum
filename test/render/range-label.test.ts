import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { renderMap } from "../../src/render/map-renderer.ts";

// Seed 1 at this grid yields the range "The Throne of Gerg" over a 119-cell
// alpine blob: a name drawn across a dense mountain-glyph field, the #9 case.
const world = generateWorld(defaultRecipe(1, { gridW: 160, gridH: 120 }));

test("a mountain-range label gets a paper casing so it reads over dense glyphs", () => {
  assert.ok(world.names.range, "fixture seed must produce a range name");
  for (const style of ["antique", "ink", "topographic"] as const) {
    const svg = renderMap(world, { style });
    assert.ok(
      svg.includes(world.names.range!.toUpperCase()),
      `${style}: range label should render`,
    );
    assert.ok(
      svg.includes('class="range-casing"'),
      `${style}: range label needs a casing plate behind it`,
    );
  }
});
