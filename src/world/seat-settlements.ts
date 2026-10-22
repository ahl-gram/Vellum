import type { Field } from "../core/grid.ts";
import type { UvWindow } from "../terrain/heightfield.ts";
import type { Cell } from "./snap-to-land.ts";

export const HARBOUR_REACH_WORLD_CELLS = 1.5 * Math.SQRT2;

export function harbourReachCells(gridW: number, window: UvWindow, worldGridW: number): number {
  void [gridW, window, worldGridW];
  return 1;
}

export function seatOnShore(elev: Field, seaLevel: number, at: Cell, radius: number): Cell | null {
  void [elev, seaLevel, radius];
  return at;
}

export function seatProjected(
  s: { readonly harbor: boolean },
  cell: Cell,
  land: { readonly elev: Field; readonly seaLevel: number },
  harbourReach: number,
): Cell {
  void [s, land, harbourReach];
  return cell;
}
