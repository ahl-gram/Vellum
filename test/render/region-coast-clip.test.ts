import { test } from "node:test";
import assert from "node:assert/strict";
import { renderMap } from "../../src/render/map-renderer.ts";
import { generateRegionWorld, windowAround } from "../../src/world/region.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import type { World } from "../../src/world/types.ts";

/**
 * The Surveyor's Glass / #223: region coastline registration. On a REGIONAL survey the
 * drawn coast is a Chaikin-smoothed marching-squares contour (ctx.coastRings), while
 * terrain glyphs and rivers are placed on the raw elev>seaLevel cell mask. Smoothing and
 * the window-edge corner closing pull the drawn coast INLAND of some land cells, so glyphs
 * and river mouths near the window edges render seaward of the shore, over open sea.
 *
 * The fix clips the glyph and river layers to the SAME coast polygon the land fill draws
 * (ctx.coastRings), so nothing paints over the sea. It is REGION-ONLY (gated on
 * world.region), so world charts are byte-identical and no golden regen is owed; the
 * golden-seed42 + hero-charts tests are the byte-identity backstop, and RC4 here guards
 * that a world chart carries no region clip at all.
 */

/** The seed-42 capital region plate, exactly as the atlas draws it (windowAround 0.38). */
function capitalRegion(seed: number): World {
  const world = generateWorld(defaultRecipe(seed));
  const capital = world.settlements.find((s) => s.kind === "capital") ?? world.settlements[0]!;
  return generateRegionWorld(world, {
    window: windowAround(world, capital, 0.38),
    gridW: world.recipe.gridW,
    gridH: world.recipe.gridH,
    title: `The Environs of ${capital.name}`,
  });
}

const REGION_CLIP = "region-land-clip";

test("RC1 a region survey clips the terrain glyphs to the drawn coast", () => {
  const svg = renderMap(capitalRegion(42), { style: "antique", widthPx: 1500, legend: true });
  assert.match(svg, new RegExp(`<clipPath id="${REGION_CLIP}">`), "region coast clip is defined");
  assert.match(
    svg,
    new RegExp(`<g clip-path="url\\(#${REGION_CLIP}\\)"><g id="layer-glyphs"`),
    "the glyph layer is wrapped in the coast clip, not just defined",
  );
});

test("RC2 a region survey clips the rivers to the drawn coast", () => {
  const svg = renderMap(capitalRegion(42), { style: "antique", widthPx: 1500, legend: true });
  assert.match(
    svg,
    new RegExp(`<g clip-path="url\\(#${REGION_CLIP}\\)"><g id="layer-rivers"`),
    "the river layer is wrapped in the coast clip, so river mouths cannot spill seaward",
  );
});

test("RC3 the region clip is the exact drawn coast (same polygon the land fill uses)", () => {
  const svg = renderMap(capitalRegion(42), { style: "antique", widthPx: 1500, legend: true });
  const clipD = svg.match(new RegExp(`<clipPath id="${REGION_CLIP}"><path d="([^"]*)"`))?.[1];
  const landD = svg.match(/<g id="layer-land"><path d="([^"]*)"/)?.[1];
  assert.ok(clipD && clipD.length > 0, "the region clip carries a coast path");
  assert.ok(landD && landD.length > 0, "the land fill carries a coast path");
  assert.equal(clipD, landD, "the clip polygon is the same coast the land fill draws, so content is clipped to the painted land exactly");
});

test("RC3b a second, river-rich region survey is clipped the same way", () => {
  // The issue names seeds 7, 12, 27, 100 as also carrying the spill; 100 is a river-rich sample.
  const svg = renderMap(capitalRegion(100), { style: "antique", widthPx: 1500, legend: true });
  assert.match(svg, new RegExp(`<g clip-path="url\\(#${REGION_CLIP}\\)"><g id="layer-glyphs"`), "glyphs clipped");
  assert.match(svg, new RegExp(`<g clip-path="url\\(#${REGION_CLIP}\\)"><g id="layer-rivers"`), "rivers clipped");
});

test("RC4 a world chart is untouched: no region coast clip (region-only, byte-identical)", () => {
  const world = generateWorld(defaultRecipe(42));
  const svg = renderMap(world, { style: "antique", widthPx: 1500, legend: true });
  assert.doesNotMatch(svg, new RegExp(REGION_CLIP), "world charts carry no region clip");
  // and the glyph/river layers render bare, exactly as before the fix
  assert.match(svg, /<g id="layer-glyphs"/, "world glyph layer present");
  assert.doesNotMatch(
    svg,
    new RegExp(`clip-path="url\\(#${REGION_CLIP}\\)"><g id="layer-glyphs"`),
    "world glyph layer is not wrapped in a region clip",
  );
});
