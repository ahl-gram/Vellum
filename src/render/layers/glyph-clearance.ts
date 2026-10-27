import { boxesOverlap, type Box } from "../geometry.ts";
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
const NUDGE_OVERSHOOT = 0.1;

export function markBox(m: Pick<Mark, "x" | "y" | "symbol" | "scale">): Box {
  const [x0, y0, x1, y1] = SYMBOL_EXTENT[m.symbol]!;
  return { x: m.x + x0 * m.scale, y: m.y + y0 * m.scale, w: (x1 - x0) * m.scale, h: (y1 - y0) * m.scale };
}

export function realmNameBox(a: RealmAnchor): Box {
  return { x: a.cx - a.halfW, y: a.cy - a.halfH, w: 2 * a.halfW, h: 2 * a.halfH };
}

const tenth = (v: number): number => Math.round(v * 10) / 10;

type Slide = { readonly dx: number; readonly dy: number; readonly len: number; readonly order: number };

function slidesClear(b: Box, met: ReadonlyArray<Box>, pad: number): Slide[] {
  const p = pad + NUDGE_OVERSHOOT;
  return met
    .flatMap((n) => [
      { dx: 0, dy: n.y - p - (b.y + b.h) },
      { dx: 0, dy: n.y + n.h + p - b.y },
      { dx: n.x - p - (b.x + b.w), dy: 0 },
      { dx: n.x + n.w + p - b.x, dy: 0 },
    ])
    .map((d, order) => ({ ...d, len: Math.abs(d.dx) + Math.abs(d.dy), order }))
    .sort((a, c) => a.len - c.len || a.order - c.order);
}

export function marksClearOf(marks: ReadonlyArray<Mark>, names: ReadonlyArray<Box>, ground: MarkGround): Mark[] {
  const metBy = (b: Box): Box[] => names.filter((n) => boxesOverlap(b, n, ground.pad));
  const nudged = (m: Mark, met: ReadonlyArray<Box>): Mark | null => {
    for (const s of slidesClear(markBox(m), met, ground.pad)) {
      if (s.len > ground.reach(m.kind)) return null;
      const moved = { ...m, x: tenth(m.x + s.dx), y: tenth(m.y + s.dy) };
      if (metBy(markBox(moved)).length === 0 && ground.stands(m.kind, moved.x, moved.y)) return moved;
    }
    return null;
  };
  return marks.flatMap((m) => {
    const met = metBy(markBox(m));
    if (met.length === 0) return [m];
    const moved = nudged(m, met);
    return moved ? [moved] : [];
  });
}
