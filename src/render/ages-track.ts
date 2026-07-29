import type { YearRange } from "./chronicle-scrubber.ts";

/**
 * The fused instrument's track (#220): one bar, two chambers, a seam.
 *
 * Ratified 2026-07-28 (dated comment on #220): the survey occupies the LEFT half of
 * the bar and the ages the RIGHT half, an even 50/50 split; the seam between them is
 * a HARD DETENT for drags only (Play sweeps through); the readout inside the survey
 * half is a word, never a year. Bare `survey` rests at t=1, the completed track at
 * the seam edge (pinned at #192, 2026-07-26). This module is the pure math of that
 * ruling: bar position u in [0,1] to and from a chamber position, plus the detent's
 * capture/escape state machine. No DOM, no clock; the engine's ages driver owns both.
 */

/** The seam sits at the bar's midpoint: the ratified even 50/50 split. */
export const SEAM_U = 0.5;

/**
 * How far past the seam a drag must pull before the detent releases, in POINTER
 * pixels, converted to a bar fraction per drag by detentEscapeU below. Pixels rather
 * than a bar fraction because the same fraction is two different gestures on the two
 * real layouts (measured 2026-07-28 on the built site, table mirrored on the PR):
 * the desktop track runs 852px, where 28px is a deliberate but light pull, while a
 * 390px phone wraps the bar to a ~230px line, where a fractional pin tuned for the
 * desktop would collapse to under 8px, inside touch jitter. The MAX_U cap keeps a
 * very narrow track from walling off the chambers: the detent may never claim more
 * than 15 percent of the bar.
 */
export const DETENT_ESCAPE_PX = 28;
export const DETENT_ESCAPE_MAX_U = 0.15;

/** The escape band for a drag on a track of the given usable width in px. */
export function detentEscapeU(trackPx: number): number {
  return Math.min(DETENT_ESCAPE_PX / Math.max(1, trackPx), DETENT_ESCAPE_MAX_U);
}

export type Chamber = "survey" | "ages";

export type AgesPos =
  | { readonly chamber: "survey"; readonly t: number }
  | { readonly chamber: "ages"; readonly year: number };

/**
 * The chamber position at bar position u. The seam itself belongs to the SURVEY
 * chamber (t=1, the ratified bare-survey rest) unless `side` says the reading comes
 * from an ages-side gesture holding at the boundary.
 */
export function posAt(u: number, range: YearRange, side?: Chamber): AgesPos {
  const c = Math.max(0, Math.min(1, u));
  if (c < SEAM_U || (c === SEAM_U && side !== "ages")) {
    return { chamber: "survey", t: c / SEAM_U };
  }
  const span = range.max - range.min;
  if (span <= 0) return { chamber: "ages", year: range.min };
  const f = (c - SEAM_U) / (1 - SEAM_U);
  return { chamber: "ages", year: Math.round(range.min + f * span) };
}

/** The bar position of a chamber position: posAt's inverse, up to year rounding. */
export function uFor(pos: AgesPos, range: YearRange): number {
  if (pos.chamber === "survey") {
    return Math.max(0, Math.min(1, pos.t)) * SEAM_U;
  }
  const span = range.max - range.min;
  if (span <= 0) return 1;
  const f = Math.max(0, Math.min(1, (pos.year - range.min) / span));
  return SEAM_U + f * (1 - SEAM_U);
}

/**
 * The readout for a chamber position: a word inside the survey half (the segment is
 * the drawing of the chart, not a year), the year elsewhere, in the chronicle's
 * existing lowercase idiom.
 */
export function readoutFor(pos: AgesPos): string {
  return pos.chamber === "survey" ? "the survey" : `year ${pos.year}`;
}

/**
 * Where Play opens from a given position. At EITHER chamber's end rest (the present
 * park or the bare-survey rest) Play opens the whole story from the survey's first
 * leg: Alex's ruling on PR #311 (2026-07-28), superseding that PR's builder decision
 * to rewind per chamber, because arming parks at the present and Play there must
 * tell the whole ~20s story, not just replay the annals. Any interior position runs
 * forward from where it stands (ratified on #220).
 */
export function playStart(pos: AgesPos, range: YearRange): AgesPos {
  const atEnd = pos.chamber === "ages" ? pos.year >= range.max : pos.t >= 1;
  return atEnd ? { chamber: "survey", t: 0 } : pos;
}

export type DetentDrag = { readonly side: Chamber; readonly held: boolean };

/** A drag begins on whichever side of the seam the thumb rests (the seam is survey). */
export function detentStart(u: number): DetentDrag {
  return { side: u > SEAM_U ? "ages" : "survey", held: false };
}

/**
 * One drag sample through the detent, against the drag's escape band (the caller
 * derives it once per drag via detentEscapeU). A crossing that lands inside the band
 * holds the thumb at the seam; a pull beyond it (in one sample or many) releases to
 * the raw position and the drag changes sides. Play never consults this: the detent
 * governs drags only (ratified 2026-07-28).
 */
export function detentStep(drag: DetentDrag, uRaw: number, escapeU: number): { u: number; drag: DetentDrag } {
  const u = Math.max(0, Math.min(1, uRaw));
  const crossed = drag.side === "survey" ? u > SEAM_U : u < SEAM_U;
  if (!crossed) return { u, drag: { side: drag.side, held: false } };
  // The 1e-9 keeps the exact band edge an ESCAPE on both sides: 0.5 - band rounds a
  // hair under the band while 0.5 + band rounds a hair over it, and without the
  // tolerance the detent releases rightward but sticks leftward at the same pull.
  if (Math.abs(u - SEAM_U) < escapeU - 1e-9) {
    return { u: SEAM_U, drag: { side: drag.side, held: true } };
  }
  return { u, drag: { side: drag.side === "survey" ? "ages" : "survey", held: false } };
}
