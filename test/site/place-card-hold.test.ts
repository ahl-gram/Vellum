import { test } from "node:test";
import assert from "node:assert/strict";
import { CLOSED, HOLD_GRACE_MS, nearestMark, nextHold, type Hold, type HoldInput } from "../../src/site/living-chart/place-card-hold.ts";

const run = (inputs: ReadonlyArray<HoldInput>, from: Hold = CLOSED): Hold => inputs.reduce(nextHold, from);
const A = 3, B = 7;
const enter = (idx: number, onCard = false): HoldInput => ({ kind: "enter", idx, onCard });
const leave = (idx: number, onCard = false): HoldInput => ({ kind: "leave", idx, onCard });
const move = (onCard: boolean): HoldInput => ({ kind: "move", onCard });
const expire = (onCard = false): HoldInput => ({ kind: "expire", onCard });
const press = (idx: number, detail = 1, onCard = false): HoldInput => ({ kind: "press", idx, detail, onCard });
const hoverA = [enter(A)];
const pinA = [enter(A), press(A)];

test("H1 leaving the shown town starts the grace, and only its expiry hides the card", () => {
  const left = run([...hoverA, leave(A)]);
  assert.deepEqual({ shown: left.shown, waiting: left.waiting }, { shown: A, waiting: true }, "the card is still up while the grace runs");
  assert.equal(run([expire()], left).shown, -1, "the expiry hides it");
  assert.equal(run([expire()], run([...hoverA, leave(A, true)])).shown, A, "an expiry with no grace running is a stale timer and changes nothing, even with the pointer off the town");
  assert.equal(run([enter(A)], left).waiting, false, "coming back to the town inside the grace cancels it");
  assert.equal(HOLD_GRACE_MS, 150, "the ruled 0.15s (Issue #750 ruling 5), which outlasts the widest measured gap crossed at 0.1 px/ms (91ms)");
});

test("H2 the pointer inside the card's outline holds it through any number of expiries, which is Issue #639's guard", () => {
  const covered = run([...hoverA, leave(A, true)]);
  assert.deepEqual({ shown: covered.shown, waiting: covered.waiting }, { shown: A, waiting: false }, "a leave that lands inside the outline starts no grace");
  const over = run([...hoverA, leave(A), move(true)]);
  assert.equal(over.waiting, false, "reaching the outline inside the grace cancels it");
  assert.equal(run([expire(true), expire(true)], { ...over, waiting: true }).shown, A, "an expiry read with the pointer inside the outline keeps the card");
  assert.equal(run([move(false)], over).waiting, true, "leaving the outline for open chart starts the grace again");
});

test("H3 another town entered inside the outline or the grace is ignored, and the expiry shows the town under the pointer", () => {
  const crossed = run([...hoverA, leave(A), enter(B)]);
  assert.equal(crossed.shown, A, "a town crossed inside the grace does not take the card");
  assert.equal(run([enter(B, true)], run([...hoverA, leave(A, true)])).shown, A, "nor does a town under the outline");
  assert.equal(run([expire()], crossed).shown, B, "the expiry shows the town the pointer rests on, rather than hiding");
  assert.equal(run([leave(B), expire()], crossed).shown, -1, "and hides when the pointer rests on no town");
  assert.equal(run([enter(B)], run(hoverA)).shown, B, "with no grace and the pointer off the card, a town shows at once");
});

test("H4 a pinned card ignores every hover (Issue #750 point 3)", () => {
  const pinned = run([...pinA, leave(A), enter(B), leave(B), enter(B), expire()]);
  assert.deepEqual({ shown: pinned.shown, pinned: pinned.pinned, waiting: pinned.waiting }, { shown: A, pinned: true, waiting: false });
});

