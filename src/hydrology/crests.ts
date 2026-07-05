import { quantile, type Field } from "../core/grid.ts";
import { computeBasins, watershedDivides } from "./basins.ts";
import type { FlowResult } from "./flow.ts";

// A basin must hold this fraction of the land to seed a divide, or the thousands of
// coastal micro-basins would make every ridge one. This -- not the elevation gate --
// is what selects "large" ranges (continental-scale drainages). Shared with the
// value #80 used for the retired border snap.
const MAJOR_BASIN_FRACTION = 0.03;

// #141 LOOSE elevation gate: keep a divide cell only where it stands in the top half
// of land elevation (median and up). Its job is just to drop divides that wander a
// genuinely flat plain, protecting low-relief worlds; it does NOT try to select only
// the biggest ranges (the spike found nearly every divide already sits on high
// ground). The payoff is ridge-threading, not a single bold spine -- see issue #141.
const CREST_ELEV_QUANTILE = 0.5;

/**
 * Elevation-gate a watershed-divide mask: keep only divide cells at or above the
 * `q` quantile of land elevation. A landless field has no threshold to clear, so it
 * yields an empty mask. Pure and deterministic.
 */
export function gateDivideElevation(
  divides: Uint8Array,
  elev: Field,
  seaLevel: number,
  q: number,
): Uint8Array {
  const { data } = elev;
  const threshold = landElevationQuantile(data, seaLevel, q);
  const out = new Uint8Array(divides.length);
  for (let i = 0; i < divides.length; i++) {
    if (divides[i] === 1 && (data[i] as number) >= threshold) out[i] = 1;
  }
  return out;
}

/**
 * Large mountain crests as a hard-frontier mask (#141): the watershed divides
 * between major drainage basins, gated to the high-terrain half so a low ridge
 * across a plain is excluded. Unioned with the major-river mask, these are the
 * barrier the realm flood cannot cross. Recomputes basins from the flow field, so
 * it works unchanged on the windowed region sub-grids.
 */
export function mountainCrests(elev: Field, flow: FlowResult, seaLevel: number): Uint8Array {
  const { w, h } = elev;
  const basins = computeBasins(elev, flow, seaLevel);
  const divides = watershedDivides(basins, w, h, MAJOR_BASIN_FRACTION);
  return gateDivideElevation(divides, elev, seaLevel, CREST_ELEV_QUANTILE);
}

/** The `q` quantile of land-cell elevations; +Infinity when there is no land. */
function landElevationQuantile(
  data: Float64Array,
  seaLevel: number,
  q: number,
): number {
  const land: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const v = data[i] as number;
    if (v > seaLevel) land.push(v);
  }
  if (land.length === 0) return Infinity;
  return quantile(land, q);
}
