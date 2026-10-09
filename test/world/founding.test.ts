import { test } from "node:test";
import assert from "node:assert/strict";
import { createRng, hashString } from "../../src/core/rng.ts";
import { foundWorld, type Founding } from "../../src/world/founding/found.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { recipeFromSvg } from "../../src/render/recipe-meta.ts";

const EMPTY_RESIDUAL_SEED = 2166136261;

const founded = (sentence: string): Founding => {
  const f = foundWorld(sentence);
  assert.ok(f.ok, `"${sentence}" should found a world, was refused: ${f.ok ? "" : f.reason}`);
  return f;
};

const phrases = (list: Founding["steered"]): string[] => list.map((r) => r.phrase);

test("a sentence differing by one unrecognised word, by word order, or by a digit founds a different world", () => {
  assert.notEqual(founded("a cold island of iron towers").seed, founded("a cold island of iron towns").seed);
  assert.notEqual(founded("quiet towns and long afternoons").seed, founded("long afternoons and quiet towns").seed);
  assert.notEqual(founded("the 7 seas").seed, founded("the 9 seas").seed);
});

test("synonyms found one world", () => {
  const a = founded("cold archipelago");
  const b = founded("frozen isles");
  assert.deepEqual(a.overrides, { band: "polar", mapType: "archipelago", culture: "norden" });
  assert.equal(a.seed, b.seed);
  assert.deepEqual(a.overrides, b.overrides);
});

test("a map type word that agrees with the seed's own roll founds the bare seed's recipe", () => {
  const bare = founded("quiet towns long afternoon");
  const own = defaultRecipe(bare.seed).mapType;
  const word = { island: "island", archipelago: "archipelago", continent: "continent", citystate: "citystate" }[own];
  const steered = founded(`${word} quiet towns long afternoon`);
  assert.equal(steered.seed, bare.seed, "a recognised word stays out of the chart number");
  assert.deepEqual(steered.overrides, { mapType: own });
  assert.deepEqual(defaultRecipe(steered.seed, steered.overrides), defaultRecipe(bare.seed));
});

test("each of the seven small words leaves the chart number alone", () => {
  const base = founded("quiet towns long afternoon").seed;
  for (const small of ["a", "an", "the", "of", "and", "with", "where"]) {
    assert.equal(founded(`${small} quiet towns ${small} long afternoon ${small}`).seed, base, small);
  }
  assert.equal(founded("the kingdom of the long afternoon").residual, "kingdom long afternoon");
});

test("a short word that is not one of the seven moves the chart number", () => {
  const base = founded("quiet towns long afternoon").seed;
  for (const word of ["in", "on", "by", "to", "at", "for", "its"]) {
    assert.notEqual(founded(`quiet towns ${word} long afternoon`).seed, base, word);
  }
});

test("two climate words that disagree both stop steering, and both count toward the chart number", () => {
  const f = founded("a tropical polar waste");
  assert.deepEqual(f.overrides, {});
  assert.deepEqual(phrases(f.steered), []);
  assert.deepEqual(phrases(f.contested), ["tropical", "polar"]);
  assert.equal(f.residual, "tropical polar waste");
  assert.equal(f.seed, hashString("tropical polar waste"));
  assert.notEqual(f.seed, founded("a waste").seed);
  assert.deepEqual(founded("cold frozen tropical isle").overrides, { mapType: "island" });
});

test("words that agree all steer", () => {
  const f = founded("cold frozen isle");
  assert.deepEqual(phrases(f.steered), ["cold", "frozen", "isle"]);
  assert.deepEqual(f.overrides, { band: "polar", mapType: "island", culture: "norden" });
  assert.equal(f.residual, "");
});

test("with the climate itself contested, a clashed tradition falls to the chart number", () => {
  const f = founded("cold atolls and fjords");
  assert.deepEqual(f.overrides, { mapType: "archipelago", coastWarp: 0.95 });
  assert.deepEqual(phrases(f.steered), ["atolls", "fjords"]);
  assert.deepEqual(phrases(f.contested), ["cold"]);
  assert.equal(f.residual, "cold");
});

test("a word keeps its tradition when only its climate clashed", () => {
  const f = founded("a polar sea of atolls");
  assert.deepEqual(f.overrides, { mapType: "archipelago", culture: "oromi" });
  assert.equal(f.residual, "polar sea");
});

test("a sentence naming no tradition takes the tradition of its climate word", () => {
  assert.equal(founded("a cold land of quiet towns").overrides.culture, "norden");
  assert.equal(founded("a warm land of quiet towns").overrides.culture, "oromi");
  assert.equal(founded("a mild land of quiet towns").overrides.culture, "sylvan");
  assert.equal(founded("a cold land of shrines").overrides.culture, "tsuren", "a named tradition outranks the climate");
  assert.equal(
    founded("a land of quiet towns").overrides.culture,
    undefined,
    "no climate word, so the chart number chooses",
  );
});

test("land and coast words set the recipe's land share and coast", () => {
  const drowned = founded("a drowned island");
  assert.equal(drowned.overrides.landFraction, 0.187);
  assert.equal(founded("a vast continent").overrides.landFraction, 0.644);
  const unnamed = founded("a drowned land of quiet towns");
  assert.equal(
    unnamed.overrides.landFraction,
    Math.round(defaultRecipe(unnamed.seed).landFraction * 0.55 * 1000) / 1000,
  );
  assert.equal(founded("a ragged land").overrides.coastWarp, 0.95);
  assert.equal(founded("a smooth land").overrides.coastWarp, 0.1);
});

