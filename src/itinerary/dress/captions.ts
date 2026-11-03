import { el, type SvgNode } from "../../render/svg.ts";
import { r1 } from "../../prospect/dress/context.ts";
import { textBox, WIDTH_FACTOR, type Box } from "../../render/geometry.ts";
import { CELLS_PER_LEAGUE } from "../../render/layers/scalebar.ts";
import type { RibbonInput } from "../input.ts";
import { tierTag } from "../prose.ts";
import type { RibbonEvent } from "../events.ts";
import { stripPos, type StripLayout } from "./layout.ts";
import type { RibbonContext } from "./context.ts";
import type { StripBody } from "./cloth.ts";
import { seatCaption, type Seat, type SeatKeep, type SeatLine, type SeatRoom, type SeatWant } from "./seats.ts";

// 2026-11-03, 469 distinct caption lines over every reachable pair of seeds 2 7 11 15 42 99 123 2024, measured in a browser in Iowan Old Style, Palatino and Georgia: real letters run at most 8.47 past the house estimate (Palatino, NUMOWOPUA at 10.5), so 9 inside the edge keeps them on the strip.
export const CAPTION_EDGE = 9;

const CASING_HALF = { painted: 4.2, plain: 2.3 };
const CLUSTER_BOX: Record<string, Box> = {
  capital: { x: -11.5, y: -11.6, w: 23, h: 14.8 },
  town: { x: -9, y: -9.6, w: 18.7, h: 11.1 },
  village: { x: -6.7, y: -5.4, w: 13.3, h: 5.9 },
  hamlet: { x: -2.6, y: -5.1, w: 5.2, h: 5.1 },
};

export type CaptionLine = { text: string; caps?: boolean; size?: number };
export type FirstSeat = { sx: number; sy: number; side: -1 | 1; lines: ReadonlyArray<CaptionLine> };
export type CaptionsLaid = {
  readonly seats: ReadonlyArray<Seat>;
  readonly track: { readonly left: number; readonly right: number };
};

export function wrapLine(text: string, at = 17): string[] {
  const lines: string[] = [];
  let cur = "";
  for (const word of text.split(" ")) {
    if (cur.length > 0 && cur.length + word.length > at) {
      lines.push(cur);
      cur = word;
    } else cur = cur.length === 0 ? word : `${cur} ${word}`;
  }
  if (cur.length > 0) lines.push(cur);
  return lines;
}

function waypointLines(e: Extract<RibbonEvent, { kind: "waypoint" }>, caption: string): CaptionLine[] {
  const lines: CaptionLine[] = e.endpoint
    ? [{ text: caption, caps: true, size: 10.5 }]
    : [
        { text: caption, caps: true, size: 8.6 },
        { text: tierTag(e.tier), size: 7.6 },
      ];
  return lines;
}

export function captionSeat(
  e: RibbonEvent,
  p: { sx: number; sy: number },
  freeSide: -1 | 1,
  caption: string,
): FirstSeat {
  switch (e.kind) {
    case "waypoint":
      return { sx: p.sx, sy: p.sy, side: freeSide, lines: waypointLines(e, caption) };
    case "crossing":
      return { sx: p.sx, sy: p.sy - 8, side: freeSide, lines: [{ text: caption }] };
    case "branch":
      return { sx: p.sx + e.side * 20, sy: p.sy - 9, side: e.side, lines: [{ text: caption }] };
    case "summit":
      return { sx: p.sx, sy: p.sy - 10, side: (freeSide * -1) as -1 | 1, lines: [{ text: caption }] };
  }
}

export function captionRoom(c: RibbonContext, strip: StripLayout, body: StripBody): SeatRoom {
  const top = strip.y0 + 22;
  if (c.paint !== null) {
    return {
      left: (y) => body.left(y) + CAPTION_EDGE,
      right: (y) => body.right(y) - CAPTION_EDGE,
      top,
      bottom: strip.y0 + strip.h,
    };
  }
  return {
    left: () => strip.x0 + CAPTION_EDGE,
    right: () => strip.x0 + strip.w - CAPTION_EDGE,
    top,
    bottom: strip.y0 + strip.h - 3.5,
  };
}

