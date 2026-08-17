import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createSurveyArm, afterNextPaint, armOnLanding, wireSurveyToggle, deferLandingArm,
} from "../../src/site/explorer/survey-arm.ts";

// #300: the survey tick's session build (measured 895-1207ms) ran inside the change handler, blocking the tick's paint; the fix yields a frame first, and this scheduler owns the window that opens.
// DOM-free on purpose: the yield is an injected afterPaint; the live browser yield is proven by e2e suite-survey SV2/SV2c/SV2d.

/** A held-open frame: `afterPaint` queues, `paint()` releases everything queued so far. */
function paintQueue() {
  const queued: Array<() => void> = [];
  return {
    afterPaint: (run: () => void): void => { queued.push(run); },
    paint: (): void => { for (const run of queued.splice(0)) run(); },
  };
}

function harness() {
  const q = paintQueue();
  // builds = the tick's arm, landings = a settle or turn arm (#366), clears = the unticked teardown: counted apart so a test can say WHICH ran.
  const state = { armed: false, worldGen: 0, builds: 0, landings: 0, clears: 0 };
  const arm = createSurveyArm({
    afterPaint: q.afterPaint,
    isArmed: () => state.armed,
    worldGen: () => state.worldGen,
    arm: () => { state.builds++; },
  });
  const land = (opts: { defer?: boolean } = {}) => armOnLanding({
    arm, armed: state.armed,
    rearm: () => { state.landings++; },
    clear: () => { state.clears++; },
    ...opts,
  });
  return { ...q, state, arm, land };
}

test("#300 the arm is deferred past the paint: the click's turn builds nothing", () => {
  const h = harness();
  h.state.armed = true;
  h.arm.schedule();
  assert.equal(h.state.builds, 0, "no build in the click's own turn");
  h.paint();
  assert.equal(h.state.builds, 1, "the build runs once the frame has painted");
});

test("#300 cancel() alone drops the pending arm, with the box left ticked", () => {
  const h = harness();
  h.state.armed = true;
  h.arm.schedule();
  h.arm.cancel(); // the untick branch of the same change handler
  // The box is deliberately NOT unticked: asserting both let a gutted cancel() pass on isArmed alone (the #140 shape, found by the guard-prover). One mechanism per test.
  h.paint();
  assert.equal(h.state.builds, 0, "a cancelled arm never builds");
});

test("#300 a re-tick supersedes the pending arm: one build, not two", () => {
  const h = harness();
  h.state.armed = true;
  h.arm.schedule();
  h.state.armed = false;
  h.arm.cancel();
  h.state.armed = true;
  h.arm.schedule();
  h.paint();
  // Since #364 the builder drops the overlay it finds, so what this pins is the arm's own supersede rule, not DOM stacking.
  assert.equal(h.state.builds, 1, "exactly one build survives tick/untick/tick");
});

test("#300 a draw that landed in the window owns the arm: the stale schedule builds nothing", () => {
  const h = harness();
  h.state.armed = true;
  h.arm.schedule();
  h.state.worldGen++; // a draw started: its settle re-arms the track against the new chart
  h.paint();
  assert.equal(h.state.builds, 0, "the superseded world never builds from the old tick");
});

test("#300 the box is the truth at fire time, not at schedule time", () => {
  const h = harness();
  h.state.armed = true;
  h.arm.schedule();
  h.state.armed = false; // unticked by a path that did not route through cancel()
  h.paint();
  assert.equal(h.state.builds, 0, "an unticked box builds nothing even with the generations agreeing");
});

test("#300 back-to-back schedules supersede: one build, not two", () => {
  const h = harness();
  h.state.armed = true;
  h.arm.schedule();
  h.arm.schedule();
  h.paint();
  // Not reachable from today's single call site: pinned so a second caller does not inherit a double build silently.
  assert.equal(h.state.builds, 1, "schedule() supersedes the arm pending before it");
});

test("#300 cancel() with no arm pending is a no-op, and does not poison the next one", () => {
  const h = harness();
  h.arm.cancel();
  h.state.armed = true;
  h.arm.schedule();
  h.paint();
  assert.equal(h.state.builds, 1, "a later arm still runs after a bare cancel");
});

// #366: the same beat on the other two arm paths (1245ms settle-to-frame before, ~105ms after; tables on #366 and its PR).
// A landing schedules through the SAME single slot the tick uses: two live arms are two ~1.1s session builds of one world.

test("#366 a landing's arm waits for the paint too: the settle's own task builds nothing", () => {
  const h = harness();
  h.state.armed = true;
  h.land();
  assert.equal(h.state.landings, 0, "no build in the settle's own task: the new chart must paint first");
  h.paint();
  assert.equal(h.state.landings, 1, "the arm runs once the frame has painted");
});

