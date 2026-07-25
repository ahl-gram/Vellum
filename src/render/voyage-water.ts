import type { Pt } from "../core/rdp.ts";

/**
 * The water span of a sea leg (#181). A sea leg's raw chain is
 * [fromPort, ...open water..., toPort]: the ports are LAND, so the mark rides an
 * overland stub before it embarks and after it lands. #120 drew the whole leg as a
 * ship; on the rare sea leg whose port sits genuinely inland (re-measured 2026-07-24
 * under #275's travel-ordered round trip: 8 of 237 sea legs over seeds 1..40, on seeds
 * 2, 12, 15, 21, 33, 35 and 39, with stubs of 8.9 to 48 cells against a coastal maximum
 * of 3) that ship marches far over dry land.
 *
 * This module finds WHERE the water is, as arc-length FRACTIONS of the drawn
 * (RDP-simplified) polyline, so the overlay can swap rider <-> ship at the water's
 * edge by comparing its per-frame leg fraction against the span. Fractions survive
 * projection because the grid -> pixel transform is uniform (transform.ts: one scale
 * for both axes); an absolute distance would not.
 */

export type WaterSpan = { readonly from: number; readonly to: number };

/**
 * A stub of at least this many grid cells marks the leg as a genuine inland handoff,
 * which is what earns the margin log's ride-sail-ride narrative (#181, ratified
 * 2026-07-24). Re-measured over seeds 1..40 under #275's travel-ordered round trip:
 * every coastal-shortcut stub is <= 3 cells (COAST_EMBARK_MAX gates them to 3 straight)
 * and the genuine inland stubs start at 8.94, so 4 sits in the clear gap between.
 *
 * INVARIANT: 4 is only correct while that gap stays open, and the two ends of the gap are
 * guarded very differently (#185, 2026-07-25).
 *
 * The LOWER end is STRUCTURAL. A sea leg's raw chain is [port, launch, ...open water...],
 * so `stubFrom` below is exactly the chord `embarksNearShore` bounds by COAST_EMBARK_MAX.
 * While COAST_EMBARK_MAX stays under INLAND_STUB_CELLS a coastal shortcut CANNOT reach
 * this threshold. That is one cell of margin, and it is exact rather than comfortable:
 * swept to 4, the leanest handoff over seeds 1..40 lands at precisely 4.00 cells, which
 * is a coastal shortcut wearing the ride-sail-ride prose.
 *
 * The UPPER end is MEASURED ONLY. 8.94 is where genuine inland stubs happen to start on
 * these seeds; nothing enforces it. Any itinerary change owes a re-measure of THAT end
 * (the #184 and #275 reorders moved it from 10 to 8.94).
 */
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

/** Arc length between two chain indices, summed cell to cell (the raw walk, no RDP). */
function chainArc(chain: ReadonlyArray<number>, a: number, b: number, gridW: number): number {
  let d = 0;
  for (let i = a + 1; i <= b; i++) {
    const p = cellPt(chain[i - 1]!, gridW);
    const q = cellPt(chain[i]!, gridW);
    d += Math.hypot(q.x - p.x, q.y - p.y);
  }
  return d;
}

/**
 * The arc distance along `points` of the point nearest to `target`. RDP keeps the
 * drawn polyline within RDP_EPSILON of the raw chain, so projecting a chain cell onto
 * the drawn line lands within that tolerance of where the mark actually passes it;
 * this is what lets the span be exact WITHOUT re-adding vertices to the drawn
 * geometry (which #181 must leave byte-identical for coastal crossings).
 */
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

/**
 * Locate a sea leg's water span. `chain` is the raw deduped cell walk, `drawn` its
 * RDP-simplified polyline (a vertex SUBSET of the chain), `isSea` the survey's water
 * test, `gridW` the grid width that decodes cell ids. Returns the span as fractions
 * of the drawn polyline's arc length plus whether either overland stub is long
 * enough to count as a genuine inland handoff.
 *
 * A chain with no water, or a degenerate span (a single sea cell projecting to a
 * zero-width window), returns no span at all: the overlay then keeps #120's
 * whole-leg ship rather than inventing an edge that is not there.
 */
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
