// #300/#366 The survey's arm, deferred past the paint, and the box that asks for it.
//
// #366 widened this from the tick to every arm path: a settle and a #131 turn's commit each
// wrote the new chart into the mount and re-armed in the SAME task, so the browser could not
// paint the chart the host had just written until the arm returned (1245ms from the settle to
// the first delivered frame carrying the new chart, then about 105ms, measured in screencast
// frames on seed 42). Both landings now schedule through THIS scheduler: the chart paints, the
// track follows.
// Going through the single slot rather than calling afterNextPaint at each landing is the
// safety half. Since #364 a second arm no longer stacks a second overlay on the sheet, so what
// it costs is a duplicate ~1.1s session build for one sheet, rebuilding the world that just
// landed. Worth not doing, and the slot is what stops it.
//
// Ticking the survey box runs the whole session build in the change handler
// (voyage-session.ts build(): prepareVoyageRouter plus the #184 all-pairs travel matrix,
// measured 895-1207ms across five seeds on a laptop, the matrix ~97% of it). Inside the
// click's own event handler the browser cannot paint ANYTHING until it returns, not even
// the checked box, so the tick reads as a dead beat. Yielding a frame first is the fix:
// the tick paints, then the build runs.
//
// The yield opens a window that did not exist while the handler was synchronous, and this
// scheduler is what closes it. Three things can happen between the tick and the build,
// and each has to drop the pending arm:
//   - the box is unticked (cancel), or unticked and re-ticked (a second schedule): an arm
//     that fires for a box the reader has since moved inks a track nobody asked for, and
//     two arms surviving into one mount would each build the ~1.1s session for one sheet;
//   - a draw starts: its own settle (or turn landing) re-arms against the chart that
//     lands, and this arm is holding the outgoing world's manifest.
// (Until #364 a second arm ALSO left two .voyage-overlay layers stacked on the sheet: the
// session builder appended and never wiped. The builder now drops the overlay it finds,
// so the DOM symptom is gone and the reasons above are what remain.)
// The host bumps `worldGen` for the last of those; `isArmed` is the live box read, kept as
// the standing truth even where a generation already covers it.
//
// `worldGen` covers a draw that STARTS after the tick. It cannot cover one that was already
// IN FLIGHT, because the host bumps its counter when a draw begins, so a tick made during
// the drafting takes a snapshot that already matches and always will. That case is closed
// from the other end: the settle and the turn landing both arm through armOnLanding, whose
// schedule() bumps the same generation cancel() does, which is the host saying "this landing
// owns the arm now" (until #366 they called that cancel() literally; the supersession is the
// same one). Without it the settle's arm and this one both land: before #364 that stacked two
// overlays on the sheet, and since #364 the second build simply replaces the first. What
// remains is a duplicate ~1.1s session build for one sheet, not wrong ink: `arm` reads the
// host's live refs when it FIRES, and the settle assigns those before it arms, so an arm that
// outlives a landing rebuilds the world that just landed. Worth dropping, but no longer a
// defect visible on the sheet.
//
// The scheduler is deliberately DOM-free: the yield arrives as `afterPaint` so it is testable
// (test/site/survey-arm.test.ts holds the frame open and acts inside it). The production
// yield is afterNextPaint below, and the box's own wiring is wireSurveyToggle.
export interface SurveyArmDeps {
  /** Run `run` after the browser has painted the frame the click produced. */
  afterPaint: (run: () => void) => void;
  /** The live control read: is the survey still asked for? */
  isArmed: () => boolean;
  /** A counter the host bumps whenever the chart under the arm is replaced. */
  worldGen: () => number;
  /** The heavy build, run only if the window closed clean. */
  arm: () => void;
}

export function createSurveyArm(deps: SurveyArmDeps) {
  // Monotonic, bumped by BOTH schedule and cancel, so every change event supersedes the
  // arm pending before it. A boolean flag could not tell tick/untick/tick apart from
  // tick/tick and would build twice.
  let gen = 0;

  /** @param run the arm to run, defaulting to the tick's (deps.arm). */
  function schedule(run: () => void = deps.arm): void {
    const mine = ++gen;
    const world = deps.worldGen();
    deps.afterPaint(() => {
      if (mine !== gen) return; // a later change event superseded this arm
      if (world !== deps.worldGen()) return; // a draw landed; its settle owns the arm
      if (!deps.isArmed()) return; // the box is the truth
      run();
    });
  }

  /** Drop any pending arm (the untick branch of the same change handler). */
  function cancel(): void {
    gen++;
  }

  return { schedule, cancel };
}

export type SurveyArm = ReturnType<typeof createSurveyArm>;

/** The survey control's own wiring (#321: the box IS the address, both directions). */
export interface SurveyToggleDeps {
  /** The survey checkbox. */
  box: HTMLInputElement;
  /** A counter the host bumps whenever the chart under the arm is replaced (drawGen). */
  worldGen: () => number;
  /** #165: arming snaps the camera home and drops a committed region inset, first. */
  home: () => void;
  /** The tick's arm, against the chart already on screen. */
  arm: () => void;
  /** The untick branch's teardown (exitAges). */
  exit: () => void;
  /** #192: the one hash writer, run after the arm in BOTH directions. */
  syncHash: () => void;
  /** Test seam; production is afterNextPaint below. */
  afterPaint?: (run: () => void) => void;
}

