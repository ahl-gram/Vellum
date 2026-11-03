import { r1 } from "../../prospect/dress/context.ts";
import { boxesOverlap, textBox, WIDTH_FACTOR, type Box } from "../../render/geometry.ts";

export type SeatLine = { readonly text: string; readonly caps: boolean; readonly size: number };
export type SeatAnchor = "start" | "end" | "middle";
export type SeatRoom = {
  readonly left: (y: number) => number;
  readonly right: (y: number) => number;
  readonly top: number;
  readonly bottom: number;
};
export type SeatDisc = { readonly x: number; readonly y: number; readonly r: number };
export type SeatPoint = { readonly sx: number; readonly sy: number };
export type SeatKeep = {
  readonly boxes: ReadonlyArray<Box>;
  readonly discs: ReadonlyArray<SeatDisc>;
  readonly lines: ReadonlyArray<{ readonly pts: ReadonlyArray<SeatPoint>; readonly clear: number }>;
};
export type SeatWant = {
  readonly x: number;
  readonly top: number;
  readonly side: -1 | 1;
  readonly lines: ReadonlyArray<SeatLine>;
  readonly roadX: (y: number) => number;
  readonly acrossTop: number;
  readonly sticky: boolean;
  readonly rewrap: (at: number) => ReadonlyArray<SeatLine>;
};
export type Seat = {
  readonly x: number;
  readonly top: number;
  readonly anchor: SeatAnchor;
  readonly scale: number;
  readonly backed: boolean;
  readonly lines: ReadonlyArray<SeatLine>;
  readonly boxes: ReadonlyArray<Box>;
};

const SLIDES = [0, -4, 4, -8, 8, -12, 12, -16, 16, -20, 20, -24, 24, -28, 28, -32, 32];
const NEAR_REACH = 12;
const ACROSS_SLIDES = [0, 4, 8, 12, 16, 20, 24, -4, -8, -12, -16, -20, -24];
const WRAPS = [12, 9];
const SHRINKS = [0.9, 0.8, 0.7];
const ROOM_EPSILON = 1e-6;
const SEGMENT_STEP = 0.5;
const MIN_SCALE = 0.05;
const SCALE_STEP = 0.01;

type Pass = readonly [-1 | 1, number];
type Stage = () => Seat | null;

export function lineBoxes(
  x: number,
  top: number,
  anchor: SeatAnchor,
  lines: ReadonlyArray<SeatLine>,
  scale: number,
): Box[] {
  let dy = 0;
  return lines.map((l) => {
    const size = r1(l.size * scale);
    dy += l.size * scale + 1.2;
    const text = l.caps ? l.text.toUpperCase() : l.text;
    return textBox(
      x,
      top + dy - 1.2,
      text,
      size,
      anchor,
      l.caps ? WIDTH_FACTOR.caps : WIDTH_FACTOR.mixed,
      l.caps ? 0.8 : 0,
    );
  });
}

function inRoom(boxes: ReadonlyArray<Box>, room: SeatRoom): boolean {
  for (const b of boxes) {
    if (b.y < room.top - ROOM_EPSILON || b.y + b.h > room.bottom + ROOM_EPSILON) return false;
    for (let y = b.y; ; y = Math.min(y + 1, b.y + b.h)) {
      if (b.x < room.left(y) - ROOM_EPSILON || b.x + b.w > room.right(y) + ROOM_EPSILON) return false;
      if (y >= b.y + b.h) break;
    }
  }
  return true;
}

const meets = (a: Box, b: Box): boolean => boxesOverlap(a, b);

function meetsDisc(b: Box, d: SeatDisc): boolean {
  const nx = Math.max(b.x, Math.min(d.x, b.x + b.w));
  const ny = Math.max(b.y, Math.min(d.y, b.y + b.h));
  return (nx - d.x) ** 2 + (ny - d.y) ** 2 < d.r * d.r;
}

function pointBoxDistance(x: number, y: number, b: Box): number {
  return Math.hypot(Math.max(b.x - x, 0, x - (b.x + b.w)), Math.max(b.y - y, 0, y - (b.y + b.h)));
}

