import type { Pt } from "../geometry.ts";
import type { BirdseyeWindow, Sample, Stroke } from "./types.ts";
import { rel, sampleAt } from "./window.ts";

const at = (p: Sample): Pt => ({ x: p.x, y: p.y });

/** Land as one polygon per run of land samples along a row, far rows first so nearer ground covers farther. */
export function landStrips(w: BirdseyeWindow): Pt[][] {
  const out: Pt[][] = [];
  for (let j = w.rows - 1; j >= 1; j--) {
    let i = 0;
    while (i < w.cols) {
      if (!sampleAt(w, i, j).land) {
        i++;
        continue;
      }
      let k = i;
      while (k < w.cols && sampleAt(w, k, j).land) k++;
      const top: Pt[] = [];
      const bottom: Pt[] = [];
      for (let q = i; q < k; q++) {
        top.push(at(sampleAt(w, q, j)));
        bottom.push(at(sampleAt(w, q, j - 1)));
      }
      const ring = [...top, ...bottom.reverse()];
      if (ring.length >= 3) out.push(ring);
      i = k;
    }
  }
  return out;
}

/** The coast by marching squares over the sample grid, interpolated to the sea level and projected. */
export function coastSegments(w: BirdseyeWindow): Array<readonly [Pt, Pt]> {
  const out: Array<readonly [Pt, Pt]> = [];
  const lerp = (a: Sample, b: Sample): Pt => {
    const t = (w.seaLevel - a.e) / (b.e - a.e || 1e-9);
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  };
  for (let j = 0; j < w.rows - 1; j++) {
    for (let i = 0; i < w.cols - 1; i++) {
      const a = sampleAt(w, i, j);
      const b = sampleAt(w, i + 1, j);
      const c = sampleAt(w, i + 1, j + 1);
      const d = sampleAt(w, i, j + 1);
      const code = (a.land ? 1 : 0) | (b.land ? 2 : 0) | (c.land ? 4 : 0) | (d.land ? 8 : 0);
      if (code === 0 || code === 15) continue;
      const edge: Pt[] = [];
      if ((code & 1) !== (code & 2) >> 1) edge.push(lerp(a, b));
      if ((code & 2) >> 1 !== (code & 4) >> 2) edge.push(lerp(b, c));
      if ((code & 4) >> 2 !== (code & 8) >> 3) edge.push(lerp(c, d));
      if ((code & 8) >> 3 !== (code & 1)) edge.push(lerp(d, a));
      for (let q = 0; q + 1 < edge.length; q += 2) out.push([edge[q]!, edge[q + 1]!]);
    }
  }
  return out;
}

/** A stroke down the fall line wherever the ground stands above the site, longer where steeper, and a darker one on faces turned from the light. */
export function hillStrokes(w: BirdseyeWindow, siteRel: number): { hatch: Stroke[]; shade: Stroke[] } {
  const hatch: Stroke[] = [];
  const shade: Stroke[] = [];
  for (let j = 2; j < w.rows - 2; j += 3) {
    for (let i = 2; i < w.cols - 2; i += 3) {
      const p = sampleAt(w, i, j);
      if (!p.land) continue;
      const rise = rel(w, p.e) - siteRel;
      if (rise < 0.05) continue;
      const gx = rel(w, sampleAt(w, i + 2, j).e) - rel(w, sampleAt(w, i - 2, j).e);
      const gy = rel(w, sampleAt(w, i, j + 2).e) - rel(w, sampleAt(w, i, j - 2).e);
      const len = Math.min(14, 4 + rise * 26);
      const dx = -gx * 40;
      const dy = gy * 40;
      hatch.push({
        from: at(p),
        by: { x: dx * len * 0.3 + (gx === 0 && gy === 0 ? 1 : 0), y: dy * len * 0.3 + len * 0.6 },
      });
      if (gx > 0.03) shade.push({ from: { x: p.x + 1.5, y: p.y - 1 }, by: { x: len * 0.35, y: len * 0.75 } });
    }
  }
  return { hatch, shade };
}
