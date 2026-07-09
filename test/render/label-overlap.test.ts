import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { glyphPoly, polysOverlap, textNodes } from "../../test-support/label-geometry.ts";

/**
 * #175: a label must reserve the space it actually draws.
 *
 * Two compounding causes let realm and range names collide despite both claiming
 * space in the arena, which claims first-come and refuses overlaps:
 *   - `spacedTextBox` measured with a 0.56 mixed-case factor while both labels
 *     render `.toUpperCase()` (~0.72), understating every box by about 20%; and
 *   - the range label claimed an axis-aligned box, then drew itself rotated by up
 *     to 32 degrees along the ridge, swinging its ends outside what it reserved.
 *
 * The ground truth here is rebuilt from the SVG (see test-support/label-geometry),
 * deliberately NOT from `spacedTextBox`: reusing the claim helper would be blind to
 * exactly the disagreement this issue is about.
 *
 * The two seeds are the charts Alex filed on #145; the chart number is the seed.
 */
const CASES = [
  { seed: 1619895893, chart: "The Whispering Reaches of Rau" },
  { seed: 3767410253, chart: "The Verdant Isle of Gyath" },
] as const;

for (const { seed, chart } of CASES) {
  test(`realm and range names do not overlap on seed ${seed} (${chart})`, () => {
    const world = generateWorld(defaultRecipe(seed));
    const svg = renderMap(world, { style: "antique" });
    const nodes = textNodes(svg);

    const rangeName = world.names.range?.toUpperCase();
    assert.ok(rangeName, `fixture drift: seed ${seed} has no named mountain range`);
    const range = nodes.find((n) => n.text === rangeName);
    assert.ok(range, `the range label "${rangeName}" should be on the chart`);
    assert.ok(range.rotate, "the range label is drawn rotated along its ridge");

    const realmNames = new Set(world.names.realms.map((n) => n.toUpperCase()));
    const realms = nodes.filter((n) => realmNames.has(n.text));
    assert.ok(realms.length > 0, "realm names should be on the chart");

    const rangePoly = glyphPoly(range);
    const collisions = realms
      .filter((r) => polysOverlap(glyphPoly(r), rangePoly))
      .map((r) => r.text);

    assert.deepEqual(
      collisions,
      [],
      `realm names overlapping "${rangeName}": ${collisions.join(", ") || "(none)"}`,
    );
  });
}

test("every realm is still named once label boxes tell the truth", () => {
  const offenders: string[] = [];
  for (const { seed } of CASES) {
    const world = generateWorld(defaultRecipe(seed));
    const svg = renderMap(world, { style: "antique" });
    for (const name of world.names.realms) {
      if (!svg.includes(`>${name.toUpperCase()}</text>`)) offenders.push(`seed ${seed}: "${name}"`);
    }
  }
  assert.deepEqual(offenders, [], `unlabelled realms under the tighter arena: ${offenders.join(", ")}`);
});

test("the range label survives the tighter arena on both filed seeds", () => {
  const missing: number[] = [];
  for (const { seed } of CASES) {
    const world = generateWorld(defaultRecipe(seed));
    const svg = renderMap(world, { style: "antique" });
    if (world.names.range && !svg.includes(`>${world.names.range.toUpperCase()}</text>`)) {
      missing.push(seed);
    }
  }
  assert.deepEqual(missing, [], `range label dropped on seeds: ${missing.join(", ")}`);
});