function townSpans(input: RibbonInput, strip: StripLayout, half: number): SeatKeep["lines"] {
  const solidSpan = Math.min(2.2, 30 / strip.pxPerCell);
  return input.events.flatMap((e) => {
    if (e.kind !== "waypoint" || e.dist < strip.d0 - 0.75 || e.dist > strip.d1 + 0.75) return [];
    const a = stripPos(strip, Math.max(strip.d0, e.dist - solidSpan));
    const b = stripPos(strip, Math.min(strip.d1, e.dist + solidSpan));
    const len = Math.hypot(b.sx - a.sx, b.sy - a.sy);
    if (len < 2) return [];
    return [-half, half].map((off) => {
      const nx = (-(b.sy - a.sy) / len) * off;
      const ny = ((b.sx - a.sx) / len) * off;
      return {
        pts: [
          { sx: a.sx + nx, sy: a.sy + ny },
          { sx: b.sx + nx, sy: b.sy + ny },
        ],
        clear: 0.6,
      };
    });
  });
}

function leagues(strip: StripLayout): number[] {
  const first = Math.max(1, Math.ceil(strip.d0 / CELLS_PER_LEAGUE));
  const last = Math.floor(strip.d1 / CELLS_PER_LEAGUE);
  return Array.from({ length: Math.max(0, last - first + 1) }, (_, i) => first + i);
}

function leagueKeep(c: RibbonContext, strip: StripLayout): Pick<SeatKeep, "boxes" | "discs"> {
  const discs = leagues(strip).map((l) => {
    const p = stripPos(strip, l * CELLS_PER_LEAGUE);
    return { x: p.sx, y: p.sy, r: c.paint !== null ? (l >= 100 ? 5.6 : 4.1) : 1.9 };
  });
  const fives = c.paint !== null ? [] : leagues(strip).filter((l) => l % 5 === 0);
  const boxes = fives.map((l) => {
    const p = stripPos(strip, l * CELLS_PER_LEAGUE);
    return textBox(p.sx + 5.5, p.sy + 2.4, String(l), 7, "start", WIDTH_FACTOR.mixed);
  });
  return { boxes, discs };
}

function eventKeep(input: RibbonInput, strip: StripLayout): Pick<SeatKeep, "boxes" | "lines"> {
  const boxes: Box[] = [];
  const lines: Array<SeatKeep["lines"][number]> = [];
  for (const e of input.events) {
    if (e.dist < strip.d0 || e.dist >= strip.d1) continue;
    const p = stripPos(strip, e.dist);
    if (e.kind === "waypoint") {
      const k = CLUSTER_BOX[e.tier === "farmstead" || e.tier === "mill" ? "hamlet" : e.tier] as Box;
      boxes.push({ x: p.sx + k.x, y: p.sy - 1 + k.y, w: k.w, h: k.h });
    } else if (e.kind === "branch") {
      lines.push({
        pts: [p, { sx: p.sx + e.side * 12, sy: p.sy - 2 }, { sx: p.sx + e.side * 20, sy: p.sy - 9 }],
        clear: 1.5,
      });
    } else if (e.kind === "summit") {
      const freeSide = p.sx > strip.x0 + strip.w / 2 ? -1 : 1;
      boxes.push({ x: p.sx + freeSide * 27 - 9.5, y: p.sy + 4 - 12.6, w: 19, h: 12.6 });
    } else boxes.push({ x: p.sx - 7.5, y: p.sy - 5.5, w: 15, h: 11 });
  }
  return { boxes, lines };
}

