// The engraver's primitives. Every function here is libm-free: straight strokes, quadratic curves and literal tables, so it could move into src/prospect/ as it stands.
import { el, type SvgNode } from "../../../src/render/svg.ts";
import type { Rng } from "../../../src/core/rng.ts";
import type { Dress } from "./dress.ts";

export type Pt = { readonly x: number; readonly y: number };
export const r1 = (v: number): number => Math.round(v * 10) / 10;
export const pt = (p: Pt): string => `${r1(p.x)} ${r1(p.y)}`;
export const poly = (pts: ReadonlyArray<Pt>, closed = true): string =>
  `M${pts.map(pt).join("L")}${closed ? "Z" : ""}`;

export function stroke(d: Dress, w: number, extra: Record<string, string | number> = {}): Record<string, string | number> {
  return { stroke: d.ink, "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round", ...extra };
}

/** Parallel hatching clipped to a polygon by scanline against lines y = m x + c (even-odd), no clipPath so many plates share one document. */
export function hatchPolygon(pts: ReadonlyArray<Pt>, slope: number, spacing: number, phase = 0): string {
  if (pts.length < 3) return "";
  const cs = pts.map((p) => p.y - slope * p.x);
  const cMin = Math.min(...cs), cMax = Math.max(...cs);
  const parts: string[] = [];
  for (let c = cMin + phase + spacing * 0.5; c < cMax; c += spacing) {
    const xs: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i]!, b = pts[(i + 1) % pts.length]!;
      const fa = a.y - slope * a.x - c, fb = b.y - slope * b.x - c;
      if ((fa > 0 && fb <= 0) || (fa <= 0 && fb > 0)) {
        const t = fa / (fa - fb);
        xs.push(a.x + (b.x - a.x) * t);
      }
    }
    xs.sort((p, q) => p - q);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const x0 = xs[i]!, x1 = xs[i + 1]!;
      if (x1 - x0 < 0.6) continue;
      parts.push(`M${r1(x0)} ${r1(slope * x0 + c)}L${r1(x1)} ${r1(slope * x1 + c)}`);
    }
  }
  return parts.join("");
}

export function hatchNode(d: Dress, pts: ReadonlyArray<Pt>, slope: number, spacing: number, w = 0.5, opacity = 1, phase = 0): SvgNode {
  return el("path", { d: hatchPolygon(pts, slope, spacing, phase), fill: "none", stroke: d.ink, "stroke-width": w, "stroke-opacity": opacity, "stroke-linecap": "butt" });
}

/** The burin sky: horizontal lines dense at the horizon and thinning upward, broken by cloud banks and, higher up, by gaps. */
export function skyLines(d: Dress, x0: number, x1: number, yTop: number, yHorizon: number, clouds: ReadonlyArray<{ x: number; y: number; w: number; h: number }>, rng: Rng): SvgNode[] {
  const parts: string[] = [];
  let y = yHorizon - 1.5;
  let gap = 1.5;
  while (y > yTop) {
    const segs: Array<[number, number]> = [];
    const breaks = gap > 3.2 ? 1 + Math.floor(rng.next() * 3) : 0;
    let sx = x0;
    for (let b = 0; b < breaks; b++) {
      const bx = x0 + ((b + 0.3 + rng.next() * 0.5) / (breaks + 0.2)) * (x1 - x0);
      segs.push([sx, bx - 6 - rng.next() * 30]);
      sx = bx + 6 + rng.next() * 30;
    }
    segs.push([sx, x1]);
    for (const c of clouds) {
      if (y < c.y - c.h || y > c.y + c.h * 0.35) continue;
      const half = c.w * 0.5 * (1 - ((y - c.y) * (y - c.y)) / (c.h * c.h));
      const a = c.x - half, b = c.x + half;
      for (let i = segs.length - 1; i >= 0; i--) {
        const [s0, s1] = segs[i]!;
        if (b <= s0 || a >= s1) continue;
        segs.splice(i, 1);
        if (a > s0 + 2) segs.push([s0, a]);
        if (b < s1 - 2) segs.push([b, s1]);
      }
    }
    for (const [s0, s1] of segs) {
      const jitter = (rng.next() - 0.5) * 0.4;
      parts.push(`M${r1(s0 + rng.next() * 3)} ${r1(y + jitter)}H${r1(s1 - rng.next() * 3)}`);
    }
    y -= gap;
    gap += 0.14 + rng.next() * 0.1;
  }
  const cloudNodes = clouds.map((c) => cloudBank(d, c.x, c.y, c.w, c.h, rng));
  return [
    el("path", { d: parts.join(""), fill: "none", stroke: d.ink, "stroke-width": 0.32, "stroke-opacity": 0.55, "stroke-linecap": "butt" }),
    ...cloudNodes,
  ];
}

