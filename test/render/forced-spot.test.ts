import { test } from "node:test";
import assert from "node:assert/strict";
import type { Box } from "../../src/render/geometry.ts";
import { forcedSpot, type NameTry } from "../../src/render/layers/settlements.ts";
import type { SettlementTier } from "../../src/render/layers/settlement-marks.ts";

const box = (x: number): Box => ({ x, y: 0, w: 10, h: 10 });
const tries: NameTry[] = [0, 20, 40, 60].map((x) => ({ at: { x, y: 0, anchor: "start" }, box: box(x) }));
const wholeAt =
  (xs: number[]) =>
  (b: Box): boolean =>
    xs.includes(b.x);

test("a world sheet forces a capital's, seat's or town's name into its first spot wherever it lands", () => {
  for (const tier of ["capital", "seat", "town"] as const) {
    assert.equal(forcedSpot(false, tier, tries, wholeAt([20, 40])), tries[0], tier);
  }
});

test("a close-up forces it into its first spot that is whole on the sheet and off its mark", () => {
  assert.equal(forcedSpot(true, "town", tries, wholeAt([40, 60])), tries[2]);
});

test("a close-up with no whole spot keeps the first one", () => {
  assert.equal(forcedSpot(true, "seat", tries, wholeAt([])), tries[0]);
});

test("a village, a hamlet, a farmstead and a mill are never forced", () => {
  for (const tier of ["village", "hamlet", "farmstead", "mill"] as const satisfies ReadonlyArray<SettlementTier>) {
    for (const closeUp of [false, true]) {
      assert.equal(
        forcedSpot(closeUp, tier, tries, wholeAt([0, 20, 40, 60])),
        undefined,
        `${tier}, closeUp ${closeUp}`,
      );
    }
  }
});
