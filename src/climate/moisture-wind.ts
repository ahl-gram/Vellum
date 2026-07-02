import type { Field } from "../core/grid.ts";
import { clamp } from "../core/math.ts";

/**
 * Wind-driven orographic moisture (#74). For every cell, sample the upwind
 * fetch and integrate an air parcel downwind toward it: sea recharges the
 * parcel's supply toward a cap, flat land rains out a base fraction each
 * step, and climbing terrain rains out extra in proportion to the along-wind
 * elevation gain. The returned value is the rain deposited at the cell,
 * normalized so a flat windward coast reads solidly wet and strong orographic
 * lift saturates toward 1. Leeward of a range the supply is spent: rain shadow.
 *
 * Off-grid upwind is treated as open sea (offGridSea) so edge-touching
 * continent and citystate maps read maritime at the upwind edge, not
 * artificially arid. That rule is only true at the world border, which the
 * heightfield forces to deep water; a regional crop cut from a world's
 * interior must NOT inherit a phantom ocean, so windowed calls pass
 * offGridSea=false and the fetch clamps to the border cell's terrain instead.
 * Steps are local grid hops, the same convention as the river-distance term.
 * Pure and seedless: same heightfield + wind, same field.
 */

const STEPS = 40;
const SUPPLY_START = 0.8;
const SUPPLY_CAP = 1;
const SEA_RECHARGE = 0.22;
const RAINOUT_BASE = 0.035;
const OROG_GAIN = 2.0;
const RATE_MAX = 0.35;
/** A flat coast one step off a saturated sea maps to 1/HEADROOM. */
const HEADROOM = 1.6;
const COAST_RAIN = SUPPLY_CAP * RAINOUT_BASE * HEADROOM;

export function computeWindMoisture(
  elev: Field,
  seaLevel: number,
  windDir: number,
  offGridSea = true,
): Float64Array {
  const { w, h, data } = elev;

  let maxElev = -Infinity;
  for (const v of data) if (v > maxElev) maxElev = v;
  const elevSpan = Math.max(1e-9, maxElev - seaLevel);

  // the wind blows toward (cos, sin); the fetch lies the other way
  const ux = -Math.cos(windDir);
  const uy = -Math.sin(windDir);

  const out = new Float64Array(w * h);
  const path = new Float64Array(STEPS + 1); // [0] = target … [STEPS] = horizon
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      for (let j = 0; j <= STEPS; j++) {
        const sx = Math.round(x + ux * j);
        const sy = Math.round(y + uy * j);
        if (sx >= 0 && sx < w && sy >= 0 && sy < h) {
          path[j] = data[sx + sy * w] as number;
        } else if (offGridSea) {
          path[j] = seaLevel - 1;
        } else {
          const cx = Math.min(w - 1, Math.max(0, sx));
          const cy = Math.min(h - 1, Math.max(0, sy));
          path[j] = data[cx + cy * w] as number;
        }
      }

      // the parcel rides at sea level over water, so a shore cell climbs
      // from the waterline, never from the sea floor
      let supply = SUPPLY_START;
      for (let j = STEPS - 1; j >= 1; j--) {
        const e = path[j] as number;
        if (e <= seaLevel) {
          supply += (SUPPLY_CAP - supply) * SEA_RECHARGE;
        } else {
          const from = Math.max(path[j + 1] as number, seaLevel);
          const climb = Math.max(0, e - from) / elevSpan;
          const rate = Math.min(RATE_MAX, RAINOUT_BASE + OROG_GAIN * climb);
          supply -= supply * rate;
        }
      }

      const e0 = path[0] as number;
      if (e0 <= seaLevel) {
        supply += (SUPPLY_CAP - supply) * SEA_RECHARGE;
        out[x + y * w] = clamp((supply * RAINOUT_BASE) / COAST_RAIN, 0, 1);
      } else {
        const from = Math.max(path[1] as number, seaLevel);
        const climb = Math.max(0, e0 - from) / elevSpan;
        const rate = Math.min(RATE_MAX, RAINOUT_BASE + OROG_GAIN * climb);
        out[x + y * w] = clamp((supply * rate) / COAST_RAIN, 0, 1);
      }
    }
  }
  return out;
}