/** A cloud bank as stacked hooked strokes along its underside and a scalloped crown, after Hispalis. */
export function cloudBank(d: Dress, cx: number, cy: number, w: number, h: number, rng: Rng): SvgNode {
  const parts: string[] = [];
  const lobes = Math.max(3, Math.round(w / 22));
  const lw = w / lobes;
  let x = cx - w / 2;
  let crown = `M${r1(x)} ${r1(cy)}`;
  for (let i = 0; i < lobes; i++) {
    const lh = h * (0.5 + rng.next() * 0.5) * (i === 0 || i === lobes - 1 ? 0.55 : 1);
    crown += `q${r1(lw * 0.5)} ${r1(-lh * 1.6)} ${r1(lw)} 0`;
    x += lw;
  }
  parts.push(crown);
  for (let i = 0; i < 4; i++) {
    const yy = cy + 1 + i * 1.6;
    const inset = 6 + i * 7 + rng.next() * 4;
    if (cx + w / 2 - inset <= cx - w / 2 + inset) break;
    parts.push(`M${r1(cx - w / 2 + inset)} ${r1(yy)}H${r1(cx + w / 2 - inset)}`);
  }
  for (let i = 0; i < lobes * 2; i++) {
    const hx = cx - w / 2 + 4 + rng.next() * (w - 8);
    const hy = cy - rng.next() * h * 0.7;
    parts.push(`M${r1(hx)} ${r1(hy)}q${r1(2 + rng.next() * 2)} ${r1(-1.4)} ${r1(4 + rng.next() * 3)} ${r1(0.6)}`);
  }
  return el("path", { d: parts.join(""), fill: "none", stroke: d.ink, "stroke-width": 0.4, "stroke-opacity": 0.7 });
}

/** Water as horizontal line work, denser toward the foreground, with white gaps left around hulls. */
export function waterLines(d: Dress, x0: number, x1: number, y0: number, y1: number, gaps: ReadonlyArray<{ x0: number; x1: number; y0: number; y1: number }>, rng: Rng): SvgNode {
  const parts: string[] = [];
  let y = y0 + 1.2;
  let step = 2.6;
  while (y < y1) {
    let segs: Array<[number, number]> = [[x0, x1]];
    for (const g of gaps) {
      if (y < g.y0 || y > g.y1) continue;
      const next: Array<[number, number]> = [];
      for (const [s0, s1] of segs) {
        if (g.x1 <= s0 || g.x0 >= s1) { next.push([s0, s1]); continue; }
        if (g.x0 > s0 + 1) next.push([s0, g.x0]);
        if (g.x1 < s1 - 1) next.push([g.x1, s1]);
      }
      segs = next;
    }
    for (const [s0, s1] of segs) {
      let x = s0 + rng.next() * 6;
      while (x < s1) {
        const len = 14 + rng.next() * 40;
        const e = Math.min(s1, x + len);
        parts.push(`M${r1(x)} ${r1(y)}H${r1(e)}`);
        x = e + 2 + rng.next() * 6;
      }
    }
    y += step;
    step = Math.max(1.5, step - 0.06);
  }
  return el("path", { d: parts.join(""), fill: "none", stroke: d.ink, "stroke-width": 0.38, "stroke-opacity": 0.72, "stroke-linecap": "butt" });
}

