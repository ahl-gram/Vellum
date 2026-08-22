import type { Field } from "../../src/core/grid.ts";
import type { Contour } from "../../src/terrain/contours.ts";
import { labelLandmasses } from "../../src/world/landmass.ts";

export type FusingSaddle = {
  readonly x: number;
  readonly y: number;
  readonly landCorners: readonly [readonly [number, number], readonly [number, number]];
};

/** Census of saddle cells whose diagonal land corners sit in DIFFERENT 4-connected landmasses while the cell-center average puts the drawn coast on the bridging resolution; the synthetic pin in detail-guarantees.test.ts ties this center rule to the segments marchingSquares actually emits. */
export function fusingSaddles(field: Field, seaLevel: number): { saddleCells: number; fusing: FusingSaddle[] } {
  const { w, h, data } = field;
  const { ids } = labelLandmasses(field, seaLevel);
  const fusing: FusingSaddle[] = [];
  let saddleCells = 0;
  for (let y = 0; y < h - 1; y++) {
    for (let x = 0; x < w - 1; x++) {
      const a = data[x + y * w] as number;
      const b = data[x + 1 + y * w] as number;
      const c = data[x + 1 + (y + 1) * w] as number;
      const d = data[x + (y + 1) * w] as number;
      const idx =
        (a > seaLevel ? 8 : 0) | (b > seaLevel ? 4 : 0) | (c > seaLevel ? 2 : 0) | (d > seaLevel ? 1 : 0);
      if (idx !== 5 && idx !== 10) continue;
      saddleCells++;
      const corners: readonly [readonly [number, number], readonly [number, number]] =
        idx === 10 ? [[x, y], [x + 1, y + 1]] : [[x + 1, y], [x, y + 1]];
      const [p1, p2] = corners;
      if (ids[p1[0] + p1[1] * w] === ids[p2[0] + p2[1] * w]) continue;
      if ((a + b + c + d) / 4 > seaLevel) fusing.push({ x, y, landCorners: corners });
    }
  }
  return { saddleCells, fusing };
}

/** Sorted edge-pair labels ("bottom|left" etc) of the marching-squares segments emitted inside one cell, read from real contour output so a resolution change in contours.ts is visible to the guards. */
export function cellSegmentEdgePairs(
  contours: ReadonlyArray<Contour>,
  cx: number,
  cy: number,
): string[] {
  const pairs: string[] = [];
  for (const contour of contours) {
    for (let i = 0; i + 1 < contour.points.length; i++) {
      const p = contour.points[i] as readonly [number, number];
      const q = contour.points[i + 1] as readonly [number, number];
      const inCell = (pt: readonly [number, number]): boolean =>
        pt[0] >= cx && pt[0] <= cx + 1 && pt[1] >= cy && pt[1] <= cy + 1;
      if (!inCell(p) || !inCell(q)) continue;
      const edgeOf = (pt: readonly [number, number]): string => {
        if (pt[1] === cy) return "top";
        if (pt[1] === cy + 1) return "bottom";
        if (pt[0] === cx) return "left";
        return "right";
      };
      pairs.push([edgeOf(p), edgeOf(q)].sort().join("|"));
    }
  }
  return pairs.sort();
}
