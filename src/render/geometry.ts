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

/** Approximate rendered text box for collision tests. */
export function textBox(
  x: number,
  y: number,
  text: string,
  fontSize: number,
  anchor: "start" | "middle" | "end",
): Box {
  const w = text.length * fontSize * 0.56;
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
