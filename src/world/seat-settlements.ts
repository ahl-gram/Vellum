import { NEIGHBORS_8, type Field } from "../core/grid.ts";
import type { UvWindow } from "../terrain/heightfield.ts";
import { cellsPerWorldCell } from "./region-parent.ts";
import type { Cell } from "./snap-to-land.ts";

export const HARBOUR_REACH_WORLD_CELLS = 1.5 * Math.SQRT2;

type Offset = readonly [number, number];

const DISCS = new Map<number, ReadonlyArray<Offset>>();

function discOffsets(radius: number): ReadonlyArray<Offset> {
  const cached = DISCS.get(radius);
  if (cached) return cached;
  const out: Offset[] = [[0, 0]];
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if ((dx === 0 && dy === 0) || dx * dx + dy * dy > radius * radius) continue;
      out.push([dx, dy]);
    }
  }
  out.sort((a, b) => a[0] * a[0] + a[1] * a[1] - (b[0] * b[0] + b[1] * b[1]) || a[1] - b[1] || a[0] - b[0]);
  const frozen = Object.freeze(out);
  DISCS.set(radius, frozen);
  return frozen;
}

export function harbourReachCells(gridW: number, window: UvWindow, worldGridW: number): number {
  if (!(window.u1 - window.u0 > 0) || gridW < 2 || worldGridW < 2) return 1;
  return Math.ceil(HARBOUR_REACH_WORLD_CELLS * cellsPerWorldCell(gridW, window, worldGridW));
}

/** The nearest land cell with a water 8-neighbour within `radius` (squared distance, then dy, then dx: integers, so the same on every device), or null. */
export function seatOnShore(elev: Field, seaLevel: number, at: Cell, radius: number): Cell | null {
  const { w, h, data } = elev;
  const isLand = (x: number, y: number): boolean => (data[x + y * w] as number) > seaLevel;
  for (const [dx, dy] of discOffsets(radius)) {
    const x = at.x + dx;
    const y = at.y + dy;
    if (x < 0 || x >= w || y < 0 || y >= h || !isLand(x, y)) continue;
    for (const [ex, ey] of NEIGHBORS_8) {
      const nx = x + ex;
      const ny = y + ey;
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      if (!isLand(nx, ny)) return { x, y };
    }
  }
  return null;
}

export function seatProjected(
  s: { readonly harbor: boolean },
  cell: Cell,
  land: { readonly elev: Field; readonly seaLevel: number },
  harbourReach: number,
): Cell {
  if (!s.harbor) return cell;
  return seatOnShore(land.elev, land.seaLevel, cell, harbourReach) ?? cell;
}