test("#366 an unticked box at the landing clears instead of arming", () => {
  const h = harness();
  h.state.armed = false;
  h.land();
  h.paint();
  assert.equal(h.state.landings, 0, "an unticked box is never armed");
  assert.equal(h.state.clears, 1, "the unticked branch tears the old session down instead");
});

test("#366 a landing supersedes a tick still waiting on its frame: exactly one arm survives", () => {
  const h = harness();
  h.state.armed = true;
  h.arm.schedule(); // a tick made while this draw was already in flight, holding the OLD world
  h.land();
  h.paint();
  assert.equal(h.state.builds, 0, "the tick's arm never fires: this landing owns the arm");
  assert.equal(h.state.landings, 1, "and the landing's own arm is the one that runs");
});

test("#366 the box is still the truth at fire time for a landing's arm", () => {
  const h = harness();
  h.state.armed = true;
  h.land();
  h.state.armed = false; // unticked inside the beat
  h.paint();
  assert.equal(h.state.landings, 0, "an arm scheduled by the settle answers to the box, like the tick's");
});

test("#366 a draw that starts inside the landing's beat drops it", () => {
  const h = harness();
  h.state.armed = true;
  h.land();
  h.state.worldGen++; // a fresh Draw: its own settle will arm the chart that lands
  h.paint();
  assert.equal(h.state.landings, 0, "the superseded world never arms from the outgoing landing");
});

test("#366 a quiet mid-drag landing arms INLINE: the track follows the coastline live", () => {
  const h = harness();
  h.state.armed = true;
  h.arm.schedule(); // a pending tick the landing must still supersede
  h.land({ defer: false });
  // A quiet settle skips the #184 matrix (23-36ms), and deferring would let each throttled redraw drop the one before it: the track would lag the coastline.
  assert.equal(h.state.landings, 1, "the quiet arm runs in the settle's own task");
  h.paint();
  assert.equal(h.state.builds, 0, "the pending tick is dropped all the same: one landing, one arm");
  assert.equal(h.state.landings, 1, "and the quiet arm does not run twice");
});

// #373: the second wait. The #184 travel matrix moved to the render worker, so between the paint and the arm the slot holds for an off-thread order.
// What has to survive that wait is every #300/#366 rule above: the guards are re-read on the far side, never captured, because ~1s is long enough for the box, the world, or both to move.

