import { test } from "node:test";
import assert from "node:assert/strict";
import {
  slideRested,
  foldRested,
  MOTION_STILL_PX,
  MOTION_MOVED_PX,
  type MotionRead,
  type SlideRead,
} from "../../src/cli/e2e-slide.ts";

// Every fixture below is a read MEASURED through CDP on 2026-09-13 at 1280x800, seed 42, the CD7 hash, and named
// with the moment it was taken from, so no case here is a state the browser cannot produce (the trap #578's first
// plan walked into: a "finished" animation parked off screen cannot happen under animation-fill-mode: both).
const slide = (pos: number, size: number, anims: readonly string[]): SlideRead => ({ pos, size, anims, viewportH: 800 });

// The drawer SHUT: display:none, so every rect is zero and getAnimations() is empty.
const SHUT = slide(0, 0, []);
// The window CD7b failed in: the open class is on, the slide has not painted, the six remove buttons sit at 832.59 in an 800 viewport.
const PARKED = slide(832.59, 22.39, ["running"]);
// Mid-slide, two consecutive polls.
const MOVING_A = slide(611.05, 22.39, ["running"]);
const MOVING_B = slide(595.14, 22.39, ["running"]);
// At rest, two consecutive polls that differ by 0.01px of float jitter.
const RESTED_A = slide(584.59, 22.39, ["finished"]);
const RESTED_B = slide(584.6, 22.39, ["finished"]);

test("the shut drawer is not rest, so an empty animation list cannot wave the settle through", () => {
  // [].every() is TRUE and 0 is inside an 800 viewport, so without the size clause a pair of pre-open reads IS a rest.
  assert.equal(slideRested(SHUT, SHUT), false);
});

test("the parked drawer is not rest: this is the read CD7b failed on, and it is STILL between polls", () => {
  assert.equal(slideRested(PARKED, PARKED), false, "a stationary read below the fold must never satisfy the settle");
});

test("a slide still moving is not rest", () => {
  assert.equal(slideRested(MOVING_B, MOVING_A), false);
});

test("one read is never rest, however rested it looks", () => {
  assert.equal(slideRested(RESTED_A, null), false);
});

test("a mixed animation list is not rest", () => {
  assert.equal(slideRested(slide(584.6, 22.39, ["running", "finished"]), RESTED_B), false);
});

test("the rested drawer IS rest, jitter and all, so the clauses above cannot all be a bare false", () => {
  assert.equal(slideRested(RESTED_B, RESTED_A), true);
  assert.ok(Math.abs(RESTED_B.pos - RESTED_A.pos) <= MOTION_STILL_PX, "the fixture pair must sit inside the tolerance it is pinning");
});

const fold = (pos: number, anims: readonly string[]): MotionRead => ({ pos, size: 384, anims });

// The slip UNFOLDED, which is where every fold gesture in suite-chart-drawer.mjs starts.
const UNFOLDED = fold(864, ["finished"]);
// The instant after the gesture: the folded class is already on, the transition has not moved the panel.
const FOLD_T0 = fold(864, ["running", "running", "finished"]);
const FOLD_MID_A = fold(1071.25, ["running", "running", "finished"]);
const FOLD_MID_B = fold(1158.77, ["running", "running", "finished"]);
// Folded and at rest, 425.6px from where it began.
const FOLDED_A = fold(1289.24, ["running", "running", "finished"]);
const FOLDED_B = fold(1289.6, ["finished"]);

test("the fold has not left where it began at the instant of the gesture, though the class already says folded", () => {
  assert.equal(foldRested(FOLD_T0, FOLD_T0, UNFOLDED), false);
});

test("a panel that never moved is not rest, which is the whole point of carrying the pre-gesture read", () => {
  // Stillness at the start is indistinguishable from stillness at the end without this.
  assert.equal(foldRested(UNFOLDED, UNFOLDED, UNFOLDED), false);
  assert.ok(Math.abs(UNFOLDED.pos - UNFOLDED.pos) <= MOTION_MOVED_PX, "the fixture must sit inside the departure bound it is pinning");
});

test("a fold still travelling is not rest", () => {
  assert.equal(foldRested(FOLD_MID_B, FOLD_MID_A, UNFOLDED), false);
});

test("a fold that has arrived but whose transitions still run is not rest", () => {
  assert.equal(foldRested(FOLDED_A, FOLD_MID_B, UNFOLDED), false);
});

test("the folded panel at rest IS rest", () => {
  assert.equal(foldRested(FOLDED_B, FOLDED_A, UNFOLDED), true);
});

test("a collapsed panel is not rest, however finished and however far it has travelled", () => {
  assert.equal(foldRested({ pos: 1289.6, size: 0, anims: ["finished"] }, FOLDED_A, UNFOLDED), false);
});
