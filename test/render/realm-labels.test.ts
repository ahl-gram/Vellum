import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { renderMap } from "../../src/render/map-renderer.ts";

/**
 * #145: every realm must carry its name. A realm that reaches the chart with a
 * tint, a border, and a coat of arms but no label is a chart that cannot be read.
 *
 * `feature-labels.ts` used to drop a realm name silently on two paths:
 *   - the largest contiguous blob was under 60 cells, or
 *   - all five placement candidates failed `tryClaim`. The candidates only ever
 *     moved vertically, all at the blob centroid's x, so one crowded column of
 *     settlement labels (settlements claim the arena first) killed the name even
 *     when thousands of the realm's own cells sat free elsewhere.
 *
 * The two seeds below are the ones Alex filed, recovered from the charts' own
 * `CHART No` (the chart number IS the seed). Each has exactly one silently
 * dropped realm.
 *
 * #235 (Names: Second Edition) re-rolled culture and names for every non-42 seed.
 * Culture is picked AFTER the realm partition, so each seed's blobs and seat order
 * are byte-identical; only the name strings changed, so realm index i is the same
 * realm. Both fixtures re-pinned to the new title and the new name of that SAME
 * geometrically-dropped realm:
 *   seed 1619895893: "The Whispering Reaches of Rau" -> "...Ciapa";
 *     dropped realm[0] "Greater Woropau" -> "The Empire of Non".
 *   seed 3767410253: "The Verdant Isle of Gyath" -> "...Noca";
 *     dropped realm[1] "The Gyamarde Dominion" -> "The Niayax Dominion".
 * The behavior guarded (every realm is labelled) is unchanged; only strings moved.
 */
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
