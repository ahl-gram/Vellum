// Issue #793 round: plane geometry for the planner, libm-free (Math through EXACT_MATH only, no **), so it ports under vellum/prospect-libm-clock-free.
import type { PlanPoint } from "./types.ts";

export type P = PlanPoint;

export const dist = (a: P, b: P): number => {
  const dx = a.x - b.x,
    dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export function unit(dx: number, dy: number): P | null {
  const len = Math.sqrt(dx * dx + dy * dy);
  return len < 1e-12 ? null : { x: dx / len, y: dy / len };
}

// The diamond angle: a monotone stand-in for the angle of (dx, dy) in [0, 4), no trig.
export function pseudoAngle(dx: number, dy: number): number {
  const s = Math.abs(dx) + Math.abs(dy);
  if (s === 0) return 0;
  const p = dy / s;
  return dx >= 0 ? (dy >= 0 ? p : 4 + p) : 2 - p;
}

export function nearestOnSegment(p: P, a: P, b: P): { readonly at: P; readonly t: number; readonly d: number } {
  const vx = b.x - a.x,
    vy = b.y - a.y;
  const len2 = vx * vx + vy * vy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.y - a.y) * vy) / len2));
  const at = { x: a.x + vx * t, y: a.y + vy * t };
  return { at, t, d: dist(p, at) };
}

export function distanceToPolyline(p: P, line: ReadonlyArray<P>, closed = false): number {
  let best = Infinity;
  const n = line.length;
  if (n === 1) return dist(p, line[0]!);
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const d = nearestOnSegment(p, line[i]!, line[(i + 1) % n]!).d;
    if (d < best) best = d;
  }
  return best;
}

export function nearestOnPolyline(p: P, line: ReadonlyArray<P>): P {
  let best = { at: line[0]!, d: Infinity };
  for (let i = 0; i + 1 < line.length; i++) {
    const hit = nearestOnSegment(p, line[i]!, line[i + 1]!);
    if (hit.d < best.d) best = { at: hit.at, d: hit.d };
  }
  return best.at;
}

// Proper crossings of segment ab with segment cd; t along ab, u along cd, each in [0, 1).
export function segmentCross(a: P, b: P, c: P, d: P): { readonly at: P; readonly t: number; readonly u: number } | null {
  const rx = b.x - a.x,
    ry = b.y - a.y,
    sx = d.x - c.x,
    sy = d.y - c.y;
  const den = rx * sy - ry * sx;
  if (Math.abs(den) < 1e-12) return null;
  const qx = c.x - a.x,
    qy = c.y - a.y;
  const t = (qx * sy - qy * sx) / den;
  const u = (qx * ry - qy * rx) / den;
  if (t < 0 || t >= 1 || u < 0 || u >= 1) return null;
  return { at: { x: a.x + rx * t, y: a.y + ry * t }, t, u };
}

// Every crossing of an open polyline with a closed ring, in the polyline's own order.
export function lineRingCrossings(line: ReadonlyArray<P>, ring: ReadonlyArray<P>): Array<{ readonly at: P; readonly seg: number; readonly t: number }> {
  const out: Array<{ at: P; seg: number; t: number }> = [];
  const n = ring.length;
  for (let i = 0; i + 1 < line.length; i++) {
    const hits: Array<{ at: P; seg: number; t: number }> = [];
    for (let j = 0; j < n; j++) {
      const x = segmentCross(line[i]!, line[i + 1]!, ring[j]!, ring[(j + 1) % n]!);
      if (x) hits.push({ at: x.at, seg: i, t: x.t });
    }
    hits.sort((p, q) => p.t - q.t);
    out.push(...hits);
  }
  return out;
}

export function lineLineCrossings(a: ReadonlyArray<P>, b: ReadonlyArray<P>): P[] {
  const out: P[] = [];
  for (let i = 0; i + 1 < a.length; i++)
    for (let j = 0; j + 1 < b.length; j++) {
      const x = segmentCross(a[i]!, a[i + 1]!, b[j]!, b[j + 1]!);
      if (x) out.push(x.at);
    }
  return out;
}

export function insideRing(p: P, ring: ReadonlyArray<P>): boolean {
  let c = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i]!,
      b = ring[j]!;
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) c = !c;
  }
  return c;
}

export function ringArea(ring: ReadonlyArray<P>): number {
  let s = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) s += ring[j]!.x * ring[i]!.y - ring[i]!.x * ring[j]!.y;
  return s / 2;
}

export function chaikin(ring: ReadonlyArray<P>, closed: boolean): P[] {
  const n = ring.length;
  if (n < 3) return [...ring];
  const out: P[] = closed ? [] : [ring[0]!];
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const a = ring[i]!,
      b = ring[(i + 1) % n]!;
    out.push({ x: a.x * 0.75 + b.x * 0.25, y: a.y * 0.75 + b.y * 0.25 });
    out.push({ x: a.x * 0.25 + b.x * 0.75, y: a.y * 0.25 + b.y * 0.75 });
  }
  if (!closed) out.push(ring[n - 1]!);
  return out;
}

function dpOpen(pts: ReadonlyArray<P>, eps: number): P[] {
  if (pts.length < 3) return [...pts];
  const keep = new Array<boolean>(pts.length).fill(false);
  keep[0] = true;
  keep[pts.length - 1] = true;
  const stack: Array<[number, number]> = [[0, pts.length - 1]];
  while (stack.length > 0) {
    const [i, j] = stack.pop()!;
    let best = -1,
      at = -1;
    for (let k = i + 1; k < j; k++) {
      const d = nearestOnSegment(pts[k]!, pts[i]!, pts[j]!).d;
      if (d > best) {
        best = d;
        at = k;
      }
    }
    if (at >= 0 && best > eps) {
      keep[at] = true;
      stack.push([i, at], [at, j]);
    }
  }
  return pts.filter((_, k) => keep[k]);
}

export function simplify(pts: ReadonlyArray<P>, eps: number, closed: boolean): P[] {
  if (!closed) return dpOpen(pts, eps);
  if (pts.length < 4) return [...pts];
  let far = 0,
    best = -1;
  for (let k = 1; k < pts.length; k++) {
    const d = dist(pts[0]!, pts[k]!);
    if (d > best) {
      best = d;
      far = k;
    }
  }
  const a = dpOpen(pts.slice(0, far + 1), eps);
  const b = dpOpen([...pts.slice(far), pts[0]!], eps);
  return [...a.slice(0, -1), ...b.slice(0, -1)];
}

export function polylineLength(pts: ReadonlyArray<P>): number {
  let s = 0;
  for (let i = 1; i < pts.length; i++) s += dist(pts[i - 1]!, pts[i]!);
  return s;
}

export const q3 = (v: number): number => Math.round(v * 1000) / 1000;
export const q3p = (p: P): P => ({ x: q3(p.x), y: q3(p.y) });
