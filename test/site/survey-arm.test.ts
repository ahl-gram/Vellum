import { test } from "node:test";
import assert from "node:assert/strict";
import { createSurveyArm, afterNextPaint } from "../../src/site/explorer/survey-arm.ts";

// #300: ticking the survey box ran the whole session build inside the change handler
// (prepareVoyageRouter plus the #184 all-pairs travel matrix, measured 895-1207ms across
// five seeds on a laptop), so the browser could not paint the tick until the build
// returned. The fix yields a frame first, which opens a window that did not exist while
// the handler was synchronous: between the tick and the build the box can be unticked,
// re-ticked, or the chart under it replaced by a draw that arms itself. This scheduler
// owns that window. Per the project testing rules these validate the NEW behavior of a
// DOM-driven control (there is no pure-logic bug to reproduce); the live yield in a real
// browser is proven by e2e suite-survey SV2/SV2c/SV2d.
//
// DOM-free on purpose: the scheduler takes its yield as an injected `afterPaint`, so a
// test can hold the frame open and act inside it. The production yield
// (requestAnimationFrame -> setTimeout) lives beside it in the same module.

/** A held-open frame: `afterPaint` queues, `paint()` releases everything queued so far. */
function paintQueue() {
  const queued: Array<() => void> = [];
  return {
    afterPaint: (run: () => void): void => { queued.push(run); },
    paint: (): void => { for (const run of queued.splice(0)) run(); },
  };
}

/** A scheduler over a mutable world, counting builds. */
function harness() {
  const q = paintQueue();
  const state = { armed: false, worldGen: 0, builds: 0 };
  const arm = createSurveyArm({
    afterPaint: q.afterPaint,
    isArmed: () => state.armed,
    worldGen: () => state.worldGen,
    arm: () => { state.builds++; },
  });
  return { ...q, state, arm };
}

test("#300 the arm is deferred past the paint: the click's turn builds nothing", () => {
  const h = harness();
  h.state.armed = true;
  h.arm.schedule();
  // The whole point: the handler returns, the browser paints the tick, and only THEN
  // does the ~900ms build run. A build here is the defect this issue was filed for.
  assert.equal(h.state.builds, 0, "no build in the click's own turn");
  h.paint();
  assert.equal(h.state.builds, 1, "the build runs once the frame has painted");
});

test("#300 cancel() alone drops the pending arm, with the box left ticked", () => {
  const h = harness();
  h.state.armed = true;
  h.arm.schedule();
  h.arm.cancel(); // the untick branch of the same change handler
  // The box is deliberately NOT unticked here. A real untick moves both, and asserting
  // both at once made this test pass with cancel() gutted: isArmed alone was carrying it
  // (the #140 shape, found by the guard-prover). One mechanism per test; the box read has
  // its own below.
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
  // Two builds would append two .voyage-overlay svgs to the mount: the session builder
  // appends and never wipes, and only a redraw's innerHTML swap clears the old one.
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
  // Not reachable from today's single call site, which is why it is worth pinning: it is
  // the claim schedule()'s own bump rests on, and a second caller would otherwise inherit
  // a double build silently.
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

// The production yield's SHAPE. Whether a browser paints between the two hops is a browser
// fact this cannot assert, but the hop itself is the whole reason the function exists, and
// without this it had no coverage anywhere: collapsing it to a bare setTimeout, or to the
// bare requestAnimationFrame whose callbacks run BEFORE the render step, was green on all
// 1108 tests. Stubs both globals so the two steps can be driven one at a time.
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
