import type { Field } from "../core/grid.ts";
import type { UvWindow } from "../terrain/heightfield.ts";

export type Cell = { readonly x: number; readonly y: number };

type Offset = readonly [number, number];

/** Fine cells per parent cell. A coast can crenellate anywhere inside one parent cell as the Glass descends, so that is how far a settlement charted on the parent's shore may have to walk to find the region's. */
export function landSnapRadius(
  gridW: number,
  window: UvWindow,
  worldGridW: number,
): number {
  const du = window.u1 - window.u0;
  if (!(du > 0) || worldGridW < 2 || gridW < 2) return 1;
  return Math.max(1, Math.round((gridW - 1) / (du * (worldGridW - 1))));
}

const RINGS = new Map<number, ReadonlyArray<Offset>>();

function offsetsWithin(radius: number): ReadonlyArray<Offset> {
  const cached = RINGS.get(radius);
  if (cached) return cached;
  const out: Offset[] = [];
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx === 0 && dy === 0) continue;
      out.push([dx, dy]);
    }
  }
  out.sort((a, b) => {
    const da = a[0] * a[0] + a[1] * a[1];
    const db = b[0] * b[0] + b[1] * b[1];
    if (da !== db) return da - db;
    if (Math.abs(a[0]) !== Math.abs(b[0])) return Math.abs(b[0]) - Math.abs(a[0]);
    if (a[0] !== b[0]) return b[0] - a[0];
    return b[1] - a[1];
  });
  const frozen = Object.freeze(out) as ReadonlyArray<Offset>;
  RINGS.set(radius, frozen);
  return frozen;
}

export function snapToLand(
  elev: Field,
  seaLevel: number,
  gx: number,
  gy: number,
  radius: number,
): Cell | null {
  const { w, h, data } = elev;
  if (gx < 0 || gx >= w || gy < 0 || gy >= h) return null;
  if ((data[gx + gy * w] as number) > seaLevel) return { x: gx, y: gy };
  for (const [dx, dy] of offsetsWithin(Math.max(1, Math.trunc(radius)))) {
    const nx = gx + dx;
    const ny = gy + dy;
    if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
    if ((data[nx + ny * w] as number) > seaLevel) return { x: nx, y: ny };
  }
  return null;
}
