// #300/#366: the survey's arm, deferred one painted frame past every arm path (the tick,
// the settle, the turn's commit), all through ONE slot so exactly one arm survives into
// the mount. #373 added the second wait: the #184 travel matrix is computed off-thread now, and
// the arm HOLDS for it rather than blocking on it. Measurements live on that issue.
export interface SurveyArmDeps {
  /** Run `run` after the browser has painted the frame the click produced. */
  afterPaint: (run: () => void) => void;
  /** The live control read: is the survey still asked for? */
  isArmed: () => boolean;
  /** A counter the host bumps whenever the chart under the arm is replaced. */
  worldGen: () => number;
  /** The build, run only if the window closed clean. */
  arm: () => void;
  /** #373: off-thread preparation for the chart now on screen, awaited between the paint and the arm. Optional: with none, every arm is synchronous as before. */
  prime?: () => Promise<void>;
}

export function createSurveyArm(deps: SurveyArmDeps) {
  // Monotonic, bumped by BOTH schedule and cancel, so every change event supersedes the arm pending before it.
  let gen = 0;

  // The three supersession reads, named because #373 made them run TWICE: once on the painted frame, once on the far side of the wait, never captured in between.
  const live = (mine: number, world: number): boolean =>
    mine === gen && world === deps.worldGen() && deps.isArmed();

  /** @param run the arm to run, defaulting to the tick's (deps.arm). */
  function schedule(run: () => void = deps.arm): void {
    const mine = ++gen;
    const world = deps.worldGen();
    deps.afterPaint(() => {
      if (!live(mine, world)) return;
      if (!deps.prime) { run(); return; }
      const armIfLive = () => { if (live(mine, world)) run(); };
      // Settled BOTH ways: a source that rejected is a source with nothing ready, and the arm has to proceed to the inline order rather than leave the sheet bare on an unhandled rejection.
      void deps.prime().then(armIfLive, armIfLive);
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
  /** #373: the off-thread preparation every arm through this slot waits for. */
  prime?: () => Promise<void>;
  /** Test seam; production is afterNextPaint below. */
  afterPaint?: (run: () => void) => void;
}

/** Wire the survey box and hand back the one slot every arm goes through. A hash restore skips this handler entirely: the boot ticks the box with no change event. */
export function wireSurveyToggle(deps: SurveyToggleDeps): SurveyArm {
  const arm = createSurveyArm({
    afterPaint: deps.afterPaint || afterNextPaint,
    isArmed: () => deps.box.checked,
    worldGen: deps.worldGen,
    arm: deps.arm,
    ...(deps.prime ? { prime: deps.prime } : {}),
  });
  deps.box.addEventListener("change", () => {
    if (deps.box.checked) { deps.home(); arm.schedule(); }
    else { arm.cancel(); deps.exit(); }
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

/** #366: defer only when the paint it waits for can be seen; quiet and flipped landings arm inline. One named predicate because the host reads it twice (the arm, and who repaints the #174 back face). */
export function deferLandingArm(quiet: boolean, flipped: boolean): boolean {
  return !quiet && !flipped;
}

// #373: the un-deferred branch arms in the settle's OWN task and never waits, because a FLIPPED landing has to ink the back face inside the task that swaps the chart or the verso shows a bare new ghost first (#174; e2e SV2o measured exactly that when this branch was made to wait). It takes whatever order is already prepared, and pays the matrix inline when there is none.
/** #366: a landing arms through the SAME single slot the tick uses, one painted frame later; schedule() bumps the generation cancel() does, so it IS the cancel and exactly one arm survives. */
export function armOnLanding(o: LandingArm): void {
  if (!o.armed) { o.arm.cancel(); o.clear(); return; }
  if (o.defer === false) { o.arm.cancel(); o.rearm(); return; }
  o.arm.schedule(o.rearm);
}

/**
 * One rAF to reach the frame the click produced, then a task, which runs AFTER that frame
 * is painted (a bare rAF callback runs BEFORE the render step and would block the paint).
 * INVARIANT: rAF-FIRST on purpose, tying every arm to tab visibility: a backgrounded tab
 * suspends rAF, so a hidden tick or deep link arms on the reader's first look instead of
 * spending a ~1s block on ink nobody is looking at.
 */
export function afterNextPaint(run: () => void): void {
  requestAnimationFrame(() => { setTimeout(run, 0); });
}
