import { outlineSegments, signedDistance } from "../src/terrain/outline-distance.ts";
import type { OutlineId } from "../src/world/outline-ids.ts";

export function insideMask(id: OutlineId, w: number, h: number): Uint8Array {
  const segs = outlineSegments(id, (w - 1) / (h - 1));
  const mask = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) mask[x + y * w] = signedDistance(segs, x / (w - 1), y / (h - 1)) < 0 ? 1 : 0;
  }
  return mask;
}
