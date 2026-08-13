// #300 The survey tick's arm, deferred past the paint.
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
// from the other end: the settle and the turn landing each call cancel() before arming,
// which is the host saying "this landing owns the arm now". Without it the settle's arm and
// this one both land: before #364 that stacked two overlays on the sheet, and since #364 the
// second build simply replaces the first. What remains is a duplicate ~1.1s session build
// for one sheet, not wrong ink: `arm` reads the host's live refs when it FIRES, and the
// settle assigns those before it arms, so an arm that outlives a landing rebuilds the world
// that just landed. Worth dropping, but no longer a defect visible on the sheet.
//
// Deliberately DOM-free: the yield arrives as `afterPaint` so it is testable
// (test/site/survey-arm.test.ts holds the frame open and acts inside it). The production
// yield is afterNextPaint below.
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

  function schedule(): void {
    const mine = ++gen;
    const world = deps.worldGen();
    deps.afterPaint(() => {
      if (mine !== gen) return; // a later change event superseded this arm
      if (world !== deps.worldGen()) return; // a draw landed; its settle owns the arm
      if (!deps.isArmed()) return; // the box is the truth
      deps.arm();
    });
  }

  /** Drop any pending arm (the untick branch of the same change handler). */
  function cancel(): void {
    gen++;
  }

  return { schedule, cancel };
}

/**
 * The production yield: one rAF to reach the frame the click produced, then a task, which
 * runs AFTER that frame is painted. rAF alone is not enough, since its callbacks run
 * BEFORE the render step and would block the very paint being waited for.
 *
 * INVARIANT: this hop is rAF-FIRST on purpose, and that ties the arm to the tab being
 * visible. A backgrounded tab suspends rAF, so a tick made just before the tab is hidden
 * leaves the box checked and `survey` in the address over a bare sheet until the reader
 * comes back, at which point it arms. Deliberate: the work is a ~1.1s block whose only
 * output is ink nobody is looking at. Swapping the order to run the task first would break
 * the acknowledgment this whole module exists for.
 */
export function afterNextPaint(run: () => void): void {
  requestAnimationFrame(() => { setTimeout(run, 0); });
}
