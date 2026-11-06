// How the Broadside shares a tall window's free height among its gaps (Issue #1260 comment 6666875967): pure arithmetic over what bill-grow.ts measures.
import { ZOOM_STEP } from "../shared/zoom-keys.ts";

export const SPREAD_START = 768;
export const SPREAD_PACE = 2;
export const SPREAD_STOP = 2;
export const ROW_SHARE = 1;
export const GROUP_SHARE = 2;
export const HEAD_SHARE = 1;
// 2026-11-06: Chromium lays every length out truncated to 1/64 px, at every pixel ratio the harness emulates (Issue #1260 plan revision 3), so a share on that grid lays out at exactly its value.
export const LAYOUT_UNITS_PER_PX = 64;

const onGrid = (px: number): number => Math.floor(px * LAYOUT_UNITS_PER_PX) / LAYOUT_UNITS_PER_PX;

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

export interface Closing {
  readonly was: number;
  readonly from: number;
  readonly k: number;
  readonly to: number | null;
}

export function closingOf({ k }: Closing): number {
  return Math.min(1, Math.max(0, (k - 1) / (ZOOM_STEP - 1)));
}

export function spreadOf(b: BillRoom): BillSpread {
  if (!(b.room > 0)) return NO_SPREAD;
  const allow = Math.max(0, SPREAD_PACE * (b.page - SPREAD_START));
  const opened = Math.max(0, Math.min(b.room - b.natural, allow, SPREAD_STOP * b.width - b.natural));
  const units = (b.rows + b.groups) * ROW_SHARE + (b.groups + 1) * GROUP_SHARE + 2 * HEAD_SHARE;
  const frame = Math.max(b.natural + opened, Math.min(b.room, b.natural + allow));
  const open = 1 - Math.min(1, Math.max(0, b.closed));
  const share = units > 0 ? onGrid((opened / units) * open) : 0;
  return {
    row: share * ROW_SHARE,
    group: share * GROUP_SHARE,
    head: share * HEAD_SHARE,
    paper: onGrid(Math.max(0, frame - b.natural - opened) * open),
  };
}
