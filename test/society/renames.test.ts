import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { nameSetOf, worldNameSet } from "../../src/society/hamlets.ts";
import { editDistanceWithin1 } from "../../src/core/text.ts";
import type { World } from "../../src/world/types.ts";

// #49 rescoped 2026-08-16: a few living towns carry a former name, a DIFFERENT word from the same tongue (not an older phonetic form, which is #282's ground). Drawn on rng.fork("renames"), so no current name moves.

const SEEDS = [1, 2, 3, 5, 7, 11, 13, 17, 19, 23, 42, 99];

const worldFor = (seed: number): World => generateWorld(defaultRecipe(seed));

const renamed = (w: World): ReadonlyArray<{ name: string; formerName: string }> =>
  w.settlements.flatMap((s) =>
    s.formerName === undefined ? [] : [{ name: s.name, formerName: s.formerName }],
  );

test("a world carries at least one former name, and not everything is renamed", () => {
  for (const seed of SEEDS) {
    const w = worldFor(seed);
    const marks = renamed(w);
    assert.ok(marks.length > 0, `seed ${seed} renamed nothing`);
    assert.ok(
      marks.length < w.settlements.length,
      `seed ${seed} renamed every settlement; "a few" is the ruling`,
    );
  }
});

// worldNameSet folds former names in (the hamlet reservation), so the current-name set is built without them: the point is that a former name is a DIFFERENT word from everything the chart prints today.
const currentNames = (w: World): Set<string> =>
  nameSetOf(
    w.settlements.map(({ formerName: _drop, ...s }) => s),
    w.names,
  );

test("a former name is a different word, colliding with nothing else on the chart", () => {
  for (const seed of SEEDS) {
    const w = worldFor(seed);
    const taken = currentNames(w);
    for (const { name, formerName } of renamed(w)) {
      const stem = formerName.toLowerCase();
      assert.ok(
        !taken.has(stem),
        `seed ${seed}: former name ${formerName} is already a name in this world`,
      );
      assert.ok(
        !editDistanceWithin1(name.toLowerCase(), stem),
        `seed ${seed}: ${name} once called ${formerName} reads as a typo, not a renaming`,
      );
    }
  }
});

test("former names are distinct from each other", () => {
  for (const seed of SEEDS) {
    const formers = renamed(worldFor(seed)).map((m) => m.formerName.toLowerCase());
    assert.equal(new Set(formers).size, formers.length, `seed ${seed} repeated a former name`);
  }
});

test("ruined towns keep the card they have: no former name", () => {
  for (const seed of SEEDS) {
    const w = worldFor(seed);
    for (const s of w.settlements) {
      if (s.ruined) {
        assert.equal(s.formerName, undefined, `seed ${seed}: ruined ${s.name} was renamed`);
      }
    }
  }
});

test("capitals and realm seats are eligible", () => {
  const ranked = SEEDS.map(worldFor).flatMap((w) => {
    const seats = new Set(w.realms.seats);
    return w.settlements.filter(
      (s, i) => s.formerName !== undefined && (s.kind === "capital" || seats.has(i)),
    );
  });
  assert.ok(ranked.length > 0, "no capital or realm seat carried a former name in any seed");
});

test("a former name reserves the word against hamlet naming", () => {
  for (const seed of SEEDS) {
    const w = worldFor(seed);
    const taken = worldNameSet(w);
    for (const { formerName } of renamed(w)) {
      assert.ok(
        taken.has(formerName.toLowerCase()),
        `seed ${seed}: ${formerName} is free for a hamlet to take`,
      );
    }
  }
});

test("the same seed yields the same former names", () => {
  for (const seed of SEEDS) {
    assert.deepEqual(renamed(worldFor(seed)), renamed(worldFor(seed)), `seed ${seed}`);
  }
});
