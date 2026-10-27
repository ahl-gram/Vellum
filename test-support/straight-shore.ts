import type { Field } from "../src/core/grid.ts";
import type { UvWindow } from "../src/terrain/heightfield.ts";

/** The longest straight stretch of coast on a bare field, along one grid row or column whose line sits within a region cell of a world cell's half line: the wall a rejected bridge leaves where the coarse cells' own edge becomes the coast. A diagonal run is not counted. */
export function longestStraightOnWorldEdge(
  field: Field,
  seaLevel: number,
  window: UvWindow,
  worldGridW: number,
  worldGridH: number,
): number {
  const { w, h } = field;
  const land = (x: number, y: number): boolean => (field.data[x + y * w] as number) > seaLevel;
  const onWorldEdge = (line: number, lo: number, hi: number, span: number, worldN: number): boolean => {
    const wc = (lo + ((line + 0.5) / (span - 1)) * (hi - lo)) * (worldN - 1);
    const perWorldCell = (span - 1) / ((hi - lo) * (worldN - 1));
    return Math.abs(wc - Math.floor(wc) - 0.5) * perWorldCell <= 1;
  };
  let longest = 0;
  const scan = (
    n: number,
    lines: number,
    at: (i: number, j: number) => readonly [boolean, boolean],
    isEdge: (j: number) => boolean,
  ): void => {
    for (let j = 0; j < lines - 1; j++) {
      if (!isEdge(j)) continue;
      let run = 0;
      let side = 0;
      for (let i = 0; i < n; i++) {
        const [a, b] = at(i, j);
        const s = a === b ? 0 : a ? 1 : -1;
        run = s !== 0 && s === side ? run + 1 : s !== 0 ? 1 : 0;
        side = s;
        longest = Math.max(longest, run);
      }
    }
  };
  scan(
    w,
    h,
    (x, y) => [land(x, y), land(x, y + 1)],
    (y) => onWorldEdge(y, window.v0, window.v1, h, worldGridH),
  );
  scan(
    h,
    w,
    (y, x) => [land(x, y), land(x + 1, y)],
    (x) => onWorldEdge(x, window.u0, window.u1, w, worldGridW),
  );
  return longest;
}
