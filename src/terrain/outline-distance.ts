import type { OutlineId } from "../world/outline-ids.ts";
import { OUTLINE_RINGS } from "./outlines.ts";

export type OutlineSegments = {
  readonly aspect: number;
  readonly ax: Float64Array;
  readonly ay: Float64Array;
  readonly bx: Float64Array;
  readonly by: Float64Array;
};

const THOUSANDTHS = 1000;

export function outlineSegments(id: OutlineId, aspect: number): OutlineSegments {
  const ax: number[] = [];
  const ay: number[] = [];
  const bx: number[] = [];
  const by: number[] = [];
  for (const ring of OUTLINE_RINGS[id]) {
    const n = ring.length / 2;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      ax.push(((ring[2 * i] as number) / THOUSANDTHS) * aspect);
      ay.push((ring[2 * i + 1] as number) / THOUSANDTHS);
      bx.push(((ring[2 * j] as number) / THOUSANDTHS) * aspect);
      by.push((ring[2 * j + 1] as number) / THOUSANDTHS);
    }
  }
  return {
    aspect,
    ax: Float64Array.from(ax),
    ay: Float64Array.from(ay),
    bx: Float64Array.from(bx),
    by: Float64Array.from(by),
  };
}

export function signedDistance(segs: OutlineSegments, u: number, v: number): number {
  const px = u * segs.aspect;
  const py = v;
  let best = Infinity;
  let inside = false;
  for (let i = 0; i < segs.ax.length; i++) {
    const ax = segs.ax[i] as number;
    const ay = segs.ay[i] as number;
    const bx = segs.bx[i] as number;
    const by = segs.by[i] as number;
    const dx = bx - ax;
    const dy = by - ay;
    const along = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
    const t = along < 0 ? 0 : along > 1 ? 1 : along;
    const qx = ax + t * dx - px;
    const qy = ay + t * dy - py;
    const d2 = qx * qx + qy * qy;
    if (d2 < best) best = d2;
    if (ay > py !== by > py && px < ((bx - ax) * (py - ay)) / (by - ay) + ax) inside = !inside;
  }
  const d = Math.sqrt(best);
  return inside ? -d : d;
}

export function outlineCoverage(id: OutlineId, gridW: number, gridH: number): number {
  const segs = outlineSegments(id, (gridW - 1) / (gridH - 1));
  let inside = 0;
  for (let y = 0; y < gridH; y++) {
    for (let x = 0; x < gridW; x++) {
      if (signedDistance(segs, x / (gridW - 1), y / (gridH - 1)) < 0) inside++;
    }
  }
  return inside / (gridW * gridH);
}
