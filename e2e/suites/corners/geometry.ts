// The corners sweep's arithmetic (Issue #638), kept out of the browser so a unit test can reach it: which pages, which widths, and what counts as two corners meeting.
import { readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

export type Box = { readonly x: number; readonly y: number; readonly r: number; readonly b: number; readonly t: string };
export type CornerRead = {
  readonly innerW: number;
  readonly clientW: number;
  readonly vw: number;
  readonly left: readonly Box[];
  readonly right: readonly Box[];
  readonly clusterBottom: number;
  readonly bandH: number | null;
};
export type Meeting = { readonly w: number; readonly h: number; readonly a: string; readonly b: string };

export function routesUnder(pagesDir: string): string[] {
  const routes: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const at = join(dir, entry.name);
      if (entry.isDirectory()) walk(at);
      else if (entry.name === "index.astro") {
        const rel = relative(pagesDir, dir).split(sep).filter(Boolean).join("/");
        routes.push(rel ? `/${rel}/` : "/");
      }
    }
  };
  walk(pagesDir);
  return routes.sort();
}

export function mediaEdges(conditions: readonly string[], above: number, upTo: number): number[] {
  const edges = new Set<number>();
  for (const text of conditions) {
    for (const m of text.matchAll(/\((max|min)-width:\s*(\d+(?:\.\d+)?)px\)/g)) {
      const n = Math.round(Number(m[2]));
      const pair = m[1] === "max" ? [n, n + 1] : [n - 1, n];
      for (const w of pair) if (w > above && w <= upTo) edges.add(w);
    }
  }
  return [...edges].sort((a, b) => b - a);
}

export function meetings(left: readonly Box[], right: readonly Box[]): Meeting[] {
  const out: Meeting[] = [];
  for (const a of left) for (const b of right) {
    const w = Math.min(a.r, b.r) - Math.max(a.x, b.x);
    const h = Math.min(a.b, b.b) - Math.max(a.y, b.y);
    if (w > 0 && h > 0) out.push({ w, h, a: a.t, b: b.t });
  }
  return out.sort((p, q) => q.w * q.h - p.w * p.h);
}

export function nearest(left: readonly Box[], right: readonly Box[]): number {
  let best = Infinity;
  for (const a of left) for (const b of right) {
    const dx = Math.max(a.x - b.r, b.x - a.r, 0);
    const dy = Math.max(a.y - b.b, b.y - a.b, 0);
    best = Math.min(best, Math.hypot(dx, dy));
  }
  return best;
}

const SHIFT_TOLERANCE = 0.05;
const same = (p: readonly Box[], q: readonly Box[], dx: number): boolean =>
  p.length === q.length && p.every((a, i) => {
    const b = q[i]!;
    return a.t === b.t && [a.x + dx - b.x, a.r + dx - b.r, a.y - b.y, a.b - b.b].every((d) => Math.abs(d) <= SHIFT_TOLERANCE);
  });

export function plainShift(wider: CornerRead, narrower: CornerRead): boolean {
  const dx = narrower.innerW - wider.innerW;
  return same(wider.left, narrower.left, 0) && same(wider.right, narrower.right, dx);
}

export function strideWidths(hi: number, lo: number, stride: number, edges: readonly number[]): number[] {
  const set = new Set<number>([hi, lo, ...edges.filter((w) => w <= hi && w >= lo)]);
  for (let w = hi - stride; w > lo; w -= stride) set.add(w);
  return [...set].sort((a, b) => b - a);
}
