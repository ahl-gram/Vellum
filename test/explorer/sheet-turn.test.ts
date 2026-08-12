import { test } from "node:test";
import assert from "node:assert/strict";
import { shouldTurn, type TurnDecision } from "../../src/site/explorer/sheet-turn.ts";

/**
 * #131 The style turn. The semantic heart of the sub is a pure decision: only a
 * STYLE change re-dresses the same world and TURNS the sheet; a new world (seed,
 * type, climate) SETTLES per #127, and reduced motion / the worker fallback fall
 * back to today's instant swap. shouldTurn() is that decision, kept DOM-free so it
 * is unit-testable; runTurn() (the WAAPI choreography) is the DOM side and is
 * proven by the e2e end-states + CDP probe instead.
 *
 * #321 deleted the chronicle term: the Explorer's only armed state is the static
 * survey track, which carries no per-glyph mutations, so the style turn works
 * armed. That RESOLVES #153 (turn the sheet in scrub mode) by construction.
 */

// The canonical style turn: a style change, over a live chart, worker on, motion on.
const base = { isTurn: true, reduceMotion: false, usesWorker: true, hasChart: true };

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

// #321/#153: the chronicle term is DELETED, not merely defaulted. A stale caller
// still passing `chronicle: true` (no caller does; this is the mutation guard) must
// not re-suppress the turn: the Explorer has no armed state a turn cannot carry.
test("no armed state suppresses the turn any more (#153, resolved by #321)", () => {
  const stale = { ...base, chronicle: true } as unknown as TurnDecision;
  assert.equal(shouldTurn(stale), true);
});

// #116 The Verso. When the sheet is already flipped to its back, a style change
// rebuilds the verso in place; it must NOT fire the #131 turn, because the turn and
// the flip both drive #sheet-inner's rotateY and would fight over one transform.
test("a style change while flipped to the verso does not turn (the flip owns the sheet)", () => {
  assert.equal(shouldTurn({ ...base, flipped: true }), false);
});
