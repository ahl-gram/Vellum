import type { PlaceMark } from "./place-manifest.ts";
import type { HistoricalEvent } from "../society/history.ts";

export type PlaceState = "hidden" | "living" | "ruin";

export type ScrubMark = {
  readonly idx: number;
  readonly nx: number;
  readonly ny: number;
  readonly founded: number;
  readonly ruinYear: number | null;
};

export type YearRange = { readonly min: number; readonly max: number };

export function scrubRange(places: ReadonlyArray<PlaceMark>, presentYear: number): YearRange {
  if (places.length === 0) return { min: presentYear, max: presentYear };
  const min = places.reduce((acc, p) => Math.min(acc, p.founded), Infinity);
  return { min, max: presentYear };
}

export function buildScrubMarks(
  places: ReadonlyArray<PlaceMark>,
  events: ReadonlyArray<HistoricalEvent>,
  presentYear: number,
): ScrubMark[] {
  return places.map((p) => {
    let ruinYear: number | null = null;
    if (p.ruined) {
      const e = events.find((ev) => ev.settlement === p.idx && ev.kind === "ruin");
      ruinYear = e ? e.year : presentYear;
    }
    return { idx: p.idx, nx: p.nx, ny: p.ny, founded: p.founded, ruinYear };
  });
}

export function placeStateAt(mark: ScrubMark, year: number): PlaceState {
  if (year < mark.founded) return "hidden";
  if (mark.ruinYear !== null && year >= mark.ruinYear) return "ruin";
  return "living";
}

export function glyphVisibleAt(mark: ScrubMark, year: number): boolean {
  const bakedState: PlaceState = mark.ruinYear !== null ? "ruin" : "living";
  return placeStateAt(mark, year) === bakedState;
}

export type InkGrade = "founding" | "ruin";

export function glyphRevealedBetween(mark: ScrubMark, fromYear: number, toYear: number): boolean {
  return !glyphVisibleAt(mark, fromYear) && glyphVisibleAt(mark, toYear);
}

export function inkGradeFor(mark: ScrubMark): InkGrade {
  return mark.ruinYear !== null ? "ruin" : "founding";
}

export function eventIsPast(eventYear: number, year: number): boolean {
  return eventYear <= year;
}

export const SWEEP_MS = 7000;

export function sweepYearAt(range: YearRange, elapsedMs: number): number {
  const f = Math.max(0, Math.min(1, elapsedMs / SWEEP_MS));
  return Math.round(range.min + f * (range.max - range.min));
}

export function sweepElapsedAt(range: YearRange, year: number): number {
  const span = range.max - range.min;
  if (span <= 0) return year >= range.max ? SWEEP_MS : 0;
  const f = Math.max(0, Math.min(1, (year - range.min) / span));
  return f * SWEEP_MS;
}
