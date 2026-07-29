import type { PlaceMark } from "./place-manifest.ts";
import type { HistoricalEvent } from "../society/history.ts";

/**
 * The pure core of the Chronicle year-scrubber (#54, the closing sub of the
 * Living Chart epic #51). It turns the #52 manifest into the data a year-slider
 * and a Play sweep need: each place's founding and abandonment years, and the
 * uniform Play timeline.
 *
 * No DOM, no RNG. The slider, layer hide/restore, and the requestAnimationFrame
 * loop live in src/site/living-chart/ages.ts and are covered by the Explorer e2e.
 *
 * Play is UNIFORM: linear in years over the fixed SWEEP_MS, the bar moving at one
 * speed through the annals. #54 shipped it event-proportional, dwelling on each
 * beat-year (itself a deliberate override of that issue's fixed linear sweep);
 * Alex reversed that on PR #311 (2026-07-28), restoring the linear sweep and
 * retiring the dwell plan.
 */

export type PlaceState = "hidden" | "living" | "ruin";

/** A place reduced to what the scrubber needs: position plus its two life dates. */
export type ScrubMark = {
  readonly idx: number;
  readonly nx: number;
  readonly ny: number;
  readonly founded: number;
  /** The abandonment year for a ruin, else null. Never the founding year. */
  readonly ruinYear: number | null;
};

export type YearRange = { readonly min: number; readonly max: number };

/** The slider span: earliest founding to the present survey year. */
export function scrubRange(places: ReadonlyArray<PlaceMark>, presentYear: number): YearRange {
  if (places.length === 0) return { min: presentYear, max: presentYear };
  const min = places.reduce((acc, p) => Math.min(acc, p.founded), Infinity);
  return { min, max: presentYear };
}

/**
 * Each place's life dates. A ruin's abandonment year comes from its ruin event,
 * matched by `settlement === idx && kind === "ruin"` (a founding event carries
 * the same idx, so the kind filter is load-bearing, as in place-card.ts). The
 * chronicle is capped at 14 events with ruins pushed last, so a ruin's event can
 * be absent: it then falls back to the present year, crumbling at the end of the
 * timeline rather than never.
 */
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

/** A place's state at a given year: hidden before founding, then living, then ruin. */
export function placeStateAt(mark: ScrubMark, year: number): PlaceState {
  if (year < mark.founded) return "hidden";
  if (mark.ruinYear !== null && year >= mark.ruinYear) return "ruin";
  return "living";
}

/**
 * Whether a settlement's BAKED glyph should be shown at a given year (#93). The
 * static chart draws each settlement in its present-day state only: a living town
 * has a living glyph, a town that is a ruin today has a ruin glyph and no living
 * glyph anywhere. So a glyph is shown exactly when the year's state matches the
 * baked state ("state-begins", the decided rule): a living town appears at its
 * founding; an eventually-ruined town stays hidden through its living centuries
 * (no living glyph to show) and its ruin glyph inks in at the fall year. The
 * chronicle strip still narrates the founding it cannot draw.
 */
export function glyphVisibleAt(mark: ScrubMark, year: number): boolean {
  const bakedState: PlaceState = mark.ruinYear !== null ? "ruin" : "living";
  return placeStateAt(mark, year) === bakedState;
}

/**
 * The ceremony a glyph plays as it appears (#155). A living town is STAMPED onto
 * the sheet at its founding; a ruin has no press to it, it darkens into the record
 * at its fall year. The Explorer maps these to inkStamp / dryingInk.
 */
export type InkGrade = "founding" | "ruin";

/**
 * Whether a mark's glyph crosses hidden -> shown between two painted years (#155):
 * the one frame that earns the ink-in. Derived from glyphVisibleAt, so it inherits
 * state-begins: a ruin's beat is its FALL year, since its living centuries draw
 * nothing. Three cases fall out and all three are wanted:
 *  - a park (fromYear === toYear) reveals nothing, so toggling the chronicle on and
 *    the #180 verso snap stay silent;
 *  - a backward scrub is never a reveal, so hiding stays a hard cut;
 *  - a fast sweep frame that skips whole centuries still catches every crossing.
 */
export function glyphRevealedBetween(mark: ScrubMark, fromYear: number, toYear: number): boolean {
  return !glyphVisibleAt(mark, fromYear) && glyphVisibleAt(mark, toYear);
}

/** Which grade a mark's glyph inks in at (#155). Its BAKED state, as in glyphVisibleAt. */
export function inkGradeFor(mark: ScrubMark): InkGrade {
  return mark.ruinYear !== null ? "ruin" : "founding";
}

/** Whether an event has happened by the current year (inclusive of its own year). */
export function eventIsPast(eventYear: number, year: number): boolean {
  return eventYear <= year;
}

/** The annals sweep runs this long for every world: uniform bar speed, no beats. */
export const SWEEP_MS = 7000;

/**
 * The year shown at a given elapsed time: linear from min to max over SWEEP_MS,
 * clamped at both ends (Alex's PR #311 pacing ruling, 2026-07-28).
 */
export function sweepYearAt(range: YearRange, elapsedMs: number): number {
  const f = Math.max(0, Math.min(1, elapsedMs / SWEEP_MS));
  return Math.round(range.min + f * (range.max - range.min));
}

/**
 * The elapsed time at which the sweep shows `year`: sweepYearAt's exact inverse
 * on whole years. #220's fused Play starts an ages-chamber resume here, since a
 * parked year is the only coordinate a park leaves behind.
 */
export function sweepElapsedAt(range: YearRange, year: number): number {
  const span = range.max - range.min;
  if (span <= 0) return year >= range.max ? SWEEP_MS : 0;
  const f = Math.max(0, Math.min(1, (year - range.min) / span));
  return f * SWEEP_MS;
}
