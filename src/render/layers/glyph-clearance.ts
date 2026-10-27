import type { Box } from "../geometry.ts";
import { SYMBOL_EXTENT } from "./glyph-symbols.ts";
import type { RealmAnchor } from "./feature-labels.ts";

export type MarkKind = "mtn" | "hill" | "tree" | "marsh" | "dune";

export type Mark = {
  readonly x: number;
  readonly y: number;
  readonly symbol: string;
  readonly scale: number;
  readonly kind: MarkKind;
};

export type MarkGround = {
  readonly pad: number;
  readonly reach: (kind: MarkKind) => number;
  readonly stands: (kind: MarkKind, x: number, y: number) => boolean;
};

export const MARK_NAME_PAD = 2;
export const NUDGE_REACH = 0.5;

export function markBox(m: Pick<Mark, "x" | "y" | "symbol" | "scale">): Box {
  const [x0, y0, x1, y1] = SYMBOL_EXTENT[m.symbol]!;
  return { x: m.x + x0 * m.scale, y: m.y + y0 * m.scale, w: (x1 - x0) * m.scale, h: (y1 - y0) * m.scale };
}

export function realmNameBox(_a: RealmAnchor): Box {
  return { x: 0, y: 0, w: 0, h: 0 };
}

export function marksClearOf(marks: ReadonlyArray<Mark>, _names: ReadonlyArray<Box>, _ground: MarkGround): Mark[] {
  return [...marks];
}
