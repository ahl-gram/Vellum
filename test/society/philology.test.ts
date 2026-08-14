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
  // The lexicon lookup is a separate early return from the parse, and it is the one an
  // eleventh culture would hit first; a throw there escapes every card-level fixture.
  assert.equal(glossName("Laukuwelua", "no-such-tongue"), null);
});

test("the repair is a LAST resort: two readings that tie are decided for the letters actually there", () => {
  // ordai "Deingan" reads as dein + -gan, or as deing + -gan once the g the suffix ate is put
  // back. Both are one syllable and two roots, so only the no-repair preference separates them,
  // and it decides which coda the card prints: -n "of that people" or -ng "the sound of it".
  const seg = segmentName("Deingan", "ordai");
  assert.ok(seg, "Deingan is grammatical ordai");
  assert.equal(seg.repair, "");
  assert.deepEqual(seg.syllables.map((s) => s.coda), ["n"]);
});

test("a vowel-initial suffix never leaves a bare consonant standing as a syllable", () => {
  // The repair letter is truncated back off for display, and when the suffix is vowel-initial
  // that can strand a vowel-less fragment. Both tongues that take a vowel-initial suffix:
  assert.deepEqual(segmentName("Trudvitsa", "zoryan")?.chunks.slice(), ["trudv", "itsa"]);
  assert.deepEqual(segmentName("Zaakhir", "veshari")?.chunks.slice(), ["zaakh", "ir"]);
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

// One real name per tongue, pinned after measuring: the canonical reading is a RANKING (suffix
// first, then roots, then fewest syllables, then no repair, then leftmost-longest), and each key
// is invisible in a test that only asserts "it parsed". A shift in any of them moves a row here.
const CANONICAL: ReadonlyArray<readonly [string, string, string]> = [
  ["Talanaihaven", "thalassic", "tala|nai|haven"],
  ["Keghjend", "norden", "keg|hjend"],
  ["Faraqash", "veshari", "fara|qash"],
  ["Aeleiwenbrook", "sylvan", "aelei|wen|brook"],
  ["Maiyohai", "tsuren", "mai|yo|hai"],
  ["Thyargdrekeep", "draket", "thyarg|dre|keep"],
  ["Laukuwelua", "oromi", "lau|ku|we|lua"],
  ["Vunsvyov", "zoryan", "vun|svy|ov"],
  ["Tluachican", "tezcal", "tlua|chi|can"],
  ["Lekebulak", "ordai", "le|ke|bulak"],
  // The four above were blind to the leftmost-longest key: every one of them reads the same way
  // when it is inverted, while 39 corpus names change. These four are the ones that move, and
  // they are the tongues that admit a vowel-initial syllable, where the key has something to do.
  ["Soshen", "ordai", "sosh|en"],
  ["Khilol", "ordai", "khil|ol"],
  ["Elaela", "sylvan", "elae|la"],
  ["Chania", "tezcal", "chan|ia"],
];

test("the canonical reading of a name in each of the ten tongues holds", () => {
  for (const [name, cultureId, chunks] of CANONICAL) {
    const seg = segmentName(name, cultureId);
    assert.ok(seg, `${cultureId} lost the reading of ${name}`);
    assert.equal(seg.chunks.join("|"), chunks, `${cultureId} ${name}`);
  }
});

test("no chunk of a name is left without a vowel to sing it", () => {
  for (const world of CORPUS) {
    for (const name of world.names) {
      const seg = segmentName(name, world.cultureId);
      assert.ok(seg, `${world.cultureId}:${name} did not parse`);
      // The town suffix keeps its own spelling (zoryan's -sk is a whole word); the base does not.
      const base = seg.suffix ? seg.chunks.slice(0, -1) : seg.chunks;
      for (const chunk of base) {
        assert.match(chunk, /[aeiouy]/, `${world.cultureId} "${name}" reads as ${seg.chunks.join("·")}`);
      }
    }
  }
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
