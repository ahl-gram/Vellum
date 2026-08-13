import type { YearRange } from "./chronicle-scrubber.ts";

export const SEAM_U = 0.5;

export const DETENT_ESCAPE_PX = 28;
export const DETENT_ESCAPE_MAX_U = 0.15;

export function detentEscapeU(trackPx: number): number {
  return Math.min(DETENT_ESCAPE_PX / Math.max(1, trackPx), DETENT_ESCAPE_MAX_U);
}

export type Chamber = "survey" | "ages";

export type AgesPos =
  | { readonly chamber: "survey"; readonly t: number }
  | { readonly chamber: "ages"; readonly year: number };

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

export function uFor(pos: AgesPos, range: YearRange): number {
  if (pos.chamber === "survey") {
    return Math.max(0, Math.min(1, pos.t)) * SEAM_U;
  }
  const span = range.max - range.min;
  if (span <= 0) return 1;
  const f = Math.max(0, Math.min(1, (pos.year - range.min) / span));
  return SEAM_U + f * (1 - SEAM_U);
}

export function readoutFor(pos: AgesPos): string {
  return pos.chamber === "survey" ? "the survey" : `year ${pos.year}`;
}

export function playStart(pos: AgesPos, range: YearRange): AgesPos {
  const atEnd = pos.chamber === "ages" ? pos.year >= range.max : pos.t >= 1;
  return atEnd ? { chamber: "survey", t: 0 } : pos;
}

export type DetentDrag = { readonly side: Chamber; readonly held: boolean };

export function detentStart(u: number): DetentDrag {
  return { side: u > SEAM_U ? "ages" : "survey", held: false };
}

export function detentStep(drag: DetentDrag, uRaw: number, escapeU: number): { u: number; drag: DetentDrag } {
  const u = Math.max(0, Math.min(1, uRaw));
  const crossed = drag.side === "survey" ? u > SEAM_U : u < SEAM_U;
  if (!crossed) return { u, drag: { side: drag.side, held: false } };
  // The 1e-9 keeps the exact band edge an ESCAPE on both sides; without it the detent releases rightward but sticks leftward at the same pull.
  if (Math.abs(u - SEAM_U) < escapeU - 1e-9) {
    return { u: SEAM_U, drag: { side: drag.side, held: true } };
  }
  return { u, drag: { side: drag.side === "survey" ? "ages" : "survey", held: false } };
}
