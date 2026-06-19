/**
 * Maps a calendar day to a world seed for the "seed of the day" page.
 *
 * The seed is the date's UTC components read as a single integer YYYYMMDD
 * (2026-06-19 -> 20260619). UTC, not local time, so every visitor sees the same
 * world on the same day regardless of timezone. The value is a plain readable
 * integer (you can tell which day a chart came from), well under 2^31 so the
 * RNG's `seed >>> 0` mask is a no-op, and createRng's fmix32 avalanche
 * decorrelates adjacent days so consecutive worlds look nothing alike.
 */
export function seedForDate(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  return year * 10000 + month * 100 + day;
}
