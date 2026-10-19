import { el, type SvgNode } from "../../render/svg.ts";
import type { Rng } from "../../core/rng.ts";
import type { Arms } from "../../society/heraldry.ts";
import {
  BACK_ROW_RAISE,
  groundAt,
  VIEW_X0,
  VIEW_X1,
  type ForegroundElement,
  type Ground,
  type Mass,
  type ProspectGeometry,
  type Pt,
  type WallSegment,
} from "../geometry.ts";
import type { ProspectKind } from "../input.ts";
import type { PlateEra } from "../caption.ts";
import {
  birdFlock,
  groundSweep,
  hillTone,
  poly,
  r1,
  skyLines,
  stroke,
  treeClump,
  washOr,
  yOnPolyline,
  type Cloud,
  type Engraver,
  type Gap,
} from "./burin.ts";
import { foregroundEngraved, massIsChurch, massNodesEngraved, wallNodesEngraved, waterEngraved } from "./townscape.ts";

export type Box = { readonly x0: number; readonly x1: number; readonly y0: number; readonly y1: number };

/** The round's layout for E (design/prospects-after-braun-hogenberg/mock/direction-rise.ts, LAYOUT_E): the town lifted into the upper third, the bay deepened, the rise in the near ground. */
export const LIFT = -70;
export const WATER_BOTTOM = 268;
export const RISE_TOP: ReadonlyArray<Pt> = [
  { x: VIEW_X0, y: 250 },
  { x: VIEW_X0 + 80, y: 232 },
  { x: VIEW_X0 + 170, y: 218 },
  { x: VIEW_X0 + 270, y: 226 },
  { x: VIEW_X1 - 120, y: 238 },
  { x: VIEW_X1, y: 258 },
];
export const RISE_BOTTOM = 358;
export const SKY_TOP = 92;
const CLOUD_AVOID = [{ x0: 150, x1: 370 }];
const BIRD_TOP = 96;

export type Streams = {
  readonly sky: Rng;
  readonly town: Rng;
  readonly water: Rng;
  readonly rise: Rng;
  readonly figures: Rng;
};

export type Scene = {
  readonly g: ProspectGeometry;
  readonly kind: ProspectKind;
  readonly era: PlateEra;
  readonly arms: Arms | null;
  readonly roadCount: number;
  readonly beast: boolean;
  readonly clear: ReadonlyArray<Box>;
};

function cloudsFor(rng: Rng, horizon: number): Cloud[] {
  const n = 2 + Math.floor(rng.next() * 2);
  const out: Cloud[] = [];
  for (let i = 0; i < n * 3 && out.length < n; i++) {
    const c = {
      x: VIEW_X0 + 60 + rng.next() * (VIEW_X1 - VIEW_X0 - 120),
      y: SKY_TOP + 14 + rng.next() * Math.max(10, (horizon - SKY_TOP) * 0.5),
      w: 70 + rng.next() * 90,
      h: 7 + rng.next() * 6,
    };
    if (!CLOUD_AVOID.some((a) => c.x + c.w / 2 > a.x0 && c.x - c.w / 2 < a.x1)) out.push(c);
  }
  return out;
}

function ridgeEngraved(e: Engraver, ridge: ReadonlyArray<Pt>, horizon: number, rng: Rng): SvgNode[] {
  const out: SvgNode[] = hillTone(e, ridge, horizon, rng);
  for (let i = 0; i < 26; i++) {
    const x = VIEW_X0 + 10 + rng.next() * (VIEW_X1 - VIEW_X0 - 20);
    const h = horizon - yOnPolyline(ridge, x);
    if (h < 6) continue;
    const t = rng.next();
    out.push(...treeClump(e, x, horizon - h * t * t, 0.9 + (1 - t) * 1.4, rng));
  }
  return out;
}

type Sky = { readonly obstacles: ReadonlyArray<Box>; readonly topAt: (x: number) => number };

function openSky(x0: number, y: number, n: number, sky: Sky): { readonly x: number; readonly y: number } | null {
  const free = (x: number, yy: number): boolean => {
    const f = flockBox(x, yy, n);
    if (sky.obstacles.some((c) => f.x0 < c.x1 && c.x0 < f.x1 && f.y0 < c.y1 && c.y0 < f.y1)) return false;
    for (let px = f.x0; px <= f.x1; px += 1) if (f.y1 >= sky.topAt(px)) return false;
    return true;
  };
  for (let yy = y; yy >= Math.min(y, BIRD_TOP); yy -= 8) {
    for (let k = 0; k <= 40; k++) {
      for (const x of k === 0 ? [x0] : [x0 + 12 * k, x0 - 12 * k])
        if (x >= VIEW_X0 + 6 && x <= VIEW_X1 - 6 - 5 * n && free(x, yy)) return { x, y: yy };
    }
  }
  return null;
}