/** A prime whose promise the test releases: `settle()` resolves it, and awaiting `flush()` drains the microtask the arm queues behind it. */
function heldPrime() {
  let release: (() => void) | null = null;
  let calls = 0;
  return {
    calls: () => calls,
    prime: (): Promise<void> => {
      calls++;
      return new Promise<void>((resolve) => { release = resolve; });
    },
    settle: (): void => { const r = release; release = null; if (r) r(); },
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
  const land = (opts: { defer?: boolean; quiet?: boolean } = {}) => armOnLanding({
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

test("#373 a re-tick during the wait supersedes it: one build, not two", async () => {
  const h = waitingHarness();
  h.state.armed = true;
  h.arm.schedule();
  h.paint();
  h.arm.cancel();
  h.arm.schedule();
  h.paint();
  h.settle();
  await h.flush();

  assert.equal(h.state.builds, 1, "exactly one arm survives a tick made inside the wait");
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
  const h = harness(); // no prime dep: the Reading Room's shape, and every host without a worker
  h.state.armed = true;
  h.arm.schedule();
  h.paint();

  assert.equal(h.state.builds, 1, "the arm runs in the painted frame's own task");
});

// The box's own wiring (moved here from app.ts at #366): what the handler does SYNCHRONOUSLY is the #300 acknowledgment, what it defers is the build.

function fakeBox() {
  let handler: (() => void) | null = null;
  const box = {
    checked: false,
    addEventListener: (type: string, fn: () => void): void => { if (type === "change") handler = fn; },
  };
  return { box, change: (to: boolean): void => { box.checked = to; if (handler) handler(); } };
}

function toggleHarness() {
  const q = paintQueue();
  const calls = { home: 0, arm: 0, exit: 0, syncHash: 0 };
  // The ORDER of dep calls, not just counts: a guard-prover run moved syncHash to the handler's first line and every count-only test stayed green.
  const order: string[] = [];
  const f = fakeBox();
  const slot = wireSurveyToggle({
    box: f.box as unknown as HTMLInputElement,
    worldGen: () => 0,
    home: () => { calls.home++; order.push("home"); },
    arm: () => { calls.arm++; order.push("arm"); },
    exit: () => { calls.exit++; order.push("exit"); },
    syncHash: () => { calls.syncHash++; order.push("syncHash"); },
    afterPaint: q.afterPaint,
  });
  return { ...q, calls, order, slot, change: f.change };
}

test("#300 the tick acknowledges inside the handler and defers only the build", () => {
  const h = toggleHarness();
  h.change(true);
  assert.equal(h.calls.home, 1, "the camera homes synchronously: the #165 world-sheet reset");
  assert.equal(h.calls.arm, 0, "the build waits for the paint");
  h.paint();
  assert.equal(h.calls.arm, 1, "and runs on the far side of it");
});

test("#300 the untick drops a pending arm and tears down, without homing the camera", () => {
  const h = toggleHarness();
  h.change(true);
  h.change(false);
  assert.equal(h.calls.exit, 1, "exitAges runs on the untick branch");
  assert.equal(h.calls.home, 1, "only the tick homes: an untick leaves the camera where it is");
  h.paint();
  assert.equal(h.calls.arm, 0, "a tick undone inside the beat inks nothing");
});

test("#192 the hash is written in BOTH directions, in the handler's own turn", () => {
  const h = toggleHarness();
  h.change(true);
  assert.equal(h.calls.syncHash, 1, "ticking writes the address");
  h.change(false);
  assert.equal(h.calls.syncHash, 2, "and so does unticking");
  // The write being SYNCHRONOUS is what keeps a link copied right after the click correct; no paint has run here.
});

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

test("#366 the slot it hands back is the one the landings arm through", () => {
  const h = toggleHarness();
  let landed = 0;
  h.change(true); // a tick still waiting on its frame
  armOnLanding({ arm: h.slot, armed: true, rearm: () => { landed++; }, clear: () => {} });
  h.paint();
  // A fresh scheduler here would let both arms fire; app.ts leans on this when it passes the slot to both landing paths.
  assert.equal(h.calls.arm, 0, "the tick's arm is superseded by the landing");
  assert.equal(landed, 1, "and the landing's own arm is the one that runs");
});

test("#192 the tick writes the hash AFTER the camera comes home, not before", () => {
  const h = toggleHarness();
  h.change(true);
  // home() drops cx/cy/k from the address; a write ordered before it carries a STALE camera into any copied link. Sequence, not counts: the counts pass either way.
  assert.deepEqual(h.order, ["home", "syncHash"]);
});

test("#192 the untick writes the hash AFTER the teardown, not before", () => {
  const h = toggleHarness();
  h.change(true);
  h.order.length = 0;
  h.change(false);
  assert.deepEqual(h.order, ["exit", "syncHash"]);
});

// Extracted so the defer decision is testable; the host's second reader (who repaints the #174 back face) is only visible to e2e SV2k/SV2m/SV2o.
test("#366 a landing defers its arm only when the paint it waits for can actually be seen", () => {
  assert.equal(deferLandingArm(false, false), true, "the ordinary settle: the chart is facing the reader");
  assert.equal(deferLandingArm(false, true), false, "flipped: the chart is facing away, the back face is not");
  assert.equal(deferLandingArm(true, false), false, "a quiet mid-drag redraw arms inline");
  assert.equal(deferLandingArm(true, true), false, "and both at once is still inline");
});

// The production yield's SHAPE: a bare rAF fires before the render step and a bare setTimeout was green on all 1108 tests, so the frame-then-task hop is pinned here.
test("#300 afterNextPaint hops a frame AND a task: a bare rAF would block the paint it waits for", () => {
  const hadRaf = "requestAnimationFrame" in globalThis;
  const realRaf = (globalThis as Record<string, unknown>).requestAnimationFrame;
  const realTimeout = globalThis.setTimeout;
  let frame: (() => void) | null = null;
  let task: (() => void) | null = null;
  (globalThis as Record<string, unknown>).requestAnimationFrame = (fn: () => void) => { frame = fn; return 1; };
  (globalThis as Record<string, unknown>).setTimeout = (fn: () => void) => { task = fn; return 0; };
  try {
    let ran = 0;
    afterNextPaint(() => { ran++; });
    assert.equal(ran, 0, "nothing runs in the caller's own turn");
    assert.ok(frame, "a frame is requested");
    (frame as unknown as () => void)();
    assert.equal(ran, 0, "the frame callback must NOT run the work: it fires before the render step");
    assert.ok(task, "the frame callback queues a task instead");
    (task as unknown as () => void)();
    assert.equal(ran, 1, "the work runs in the task, on the far side of the paint");
  } finally {
    globalThis.setTimeout = realTimeout;
    if (hadRaf) (globalThis as Record<string, unknown>).requestAnimationFrame = realRaf;
    else delete (globalThis as Record<string, unknown>).requestAnimationFrame;
  }
});
