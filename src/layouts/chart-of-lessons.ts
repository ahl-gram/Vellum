import { PIP_R, PLACES, ROADS, TRACKS, roadPath, type PlaceRank } from "./atelier-chart.ts";
import { ROUTE_NAMES } from "./nav.ts";

export interface ChartStep {
  readonly id: string;
  readonly only?: "touch" | "motion";
}
export interface ChartLesson {
  readonly steps: readonly ChartStep[];
}
export interface ChartRoom {
  readonly id: string;
  readonly route: string;
  readonly lessons: readonly ChartLesson[];
}
export interface Box {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}
export interface Arc {
  readonly from: number;
  readonly to: number;
  readonly step: string;
  readonly lesson: number;
}
export interface Ring {
  readonly r: number;
  readonly arcs: readonly Arc[];
}
export interface Mark {
  readonly step: string;
  readonly only?: "touch" | "motion";
  readonly d: string;
  readonly hand: string;
  readonly side: "east" | "west";
}
export interface Label {
  readonly route: string;
  readonly text: string;
  readonly size: number;
  readonly x: number;
  readonly y: number;
  readonly anchor: "start" | "middle" | "end";
  readonly side: "above" | "right" | "left" | "below";
  readonly forced: boolean;
  readonly box: Box;
}
export interface ChartPlace {
  readonly route: string;
  readonly x: number;
  readonly y: number;
  readonly rank: PlaceRank;
  readonly pip: number;
  readonly room: string | null;
  readonly ring: number | null;
  readonly marks: readonly Mark[];
  readonly halo: number | null;
  readonly label: Label;
}
export interface ChartRoad {
  readonly pair: readonly [string, string];
  readonly d: string;
  readonly rooms: readonly string[];
}
export interface LessonChart {
  readonly frame: Box;
  readonly places: readonly ChartPlace[];
  readonly roads: readonly ChartRoad[];
  readonly tracks: readonly string[];
}

export const SLOT_ARC = 3.3;
export const RING_FLOOR = 9;

const PAD = 1.5;
const RANK: Readonly<Record<PlaceRank, number>> = { capital: 0, landing: 1, town: 2, isle: 3, village: 4 };

const round1 = (v: number): number => Math.round(v * 10) / 10;
const rad = (deg: number): number => (deg * Math.PI) / 180;
const at = (x: number, y: number, r: number, deg: number): { x: number; y: number } => ({
  x: round1(x + r * Math.cos(rad(deg))),
  y: round1(y + r * Math.sin(rad(deg))),
});
const circleBox = (x: number, y: number, c: number): Box => ({ x: x - c, y: y - c, w: 2 * c, h: 2 * c });
const meets = (a: Box, b: Box): boolean =>
  a.x < b.x + b.w + PAD && b.x < a.x + a.w + PAD && a.y < b.y + b.h + PAD && b.y < a.y + a.h + PAD;

export function ringOf(lessons: readonly ChartLesson[]): Ring {
  const slots = lessons.reduce((n, l) => n + l.steps.length + 1, 0);
  const r = round1(Math.max(RING_FLOOR, (slots * SLOT_ARC) / (2 * Math.PI)));
  const per = 360 / slots;
  let slot = 0;
  const arcs = lessons.flatMap((lesson, k) => {
    slot += 1;
    return lesson.steps.map((s) => {
      const from = -90 + slot * per - per / 2 + per * 0.14;
      slot += 1;
      return { from, to: from + per * 0.72, step: s.id, lesson: k };
    });
  });
  return { r, arcs };
}

export function pathFromHome(route: string): readonly (readonly [string, string])[] | null {
  const via = new Map<string, readonly [string, string]>();
  const seen = new Set(["/"]);
  const queue = ["/"];
  for (let here = queue.shift(); here !== undefined; here = queue.shift()) {
    for (const pair of ROADS) {
      const next = pair[0] === here ? pair[1] : pair[1] === here ? pair[0] : null;
      if (next !== null && !seen.has(next)) {
        seen.add(next);
        via.set(next, pair);
        queue.push(next);
      }
    }
  }
  if (!seen.has(route)) return null;
  const legs: (readonly [string, string])[] = [];
  for (let here = route; here !== "/";) {
    const pair = via.get(here);
    if (pair === undefined) return null;
    legs.push(pair);
    here = pair[0] === here ? pair[1] : pair[0];
  }
  return legs;
}

function marksOf(x: number, y: number, ring: Ring, steps: ReadonlyMap<string, ChartStep>): Mark[] {
  return ring.arcs.map((a) => {
    const p = at(x, y, ring.r, a.from);
    const q = at(x, y, ring.r, a.to);
    const mid = (a.from + a.to) / 2;
    const t = at(x, y, ring.r, mid);
    const east = Math.cos(rad(mid)) > 0;
    const only = steps.get(a.step)?.only;
    return {
      step: a.step,
      ...(only === undefined ? {} : { only }),
      d: `M${p.x} ${p.y} A ${ring.r} ${ring.r} 0 0 1 ${q.x} ${q.y}`,
      hand: `translate(${t.x} ${t.y}) rotate(${Math.round(east ? mid : mid + 180)})`,
      side: east ? "east" : "west",
    };
  });
}

