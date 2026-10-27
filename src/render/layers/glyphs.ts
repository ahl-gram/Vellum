import { BIOMES } from "../../climate/biomes.ts";
import { el, type SvgNode } from "../svg.ts";
import { prunePoints, type Box } from "../geometry.ts";
import type { RenderCtx } from "../context.ts";
import type { Projection } from "../transform.ts";
import type { Rng } from "../../core/rng.ts";
import type { UvWindow } from "../../terrain/heightfield.ts";
import type { World } from "../../world/types.ts";
import {
  MARK_NAME_PAD,
  marksClearOf,
  NUDGE_REACH,
  type Mark,
  type MarkGround,
  type MarkKind,
} from "./glyph-clearance.ts";

export const GLYPH_MTN_REL = 0.5;
export const GLYPH_HILL_REL = 0.34;

export const TREE_BIOMES: ReadonlySet<number> = new Set<number>([
  BIOMES.temperateForest,
  BIOMES.rainforest,
  BIOMES.taiga,
  BIOMES.tropicalForest,
  BIOMES.jungle,
]);

export type TerrainGlyphs = {
  readonly hill: boolean;
  readonly marsh: boolean;
  readonly dune: boolean;
};

export function terrainGlyphsPresent(ctx: RenderCtx): TerrainGlyphs {
  const { world, elevSpan } = ctx;
  const { w, h, data } = world.elev;
  const sea = world.seaLevel;
  let hill = false;
  let marsh = false;
  let dune = false;
  for (let gy = 1; gy < h - 1; gy++) {
    for (let gx = 1; gx < w - 1; gx++) {
      const i = gx + gy * w;
      const e = data[i] as number;
      if (e <= sea) continue;
      const rel = (e - sea) / elevSpan;
      const b = world.biomes[i] as number;
      if (rel > GLYPH_MTN_REL) continue;
      else if (rel > GLYPH_HILL_REL) hill = true;
      else if (b === BIOMES.marsh) marsh = true;
      else if (b === BIOMES.desert) dune = true;
      if (hill && marsh && dune) return { hill, marsh, dune };
    }
  }
  return { hill, marsh, dune };
}

type ReliefKind = Exclude<MarkKind, "tree">;

function reliefKind(rel: number, b: number): ReliefKind | null {
  if (rel > GLYPH_MTN_REL) return "mtn";
  if (rel > GLYPH_HILL_REL) return "hill";
  if (b === BIOMES.marsh) return "marsh";
  if (b === BIOMES.desert) return "dune";
  return null;
}

const bearsTree = (rel: number, b: number): boolean => rel <= GLYPH_MTN_REL && TREE_BIOMES.has(b);

export function markStandsOn(kind: MarkKind, rel: number, b: number): boolean {
  return kind === "tree" ? bearsTree(rel, b) : reliefKind(rel, b) === kind;
}

export const MARK_SPACING: Readonly<Record<MarkKind, number>> = { mtn: 15, hill: 13, tree: 12.5, marsh: 12, dune: 17 };

type Cand = { x: number; y: number; rel: number; i: number };

type GlyphCands = {
  readonly mtn: Cand[];
  readonly hill: Cand[];
  readonly tree: Cand[];
  readonly marsh: Cand[];
  readonly dune: Cand[];
};

export const GLYPH_DENSITY_WINDOW = 0.125;

export function glyphDensity(
  gridW: number,
  region: { readonly window: UvWindow; readonly worldGridW: number } | undefined,
): { readonly zoom: number; readonly capScale: number } {
  if (!region) return { zoom: 1, capScale: 1 };
  const du = region.window.u1 - region.window.u0;
  if (du < GLYPH_DENSITY_WINDOW) {
    return {
      zoom: Math.sqrt((gridW - 1) / (GLYPH_DENSITY_WINDOW * (region.worldGridW - 1))),
      capScale: GLYPH_DENSITY_WINDOW / du,
    };
  }
  return { zoom: Math.sqrt((gridW - 1) / (du * (region.worldGridW - 1))), capScale: 1 };
}

function glyphCandidates(ctx: RenderCtx): GlyphCands {
  const { world, elevSpan } = ctx;
  const { w, h, data } = world.elev;
  const sea = world.seaLevel;
  const mtn: Cand[] = [];
  const hill: Cand[] = [];
  const tree: Cand[] = [];
  const marsh: Cand[] = [];
  const dune: Cand[] = [];
  const byRelief: Record<ReliefKind, Cand[]> = { mtn, hill, marsh, dune };

  for (let gy = 1; gy < h - 1; gy++) {
    for (let gx = 1; gx < w - 1; gx++) {
      const i = gx + gy * w;
      const e = data[i] as number;
      if (e <= sea) continue;
      const rel = (e - sea) / elevSpan;
      const b = world.biomes[i] as number;
      const c = { x: gx, y: gy, rel, i };
      const relief = reliefKind(rel, b);
      if (relief !== null) byRelief[relief].push(c);
      if (bearsTree(rel, b)) tree.push(c);
    }
  }

  mtn.sort((a, b) => b.rel - a.rel || a.i - b.i);
  hill.sort((a, b) => b.rel - a.rel || a.i - b.i);
  return { mtn, hill, tree, marsh, dune };
}

