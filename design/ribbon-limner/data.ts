import { readFileSync } from "node:fs";

export type Pt = readonly [number, number, number];
export type Sample = { dist: number; rel: number; relL: number; relR: number; bl: string; br: string };
export type Strip = {
  index: number; x0: number; y0: number; w: number; h: number; d0: number; d1: number;
  needleDeg: number; lean: number; pxPerCell: number; pts: Pt[]; samples: Sample[];
};
export type Ev = {
  kind: "waypoint" | "crossing" | "branch" | "summit"; dist: number; caption: string; tierTag: string | null;
  strip: number | null; sx: number | null; sy: number | null; leagues: number;
  name?: string; tier?: "capital" | "town" | "village" | "hamlet"; endpoint?: boolean; side?: -1 | 1; major?: boolean;
};
export type Ribbon = {
  seed: number; cellsPerLeague: number; title: { title: string; subtitle: string[] }; worldName: string; year: number;
  realm: string | null; realmFrom: string | null; realmTo: string | null; from: string; to: string; leagues: number;
  totalCells: number; strips: Strip[]; events: Ev[];
};

export const RIBBON_W = 1060;
export const RIBBON_H = 740;
export const MARGIN = 26;

export function loadRibbon(seed: number): Ribbon {
  return JSON.parse(readFileSync(new URL(`ribbon-${seed}.json`, import.meta.url), "utf8")) as Ribbon;
}

export function armsInner(file: string): string | null {
  try {
    const svg = readFileSync(new URL(file, import.meta.url), "utf8");
    return /<svg[^>]*>([\s\S]*)<\/svg>/.exec(svg)?.[1] ?? null;
  } catch {
    return null;
  }
}

export const r1 = (v: number): number => Math.round(v * 10) / 10;

export function stripPos(s: Strip, dist: number): { sx: number; sy: number } {
  const pts = s.pts;
  let lo = pts[0]!;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i]!;
    if (p[2] <= dist) { lo = p; continue; }
    const span = p[2] - lo[2] || 1;
    const t = (dist - lo[2]) / span;
    return { sx: lo[0] + (p[0] - lo[0]) * t, sy: lo[1] + (p[1] - lo[1]) * t };
  }
  return { sx: lo[0], sy: lo[1] };
}

export function offsetPath(pts: Pt[], off: number, reverse = false): string {
  const seq = reverse ? [...pts].reverse() : pts;
  let d = "";
  for (let i = 0; i < seq.length; i++) {
    const a = seq[Math.max(0, i - 1)]!;
    const b = seq[Math.min(seq.length - 1, i + 1)]!;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const x = seq[i]![0] + (-dy / len) * off;
    const y = seq[i]![1] + (dx / len) * off;
    d += `${i === 0 ? "M" : "L"}${r1(x)} ${r1(y)}`;
  }
  return d;
}

export function roadAngleDeg(s: Strip, dist: number): number {
  const a = stripPos(s, dist - 1.1);
  const b = stripPos(s, dist + 1.1);
  return (Math.atan2(b.sy - a.sy, b.sx - a.sx) * 180) / Math.PI;
}
