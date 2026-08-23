// #442 which plate a told journal row shows. The chronicle half resolves through the
// story's beats (#402). The survey half holds the last port whose plate carries arms,
// the capital-or-seat distinction finished.ts already draws, so the picture changes four
// to six times over a survey rather than once a port.
import { latestBeatAt, type StoryBeat } from "./beats.ts";
import type { ToldEntry } from "../living-chart/told.ts";

export interface PlateSpec {
  readonly index: number;
  readonly year: number;
}

/** The cache identity: a town at its founding and the same town today are different plates, since prospectPlate reads the year as an era filter. */
export const plateKeyOf = (s: PlateSpec): string => `${s.index}:${s.year}`;

export function surveyPlateRows(
  portByRow: ReadonlyArray<number>,
  hasArms: (index: number) => boolean,
  year: number,
): (PlateSpec | null)[] {
  let held: PlateSpec | null = null;
  return portByRow.map((index) => {
    if (hasArms(index)) held = { index, year };
    return held;
  });
}

export function plateForTold(
  told: ToldEntry | null,
  beats: ReadonlyArray<StoryBeat>,
  surveyRows: ReadonlyArray<PlateSpec | null>,
): PlateSpec | null {
  if (told === null) return null;
  if (told.chamber === "ages") {
    const beat = latestBeatAt(beats, told.year);
    return beat === null ? null : { index: beat.index, year: beat.year };
  }
  return surveyRows[told.row] ?? null;
}

/** Every plate the room will need, deduped: the arm pulls them all, so no reveal can stall the sweep (#311). */
export function plateSpecsFor(
  beats: ReadonlyArray<StoryBeat>,
  surveyRows: ReadonlyArray<PlateSpec | null>,
): PlateSpec[] {
  const seen = new Map<string, PlateSpec>();
  for (const b of beats) seen.set(plateKeyOf(b), { index: b.index, year: b.year });
  for (const s of surveyRows) if (s !== null) seen.set(plateKeyOf(s), s);
  return [...seen.values()];
}
