// #418: the room's one arm slot. #373 moved the #184 travel matrix off the main thread, and here the arm HOLDS for that order rather than blocking on it, so ONE arm sails the travel order and nothing re-shuffles in front of a reader already resting in the survey chamber (Alex's ruling, 2026-08-17).
// Not explorer/survey-arm.ts: that slot serves a CONTROL (a box that unticks, a tick arm and a landing arm sharing one generation, a cancel). The room is always armed and every arm belongs to exactly one draw, so drawGen IS the generation and there is nothing to cancel.
export interface RoomArmDeps {
  /** Run `run` after the browser has painted the frame the settle produced. */
  afterPaint: (run: () => void) => void;
  /** The room's drawGen: bumped by every draw, so a counter read supersedes an arm still waiting. */
  worldGen: () => number;
}

/** One draw's pair, both closed over THAT draw's manifest, survey and rest, never module state (#120). */
export interface RoomArmDraw {
  /** Off-thread preparation for the chart now on screen, awaited between the paint and the arm. */
  prime: () => Promise<void>;
  arm: () => void;
}

export function createRoomArm(deps: RoomArmDeps) {
  function schedule(draw: RoomArmDraw): void {
    const world = deps.worldGen();
    const live = (): boolean => world === deps.worldGen();
    deps.afterPaint(() => {
      if (!live()) return;
      const armIfLive = (): void => { if (live()) draw.arm(); };
      void draw.prime().then(armIfLive, armIfLive);
    });
  }
  return { schedule };
}

export type RoomArm = ReturnType<typeof createRoomArm>;