/**
 * Wire the survey box and hand back the one slot every arm goes through.
 *
 * #300: everything that ACKNOWLEDGES the click is synchronous here (the checked box, the
 * camera home, the hash write); only the heavy build waits for the paint. exitAges keeps
 * both chamber-painter teardowns live on a bar-less host (#319), and cancel() drops an arm
 * still waiting on its frame so a tick undone inside that beat inks nothing.
 *
 * A hash restore skips this handler entirely: the boot ticks the box with no change event,
 * and the first settle arms the resting track silently through the landing path.
 */
export function wireSurveyToggle(deps: SurveyToggleDeps): SurveyArm {
  const arm = createSurveyArm({
    afterPaint: deps.afterPaint || afterNextPaint,
    isArmed: () => deps.box.checked,
    worldGen: deps.worldGen,
    arm: deps.arm,
  });
  deps.box.addEventListener("change", () => {
    if (deps.box.checked) { deps.home(); arm.schedule(); }
    else { arm.cancel(); deps.exit(); }
    // ORDER, not just presence: syncHash runs LAST in both directions. home() is what snaps the
    // camera and so what drops cx/cy/k, so a write hoisted above it would carry a stale camera
    // into a link copied in the next moment, with nothing to re-sync it until the next draw.
    // Pinned by the two #192 order tests. Still synchronous in the handler, and it reads the
    // BOX and never the track, so deferring the build leaves the address unmoved.
    deps.syncHash();
  });
  return arm;
}

/** A landing (a settle, or a #131 turn's commit) taking the arm over from the tick. */
export interface LandingArm {
  /** The one scheduler. Both landings and the tick share its single slot. */
  arm: SurveyArm;
  /** The live box read at the moment the chart lands. */
  armed: boolean;
  /** This landing's arm, closed over THIS draw's manifest and survey. */
  rearm: () => void;
  /** The unticked branch's teardown (clearAges). */
  clear: () => void;
  /** false = arm inline; the host computes it with deferLandingArm below. */
  defer?: boolean;
}

/**
 * #366: does a landing defer its arm past a paint, or run it inline?
 *
 * Deferring buys one thing: the chart the host just wrote gets to paint before the ~1.1s build.
 * Two landings have nothing to buy, so they arm inline instead.
 *   - `quiet`, a throttled mid-drag redraw: it skips the #184 matrix (23-36ms), and deferring
 *     would let each redraw drop the one before it, so the track would lag its own coastline.
 *   - `flipped`, the sheet resting on its verso: the chart is facing AWAY, and the back face
 *     the reader is looking at would sit on a bare new ghost for the whole beat (e2e SV2o).
 *
 * The host reads this twice, for the arm and for who repaints the #174 back face, which is why
 * it is one named predicate rather than two spellings of the same condition.
 */
export function deferLandingArm(quiet: boolean, flipped: boolean): boolean {
  return !quiet && !flipped;
}

/**
 * #366: a landing arms through the SAME single slot the tick uses, one painted frame later.
 *
 * Scheduling (rather than cancelling and calling rearm inline) is the whole fix: the host
 * writes the new chart into the mount and returns, so the browser paints it, and the ~1.1s
 * a cold #184 travel matrix costs is paid on the far side of that paint.
 *
 * Deliberately returns nothing. The host's other #366 question, whether the arm owns the repaint
 * of a second surface (the #174 verso track), is answered by the box and deferLandingArm at
 * settle time, not by this call: the turn's landing runs ~900ms after the host needs the answer.
 */
export function armOnLanding(o: LandingArm): void {
  if (!o.armed) { o.arm.cancel(); o.clear(); return; }
  // Inline where the yield buys nothing: a quiet mid-drag redraw, or a landing taken while the
  // sheet rests on its verso. deferLandingArm above holds both reasons.
  if (o.defer === false) { o.arm.cancel(); o.rearm(); return; }
  // schedule() bumps the same generation cancel() does, so this IS the cancel: whatever was
  // pending is superseded and exactly one arm survives into the mount.
  o.arm.schedule(o.rearm);
}

/**
 * The production yield: one rAF to reach the frame the click produced, then a task, which
 * runs AFTER that frame is painted. rAF alone is not enough, since its callbacks run
 * BEFORE the render step and would block the very paint being waited for.
 *
 * INVARIANT: this hop is rAF-FIRST on purpose, and that ties EVERY arm to the tab being
 * visible. A backgrounded tab suspends rAF, so the box stays checked and `survey` stays in
 * the address over a bare sheet until the reader comes back, at which point it arms.
 * Deliberate: the work is a ~1.1s block whose only output is ink nobody is looking at.
 * Swapping the order to run the task first would break the acknowledgment this module
 * exists for.
 *
 * #366 widened who pays that: not just a tick made as the tab is hidden, but a DRAW and a
 * `survey` deep link opened in a background tab. Such a link now boots the chart with the
 * flag in its address and no track, and arms on the reader's first look, spending the beat
 * on a chart they are already reading. Accepted as the price of the paint, and named here
 * because it is the one case the deferral makes worse rather than better.
 */
export function afterNextPaint(run: () => void): void {
  requestAnimationFrame(() => { setTimeout(run, 0); });
}
