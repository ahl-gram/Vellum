import type { Pt } from "../core/rdp.ts";

/**
 * The water span of a sea leg (#181). A sea leg's raw chain is
 * [fromPort, ...open water..., toPort]: the ports are LAND, so the mark rides an
 * overland stub before it embarks and after it lands. #120 drew the whole leg as a
 * ship; on the rare crossing whose port sits genuinely inland (measured 2026-07-24
 * under the #184 travel order: 5 of 51 crossings, stubs of 10 to 48 cells, every
 * coastal stub under 4) that ship marches far over dry land.
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
 * 2026-07-24). Measured over seeds 1..40 under the #184 travel order: every
 * coastal-shortcut stub is <= 3.5 cells (COAST_EMBARK_MAX gates them to 3 straight)
 * and the genuine inland stubs start at 10, so 4 sits in the clear gap between.
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
