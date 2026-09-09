// Which plate a told journal row shows: the chronicle half resolves through the story's beats; the survey half holds the last port whose plate carries arms, so the picture changes four to six times over a survey rather than once a port.
import { latestBeatAt, type StoryBeat } from "./beats.ts";
import type { ToldEntry } from "../living-chart/told.ts";
import type { PlaceMark } from "../../render/place-manifest.ts";

export interface PlateSpec {
  readonly index: number;
  readonly year: number;
}

export function armsBearing(places: ReadonlyArray<PlaceMark>): (index: number) => boolean {
  const armed = new Set(places.filter((p) => p.kind === "capital" || p.seat).map((p) => p.idx));
  return (index: number) => armed.has(index);
}

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

/** Every plate the room will need, deduped: the arm pulls them all, so no reveal can stall the sweep. */
export function plateSpecsFor(
  beats: ReadonlyArray<StoryBeat>,
  surveyRows: ReadonlyArray<PlateSpec | null>,
): PlateSpec[] {
  const seen = new Map<string, PlateSpec>();
  for (const b of beats) seen.set(plateKeyOf(b), { index: b.index, year: b.year });
  for (const s of surveyRows) if (s !== null) seen.set(plateKeyOf(s), s);
  return [...seen.values()];
}
