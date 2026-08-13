import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { renderMap } from "../../src/render/map-renderer.ts";

// #145: every realm must carry its name. feature-labels.ts used to drop one silently when the largest blob was under 60 cells, or when all five candidates failed tryClaim (all at the centroid's x, so one crowded settlement column killed the name even with thousands of free cells elsewhere).
// The two seeds are the charts Alex filed (the chart number IS the seed), each with exactly one silently dropped realm. #235 re-rolled only the name STRINGS (culture is picked AFTER the partition, so realm index i is the same realm); both fixtures re-pinned to the new names.
const CASES = [
  { seed: 1619895893, chart: "The Whispering Reaches of Ciapa", dropped: "The Empire of Non" },
  { seed: 3767410253, chart: "The Verdant Isle of Noca", dropped: "The Niayax Dominion" },
] as const;

/** Realm labels render as all-caps text nodes. */
function isLabelled(svg: string, name: string): boolean {
  return svg.includes(`>${name.toUpperCase()}</text>`);
}

for (const { seed, chart, dropped } of CASES) {
  test(`every realm is named on seed ${seed} (${chart})`, () => {
    const world = generateWorld(defaultRecipe(seed));
    const svg = renderMap(world, { style: "antique" });

    assert.ok(
      world.names.realms.includes(dropped),
      `fixture drift: seed ${seed} no longer has a realm called "${dropped}"`,
    );

    const missing = world.names.realms.filter((n) => !isLabelled(svg, n));
    assert.deepEqual(
      missing,
      [],
      `unlabelled realms on seed ${seed}: ${missing.join(", ") || "(none)"}`,
    );
  });
}

test("every realm is named across a spread of seeds", () => {
  const offenders: string[] = [];
  for (let seed = 1; seed <= 12; seed++) {
    const world = generateWorld(defaultRecipe(seed));
    const svg = renderMap(world, { style: "antique" });
    for (const name of world.names.realms) {
      if (!isLabelled(svg, name)) offenders.push(`seed ${seed}: "${name}"`);
    }
  }
  assert.deepEqual(offenders, [], `unlabelled realms:\n  ${offenders.join("\n  ")}`);
});
