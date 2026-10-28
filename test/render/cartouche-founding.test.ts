import { test } from "node:test";
import assert from "node:assert/strict";
import { FOUNDING_LINE_UNITS, foundingLines, widthUnits } from "../../src/render/layers/cartouche-founding.ts";

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
