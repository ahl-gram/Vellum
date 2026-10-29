import { test } from "node:test";
import assert from "node:assert/strict";
import { placeLobes, type Lobe } from "../../src/terrain/lobes.ts";

const ASPECT = 319 / 239;

const coverage = (lobes: ReadonlyArray<Lobe>): number => lobes.reduce((t, l) => t + l.r * l.r, 0);

test("varied sizes never cover less of the sheet than alike ones (Issue #852)", () => {
  const short: string[] = [];
  let lowest = Infinity;
  for (let seed = 1; seed <= 200; seed++) {
    for (const count of [2, 3, 4, 5, 8, 10, 20]) {
      const ratio =
        coverage(placeLobes(seed, count, "varied", ASPECT)) / coverage(placeLobes(seed, count, "equal", ASPECT));
      lowest = Math.min(lowest, ratio);
      if (ratio < 1 - 1e-12) short.push(`seed ${seed}, asked ${count}: varied covers ${ratio} of the alike sizes`);
    }
  }
  assert.deepEqual(short, [], `the lowest ratio was ${lowest}`);
});
