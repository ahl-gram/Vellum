// #373: the room arms at once with whatever travel order is ready, so the #321 unfurl keeps
// its timing, then re-arms silently when the real order lands. That second arm repaints the
// instrument, so it may only run while the reader has not moved it.
export interface InstrumentPos {
  readonly chamber: string;
  readonly t: number | null;
  readonly year: number | null;
  readonly playing: boolean;
  readonly held: boolean;
}

export function stillResting(armed: InstrumentPos | null, now: InstrumentPos | null): boolean {
  if (!armed || !now) return false;
  if (now.playing || now.held) return false;
  return now.chamber === armed.chamber && now.t === armed.t && now.year === armed.year;
}
