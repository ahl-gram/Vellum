import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { nameSetOf, worldNameSet } from "../../src/society/hamlets.ts";
import { assignFormerNames } from "../../src/society/renames.ts";
import { CULTURES, isNearExisting, type Culture } from "../../src/society/names.ts";
import { createRng } from "../../src/core/rng.ts";
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

// 4 is MEASURED off seed 42 (26 settlements, 4 renamed), deliberately a literal and not an import of MAX: importing it would move both sides of the assertion together and see nothing.
test("only a few are renamed, against the measured bound", () => {
  for (const seed of SEEDS) {
    const w = worldFor(seed);
    assert.ok(
      renamed(w).length <= 4,
      `seed ${seed} renamed ${renamed(w).length}; "a few" is the ruling`,
    );
  }
});

test("seed 42's former names are exactly these", () => {
  assert.deepEqual(
    renamed(worldFor(42)).map((m) => [m.name, m.formerName]),
    [
      ["Laukuwelua", "Haitani"],
      ["Paukilua", "Lainai"],
      ["Poalo", "Kautana"],
      ["Pale", "Pangnui"],
    ],
  );
});

// The world sweep cannot exercise collision: 12 seeds happen never to collide, so the guard holds by fixture luck. These drive assignFormerNames directly with a taken set built to collide.
const FIXTURE = Array.from({ length: 12 }, (_, i) => ({
  name: `Fixture${i}`,
  ruined: false,
}));

const drawWith = (taken: ReadonlySet<string>): string[] => [
  ...assignFormerNames(FIXTURE, CULTURES[0] as Culture, createRng(7).fork("renames"), taken).values(),
];

test("a former name yields to a word the world already uses", () => {
  const free = drawWith(new Set());
  assert.ok(free.length > 0, "fixture drew nothing");
  const forbidden = new Set(free.map((n) => n.toLowerCase()));
  for (const name of drawWith(forbidden)) {
    assert.ok(!forbidden.has(name.toLowerCase()), `${name} was already taken`);
  }
});

test("a former name yields to a NEAR duplicate, not only an exact one", () => {
  const free = drawWith(new Set());
  const near = free.map((n) => `${n.slice(0, -1)}x`.toLowerCase());
  for (const name of drawWith(new Set(near))) {
    assert.ok(
      !isNearExisting(name.toLowerCase(), near),
      `${name} reads as a typo of a name already on the chart`,
    );
  }
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