/** A hill as a tonal mass: the shadow side hatched along the fall, a crossing set on the steepest face, the lit side left with sparse dots. */
export function hillTone(d: Dress, outline: ReadonlyArray<Pt>, horizon: number, lightFromLeft: boolean, rng: Rng): SvgNode[] {
  const out: SvgNode[] = [];
  const fill = d.coloured ? d.wash.hill : d.paper;
  out.push(el("path", { d: poly(outline), fill, ...stroke(d, 0.9) }));
  let apex = outline[0]!;
  for (const p of outline) if (p.y < apex.y) apex = p;
  const shadow = outline.filter((p) => (lightFromLeft ? p.x >= apex.x - 2 : p.x <= apex.x + 2));
  const shadowPoly = [...shadow, { x: lightFromLeft ? outline[outline.length - 1]!.x : outline[0]!.x, y: horizon }, { x: apex.x, y: horizon }];
  const slope = lightFromLeft ? 0.9 : -0.9;
  out.push(hatchNode(d, shadowPoly, slope, 3.0, 0.42, 0.6));
  const steep = shadowPoly.map((p) => ({ x: apex.x + (p.x - apex.x) * 0.45, y: p.y + (horizon - p.y) * 0.1 }));
  out.push(hatchNode(d, steep, lightFromLeft ? 2.2 : -2.2, 3.6, 0.38, 0.5));
  const dots: string[] = [];
  for (let i = 0; i < 40; i++) {
    const x = outline[0]!.x + rng.next() * (outline[outline.length - 1]!.x - outline[0]!.x);
    const yTop = yOnPolyline(outline, x);
    const y = yTop + rng.next() * Math.max(1, (horizon - yTop) * 0.8);
    const lit = lightFromLeft ? x < apex.x : x > apex.x;
    if (!lit) continue;
    dots.push(`M${r1(x)} ${r1(y)}l0.8 0.3`);
  }
  out.push(el("path", { d: dots.join(""), fill: "none", stroke: d.ink, "stroke-width": 0.5, "stroke-opacity": 0.6 }));
  return out;
}

export function yOnPolyline(line: ReadonlyArray<Pt>, x: number): number {
  if (x <= line[0]!.x) return line[0]!.y;
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1]!, b = line[i]!;
    if (x <= b.x) return a.y + ((b.y - a.y) * (x - a.x)) / (b.x - a.x || 1);
  }
  return line[line.length - 1]!.y;
}

