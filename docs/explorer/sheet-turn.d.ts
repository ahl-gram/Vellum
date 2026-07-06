// Types for the parts of sheet-turn.js consumed from TypeScript. Only shouldTurn
// (the pure semantic gate) is unit-tested and imported by a .ts, so only it is
// declared here; runTurn/cancelTurn touch the DOM and are consumed solely by the
// untyped browser conductor (app.js), verified by e2e + a CDP probe. Keeping this
// DOM-free lets the project tsconfig (no "dom" lib) type-check the test.

export interface TurnDecision {
  /** This draw was triggered by a style change (the only turn trigger in v1). */
  isTurn: boolean;
  /** prefers-reduced-motion is on (fall back to an instant swap). */
  reduceMotion: boolean;
  /** The off-thread render worker is live (the fallback path swaps instantly). */
  usesWorker: boolean;
  /** A chart is already on screen to turn away from. */
  hasChart: boolean;
  /** Chronicle/scrub mode is active (re-applies per its own redraw rules). */
  chronicle: boolean;
}

/** Whether this draw should turn the sheet rather than settle (#127) or swap instantly. */
export function shouldTurn(s: TurnDecision): boolean;
