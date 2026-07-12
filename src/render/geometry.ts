/** Geometry helpers for layer rendering: pruning, centroids, label boxes. */

export type Pt = { readonly x: number; readonly y: number };

/**
 * Greedy blue-noise pruning: walk candidates in their given (priority)
 * order, accept any point at least `minDist` from all accepted so far.
 */
export function prunePoints<T extends Pt>(
  candidates: ReadonlyArray<T>,
  minDist: number,
  cap: number,
): T[] {
  const accepted: T[] = [];
  const d2 = minDist * minDist;
  for (const c of candidates) {
    if (accepted.length >= cap) break;
    let ok = true;
    for (const a of accepted) {
      const dx = a.x - c.x;
      const dy = a.y - c.y;
      if (dx * dx + dy * dy < d2) {
        ok = false;
        break;
      }
    }
    if (ok) accepted.push(c);
  }
  return accepted;
}

export function centroidOf(points: ReadonlyArray<Pt>): Pt {
  let sx = 0;
  let sy = 0;
  for (const p of points) {
    sx += p.x;
    sy += p.y;
  }
  const n = Math.max(1, points.length);
  return { x: sx / n, y: sy / n };
}

/** Principal axis angle (radians) of a point cloud, for label rotation. */
export function principalAngle(points: ReadonlyArray<Pt>): number {
  if (points.length < 2) return 0;
  const c = centroidOf(points);
  let xx = 0;
  let xy = 0;
  let yy = 0;
  for (const p of points) {
    const dx = p.x - c.x;
    const dy = p.y - c.y;
    xx += dx * dx;
    xy += dx * dy;
    yy += dy * dy;
  }
  return 0.5 * Math.atan2(2 * xy, xx - yy);
}

export type Box = {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
};

export function boxesOverlap(a: Box, b: Box, pad = 0): boolean {
  return (
    a.x - pad < b.x + b.w &&
    a.x + a.w + pad > b.x &&
    a.y - pad < b.y + b.h &&
    a.y + a.h + pad > b.y
  );
}

/** Approximate rendered text box for collision tests. `widthFactor` and
 *  `letterSpacing` default to the mixed-case, un-spaced case, so existing callers
 *  are byte-identical; a label drawn `.toUpperCase()` (and spaced) must pass caps
 *  width and its letter-spacing or it reserves ~20% less than it draws (#195). */
export function textBox(
  x: number,
  y: number,
  text: string,
  fontSize: number,
  anchor: "start" | "middle" | "end",
  widthFactor = 0.56,
  letterSpacing = 0,
): Box {
  const w = text.length * (fontSize * widthFactor + letterSpacing);
  const h = fontSize * 1.15;
  const left = anchor === "start" ? x : anchor === "end" ? x - w : x - w / 2;
  return { x: left, y: y - fontSize, w, h };
}

/**
 * Average glyph width as a fraction of the font size (#175). Capitals run wider
 * than mixed case, so a label that renders `.toUpperCase()` must be measured with
 * `caps` or it reserves about 20% less space than it draws, and two labels can
 * both claim successfully while their glyphs collide. Defined once, here.
 */
export const WIDTH_FACTOR = {
  /** Sea and forest names: drawn as written, italic. */
  mixed: 0.56,
  /** Realm and mountain-range names: drawn `.toUpperCase()`. */
  caps: 0.72,
} as const;

/** Text box widened for letter-spacing, centered on (x, y). */
export function spacedTextBox(
  x: number,
  y: number,
  text: string,
  fontSize: number,
  letterSpacing: number,
  widthFactor: number = WIDTH_FACTOR.mixed,
): Box {
  const w = text.length * (fontSize * widthFactor + letterSpacing);
  return { x: x - w / 2, y: y - fontSize, w, h: fontSize * 1.2 };
}

/**
 * A rotated label's footprint, as a chain of axis-aligned boxes hugging the ink
 * (#175). The arena stores axis-aligned boxes, so a spun label cannot reserve its
 * true oriented rectangle. One bounding box of the whole rotation over-reserves
 * badly (a 296x17 run at 32 degrees bounds to 260x171, ten times too tall) and
 * would push the label off the chart entirely; slicing along the baseline first
 * keeps each slice's bounding box close to the ink it covers.
 */