test("a sentence made only of table words and small words founds at the empty chart number", () => {
  const f = founded("cold archipelago");
  assert.equal(f.seed, EMPTY_RESIDUAL_SEED);
  assert.deepEqual(f.overrides, { band: "polar", mapType: "archipelago", culture: "norden" });
  for (const sentence of ["the a of", "!!!", "\u{1F409}", "\u{1F5FA}\uFE0F", "#\uFE0F\u20E3"]) {
    const g = founded(sentence);
    assert.equal(g.seed, EMPTY_RESIDUAL_SEED, sentence);
    assert.deepEqual(g.overrides, {}, sentence);
  }
});

test("an emoji typed with a phone's presentation selector founds what the bare words found", () => {
  const plain = founded("cold island");
  for (const sentence of ["\u{1F3DD}\uFE0F cold island", "\u2744\uFE0Fcold island", "cold island \u{1F5FA}\uFE0F"]) {
    const f = founded(sentence);
    assert.equal(f.seed, plain.seed, sentence);
    assert.deepEqual(f.overrides, plain.overrides, sentence);
  }
  assert.deepEqual(plain.overrides, { band: "polar", mapType: "island", culture: "norden" });
});

test("a sentence with no table word steers nothing and hashes its words", () => {
  const f = founded("the kingdom of the long afternoon");
  assert.deepEqual(f.overrides, {});
  assert.equal(f.seed, hashString("kingdom long afternoon"));
});

test("a refusal comes back as a value, and a version this build does not have is refused", () => {
  assert.deepEqual(foundWorld(""), { ok: false, reason: "empty" });
  assert.deepEqual(foundWorld("cold\u0007isle"), { ok: false, reason: "control-character" });
  assert.deepEqual(foundWorld("a cold isle", 2), { ok: false, reason: "unknown-version" });
  assert.equal(founded("a cold isle").version, 1);
});

const POOL = [
  ...Array.from("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"),
  ...Array.from(" \t\n\u00A0\u3000.,;:!?'\u2019\u02BC\"-\u2010\u2014()[]"),
  ...Array.from("\u00E1\u00E9\u00DF\u00E6\u0301\u0130\u03A3\u0394\u03C2\u0416\u4E16\u0915\u093F\u0627\uFF23\uFB01"),
  "\u{1F409}",
  "\u{1F469}\u200D\u{1F680}",
  "\u{1F44D}\u{1F3FD}",
  "\u{1F1EF}\u{1F1F5}",
  "\u200B",
  "\u200C",
  "\u200D",
  "\u200E",
  "\u202E",
  "\u2066",
  "\uFEFF",
  "\u00AD",
  "\u0007",
  "\u0085",
  "\uFDD0",
  "\uFFFE",
  "\uD800",
  "\uDC00",
  " cold ",
  " atolls ",
  " sun-drenched ",
  " shrines ",
  " island's ",
  " black pines ",
  " drowned ",
  " the ",
  "\uFE0F",
  "\uFE0E",
  "\u20E3",
  "1\uFE0F\u20E3",
  "\u061C",
  "\u{1F3DD}\uFE0F",
  "\u2744\uFE0Fcold",
  " \u0301 ",
];
const REASONS = new Set(["empty", "too-long", "control-character", "unknown-character"]);
const UNCLEAN = /[\p{Cc}\p{Cn}\p{Cs}\p{Bidi_Control}\u200B\uFEFF]|^\s|\s$|\s\s/u;

test("any string founds a world or is refused by reason, never throws, and its display form founds itself", () => {
  const rng = createRng(391);
  let foundedCount = 0;
  for (let i = 0; i < 3000; i++) {
    const length = rng.int(40);
    const input = Array.from({ length }, () => rng.pick(POOL)).join("");
    const f = foundWorld(input);
    if (!f.ok) {
      assert.ok(REASONS.has(f.reason), JSON.stringify(input));
      continue;
    }
    foundedCount++;
    assert.doesNotMatch(f.sentence, UNCLEAN, JSON.stringify(input));
    assert.deepEqual(foundWorld(f.sentence), f, JSON.stringify(input));
  }
  assert.ok(foundedCount > 1000, `the sweep must found many worlds, founded ${foundedCount}`);
});

test("one sentence founds one chart, byte for byte, and the chart carries what it needs to be redrawn", () => {
  const sentence = "a cold archipelago of black pines, iron harbors, and a drowned kingdom";
  const draw = (): { svg: string; recipe: ReturnType<typeof defaultRecipe> } => {
    const f = founded(sentence);
    const recipe = defaultRecipe(f.seed, f.overrides);
    return { svg: renderMap(generateWorld(recipe), { style: "antique" }), recipe };
  };
  const first = draw();
  const second = draw();
  assert.equal(second.svg, first.svg);
  assert.equal(first.recipe.culture, "norden");
  assert.deepEqual(recipeFromSvg(first.svg)?.recipe, first.recipe);
  const unsteered = renderMap(generateWorld(defaultRecipe(first.recipe.seed)), { style: "antique" });
  assert.notEqual(unsteered, first.svg, "the words must have changed the world the bare number makes");
});
