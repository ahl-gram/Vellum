import { el, type SvgNode } from "../../render/svg.ts";
import type { Rng } from "../../core/rng.ts";
import { VIEW_X0, VIEW_X1, type Pt } from "../geometry.ts";
import { groundSweep, poly, r1, stroke, treeClump, washOr, yOnPolyline, type Engraver } from "./burin.ts";
import { shipEngraved } from "./townscape.ts";
import { castFor, figureNodes, FIGURE_WIDTH, type Figure } from "./figures.ts";
import {
  LIFT,
  RISE_BOTTOM,
  RISE_TOP,
  WATER_BOTTOM,
  vignette,
  type Box,
  type Scene,
  type Streams,
  type Vignette,
} from "./rise.ts";

const FIGURE_H = 50;
const FIGURE_SPAN: readonly [number, number] = [VIEW_X0 + 50, VIEW_X0 + 270];

function placeFigures(scene: Scene, rng: Rng): Figure[] {
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

const figureBox = (f: Figure): Box => {
  const half = (FIGURE_WIDTH[f.kind] * (f.h / 30)) / 2;
  return { x0: f.x - half, x1: f.x + half, y0: f.y - f.h * (f.kind === "rider" ? 1.25 : 1) - 2, y1: f.y + 2 };
};

function riseGround(e: Engraver, rng: Rng): SvgNode[] {
  const outline = [...RISE_TOP, { x: VIEW_X1, y: RISE_BOTTOM }, { x: VIEW_X0, y: RISE_BOTTOM }];
  const px0 = (VIEW_X0 + VIEW_X1) / 2 + 40;
  const top0 = yOnPolyline(RISE_TOP, px0);
  const fall = RISE_BOTTOM - top0;
  const path = [0, 5].map((o) => `M${r1(px0 + o)} ${r1(top0 + 1)}q30 ${r1(fall * 0.5)} 90 ${r1(fall - 1)}`).join("");
  const first = RISE_TOP[0]!,
    last = RISE_TOP[RISE_TOP.length - 1]!;
  const lower = [
    { x: VIEW_X0, y: RISE_BOTTOM - (RISE_BOTTOM - first.y) * 0.45 },
    { x: VIEW_X1, y: RISE_BOTTOM - (RISE_BOTTOM - last.y) * 0.45 },
    { x: VIEW_X1, y: RISE_BOTTOM },
    { x: VIEW_X0, y: RISE_BOTTOM },
  ];
  const out: SvgNode[] = [
    el("path", { d: poly(outline), fill: washOr(e, "grassDeep"), ...stroke(e, 1.1) }),
    ...groundSweep(e, outline, -0.12, 3.0, rng, 70),
    el("path", {
      d: path,
      fill: "none",
      stroke: e.ink,
      "stroke-width": 0.45,
      "stroke-dasharray": "1.4 1.6",
      "stroke-opacity": 0.8,
    }),
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
  const fx0 = px0 + 14,
    fy0 = top0 + 4;
  const at = (t: number): Pt => ({ x: fx0 + 60 * t * t + 10 * t, y: fy0 + (RISE_BOTTOM - fy0) * 0.62 * t });
  const parts: string[] = [];
  for (let i = 0; i < 7; i++) {
    const t = i / 6,
      p = at(t);
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
    const rx = VIEW_X0 + 8 + rng.next() * 60,
      ry = RISE_BOTTOM - 6 - rng.next() * 24,
      rs = 3 + rng.next() * 5;
    parts.push(
      `M${r1(rx)} ${r1(ry)}l${r1(rs * 0.4)} ${r1(-rs * 0.7)}l${r1(rs * 0.8)} ${r1(-rs * 0.1)}l${r1(rs * 0.5)} ${r1(rs * 0.8)}Z`,
    );
  }
  return el("path", { d: parts.join(""), fill: e.paper, ...stroke(e, 0.7) });
}

const SERPENT = 1.6;
const SERPENT_LEFT = 51;
const SERPENT_RIGHT = 59;
const SERPENT_Y = 212;
const SHIP = 1.45;

function serpentNodes(e: Engraver, x: number, y: number, rng: Rng): SvgNode[] {
  const s = SERPENT;
  const out: SvgNode[] = [];
  for (const [dx, h] of [
    [-36, 12],
    [-12, 15],
    [12, 11],
  ] as const) {
    out.push(
      el("path", {
        d: `M${r1(x + dx - 9 * s)} ${r1(y)}q${r1(9 * s)} ${r1(-h * s)} ${r1(18 * s)} 0`,
        fill: washOr(e, "wood"),
        ...stroke(e, 1.1),
      }),
    );
    out.push(
      el("path", {
        d: `M${r1(x + dx - 6 * s)} ${r1(y - 2)}q${r1(6 * s)} ${r1(-h * 0.5 * s)} ${r1(12 * s)} 0`,
        fill: "none",
        stroke: e.ink,
        "stroke-width": 0.5,
        "stroke-opacity": 0.7,
      }),
    );
  }
  out.push(
    el("path", {
      d: `M${r1(x + 30)} ${r1(y)}q${r1(3 * s)} ${r1(-14 * s)} ${r1(10 * s)} ${r1(-15 * s)}q${r1(8 * s)} ${r1(-1.4 * s)} ${r1(8 * s)} ${r1(4.6 * s)}q0 ${r1(3.6 * s)} ${r1(-5.4 * s)} ${r1(3 * s)}l${r1(2.4 * s)} ${r1(2.6 * s)}`,
      fill: washOr(e, "wood"),
      ...stroke(e, 1.1),
    }),
  );
  out.push(el("circle", { cx: r1(x + 30 + 13 * s), cy: r1(y - 12 * s), r: 1, fill: e.ink }));
  const spray: string[] = [];
  for (let i = 0; i < 4; i++) spray.push(`M${r1(x - 50 + rng.next() * 100)} ${r1(y + 2 + rng.next() * 4)}q4 -1.4 8 0`);
  out.push(el("path", { d: spray.join(""), fill: "none", stroke: e.ink, "stroke-width": 0.45, "stroke-opacity": 0.7 }));
  return out;
}

export type Picture = {
  readonly nodes: SvgNode[];
  readonly vignette: Vignette;
  readonly figures: ReadonlyArray<Box>;
  readonly ship: Box | null;
  readonly beast: Box | null;
};

function seatBeast(figures: ReadonlyArray<Box>, shipX: number | null): { readonly x: number; readonly ship: boolean } {
  const left = Math.max(VIEW_X0, ...figures.map((f) => f.x1)) + 8 + SERPENT_LEFT;
  const right = (shipX === null ? VIEW_X1 - 8 : shipX - 14 * SHIP - 8) - SERPENT_RIGHT;
  if (right >= left) return { x: (left + right) / 2, ship: true };
  return { x: Math.min(VIEW_X1 - 8 - SERPENT_RIGHT, left), ship: false };
}

const shipBox = (x: number): Box => ({
  x0: x - 19 * SHIP,
  x1: x + 14 * SHIP,
  y0: WATER_BOTTOM - 26 - 30 * SHIP,
  y1: WATER_BOTTOM - 26 + 5 * SHIP,
});

function meadowBand(meadowTop: number | null): Pt[] | null {
  const band =
    meadowTop === null
      ? null
      : [
          { x: VIEW_X0, y: meadowTop },
          { x: VIEW_X1, y: meadowTop },
          { x: VIEW_X1, y: WATER_BOTTOM + 4 },
          { x: VIEW_X0, y: WATER_BOTTOM + 4 },
        ];
  return band;
}

export function picture(e: Engraver, scene: Scene, s: Streams, beastRng: Rng): Picture {
  const g = scene.g;
  const river = g.water?.kind === "river";
  const v = vignette(e, scene, s);
  const meadowTop = g.water === null ? g.ground.base + LIFT : river ? g.water.y1 + LIFT : null;
  const band = meadowBand(meadowTop);
  const plain: SvgNode[] =
    band === null
      ? []
      : [
          el("path", { d: poly(band), fill: washOr(e, "grass"), stroke: "none" }),
          ...(river ? groundSweep(e, band, 0.05, 3.4, s.rise, 24) : []),
        ];
  const figures = placeFigures(scene, s.figures).sort((a, b) => a.y - b.y);
  const figureBoxes = figures.map(figureBox);
  const sea = g.water?.kind === "sea";
  const shipX = sea && scene.era === "standing" ? VIEW_X1 - 70 - s.rise.next() * 30 : null;
  const seat = scene.beast && sea ? seatBeast(figureBoxes, shipX) : null;
  const shipAt = shipX !== null && (seat === null || seat.ship) ? shipX : null;
  return {
    nodes: [
      ...(river ? [] : plain),
      ...v.nodes,
      ...(river ? plain : []),
      ...(shipAt === null ? [] : shipEngraved(e, shipAt, WATER_BOTTOM - 26, SHIP, scene.kind !== "hamlet", s.rise)),
      ...(seat === null ? [] : serpentNodes(e, seat.x, SERPENT_Y, beastRng)),
      ...riseGround(e, s.rise),
      ...figures.map((f) => figureNodes(e, f, scene.arms)),
    ],
    vignette: v,
    figures: figureBoxes,
    ship: shipAt === null ? null : shipBox(shipAt),
    beast:
      seat === null
        ? null
        : {
            x0: seat.x - SERPENT_LEFT,
            x1: seat.x + SERPENT_RIGHT,
            y0: SERPENT_Y - 15 * SERPENT - 6,
            y1: SERPENT_Y + 6,
          },
  };
}
