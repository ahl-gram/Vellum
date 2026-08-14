import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { CULTURES } from "../../src/society/names.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import {
  segmentName,
  glossName,
  tongueName,
} from "../../src/society/philology.ts";

// #124: a re-parse of a settlement name against the grammar that made it. Pure, no rng, never
// imported by generate.ts, so it cannot move a world.

test("segmentName splits a suffixed oromi name at its onsets and lifts the town suffix", () => {
  // oromi has no empty onset, so lauku-we has exactly one syllabification: the consonants ARE the boundaries.
  const seg = segmentName("Laukuwelua", "oromi");
  assert.ok(seg, "Laukuwelua is grammatical oromi");
  assert.equal(seg.suffix, "lua");
  assert.equal(seg.repair, "");
  assert.deepEqual(
    seg.syllables.map((s) => [s.onset, s.nucleus, s.coda]),
    [["l", "au", ""], ["k", "u", ""], ["w", "e", ""]],
  );
  assert.deepEqual(seg.chunks.slice(), ["lau", "ku", "we", "lua"]);
});

test("segmentName repairs the elided consonant that a town suffix ate (norden)", () => {
  // names.ts:240 drops the base's last char when it equals suffix[0]. "Skarg" + "gard" ships as
  // "Skargard", and the bare remainder "skar" is UNPARSEABLE: "r" is not a norden coda.
  const seg = segmentName("Skargard", "norden");
  assert.ok(seg, "Skargard must recover through the repair, not fall through");
  assert.equal(seg.suffix, "gard");
  assert.equal(seg.repair, "g", "the g the suffix swallowed is put back to read the coda");
  assert.deepEqual(
    seg.syllables.map((s) => [s.onset, s.nucleus, s.coda]),
    [["sk", "a", "rg"]],
  );
  assert.deepEqual(seg.chunks.slice(), ["skar", "gard"], "the chunks spell the name as it SHIPS, worn g and all");
});

test("segmentName reads a veshari name whose vowel-initial suffix took the base's last letter", () => {
  const seg = segmentName("Zarabad", "veshari");
  assert.ok(seg, "Zarabad is grammatical veshari");
  assert.equal(seg.suffix, "abad");
  assert.deepEqual(
    seg.syllables.map((s) => [s.onset, s.nucleus, s.coda]),
    [["z", "a", "r"]],
  );
});

test("segmentName strips the overflow tails names.ts appends when it runs out of names", () => {
  // uniqueBase falls back to "Base II" (ROMAN, names.ts:254) then "Base 7" (names.ts:260).
  const plain = segmentName("Kawa", "oromi");
  assert.ok(plain, "Kawa is grammatical oromi");
  assert.deepEqual(segmentName("Kawa II", "oromi"), plain);
  assert.deepEqual(segmentName("Kawa VIII", "oromi"), plain);
  assert.deepEqual(segmentName("Kawa 7", "oromi"), plain);
});

test("segmentName returns null rather than throwing on a name the grammar cannot have made", () => {
  assert.equal(segmentName("Xyzzy", "oromi"), null);
  assert.equal(segmentName("", "oromi"), null);
  assert.equal(segmentName("Laukuwelua", "no-such-tongue"), null);
});

test("a town suffix is read whole, not spelled out as the consonants it happens to contain", () => {
  // thalassic "mar" is an onset, a coda AND a town suffix. Talamar reads either as tal-a + -mar
  // (one syllable, the suffix whole) or as tal-a-mar (two syllables, three bare consonants); a
  // parse ranked on consonants alone takes the second and the card loses "set upon the sea".
  const seg = segmentName("Talamar", "thalassic");
  assert.ok(seg, "Talamar is grammatical thalassic");
  assert.equal(seg.suffix, "mar");
  assert.equal(seg.syllables.length, 1);
});

test("glossName reads a name in the philologist's register: tongue, syllables, roots", () => {
  const g = glossName("Laukuwelua", "oromi");
  assert.ok(g, "Laukuwelua glosses");
  assert.equal(g.tongue, "Oromi");
  assert.equal(g.syllabified, "Lau·ku·we·lua");
  assert.deepEqual(
    g.roots.map((r) => r.root),
    ["l", "k", "w", "-lua"],
    "codas and town suffixes print with the philologists' leading hyphen",
  );
  assert.equal(g.roots[0].gloss, "leaf, green things");
  assert.equal(g.roots[3].gloss, "a sheltered mooring");
});

