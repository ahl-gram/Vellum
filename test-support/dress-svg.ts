// String-level SVG probes shared by the prospect dress and finished-plate tests: assertions are on the exact emitted bytes, not a parsed DOM.

import type { MapStyle } from "../src/render/style.ts";
import type { Tincture } from "../src/society/heraldry.ts";
import { paletteForStyle } from "../src/render/layers/heraldry.ts";

const TINCTURES: ReadonlyArray<Tincture> = ["or", "argent", "gules", "azure", "sable", "vert", "purpure"];

/** The tokens the dress may draw from: the style's inks and papers, its limner's washes, and the heraldic palette the realm's clothes are cut from; deliberately NOT the whole style object: realmTints are excluded so a hard-coded grey that happens to equal a tint still fails. */
export function tokenColors(s: MapStyle): Set<string> {
  const palette = paletteForStyle(s);
  return new Set(
    [
      s.paper,
      s.ink,
      s.inkSoft,
      s.ocean,
      s.waterline,
      s.coastStroke,
      s.land,
      ...Object.values(s.limner ?? {}),
      ...TINCTURES.map((t) => palette.tincture(t)),
    ].map((c) => c.toLowerCase()),
  );
}

export function fnv1a(s: string): number {
  let h = 0x811c9dc5 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

export function attrsOf(elem: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of elem.matchAll(/([a-zA-Z-]+)="([^"]*)"/g)) {
    out[m[1]!] = m[2]!;
  }
  return out;
}

export function outlinedSolids(svg: string): string[] {
  const out: string[] = [];
  for (const m of svg.matchAll(/<path\b[^>]*>/g)) {
    const a = attrsOf(m[0]);
    if (a.d !== undefined && a.fill !== undefined && a.fill !== "none" && a.stroke !== undefined) out.push(a.d);
  }
  return out.sort();
}

export type Extent = { readonly x0: number; readonly x1: number; readonly y0: number; readonly y1: number };

const STEP: Readonly<Record<string, number>> = { m: 2, l: 2, h: 1, v: 1, q: 4, c: 6, z: 0 };

function pathPoints(d: string): Array<readonly [number, number]> {
  const out: Array<readonly [number, number]> = [];
  let cx = 0,
    cy = 0,
    sx = 0,
    sy = 0;
  const one = (k: string, rel: boolean, v: ReadonlyArray<number>, first: boolean): void => {
    if (k === "h") cx = rel ? cx + (v[0] ?? 0) : (v[0] ?? 0);
    else if (k === "v") cy = rel ? cy + (v[0] ?? 0) : (v[0] ?? 0);
    else {
      for (let j = 0; j + 2 < v.length; j += 2)
        out.push([rel ? cx + (v[j] ?? 0) : (v[j] ?? 0), rel ? cy + (v[j + 1] ?? 0) : (v[j + 1] ?? 0)]);
      cx = rel ? cx + (v[v.length - 2] ?? 0) : (v[v.length - 2] ?? 0);
      cy = rel ? cy + (v[v.length - 1] ?? 0) : (v[v.length - 1] ?? 0);
    }
    out.push([cx, cy]);
    if (k === "m" && first) [sx, sy] = [cx, cy];
  };
  for (const c of d.matchAll(/([MLHVQCZmlhvqcz])([^MLHVQCZmlhvqcz]*)/g)) {
    const cmd = c[1] ?? "z";
    const k = cmd.toLowerCase();
    const step = STEP[k] ?? 0;
    const n = [...(c[2] ?? "").matchAll(/-?\d*\.?\d+(?:e-?\d+)?/g)].map((v) => Number(v[0]));
    if (step === 0) [cx, cy] = [sx, sy];
    for (let i = 0; step > 0 && i + step <= n.length; i += step) one(k, cmd === k, n.slice(i, i + step), i === 0);
  }
  return out;
}

/** The box every path vertex, curve control point and rect corner in an untransformed fragment reaches: an upper bound on its ink less the stroke, since a curve lies inside its control hull. */
export function inkExtent(svg: string): Extent {
  const pts: Array<readonly [number, number]> = [];
  for (const m of svg.matchAll(/<rect\b[^>]*>/g)) {
    const a = attrsOf(m[0]);
    const x = Number(a.x ?? 0);
    const y = Number(a.y ?? 0);
    pts.push([x, y], [x + Number(a.width ?? 0), y + Number(a.height ?? 0)]);
  }
  for (const m of svg.matchAll(/<path\b[^>]*\bd="([^"]*)"/g)) pts.push(...pathPoints(m[1] ?? ""));
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}
