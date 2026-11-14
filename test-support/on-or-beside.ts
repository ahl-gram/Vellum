import { NEIGHBORS_8 } from "../src/core/grid.ts";

export function onOrBeside(
  grid: { readonly elev: { readonly w: number; readonly h: number } },
  at: { readonly x: number; readonly y: number },
  hit: (i: number) => boolean,
): boolean {
  const { w, h } = grid.elev;
  if (hit(at.x + at.y * w)) return true;
  return NEIGHBORS_8.some(([dx, dy]) => {
    const x = at.x + dx;
    const y = at.y + dy;
    return x >= 0 && x < w && y >= 0 && y < h && hit(x + y * w);
  });
}
