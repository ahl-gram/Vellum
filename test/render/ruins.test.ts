import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { renderMap } from "../../src/render/map-renderer.ts";

test("ruined settlements render a ruin glyph on the map", () => {
  const w = generateWorld(defaultRecipe(42));
  const ruins = w.settlements.filter((s) => s.ruined).length;
  assert.ok(ruins > 0, "seed 42 has ruins to draw");
  const svg = renderMap(w, { style: "antique" });
  assert.equal((svg.match(/class="ruin"/g) ?? []).length, ruins);
});

test("the legend lists Ruins only when the world has any", () => {
  const w = generateWorld(defaultRecipe(42));
  assert.ok(w.settlements.some((s) => s.ruined));
  assert.match(renderMap(w, { style: "antique", legend: true }), /Ruins/);

  // same world with ruins cleared (immutable copy): no glyph, no key row
  const noRuins = {
    ...w,
    settlements: w.settlements.map((s) => ({ ...s, ruined: false })),
  };
  const svg = renderMap(noRuins, { style: "antique", legend: true });
  assert.equal((svg.match(/class="ruin"/g) ?? []).length, 0);
  assert.doesNotMatch(svg, /Ruins/);
});
