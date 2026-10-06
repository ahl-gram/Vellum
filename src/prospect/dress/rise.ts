import { el, type SvgNode } from "../../render/svg.ts";
import type { Rng } from "../../core/rng.ts";
import type { Arms } from "../../society/heraldry.ts";
import { BACK_ROW_RAISE, groundAt, VIEW_X0, VIEW_X1, type ForegroundElement, type Ground, type Mass, type ProspectGeometry, type Pt, type WallSegment } from "../geometry.ts";
import type { ProspectKind } from "../input.ts";
import type { PlateEra } from "../caption.ts";
import { birdFlock, groundSweep, hillTone, poly, r1, skyLines, stroke, treeClump, washOr, yOnPolyline, type Cloud, type Engraver, type Gap } from "./burin.ts";
import { foregroundEngraved, massIsChurch, massNodesEngraved, shipEngraved, wallNodesEngraved, waterEngraved } from "./townscape.ts";
import { castFor, figureNodes, FIGURE_WIDTH, type Figure } from "./figures.ts";

export type Box = { readonly x0: number; readonly x1: number; readonly y0: number; readonly y1: number };

/** The round's layout for E (design/prospects-after-braun-hogenberg/mock/direction-rise.ts, LAYOUT_E): the town lifted into the upper third, the bay deepened, the rise in the near ground. */
export const LIFT = -70;
export const WATER_BOTTOM = 268;
export const RISE_TOP: ReadonlyArray<Pt> = [{ x: VIEW_X0, y: 250 }, { x: VIEW_X0 + 80, y: 232 }, { x: VIEW_X0 + 170, y: 218 }, { x: VIEW_X0 + 270, y: 226 }, { x: VIEW_X1 - 120, y: 238 }, { x: VIEW_X1, y: 258 }];
export const RISE_BOTTOM = 358;
export const SKY_TOP = 92;
const FIGURE_H = 50;
const FIGURE_SPAN: readonly [number, number] = [VIEW_X0 + 50, VIEW_X0 + 270];
const CLOUD_AVOID = [{ x0: 150, x1: 370 }];
/** The composed birds rise with the town; held in the open sky under the named plate, they clear both the frame (the round's birds straddled it) and the furniture. */
const BIRD_TOP = 96;

export type Streams = { readonly sky: Rng; readonly town: Rng; readonly water: Rng; readonly rise: Rng; readonly figures: Rng };

export type Scene = {
  readonly g: ProspectGeometry;
  readonly kind: ProspectKind;
  readonly era: PlateEra;
  readonly arms: Arms | null;
  readonly roadCount: number;
  readonly beast: boolean;
  /** Boxes, in plate units, every bird keeps clear of: the key's numbers on the town and the horizon towns' names. */
  readonly clear: ReadonlyArray<Box>;
};

