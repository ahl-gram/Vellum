import { test } from "node:test";
import assert from "node:assert/strict";
import {
  FOUNDING_LINE_UNITS,
  foundingLines,
  foundingNodes,
  widthUnits,
} from "../../src/render/layers/cartouche-founding.ts";
import { STYLES } from "../../src/render/style.ts";

const EPIC = "a cold archipelago of black pines, iron harbors, and a drowned kingdom";
const EPIC_LINES = ["a cold archipelago of black pines, iron harbors,", "and a drowned kingdom"];
const LONGEST =
  "a warm continent of ragged coasts where the old river kings raised their cities of salt and cedar beside the copper seas";
const CAPITALS = LONGEST.toUpperCase();
const ONEWORD =
  "cold " + "thalassocracyofthedrownedironharborsandblackpinesbeyondthefrozenreaches".repeat(2).slice(0, 115);
const CJK = "cold " + "寒い群島の黒い松と鉄の港と沈んだ王国の物語をここに記す".repeat(5).slice(0, 115);
const EMOJI = "a" + "\u{1F469}\u{200D}\u{1F467}".repeat(15);
const SHORT = "a drowned kingdom";

const OPEN = "\u{201C}";
const CLOSE = "\u{201D}";
const ZWJ = "\u{200D}";
const FLAG = "\u{1F1FA}\u{1F1F8}";
const THUMB = "\u{1F44D}\u{1F3FD}";
const SNOW = "\u{2744}\u{FE0F}";
const QTILDE = "Q\u{303}";
const TREE = "\u{1F332}";
const CHAIN = Array.from({ length: 40 }, () => TREE).join(ZWJ);
const TONED = "\u{1F469}\u{1F3FD}";
const KISS = "\u{1F468}\u{1F3FB}\u{200D}\u{2764}\u{FE0F}\u{200D}\u{1F48B}\u{200D}\u{1F468}\u{1F3FC}";
const ENGLAND = "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}";
const KEYCAP = "1\u{FE0F}\u{20E3}";

test("a wide character counts two width units, a mark or a joiner none, anything else one (Issue #392)", () => {
  assert.equal(widthUnits("abcd"), 4);
  assert.equal(widthUnits("寒い群島"), 8);
  assert.equal(widthUnits("e\u{301}"), 1);
  assert.equal(widthUnits("\u{1F469}\u{200D}\u{1F467}"), 4);
  assert.equal(widthUnits("\u{FF21}\u{FF22}"), 4);
  assert.equal(widthUnits(""), 0);
});

test("the epic's own sentence wraps, bare, to two lines, the first exactly a line wide (Issue #392)", () => {
  assert.deepEqual(foundingLines(EPIC), EPIC_LINES);
  assert.equal(widthUnits(EPIC_LINES[0] as string), FOUNDING_LINE_UNITS, "the first line sits on the bound");
});

test("every line holds at most a line's width, is as full as the next word allows, and the lines put back together are the sentence (Issue #392)", () => {
  const exact = new Set([EPIC, LONGEST, CAPITALS, SHORT]);
  for (const text of [EPIC, LONGEST, CAPITALS, ONEWORD, CJK, EMOJI, SHORT]) {
    const lines = foundingLines(text);
    assert.ok(lines.length > 0, `${text.slice(0, 20)} must wrap to something`);
    lines.forEach((line, i) => {
      assert.ok(
        widthUnits(line) <= FOUNDING_LINE_UNITS,
        `line ${i} of ${text.slice(0, 20)} is ${widthUnits(line)} units`,
      );
      const next = lines[i + 1];
      if (next === undefined) return;
      const head = widthUnits(next.split(" ")[0] as string);
      assert.ok(
        widthUnits(line) + 1 + head > FOUNDING_LINE_UNITS,
        `line ${i} of ${text.slice(0, 20)} leaves room for the next word`,
      );
    });
    assert.equal(lines.join(" ").replaceAll(" ", ""), text.replaceAll(" ", ""));
    if (exact.has(text)) assert.equal(lines.join(" "), text);
  }
});

test("a hard break never parts a joined emoji (Issue #392)", () => {
  const seq = "\u{1F469}\u{200D}\u{1F467}";
  const lines = foundingLines(EMOJI);
  assert.deepEqual(lines, ["a" + seq.repeat(11), seq.repeat(4)]);
  for (const line of lines) {
    assert.ok(!line.startsWith("\u{200D}"), "no line starts with a joiner");
    assert.ok(!line.endsWith("\u{200D}"), "no line ends with a joiner");
  }
});

