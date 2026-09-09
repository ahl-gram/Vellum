import { test } from "node:test";
import assert from "node:assert/strict";
import { CULTURES } from "../../src/society/names.ts";
import { PHILOLOGY_LEXICON } from "../../src/society/philology-lexicon.ts";

// A grammar edit that outruns the lexicon must fail here, not ship a half-glossed card.

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
  // tezcal and ordai admit a vowel-initial syllable and four tongues list "" as a coda; under the doctrine those carry no sense.
  for (const [id, lex] of Object.entries(PHILOLOGY_LEXICON)) {
    assert.equal(lex.onsets[""], undefined, `${id} glosses the empty onset`);
    assert.equal(lex.codas[""], undefined, `${id} glosses the empty coda`);
  }
});

test("the three scholars' footnotes #124 asks for are still in the lexicon", () => {
  // The only deviations from the 140 entries locked on #124: the footnotes the issue describes in prose but did not table.
  assert.match(PHILOLOGY_LEXICON.thalassic!.onsets.vel!, /^sail, fine cloth,.*vellum/);
  assert.match(PHILOLOGY_LEXICON.thalassic!.suffixes.mere!, /^a still water,.*sylvan/);
  assert.match(PHILOLOGY_LEXICON.sylvan!.suffixes.mere!, /^a still pool,.*thalassic/);
  assert.match(PHILOLOGY_LEXICON.draket!.codas.mar!, /^boundary, march,.*thalassic sea/);
});

test("a gloss cannot grow until the card it prints on becomes a column", () => {
  // The card is a 16rem sheet, so a gloss's length is the card's height; measured after trimming: median 85, p90 123, max 167.
  for (const [id, lex] of Object.entries(PHILOLOGY_LEXICON)) {
    for (const [kind, table] of [["onset", lex.onsets], ["coda", lex.codas], ["suffix", lex.suffixes]] as const) {
      for (const [root, gloss] of Object.entries(table)) {
        assert.ok(gloss.length <= 72, `${id} ${kind} ${root} is ${gloss.length} chars: "${gloss}"`);
      }
    }
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