export function rotatedSpanBoxes(
  box: Box,
  degrees: number,
  originX: number,
  originY: number,
  segments = 6,
): Box[] {
  const a = (degrees * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const spin = (px: number, py: number) => {
    const dx = px - originX;
    const dy = py - originY;
    return { x: originX + dx * cos - dy * sin, y: originY + dx * sin + dy * cos };
  };

  const out: Box[] = [];
  const step = box.w / segments;
  for (let i = 0; i < segments; i++) {
    const x0 = box.x + i * step;
    const x1 = x0 + step;
    const corners = [spin(x0, box.y), spin(x1, box.y), spin(x1, box.y + box.h), spin(x0, box.y + box.h)];
    const xs = corners.map((p) => p.x);
    const ys = corners.map((p) => p.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    out.push({ x: minX, y: minY, w: Math.max(...xs) - minX, h: Math.max(...ys) - minY });
  }
  return out;
}

/** The four corners of `box` rotated `degrees` about (originX, originY): the TRUE
 *  oriented footprint of a spun label, for an area-based overlap test that the
 *  axis-aligned slices only approximate. */
export function rotatedRect(box: Box, degrees: number, originX: number, originY: number): Pt[] {
  const a = (degrees * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const spin = (px: number, py: number): Pt => ({
    x: originX + (px - originX) * cos - (py - originY) * sin,
    y: originY + (px - originX) * sin + (py - originY) * cos,
  });
  return [spin(box.x, box.y), spin(box.x + box.w, box.y), spin(box.x + box.w, box.y + box.h), spin(box.x, box.y + box.h)];
}

function shoelaceArea(pts: ReadonlyArray<Pt>): number {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i]!;
    const b = pts[(i + 1) % pts.length]!;
    s += a.x * b.y - b.x * a.y;
  }
  return Math.abs(s) / 2;
}

/**
 * Area shared by a convex polygon and an axis-aligned box, as a fraction of the
 * SMALLER of the two areas (0..1). Sutherland-Hodgman clip of `poly` against the
 * box's four edges (both convex, so the clip is their exact intersection). Used to
 * ask "does this rotated river name bury that label" by real ink area, not by the
 * fat bounding slices, so a few-percent graze reads as the near-miss it is (#178).
 */
export function polyBoxOverlapFraction(poly: ReadonlyArray<Pt>, box: Box): number {
  const x0 = box.x, x1 = box.x + box.w, y0 = box.y, y1 = box.y + box.h;
  const lerp = (a: Pt, b: Pt, t: number): Pt => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  const edges: Array<{ inside: (p: Pt) => boolean; cut: (a: Pt, b: Pt) => Pt }> = [
    { inside: (p) => p.x >= x0, cut: (a, b) => lerp(a, b, (x0 - a.x) / (b.x - a.x)) },
    { inside: (p) => p.x <= x1, cut: (a, b) => lerp(a, b, (x1 - a.x) / (b.x - a.x)) },
    { inside: (p) => p.y >= y0, cut: (a, b) => lerp(a, b, (y0 - a.y) / (b.y - a.y)) },
    { inside: (p) => p.y <= y1, cut: (a, b) => lerp(a, b, (y1 - a.y) / (b.y - a.y)) },
  ];
  let pts: Pt[] = poly.map((p) => ({ x: p.x, y: p.y }));
  for (const e of edges) {
    if (pts.length === 0) break;
    const next: Pt[] = [];
    for (let i = 0; i < pts.length; i++) {
      const A = pts[i]!;
      const B = pts[(i + 1) % pts.length]!;
      const aIn = e.inside(A);
      const bIn = e.inside(B);
      if (aIn) next.push(A);
      if (aIn !== bIn) next.push(e.cut(A, B));
    }
    pts = next;
  }
  if (pts.length < 3) return 0;
  const inter = shoelaceArea(pts);
  return inter / Math.max(1e-9, Math.min(shoelaceArea(poly), box.w * box.h));
}
