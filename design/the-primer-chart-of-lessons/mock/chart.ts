// Issue #1256 round: the chart of lessons drawn from the real data, every answer the menu offers a parameter. Places, roads, tracks and coast are `PLACES`, `ROADS`, `TRACKS` and `COAST` (`src/layouts/atelier-chart.ts`); rooms, lessons and steps are `LADDERS` in the order `primerPage` seats them (`src/site/primer/page.ts`); a step's seal is a bare id in the reader's set, as `parseSeals` reads it; whether a step can apply here is `applies` (`src/site/shared/primer/hand-steps.ts`).
import { COAST, PIP_R, PLACES, ROADS, TRACKS, roadPath, type Place } from "../../../src/layouts/atelier-chart.ts";
import { ROUTE_NAMES } from "../../../src/layouts/nav.ts";
import { LADDERS } from "../../../src/site/shared/primer/ladders.ts";
import { applies, type Device } from "../../../src/site/shared/primer/hand-steps.ts";
import { MARKS } from "../../../src/site/shared/primer/hand-words.ts";
import type { Ladder, Lesson } from "../../../src/site/shared/primer/shape.ts";
import { primerPage, roomIdOf } from "../../../src/site/primer/page.ts";
import { WAY_R, arcPath, lessonSpots, pointAt, ringOf, type Spot } from "./layout.ts";
import { placeLabels, type Box, type Placed } from "./labels.ts";

export type Grain = "lesson" | "steps";
export type Ink = "lessons" | "roads" | "route";
export type DeviceRule = "here" | "every";
export type Marks = "hand" | "here";
export type Names = "rooms" | "chart";
export type Others = "pale" | "none";

export interface ChartOptions {
  readonly grain: Grain;
  readonly ink: Ink;
  readonly device: DeviceRule;
  readonly marks: Marks;
  readonly names: Names;
  readonly others: Others;
  readonly sealed: ReadonlySet<string>;
  readonly open: string;
  readonly now: Device;
  readonly label: number;
  readonly links: boolean;
  readonly ladders?: readonly Ladder[];
  readonly places?: Readonly<Record<string, Place>>;
}

export const ROMAN = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi", "xii", "xiii", "xiv", "xv", "xvi"];
const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

export type LessonState = "done" | "begun" | "none";

export function lessonState(lesson: Lesson, o: Pick<ChartOptions, "sealed" | "device" | "now">): LessonState {
  const counted = lesson.steps.filter((s) => o.device === "every" || applies(s.only, o.now));
  const n = counted.filter((s) => o.sealed.has(s.id)).length;
  return n === counted.length && n > 0 ? "done" : lesson.steps.some((s) => o.sealed.has(s.id)) ? "begun" : "none";
}

export const roomOfId = (id: string): string => {
  const r = primerPage().rooms.find((x) => x.id === id);
  if (r === undefined) throw new Error(`no room ${id}`);
  return r.route;
};

export function nextStep(ladder: Ladder, o: Pick<ChartOptions, "sealed" | "now">): { lesson: number; step: string } | null {
  for (const [k, lesson] of ladder.lessons.entries())
    for (const s of lesson.steps) if (!o.sealed.has(s.id) && applies(s.only, o.now)) return { lesson: k, step: s.id };
  return null;
}

const nameOf = (route: string, place: Place, names: Names): string =>
  names === "chart" ? place.name : (ROUTE_NAMES[route] ?? place.name);

export function pathFromHome(route: string): readonly (readonly [string, string])[] | null {
  const prev = new Map<string, readonly [string, string]>();
  const seen = new Set(["/"]);
  const queue = ["/"];
  while (queue.length > 0) {
    const here = queue.shift()!;
    for (const pair of ROADS) {
      const next = pair[0] === here ? pair[1] : pair[1] === here ? pair[0] : null;
      if (next !== null && !seen.has(next)) {
        seen.add(next);
        prev.set(next, pair);
        queue.push(next);
      }
    }
  }
  if (!seen.has(route)) return null;
  const legs: (readonly [string, string])[] = [];
  for (let r = route; r !== "/"; ) {
    const pair = prev.get(r)!;
    legs.push(pair);
    r = pair[0] === r ? pair[1] : pair[0];
  }
  return legs;
}

