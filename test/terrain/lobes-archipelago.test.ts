import { test } from "node:test";
import assert from "node:assert/strict";
import { islandCount } from "../../test-support/islands.ts";
import { buildHeightfield } from "../../src/terrain/heightfield.ts";
import { MAX_ISLANDS } from "../../src/terrain/lobes.ts";
import { pickSeaLevel } from "../../src/terrain/sealevel.ts";
import { defaultRecipe, landShareOf } from "../../src/world/generate.ts";
import type { WorldRecipe } from "../../src/world/types.ts";

// 2026-10-28, Issue #852: seeds 1 to 60 (1 to 100 at asked 2 and 5) gave alike and round 2 to 13, 4 to 5, 16 to 20 and 68 to 87 islands, varied and ragged 2 to 15, 4 to 20, 15 to 29 and 52 to 79; each band runs a tenth past the worst, rounded outward.
const BANDS: Readonly<Record<number, readonly [number, number]>> = {
  2: [1, 17],
  5: [3, 22],
  20: [13, 32],
  [MAX_ISLANDS]: [46, 96],
};

const ARMS: ReadonlyArray<Pick<WorldRecipe, "isleSize" | "raggedness">> = [{}, { isleSize: "varied", raggedness: 1 }];

test("an asked count is honoured within its band on the archipelago, alike and round, varied and ragged (Issue #852)", () => {
  const failures: string[] = [];
  for (const n of [2, 5, 20, MAX_ISLANDS]) {
    const [low, high] = BANDS[n] as readonly [number, number];
    for (let seed = 1; seed <= 10; seed++) {
      for (const arm of ARMS) {
        const recipe = defaultRecipe(seed, { mapType: "archipelago", islands: n, ...arm });
        const elev = buildHeightfield({
          seed,
          gridW: 320,
          gridH: 240,
          mapType: "archipelago",
          islands: n,
          ...arm,
        });
        const count = islandCount(elev, pickSeaLevel(elev, landShareOf(recipe)));
        if (count < low || count > high) {
          failures.push(
            `seed ${seed}, asked ${n}, ${JSON.stringify(arm)}: ${count} islands, outside [${low}, ${high}]`,
          );
        }
      }
    }
  }
  assert.deepEqual(failures, [], "an asked count missed its band");
});
