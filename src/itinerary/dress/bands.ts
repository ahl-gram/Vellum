import { el, type SvgNode } from "../../render/svg.ts";
import { r1 } from "../../prospect/dress/context.ts";
import { textBox, WIDTH_FACTOR } from "../../render/geometry.ts";
import type { RibbonInput } from "../input.ts";
import { stripFor, stripPos, type RibbonLayout, type StripLayout } from "./layout.ts";
import type { RibbonContext } from "./context.ts";

const GAP = 5;
const PAD = 6;
const SIZE = 7.6;
const SPACING = 1.2;
const INSET = 4.6;

type BandSeat = {
  readonly strip: number;
  readonly x: number;
  readonly y: number;
  readonly anchor: "start" | "end" | "middle";
  readonly turn: -90 | 90;
  readonly name: string;
  readonly y0: number;
  readonly y1: number;
};

const lengthOf = (name: string): number => textBox(0, 0, name, SIZE, "start", WIDTH_FACTOR.mixed, SPACING).w;

function newName(strips: ReadonlyArray<StripLayout>, s: StripLayout, sy: number, name: string): BandSeat | null {
  const len = lengthOf(name);
  const own = sy - GAP;
  const next = strips[s.index + 1];
  const [strip, y] = own - len >= s.y0 + PAD ? [s, own] : [next, next === undefined ? 0 : next.y0 + next.h - PAD];
  if (strip === undefined) return null;
  return { strip: strip.index, x: strip.x0 + INSET, y, anchor: "start", turn: -90, name, y0: y - len, y1: y };
}

function oldName(strips: ReadonlyArray<StripLayout>, s: StripLayout, sy: number, name: string): BandSeat | null {
  const len = lengthOf(name);
  const own = sy + GAP;
  const prev = strips[s.index - 1];
  const [strip, y] = own + len <= s.y0 + s.h - PAD ? [s, own] : [prev, prev === undefined ? 0 : prev.y0 + PAD];
  if (strip === undefined) return null;
  return { strip: strip.index, x: strip.x0 + INSET, y, anchor: "end", turn: -90, name, y0: y, y1: y + len };
}

function atTheLines(input: RibbonInput, layout: RibbonLayout): BandSeat[] {
  const seats: BandSeat[] = [];
  for (const e of input.events) {
    const s = e.kind === "border" ? stripFor(layout, e.dist) : null;
    if (e.kind !== "border" || s === null) continue;
    const sy = stripPos(s, e.dist).sy;
    for (const seat of [newName(layout.strips, s, sy, e.name), oldName(layout.strips, s, sy, e.fromName)]) {
      if (seat !== null && !seats.some((o) => o.strip === seat.strip && o.y0 < seat.y1 && seat.y0 < o.y1))
        seats.push(seat);
    }
  }
  return seats;
}

function bookends(input: RibbonInput, layout: RibbonLayout): BandSeat[] {
  const first = layout.strips[0];
  const last = layout.strips.at(-1);
  const seats: BandSeat[] = [];
  const at = (s: StripLayout, x: number, turn: -90 | 90, name: string): BandSeat => {
    const y = s.y0 + s.h / 2;
    return { strip: s.index, x, y, anchor: "middle", turn, name, y0: y, y1: y };
  };
  if (first !== undefined && input.realmFrom !== null) seats.push(at(first, first.x0 + INSET, -90, input.realmFrom));
  if (last !== undefined && input.realmName !== null)
    seats.push(at(last, last.x0 + last.w - INSET, 90, input.realmName));
  return seats;
}

function nameNode(c: RibbonContext, s: BandSeat): SvgNode {
  return el(
    "text",
    {
      x: r1(s.x),
      y: r1(s.y),
      "text-anchor": s.anchor,
      "dominant-baseline": "middle",
      transform: `rotate(${s.turn} ${r1(s.x)} ${r1(s.y)})`,
      "font-family": c.style.fontFamily,
      "font-size": SIZE,
      "font-style": "italic",
      "letter-spacing": SPACING,
      fill: c.ink,
    },
    [s.name],
  );
}

export function bandNames(c: RibbonContext, input: RibbonInput, layout: RibbonLayout): SvgNode[] {
  if (c.paint === null) return [];
  const bordered = input.events.some((e) => e.kind === "border" && stripFor(layout, e.dist) !== null);
  return (bordered ? atTheLines(input, layout) : bookends(input, layout)).map((s) => nameNode(c, s));
}