const routeLeg = (p: Place, q: Place): string =>
  `M${p.x} ${p.y} Q ${(p.x + q.x) / 2 - 14} ${(p.y + q.y) / 2 + 12} ${q.x} ${q.y}`;

interface Body {
  readonly route: string;
  readonly p: Place;
  readonly ladder: Ladder | undefined;
  readonly ext: number;
  readonly els: readonly string[];
  readonly boxes: readonly Box[];
}

const circleBox = (x: number, y: number, r: number): Box => ({ x: x - r, y: y - r, w: 2 * r, h: 2 * r });

function wayEl(route: string, lesson: Lesson, k: number, s: Spot, o: ChartOptions): string {
  const st = lessonState(lesson, o);
  const body = `<circle cx="${s.x}" cy="${s.y}" r="${WAY_R}"/><text x="${s.x}" y="${s.y + 2.7}">${ROMAN[k]}</text><title>${esc(`${ROMAN[k]} · ${lesson.title}`)}</title>`;
  return o.links ? `<a class="col-way ${st}" href="#${roomIdOf(route)}-${lesson.id}">${body}</a>` : `<g class="col-way ${st}">${body}</g>`;
}

function bodyOf(route: string, p: Place, ladder: Ladder | undefined, o: ChartOptions): Body {
  const pip = `<circle class="pip" cx="${p.x}" cy="${p.y}" r="${PIP_R[p.rank]}"/>`;
  if (ladder === undefined) return { route, p, ladder, ext: PIP_R[p.rank], els: [pip], boxes: [circleBox(p.x, p.y, PIP_R[p.rank])] };
  if (o.grain === "steps") {
    const ring = ringOf(ladder);
    const els = ring.arcs.map((a) => {
      const step = ladder.lessons[a.lesson]!.steps.find((s) => s.id === a.step)!;
      const cls = o.sealed.has(a.step) ? "sealed" : applies(step.only, o.now) || o.device === "every" ? "open" : "elsewhere";
      return `<path class="col-tick ${cls}" d="${arcPath(p.x, p.y, ring.r, a)}"/>`;
    });
    return { route, p, ladder, ext: ring.r + 2, els: [pip, ...els], boxes: [circleBox(p.x, p.y, ring.r + 2)] };
  }
  if (ladder.lessons.length === 1) {
    const lone = wayEl(route, ladder.lessons[0]!, 0, { x: p.x, y: p.y, deg: 90 }, o);
    return { route, p, ladder, ext: WAY_R, els: [lone], boxes: [circleBox(p.x, p.y, WAY_R)] };
  }
  const spots = lessonSpots(p.x, p.y, ladder.lessons.length);
  const els = ladder.lessons.map((lesson, k) => wayEl(route, lesson, k, spots[k]!, o));
  const ext = Math.max(...spots.map((s) => Math.hypot(s.x - p.x, s.y - p.y))) + WAY_R;
  return {
    route,
    p,
    ladder,
    ext,
    els: [pip, ...els],
    boxes: [circleBox(p.x, p.y, PIP_R[p.rank]), ...spots.map((s) => circleBox(s.x, s.y, WAY_R))],
  };
}

function handEl(body: Body, o: ChartOptions): string {
  const ladder = body.ladder;
  if (ladder === undefined) return "";
  const next = nextStep(ladder, o);
  if (next === null) return "";
  const { p } = body;
  let target: Spot;
  let ring: number;
  if (o.grain === "steps") {
    const r = ringOf(ladder);
    const a = r.arcs.find((x) => x.step === next.step)!;
    target = pointAt(p.x, p.y, r.r, (a.from + a.to) / 2);
    ring = 4.4;
  } else if (ladder.lessons.length === 1) {
    target = { x: p.x, y: p.y, deg: 0 };
    ring = WAY_R + 1.9;
  } else {
    target = lessonSpots(p.x, p.y, ladder.lessons.length)[next.lesson]!;
    ring = WAY_R + 1.9;
  }
  const dir = target.deg;
  const tip = pointAt(target.x, target.y, ring + 1.2, dir);
  const east = Math.cos((dir * Math.PI) / 180) > 0;
  const rot = Math.round(east ? dir : dir + 180);
  const glyph = east ? "&#x261C;" : "&#x261E;";
  return `<g class="col-next"><circle class="ring-a" cx="${target.x}" cy="${target.y}" r="${ring}"/><circle class="ring-b" cx="${target.x}" cy="${target.y}" r="${ring}"/><text transform="translate(${tip.x} ${tip.y}) rotate(${rot})" text-anchor="${east ? "start" : "end"}" dy="0.36em">${glyph}</text></g>`;
}