function segmentBoxDistance(a: SeatPoint, c: SeatPoint, b: Box): number {
  const n = Math.max(1, Math.ceil(Math.hypot(c.sx - a.sx, c.sy - a.sy) / SEGMENT_STEP));
  let best = Infinity;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    best = Math.min(best, pointBoxDistance(a.sx + (c.sx - a.sx) * t, a.sy + (c.sy - a.sy) * t, b));
  }
  return best;
}

function nearLine(b: Box, pts: ReadonlyArray<SeatPoint>, clear: number): boolean {
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1] as SeatPoint;
    const c = pts[i] as SeatPoint;
    if (Math.min(a.sy, c.sy) > b.y + b.h + clear || Math.max(a.sy, c.sy) < b.y - clear) continue;
    if (segmentBoxDistance(a, c, b) < clear) return true;
  }
  return false;
}

function clearOf(boxes: ReadonlyArray<Box>, keep: SeatKeep, backed: boolean): boolean {
  return boxes.every(
    (b) =>
      !keep.boxes.some((k) => meets(b, k)) &&
      !keep.discs.some((d) => meetsDisc(b, d)) &&
      (backed || !keep.lines.some((line) => nearLine(b, line.pts, line.clear))),
  );
}

function slidIn(
  x: number,
  anchor: SeatAnchor,
  top: number,
  lines: ReadonlyArray<SeatLine>,
  scale: number,
  room: SeatRoom,
): number {
  let shift = 0;
  for (const b of lineBoxes(x, top, anchor, lines, scale)) {
    for (let y = b.y; ; y = Math.min(y + 1, b.y + b.h)) {
      if (anchor !== "end") shift = Math.min(shift, room.right(y) - (b.x + b.w));
      if (anchor !== "start") shift = Math.max(shift, room.left(y) - b.x);
      if (y >= b.y + b.h) break;
    }
  }
  return x + shift;
}

function besideX(want: SeatWant, side: -1 | 1, top: number, lines: ReadonlyArray<SeatLine>): number {
  if (side === want.side) return want.x;
  const h = lines.reduce((a, l) => a + l.size + 1.2, 0);
  let edge = side < 0 ? Infinity : -Infinity;
  for (let y = top; y <= top + h; y += 2)
    edge = side < 0 ? Math.min(edge, want.roadX(y)) : Math.max(edge, want.roadX(y));
  return edge + side * 10;
}

function tryAt(
  lines: ReadonlyArray<SeatLine>,
  x: number,
  top: number,
  anchor: SeatAnchor,
  scale: number,
  backed: boolean,
  room: SeatRoom,
  keep: SeatKeep,
): Seat | null {
  const boxes = lineBoxes(x, top, anchor, lines, scale);
  return inRoom(boxes, room) && clearOf(boxes, keep, backed) ? { x, top, anchor, scale, backed, lines, boxes } : null;
}

function besideSeat(
  want: SeatWant,
  lines: ReadonlyArray<SeatLine>,
  scale: number,
  passes: ReadonlyArray<Pass>,
  room: SeatRoom,
  keep: SeatKeep,
): Seat | null {
  for (const [side, dy] of passes) {
    const top = want.top + dy;
    const anchor: SeatAnchor = side < 0 ? "end" : "start";
    const x = besideX(want, side, top, lines);
    const hit =
      tryAt(lines, x, top, anchor, scale, false, room, keep) ??
      tryAt(lines, slidIn(x, anchor, top, lines, scale, room), top, anchor, scale, false, room, keep);
    if (hit) return hit;
  }
  return null;
}

function acrossSeat(
  want: SeatWant,
  lines: ReadonlyArray<SeatLine>,
  scale: number,
  room: SeatRoom,
  keep: SeatKeep,
): Seat | null {
  for (const dy of ACROSS_SLIDES) {
    const top = want.acrossTop + dy;
    const x = want.roadX(top + 5);
    const hit =
      tryAt(lines, x, top, "middle", scale, true, room, keep) ??
      tryAt(lines, slidIn(x, "middle", top, lines, scale, room), top, "middle", scale, true, room, keep);
    if (hit) return hit;
  }
  return null;
}

