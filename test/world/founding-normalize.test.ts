import { test } from "node:test";
import assert from "node:assert/strict";
import { displayForm, foundingWords } from "../../src/world/founding/normalize.ts";
import { MAX_SENTENCE_CODE_POINTS } from "../../src/world/founding/lexicon.ts";

const shown = (input: string): string => {
  const d = displayForm(input);
  assert.ok(d.ok, `"${input}" should be accepted, was refused: ${d.ok ? "" : d.reason}`);
  return d.sentence;
};

const refusal = (input: string): string => {
  const d = displayForm(input);
  if (d.ok) assert.fail(`"${input}" should be refused, was accepted as "${d.sentence}"`);
  return d.reason;
};

test("the display form composes a decomposed accent", () => {
  assert.equal(shown("Ka\u0301lo"), "K\u00E1lo");
});

test("the display form collapses every run of whitespace to one space and trims the ends", () => {
  assert.equal(shown("  a  cold\tarchipelago\nof\u00A0 pines  "), "a cold archipelago of pines");
});

test("the display form drops direction controls and the byte-order mark, and reads a zero-width space as a space", () => {
  assert.equal(shown("\u202Ecold\u202C isle\uFEFF"), "cold isle");
  assert.equal(shown("\u200Fcold\u200E isle"), "cold isle");
  assert.equal(shown("cold\u200Bisle"), "cold isle");
});

test("the display form keeps a joiner, so an emoji sequence keeps its shape", () => {
  assert.equal(shown("\u{1F469}\u200D\u{1F680} island"), "\u{1F469}\u200D\u{1F680} island");
});

test("an empty line, a line of spaces, or a line of only invisible marks is refused as empty", () => {
  for (const input of ["", "   ", "\t\n", "\u200E\u202E\uFEFF"]) {
    assert.equal(refusal(input), "empty", JSON.stringify(input));
  }
});

test("the cap counts code points, not UTF-16 units", () => {
  assert.equal(shown("a".repeat(MAX_SENTENCE_CODE_POINTS)).length, MAX_SENTENCE_CODE_POINTS);
  assert.equal(refusal("a".repeat(MAX_SENTENCE_CODE_POINTS + 1)), "too-long");
  const astral = `${"a".repeat(MAX_SENTENCE_CODE_POINTS - 1)}\u{1F409}`;
  assert.equal(astral.length, MAX_SENTENCE_CODE_POINTS + 1, "the fixture must be longer in UTF-16 units than the cap");
  assert.equal(shown(astral), astral);
});

test("the cap is measured after the whitespace collapses", () => {
  const padded = `${"a".repeat(MAX_SENTENCE_CODE_POINTS - 2)}   b`;
  assert.equal(shown(padded), `${"a".repeat(MAX_SENTENCE_CODE_POINTS - 2)} b`);
});

test("a control character other than whitespace is refused", () => {
  for (const ch of ["\u0000", "\u0007", "\u001B", "\u007F", "\u0085"]) {
    assert.equal(refusal(`cold${ch}isle`), "control-character", JSON.stringify(ch));
  }
});

test("a character the platform does not know, or a lone surrogate, is refused", () => {
  assert.equal(refusal("cold \uFDD0 isle"), "unknown-character");
  assert.equal(refusal("cold \uFFFE isle"), "unknown-character");
  assert.equal(refusal("cold \uD800 isle"), "unknown-character");
  assert.equal(refusal("cold \uDC00 isle"), "unknown-character");
});

test("the words fold fullwidth letters to plain ones", () => {
  assert.deepEqual(foundingWords("\uFF23\uFF2F\uFF2C\uFF24 isle"), ["cold", "isle"]);
});

test("the words fold upper case", () => {
  assert.deepEqual(foundingWords("A COLD Isle"), ["a", "cold", "isle"]);
});

test("each word is lower-cased on its own, so Greek final sigma reads the same whatever separated the words", () => {
  assert.deepEqual(
    foundingWords("\u039F\u0394\u039F\u03A3.\u03A4\u0397\u03A3"),
    foundingWords("\u039F\u0394\u039F\u03A3 \u03A4\u0397\u03A3"),
  );
});

test("an apostrophe is dropped, curly or straight", () => {
  assert.deepEqual(foundingWords("o'er the sea"), ["oer", "the", "sea"]);
  assert.deepEqual(foundingWords("o\u2019er the sea"), ["oer", "the", "sea"]);
  assert.deepEqual(foundingWords("o\u02BCer the sea"), ["oer", "the", "sea"]);
});

test("a possessive 's is dropped, so the island's lighthouse stands on an island", () => {
  assert.deepEqual(foundingWords("the island\u2019s lighthouse"), ["the", "island", "lighthouse"]);
  assert.deepEqual(foundingWords("the ISLE'S tower"), ["the", "isle", "tower"]);
  assert.deepEqual(foundingWords("the kings' isle"), ["the", "kings", "isle"]);
});

test("a hyphen reads as a space", () => {
  assert.deepEqual(foundingWords("Sun-Drenched isle"), ["sun", "drenched", "isle"]);
});

test("a joiner inside a word is dropped from the words", () => {
  assert.deepEqual(foundingWords("co\u200Dld isle"), ["cold", "isle"]);
});

test("emoji and symbols are ignored like punctuation", () => {
  assert.deepEqual(foundingWords("\u{1F409} island \u2605"), ["island"]);
  assert.deepEqual(foundingWords("!!! ... ?"), []);
});

test("digits are words", () => {
  assert.deepEqual(foundingWords("the 7 seas"), ["the", "7", "seas"]);
});
