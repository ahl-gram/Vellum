import type { Pt } from "../core/rdp.ts";

/** Water span as arc-length FRACTIONS of the drawn polyline. Fractions survive projection only because the grid to pixel transform is uniform (transform.ts, one scale for both axes); an absolute distance would not. */

export type WaterSpan = { readonly from: number; readonly to: number };

/** Genuine inland-handoff threshold, in grid cells; the upper end is MEASURED ONLY (genuine stubs start near 8.9 over seeds 1..40), so any itinerary change owes a re-measure. */
export const INLAND_STUB_CELLS = 4;

export type WaterSpanResult = {
  readonly water: WaterSpan | null;
  readonly inlandHandoff: boolean;
};

const NO_SPAN: WaterSpanResult = { water: null, inlandHandoff: false };

function cellPt(cell: number, gridW: number): Pt {
  return { x: cell % gridW, y: (cell / gridW) | 0 };
}

function polylineLength(points: ReadonlyArray<Pt>): number {
  let d = 0;
  for (let i = 1; i < points.length; i++) {
    d += Math.hypot(points[i]!.x - points[i - 1]!.x, points[i]!.y - points[i - 1]!.y);
  }
  return d;
}

function chainArc(chain: ReadonlyArray<number>, a: number, b: number, gridW: number): number {
  let d = 0;
  for (let i = a + 1; i <= b; i++) {
    const p = cellPt(chain[i - 1]!, gridW);
    const q = cellPt(chain[i]!, gridW);
    d += Math.hypot(q.x - p.x, q.y - p.y);
  }
  return d;
}

/** Arc distance along points of the point nearest target; exact within RDP_EPSILON without re-adding vertices to the drawn geometry, which must stay byte-identical. */
function arcAlong(points: ReadonlyArray<Pt>, target: Pt): number {
  let bestDist = Infinity;
  let bestArc = 0;
  let acc = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!;
    const b = points[i]!;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((target.x - a.x) * dx + (target.y - a.y) * dy) / len2));
    const d = Math.hypot(target.x - (a.x + t * dx), target.y - (a.y + t * dy));
    if (d < bestDist - 1e-9) {
      bestDist = d;
      bestArc = acc + t * Math.sqrt(len2);
    }
    acc += Math.sqrt(len2);
  }
  return bestArc;
}

export function waterSpanOf(
  chain: ReadonlyArray<number>,
  drawn: ReadonlyArray<Pt>,
  isSea: (cell: number) => boolean,
  gridW: number,
): WaterSpanResult {
  let first = -1;
  let last = -1;
  for (let i = 0; i < chain.length; i++) {
    if (isSea(chain[i]!)) {
      if (first < 0) first = i;
      last = i;
    }
  }
  if (first < 0 || drawn.length < 2) return NO_SPAN;
  const total = polylineLength(drawn);
  if (total === 0) return NO_SPAN;

  const from = arcAlong(drawn, cellPt(chain[first]!, gridW)) / total;
  const to = arcAlong(drawn, cellPt(chain[last]!, gridW)) / total;
  if (!(to > from)) return NO_SPAN;

  // The stubs are measured on the RAW chain, where the port-to-launch jump is exact.
  const stubFrom = chainArc(chain, 0, first, gridW);
  const stubTo = chainArc(chain, last, chain.length - 1, gridW);
  return {
    water: { from, to },
    inlandHandoff: stubFrom >= INLAND_STUB_CELLS || stubTo >= INLAND_STUB_CELLS,
  };
}