const capitalOf = (sentence: string): [string, string] => {
  const [group] = foundingNodes(STYLES.antique, foundingLines(`${OPEN}${sentence}${CLOSE}`), 0, 0, 1);
  const line = group?.children[0];
  assert.ok(line !== undefined && typeof line !== "string", "the founding block has a first line");
  const [tspan, rest] = line.children;
  assert.ok(tspan !== undefined && typeof tspan !== "string" && tspan.tag === "tspan", "the line opens on a tspan");
  const [capital] = tspan.children;
  assert.ok(typeof capital === "string" && typeof rest === "string", "the capital and the rest are plain text");
  return [capital, rest];
};

test("the opening capital holds a whole character: a flag, a hand with its skin tone, a snowflake with its selector, a Q with its tilde, a tag flag and a keycap (Issue #1107)", () => {
  assert.deepEqual(capitalOf(`${FLAG} flag`), [OPEN + FLAG, ` flag${CLOSE}`]);
  assert.deepEqual(capitalOf(`${THUMB} thumbs`), [OPEN + THUMB, ` thumbs${CLOSE}`]);
  assert.deepEqual(capitalOf(`${SNOW} snow`), [OPEN + SNOW, ` snow${CLOSE}`]);
  assert.deepEqual(capitalOf(`${QTILDE}ueen rises`), [OPEN + QTILDE, `ueen rises${CLOSE}`]);
  assert.deepEqual(capitalOf(`${ENGLAND} rose`), [OPEN + ENGLAND, ` rose${CLOSE}`]);
  assert.deepEqual(capitalOf(`${KEYCAP} isle`), [OPEN + KEYCAP, ` isle${CLOSE}`]);
});

test("a hard break inside a word never parts a flag or a skin tone from its other half (Issue #1107)", () => {
  assert.deepEqual(foundingLines("x".repeat(47) + FLAG), ["x".repeat(47), FLAG]);
  assert.deepEqual(foundingLines("x".repeat(46) + THUMB), ["x".repeat(46), THUMB]);
});

test("a chain of 40 joined trees, the issue's 84 code points after a word, breaks after a joiner, each line within the width, and the lines put back together are the sentence (Issue #1107)", () => {
  const link = TREE + ZWJ;
  const text = `cold ${CHAIN}`;
  assert.equal(Array.from(text).length, 84, "the issue's own count");
  const engraved = `${OPEN}${CHAIN}${CLOSE}`;
  assert.deepEqual(foundingLines(text), ["cold", link.repeat(24), link.repeat(15) + TREE]);
  assert.deepEqual(foundingLines(engraved), [OPEN + link.repeat(23), link.repeat(16) + TREE + CLOSE]);
  for (const t of [text, engraved]) {
    const lines = foundingLines(t);
    for (const line of lines) assert.ok(widthUnits(line) <= FOUNDING_LINE_UNITS, `a line of ${widthUnits(line)} units`);
    assert.equal(lines.join(" ").replaceAll(" ", ""), t.replaceAll(" ", ""));
  }
});

test("a joined chain wider than a line keeps every skin tone with its emoji where it breaks (Issue #1107)", () => {
  const link = TONED + ZWJ;
  const lines = foundingLines(OPEN + link.repeat(16) + TONED);
  assert.deepEqual(lines, [OPEN + link.repeat(15), link + TONED]);
  for (const line of lines) assert.doesNotMatch(line, /^\p{Emoji_Modifier}/u, "no line opens on a skin tone");
});

test("a joined chain a line wide by itself leaves neither quotation mark alone on a line (Issue #1107)", () => {
  const filled = Array.from({ length: 24 }, () => TREE).join(ZWJ);
  assert.equal(widthUnits(filled), FOUNDING_LINE_UNITS, "the chain fills a line by itself");
  assert.deepEqual(foundingLines(OPEN + filled + CLOSE), [OPEN + (TREE + ZWJ).repeat(23), TREE + CLOSE]);
});

test("the opening capital holds the widest emoji Unicode names whole, and a wider joined chain lends it only its first emoji (Issue #1107)", () => {
  assert.equal(widthUnits(KISS), 10, "the kiss between two people with skin tones counts 10 units");
  assert.deepEqual(capitalOf(`${KISS} kiss`), [OPEN + KISS, ` kiss${CLOSE}`]);
  const grove = [TONED, TREE, TREE, TREE, TREE].join(ZWJ);
  assert.equal(widthUnits(grove), 11, "one unit wider than the kiss");
  assert.deepEqual(capitalOf(`${grove} grove`), [
    OPEN + TONED + ZWJ,
    [TREE, TREE, TREE, TREE].join(ZWJ) + ` grove${CLOSE}`,
  ]);
  assert.deepEqual(capitalOf(CHAIN), [OPEN + TREE + ZWJ, (TREE + ZWJ).repeat(22)]);
});

test("a mark the sentence opens with rides the opening quotation mark, and its first letter is still the capital (Issue #1107)", () => {
  assert.deepEqual(capitalOf("\u{303}a drowned kingdom"), [`${OPEN}\u{303}A`, ` drowned kingdom${CLOSE}`]);
});
