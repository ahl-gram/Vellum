import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createSurveyArm, afterNextPaint, armOnLanding, wireSurveyToggle, deferLandingArm,
} from "../../src/site/explorer/survey-arm.ts";

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
  // builds counts the TICK's arm, landings the arm a settle or a turn's commit brings with
  // it (#366), and clears the unticked branch's teardown. Counted apart so a test can say
  // WHICH arm ran, not merely that one did.
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
  // Two builds means the ~1.1s session build runs twice for one sheet, and the second one
  // wins with the same world's track. (Before #364 it was also a DOM defect: the session
  // builder appended and never wiped, so the two overlays stacked. The builder now drops
  // the overlay it finds, so what this pins is the arm's own supersede rule.)
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

// #366: the same beat, on the other two arm paths. A Draw with the box ticked wrote the new
// chart into the mount and re-armed in the SAME task, so the browser could not paint the new
// chart until the arm returned: 1245ms from the settle to the first delivered frame carrying
// it, about 105ms after the fix, measured in screencast frames. The full before/after tables
// are on #366 and its PR.
// A landing now schedules through the SAME single slot the tick uses. Going through the
// scheduler rather than calling afterNextPaint at the landing is the load-bearing half: two
// arms alive at once are two session builds of the same world, the second of them a wasted
// ~1.1s block over a chart the first already inked.

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
  // The single slot is the whole safety property, and it holds however the engine's mount
  // handles a second overlay: two arms alive at once are two session builds of the same world,
  // the second a wasted ~1.1s block over a chart the first already inked, and the ink the mount
  // ends up wearing belongs to neither landing.
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
  // A sea-level or coast drag redraws through quiet settles, and orderItinerary returns
  // early on quiet without touching the #184 matrix (voyage-session.ts), so this arm is
  // 23-36ms rather than the beat this issue is about. Deferring it would let each throttled
  // redraw drop the one before it and the track would lag the coastline it belongs to.
  assert.equal(h.state.landings, 1, "the quiet arm runs in the settle's own task");
  h.paint();
  assert.equal(h.state.builds, 0, "the pending tick is dropped all the same: one landing, one arm");
  assert.equal(h.state.landings, 1, "and the quiet arm does not run twice");
});

// The box's own wiring (#366 moved it here from app.ts, which was at 396 of its 400 lines).
// It takes the same injected `afterPaint`, so the handler can be driven with the frame held
// open, and every dep is a counter: what the handler does SYNCHRONOUSLY is the #300
// acknowledgment, and what it defers is the build.

/** A survey checkbox the toggle can be wired to without a DOM. */
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
  // The ORDER the handler calls its deps in, not just how often. #192's write must come after
  // the camera work, and counting alone cannot see that (a guard-prover run moved syncHash to
  // the first line of the handler and every unit test and every survey check stayed green).
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
  // One mechanism per test: the counts above are the whole claim. The write being SYNCHRONOUS
  // is what keeps a link copied right after the click correct, and no paint has run here.
});

test("#366 the slot it hands back is the one the landings arm through", () => {
  const h = toggleHarness();
  let landed = 0;
  h.change(true); // a tick still waiting on its frame
  armOnLanding({ arm: h.slot, armed: true, rearm: () => { landed++; }, clear: () => {} });
  h.paint();
  // A fresh scheduler here instead of the wired one would let both arms fire. That is the
  // property app.ts leans on when it passes this return value to both landing paths.
  assert.equal(h.calls.arm, 0, "the tick's arm is superseded by the landing");
  assert.equal(landed, 1, "and the landing's own arm is the one that runs");
});

test("#192 the tick writes the hash AFTER the camera comes home, not before", () => {
  const h = toggleHarness();
  h.change(true);
  // home() snaps the camera and is what drops cx/cy/k from the address. A write ordered before
  // it carries a STALE CAMERA into any link copied in the next moment, and nothing re-syncs
  // until the following draw. Sequence, not counts: the counts pass either way.
  assert.deepEqual(h.order, ["home", "syncHash"]);
});

test("#192 the untick writes the hash AFTER the teardown, not before", () => {
  const h = toggleHarness();
  h.change(true);
  h.order.length = 0;
  h.change(false);
  assert.deepEqual(h.order, ["exit", "syncHash"]);
});

// #366: which landings defer their arm. Extracted so the decision is testable here rather than
// only through the browser: the host reads it twice, once for the arm and once for who repaints
// the #174 back face, and the second reader is invisible to this suite (e2e SV2k/SV2m/SV2o).
test("#366 a landing defers its arm only when the paint it waits for can actually be seen", () => {
  assert.equal(deferLandingArm(false, false), true, "the ordinary settle: the chart is facing the reader");
  assert.equal(deferLandingArm(false, true), false, "flipped: the chart is facing away, the back face is not");
  assert.equal(deferLandingArm(true, false), false, "a quiet mid-drag redraw arms inline");
  assert.equal(deferLandingArm(true, true), false, "and both at once is still inline");
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
