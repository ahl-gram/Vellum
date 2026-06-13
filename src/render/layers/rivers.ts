import { clamp } from "../../core/math.ts";
import { el, pathFrom, type SvgNode } from "../svg.ts";
import type { RenderCtx } from "../context.ts";

type Wpt = readonly [number, number, number]; // x, y, strokeWidth

/** Chaikin corner-cutting over (x, y, width) triples. */
function smoothWeighted(pts: ReadonlyArray<Wpt>, iterations: number): Wpt[] {
  let cur: Wpt[] = [...pts];
  for (let it = 0; it < iterations; it++) {
    if (cur.length < 3) return cur;
    const next: Wpt[] = [cur[0] as Wpt];
    for (let i = 0; i < cur.length - 1; i++) {
      const p = cur[i] as Wpt;
      const q = cur[i + 1] as Wpt;
      next.push(
        [
          0.75 * p[0] + 0.25 * q[0],
          0.75 * p[1] + 0.25 * q[1],
          0.75 * p[2] + 0.25 * q[2],
        ],
        [
          0.25 * p[0] + 0.75 * q[0],
          0.25 * p[1] + 0.75 * q[1],
          0.25 * p[2] + 0.75 * q[2],
        ],
      );
    }
    next.push(cur[cur.length - 1] as Wpt);
    cur = next;
  }
  return cur;
}

export function riversLayer(ctx: RenderCtx): SvgNode {
  const { world, proj, style } = ctx;
  const widthScale = proj.scale / 4.3;
  const groups: SvgNode[] = [];

  world.rivers.forEach((river, idx) => {
    const weighted: Wpt[] = river.points.map((p) => [
      proj.px(p.x),
      proj.py(p.y),
      clamp(0.35 + Math.sqrt(p.acc) * 0.05, 0.7, 4.8) * widthScale,
    ]);
    const smooth = smoothWeighted(weighted, 2);

    // group consecutive points into short constant-width segments
    const STEP = 4;
    const segs: SvgNode[] = [];
    for (let i = 0; i < smooth.length - 1; i += STEP) {
      const end = Math.min(i + STEP, smooth.length - 1);
      const slice = smooth.slice(i, end + 1);
      const w = (slice[Math.floor(slice.length / 2)] as Wpt)[2];
      segs.push(
        el("path", {
          d: pathFrom(slice.map(([x, y]) => [x, y] as const), false),
          fill: "none",
          stroke: style.river,
          "stroke-width": w,
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
        }),
      );
    }
    groups.push(el("g", { id: `river-${idx}` }, segs));
  });

  return el("g", { id: "layer-rivers", "stroke-opacity": 0.92 }, groups);
}
