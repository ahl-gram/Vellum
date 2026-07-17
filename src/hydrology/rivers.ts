import { quantile, type Field } from "../core/grid.ts";
import type { FlowResult } from "./flow.ts";

export type RiverPoint = {
  readonly x: number;
  readonly y: number;
  readonly acc: number;
};

export type River = {
  /** Ordered head → mouth. The final point is shared: an ocean cell for
   *  mouths, or a junction cell belonging to the river it feeds. */
  readonly points: ReadonlyArray<RiverPoint>;
  readonly endsInOcean: boolean;
};

export type RiverOptions = {
  /** Accumulation quantile (over land) above which a cell is a river. */
  quantileQ?: number;
  minAcc?: number;
  minLength?: number;
  /**
   * A pre-computed accumulation threshold. When present it is used verbatim and
   * the window-local quantile is skipped entirely (#162): a regional survey
   * anchors its threshold to the parent world so a stream does not gain or lose
   * river status between zoom levels. See region.ts for how the world value is
   * computed and scaled to the region grid.
   */
  absoluteThreshold?: number;
};

/**
 * The accumulation threshold above which a land cell counts as a river: the
 * given quantile of the land-cell accumulation distribution, floored at minAcc.
 * Exported so a regional survey (#162) can compute the parent world's value and
 * scale it for the finer grid, instead of re-deriving a window-local quantile.
 * Callers guarantee a non-empty landAcc.
 */
export function riverThreshold(
  landAcc: readonly number[],
  quantileQ = 0.985,
  minAcc = 8,
): number {
  return Math.max(quantile(landAcc, quantileQ), minAcc);
}

/**
 * A "major" river: reaches the sea, runs long, and carries real flow at its
 * mouth. This is the gate the namer uses (only major rivers are named) and, from
 * #80, the gate for which rivers can pull a realm border onto themselves. One
 * definition, so the two never drift apart.
 */
export function isMajorRiver(r: River): boolean {
  const mouthAcc = r.points[r.points.length - 1]?.acc ?? 0;
  return r.endsInOcean && r.points.length >= 14 && mouthAcc > 0;
}

export function extractRivers(
  elev: Field,
  flow: FlowResult,
  seaLevel: number,
  opts: RiverOptions = {},
): River[] {
  const { quantileQ = 0.985, minAcc = 8, minLength = 3, absoluteThreshold } = opts;
  const { w, data } = elev;
  const { dir, acc } = flow;
  const n = data.length;

  const landAcc: number[] = [];
  for (let i = 0; i < n; i++) {
    if ((data[i] as number) > seaLevel) landAcc.push(acc[i] as number);
  }
  if (landAcc.length === 0) return [];
  // A regional survey passes a threshold anchored to the parent world (#162);
  // absent that, fall back to the window-local quantile.
  const threshold = absoluteThreshold ?? riverThreshold(landAcc, quantileQ, minAcc);

  const isRiver = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    isRiver[i] =
      (data[i] as number) > seaLevel && (acc[i] as number) >= threshold ? 1 : 0;
  }

  // upstream adjacency + mouths (river cells draining into ocean)
  const children = new Map<number, number[]>();
  const mouths: number[] = [];
  for (let i = 0; i < n; i++) {
    if (!isRiver[i]) continue;
    const d = dir[i] as number;
    if (d < 0) continue;
    if ((data[d] as number) <= seaLevel) {
      mouths.push(i);
    } else {
      const list = children.get(d);
      if (list) list.push(i);
      else children.set(d, [i]);
    }
  }

  const point = (i: number): RiverPoint => ({
    x: i % w,
    y: (i / w) | 0,
    acc: acc[i] as number,
  });

  type Trace = { cell: number; tail: RiverPoint; endsInOcean: boolean };
  const stack: Trace[] = [];
  for (const m of mouths) {
    stack.push({ cell: m, tail: point(dir[m] as number), endsInOcean: true });
  }

  const rivers: River[] = [];
  while (stack.length > 0) {
    const { cell, tail, endsInOcean } = stack.pop() as Trace;
    const downToUp: number[] = [cell];
    let cur = cell;
    for (;;) {
      const kids = children.get(cur);
      if (!kids || kids.length === 0) break;
      let main = kids[0] as number;
      for (const k of kids) {
        if ((acc[k] as number) > (acc[main] as number)) main = k;
      }
      for (const k of kids) {
        if (k !== main) {
          stack.push({ cell: k, tail: point(cur), endsInOcean: false });
        }
      }
      downToUp.push(main);
      cur = main;
    }
    const points = downToUp.reverse().map(point);
    points.push(tail);
    if (points.length >= minLength) {
      rivers.push({ points, endsInOcean });
    }
  }

  return rivers;
}