/** Hoefnagel's tree: a scalloped crown, the shadow half hatched, a short trunk. s is the crown radius. */
export function treeClump(d: Dress, x: number, y: number, s: number, rng: Rng, species: "round" | "pine" | "palm" = "round"): SvgNode[] {
  const fill = d.coloured ? d.wash.wood : d.paper;
  if (species === "pine") {
    const h = s * 2.6;
    const tri = [{ x: x - s * 0.8, y }, { x, y: y - h }, { x: x + s * 0.8, y }];
    return [
      el("path", { d: `M${r1(x)} ${r1(y + s * 0.6)}V${r1(y)}`, fill: "none", ...stroke(d, 0.8) }),
      el("path", { d: poly(tri), fill, ...stroke(d, 0.8) }),
      hatchNode(d, [{ x, y: y - h }, { x: x + s * 0.8, y }, { x, y }], -2.4, 1.6, 0.4),
    ];
  }
  if (species === "palm") {
    const fr: string[] = [];
    for (const [dx, dy] of [[-1, -0.3], [-0.7, -0.9], [0.1, -1.1], [0.8, -0.8], [1, -0.2]] as const) {
      fr.push(`M${r1(x)} ${r1(y - s * 2.2)}q${r1(dx * s * 0.8)} ${r1(dy * s * 1.1)} ${r1(dx * s * 1.6)} ${r1(dy * s * 1.1 + s * 0.5)}`);
    }
    return [
      el("path", { d: `M${r1(x)} ${r1(y)}q${r1(s * 0.3)} ${r1(-s * 1.2)} ${r1(s * 0.15)} ${r1(-s * 2.2)}`, fill: "none", ...stroke(d, 0.9) }),
      el("path", { d: fr.join(""), fill: "none", ...stroke(d, 0.7) }),
    ];
  }
  const lobes = 6;
  const ring: Pt[] = [];
  const cy = y - s * 1.35;
  const TAB = [[1, 0], [0.5, -0.866], [-0.5, -0.866], [-1, 0], [-0.5, 0.866], [0.5, 0.866]] as const;
  for (let i = 0; i < lobes; i++) {
    const [cx, sy] = TAB[i]!;
    const rr = s * (0.9 + rng.next() * 0.25);
    ring.push({ x: x + cx * rr, y: cy + sy * rr * 0.9 });
  }
  let crown = `M${pt(ring[0]!)}`;
  for (let i = 0; i < lobes; i++) {
    const a = ring[i]!, b = ring[(i + 1) % lobes]!;
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const ox = (mx - x) * 0.45, oy = (my - cy) * 0.45;
    crown += `Q${r1(mx + ox)} ${r1(my + oy)} ${pt(b)}`;
  }
  crown += "Z";
  const shade = ring.filter((p) => p.x >= x - 1).concat([{ x, y: cy + s * 0.9 }, { x, y: cy - s * 0.9 }]);
  return [
    el("path", { d: `M${r1(x)} ${r1(y)}V${r1(cy + s * 0.5)}M${r1(x - s * 0.5)} ${r1(y)}q${r1(s * 0.5)} ${r1(-s * 0.2)} ${r1(s)} 0`, fill: "none", ...stroke(d, 0.9) }),
    el("path", { d: crown, fill, ...stroke(d, 0.8) }),
    hatchNode(d, shade, 1.4, 1.7, 0.4, 0.8),
    el("path", { d: `M${r1(x - s * 0.1)} ${r1(cy + s * 0.2)}q${r1(s * 0.4)} ${r1(-s * 0.5)} ${r1(s * 0.3)} ${r1(-s * 0.9)}M${r1(x + s * 0.1)} ${r1(cy + s * 0.5)}q${r1(s * 0.5)} ${r1(-s * 0.3)} ${r1(s * 0.5)} ${r1(-s * 0.7)}`, fill: "none", ...stroke(d, 0.45) }),
  ];
}

/** Ground hatching that follows a slope: long sweeps parallel to the fall line, with a scatter of grass hooks. */
export function groundSweep(d: Dress, outline: ReadonlyArray<Pt>, slope: number, spacing: number, rng: Rng, hooks = 30): SvgNode[] {
  const out: SvgNode[] = [hatchNode(d, outline, slope, spacing, 0.4, 0.6)];
  const xs = outline.map((p) => p.x), ys = outline.map((p) => p.y);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const parts: string[] = [];
  for (let i = 0; i < hooks; i++) {
    const x = x0 + rng.next() * (x1 - x0), y = y0 + rng.next() * (y1 - y0);
    if (!inside(outline, x, y)) continue;
    parts.push(`M${r1(x)} ${r1(y)}q1 -2.2 2.4 -1.4M${r1(x + 1)} ${r1(y)}q0.6 -1.6 1.8 -1.2`);
  }
  out.push(el("path", { d: parts.join(""), fill: "none", stroke: d.ink, "stroke-width": 0.5, "stroke-opacity": 0.8 }));
  return out;
}

export function inside(pts: ReadonlyArray<Pt>, x: number, y: number): boolean {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i]!, b = pts[j]!;
    if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) c = !c;
  }
  return c;
}

export function birdFlock(d: Dress, x: number, y: number, n: number, rng: Rng): SvgNode {
  const parts: string[] = [];
  for (let i = 0; i < n; i++) {
    const bx = x + i * 5 + rng.next() * 4, by = y + (i % 2) * 2 + rng.next() * 3;
    const s = 0.5 + rng.next() * 0.3;
    parts.push(`M${r1(bx - 3 * s)} ${r1(by)}q${r1(1.5 * s)} ${r1(-2 * s)} ${r1(3 * s)} ${r1(-0.4 * s)}q${r1(1.5 * s)} ${r1(-1.6 * s)} ${r1(3 * s)} ${r1(0.4 * s)}`);
  }
  return el("path", { d: parts.join(""), fill: "none", ...stroke(d, 0.6) });
}
