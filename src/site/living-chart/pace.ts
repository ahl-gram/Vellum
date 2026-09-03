// The instrument's pace (#493, #462 ruling 6's "readout and pace"): the sweep's clock counts story milliseconds per wall millisecond. Pure, so the re-anchor is provable with no rAF.
export const PACES = [1, 2, 4] as const;
export type Pace = (typeof PACES)[number];
/** The slowest is today's one sweep speed (ruled 2026-09-02): a reader who never touches the pace sees the room as it played before. */
export const DEFAULT_PACE: Pace = 1;
export const isPace = (k: number): k is Pace => (PACES as readonly number[]).includes(k);
/** Story time elapsed at wall clock `now` for a sweep anchored at `begin` running at `pace`. */
export const storyElapsed = (now: number, begin: number, pace: number): number => (now - begin) * pace;
/** The anchor at which a sweep at `pace` stands at story time `elapsed` when the wall clock reads `now`. */
export const anchorFor = (now: number, elapsed: number, pace: number): number => now - elapsed / pace;
