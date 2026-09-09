// The room's one arm slot: the arm HOLDS for the off-thread travel order rather than blocking on it, so ONE arm sails the order and nothing re-shuffles in front of a reader resting in the survey chamber (Alex's ruling on #418, 2026-08-17). Not explorer/survey-arm.ts: every arm here belongs to exactly one draw, so drawGen IS the generation and there is nothing to cancel.
export interface RoomArmDeps {
  /** Run `run` after the browser has painted the frame the settle produced. */
  afterPaint: (run: () => void) => void;
  /** The room's drawGen: bumped by every draw, so a counter read supersedes an arm still waiting. */
  worldGen: () => number;
}

/** One draw's pair, both closed over THAT draw's manifest, survey and rest, never module state. */
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