test("H5 the second click of a double-click keeps the pinned card; a later click, or Enter, closes it", () => {
  const pinned = run(pinA);
  assert.equal(pinned.pinned, true, "the precondition: a press pins");
  assert.equal(run([press(A, 2)], pinned).pinned, true, "detail 2 is the second click of a double-click");
  assert.equal(run([press(A, 1)], pinned).shown, -1, "a later deliberate click closes it");
  assert.equal(run([press(A, 0)], pinned).shown, -1, "Enter on the pinned town closes it");
  assert.equal(run([press(B, 1)], pinned).shown, B, "a press on another town outside the card moves the pin");
});

test("H6 every dismissal clears the grace and the outline flag", () => {
  const busy: Hold = { shown: A, pinned: false, onCard: true, hovered: A, waiting: true };
  for (const input of [{ kind: "dismiss" }, { kind: "pressOpen", onCard: false }, { kind: "blur", idx: A, intoCard: false }, { kind: "focusOut", staysNear: false }] as const) {
    const after = nextHold(busy, input);
    assert.deepEqual({ shown: after.shown, pinned: after.pinned, waiting: after.waiting, onCard: after.onCard }, { shown: -1, pinned: false, waiting: false, onCard: false }, `${input.kind} closes cleanly`);
  }
});

test("H10 a town's blur closes only its own unpinned card, never a card another town's hover opened", () => {
  const hovered = run([enter(B)]);
  assert.equal(run([{ kind: "blur", idx: A, intoCard: false }], hovered).shown, B, "town A losing an old focus leaves town B's hovered card up");
  assert.equal(run([{ kind: "blur", idx: B, intoCard: false }], hovered).shown, -1, "town B's own blur closes it");
});

test("H7 keyboard focus on another town shows it, unpinned, even while one is pinned", () => {
  const after = run([{ kind: "focus", idx: B, fromPointer: false }], run(pinA));
  assert.deepEqual({ shown: after.shown, pinned: after.pinned }, { shown: B, pinned: false });
  assert.equal(run([{ kind: "focus", idx: A, fromPointer: false }], run(pinA)).pinned, true, "focus on the pinned town itself keeps the pin");
});

test("H8 focus a pointer gave a town changes nothing; the press decides", () => {
  const pinned = run(pinA);
  assert.deepEqual(run([{ kind: "focus", idx: B, fromPointer: true }], pinned), pinned);
  assert.equal(run([{ kind: "focus", idx: B, fromPointer: true }]).shown, -1, "and opens nothing on its own");
});

test("H9 a press inside the outline neither switches nor dismisses; outside on open chart it dismisses", () => {
  const pinned = run(pinA);
  assert.deepEqual(run([press(B, 1, true)], pinned), pinned, "a town under the card's text does not take the press");
  assert.deepEqual(run([{ kind: "pressOpen", onCard: true }], pinned), pinned, "open chart under the card's text does not close it");
  assert.equal(run([{ kind: "pressOpen", onCard: false }], pinned).shown, -1, "open chart clear of the card does");
  assert.equal(run([press(A, 1, true)], run(hoverA)).pinned, true, "the card's own town is always pressable, even under its outline");
});

test("N1 overlapping boxes resolve to the nearest centre, never to paint order (Issue #632)", () => {
  // Seed 4294967295 at 1024: Nykrask (5) lies inside Dradkrov's (13) box, and Dradkrov paints later.
  const box = (idx: number, x: number, y: number) => ({ idx, left: x - 13, top: y - 13, right: x + 13, bottom: y + 13 });
  const boxes = [box(5, 100, 100), box(13, 108, 104)];
  assert.equal(nearestMark({ x: 100, y: 100 }, boxes), 5, "Nykrask's own centre answers to Nykrask");
  assert.equal(nearestMark({ x: 108, y: 104 }, boxes), 13, "and Dradkrov's to Dradkrov");
  assert.equal(nearestMark({ x: 103, y: 101 }, [...boxes].reverse()), 5, "whatever the order the boxes are listed in");
  assert.equal(nearestMark({ x: 160, y: 160 }, boxes), -1, "a point in no box is no town");
});
