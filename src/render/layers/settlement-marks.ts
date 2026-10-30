import { el, pathFrom, type SvgNode } from "../svg.ts";
import type { Box } from "../geometry.ts";
import type { RenderCtx } from "../context.ts";
import type { NamedSettlement, World } from "../../world/types.ts";

export type SettlementTier = NamedSettlement["kind"] | "seat";

const CAPITAL_GLYPH_SCALE = 1.25;
const HOUSE_SCALE = 1.8;
const WHEEL_RADIUS = 3.9;
const SPOKE_WIDTH = 1.2;
const SEAT_GLYPH_SCALE = 0.85;
const HALO_OPACITY = 0.33;

export function markLadder(tier: SettlementTier, world: World): number {
  return world.region === undefined || tier === "town" ? 1 : 1;
}

export function markGrowth(world: World): number {
  return world.region === undefined ? 1 : 1;
}

export function markScale(tier: SettlementTier, world: World): number {
  return markLadder(tier, world) * markGrowth(world);
}

/** Reused by the legend so the map mark and its key row match. */
export function settlementGlyph(tier: SettlementTier, px: number, py: number, ctx: RenderCtx, scale: number): SvgNode {
  const { style } = ctx;
  const k = (ctx.proj.widthPx / 1500) * scale;
  if (tier === "capital" || tier === "seat") {
    const ks = k * (tier === "capital" ? CAPITAL_GLYPH_SCALE : SEAT_GLYPH_SCALE);
    const mark =
      style.name === "antique" || style.name === "ink"
        ? castleGlyph(px, py, ks, style.ink, style.labelHalo)
        : starInCircle(px, py, ks, ctx);
    return el("g", { class: `settlement-${tier}` }, [mark]);
  }
  if (tier === "town") {
    return el("circle", {
      cx: px,
      cy: py,
      r: 3.4 * k,
      fill: style.ink,
      stroke: style.labelHalo,
      "stroke-width": 1.2 * k,
    });
  }
  if (tier === "hamlet") {
    return el("circle", {
      cx: px,
      cy: py,
      r: 1.5 * k,
      fill: style.ink,
      stroke: style.labelHalo,
      "stroke-width": 0.8 * k,
    });
  }
  if (tier === "farmstead") return farmsteadGlyph(px, py, k, style.ink, style.labelHalo);
  if (tier === "mill") return millGlyph(px, py, k, style.ink, style.labelHalo);
  return el("circle", {
    cx: px,
    cy: py,
    r: 2.3 * k,
    fill: style.labelHalo,
    stroke: style.ink,
    "stroke-width": 1.3 * k,
  });
}

function farmsteadGlyph(px: number, py: number, k: number, ink: string, paper: string): SvgNode {
  const s = HOUSE_SCALE * k;
  const d = pathFrom(
    [
      [px - 2.4 * s, py],
      [px - 2.4 * s, py - 2.6 * s],
      [px, py - 4.8 * s],
      [px + 2.4 * s, py - 2.6 * s],
      [px + 2.4 * s, py],
    ],
    true,
  );
  return el("path", { d, fill: ink, stroke: paper, "stroke-width": 0.7 * k, "stroke-linejoin": "round" });
}

const WHEEL_SPOKES: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [0, 1],
];

function millGlyph(px: number, py: number, k: number, ink: string, paper: string): SvgNode {
  const r = WHEEL_RADIUS * k;
  const spokes = WHEEL_SPOKES.map(([ux, uy]) =>
    pathFrom(
      [
        [px - r * ux, py - r * uy],
        [px + r * ux, py + r * uy],
      ],
      false,
    ),
  ).join("");
  return el("g", {}, [
    el("circle", { cx: px, cy: py, r, fill: paper, stroke: ink, "stroke-width": 1 * k }),
    el("path", { d: spokes, stroke: ink, "stroke-width": SPOKE_WIDTH * k }),
  ]);
}

export function finerMarkBox(tier: SettlementTier, px: number, py: number, k: number): Box {
  const house = 4.8 * HOUSE_SCALE * k;
  const wheel = 2 * WHEEL_RADIUS * k;
  return tier === "farmstead"
    ? { x: px - house / 2, y: py - house, w: house, h: house }
    : { x: px - wheel / 2, y: py - wheel / 2, w: wheel, h: wheel };
}