type Bird = { readonly x: number; readonly y: number; readonly s: number };

function heldBird(b: Bird, sky: Sky): Bird | null {
  const at = openSky(b.x, Math.max(b.y + LIFT, BIRD_TOP), 2 + Math.floor(b.s * 3), sky);
  return at === null ? null : { x: at.x, y: at.y - LIFT, s: b.s };
}

const holdBirds = (f: ForegroundElement, sky: Sky): ForegroundElement =>
  f.kind === "birds" ? { ...f, items: f.items.flatMap((b) => heldBird(b, sky) ?? []) } : f;

function townNodes(e: Engraver, g: ProspectGeometry, rng: Rng): SvgNode[] {
  const split = ((): number => {
    const i = g.masses.findIndex((m) => m.raise < BACK_ROW_RAISE);
    return i === -1 ? g.masses.length : i;
  })();
  const line = g.ground.line;
  const ground: SvgNode[] =
    g.water?.kind === "drowned"
      ? []
      : g.ground.rise > 0
        ? ((): SvgNode[] => {
            const outline = [
              { x: line[0]!.x, y: g.ground.base + 3 },
              ...line,
              { x: line[line.length - 1]!.x, y: g.ground.base + 3 },
            ];
            return [
              el("path", { d: poly(outline), fill: washOr(e, "grass"), ...stroke(e, 1.1) }),
              ...groundSweep(e, outline, 0.35, 2.6, rng, 20),
            ];
          })()
        : [el("path", { d: poly(line, false), fill: "none", ...stroke(e, 1.1) })];
  return [
    ...(g.ridge === null ? [] : ridgeEngraved(e, g.ridge, g.ground.base + 2, rng)),
    ...(g.water === null && e.wash !== null
      ? [
          el("path", {
            d: poly([
              { x: VIEW_X0, y: g.ground.base },
              { x: VIEW_X1, y: g.ground.base },
              { x: VIEW_X1, y: WATER_BOTTOM - LIFT },
              { x: VIEW_X0, y: WATER_BOTTOM - LIFT },
            ]),
            fill: e.wash.grass,
          }),
        ]
      : []),
    ...ground,
    ...g.masses.slice(0, split).flatMap((m) => massNodesEngraved(e, m, 0.8, massIsChurch(m, g))),
    ...g.walls.flatMap((w) => wallNodesEngraved(e, g.ground, w)),
    ...g.masses.slice(split).flatMap((m) => massNodesEngraved(e, m, m.form === "keep" ? 1.2 : 1.0, massIsChurch(m, g))),
  ];
}

export const flockBox = (x: number, y: number, n: number): Box => ({
  x0: x - 3,
  x1: x + 5 * n + 3,
  y0: y - 3,
  y1: y + 6,
});

export const shipRig = (x: number, y: number, s: number, great: boolean): Box => ({
  x0: x - (great ? 19 : 16) * s - 1,
  x1: x + 16 * s + 1,
  y0: y + LIFT - 2.5 * s - (great ? 24 : 18) * s * 1.15 - 3.2 * s - 1,
  y1: y + LIFT + 3 * s,
});

export const massReach = (m: Mass): Box => {
  const up =
    m.form === "keep"
      ? 21
      : m.form === "tower"
        ? 3.4 + m.w * 0.55
        : m.form === "spire"
          ? Math.max(12, m.h * 0.55) + 5.4
          : 13;
  return { x0: m.x - 2.5, x1: m.x + m.w + 3.5, y0: m.base - m.h - up + LIFT, y1: m.base + LIFT };
};

export const wallReach = (ground: Ground, w: WallSegment): Box => ({
  x0: w.x0 - 4.5,
  x1: w.x1 + 4.5,
  y0: groundAt(ground, Math.max(w.x0, Math.min(w.x1, (VIEW_X0 + VIEW_X1) / 2))) - w.h - 12 + LIFT,
  y1: ground.base + LIFT,
});

export type Skyline = {
  readonly horizonYAt: (x: number) => number;
  readonly hillTopAt: (x: number) => number;
  readonly chordAt: (x: number) => number;
  readonly townRun: readonly [number, number];
  readonly masts: ReadonlyArray<Box>;
  readonly town: ReadonlyArray<Box>;
};

