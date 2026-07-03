import { test } from "node:test";
import assert from "node:assert/strict";
import { washesConfusable, washConflictMatrix } from "../../src/render/cvd.ts";

const ANTIQUE_PAPER = "#f2e8cf";
const TOPO_PAPER = "#f7f4ee";

test("frozen antique slate & mauve collapse under CVD as 0.11 washes", () => {
  // Distinct-ish in normal vision, but a deuteranope cannot tell them apart -
  // this is exactly why the assignment must be CVD-aware, not just spatial.
  assert.ok(
    washesConfusable("#7a8aa6", "#a97ba6", ANTIQUE_PAPER, 0.11),
    "slate vs mauve should register as confusable",
  );
});

test("topographic turquoise & magenta collapse under deuteranopia", () => {
  // Wildly different in normal vision (dE ~21), a deut twin (dE ~1.4).
  assert.ok(washesConfusable("#1abc9c", "#e84393", TOPO_PAPER, 0.16));
});

test("the two new antique tints are not confusable with each other", () => {
  // teal vs deep-olive: distinct in normal, deut and prot (all dE > 2.5).
  assert.ok(!washesConfusable("#5f9e91", "#5f6b2e", ANTIQUE_PAPER, 0.11));
});

test("red-green tints collapse under CVD even when distinct normally", () => {
  // Terracotta (red) and sage (green) read clearly apart in normal vision, but
  // a deuteranope loses the difference - the assignment must keep them apart.
  assert.ok(washesConfusable("#c46d5e", "#7d9a6a", ANTIQUE_PAPER, 0.11));
});

test("washConflictMatrix is symmetric with a false diagonal", () => {
  const palette = ["#c46d5e", "#7d9a6a", "#bf9b4f", "#7a8aa6", "#a97ba6", "#5f9e91", "#5f6b2e"];
  const m = washConflictMatrix(palette, ANTIQUE_PAPER, 0.11);
  assert.equal(m.length, palette.length);
  for (let i = 0; i < palette.length; i++) {
    assert.equal(m[i]![i], false, `diagonal ${i} must be false`);
    for (let j = 0; j < palette.length; j++) {
      assert.equal(m[i]![j], m[j]![i], `not symmetric at ${i},${j}`);
    }
  }
  // slate (idx 3) and mauve (idx 4) are the known confusable frozen pair.
  assert.equal(m[3]![4], true, "slate/mauve should be flagged confusable");
});
