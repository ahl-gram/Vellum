import type { Pt } from "../geometry.ts";
import type { Projection } from "../transform.ts";

/**
 * Candidate label positions drawn from a feature's own blob, nearest its centroid
 * first (#145, #175).
 *
 * Both the realm name and the mountain-range name used to search a single vertical
 * column through the blob centroid: five rungs, one x. When that column was taken
 * the label was dropped, even with thousands of the blob's cells free elsewhere.
 * Probing the blob itself is the escalation both of them fall back to.
 */

/** Cap on probes, so a 20k-cell blob does not cost 20k box tests. */
const MAX_INTERIOR_PROBES = 240;

/**
 * Blob cells ordered nearest-centroid first, thinned to at most
 * MAX_INTERIOR_PROBES. Ties break on cell index, so the order never depends on how
 * the blob was walked and a shuffled blob yields a byte-identical placement.
 */
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
