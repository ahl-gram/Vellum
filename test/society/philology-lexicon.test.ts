import { test } from "node:test";
import assert from "node:assert/strict";
import { CULTURES } from "../../src/society/names.ts";
import { PHILOLOGY_LEXICON } from "../../src/society/philology-lexicon.ts";

// #124: the lexicon is the whole feature's data. A grammar edit that outruns it must fail HERE,
// loudly, rather than shipping a card that glosses half a name (#235 grew CULTURES from six to
// ten and left the approved six-tongue lexicon silently short).

const inventories = (id: string) => {
  const culture = CULTURES.find((c) => c.id === id)!;
  return {
    onsets: [...new Set(culture.onsets)].filter((s) => s !== ""),
    codas: [...new Set(culture.codas)].filter((s) => s !== ""),
    suffixes: [...new Set(culture.townSuffixes)].filter((s) => s !== ""),
  };
};

test("every culture in CULTURES has a tongue in the lexicon", () => {
  const missing = CULTURES.filter((c) => !PHILOLOGY_LEXICON[c.id]).map((c) => c.id);
  assert.deepEqual(missing, [], `these cultures speak an unglossed tongue: ${missing.join(", ")}`);
  assert.equal(Object.keys(PHILOLOGY_LEXICON).length, CULTURES.length);
});

test("every root in every CULTURES inventory has an entry (#124 acceptance)", () => {
  const holes: string[] = [];
  for (const culture of CULTURES) {
    const lex = PHILOLOGY_LEXICON[culture.id];
    if (!lex) continue;
    const inv = inventories(culture.id);
    for (const root of inv.onsets) if (!lex.onsets[root]) holes.push(`${culture.id} onset ${root}`);
    for (const root of inv.codas) if (!lex.codas[root]) holes.push(`${culture.id} coda -${root}`);
    for (const root of inv.suffixes) if (!lex.suffixes[root]) holes.push(`${culture.id} suffix -${root}`);
  }
  assert.deepEqual(holes, [], `${holes.length} roots would gloss blank`);
});

test("the lexicon glosses nothing the grammar cannot produce, so a typo cannot hide", () => {
  // A misspelled key passes the coverage test by leaving the real root uncovered somewhere else;
  // this is the half that names the typo instead.
  const strays: string[] = [];
  for (const culture of CULTURES) {
    const lex = PHILOLOGY_LEXICON[culture.id];
    if (!lex) continue;
    const inv = inventories(culture.id);
    for (const root of Object.keys(lex.onsets)) if (!inv.onsets.includes(root)) strays.push(`${culture.id} onset ${root}`);
    for (const root of Object.keys(lex.codas)) if (!inv.codas.includes(root)) strays.push(`${culture.id} coda -${root}`);
    for (const root of Object.keys(lex.suffixes)) if (!inv.suffixes.includes(root)) strays.push(`${culture.id} suffix -${root}`);
  }
  assert.deepEqual(strays, [], `${strays.length} entries gloss a root no culture can utter`);
});

test("the empty onset and the empty coda are never glossed: the vowel is only the song", () => {
  // tezcal and ordai admit a vowel-initial syllable, and four tongues list "" as a coda. Under the
  // approved doctrine those carry no sense, so an entry for one would print a gloss for nothing.
  for (const [id, lex] of Object.entries(PHILOLOGY_LEXICON)) {
    assert.equal(lex.onsets[""], undefined, `${id} glosses the empty onset`);
    assert.equal(lex.codas[""], undefined, `${id} glosses the empty coda`);
  }
});

test("no gloss is blank, and none carries an em-dash", () => {
  for (const [id, lex] of Object.entries(PHILOLOGY_LEXICON)) {
    for (const [kind, table] of [["onset", lex.onsets], ["coda", lex.codas], ["suffix", lex.suffixes]] as const) {
      for (const [root, gloss] of Object.entries(table)) {
        assert.ok(gloss.trim().length > 0, `${id} ${kind} ${root} glosses blank`);
        assert.ok(!gloss.includes("—"), `${id} ${kind} ${root} carries an em-dash`);
        assert.equal(gloss, gloss.trim(), `${id} ${kind} ${root} is padded`);
        assert.ok(!gloss.endsWith("."), `${id} ${kind} ${root} ends in a stop; the card punctuates the line`);
      }
    }
  }
});