function pickGlyphSpots(proj: Projection, jrng: Rng, cands: GlyphCands, spread: number, capScale: number): GlyphCands {
  const treeShuffled = jrng.fork("trees").shuffled(cands.tree);
  const marshShuffled = jrng.fork("marsh").shuffled(cands.marsh);
  const duneShuffled = jrng.fork("dunes").shuffled(cands.dune);

  const toPx = (c: Cand): Cand => ({
    ...c,
    x: proj.px(c.x + jrng.range(-0.4, 0.4)),
    y: proj.py(c.y + jrng.range(-0.4, 0.4)),
  });

  return {
    mtn: prunePoints(cands.mtn.map(toPx), MARK_SPACING.mtn * spread, Math.round(260 * capScale)),
    hill: prunePoints(cands.hill.map(toPx), MARK_SPACING.hill * spread, Math.round(170 * capScale)),
    tree: prunePoints(treeShuffled.map(toPx), MARK_SPACING.tree * spread, Math.round(340 * capScale)),
    marsh: prunePoints(marshShuffled.map(toPx), MARK_SPACING.marsh * spread, Math.round(90 * capScale)),
    dune: prunePoints(duneShuffled.map(toPx), MARK_SPACING.dune * spread, Math.round(70 * capScale)),
  };
}

function glyphVariants(world: World, grng: Rng, picked: GlyphCands, size: number): Mark[] {
  const glyphs: Mark[] = [];
  for (const c of picked.mtn) {
    glyphs.push({
      x: c.x,
      y: c.y,
      symbol: grng.pick(["gl-mtn-1", "gl-mtn-2", "gl-mtn-3"]),
      scale: (0.85 + c.rel * 0.8 + grng.range(-0.08, 0.08)) * size,
      kind: "mtn",
    });
  }
  for (const c of picked.hill) {
    glyphs.push({
      x: c.x,
      y: c.y,
      symbol: grng.pick(["gl-hill-1", "gl-hill-2"]),
      scale: (0.7 + c.rel * 0.5 + grng.range(-0.06, 0.06)) * size,
      kind: "hill",
    });
  }
  for (const c of picked.tree) {
    const b = world.biomes[c.i] as number;
    const symbol =
      b === BIOMES.taiga
        ? "gl-tree-pine"
        : b === BIOMES.tropicalForest || b === BIOMES.jungle
          ? "gl-tree-palm"
          : "gl-tree-round";
    glyphs.push({ x: c.x, y: c.y, symbol, scale: (0.8 + grng.range(0, 0.3)) * size, kind: "tree" });
  }
  for (const c of picked.marsh) {
    glyphs.push({ x: c.x, y: c.y, symbol: "gl-marsh", scale: (0.8 + grng.range(0, 0.2)) * size, kind: "marsh" });
  }
  for (const c of picked.dune) {
    glyphs.push({ x: c.x, y: c.y, symbol: "gl-dune", scale: (0.9 + grng.range(0, 0.3)) * size, kind: "dune" });
  }
  return glyphs;
}

function glyphUses(glyphs: ReadonlyArray<Mark>): SvgNode {
  return el(
    "g",
    { id: "layer-glyphs" },
    [...glyphs]
      .sort((a, b) => a.y - b.y)
      .map((g) =>
        el("use", {
          href: `#${g.symbol}`,
          x: 0,
          y: 0,
          transform: `translate(${g.x.toFixed(1)} ${g.y.toFixed(1)}) scale(${g.scale.toFixed(2)})`,
        }),
      ),
  );
}

function markGround(ctx: RenderCtx, spread: number): MarkGround {
  const { world, proj, elevSpan } = ctx;
  const { w, h, data } = world.elev;
  const k = proj.widthPx / 1500;
  return {
    pad: MARK_NAME_PAD * k,
    reach: (kind) => NUDGE_REACH * MARK_SPACING[kind] * spread,
    stands: (kind, x, y) => {
      const gx = Math.round((x - proj.margin) / proj.scale);
      const gy = Math.round((y - proj.margin) / proj.scale);
      if (gx < 1 || gy < 1 || gx > w - 2 || gy > h - 2) return false;
      const i = gx + gy * w;
      const e = data[i] as number;
      if (e <= world.seaLevel) return false;
      return markStandsOn(kind, (e - world.seaLevel) / elevSpan, world.biomes[i] as number);
    },
  };
}

export function glyphsLayer(ctx: RenderCtx, names: ReadonlyArray<Box>): SvgNode | null {
  const { style, world, proj, rng } = ctx;
  if (!style.glyphs) return null;

  const k = proj.widthPx / 1500;
  const { zoom, capScale } = glyphDensity(world.elev.w, world.region);
  const spread = k * zoom;
  const size = k * Math.min(1.35, 0.85 + zoom * 0.25);
  const jrng = rng.fork("glyphs");

  const picked = pickGlyphSpots(proj, jrng, glyphCandidates(ctx), spread, capScale);
  const grng = jrng.fork("variants");
  const marks = glyphVariants(world, grng, picked, size);
  return glyphUses(world.region === undefined ? marks : marksClearOf(marks, names, markGround(ctx, spread)));
}