test("glossName never repeats a root, however often the name says it", () => {
  const g = glossName("Kakanui", "oromi");
  assert.ok(g, "Kakanui glosses");
  const roots = g.roots.map((r) => r.root);
  assert.deepEqual(roots.slice(), [...new Set(roots)], `a root is listed twice: ${roots.join(", ")}`);
});

test("glossName is pure: the same name reads the same way every time", () => {
  const a = glossName("Laukuwelua", "oromi");
  const b = glossName("Laukuwelua", "oromi");
  assert.deepEqual(a, b);
});

test("the world generator never reaches for the glass, so a lexicon edit cannot re-roll a world", () => {
  // #124 is render-only BY CONSTRUCTION: philology re-parses names the world already carries. An
  // import here would put 243 hand-written strings on the determinism path and re-pin the golden.
  const src = (p: string) => readFileSync(fileURLToPath(new URL(`../../${p}`, import.meta.url)), "utf8");
  for (const file of ["src/world/generate.ts", "src/society/names.ts"]) {
    assert.doesNotMatch(src(file), /philology/, `${file} imports the philologist's glass`);
  }
  assert.doesNotMatch(src("src/society/philology.ts"), /\brng\b|Math\.random/, "philology.ts reached for a source of randomness");
});

test("tongueName names each of the ten speeches from its culture id", () => {
  assert.equal(tongueName("oromi"), "Oromi");
  assert.equal(tongueName("thalassic"), "Thalassic");
  assert.equal(tongueName("tezcal"), "Tezcal");
});

// Sixty worlds cost about half a minute to generate, so the acceptance sweep builds the corpus
// once and every assertion below reads it.
const CORPUS = Array.from({ length: 60 }, (_, i) => {
  const world = generateWorld(defaultRecipe(i + 1));
  return { seed: i + 1, cultureId: world.culture.id, names: world.settlements.map((s) => s.name) };
});

test("every settlement name across seeds 1-60 derives: zero blanks, zero throws (#124 acceptance)", () => {
  let total = 0;
  const unread: string[] = [];
  for (const world of CORPUS) {
    for (const name of world.names) {
      total++;
      const g = glossName(name, world.cultureId);
      if (!g || g.roots.length === 0) unread.push(`${world.cultureId}:${name}`);
    }
  }
  assert.ok(total > 1000, `only ${total} names sampled; the sweep is not reaching the worlds`);
  assert.deepEqual(unread.slice(0, 12), [], `${unread.length} of ${total} names did not derive`);
});

test("the syllabification spells the name exactly, so a card never shows a word the chart does not", () => {
  for (const world of CORPUS) {
    for (const name of world.names) {
      const g = glossName(name, world.cultureId);
      assert.ok(g, `${world.cultureId}:${name} did not derive`);
      assert.equal(
        g.syllabified.replace(/·/g, "").toLowerCase(),
        name.replace(/ (?:[IVX]+|\d+)$/, "").toLowerCase(),
        `${world.cultureId}: "${g.syllabified}" does not spell "${name}"`,
      );
    }
  }
});

test("all ten tongues are exercised by a real world, not only by the lexicon's own coverage test", () => {
  const spoken = new Set(CORPUS.map((w) => w.cultureId));
  const missing = CULTURES.filter((c) => !spoken.has(c.id)).map((c) => c.id);
  assert.deepEqual(missing, [], `no world in seeds 1-60 speaks ${missing.join(", ")}`);
  for (const id of spoken) {
    const world = CORPUS.find((w) => w.cultureId === id)!;
    const glossed = world.names
      .map((n) => glossName(n, id))
      .filter((g) => g !== null && g.roots.length >= 2);
    assert.ok(
      glossed.length > 0,
      `seed ${world.seed} (${id}) produced no settlement name with more than one root`,
    );
  }
});
