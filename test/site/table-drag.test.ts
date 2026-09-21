import test from "node:test";
import assert from "node:assert/strict";
import { DRAG_SLOP_PX, GRIP_INSET_PX, beganDrag, grabbable, dropOutcome, ghostSeat, bandOf } from "../../src/site/explorer/table-drag.ts";

// The desktop drag's pure rules (Issue #523 Sub 5 of Issue #401): what tells a click from a drag, who may drag, where a release files, and where the carried sheet sits under the pointer.

const mouse = { pointerType: "mouse", button: 0, isPrimary: true };

test("TD1 a press and release with no movement is the click, and so is a jiggle under the slop", () => {
  const at = { x: 100, y: 100 };
  assert.equal(beganDrag(at, at), false, "no movement is no drag");
  assert.equal(beganDrag(at, { x: 100 + DRAG_SLOP_PX - 1, y: 100 }), false, "a move short of the slop is still the click");
});

test("TD2 the slop is a distance, not an axis: a straight move at the slop drags and so does a diagonal that only crosses it as a hypotenuse", () => {
  const at = { x: 100, y: 100 };
  assert.equal(beganDrag(at, { x: 100 + DRAG_SLOP_PX, y: 100 }), true, "exactly the slop begins a drag");
  assert.equal(beganDrag(at, { x: 105, y: 105 }), true, "5,5 is 7.07px, past a 6px slop on the diagonal though short of it on either axis");
  assert.equal(beganDrag(at, { x: 104, y: 104 }), false, "4,4 is 5.66px, short of it");
});

test("TD3 only a mouse's primary button grabs: touch and pen never drag (Issue #401 ruling 6), nor a secondary button, nor a non-primary pointer", () => {
  assert.equal(grabbable(mouse), true);
  assert.equal(grabbable({ ...mouse, pointerType: "touch" }), false, "a touch is a tap, never a drag");
  assert.equal(grabbable({ ...mouse, pointerType: "pen" }), false, "a pen is treated as touch");
  assert.equal(grabbable({ ...mouse, button: 2 }), false, "a right press is the context menu");
  assert.equal(grabbable({ ...mouse, isPrimary: false }), false, "a second pointer never carries");
});

test("TD4 a release inside the band files and one above it snaps, and the band's own top edge files", () => {
  const band = { top: 552 };
  assert.equal(dropOutcome({ x: 640, y: 700 }, band), "file");
  assert.equal(dropOutcome({ x: 640, y: 300 }, band), "snap");
  assert.equal(dropOutcome({ x: 640, y: 552 }, band), "file", "at the edge is in");
  assert.equal(dropOutcome({ x: 640, y: 551 }, band), "snap", "a pixel above it is out");
});

test("TD5 with no band a release anywhere snaps", () => {
  assert.equal(dropOutcome({ x: 640, y: 799 }, null), "snap");
  assert.equal(dropOutcome({ x: 0, y: 0 }, null), "snap");
});

test("TD6 the ghost hangs from its top-right corner, the corner the dog-ear is: the pointer sits GRIP_INSET_PX inside that corner", () => {
  const seat = ghostSeat({ x: 400, y: 300 }, 170);
  assert.equal(seat.x + 170 - GRIP_INSET_PX, 400, "the right edge is the pointer plus the inset");
  assert.equal(seat.y + GRIP_INSET_PX, 300, "the top edge is the pointer less the inset");
  assert.ok(seat.x + 170 > 400, "the pointer is INSIDE the sheet's edge, not beside it: a zero inset would hang the corner exactly on the pointer");
});

test("TD7 a drawer with no height is no band, never a band at 0: a shut drawer must not file on every release", () => {
  assert.equal(bandOf(0, 800), null);
  assert.equal(bandOf(NaN, 800), null, "an unresolved height is no band either");
  assert.deepEqual(bandOf(248, 800), { top: 552 }, "an open drawer's band is its layout seat from the foot of the viewport");
  assert.equal(bandOf(900, 800), null, "a band that would begin above the viewport is no band");
});
