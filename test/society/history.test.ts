import { test } from "node:test";
import assert from "node:assert/strict";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";

test("history is deterministic for a seed", () => {
  const a = generateWorld(defaultRecipe(42));
  const b = generateWorld(defaultRecipe(42));
  assert.deepEqual(a.history.events, b.history.events);
  assert.deepEqual(
    a.settlements.map((s) => [s.founded, s.ruined]),
    b.settlements.map((s) => [s.founded, s.ruined]),
  );
});

test("the chronicle is non-empty and bounded", () => {
  for (const seed of [42, 7, 100, 256, 333]) {
    const w = generateWorld(defaultRecipe(seed));
    assert.ok(w.history.events.length >= 1, `seed ${seed} has events`);
    assert.ok(w.history.events.length <= 14, `seed ${seed} bounded`);
  }
});

test("history invariants hold across a seed sweep", () => {
  // one generation per seed; assert every invariant on the same world
  for (let seed = 1; seed <= 24; seed++) {
    const w = generateWorld(defaultRecipe(seed));
    const seatSet = new Set(w.realms.seats);

    // events dated ascending, all before the present survey year
    let prev = -Infinity;
    for (const e of w.history.events) {
      assert.ok(e.year >= prev, `seed ${seed}: ${e.year} >= ${prev}`);
      assert.ok(e.year < w.title.year, `seed ${seed}: ${e.year} < present`);
      prev = e.year;
    }

    // ruins: bounded, only non-seat villages
    const ruined = w.settlements.filter((s) => s.ruined);
    assert.ok(ruined.length <= 2, `seed ${seed}: <=2 ruins`);
    w.settlements.forEach((s, i) => {
      if (s.ruined) {
        assert.equal(s.kind, "village", `seed ${seed}: ruin is a village`);
        assert.ok(!seatSet.has(i), `seed ${seed}: ruin is not a realm seat`);
      }
      // founding years positive and before the present
      assert.ok(s.founded > 0 && s.founded < w.title.year, `seed ${seed}: founded`);
    });
  }
});

test("single-realm worlds still get a chronicle and never index empty realms", () => {
  // seed 3 is a citystate (one realm, names.realms === [])
  const w = generateWorld(defaultRecipe(3));
  assert.equal(w.recipe.mapType, "citystate");
  assert.deepEqual(w.names.realms, []);
  assert.ok(w.history.events.length >= 1);
  // no rise/war events when there are no named realms
  for (const e of w.history.events) {
    assert.ok(e.kind === "founding" || e.kind === "ruin");
  }
});
