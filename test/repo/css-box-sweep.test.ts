import { test } from "node:test";
import assert from "node:assert/strict";
import { fullWidthWideningRules } from "../../test-support/css-box-sweep.ts";

const selectors = (css: string): string[] => fullWidthWideningRules(css).map((r) => r.selector);

// The sweep's own fixtures: its two consumers each hold exactly one rule of this shape, so every arm below is exercised by nothing else in the tree and a narrowing of WIDENS would go unnoticed there (pr-skeptic, 2026-09-11).
test("#565 the sweep selects the shorthand and the longhand spellings of a horizontal widener, since border-style alone widens a box", () => {
  assert.deepEqual(selectors(`.a { width: 100%; border: 1px solid red; }`), [".a"]);
  assert.deepEqual(selectors(`.b { width: 100%; border-style: solid; border-width: 2px; }`), [".b"]);
  assert.deepEqual(selectors(`.c { width: 100%; border-right-width: 2px; }`), [".c"]);
  assert.deepEqual(selectors(`.d { width: 100%; border-inline-start: 2px solid red; }`), [".d"]);
  assert.deepEqual(selectors(`.e { width: 100%; padding-left: 1rem; }`), [".e"]);
  assert.deepEqual(selectors(`.f { width: 50%; padding-inline: 1rem; }`), [".f"]);
});

test("#565 the sweep passes over what cannot reach a page's right edge: a vertical border, a zeroed one, a width that is not a percentage", () => {
  assert.deepEqual(selectors(`.a { width: 100%; border-top: 2px solid red; }`), []);
  assert.deepEqual(selectors(`.b { width: 100%; border: 0; }`), []);
  assert.deepEqual(selectors(`.c { width: 100%; border-style: none; }`), []);
  assert.deepEqual(selectors(`.d { width: 100%; padding-left: 0; }`), []);
  assert.deepEqual(selectors(`.e { width: 900px; border: 1px solid red; }`), []);
  assert.deepEqual(selectors(`.f { width: 100%; border-collapse: collapse; }`), []);
  assert.deepEqual(selectors(`.g { width: 100%; border-radius: 4px; }`), []);
});

test("#565 a comment between the width and the widener does not hide the widener, the miss the pr-skeptic found", () => {
  assert.deepEqual(selectors(`.a { width: 100%; /* the house hairline */ border: 1px solid red; }`), [".a"]);
  assert.deepEqual(selectors(`/* .b { width: 100%; border: 1px solid red; } */ .c { color: red; }`), []);
});

test("#565 the sweep reads one rule at a time, so a widener declared in a sibling rule is a false positive and never a silent miss", () => {
  assert.deepEqual(selectors(`.a { box-sizing: border-box; }\n.a { width: 100%; border: 1px solid red; }`), [".a"]);
});
