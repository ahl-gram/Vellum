import { type Cam, closeIn } from "./camera.ts";

export const IDLE_DELAY_MS = 9000;
export const DRIFT_SECONDS = 14;
export const DRIFT_DX = 14;
export const DRIFT_DY = -10;
export const DRIFT_SCALE = 1.015;

export function driftTarget(cam: Cam, fit: number): Cam {
  const s = cam.s * DRIFT_SCALE;
  return {
    x: cam.x + DRIFT_DX,
    y: cam.y + DRIFT_DY,
    s: closeIn(s, fit) === closeIn(cam.s, fit) ? s : cam.s,
  };
}

export interface DriftTween {
  readonly kill: () => void;
}

export interface DriftDeps<T> {
  readonly reduced: () => boolean;
  readonly setTimer: (run: () => void, ms: number) => T;
  readonly clearTimer: (timer: T | undefined) => void;
  readonly camera: () => Cam;
  readonly breathe: () => DriftTween;
}

export interface Drift {
  readonly arm: () => void;
  readonly stop: () => void;
  readonly base: () => Cam | null;
}

export function createDrift<T>(deps: DriftDeps<T>): Drift {
  let timer: T | undefined;
  let tween: DriftTween | null = null;
  let base: Cam | null = null;
  const arm = (): void => {
    if (deps.reduced()) return;
    timer = deps.setTimer(() => {
      base = deps.camera();
      tween = deps.breathe();
    }, IDLE_DELAY_MS);
  };
  const stop = (): void => {
    tween?.kill();
    tween = null;
    base = null;
    deps.clearTimer(timer);
    arm();
  };
  return { arm, stop, base: () => base };
}
