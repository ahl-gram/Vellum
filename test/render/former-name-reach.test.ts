import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { buildProspectInput } from "../../src/prospect/input.ts";
import { chooseQuarry, revealLore } from "../../src/world/daily-hunt.ts";
import { buildDocket } from "../../src/site/explorer/verso.ts";
import { capitalBlurb } from "../../src/world/seed-of-the-day.ts";
import type { World } from "../../src/world/types.ts";

// #49 PR 2, ruling 7's remaining three surfaces: the prospect page, the Daily Hunt reveal, and Seed of the Day plus the verso docket.

const worlds = new Map<number, World>();
const worldFor = (seed: number): World => {
  const cached = worlds.get(seed);
  if (cached) return cached;
  const w = generateWorld(defaultRecipe(seed));
  worlds.set(seed, w);
  return w;
};

const SEEDS = [1, 3, 7, 42];

const renamedIdx = (w: World): number =>
  w.settlements.findIndex((s) => s.formerName !== undefined);

test("the prospect input carries the former name", () => {
  for (const seed of SEEDS) {
    const w = worldFor(seed);
    const i = renamedIdx(w);
    assert.ok(i >= 0, `seed ${seed} renamed nothing`);
    assert.equal(buildProspectInput(w, i).formerName, w.settlements[i]!.formerName);
  }
});

test("an unrenamed place leaves no former key on the prospect input", () => {
  const w = worldFor(42);
  const i = w.settlements.findIndex((s) => s.formerName === undefined && !s.ruined);
  const p = buildProspectInput(w, i);
  assert.equal(p.formerName, undefined);
  assert.ok(!("formerName" in p), "an absent former name should not leave the key behind");
});

test("the Daily Hunt reveal names what the quarry used to be called", () => {
  const found: string[] = [];
  for (const seed of SEEDS) {
    const w = worldFor(seed);
    const i = renamedIdx(w);
    const quarry = chooseQuarry(w, { exclude: new Set() });
    const forced = { ...quarry, idx: i, settlement: w.settlements[i]! };
    const reveal = revealLore(w, forced);
    assert.equal(reveal.formerName, w.settlements[i]!.formerName, `seed ${seed}`);
    found.push(reveal.formerName as string);
  }
  assert.equal(found.length, SEEDS.length);
});

test("the reveal of an unrenamed place carries no former name", () => {
  const w = worldFor(42);
  const i = w.settlements.findIndex((s) => s.formerName === undefined && !s.ruined);
  const quarry = chooseQuarry(w, { exclude: new Set() });
  const reveal = revealLore(w, { ...quarry, idx: i, settlement: w.settlements[i]! });
  assert.equal(reveal.formerName, undefined);
  assert.ok(!("formerName" in reveal), "an absent former name should not leave the key behind");
});

test("a ruined quarry never carries a former name", () => {
  for (const seed of SEEDS) {
    const w = worldFor(seed);
    const i = w.settlements.findIndex((s) => s.ruined);
    if (i < 0) continue;
    const quarry = chooseQuarry(w, { exclude: new Set() });
    const reveal = revealLore(w, { ...quarry, idx: i, settlement: w.settlements[i]! });
    assert.equal(reveal.formerName, undefined, `seed ${seed}`);
  }
});

test("the verso docket names the capital's former name when it has one", () => {
  const docket = buildDocket({
    seed: 42,
    title: "The Isle of Rahai",
    presentYear: 1059,
    capital: "Laukuwelua",
    capitalFormerName: "Haitani",
  });
  assert.equal(docket, "CHART № 42 · The Isle of Rahai · Year 1059 · Laukuwelua (once Haitani)");
});

test("the verso docket is unchanged for a capital that was never renamed", () => {
  const docket = buildDocket({
    seed: 42,
    title: "The Isle of Rahai",
    presentYear: 1059,
    capital: "Laukuwelua",
  });
  assert.equal(docket, "CHART № 42 · The Isle of Rahai · Year 1059 · Laukuwelua");
});

test("an explicit undefined former name reads the same as an absent one", () => {
  const fields = { seed: 42, title: "The Isle of Rahai", presentYear: 1059, capital: "Laukuwelua" };
  assert.equal(buildDocket({ ...fields, capitalFormerName: undefined }), buildDocket(fields));
});

test("the Seed of the Day capital blurb names the former name, and omits the clause without one", () => {
  assert.equal(
    capitalBlurb({ name: "Laukuwelua", formerName: "Haitani" }, "A sheltered mooring."),
    "Laukuwelua, the capital. Once called Haitani. A sheltered mooring.",
  );
  assert.equal(
    capitalBlurb({ name: "Laukuwelua" }, "A sheltered mooring."),
    "Laukuwelua, the capital. A sheltered mooring.",
  );
});
