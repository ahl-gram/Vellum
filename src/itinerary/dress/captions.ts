import { el, type SvgNode } from "../../render/svg.ts";
import { r1 } from "../../prospect/dress/context.ts";
import { textBox, WIDTH_FACTOR, type Box } from "../../render/geometry.ts";
import type { RibbonInput } from "../input.ts";
import { tierTag } from "../prose.ts";
import type { RibbonEvent } from "../events.ts";
import { freeSideOf, stripPos, type StripLayout } from "./layout.ts";
import {
  continuationLabel,
  fifthNumeral,
  leagueMarkReach,
  leaguesOn,
  PAINTED_ROAD_HALF,
  ROAD_HALF,
  sideRoadStub,
  townSpanEnds,
} from "./road.ts";
import { clusterSeat, crossingMarkBox, summitMountain } from "./glyphs.ts";
import { compassDiscs } from "./compass.ts";
import type { RibbonContext } from "./context.ts";
import type { StripBody } from "./cloth.ts";
import { seatCaption, type Seat, type SeatKeep, type SeatLine, type SeatRoom, type SeatWant } from "./seats.ts";

// 2026-11-03, 469 distinct caption lines over every reachable pair of seeds 2 7 11 15 42 99 123 2024, measured in a browser in Iowan Old Style, Palatino and Georgia: real letters run at most 8.47 past the house estimate (Palatino, NUMOWOPUA at 10.5), so 9 inside the edge keeps them on the strip.
export const CAPTION_EDGE = 9;

const REWRAPPED: ReadonlySet<RibbonEvent["kind"]> = new Set(["crossing", "summit", "border", "forest"]);

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
    case "border":
    case "forest":
      return { sx: p.sx, sy: p.sy - 8, side: freeSide, lines: [{ text: caption }] };
    case "branch":
      return { ...sideRoadStub(p, e.side).end, side: e.side, lines: [{ text: caption }] };
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
  return input.events.flatMap((e) => {
    const span = e.kind === "waypoint" ? townSpanEnds(strip, e.dist) : null;
    if (span === null) return [];
    const { a, b, len } = span;
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

function leagueKeep(c: RibbonContext, strip: StripLayout): Pick<SeatKeep, "boxes" | "discs"> {
  const marks = leaguesOn(strip);
  const discs = marks.map(({ l, p }) => ({ x: p.sx, y: p.sy, r: leagueMarkReach(l, c.paint !== null) + 0.5 }));
  const boxes =
    c.paint !== null
      ? []
      : marks.flatMap(({ l, p }) => {
          const n = fifthNumeral(p, l);
          return n === null ? [] : [textBox(n.x, n.y, n.text, n.size, "start", WIDTH_FACTOR.mixed)];
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
      boxes.push(clusterSeat(p, e.tier).box);
    } else if (e.kind === "branch") {
      const stub = sideRoadStub(p, e.side);
      lines.push({ pts: [p, stub.bend, stub.end], clear: 1.5 });
    } else if (e.kind === "summit") {
      boxes.push(summitMountain(p, freeSideOf(strip, p.sx)).box);
    } else if (e.kind === "crossing") boxes.push(crossingMarkBox(p));
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
  const half = painted ? PAINTED_ROAD_HALF : ROAD_HALF;
  const league = leagueKeep(c, strip);
  const events = eventKeep(input, strip);
  const label = continuationLabel(strip, isLast);
  const continuation =
    label === null ? [] : [textBox(label.x, label.y, label.text, label.size, "middle", WIDTH_FACTOR.mixed)];
  return {
    boxes: [...events.boxes, ...league.boxes, ...continuation],
    discs: [...compassDiscs(painted, compass.x, compass.y, strip.needleDeg), ...league.discs],
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
    top: Math.max(
      Math.min(
        e.kind === "border" ? p.sy - 3 - need : first.sy + 2.6,
        laid.track[first.side < 0 ? "left" : "right"] - need,
      ),
      room.top,
    ),
    side: first.side,
    lines,
    roadX: (y) => nearestRoadX(strip, y, p.sx),
    acrossTop: e.kind === "waypoint" ? p.sy + 2.6 : p.sy + 6,
    sticky: e.kind === "branch",
    rewrap: (at) => (REWRAPPED.has(e.kind) ? linesOf(first.lines, at) : lines),
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