function cloudsFor(rng: Rng, horizon: number): Cloud[] {
  const n = 2 + Math.floor(rng.next() * 2);
  const out: Cloud[] = [];
  for (let i = 0; i < n * 3 && out.length < n; i++) {
    const c = { x: VIEW_X0 + 60 + rng.next() * (VIEW_X1 - VIEW_X0 - 120), y: SKY_TOP + 14 + rng.next() * Math.max(10, (horizon - SKY_TOP) * 0.5), w: 70 + rng.next() * 90, h: 7 + rng.next() * 6 };
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

type Sky = { readonly obstacles: ReadonlyArray<Box>; readonly horizonYAt: (x: number) => number };

/** The nearest open sky for a flock of n birds anchored at (x0, y) in plate units: clear of every obstacle and above the hills, sideways first, then lifted no higher than the band under the named plate; null where the hills and the town fill the sky. */
function openSky(x0: number, y: number, n: number, sky: Sky): { readonly x: number; readonly y: number } | null {
  const free = (x: number, yy: number): boolean => {
    const f = flockBox(x, yy, n);
    if (sky.obstacles.some((c) => f.x0 < c.x1 && c.x0 < f.x1 && f.y0 < c.y1 && c.y0 < f.y1)) return false;
    for (let px = f.x0; px <= f.x1; px += 1) if (f.y1 >= sky.horizonYAt(px)) return false;
    return true;
  };
  for (let yy = y; yy >= Math.min(y, BIRD_TOP); yy -= 8) {
    for (let k = 0; k <= 40; k++) {
      for (const x of k === 0 ? [x0] : [x0 + 12 * k, x0 - 12 * k]) if (x >= VIEW_X0 + 6 && x <= VIEW_X1 - 6 - 5 * n && free(x, yy)) return { x, y: yy };
    }
  }
  return null;
}

type Bird = { readonly x: number; readonly y: number; readonly s: number };

/** Where a composed bird flies once held: under the named plate, in the nearest open sky, or nowhere when there is none. */
function heldBird(b: Bird, sky: Sky): Bird | null {
  const at = openSky(b.x, Math.max(b.y + LIFT, BIRD_TOP), 2 + Math.floor(b.s * 3), sky);
  return at === null ? null : { x: at.x, y: at.y - LIFT, s: b.s };
}

const holdBirds = (f: ForegroundElement, sky: Sky): ForegroundElement =>
  f.kind === "birds" ? { ...f, items: f.items.flatMap((b) => heldBird(b, sky) ?? []) } : f;

function townNodes(e: Engraver, g: ProspectGeometry, rng: Rng): SvgNode[] {
  const split = ((): number => { const i = g.masses.findIndex((m) => m.raise < BACK_ROW_RAISE); return i === -1 ? g.masses.length : i; })();
  const line = g.ground.line;
  const ground: SvgNode[] = g.ground.rise > 0
    ? ((): SvgNode[] => {
        const outline = [{ x: line[0]!.x, y: g.ground.base + 3 }, ...line, { x: line[line.length - 1]!.x, y: g.ground.base + 3 }];
        return [el("path", { d: poly(outline), fill: washOr(e, "grass"), ...stroke(e, 1.1) }), ...groundSweep(e, outline, 0.35, 2.6, rng, 20)];
      })()
    : [el("path", { d: poly(line, false), fill: "none", ...stroke(e, 1.1) })];
  return [
    ...(g.ridge === null ? [] : ridgeEngraved(e, g.ridge, g.ground.base + 2, rng)),
    ...(g.water === null && e.wash !== null ? [el("path", { d: poly([{ x: VIEW_X0, y: g.ground.base }, { x: VIEW_X1, y: g.ground.base }, { x: VIEW_X1, y: WATER_BOTTOM - LIFT }, { x: VIEW_X0, y: WATER_BOTTOM - LIFT }]), fill: e.wash.grass })] : []),
    ...ground,
    ...g.masses.slice(0, split).flatMap((m) => massNodesEngraved(e, m, 0.8, massIsChurch(m, g))),
    ...g.walls.flatMap((w) => wallNodesEngraved(e, g.ground, w)),
    ...g.masses.slice(split).flatMap((m) => massNodesEngraved(e, m, m.form === "keep" ? 1.2 : 1.0, massIsChurch(m, g))),
  ];
}

/** The ink a flock of n birds reaches from its anchor (birdFlock in src/prospect/dress/burin.ts). */
const flockBox = (x: number, y: number, n: number): Box => ({ x0: x - 3, x1: x + 5 * n + 3, y0: y - 3, y1: y + 6 });

/** The ink an engraved ship reaches, hull to pennant, lifted with the town: what a horizon label must clear. */
const shipRig = (x: number, y: number, s: number, great: boolean): Box => ({ x0: x - 16 * s, x1: x + 16 * s, y0: y + LIFT - 2.5 * s - (great ? 24 : 18) * s * 1.15 - 3.2 * s - 1, y1: y + LIFT + 3 * s });

/** The ink an engraved mass reaches, roof, spire, battlements and pennant included (massNodesEngraved in townscape.ts), lifted with the town. */
export const massReach = (m: Mass): Box => {
  const up = m.form === "keep" ? 21 : m.form === "tower" ? 3.4 + m.w * 0.55 : m.form === "spire" ? Math.max(12, m.h * 0.55) + 5.4 : 13;
  return { x0: m.x - 2.5, x1: m.x + m.w + 3.5, y0: m.base - m.h - up + LIFT, y1: m.base + LIFT };
};

/** The ink a wall reaches, its towers capped (wallNodesEngraved in townscape.ts), lifted with the town. */
export const wallReach = (ground: Ground, w: WallSegment): Box => ({
  x0: w.x0 - 4.5, x1: w.x1 + 4.5, y0: groundAt(ground, Math.max(w.x0, Math.min(w.x1, (VIEW_X0 + VIEW_X1) / 2))) - w.h - 12 + LIFT, y1: ground.base + LIFT,
});

/** What stands against the sky once the town is lifted, before any bird flies: the hills' crest, the top of their wash, the town's run and ink, the masts. */
export type Skyline = { readonly horizonYAt: (x: number) => number; readonly hillTopAt: (x: number) => number; readonly townRun: readonly [number, number]; readonly masts: ReadonlyArray<Box>; readonly town: ReadonlyArray<Box> };

export function skylineOf(g: ProspectGeometry): Skyline {
  const horizon = g.ground.base + 2 + LIFT;
  const ridge = g.ridge;
  const xs = [...g.masses.map((m) => m.x), ...g.walls.map((w) => w.x0)];
  const xe = [...g.masses.map((m) => m.x + m.w), ...g.walls.map((w) => w.x1)];
  const crest = (x: number): number => (ridge === null ? horizon : yOnPolyline(ridge, x) + LIFT);
  const a = ridge?.[0], b = ridge?.[ridge.length - 1];
  const chord = (x: number): number => (a === undefined || b === undefined || b.x <= a.x || x < a.x || x > b.x ? Infinity : a.y + ((b.y - a.y) * (x - a.x)) / (b.x - a.x) + LIFT);
  return {
    horizonYAt: crest,
    hillTopAt: (x) => Math.min(crest(x), chord(x)),
    townRun: xs.length > 0 ? [Math.min(...xs), Math.max(...xe)] : [260, 260],
    masts: g.foreground.flatMap((f): Box[] => {
      if (f.kind === "mastRow") return f.masts.map((m) => shipRig(m.x, m.hullY, 0.72 + (m.mastH - 42) / 90, m.mastH > 56));
      if (f.kind === "ship") return [shipRig(f.x, f.y + 1, f.s * 1.15, true)];
      return [];
    }),
    town: [...g.masses.map(massReach), ...g.walls.map((w) => wallReach(g.ground, w))],
  };
}

export type Vignette = Skyline & { readonly nodes: SvgNode[]; readonly birds: ReadonlyArray<Box> };

/** The engine's composed town and foreground redrawn by the burin and lifted into the upper third, the water deepened to the rise. */
export function vignette(e: Engraver, scene: Scene, s: Streams): Vignette {
  const g = scene.g;
  const horizon = g.ground.base + 2 + LIFT;
  const clouds = cloudsFor(s.sky, horizon);
  const line = skylineOf(g);
  const sky: Sky = { obstacles: [...scene.clear, ...line.town, ...line.masts], horizonYAt: line.horizonYAt };
  const foreground = g.foreground.filter((f) => !(scene.beast && f.kind === "seaSerpent")).map((f) => holdBirds(f, sky));
  const engraved = foreground.map((f) => foregroundEngraved(e, f, s.town));
  const gaps: Gap[] = engraved.flatMap((f) => f.gaps).map((h) => ({ ...h, y0: h.y0 + LIFT, y1: h.y1 + LIFT }));
  const river = g.water?.kind === "river";
  const nearBand = g.water === null ? [{ x: VIEW_X0, y: g.ground.base }, { x: VIEW_X1, y: g.ground.base }, { x: VIEW_X1, y: WATER_BOTTOM - LIFT }, { x: VIEW_X0, y: WATER_BOTTOM - LIFT }] : null;
  const water: SvgNode[] = g.water === null ? [] : [
    ...waterEngraved(e, VIEW_X0, VIEW_X1, g.water.y0 + LIFT, river ? g.water.y1 + LIFT : WATER_BOTTOM, gaps, s.water),
    ...(river ? [el("path", { d: `M${VIEW_X0} ${r1(g.water.y1 + LIFT)}H${VIEW_X1}`, fill: "none", ...stroke(e, 1.0) })] : []),
  ];
  const skyHatch = skyLines(e, VIEW_X0 + 4, VIEW_X1 - 4, SKY_TOP, horizon - 1, clouds, s.sky);
  const flock = openSky(VIEW_X0 + 60 + s.sky.next() * 200, SKY_TOP + 30 + s.sky.next() * 30, 5, sky);
  const nodes: SvgNode[] = [
    ...skyHatch,
    ...(flock === null ? [] : [birdFlock(e, flock.x, flock.y, 5, s.sky)]),
    el("g", { transform: `translate(0 ${LIFT})` }, townNodes(e, g, s.town)),
    ...water,
    el("g", { transform: `translate(0 ${LIFT})` }, [...(nearBand ? groundSweep(e, nearBand, 0.08, 3.2, s.town, 36) : []), ...engraved.flatMap((f) => f.nodes)]),
  ];
  return {
    ...line,
    nodes,
    birds: [...(flock === null ? [] : [flockBox(flock.x, flock.y, 5)]), ...foreground.flatMap((f) => (f.kind === "birds" ? f.items.map((b) => flockBox(b.x, b.y + LIFT, 2 + Math.floor(b.s * 3))) : []))],
  };
}

export function placeFigures(scene: Scene, rng: Rng): Figure[] {
  const cast = castFor(scene.kind, scene.g.water?.kind === "sea", scene.roadCount, scene.era);
  const [x0, x1] = FIGURE_SPAN;
  const unit = FIGURE_H / 30;
  const total = cast.reduce((sum, k) => sum + FIGURE_WIDTH[k] * unit, 0) + (cast.length - 1) * 6;
  let x = (x0 + x1) / 2 - total / 2;
  const cx = (VIEW_X0 + VIEW_X1) / 2;
  return cast.map((kind) => {
    const w = FIGURE_WIDTH[kind] * unit;
    const fx = x + w / 2 + (rng.next() - 0.5) * 4;
    x += w + 6;
    const h = kind === "dog" || kind === "sheep" ? FIGURE_H * 0.45 : FIGURE_H * (0.94 + rng.next() * 0.12);
    return { kind, x: fx, y: yOnPolyline(RISE_TOP, fx) + 8 + rng.next() * 8, h, flip: fx > cx };
  });
}

export const figureBox = (f: Figure): Box => {
  const half = (FIGURE_WIDTH[f.kind] * (f.h / 30)) / 2;
  return { x0: f.x - half, x1: f.x + half, y0: f.y - f.h * (f.kind === "rider" ? 1.25 : 1) - 2, y1: f.y + 2 };
};

function riseGround(e: Engraver, rng: Rng): SvgNode[] {
  const outline = [...RISE_TOP, { x: VIEW_X1, y: RISE_BOTTOM }, { x: VIEW_X0, y: RISE_BOTTOM }];
  const px0 = (VIEW_X0 + VIEW_X1) / 2 + 40;
  const top0 = yOnPolyline(RISE_TOP, px0);
  const fall = RISE_BOTTOM - top0;
  const path = [0, 5].map((o) => `M${r1(px0 + o)} ${r1(top0 + 1)}q30 ${r1(fall * 0.5)} 90 ${r1(fall - 1)}`).join("");
  const first = RISE_TOP[0]!, last = RISE_TOP[RISE_TOP.length - 1]!;
  const lower = [{ x: VIEW_X0, y: RISE_BOTTOM - (RISE_BOTTOM - first.y) * 0.45 }, { x: VIEW_X1, y: RISE_BOTTOM - (RISE_BOTTOM - last.y) * 0.45 }, { x: VIEW_X1, y: RISE_BOTTOM }, { x: VIEW_X0, y: RISE_BOTTOM }];
  const out: SvgNode[] = [
    el("path", { d: poly(outline), fill: washOr(e, "grassDeep"), ...stroke(e, 1.1) }),
    ...groundSweep(e, outline, -0.12, 3.0, rng, 70),
    el("path", { d: path, fill: "none", stroke: e.ink, "stroke-width": 0.45, "stroke-dasharray": "1.4 1.6", "stroke-opacity": 0.8 }),
    ...groundSweep(e, lower, 0.3, 4.2, rng, 10),
  ];
  for (let i = 0; i < 4; i++) {
    const bx = VIEW_X1 - 30 - rng.next() * 150;
    out.push(...treeClump(e, bx, yOnPolyline(RISE_TOP, bx) + 8 + rng.next() * 26, 2.4 + rng.next() * 2.6, rng));
  }
  out.push(...treeClump(e, VIEW_X0 + 26, yOnPolyline(RISE_TOP, VIEW_X0 + 26) + 34, 7, rng));
  return [...out, fence(e, px0, top0), rocks(e, rng)];
}

function fence(e: Engraver, px0: number, top0: number): SvgNode {
  const fx0 = px0 + 14, fy0 = top0 + 4;
  const at = (t: number): Pt => ({ x: fx0 + 60 * t * t + 10 * t, y: fy0 + (RISE_BOTTOM - fy0) * 0.62 * t });
  const parts: string[] = [];
  for (let i = 0; i < 7; i++) {
    const t = i / 6, p = at(t);
    parts.push(`M${r1(p.x)} ${r1(p.y)}v${r1(-5 - 4 * t)}`);
    if (i > 0) {
      const q = at((i - 1) / 6);
      parts.push(`M${r1(p.x - 1)} ${r1(p.y - 3 - 3 * t)}L${r1(q.x)} ${r1(q.y - 3 - 3 * ((i - 1) / 6))}`);
    }
  }
  return el("path", { d: parts.join(""), fill: "none", ...stroke(e, 0.7) });
}

function rocks(e: Engraver, rng: Rng): SvgNode {
  const parts: string[] = [];
  for (let i = 0; i < 5; i++) {
    const rx = VIEW_X0 + 8 + rng.next() * 60, ry = RISE_BOTTOM - 6 - rng.next() * 24, rs = 3 + rng.next() * 5;
    parts.push(`M${r1(rx)} ${r1(ry)}l${r1(rs * 0.4)} ${r1(-rs * 0.7)}l${r1(rs * 0.8)} ${r1(-rs * 0.1)}l${r1(rs * 0.5)} ${r1(rs * 0.8)}Z`);
  }
  return el("path", { d: parts.join(""), fill: e.paper, ...stroke(e, 0.7) });
}

const SERPENT = 1.6;
const SERPENT_LEFT = 51;
const SERPENT_RIGHT = 59;
const SERPENT_Y = 212;
const SHIP = 1.45;

/** The world's sea beast surfacing in the open bay, three coils and a head, after the serpent the chart draws. */
function serpentNodes(e: Engraver, x: number, y: number, rng: Rng): SvgNode[] {
  const s = SERPENT;
  const out: SvgNode[] = [];
  for (const [dx, h] of [[-36, 12], [-12, 15], [12, 11]] as const) {
    out.push(el("path", { d: `M${r1(x + dx - 9 * s)} ${r1(y)}q${r1(9 * s)} ${r1(-h * s)} ${r1(18 * s)} 0`, fill: washOr(e, "wood"), ...stroke(e, 1.1) }));
    out.push(el("path", { d: `M${r1(x + dx - 6 * s)} ${r1(y - 2)}q${r1(6 * s)} ${r1(-h * 0.5 * s)} ${r1(12 * s)} 0`, fill: "none", stroke: e.ink, "stroke-width": 0.5, "stroke-opacity": 0.7 }));
  }
  out.push(el("path", { d: `M${r1(x + 30)} ${r1(y)}q${r1(3 * s)} ${r1(-14 * s)} ${r1(10 * s)} ${r1(-15 * s)}q${r1(8 * s)} ${r1(-1.4 * s)} ${r1(8 * s)} ${r1(4.6 * s)}q0 ${r1(3.6 * s)} ${r1(-5.4 * s)} ${r1(3 * s)}l${r1(2.4 * s)} ${r1(2.6 * s)}`, fill: washOr(e, "wood"), ...stroke(e, 1.1) }));
  out.push(el("circle", { cx: r1(x + 30 + 13 * s), cy: r1(y - 12 * s), r: 1, fill: e.ink }));
  const spray: string[] = [];
  for (let i = 0; i < 4; i++) spray.push(`M${r1(x - 50 + rng.next() * 100)} ${r1(y + 2 + rng.next() * 4)}q4 -1.4 8 0`);
  out.push(el("path", { d: spray.join(""), fill: "none", stroke: e.ink, "stroke-width": 0.45, "stroke-opacity": 0.7 }));
  return out;
}

export type Picture = { readonly nodes: SvgNode[]; readonly vignette: Vignette; readonly figures: ReadonlyArray<Box>; readonly ship: Box | null; readonly beast: Box | null };

/** The beast takes the free water between the people and the near ship, centred in it; where that gap is too narrow, the ship stands down and the beast takes its water (ruling D4: kept clear of the figures). */
function seatBeast(figures: ReadonlyArray<Box>, shipX: number | null): { readonly x: number; readonly ship: boolean } {
  const left = Math.max(VIEW_X0, ...figures.map((f) => f.x1)) + 8 + SERPENT_LEFT;
  const right = (shipX === null ? VIEW_X1 - 8 : shipX - 14 * SHIP - 8) - SERPENT_RIGHT;
  if (right >= left) return { x: (left + right) / 2, ship: true };
  return { x: Math.min(VIEW_X1 - 8 - SERPENT_RIGHT, left), ship: false };
}

const shipBox = (x: number): Box => ({ x0: x - 19 * SHIP, x1: x + 14 * SHIP, y0: WATER_BOTTOM - 26 - 30 * SHIP, y1: WATER_BOTTOM - 26 + 5 * SHIP });

/** The whole picture of E: the meadow, the lifted town and its water, the near ship, the beast, the rise and its people. */
export function picture(e: Engraver, scene: Scene, s: Streams, beastRng: Rng): Picture {
  const g = scene.g;
  const river = g.water?.kind === "river";
  const v = vignette(e, scene, s);
  const meadowTop = g.water === null ? g.ground.base + LIFT : river ? g.water.y1 + LIFT : null;
  const band = meadowTop === null ? null : [{ x: VIEW_X0, y: meadowTop }, { x: VIEW_X1, y: meadowTop }, { x: VIEW_X1, y: WATER_BOTTOM + 4 }, { x: VIEW_X0, y: WATER_BOTTOM + 4 }];
  const plain: SvgNode[] = band === null ? [] : [el("path", { d: poly(band), fill: washOr(e, "grass"), stroke: "none" }), ...(river ? groundSweep(e, band, 0.05, 3.4, s.rise, 24) : [])];
  const figures = placeFigures(scene, s.figures).sort((a, b) => a.y - b.y);
  const figureBoxes = figures.map(figureBox);
  const sea = g.water?.kind === "sea";
  const shipX = sea && scene.era === "standing" ? VIEW_X1 - 70 - s.rise.next() * 30 : null;
  const seat = scene.beast && sea ? seatBeast(figureBoxes, shipX) : null;
  const shipAt = shipX !== null && (seat === null || seat.ship) ? shipX : null;
  return {
    nodes: [
      ...(river ? [] : plain), ...v.nodes, ...(river ? plain : []),
      ...(shipAt === null ? [] : shipEngraved(e, shipAt, WATER_BOTTOM - 26, SHIP, scene.kind !== "hamlet", s.rise)),
      ...(seat === null ? [] : serpentNodes(e, seat.x, SERPENT_Y, beastRng)),
      ...riseGround(e, s.rise),
      ...figures.map((f) => figureNodes(e, f, scene.arms)),
    ],
    vignette: v,
    figures: figureBoxes,
    ship: shipAt === null ? null : shipBox(shipAt),
    beast: seat === null ? null : { x0: seat.x - SERPENT_LEFT, x1: seat.x + SERPENT_RIGHT, y0: SERPENT_Y - 15 * SERPENT - 6, y1: SERPENT_Y + 6 },
  };
}