function starInCircle(px: number, py: number, ks: number, ctx: RenderCtx): SvgNode {
  const { style } = ctx;
  const r = 6.5 * ks;
  const star = starPath(px, py, r * 0.62, 5);
  return el("g", {}, [
    el("circle", {
      cx: px,
      cy: py,
      r,
      fill: style.labelHalo,
      stroke: style.ink,
      "stroke-width": 1.6 * ks,
    }),
    el("path", { d: star, fill: style.ink }),
  ]);
}

export function seatHalo(px: number, py: number, tier: SettlementTier, color: string, ctx: RenderCtx): SvgNode {
  const { style } = ctx;
  const k = ctx.proj.widthPx / 1500;
  const ks = k * (tier === "capital" ? CAPITAL_GLYPH_SCALE : SEAT_GLYPH_SCALE);
  const castle = style.name === "antique" || style.name === "ink";
  const r = (castle ? 9.5 : 9) * ks;
  const cy = castle ? py - 3.5 * ks : py;
  return el("circle", {
    class: "seat-halo",
    cx: px.toFixed(2),
    cy: cy.toFixed(2),
    r: r.toFixed(2),
    fill: color,
    "fill-opacity": String(HALO_OPACITY),
  });
}

export function ruinGlyph(px: number, py: number, ctx: RenderCtx): SvgNode {
  const { style } = ctx;
  const s = ctx.proj.widthPx / 1500;
  const d =
    `M${px - 3 * s} ${py}` +
    `L${px - 3 * s} ${py - 7 * s}` +
    `L${px - 1.7 * s} ${py - 5.3 * s}` +
    `L${px - 0.5 * s} ${py - 6.1 * s}` +
    `L${px + 0.7 * s} ${py - 3.4 * s}` +
    `L${px + 2.7 * s} ${py - 4.2 * s}` +
    `L${px + 2.7 * s} ${py}Z`;
  const slit =
    `M${px - 2 * s} ${py}L${px - 2 * s} ${py - 3.4 * s}` + `L${px - 1 * s} ${py - 3.4 * s}L${px - 1 * s} ${py}Z`;
  return el("g", { class: "ruin" }, [
    el("path", {
      d,
      fill: style.labelHalo,
      stroke: style.ink,
      "stroke-width": 1.2 * s,
      "stroke-linejoin": "round",
    }),
    el("path", { d: slit, fill: style.ink }),
  ]);
}

function castleGlyph(px: number, py: number, k: number, ink: string, paper: string): SvgNode {
  const s = k;
  const d =
    `M${px - 5.5 * s} ${py}` +
    `L${px - 5.5 * s} ${py - 6 * s}L${px - 4 * s} ${py - 6 * s}L${px - 4 * s} ${py - 8 * s}` +
    `L${px - 2.5 * s} ${py - 8 * s}L${px - 2.5 * s} ${py - 6 * s}L${px - 0.75 * s} ${py - 6 * s}` +
    `L${px - 0.75 * s} ${py - 8 * s}L${px + 0.75 * s} ${py - 8 * s}L${px + 0.75 * s} ${py - 6 * s}` +
    `L${px + 2.5 * s} ${py - 6 * s}L${px + 2.5 * s} ${py - 8 * s}L${px + 4 * s} ${py - 8 * s}` +
    `L${px + 4 * s} ${py - 6 * s}L${px + 5.5 * s} ${py - 6 * s}L${px + 5.5 * s} ${py}Z`;
  const door =
    `M${px - 1.2 * s} ${py}L${px - 1.2 * s} ${py - 2.4 * s}` +
    `Q${px} ${py - 3.8 * s} ${px + 1.2 * s} ${py - 2.4 * s}L${px + 1.2 * s} ${py}Z`;
  return el("g", {}, [
    el("path", {
      d,
      fill: paper,
      stroke: ink,
      "stroke-width": 1.2 * k,
      "stroke-linejoin": "round",
    }),
    el("path", { d: door, fill: ink }),
  ]);
}

function starPath(cx: number, cy: number, r: number, points: number): string {
  const inner = r * 0.42;
  let d = "";
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? r : inner;
    const a = (i * Math.PI) / points - Math.PI / 2;
    const x = cx + rad * Math.cos(a);
    const y = cy + rad * Math.sin(a);
    d += (i === 0 ? "M" : "L") + x.toFixed(2) + " " + y.toFixed(2);
  }
  return d + "Z";
}