interface Body {
  readonly route: string;
  readonly x: number;
  readonly y: number;
  readonly rank: PlaceRank;
  readonly name: string;
  readonly room: ChartRoom | undefined;
  readonly ring: Ring | undefined;
  readonly ext: number;
}

function seat(body: Body, text: string, size: number, obstacles: readonly Box[], placed: readonly Label[]): Label {
  const { x, y, ext } = body;
  const w = text.length * 0.58 * size;
  const up = 0.82 * size;
  const h = 1.07 * size;
  const gap = 3;
  const aboveY = y - ext - gap - 0.25 * size;
  const sideY = y + 0.33 * size;
  const belowY = y + ext + gap + up;
  const base = { route: body.route, text, size, forced: false };
  const above: Label = {
    ...base,
    side: "above",
    anchor: "middle",
    x,
    y: round1(aboveY),
    box: { x: x - w / 2, y: aboveY - up, w, h },
  };
  const all: Label[] = [
    above,
    {
      ...base,
      side: "right",
      anchor: "start",
      x: round1(x + ext + gap),
      y: round1(sideY),
      box: { x: x + ext + gap, y: sideY - up, w, h },
    },
    {
      ...base,
      side: "left",
      anchor: "end",
      x: round1(x - ext - gap),
      y: round1(sideY),
      box: { x: x - ext - gap - w, y: sideY - up, w, h },
    },
    { ...base, side: "below", anchor: "middle", x, y: round1(belowY), box: { x: x - w / 2, y: belowY - up, w, h } },
  ];
  const free = all.find((c) => !obstacles.some((o) => meets(c.box, o)) && !placed.some((p) => meets(c.box, p.box)));
  return free ?? { ...above, forced: true };
}

export function chartOfLessons(rooms: readonly ChartRoom[]): LessonChart {
  const roomOf = new Map<string, ChartRoom>();
  for (const room of rooms) {
    if (!(room.route in PLACES)) throw new Error(`no place on the chart of the atelier for ${room.route}`);
    roomOf.set(room.route, room);
  }
  const bodies: Body[] = Object.entries(PLACES).map(([route, place]) => {
    const room = roomOf.get(route);
    const ring = room === undefined ? undefined : ringOf(room.lessons);
    return { route, ...place, room, ring, ext: ring === undefined ? PIP_R[place.rank] : ring.r + 2 };
  });
  const obstacles = bodies.map((b) => circleBox(b.x, b.y, b.ext));
  const order = bodies
    .map((b, i) => ({ b, i, key: (b.room === undefined ? 10 : 0) + RANK[b.rank] }))
    .sort((p, q) => p.key - q.key || p.i - q.i);
  const placed: Label[] = [];
  for (const { b } of order) {
    const text = ROUTE_NAMES[b.route] ?? b.name;
    placed.push(seat(b, text, b.room !== undefined || b.route === "/" ? 12 : 10.3, obstacles, placed));
  }
  const places: ChartPlace[] = bodies.map((b) => {
    const steps = new Map(b.room?.lessons.flatMap((l) => l.steps.map((s) => [s.id, s] as const)));
    return {
      route: b.route,
      x: b.x,
      y: b.y,
      rank: b.rank,
      pip: PIP_R[b.rank],
      room: b.room?.id ?? null,
      ring: b.ring?.r ?? null,
      marks: b.ring === undefined ? [] : marksOf(b.x, b.y, b.ring, steps),
      halo: b.ring === undefined ? null : Math.max(16, b.ring.r + 2 + 5),
      label: placed.find((l) => l.route === b.route) as Label,
    };
  });
  const walks = rooms.map((room) => ({ id: room.id, legs: pathFromHome(room.route) ?? [] }));
  const roads = ROADS.map((pair) => ({
    pair,
    d: roadPath(pair),
    rooms: walks.filter((w) => w.legs.some((leg) => leg[0] === pair[0] && leg[1] === pair[1])).map((w) => w.id),
  }));
  const boxes = [
    ...obstacles,
    ...places.map((p) => p.label.box),
    ...places.flatMap((p) => (p.halo === null ? [] : [circleBox(p.x, p.y, p.halo)])),
  ];
  const x0 = Math.min(...boxes.map((b) => b.x)) - 10;
  const x1 = Math.max(...boxes.map((b) => b.x + b.w), 470) + 14;
  const y0 = Math.min(...boxes.map((b) => b.y)) - 10;
  const y1 = Math.max(...boxes.map((b) => b.y + b.h), 372) + 30;
  return {
    frame: { x: Math.round(x0), y: Math.round(y0), w: Math.round(x1 - x0), h: Math.round(y1 - y0) },
    places,
    roads,
    tracks: TRACKS.map((pair) => roadPath(pair)),
  };
}