function overlapArea(boxes: ReadonlyArray<Box>, keep: SeatKeep): number {
  const squares = keep.discs.map((d) => ({ x: d.x - d.r, y: d.y - d.r, w: 2 * d.r, h: 2 * d.r }));
  let area = 0;
  for (const b of boxes) {
    for (const k of [...keep.boxes, ...squares]) {
      const w = Math.min(b.x + b.w, k.x + k.w) - Math.max(b.x, k.x);
      const h = Math.min(b.y + b.h, k.y + k.h) - Math.max(b.y, k.y);
      if (w > 0 && h > 0) area += w * h;
    }
  }
  return area;
}

function narrowSeat(want: SeatWant, room: SeatRoom): Seat {
  const anchor: SeatAnchor = want.side < 0 ? "end" : "start";
  const span =
    Math.min(room.right(want.top), room.right(want.top + 12)) - Math.max(room.left(want.top), room.left(want.top + 12));
  const widest = (scale: number): number =>
    Math.max(...lineBoxes(0, want.top, anchor, want.lines, scale).map((b) => b.w));
  let scale = Math.min(1, span / widest(1));
  while (widest(scale) > span && scale > MIN_SCALE) scale -= SCALE_STEP;
  const x = slidIn(want.x, anchor, want.top, want.lines, scale, room);
  const boxes = lineBoxes(x, want.top, anchor, want.lines, scale);
  return { x, top: want.top, anchor, scale, backed: true, lines: want.lines, boxes };
}

function forcedSeat(want: SeatWant, room: SeatRoom, keep: SeatKeep): Seat {
  let best: Seat | null = null;
  let bestArea = Infinity;
  for (const side of [want.side, (want.side * -1) as -1 | 1]) {
    for (const dy of SLIDES) {
      const top = want.top + dy;
      const anchor: SeatAnchor = side < 0 ? "end" : "start";
      const x = slidIn(besideX(want, side, top, want.lines), anchor, top, want.lines, 1, room);
      const boxes = lineBoxes(x, top, anchor, want.lines, 1);
      const area = inRoom(boxes, room) ? overlapArea(boxes, keep) : Infinity;
      if (area < bestArea) {
        bestArea = area;
        best = { x, top, anchor, scale: 1, backed: true, lines: want.lines, boxes };
      }
    }
  }
  return best ?? narrowSeat(want, room);
}

function passesOf(want: SeatWant): { near: Pass[]; far: Pass[] } {
  const sides: Array<-1 | 1> = [want.side, (want.side * -1) as -1 | 1];
  const reach = (dy: number): boolean => want.sticky || Math.abs(dy) <= NEAR_REACH;
  return {
    near: sides.flatMap((side) => SLIDES.filter(reach).map((dy) => [side, dy] as const)),
    far: want.sticky ? [] : SLIDES.filter((dy) => !reach(dy)).flatMap((dy) => sides.map((side) => [side, dy] as const)),
  };
}

function rewraps(want: SeatWant): Array<ReadonlyArray<SeatLine>> {
  const all = WRAPS.map((at) => want.rewrap(at));
  return all.filter((ls, i) => ls.length > (all[i - 1] ?? want.lines).length);
}

function stagesOf(want: SeatWant, room: SeatRoom, keep: SeatKeep): Stage[] {
  const { near, far } = passesOf(want);
  const wraps = rewraps(want);
  const beside =
    (lines: ReadonlyArray<SeatLine>, scale: number, passes: Pass[]): Stage =>
    () =>
      besideSeat(want, lines, scale, passes, room, keep);
  const across =
    (lines: ReadonlyArray<SeatLine>, scale: number): Stage =>
    () =>
      acrossSeat(want, lines, scale, room, keep);
  return [
    beside(want.lines, 1, near),
    ...wraps.map((ls) => beside(ls, 1, near)),
    across(want.lines, 1),
    ...wraps.map((ls) => across(ls, 1)),
    beside(want.lines, 1, far),
    ...wraps.map((ls) => beside(ls, 1, far)),
    ...SHRINKS.flatMap((s) => [beside(want.lines, s, near), across(want.lines, s)]),
    ...SHRINKS.map((s) => beside(want.lines, s, far)),
  ];
}

export function seatCaption(want: SeatWant, room: SeatRoom, keep: SeatKeep): Seat {
  for (const stage of stagesOf(want, room, keep)) {
    const hit = stage();
    if (hit) return hit;
  }
  return forcedSeat(want, room, keep);
}
