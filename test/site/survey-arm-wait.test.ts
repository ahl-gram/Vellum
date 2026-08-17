import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createSurveyArm, armOnLanding, wireSurveyToggle,
} from "../../src/site/explorer/survey-arm.ts";

// #373: the second wait. The #184 travel matrix moved to the render worker, so between the paint and the arm the slot holds for an off-thread order.
// What has to survive that wait is every #300/#366 rule in survey-arm.test.ts: the guards are re-read on the far side, never captured, because ~1s is long enough for the box, the world, or both to move.
// Split from that file rather than added to it: it was at 283 lines and this is a whole second mechanism.

/** A held-open frame: `afterPaint` queues, `paint()` releases everything queued so far. */
function paintQueue() {
  const queued: Array<() => void> = [];
  return {
    afterPaint: (run: () => void): void => { queued.push(run); },
    paint: (): void => { for (const run of queued.splice(0)) run(); },
  };
}

/** Primes whose promises the test releases. `settle()` resolves EVERY one outstanding, which is what lets two arms be caught waiting at once. */
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

function waitingHarness() {
  const q = paintQueue();
  const held = heldPrime();
  const state = { armed: false, worldGen: 0, builds: 0, landings: 0, clears: 0 };
  const arm = createSurveyArm({
    afterPaint: q.afterPaint,
    isArmed: () => state.armed,
    worldGen: () => state.worldGen,
    arm: () => { state.builds++; },
    prime: held.prime,
  });
  const land = (opts: { defer?: boolean } = {}) => armOnLanding({
    arm, armed: state.armed,
    rearm: () => { state.landings++; },
    clear: () => { state.clears++; },
    ...opts,
  });
  return { ...q, ...held, state, arm, land };
}

test("#373 the arm holds for the off-thread order: the painted frame builds nothing on its own", async () => {
  const h = waitingHarness();
  h.state.armed = true;
  h.arm.schedule();
  h.paint();

  assert.equal(h.calls(), 1, "the paint starts the off-thread work");
  assert.equal(h.state.builds, 0, "and nothing is built while it runs");
  h.settle();
  await h.flush();
  assert.equal(h.state.builds, 1, "the order lands, then the track is built");
});

test("#373 the box is still the truth on the FAR side of the wait", async () => {
  const h = waitingHarness();
  h.state.armed = true;
  h.arm.schedule();
  h.paint();
  h.state.armed = false; // ~1s is long enough to untick, and the guards ran before it
  h.settle();
  await h.flush();

  assert.equal(h.state.builds, 0, "an order that lands on an unticked box inks nothing");
});

test("#373 a draw that lands during the wait drops the arm", async () => {
  const h = waitingHarness();
  h.state.armed = true;
  h.arm.schedule();
  h.paint();
  h.state.worldGen++; // a fresh draw: its own settle owns the arm, against its own world
  h.settle();
  await h.flush();

  assert.equal(h.state.builds, 0, "the order is for a chart no longer on screen");
});

test("#373 a re-tick BEFORE the paint supersedes: the second arm is the only one that waits", async () => {
  const h = waitingHarness();
  h.state.armed = true;
  h.arm.schedule();
  h.arm.cancel();
  h.arm.schedule();
  h.paint();
  h.settle();
  await h.flush();

  assert.equal(h.calls(), 1, "the superseded arm dies on the near side and never asks for an order");
  assert.equal(h.state.builds, 1, "exactly one arm survives");
});

test("#373 a re-tick INSIDE the wait supersedes too: the generation is read on the far side", async () => {
  const h = waitingHarness();
  h.state.armed = true;
  h.arm.schedule();
  h.paint(); // arm A is now inside its wait, past every near-side guard
  h.arm.cancel();
  h.arm.schedule();
  h.paint(); // arm B joins it there
  h.settle(); // both orders land together
  await h.flush();

  // The case above cannot see this: it supersedes BEFORE the paint, so arm A dies near-side and the far-side generation compare is never exercised. Deleting `mine === gen` from the far side left the whole file green (guard-prover run, mutation M11).
  assert.equal(h.calls(), 2, "both arms really did reach the wait");
  assert.equal(h.state.builds, 1, "and only the newer one inks");
});

test("#373 an un-deferred landing never waits: it arms in the settle's own task", () => {
  const h = waitingHarness();
  h.state.armed = true;

  h.land({ defer: false });

  // Two reasons, one branch: a quiet mid-drag frame would let each throttled redraw drop the one before it, and a FLIPPED landing has to ink the back face inside the task that swaps the chart or the verso shows a bare new ghost first (e2e SV2o measured exactly that when this branch was made to wait).
  assert.equal(h.calls(), 0, "no order is asked for");
  assert.equal(h.state.landings, 1, "and the arm has already run");
});

test("#373 a prime that REJECTS still arms: the survey falls back to the inline order", async () => {
  const q = paintQueue();
  let builds = 0;
  const arm = createSurveyArm({
    afterPaint: q.afterPaint,
    isArmed: () => true,
    worldGen: () => 0,
    arm: () => { builds++; },
    prime: () => Promise.reject(new Error("the render worker crashed")),
  });

  arm.schedule();
  q.paint();
  await Promise.resolve().then(() => {}).then(() => {});

  // A one-sided .then here leaves the sheet permanently bare AND raises an unhandled rejection, and no other test in this file would notice either.
  assert.equal(builds, 1, "a dead source degrades to the inline computation, it does not cancel the survey");
});

test("#373 with no off-thread source at all, every arm is synchronous", () => {
  const q = paintQueue();
  let builds = 0;
  const arm = createSurveyArm({
    afterPaint: q.afterPaint,
    isArmed: () => true,
    worldGen: () => 0,
    arm: () => { builds++; },
  });

  arm.schedule();
  q.paint();

  assert.equal(builds, 1, "the Reading Room's shape, and every host without a worker");
});

function fakeBox() {
  let handler: (() => void) | null = null;
  const box = {
    checked: false,
    addEventListener: (type: string, fn: () => void): void => { if (type === "change") handler = fn; },
  };
  return { box, change: (to: boolean): void => { box.checked = to; if (handler) handler(); } };
}

test("#373 the tick's arm waits for the order the box's own wiring was handed", async () => {
  const q = paintQueue();
  const held = heldPrime();
  let armed = 0;
  const f = fakeBox();
  wireSurveyToggle({
    box: f.box as unknown as HTMLInputElement,
    worldGen: () => 0,
    home: () => {}, arm: () => { armed++; }, exit: () => {}, syncHash: () => {},
    prime: held.prime,
    afterPaint: q.afterPaint,
  });

  f.change(true);
  q.paint();
  // A prime dropped on the floor here reds nothing else: the tick would simply arm early, and the matrix would be back on the main thread.
  assert.equal(held.calls(), 1, "the box's wiring hands the slot its off-thread source");
  assert.equal(armed, 0, "so the tick's own arm waits too");
  held.settle();
  await held.flush();
  assert.equal(armed, 1);
});
