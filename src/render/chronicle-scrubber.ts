import type { PlaceMark } from "./place-manifest.ts";
import type { HistoricalEvent } from "../society/history.ts";

/**
 * The pure core of the Chronicle year-scrubber (#54, the closing sub of the
 * Living Chart epic #51). It turns the #52 manifest into the data a year-slider
 * and a Play sweep need: each place's founding and abandonment years, and a
 * deterministic timeline that DWELLS on years carrying chronicle events.
 *
 * No DOM, no RNG. The slider, layer hide/restore, and the requestAnimationFrame
 * loop live in docs/explorer/app.js and are covered by the Explorer e2e.
 *
 * Play is EVENT-PROPORTIONAL: a deliberate override (the user's call) of the
 * issue's "fixed linear sweep" decision. The sweep skims empty centuries and
 * pauses on each event so the chronicle's beats land.
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

export type SweepSegment =
  | { readonly type: "travel"; readonly fromYear: number; readonly toYear: number; readonly ms: number }
  | { readonly type: "dwell"; readonly year: number; readonly ms: number };

export type SweepPlan = {
  readonly segments: ReadonlyArray<SweepSegment>;
  readonly totalMs: number;
};

export type SweepOptions = {
  readonly travelMs?: number;
  readonly dwellMs?: number;
  readonly maxTotalMs?: number;
};

const DEFAULTS = { travelMs: 350, dwellMs: 650, maxTotalMs: 7000 } as const;

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

/** Whether an event has happened by the current year (inclusive of its own year). */
export function eventIsPast(eventYear: number, year: number): boolean {
  return eventYear <= year;
}

/**
 * The Play timeline: travel quickly between event years, dwell on each. Distinct
 * event years are clamped into [min, max] and sorted; each becomes a dwell, with
 * a short travel filling the gaps. The raw run is scaled DOWN to `maxTotalMs` for
 * event-dense worlds so the animation never drags, while keeping each beat's
 * relative emphasis.
 */
export function buildSweepPlan(
  range: YearRange,
  eventYears: ReadonlyArray<number>,
  opts: SweepOptions = {},
): SweepPlan {
  const travelMs = opts.travelMs ?? DEFAULTS.travelMs;
  const dwellMs = opts.dwellMs ?? DEFAULTS.dwellMs;
  const maxTotalMs = opts.maxTotalMs ?? DEFAULTS.maxTotalMs;

  const beats = Array.from(
    new Set(
      eventYears
        .map((y) => Math.max(range.min, Math.min(range.max, y)))
        .filter((y) => Number.isFinite(y)),
    ),
  ).sort((a, b) => a - b);

  const raw: SweepSegment[] = [];
  let prev = range.min;
  for (const b of beats) {
    if (b > prev) {
      raw.push({ type: "travel", fromYear: prev, toYear: b, ms: travelMs });
      prev = b;
    }
    raw.push({ type: "dwell", year: b, ms: dwellMs });
  }
  if (prev < range.max) raw.push({ type: "travel", fromYear: prev, toYear: range.max, ms: travelMs });
  if (raw.length === 0) raw.push({ type: "travel", fromYear: range.min, toYear: range.max, ms: travelMs });

  const rawTotal = raw.reduce((sum, s) => sum + s.ms, 0);
  if (rawTotal <= maxTotalMs) return { segments: raw, totalMs: rawTotal };

  const scale = maxTotalMs / rawTotal;
  const segments = raw.map((s) => ({ ...s, ms: s.ms * scale }));
  return { segments, totalMs: maxTotalMs };
}

const segStart = (s: SweepSegment): number => (s.type === "travel" ? s.fromYear : s.year);
const segEnd = (s: SweepSegment): number => (s.type === "travel" ? s.toYear : s.year);

/** The year shown at a given elapsed time, interpolating across travels. */
export function sweepYearAt(plan: SweepPlan, elapsedMs: number): number {
  const segs = plan.segments;
  if (segs.length === 0) return 0;
  if (elapsedMs <= 0) return segStart(segs[0]!);
  if (elapsedMs >= plan.totalMs) return segEnd(segs[segs.length - 1]!);

  let acc = 0;
  for (const s of segs) {
    if (elapsedMs < acc + s.ms) {
      if (s.type === "dwell") return s.year;
      const t = (elapsedMs - acc) / s.ms;
      return Math.round(s.fromYear + (s.toYear - s.fromYear) * t);
    }
    acc += s.ms;
  }
  return segEnd(segs[segs.length - 1]!);
}
