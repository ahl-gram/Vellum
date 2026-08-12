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
//   - the box is unticked (cancel), or unticked and re-ticked (a second schedule): the
//     session builder APPENDS its overlay svg and never wipes, so two arms surviving into
//     one mount would leave two .voyage-overlay layers on the sheet;
//   - a draw starts: its own settle (or turn landing) re-arms against the chart that
//     lands, and this arm is holding the outgoing world's manifest.
// The host bumps `worldGen` for the last of those; `isArmed` is the live box read, kept as
// the standing truth even where a generation already covers it.
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
 */
export function afterNextPaint(run: () => void): void {
  requestAnimationFrame(() => { setTimeout(run, 0); });
}
