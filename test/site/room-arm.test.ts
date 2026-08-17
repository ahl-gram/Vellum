import { test } from "node:test";
import assert from "node:assert/strict";
import { createRoomArm } from "../../src/site/reading-room/arm.ts";

// #418: the slot's contract, whose why lives at the head of src/site/reading-room/arm.ts.

/** A held-open frame: `afterPaint` queues, `paint()` releases everything queued so far. */
function paintQueue() {
  const queued: Array<() => void> = [];
  return {
    afterPaint: (run: () => void): void => { queued.push(run); },
    paint: (): void => { for (const run of queued.splice(0)) run(); },
  };
}

/** Primes whose promises the test releases, so an arm can be caught waiting. */
function heldPrime() {
  const waiting: Array<() => void> = [];
  let calls = 0;
  return {
    calls: () => calls,
    prime: (): Promise<void> => {
      calls++;
      return new Promise<void>((resolve) => { waiting.push(resolve); });
    },
    settle: (): void => { for (const r of waiting.splice(0)) r(); },
    flush: (): Promise<void> => Promise.resolve().then(() => {}).then(() => {}),
  };
}

function harness() {
  const q = paintQueue();
  const held = heldPrime();
  const state = { worldGen: 0, arms: 0 };
  const arm = createRoomArm({ afterPaint: q.afterPaint, worldGen: () => state.worldGen });
  const schedule = () => arm.schedule({ prime: held.prime, arm: () => { state.arms++; } });
  return { ...q, ...held, state, arm, schedule };
}

test("#418 the arm holds for the off-thread order: the settle's own frame builds nothing", async () => {
  const h = harness();
  h.schedule();
  h.paint();

  assert.equal(h.calls(), 1, "the painted frame starts the off-thread work");
  assert.equal(h.state.arms, 0, "and the instrument stays unarmed while it runs");
  h.settle();
  await h.flush();
  assert.equal(h.state.arms, 1, "the order lands, then the room arms once");
});

test("#418 the arm is deferred past the settle's paint, so the ink ceremony gets its frame", () => {
  const h = harness();
  h.schedule();

  // A cached world's prime resolves immediately, so without this the whole ~130ms arm lands back inside the settle's task and re-blocks the #127 inkDraw the deferral exists to protect.
  assert.equal(h.calls(), 0, "nothing is asked for until the chart has painted");
  assert.equal(h.state.arms, 0);
});

test("#418 a draw that lands INSIDE the wait drops the arm", async () => {
  const h = harness();
  h.schedule();
  h.paint();
  h.state.worldGen++; // a counter read: its own settle owns the arm, against its own world
  h.settle();
  await h.flush();

  assert.equal(h.state.arms, 0, "the order is for a chart no longer on screen");
});

test("#418 a draw that lands BEFORE the paint drops the arm on the near side", async () => {
  const h = harness();
  h.schedule();
  h.state.worldGen++;
  h.paint();
  h.settle();
  await h.flush();

  assert.equal(h.calls(), 0, "a superseded arm never even asks for an order");
  assert.equal(h.state.arms, 0);
});

test("#418 two draws in flight: only the newer one arms", async () => {
  const h = harness();
  h.schedule();
  h.paint(); // arm A is inside its wait, past every near-side guard
  h.state.worldGen++;
  h.schedule();
  h.paint(); // arm B joins it there
  h.settle(); // both orders land together
  await h.flush();

  assert.equal(h.calls(), 2, "both arms really did reach the wait");
  assert.equal(h.state.arms, 1, "and only the one whose world is on screen inks");
});

test("#418 a prime that REJECTS still arms: the room falls back to the inline order", async () => {
  const q = paintQueue();
  let arms = 0;
  const arm = createRoomArm({ afterPaint: q.afterPaint, worldGen: () => 0 });

  arm.schedule({
    prime: () => Promise.reject(new Error("the render worker crashed")),
    arm: () => { arms++; },
  });
  q.paint();
  await Promise.resolve().then(() => {}).then(() => {});

  // A one-sided .then leaves the room bare for good AND raises an unhandled rejection; #371 is the same failure class.
  assert.equal(arms, 1, "a dead source degrades to the inline computation, it does not cancel the room");
});
