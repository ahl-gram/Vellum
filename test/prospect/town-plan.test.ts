import { test } from "node:test";
import assert from "node:assert/strict";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";
import { generateRegionWorld, regionTitle, windowAround } from "../../src/world/region.ts";
import { LOD_BANDS } from "../../src/world/lod.ts";
import { prospectKind } from "../../src/prospect/input.ts";
import { planTown } from "../../src/prospect/town-plan/plan.ts";
import { fnv1a } from "../../test-support/dress-svg.ts";
import { worldFor } from "../../test-support/seed-worlds.ts";

test("a town's plan is drawn from a world sheet alone", () => {
  const world = worldFor(42);
  const window = windowAround(world, world.settlements[0]!, LOD_BANDS[3]!.sizeUV);
  const closeUp = generateRegionWorld(world, {
    window,
    gridW: 320,
    gridH: 240,
    title: regionTitle(world, window),
    detail: true,
  });
  assert.notEqual(closeUp.region, undefined, "the close-up carries its region");
  assert.equal(prospectKind(closeUp, closeUp.settlements[0]!, 0), "capital", "a plain town the close-up would plan");
  assert.throws(() => planTown(closeUp, 0), RangeError);
  assert.throws(() => planTown(world, world.settlements.length), RangeError);
});

test("a town's plan is the same from a freshly generated world of the same seed", () => {
  const a = generateWorld(defaultRecipe(42));
  const b = generateWorld(defaultRecipe(42));
  const n = a.settlements.length;
  assert.ok(n > 0, "the world has settlements");
  for (let i = 0; i < n; i++) {
    const first = planTown(a, i);
    planTown(a, (i + 1) % n);
    assert.deepEqual(planTown(b, i), first, `index ${i} plans the same`);
  }
});

// 2026-11-25: read at 236d7565 on darwin arm64 off the port, the same sums as the ruled round's planner (Issue #793 build plan, 793-fold-pins.log).
const PINNED = [
  { seed: 42, index: 0, sum: 36804929 }, // Laukuwelua, capital, harbor
  { seed: 42, index: 5, sum: 281475521 }, // Loatunui, town, harbor
  { seed: 1, index: 1, sum: 2195854686 }, // Mectlan, seat
  { seed: 3, index: 19, sum: 951759458 }, // Saharabad, village, inland + ruined
  { seed: 7, index: 3, sum: 2060375976 }, // Wutoanu, town, harbor
];

const thousandths = (_key: string, value: unknown): unknown =>
  typeof value === "number" ? Math.round(value * 1000) / 1000 : value;

test("pinned plan checksums freeze the planner", () => {
  assert.ok(PINNED.length > 0, "pins exist");
  for (const { seed, index, sum } of PINNED) {
    assert.equal(
      fnv1a(JSON.stringify(planTown(worldFor(seed), index), thousandths)),
      sum,
      `seed ${seed} index ${index}`,
    );
  }
});

test("a capital or seat is walled with one keep, a town walled with none, a village open", () => {
  const plans = [1, 7, 42].flatMap((seed) => {
    const world = worldFor(seed);
    return world.settlements.map((s, i) => ({ seed, i, kind: prospectKind(world, s, i), plan: planTown(world, i) }));
  });
  for (const kind of ["capital", "seat", "town", "village"]) {
    assert.ok(
      plans.some((p) => p.kind === kind),
      `the three seeds hold a ${kind}`,
    );
  }
  const keeps = (p: (typeof plans)[number]): number => p.plan.landmarks.filter((l) => l.kind === "keep").length;
  for (const p of plans.filter((q) => q.kind === "capital" || q.kind === "seat")) {
    assert.notEqual(p.plan.wall, null, `seed ${p.seed} index ${p.i} ${p.kind} is walled`);
    assert.equal(keeps(p), 1, `seed ${p.seed} index ${p.i} ${p.kind} has one keep`);
  }
  for (const p of plans.filter((q) => q.kind === "town")) {
    assert.notEqual(p.plan.wall, null, `seed ${p.seed} index ${p.i} town is walled`);
    assert.equal(keeps(p), 0, `seed ${p.seed} index ${p.i} town has no keep`);
  }
  for (const p of plans.filter((q) => q.kind === "village")) {
    assert.equal(p.plan.wall, null, `seed ${p.seed} index ${p.i} village is open`);
    assert.equal(p.plan.gates.length, 0, `seed ${p.seed} index ${p.i} village has no gate`);
    assert.equal(keeps(p), 0, `seed ${p.seed} index ${p.i} village has no keep`);
  }
});
