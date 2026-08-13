import type { Field } from "../core/grid.ts";
import { clamp } from "../core/math.ts";

const STEPS = 40;
const SUPPLY_START = 0.8;
const SUPPLY_CAP = 1;
const SEA_RECHARGE = 0.22;
const RAINOUT_BASE = 0.035;
const OROG_GAIN = 2.0;
const RATE_MAX = 0.35;
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
