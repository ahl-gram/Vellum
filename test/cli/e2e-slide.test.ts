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

// Every fixture below is a read measured through CDP on 2026-09-13 at 1280x800, seed 42, the CD7 hash, named with the moment it came from.
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

// The three below were produced in a real browser on 2026-09-13 by the one named perturbation each clause defends against, then measured.

// Produced with `.chart-drawer { animation: none !important }`, the drawer open.
const NO_ANIMATION = slide(584.59, 22.39, []);

test("a panel with a real box and NO animation is never rest, however still it looks", () => {
  // [].every() is vacuously TRUE, so without the length conjunct a panel that simply has no slide reads as arrived.
  assert.equal(slideRested(NO_ANIMATION, NO_ANIMATION), false);
  assert.ok(NO_ANIMATION.size > 0, "the fixture must clear the size clause, or it proves nothing about the animation one");
});

// Produced with a keyframe whose `to` is translateY(100%), so the slide finishes with the panel still parked.
const FINISHED_BELOW_FOLD = slide(832.59, 22.39, ["finished"]);

test("a slide that FINISHED with the panel still below the fold is not rest", () => {
  assert.equal(slideRested(FINISHED_BELOW_FOLD, FINISHED_BELOW_FOLD), false);
  assert.ok(FINISHED_BELOW_FOLD.anims.every((s) => s === "finished"), "the fixture must clear the animation clause, or it proves nothing about the viewport one");
});

// Produced by moving the drawer with `bottom: 40px !important` AFTER its slide had finished: both reads are all-finished, 40px apart.
const MOVED_WHILE_FINISHED_A = slide(584.59, 22.39, ["finished"]);
const MOVED_WHILE_FINISHED_B = slide(544.59, 22.39, ["finished"]);

test("a panel still travelling under something that is not an animation is not rest", () => {
  assert.equal(slideRested(MOVED_WHILE_FINISHED_B, MOVED_WHILE_FINISHED_A), false);
  assert.ok(Math.abs(MOVED_WHILE_FINISHED_B.pos - MOVED_WHILE_FINISHED_A.pos) > MOTION_STILL_PX, "the fixture pair must sit outside the tolerance it is pinning");
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

// The three below hard code their numbers rather than derive them from the constants: a fixture spelled `UNFOLDED.pos + MOTION_MOVED_PX` is green at 1 and at 100.

test("departure is measured at the bound itself: exactly MOTION_MOVED_PX has not left where it began", () => {
  const atTheBound = fold(UNFOLDED.pos + MOTION_MOVED_PX, ["finished"]);
  const justPast = fold(UNFOLDED.pos + MOTION_MOVED_PX + 0.01, ["finished"]);
  assert.equal(foldRested(atTheBound, atTheBound, UNFOLDED), false);
  assert.equal(foldRested(justPast, justPast, UNFOLDED), true);
});

test("the departure bound is about a PIXEL, so a two pixel travel has left where it began", () => {
  // 866 against the slip's measured 864. A bound loose enough to swallow this would let the fold's own start state pass.
  assert.equal(foldRested(fold(866, ["finished"]), fold(866, ["finished"]), UNFOLDED), true);
});

test("the stillness bound is about half a pixel, so a two pixel step is still travelling", () => {
  // Against the 0.01px of jitter two at-rest reads of the same panel actually show, measured 2026-09-13.
  assert.equal(slideRested(slide(586.59, 22.39, ["finished"]), slide(584.59, 22.39, ["finished"])), false);
});

test("the viewport bound excludes exactly the start pixel, which is where translateY(100%) parks the panel", () => {
  assert.equal(slideRested(slide(800, 22.39, ["finished"]), slide(800, 22.39, ["finished"])), false);
});