const RANK: Readonly<Record<string, number>> = { capital: 0, landing: 1, town: 2, isle: 3, village: 4 };
const rankOrder = (b: Body): number => (b.ladder === undefined ? 10 : 0) + (RANK[b.p.rank] ?? 5);

export interface Drawn {
  readonly svg: string;
  readonly frame: Box;
  readonly labels: readonly Placed[];
}

export function drawChart(o: ChartOptions): Drawn {
  const places = o.places ?? PLACES;
  const ladders = o.ladders ?? LADDERS;
  const taught = new Map(ladders.map((l) => [l.route, l]));
  const shown = Object.keys(places).filter((r) => taught.has(r) || r === "/" || o.others === "pale");
  const bodies = shown.map((r) => bodyOf(r, places[r]!, taught.get(r), o));
  const L = o.label;
  const labels =
    L > 0
      ? placeLabels(
          [...bodies].sort((a, b) => rankOrder(a) - rankOrder(b)).map((b) => ({
            route: b.route,
            x: b.p.x,
            y: b.p.y,
            ext: b.ext,
            text: nameOf(b.route, b.p, o.names),
            size: b.ladder === undefined && b.route !== "/" ? Math.round(L * 0.86 * 10) / 10 : L,
          })),
          bodies.flatMap((b) => b.boxes),
        )
      : [];
  const sealedRooms = new Set(ladders.filter((l) => l.lessons.some((x) => x.steps.some((s) => o.sealed.has(s.id)))).map((l) => l.route));
  const roads = ROADS.filter(([a, b]) => shown.includes(a) && shown.includes(b));
  const inked = new Set<string>();
  if (o.ink === "roads") for (const r of sealedRooms) for (const pair of pathFromHome(r) ?? []) inked.add(pair.join(">"));
  const roadEls = roads.map((pair) => `<path class="col-road${inked.has(pair.join(">")) ? " inked" : ""}" d="${roadPath(pair)}"/>`).join("");
  const trackEls = TRACKS.filter(([a, b]) => shown.includes(a) && shown.includes(b))
    .map((pair) => `<path class="col-road track" d="${roadPath(pair)}"/>`)
    .join("");
  let routeEls = "";
  if (o.ink === "route") {
    const seq = ["/", ...primerPage().rooms.map((r) => r.route)];
    routeEls = seq
      .slice(1)
      .map((r, i) => `<path class="col-route${sealedRooms.has(r) ? " inked" : ""}" d="${routeLeg(places[seq[i]!]!, places[r]!)}"/>`)
      .join("");
  }
  const openBody = bodies.find((b) => b.route === o.open);
  const halo = openBody === undefined ? 0 : Math.max(16, openBody.ext + 5);
  const under =
    openBody === undefined
      ? ""
      : o.marks === "here"
        ? `<g class="col-here"><circle cx="${openBody.p.x}" cy="${openBody.p.y}" r="${halo}"/></g>`
        : `<circle class="col-open" cx="${openBody.p.x}" cy="${openBody.p.y}" r="${halo}"/>`;
  const hereWords =
    openBody !== undefined && o.marks === "here"
      ? `<g class="col-here"><path d="M${openBody.p.x} ${openBody.p.y + halo + 2} L${openBody.p.x} ${openBody.p.y + halo + 9}"/><text x="${openBody.p.x}" y="${openBody.p.y + halo + 9 + L}">you are here</text></g>`
      : "";
  const hand = openBody !== undefined && o.marks === "hand" ? handEl(openBody, o) : "";
  const placeEls = bodies
    .map((b) => {
      const lone = b.ladder !== undefined && b.ladder.lessons.length === 1 && o.grain === "lesson";
      const cls = `col-place ${b.p.rank}${b.ladder === undefined ? " untaught" : ""}${lone ? " lone" : ""}`;
      const lab = labels.find((l) => l.route === b.route);
      const text =
        lab === undefined
          ? `<title>${esc(nameOf(b.route, b.p, o.names))}</title>`
          : `<text class="name" x="${lab.tx}" y="${lab.ty}" style="font-size:${lab.size}px;text-anchor:${lab.anchor}">${esc(lab.text)}</text>`;
      const [first, ...rest] = b.els;
      const own = lone ? text : `${first}${text}`;
      const ways = lone ? b.els.join("") : rest.join("");
      const linked = o.links && b.ladder !== undefined ? `<a href="#${roomIdOf(b.route)}">${own}</a>` : own;
      return `<g class="${cls}">${linked}${ways}</g>`;
    })
    .join("");
  const boxes = [...bodies.flatMap((b) => b.boxes), ...labels.map((l) => l.box)];
  if (openBody !== undefined) boxes.push(circleBox(openBody.p.x, openBody.p.y, halo));
  const x0 = Math.min(...boxes.map((b) => b.x)) - 10;
  const x1 = Math.max(...boxes.map((b) => b.x + b.w), 470) + 14;
  const y0 = Math.min(...boxes.map((b) => b.y)) - 10;
  const y1 = Math.max(...boxes.map((b) => b.y + b.h), 372) + (L > 0 ? 30 : 10);
  const frame = { x: Math.round(x0), y: Math.round(y0), w: Math.round(x1 - x0), h: Math.round(y1 - y0) };
  const rose = `<g class="col-rose" transform="translate(${frame.x + frame.w - 24} ${frame.y + frame.h - 26})"><circle r="12"/><path d="M0 -12 L2.8 -2.8 L12 0 L2.8 2.8 L0 12 L-2.8 2.8 L-12 0 L-2.8 -2.8 Z"/><text y="-16">N</text></g>`;
  const title = L > 0 ? `<text class="col-title" x="${frame.x + 16}" y="${frame.y + frame.h - 10}">A Chart of the Lessons</text>` : "";
  const svg = `<svg class="col-chart" viewBox="${frame.x} ${frame.y} ${frame.w} ${frame.h}" role="img" aria-label="The chart of lessons" style="--col-label:${L}px">
<path class="col-sea" d="${COAST}"/><path class="col-land" d="${COAST}"/>
${roadEls}${trackEls}${routeEls}${under}
${placeEls}${hereWords}${hand}${L > 0 ? rose : ""}${title}</svg>`;
  return { svg, frame, labels };
}

