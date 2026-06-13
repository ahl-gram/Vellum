import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { renderMap } from "../../src/render/map-renderer.ts";

// structural tests (written alongside the renderer, not red-green:
// aesthetics aren't unit-assertable — these pin the contract instead)

const world = generateWorld(defaultRecipe(42, { gridW: 160, gridH: 120 }));

test("renderMap emits a complete SVG document with all core layers", () => {
  const svg = renderMap(world, { style: "antique" });
  assert.ok(svg.startsWith("<svg"));
  assert.ok(svg.endsWith("</svg>"));
  for (const layer of [
    "layer-ocean",
    "layer-waterlines",
    "layer-land",
    "layer-rivers",
    "layer-settlements",
    "layer-frame",
    "layer-cartouche",
    "layer-glyphs",
    "layer-scalebar",
  ]) {
    assert.ok(svg.includes(`id="${layer}"`), `missing ${layer}`);
  }
});

test("no NaN coordinates leak into the document", () => {
  for (const style of ["antique", "topographic", "ink", "nautical"] as const) {
    const svg = renderMap(world, { style });
    assert.ok(!svg.includes("NaN"), `NaN in ${style} output`);
    assert.ok(!svg.includes("undefined"), `undefined in ${style} output`);
  }
});

test("nautical style carries soundings and the shoal wash", () => {
  const svg = renderMap(world, { style: "nautical" });
  assert.ok(svg.includes("layer-soundings"), "soundings missing");
  assert.ok(!svg.includes("layer-glyphs"), "nautical land stays sparse");
  const antique = renderMap(world, { style: "antique" });
  assert.ok(!antique.includes("layer-soundings"));
});

test("rendering is deterministic", () => {
  const a = renderMap(world, { style: "antique" });
  const b = renderMap(world, { style: "antique" });
  assert.equal(a, b);
});

test("styles produce genuinely different documents", () => {
  const antique = renderMap(world, { style: "antique" });
  const topo = renderMap(world, { style: "topographic" });
  const ink = renderMap(world, { style: "ink" });
  assert.notEqual(antique, topo);
  assert.notEqual(topo, ink);
  assert.ok(topo.includes("layer-hypsometric"), "topo needs hypsometric tints");
  assert.ok(!antique.includes("layer-hypsometric"));
  assert.ok(antique.includes("layer-texture"), "antique needs parchment");
});

test("tags are balanced", () => {
  const svg = renderMap(world, { style: "antique" });
  const opens = (svg.match(/<g[ >]/g) ?? []).length;
  const closes = (svg.match(/<\/g>/g) ?? []).length;
  assert.equal(opens, closes, "unbalanced <g> tags");
  const texts = (svg.match(/<text[ >]/g) ?? []).length;
  const textCloses = (svg.match(/<\/text>/g) ?? []).length;
  assert.equal(texts, textCloses, "unbalanced <text> tags");
});

test("title and settlement names appear in the document", () => {
  const svg = renderMap(world, { style: "antique" });
  assert.ok(svg.includes(world.title.title));
  const capital = world.settlements.find((s) => s.kind === "capital")!;
  assert.ok(svg.includes(capital.name.toUpperCase()));
});

test("custom width scales the document", () => {
  const svg = renderMap(world, { style: "ink", widthPx: 800 });
  assert.ok(svg.includes(`width="800"`));
});
