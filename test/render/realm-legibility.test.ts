import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { STYLES } from "../../src/render/style.ts";

/**
 * #158 legibility: realm borders must not read as roads, and realm names must
 * not fade into the parchment.
 *
 * Two root causes, both asserted on renderMap output (k = widthPx/1500 = 1 at the
 * 1500px default, so widths and dashes are the raw multipliers):
 *   - borders borrowed `style.road` (same color + dash as a track); now each style
 *     carries its own border token. antique/ink/nautical get a dark-ink dash-DOT
 *     boundary; topographic keeps its distinct border byte-for-byte.
 *   - realm names sat at fill-opacity 0.55 with no weight; now bold + 0.9 + a fatter
 *     halo. Font SIZE is deliberately unchanged: it is the one lever that feeds the
 *     label-placement test, so a bigger label could go unplaced.
 *
 * Same 160x120 seed-42 fixture as map-renderer.test (3 realms, borders drawn).
 */
const world = generateWorld(defaultRecipe(42, { gridW: 160, gridH: 120 }));

/** The realm-borders group's inner markup (paths only, no nested groups). */
function borderGroup(svg: string): string {
  const m = svg.match(/<g id="layer-realm-borders">([\s\S]*?)<\/g>/);
  return m ? (m[1] as string) : "";
}

/** The opening <text ...> tag of the realm label whose text is name (all-caps). */
function realmNameTag(svg: string, name: string): string {
  const marker = `>${name.toUpperCase()}</text>`;
  const idx = svg.indexOf(marker);
  if (idx < 0) return "";
  return svg.slice(svg.lastIndexOf("<text", idx), idx + 1);
}

const DASH_DOT = 'stroke-dasharray="6 3 0.6 3"';

test("antique realm borders are dark ink dash-dot, not the road color", () => {
  const g = borderGroup(renderMap(world, { style: "antique" }));
  assert.ok(g.length > 0, "antique should draw realm borders");
  assert.ok(g.includes(`stroke="${STYLES.antique.ink}"`), "border strokes in ink");
  assert.ok(!g.includes(`stroke="${STYLES.antique.road}"`), "border drops the road color");
  assert.ok(g.includes(DASH_DOT), "border uses the dash-dot boundary pattern");
  assert.ok(g.includes('stroke-width="1.5"'), "border is heavier than a track");
  assert.ok(g.includes('stroke-opacity="0.85"'), "border is more opaque than a track");
});

test("nautical realm borders switch from the road brown to navy ink dash-dot", () => {
  const g = borderGroup(renderMap(world, { style: "nautical" }));
  assert.ok(g.includes(`stroke="${STYLES.nautical.ink}"`), "border strokes in navy ink");
  assert.ok(!g.includes(`stroke="${STYLES.nautical.road}"`), "border drops the road brown");
  assert.ok(g.includes(DASH_DOT));
});

test("ink realm borders become dash-dot, distinct from the even-dashed roads", () => {
  const g = borderGroup(renderMap(world, { style: "ink" }));
  assert.ok(g.includes(DASH_DOT), "border adopts the dash-dot boundary pattern");
  assert.ok(!g.includes('stroke-dasharray="1.2 3.2"'), "no longer the old even dash");
});

test("topographic realm borders are preserved byte-for-byte (already distinct)", () => {
  // A preservation guard, not red-green: topographic's border already reads
  // distinctly from its cased red roads, so #158 must not move it.
  const g = borderGroup(renderMap(world, { style: "topographic" }));
  assert.ok(g.includes(`stroke="${STYLES.topographic.ink}"`));
  assert.ok(g.includes('stroke-width="1.1"'));
  assert.ok(g.includes('stroke-dasharray="1.2 3.2"'));
  assert.ok(g.includes('stroke-opacity="0.65"'));
});

test("realm names render bold, opaque, and haloed for legibility", () => {
  const svg = renderMap(world, { style: "antique" });
  const tag = realmNameTag(svg, world.names.realms[0] as string);
  assert.ok(tag.length > 0, "found a realm-name text element");
  assert.ok(tag.includes('font-weight="700"'), "bold");
  assert.ok(tag.includes('fill-opacity="0.9"'), "near-opaque, no longer washed out");
  assert.ok(tag.includes('stroke-width="3.8"'), "fatter halo carves the name off the texture");
  assert.ok(tag.includes(`fill="${STYLES.antique.labelColor}"`), "keeps the antique label color");
});

test("realm-name font size is unchanged, so no realm loses its label", () => {
  // Size feeds spacedTextBox -> tryClaim; leaving it at 16.5 keeps placement
  // identical, so every realm that was labeled before still is.
  const svg = renderMap(world, { style: "antique" });
  const tag = realmNameTag(svg, world.names.realms[0] as string);
  assert.ok(tag.includes('font-size="16.5"'), "font size held at 16.5");
  for (const name of world.names.realms) {
    assert.ok(svg.includes(`>${name.toUpperCase()}</text>`), `realm ${name} still labeled`);
  }
});