export const chartSvg = (o: ChartOptions): string => drawChart(o).svg;

export function lessonCard(route: string, o: ChartOptions): string {
  const ladder = (o.ladders ?? LADDERS).find((l) => l.route === route);
  if (ladder === undefined) throw new Error(`no ladder for ${route}`);
  const id = roomIdOf(route);
  const next = nextStep(ladder, o);
  const rows = ladder.lessons
    .map((lesson, k) => {
      const st = lessonState(lesson, o);
      const done = lesson.steps.filter((s) => o.sealed.has(s.id)).length;
      const away = lesson.steps.filter((s) => !applies(s.only, o.now)).map((s) => (s.only === "touch" ? MARKS.touch : MARKS.motion));
      const tail = away.length > 0 ? `<span class="cc-away">${away.length === 1 ? "one" : away.length} ${away[0]}</span>` : "";
      return `<li class="${st}"><span class="cc-n">${ROMAN[k]}</span><a href="#${id}-${lesson.id}">${esc(lesson.title)}</a><em>${done} of ${lesson.steps.length}${tail}</em></li>`;
    })
    .join("");
  const go =
    next === null
      ? ""
      : `<p class="cc-go"><a href="#${next.step}">Go on at ${ROMAN[next.lesson]} · ${esc(ladder.lessons[next.lesson]!.title)}</a></p>`;
  const count = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"][ladder.lessons.length] ?? String(ladder.lessons.length);
  return `<div class="col-card"><p class="cc-verb">${count} ${ladder.lessons.length === 1 ? "lesson" : "lessons"} at</p><p class="cc-name">${esc(ROUTE_NAMES[route] ?? route)}</p><ol>${rows}</ol>${go}</div>`;
}
