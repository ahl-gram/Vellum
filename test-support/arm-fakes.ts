import { armOnLanding, createSurveyArm } from "../src/site/explorer/survey-arm.ts";

export const crashedPrime = (): Promise<never> => Promise.reject(new Error("the render worker crashed"));

export function paintQueue() {
  const queued: Array<() => void> = [];
  return {
    afterPaint: (run: () => void): void => {
      queued.push(run);
    },
    paint: (): void => {
      for (const run of queued.splice(0)) run();
    },
  };
}

export function heldPrime() {
  const waiting: Array<() => void> = [];
  let calls = 0;
  return {
    calls: () => calls,
    prime: (): Promise<void> => {
      calls++;
      return new Promise<void>((resolve) => {
        waiting.push(resolve);
      });
    },
    settle: (): void => {
      for (const r of waiting.splice(0)) r();
    },
    flush: (): Promise<void> =>
      Promise.resolve()
        .then(() => {})
        .then(() => {}),
  };
}

export function fakeBox() {
  let handler: (() => void) | null = null;
  const box = {
    checked: false,
    addEventListener: (type: string, fn: () => void): void => {
      if (type === "change") handler = fn;
    },
  };
  return {
    box,
    change: (to: boolean): void => {
      box.checked = to;
      if (handler) handler();
    },
  };
}

export function surveyHarness(prime?: () => Promise<void>) {
  const q = paintQueue();
  // builds = the tick's arm, landings = a settle or turn arm (Issue #366), clears = the unticked teardown: counted apart so a test can say WHICH ran.
  const state = { armed: false, worldGen: 0, builds: 0, landings: 0, clears: 0 };
  const arm = createSurveyArm({
    afterPaint: q.afterPaint,
    isArmed: () => state.armed,
    worldGen: () => state.worldGen,
    arm: () => {
      state.builds++;
    },
    prime,
  });
  const land = (opts: { defer?: boolean } = {}) =>
    armOnLanding({
      arm,
      armed: state.armed,
      rearm: () => {
        state.landings++;
      },
      clear: () => {
        state.clears++;
      },
      ...opts,
    });
  return { ...q, state, arm, land };
}
