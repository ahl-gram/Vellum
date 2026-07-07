import { test } from "node:test";
import assert from "node:assert/strict";
import { shouldTurn } from "../../docs/explorer/sheet-turn.js";

/**
 * #131 The style turn. The semantic heart of the sub is a pure decision: only a
 * STYLE change re-dresses the same world and TURNS the sheet; a new world (seed,
 * type, climate) SETTLES per #127, and reduced motion / the worker fallback /
 * scrub mode all fall back to today's instant swap. shouldTurn() is that decision,
 * kept DOM-free so it is unit-testable; runTurn() (the WAAPI choreography) is the
 * DOM side and is proven by the e2e end-states + CDP probe instead.
 */

// The canonical style turn: a style change, over a live chart, worker on, motion
// on, not scrubbing.
const base = { isTurn: true, reduceMotion: false, usesWorker: true, hasChart: true, chronicle: false };

test("a style change over a live chart turns the sheet", () => {
  assert.equal(shouldTurn(base), true);
});

test("a non-style draw (seed/type/climate/theme) settles, never turns", () => {
  assert.equal(shouldTurn({ ...base, isTurn: false }), false);
});

test("reduced motion falls back to an instant swap (no turn)", () => {
  assert.equal(shouldTurn({ ...base, reduceMotion: true }), false);
});

test("the worker fallback path swaps instantly (no turn)", () => {
  assert.equal(shouldTurn({ ...base, usesWorker: false }), false);
});

test("the very first draw has no chart to turn from (no turn)", () => {
  assert.equal(shouldTurn({ ...base, hasChart: false }), false);
});

test("scrub mode re-applies per its existing redraw rules, it does not turn", () => {
  assert.equal(shouldTurn({ ...base, chronicle: true }), false);
});

// #116 The Verso. When the sheet is already flipped to its back, a style change
// rebuilds the verso in place; it must NOT fire the #131 turn, because the turn and
// the flip both drive #sheet-inner's rotateY and would fight over one transform.
test("a style change while flipped to the verso does not turn (the flip owns the sheet)", () => {
  assert.equal(shouldTurn({ ...base, flipped: true }), false);
});
