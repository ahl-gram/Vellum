import type { OutlineId } from "../world/outline-ids.ts";
import type { Rings } from "./outline-codec.ts";
import { ringsOf, sourceGeneration } from "./outline-store.ts";

export type OutlineSegments = {
  readonly aspect: number;
  readonly ax: Float64Array;
  readonly ay: Float64Array;
  readonly bx: Float64Array;
  readonly by: Float64Array;
  readonly near: ReadonlyArray<Int32Array>;
  readonly rows: ReadonlyArray<Int32Array>;
};

type Segments = Omit<OutlineSegments, "near" | "rows">;

const THOUSANDTHS = 1000;
const BUCKETS = 64;
const SIZE = 1 / BUCKETS;
const SLACK = 1e-9;

function segmentsOf(rings: Rings, aspect: number): Segments {
  const ax: number[] = [];
  const ay: number[] = [];
  const bx: number[] = [];
  const by: number[] = [];
  for (const ring of rings) {
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

function distance2(s: Segments, i: number, px: number, py: number): number {
  const ax = s.ax[i] as number;
  const ay = s.ay[i] as number;
  const bx = s.bx[i] as number;
  const by = s.by[i] as number;
  const dx = bx - ax;
  const dy = by - ay;
  const along = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
  const t = along < 0 ? 0 : along > 1 ? 1 : along;
  const qx = ax + t * dx - px;
  const qy = ay + t * dy - py;
  return qx * qx + qy * qy;
}

function columnsOf(aspect: number): number {
  return Math.ceil(BUCKETS * aspect);
}

function nearList(s: Segments, x0: number, y0: number): Int32Array {
  let upper = Infinity;
  for (let i = 0; i < s.ax.length; i++)
    upper = Math.min(upper, Math.sqrt(distance2(s, i, x0 + SIZE / 2, y0 + SIZE / 2)) + (SIZE * Math.SQRT2) / 2);
  upper = upper * (1 + SLACK) + SLACK;
  const list: number[] = [];
  for (let i = 0; i < s.ax.length; i++) {
    const gx = Math.max(
      0,
      Math.min(s.ax[i] as number, s.bx[i] as number) - (x0 + SIZE),
      x0 - Math.max(s.ax[i] as number, s.bx[i] as number),
    );
    const gy = Math.max(
      0,
      Math.min(s.ay[i] as number, s.by[i] as number) - (y0 + SIZE),
      y0 - Math.max(s.ay[i] as number, s.by[i] as number),
    );
    if (Math.sqrt(gx * gx + gy * gy) * (1 - SLACK) <= upper) list.push(i);
  }
  return Int32Array.from(list);
}

function rowLists(s: Segments): Int32Array[] {
  const rows: number[][] = Array.from({ length: BUCKETS }, () => []);
  for (let i = 0; i < s.ax.length; i++) {
    const lo = Math.max(0, Math.floor(Math.min(s.ay[i] as number, s.by[i] as number) / SIZE));
    const hi = Math.min(BUCKETS - 1, Math.floor(Math.max(s.ay[i] as number, s.by[i] as number) / SIZE));
    for (let r = lo; r <= hi; r++) (rows[r] as number[]).push(i);
  }
  return rows.map((list) => Int32Array.from(list));
}

let memo: { readonly key: string; readonly segs: OutlineSegments } | null = null;

export function outlineSegments(id: OutlineId, aspect: number): OutlineSegments {
  const key = `${id}|${aspect}|${sourceGeneration()}`;
  if (memo !== null && memo.key === key) return memo.segs;
  const plain = segmentsOf(ringsOf(id), aspect);
  const near: Int32Array[] = [];
  for (let r = 0; r < BUCKETS; r++)
    for (let c = 0; c < columnsOf(aspect); c++) near.push(nearList(plain, c * SIZE, r * SIZE));
  const segs = { ...plain, near, rows: rowLists(plain) };
  memo = { key, segs };
  return segs;
}

export function signedDistance(segs: OutlineSegments, u: number, v: number): number {
  const px = u * segs.aspect;
  const py = v;
  const r = Math.floor(py / SIZE);
  const c = Math.floor(px / SIZE);
  const cols = columnsOf(segs.aspect);
  let best = Infinity;
  if (r >= 0 && r < BUCKETS && c >= 0 && c < cols) {
    for (const i of segs.near[r * cols + c] as Int32Array) {
      const d2 = distance2(segs, i, px, py);
      if (d2 < best) best = d2;
    }
  } else {
    for (let i = 0; i < segs.ax.length; i++) {
      const d2 = distance2(segs, i, px, py);
      if (d2 < best) best = d2;
    }
  }
  let inside = false;
  if (r >= 0 && r < BUCKETS) {
    for (const i of segs.rows[r] as Int32Array) {
      const ax = segs.ax[i] as number;
      const ay = segs.ay[i] as number;
      const bx = segs.bx[i] as number;
      const by = segs.by[i] as number;
      if (ay > py !== by > py && px < ((bx - ax) * (py - ay)) / (by - ay) + ax) inside = !inside;
    }
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
