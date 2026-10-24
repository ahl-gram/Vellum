import { NEIGHBORS_8, type Field } from "../core/grid.ts";
import type { UvWindow } from "../terrain/heightfield.ts";
import { cellsPerWorldCell } from "./region-parent.ts";
import { CORRIDOR_WORLD_CELLS } from "./river-route.ts";
import type { Cell } from "./snap-to-land.ts";

export const HARBOUR_REACH_WORLD_CELLS = 1.5 * Math.SQRT2;
export const RIVER_REACH_WORLD_CELLS = Math.SQRT2 + CORRIDOR_WORLD_CELLS;
export type SeatReach = { readonly harbour: number; readonly river: number };
type SeatLand = { readonly elev: Field; readonly seaLevel: number; readonly riverCells: Uint8Array };

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

function reachCells(worldCells: number, gridW: number, window: UvWindow, worldGridW: number): number {
  if (!(window.u1 - window.u0 > 0) || gridW < 2 || worldGridW < 2) return 1;
  return Math.ceil(worldCells * cellsPerWorldCell(gridW, window, worldGridW));
}

export function harbourReachCells(gridW: number, window: UvWindow, worldGridW: number): number {
  return reachCells(HARBOUR_REACH_WORLD_CELLS, gridW, window, worldGridW);
}

export function riverReachCells(gridW: number, window: UvWindow, worldGridW: number): number {
  return reachCells(RIVER_REACH_WORLD_CELLS, gridW, window, worldGridW);
}

export function seatReach(gridW: number, window: UvWindow, worldGridW: number): SeatReach {
  return {
    harbour: harbourReachCells(gridW, window, worldGridW),
    river: riverReachCells(gridW, window, worldGridW),
  };
}

function besideWhere(w: number, h: number, x: number, y: number, hit: (i: number) => boolean): boolean {
  return NEIGHBORS_8.some((offset) => {
    const nx = x + offset[0];
    const ny = y + offset[1];
    return nx >= 0 && nx < w && ny >= 0 && ny < h && hit(nx + ny * w);
  });
}

function seatInDisc(
  elev: Field,
  seaLevel: number,
  at: Cell,
  radius: number,
  accept: (x: number, y: number) => boolean,
): Cell | null {
  const { w, h, data } = elev;
  for (const [dx, dy] of discOffsets(radius)) {
    const x = at.x + dx;
    const y = at.y + dy;
    if (x < 0 || x >= w || y < 0 || y >= h || (data[x + y * w] as number) <= seaLevel) continue;
    if (accept(x, y)) return { x, y };
  }
  return null;
}

function besideWater(elev: Field, seaLevel: number, x: number, y: number): boolean {
  return besideWhere(elev.w, elev.h, x, y, (i) => (elev.data[i] as number) <= seaLevel);
}

function onOrBesideRiver(riverCells: Uint8Array, w: number, h: number, x: number, y: number): boolean {
  return riverCells[x + y * w] === 1 || besideWhere(w, h, x, y, (i) => riverCells[i] === 1);
}

export function seatOnShore(elev: Field, seaLevel: number, at: Cell, radius: number): Cell | null {
  return seatInDisc(elev, seaLevel, at, radius, (x, y) => besideWater(elev, seaLevel, x, y));
}

export function seatOnRiver(
  elev: Field,
  seaLevel: number,
  riverCells: Uint8Array,
  at: Cell,
  radius: number,
): Cell | null {
  return seatInDisc(elev, seaLevel, at, radius, (x, y) => onOrBesideRiver(riverCells, elev.w, elev.h, x, y));
}

function seatAtMouth(elev: Field, seaLevel: number, riverCells: Uint8Array, at: Cell, radius: number): Cell | null {
  return seatInDisc(
    elev,
    seaLevel,
    at,
    radius,
    (x, y) => besideWater(elev, seaLevel, x, y) && onOrBesideRiver(riverCells, elev.w, elev.h, x, y),
  );
}

export function seatProjected(
  s: { readonly harbor: boolean; readonly onRiver: boolean },
  cell: Cell,
  land: SeatLand,
  reach: SeatReach,
): Cell {
  const { elev, seaLevel, riverCells } = land;
  if (s.harbor && s.onRiver) {
    const mouth = seatAtMouth(elev, seaLevel, riverCells, cell, reach.river);
    if (mouth !== null) return mouth;
  }
  if (s.harbor) {
    const shore = seatOnShore(elev, seaLevel, cell, reach.harbour);
    if (shore !== null) return shore;
  }
  if (s.onRiver) {
    const bank = seatOnRiver(elev, seaLevel, riverCells, cell, reach.river);
    if (bank !== null) return bank;
  }
  return cell;
}
