import assert from "node:assert/strict";
import { test } from "node:test";
import { GESTURE_BREAK_MS, createValve } from "../../src/site/home/valve.ts";

// The release valve (#472): the wheel's route between the camera and the page. The three
// ratified feel rulings (issue comment 2026-08-27) are the spec: the flick that reaches the
// limit is used up, one finger is the way down on touch (out of scope here), and coming back
// up the camera takes only a fresh gesture.

const zoomMoves = () => true;
const zoomClamped = () => false;

test("a mid-range wheel is the camera's: the zoom moves and the wheel is consumed", () => {
  const valve = createValve();
  assert.equal(valve(0, -120, 0, zoomMoves), true);
});

test("a wheel over the scrolled page never reaches the camera, in either direction", () => {
  const valve = createValve();
  let asked = 0;
  const spy = () => ((asked += 1), true);
  assert.equal(valve(0, 120, 44, spy), false);
  assert.equal(valve(50, -120, 44, spy), false);
  assert.equal(asked, 0);
});

test("the flick that reaches the outer clamp is used up: clamp-parked wheels in the same stream stay consumed", () => {
  const valve = createValve();
  assert.equal(valve(0, 120, 0, zoomMoves), true);
  assert.equal(valve(80, 120, 0, zoomClamped), true);
  assert.equal(valve(160, 120, 0, zoomClamped), true);
});

test("a fresh gesture at the outer clamp is released to the page", () => {
  const valve = createValve();
  assert.equal(valve(0, 120, 0, zoomClamped), false);
});

test("after the used-up flick, the break hands the next wheel-out to the page", () => {
  const valve = createValve();
  assert.equal(valve(0, 120, 0, zoomMoves), true);
  assert.equal(valve(80, 120, 0, zoomClamped), true);
  assert.equal(valve(80 + GESTURE_BREAK_MS, 120, 0, zoomClamped), false);
});

test("a wheel-in at the close-in clamp is released even mid-stream: nothing above to scroll to (e2e L1b)", () => {
  const valve = createValve();
  assert.equal(valve(0, -120, 0, zoomMoves), true);
  assert.equal(valve(80, -120, 0, zoomClamped), false);
});

test("the release at the outer clamp stays the page's for the rest of the stream, without a zoom attempt", () => {
  const valve = createValve();
  let asked = 0;
  const spy = () => ((asked += 1), false);
  assert.equal(valve(0, 120, 0, spy), false);
  assert.equal(asked, 1);
  assert.equal(valve(80, 120, 0, spy), false);
  assert.equal(asked, 1);
});

test("coming back up, the gesture that returns the page to top is used up: the camera takes only a fresh gesture", () => {
  const valve = createValve();
  let asked = 0;
  const spy = () => ((asked += 1), true);
  assert.equal(valve(0, -120, 200, spy), false);
  assert.equal(valve(80, -120, 0, spy), false);
  assert.equal(asked, 0);
  assert.equal(valve(80 + GESTURE_BREAK_MS, -120, 0, spy), true);
  assert.equal(asked, 1);
});

test("a gap of exactly the break is a fresh gesture", () => {
  const valve = createValve();
  assert.equal(valve(0, 120, 200, zoomMoves), false);
  assert.equal(valve(GESTURE_BREAK_MS, 120, 0, zoomMoves), true);
});

test("a gap one tick under the break is the same gesture: the boundary is pinned from below, not just above (guard-prover round 1: breakMs/2 escaped)", () => {
  const valve = createValve();
  assert.equal(valve(0, 120, 0, zoomMoves), true);
  assert.equal(valve(GESTURE_BREAK_MS - 1, 120, 0, zoomClamped), true);
});
