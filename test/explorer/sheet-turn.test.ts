import { test } from "node:test";
import assert from "node:assert/strict";
import { shouldTurn, type TurnDecision } from "../../src/site/explorer/sheet-turn.ts";

// #131 The style turn: only a STYLE change re-dresses the same world and TURNS the sheet; a new world SETTLES per #127, and reduced motion / the worker fallback swap instantly. shouldTurn() is the pure decision; runTurn() (WAAPI) is proven by the e2e end-states + CDP probe.
// #321 deleted the chronicle term: the Explorer's only armed state is the static survey track, which carries no per-glyph mutations, so the style turn works armed, resolving #153 by construction.

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

// #321/#153: the chronicle term is DELETED, not merely defaulted; a stale caller still passing chronicle: true (none does; this is the mutation guard) must not re-suppress the turn.
test("no armed state suppresses the turn any more (#153, resolved by #321)", () => {
  const stale = { ...base, chronicle: true } as unknown as TurnDecision;
  assert.equal(shouldTurn(stale), true);
});

// #116 The Verso: a style change while flipped rebuilds the verso in place; it must NOT fire the #131 turn, because the turn and the flip both drive #sheet-inner's rotateY and would fight over one transform.
test("a style change while flipped to the verso does not turn (the flip owns the sheet)", () => {
  assert.equal(shouldTurn({ ...base, flipped: true }), false);
});
