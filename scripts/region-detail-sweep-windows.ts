import { lodWindowFor, type LodBand } from "../src/world/lod.ts";
import type { UvWindow } from "../src/terrain/heightfield.ts";

export function bandWindows(band: LodBand): UvWindow[] {
  const n = Math.round(1 / band.sizeUV);
  const out: UvWindow[] = [];
  for (let iy = 0; iy < n; iy++) {
    for (let ix = 0; ix < n; ix++) {
      out.push(lodWindowFor((ix + 0.5) * band.sizeUV, (iy + 0.5) * band.sizeUV, band.sizeUV));
    }
  }
  return out;
}
