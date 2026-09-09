import { test } from "node:test";
import assert from "node:assert/strict";
import { shouldTurn, type TurnDecision } from "../../src/site/explorer/sheet-turn.ts";

// shouldTurn() is the pure decision (only a STYLE change turns the sheet; a new world settles, reduced motion and the worker fallback swap instantly); runTurn() (WAAPI) is the e2e end-states' and the CDP probe's.

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

test("no armed state suppresses the turn any more (#153, resolved by #321)", () => {
  const stale = { ...base, chronicle: true } as unknown as TurnDecision;
  assert.equal(shouldTurn(stale), true);
});

// The turn and the flip both drive #sheet-inner's rotateY and would fight over one transform.
test("a style change while flipped to the verso does not turn (the flip owns the sheet)", () => {
  assert.equal(shouldTurn({ ...base, flipped: true }), false);
});
