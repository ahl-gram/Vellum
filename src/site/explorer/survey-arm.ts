// The survey's arm: every arm path (the tick, a settle, a turn's commit) defers one painted frame through ONE slot, then holds for the off-thread travel matrix rather than blocking on it (measurements on #373).
export interface SurveyArmDeps {
  afterPaint: (run: () => void) => void;
  isArmed: () => boolean;
  worldGen: () => number;
  arm: () => void;
  prime?: () => Promise<void>;
}

export function createSurveyArm(deps: SurveyArmDeps) {
  let gen = 0;

  const live = (mine: number, world: number): boolean =>
    mine === gen && world === deps.worldGen() && deps.isArmed();

  function schedule(run: () => void = deps.arm): void {
    const mine = ++gen;
    const world = deps.worldGen();
    deps.afterPaint(() => {
      if (!live(mine, world)) return;
      if (!deps.prime) { run(); return; }
      const armIfLive = () => { if (live(mine, world)) run(); };
      void deps.prime().then(armIfLive, armIfLive);
    });
  }

  function cancel(): void {
    gen++;
  }

  return { schedule, cancel };
}

export type SurveyArm = ReturnType<typeof createSurveyArm>;

export interface SurveyToggleDeps {
  box: HTMLInputElement;
  worldGen: () => number;
  home: () => void;
  arm: () => void;
  exit: () => void;
  syncHash: () => void;
  prime?: () => Promise<void>;
  afterPaint?: (run: () => void) => void;
}

/** A hash restore skips this handler entirely: the boot ticks the box with no change event. */
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

export interface LandingArm {
  arm: SurveyArm;
  armed: boolean;
  rearm: () => void;
  clear: () => void;
  defer?: boolean;
}

export function deferLandingArm(quiet: boolean, flipped: boolean): boolean {
  return !quiet && !flipped;
}

export function armOnLanding(o: LandingArm): void {
  if (!o.armed) { o.arm.cancel(); o.clear(); return; }
  if (o.defer === false) { o.arm.cancel(); o.rearm(); return; }
  o.arm.schedule(o.rearm);
}

// rAF first on purpose: a backgrounded tab suspends rAF, so a hidden tick or deep link arms on the reader's first look instead of blocking ~1s on ink nobody is looking at.
export function afterNextPaint(run: () => void): void {
  requestAnimationFrame(() => { setTimeout(run, 0); });
}