export function skylineOf(g: ProspectGeometry): Skyline {
  const horizon = g.ground.base + 2 + LIFT;
  const ridge = g.ridge;
  const xs = [...g.masses.map((m) => m.x), ...g.walls.map((w) => w.x0)];
  const xe = [...g.masses.map((m) => m.x + m.w), ...g.walls.map((w) => w.x1)];
  const crest = (x: number): number => (ridge === null ? horizon : yOnPolyline(ridge, x) + LIFT);
  const a = ridge?.[0],
    b = ridge?.[ridge.length - 1];
  const chord = (x: number): number =>
    a === undefined || b === undefined || b.x <= a.x || x < a.x || x > b.x
      ? Infinity
      : a.y + ((b.y - a.y) * (x - a.x)) / (b.x - a.x) + LIFT;
  return {
    horizonYAt: crest,
    hillTopAt: (x) => Math.min(crest(x), chord(x)),
    chordAt: chord,
    townRun: xs.length > 0 ? [Math.min(...xs), Math.max(...xe)] : [260, 260],
    masts: g.foreground.flatMap((f): Box[] => {
      if (f.kind === "mastRow")
        return f.masts.map((m) => shipRig(m.x, m.hullY, 0.72 + (m.mastH - 42) / 90, m.mastH > 56));
      if (f.kind === "ship") return [shipRig(f.x, f.y + 1, f.s * 1.15, true)];
      return [];
    }),
    town: [...g.masses.map(massReach), ...g.walls.map((w) => wallReach(g.ground, w))],
  };
}

export type Vignette = Skyline & { readonly nodes: SvgNode[]; readonly birds: ReadonlyArray<Box> };

function vignetteWater(
  e: Engraver,
  s: Streams,
  g: ProspectGeometry,
  engraved: ReadonlyArray<ReturnType<typeof foregroundEngraved>>,
) {
  const gaps: Gap[] = engraved.flatMap((f) => f.gaps).map((h) => ({ ...h, y0: h.y0 + LIFT, y1: h.y1 + LIFT }));
  const river = g.water?.kind === "river";
  const nearBand =
    g.water === null
      ? [
          { x: VIEW_X0, y: g.ground.base },
          { x: VIEW_X1, y: g.ground.base },
          { x: VIEW_X1, y: WATER_BOTTOM - LIFT },
          { x: VIEW_X0, y: WATER_BOTTOM - LIFT },
        ]
      : null;
  const water: SvgNode[] =
    g.water === null
      ? []
      : [
          ...waterEngraved(
            e,
            VIEW_X0,
            VIEW_X1,
            g.water.y0 + LIFT,
            river ? g.water.y1 + LIFT : WATER_BOTTOM,
            gaps,
            s.water,
          ),
          ...(river
            ? [el("path", { d: `M${VIEW_X0} ${r1(g.water.y1 + LIFT)}H${VIEW_X1}`, fill: "none", ...stroke(e, 1.0) })]
            : []),
        ];
  return { nearBand, water };
}

export function vignette(e: Engraver, scene: Scene, s: Streams): Vignette {
  const g = scene.g;
  const horizon = g.ground.base + 2 + LIFT;
  const clouds = cloudsFor(s.sky, horizon);
  const line = skylineOf(g);
  const sky: Sky = { obstacles: [...scene.clear, ...line.town, ...line.masts], topAt: line.hillTopAt };
  const foreground = g.foreground
    .filter((f) => !(scene.beast && f.kind === "seaSerpent"))
    .map((f) => holdBirds(f, sky));
  const engraved = foreground.map((f) => foregroundEngraved(e, f, s.town));
  const { nearBand, water } = vignetteWater(e, s, g, engraved);
  const skyHatch = skyLines(e, VIEW_X0 + 4, VIEW_X1 - 4, SKY_TOP, horizon - 1, clouds, s.sky);
  const flock = openSky(VIEW_X0 + 60 + s.sky.next() * 200, SKY_TOP + 30 + s.sky.next() * 30, 5, sky);
  const nodes: SvgNode[] = [
    ...skyHatch,
    ...(flock === null ? [] : [birdFlock(e, flock.x, flock.y, 5, s.sky)]),
    el("g", { transform: `translate(0 ${LIFT})` }, townNodes(e, g, s.town)),
    ...water,
    el("g", { transform: `translate(0 ${LIFT})` }, [
      ...(nearBand ? groundSweep(e, nearBand, 0.08, 3.2, s.town, 36) : []),
      ...engraved.flatMap((f) => f.nodes),
    ]),
  ];
  return {
    ...line,
    nodes,
    birds: [
      ...(flock === null ? [] : [flockBox(flock.x, flock.y, 5)]),
      ...foreground.flatMap((f) =>
        f.kind === "birds" ? f.items.map((b) => flockBox(b.x, b.y + LIFT, 2 + Math.floor(b.s * 3))) : [],
      ),
    ],
  };
}
