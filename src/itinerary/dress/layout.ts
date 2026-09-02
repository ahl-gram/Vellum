import type { RibbonInput, RibbonSample } from "../input.ts";

export const RIBBON_W = 1060;
export const RIBBON_H = 740;
export const RIBBON_MARGIN = 26;
export const TITLE_BAND = 96;
export const STRIP_GAP = 14;
export const STRIP_PAD = 16;
const MAX_STRIP_W = 176;
const LEAGUES_PER_STRIP = 16;

export type StripPoint = { readonly sx: number; readonly sy: number; readonly dist: number };

export type StripLayout = {
  readonly index: number;
  readonly x0: number;
  readonly y0: number;
  readonly w: number;
  readonly h: number;
  readonly d0: number;
  readonly d1: number;
  readonly needleDeg: number;
  readonly pts: ReadonlyArray<StripPoint>;
  readonly samples: ReadonlyArray<RibbonSample>;
  readonly lean: number;
  readonly pxPerCell: number;
};

export type RibbonLayout = {
  readonly strips: ReadonlyArray<StripLayout>;
  readonly pxPerCell: number;
};

function chordOf(samples: ReadonlyArray<RibbonSample>): { x: number; y: number } {
  const a = samples[0] as RibbonSample;
  const b = samples[samples.length - 1] as RibbonSample;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
}

export function stripPos(strip: StripLayout, dist: number): { sx: number; sy: number } {
  const pts = strip.pts;
  if (pts.length === 0) return { sx: strip.x0 + strip.w / 2, sy: strip.y0 + strip.h / 2 };
  let lo = pts[0] as StripPoint;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i] as StripPoint;
    if (p.dist <= dist) {
      lo = p;
      continue;
    }
    const span = p.dist - lo.dist || 1;
    const t = (dist - lo.dist) / span;
    return { sx: lo.sx + (p.sx - lo.sx) * t, sy: lo.sy + (p.sy - lo.sy) * t };
  }
  return { sx: lo.sx, sy: lo.sy };
}

// [d0, d1) is the strips' own event filter (strip.ts eventNodes), so a distance no strip holds, a crossing at the road's very end past the arrival, is one the plate does not draw and has no seat.
export function stripFor(layout: RibbonLayout, dist: number): StripLayout | null {
  return layout.strips.find((s) => dist >= s.d0 && dist < s.d1) ?? null;
}

export function eventSeat(layout: RibbonLayout, dist: number): { sx: number; sy: number } | null {
  const strip = stripFor(layout, dist);
  return strip === null ? null : stripPos(strip, dist);
}

export function layoutRibbon(input: RibbonInput): RibbonLayout {
  const total = input.totalCells;
  const n = Math.min(7, Math.max(3, Math.ceil(input.totalLeagues / LEAGUES_PER_STRIP)));
  const innerW = RIBBON_W - RIBBON_MARGIN * 2;
  const stripW = Math.min(MAX_STRIP_W, Math.floor((innerW - STRIP_GAP * (n - 1)) / n));
  const blockW = stripW * n + STRIP_GAP * (n - 1);
  const left = RIBBON_MARGIN + (innerW - blockW) / 2;
  const y0 = RIBBON_MARGIN + TITLE_BAND;
  const h = RIBBON_H - RIBBON_MARGIN - y0;
  const cellsPer = total / n;
  const pxPerCell = (h - STRIP_PAD * 2) / cellsPer;
  const latScale = Math.min(pxPerCell * 0.55, 9);
  const latMax = stripW / 2 - 34;

  const strips: StripLayout[] = [];
  const overlap = Math.min(0.75, STRIP_PAD / pxPerCell);
  for (let s = 0; s < n; s++) {
    const d0 = cellsPer * s;
    const d1 = cellsPer * (s + 1);
    const inRange = input.samples.filter((p) => p.dist >= d0 - overlap && p.dist <= d1 + overlap);
    const chord = chordOf(inRange.length >= 2 ? inRange : input.samples);
    const x0 = left + s * (stripW + STRIP_GAP);
    const xc = x0 + stripW / 2;
    const origin = (inRange[0] ?? input.samples[0]) as RibbonSample;
    const pts: StripPoint[] = inRange.map((p) => {
      const perp = chord.x * (p.y - origin.y) - chord.y * (p.x - origin.x);
      const lat = Math.max(-latMax, Math.min(latMax, perp * latScale));
      return {
        sx: xc + lat,
        sy: y0 + h - STRIP_PAD - (p.dist - d0) * pxPerCell,
        dist: p.dist,
      };
    });
    const lean = pts.length === 0 ? 0 : pts.reduce((a, p) => a + p.sx - xc, 0) / pts.length;
    strips.push({
      index: s,
      x0,
      y0,
      w: stripW,
      h,
      d0,
      d1,
      needleDeg: (Math.atan2(-chord.x, -chord.y) * 180) / Math.PI,
      pts,
      samples: inRange,
      lean,
      pxPerCell,
    });
  }
  return { strips, pxPerCell };
}
