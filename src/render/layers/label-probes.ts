import type { Pt } from "../geometry.ts";
import type { Projection } from "../transform.ts";

const MAX_INTERIOR_PROBES = 240;

export function interiorProbes(
  blob: ReadonlyArray<number>,
  gridW: number,
  proj: Projection,
  centroid: Pt,
): Pt[] {
  const scored = blob.map((i) => {
    const x = proj.px(i % gridW);
    const y = proj.py((i / gridW) | 0);
    const dx = x - centroid.x;
    const dy = y - centroid.y;
    return { i, x, y, d2: dx * dx + dy * dy };
  });
  scored.sort((a, b) => (a.d2 !== b.d2 ? a.d2 - b.d2 : a.i - b.i));
  const stride = Math.max(1, Math.ceil(scored.length / MAX_INTERIOR_PROBES));
  const out: Pt[] = [];
  for (let n = 0; n < scored.length; n += stride) {
    out.push({ x: scored[n]!.x, y: scored[n]!.y });
  }
  return out;
}
