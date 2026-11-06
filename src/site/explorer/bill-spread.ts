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

export function rowGapsOf(ledgers: readonly Ledger[]): number {
  let gaps = 0;
  for (const l of ledgers) {
    gaps += Math.max(0, l.tracks - 1);
    for (const h of l.held) gaps += Math.max(0, h - 1);
  }
  return gaps;
}

export function closedAt(k: number): number {
  const raw = (k - 1) / (ZOOM_STEP - 1);
  if (raw >= 1 - 1e-9) return 1;
  if (raw <= 1e-9) return 0;
  return raw;
}

export function spreadOf(b: BillRoom): BillSpread {
  if (!(b.room > 0)) return NO_SPREAD;
  const allow = Math.max(0, SPREAD_PACE * (b.page - SPREAD_START));
  const opened = Math.max(0, Math.min(b.room - b.natural, allow, SPREAD_STOP * b.width - b.natural));
  const units = (b.rows + b.groups) * ROW_SHARE + (b.groups + 1) * GROUP_SHARE + 2 * HEAD_SHARE;
  const d = units > 0 ? opened / units : 0;
  const frame = Math.max(b.natural + opened, Math.min(b.room, b.natural + allow));
  const open = 1 - Math.min(1, Math.max(0, b.closed));
  return {
    row: d * ROW_SHARE * open,
    group: d * GROUP_SHARE * open,
    head: d * HEAD_SHARE * open,
    paper: (frame - b.natural - opened) * open,
  };
}
