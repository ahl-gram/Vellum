// How the Broadside shares a tall window's free height among its gaps (Issue #1260 comment 6666875967): pure arithmetic over what bill-grow.ts measures.
import { ZOOM_STEP } from "../shared/zoom-keys.ts";

export const SPREAD_START = 768;
export const SPREAD_PACE = 2;
export const SPREAD_STOP = 2;
export const ROW_SHARE = 1;
export const GROUP_SHARE = 2;
export const HEAD_SHARE = 1;

export interface Ledger {
  readonly tracks: number;
  readonly held: readonly number[];
}

export interface BillRoom {
  readonly natural: number;
  readonly room: number;
  readonly page: number;
  readonly width: number;
  readonly rows: number;
  readonly groups: number;
  readonly closed: number;
}

export interface BillSpread {
  readonly row: number;
  readonly group: number;
  readonly head: number;
  readonly paper: number;
}

export const NO_SPREAD: BillSpread = { row: 0, group: 0, head: 0, paper: 0 };

export function rowGapsOf(_ledgers: readonly Ledger[]): number {
  return 0;
}

export function closedAt(k: number): number {
  return Math.min(1, Math.max(0, (k - 1) / (ZOOM_STEP - 1)));
}

export function spreadOf(_b: BillRoom): BillSpread {
  return NO_SPREAD;
}