export function captionKeep(
  c: RibbonContext,
  input: RibbonInput,
  strip: StripLayout,
  compass: { readonly x: number; readonly y: number },
  isLast: boolean,
): SeatKeep {
  const painted = c.paint !== null;
  const half = painted ? CASING_HALF.painted : CASING_HALF.plain;
  const t = (strip.needleDeg * Math.PI) / 180;
  const markReach = painted ? 20.5 : 17;
  const markRadius = painted ? 5 : 4.5;
  const league = leagueKeep(c, strip);
  const events = eventKeep(input, strip);
  const continuation = isLast
    ? []
    : [
        textBox(
          strip.x0 + strip.w / 2,
          strip.y0 + 12,
          `· ${Math.round(strip.d1 / CELLS_PER_LEAGUE)} leagues ·`,
          7.5,
          "middle",
          WIDTH_FACTOR.mixed,
        ),
      ];
  return {
    boxes: [...events.boxes, ...league.boxes, ...continuation],
    discs: [
      { x: compass.x, y: compass.y, r: painted ? 15.5 : 14 },
      { x: compass.x + markReach * Math.sin(t), y: compass.y - markReach * Math.cos(t), r: markRadius },
      ...league.discs,
    ],
    lines: [{ pts: strip.pts, clear: half + 0.55 }, ...townSpans(input, strip, half), ...events.lines],
  };
}

const nearestRoadX = (strip: StripLayout, y: number, fallback: number): number => {
  let best = strip.pts[0];
  for (const q of strip.pts) if (best === undefined || Math.abs(q.sy - y) < Math.abs(best.sy - y)) best = q;
  return best === undefined ? fallback : best.sx;
};

const linesOf = (spec: ReadonlyArray<CaptionLine>, at: number): SeatLine[] =>
  spec.flatMap((l) => wrapLine(l.text, at).map((text) => ({ text, caps: l.caps === true, size: l.size ?? 8.2 })));

export function layCaption(
  laid: CaptionsLaid,
  e: RibbonEvent,
  p: { readonly sx: number; readonly sy: number },
  freeSide: -1 | 1,
  caption: string,
  strip: StripLayout,
  room: SeatRoom,
  keep: SeatKeep,
): CaptionsLaid {
  const first = captionSeat(e, p, freeSide, caption);
  const lines = linesOf(first.lines, 17);
  const need = lines.reduce((a, l) => a + l.size + 1.2, 0);
  const want: SeatWant = {
    x: first.side < 0 ? first.sx - 10 : first.sx + 10,
    top: Math.max(Math.min(first.sy + 2.6, laid.track[first.side < 0 ? "left" : "right"] - need), strip.y0 + 22),
    side: first.side,
    lines,
    roadX: (y) => nearestRoadX(strip, y, p.sx),
    acrossTop: e.kind === "waypoint" ? p.sy + 2.6 : p.sy + 6,
    sticky: e.kind === "branch",
    rewrap: (at) => (e.kind === "crossing" || e.kind === "summit" ? linesOf(first.lines, at) : lines),
  };
  const seat = seatCaption(want, room, { ...keep, boxes: [...keep.boxes, ...laid.seats.flatMap((s) => s.boxes)] });
  const track = seat.backed ? laid.track : { ...laid.track, [seat.anchor === "end" ? "left" : "right"]: seat.top - 4 };
  return { seats: [...laid.seats, seat], track };
}

export function captionNode(c: RibbonContext, seat: Seat): SvgNode {
  const backing = {
    stroke: c.paint !== null ? c.paint.landWash : c.style.paper,
    "stroke-width": 2.4,
    "stroke-linejoin": "round",
    "paint-order": "stroke",
  };
  let dy = 0;
  return el(
    "g",
    { class: "caption" },
    seat.lines.map((line) => {
      const size = line.size * seat.scale;
      dy += size + 1.2;
      return el(
        "text",
        {
          x: r1(seat.x),
          y: r1(seat.top + dy - 1.2),
          "text-anchor": seat.anchor,
          "font-family": c.style.fontFamily,
          "font-size": r1(size),
          "font-style": line.caps ? "normal" : "italic",
          ...(line.caps ? { "letter-spacing": 0.8 } : {}),
          ...(seat.backed ? backing : {}),
          fill: c.ink,
        },
        [line.caps ? line.text.toUpperCase() : line.text],
      );
    }),
  );
}
