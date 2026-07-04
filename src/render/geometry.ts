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

/** Text box widened for letter-spacing, centered on (x, y). */
export function spacedTextBox(
  x: number,
  y: number,
  text: string,
  fontSize: number,
  letterSpacing: number,
): Box {
  const w = text.length * (fontSize * 0.56 + letterSpacing);
  return { x: x - w / 2, y: y - fontSize, w, h: fontSize * 1.2 };
}
