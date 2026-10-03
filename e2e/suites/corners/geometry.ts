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
export type Row = { readonly w: number; readonly read: CornerRead };
export type Meeting = { readonly w: number; readonly h: number; readonly a: string; readonly b: string };
export type Rules = { readonly forcedBelow: number | null; readonly keepsMotto: boolean };

export const MOTTO = "an atelier of imaginary";

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

const FLIP: Readonly<Record<string, string>> = { "<=": ">=", "<": ">", ">=": "<=", ">": "<" };
const COMPARISONS: readonly { readonly re: RegExp; readonly read: (m: RegExpMatchArray) => [string, number] }[] = [
  { re: /\((max|min)-width:\s*(\d+(?:\.\d+)?)px\)/g, read: (m) => [m[1] === "max" ? "<=" : ">=", Number(m[2])] },
  { re: /width\s*(<=|<|>=|>)\s*(\d+(?:\.\d+)?)px/g, read: (m) => [m[1]!, Number(m[2])] },
  { re: /(\d+(?:\.\d+)?)px\s*(<=|<|>=|>)\s*width/g, read: (m) => [FLIP[m[2]!]!, Number(m[1])] },
];

function sides(op: string, n: number): [number, number] {
  if (op === "<=" || op === ">") return [Math.floor(n), Math.floor(n) + 1];
  return [Math.ceil(n) - 1, Math.ceil(n)];
}

export function mediaEdges(conditions: readonly string[], above: number, upTo: number): number[] {
  const edges = new Set<number>();
  for (const text of conditions) {
    for (const { re, read } of COMPARISONS) {
      for (const m of text.matchAll(re)) for (const w of sides(...read(m))) if (w > above && w <= upTo) edges.add(w);
    }
  }
  return [...edges].sort((a, b) => b - a);
}

export function unreadWidthConditions(conditions: readonly string[]): string[] {
  return conditions.filter((text) => COMPARISONS.reduce((rest, { re }) => rest.replace(re, ""), text).includes("width"));
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

export function fillBetween(wider: Row, narrower: Row): number[] {
  if (wider.w - narrower.w <= 1 || plainShift(wider.read, narrower.read)) return [];
  return Array.from({ length: wider.w - narrower.w - 1 }, (_, i) => wider.w - 1 - i);
}

export function strideWidths(hi: number, lo: number, stride: number, edges: readonly number[]): number[] {
  const set = new Set<number>([hi, lo, ...edges.filter((w) => w <= hi && w >= lo)]);
  for (let w = hi - stride; w > lo; w -= stride) set.add(w);
  return [...set].sort((a, b) => b - a);
}

export function verdict({ w, read }: Row, rules: Rules): string | null {
  if (rules.forcedBelow !== null && w < rules.forcedBelow) {
    return read.innerW !== w ? null : `lays out at ${w} now, so Issue #672 has landed and its skip below ${rules.forcedBelow} goes`;
  }
  if (read.innerW !== w) return `laid out at ${read.innerW}, not ${w}`;
  if (read.left.length < 2 || read.right.length < 1) return `at ${w} the read found ${read.left.length} cluster and ${read.right.length} corner inks`;
  if (rules.keepsMotto && !read.left.some((b) => b.t.startsWith(MOTTO))) return `at ${w} the motto is gone from a page that keeps it`;
  const [m] = meetings(read.left, read.right);
  if (m) return `at ${w} "${m.a}" meets "${m.b}" by ${m.w.toFixed(1)} x ${m.h.toFixed(1)}`;
  if (read.bandH !== null && read.clusterBottom > read.bandH) return `at ${w} the cluster ends at ${read.clusterBottom}, past the band's ${read.bandH}`;
  return null;
}

const CONTROL = /^(input|button|select|textarea)[#.]/;

export function squeezed(rows: readonly Row[]): string[] {
  const widest = new Map<string, number>();
  for (const { read } of rows) for (const b of read.right) if (CONTROL.test(b.t)) widest.set(b.t, Math.max(widest.get(b.t) ?? 0, b.r - b.x));
  const faults: string[] = [];
  for (const { w, read } of rows) for (const b of read.right) {
    const most = widest.get(b.t);
    if (most !== undefined && b.r - b.x < most - 0.5) faults.push(`at ${w} the corner's ${b.t} is squeezed to ${(b.r - b.x).toFixed(1)} from ${most.toFixed(1)}`);
  }
  return faults;
}
