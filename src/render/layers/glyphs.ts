import { BIOMES } from "../../climate/biomes.ts";
import { el, type SvgNode } from "../svg.ts";
import { prunePoints } from "../geometry.ts";
import type { RenderCtx } from "../context.ts";

type Glyph = {
  x: number; // px
  y: number;
  symbol: string;
  scale: number;
};

// Relief thresholds on (elevation - seaLevel) / elevSpan. Shared with the
// legend so its key can only list terrain the chart actually carries.
export const GLYPH_MTN_REL = 0.5;
export const GLYPH_HILL_REL = 0.34;

export type TerrainGlyphs = {
  readonly hill: boolean;
  readonly marsh: boolean;
  readonly dune: boolean;
};

/**
 * Which non-mountain, non-tree terrain glyphs a glyph-style chart would draw.
 * Mirrors the candidate gates in glyphsLayer exactly (interior land cells, the
 * same relief thresholds, the same else-if order) so the legend never lists a
 * symbol the map lacks, nor omits one it carries.
 */
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

/**
 * Terrain glyph field for antique/ink styles: mountains on high ground,
 * hills below them, trees over forest biomes, marsh tufts, dune marks.
 * Painter-sorted by y so nearer glyphs occlude farther ones.
 */
export function glyphsLayer(ctx: RenderCtx): SvgNode | null {
  const { style, world, proj, elevSpan, rng } = ctx;
  if (!style.glyphs) return null;

  const { w, h, data } = world.elev;
  const sea = world.seaLevel;
  const k = proj.widthPx / 1500;
  // regional charts magnify terrain; spread and enlarge glyphs to match
  const zoom = world.region
    ? Math.sqrt(
        (w - 1) /
          ((world.region.window.u1 - world.region.window.u0) *
            (world.region.worldGridW - 1)),
      )
    : 1;
  const spread = k * zoom;
  const size = k * Math.min(1.35, 0.85 + zoom * 0.25);
  const jrng = rng.fork("glyphs");

  type Cand = { x: number; y: number; rel: number; i: number };
  const mtn: Cand[] = [];
  const hill: Cand[] = [];
  const tree: Cand[] = [];
  const marsh: Cand[] = [];
  const dune: Cand[] = [];

  for (let gy = 1; gy < h - 1; gy++) {
    for (let gx = 1; gx < w - 1; gx++) {
      const i = gx + gy * w;
      const e = data[i] as number;
      if (e <= sea) continue;
      const rel = (e - sea) / elevSpan;
      const b = world.biomes[i] as number;
      const c = { x: gx, y: gy, rel, i };
      if (rel > GLYPH_MTN_REL) mtn.push(c);
      else if (rel > GLYPH_HILL_REL) hill.push(c);
      else if (b === BIOMES.marsh) marsh.push(c);
      else if (b === BIOMES.desert) dune.push(c);
      if (
        rel <= GLYPH_MTN_REL &&
        (b === BIOMES.temperateForest ||
          b === BIOMES.rainforest ||
          b === BIOMES.taiga ||
          b === BIOMES.tropicalForest ||
          b === BIOMES.jungle)
      ) {
        tree.push(c);
      }
    }
  }

  mtn.sort((a, b) => b.rel - a.rel || a.i - b.i);
  hill.sort((a, b) => b.rel - a.rel || a.i - b.i);
  // trees/marsh/dunes: shuffle for even coverage instead of row bias
  const treeShuffled = jrng.fork("trees").shuffled(tree);
  const marshShuffled = jrng.fork("marsh").shuffled(marsh);
  const duneShuffled = jrng.fork("dunes").shuffled(dune);

  const toPx = (c: Cand): { x: number; y: number; rel: number; i: number } => ({
    ...c,
    x: proj.px(c.x + jrng.range(-0.4, 0.4)),
    y: proj.py(c.y + jrng.range(-0.4, 0.4)),
  });

  const mtnPicked = prunePoints(mtn.map(toPx), 15 * spread, 260);
  const hillPicked = prunePoints(hill.map(toPx), 13 * spread, 170);
  const treePicked = prunePoints(treeShuffled.map(toPx), 12.5 * spread, 340);
  const marshPicked = prunePoints(marshShuffled.map(toPx), 12 * spread, 90);
  const dunePicked = prunePoints(duneShuffled.map(toPx), 17 * spread, 70);

  const glyphs: Glyph[] = [];
  const grng = jrng.fork("variants");
  for (const c of mtnPicked) {
    glyphs.push({
      x: c.x, y: c.y,
      symbol: grng.pick(["gl-mtn-1", "gl-mtn-2", "gl-mtn-3"]),
      scale: (0.85 + c.rel * 0.8 + grng.range(-0.08, 0.08)) * size,
    });
  }
  for (const c of hillPicked) {
    glyphs.push({
      x: c.x, y: c.y,
      symbol: grng.pick(["gl-hill-1", "gl-hill-2"]),
      scale: (0.7 + c.rel * 0.5 + grng.range(-0.06, 0.06)) * size,
    });
  }
  for (const c of treePicked) {
    const b = world.biomes[c.i] as number;
    const symbol =
      b === BIOMES.taiga
        ? "gl-tree-pine"
        : b === BIOMES.tropicalForest || b === BIOMES.jungle
          ? "gl-tree-palm"
          : "gl-tree-round";
    glyphs.push({ x: c.x, y: c.y, symbol, scale: (0.8 + grng.range(0, 0.3)) * size });
  }
  for (const c of marshPicked) {
    glyphs.push({ x: c.x, y: c.y, symbol: "gl-marsh", scale: (0.8 + grng.range(0, 0.2)) * size });
  }
  for (const c of dunePicked) {
    glyphs.push({ x: c.x, y: c.y, symbol: "gl-dune", scale: (0.9 + grng.range(0, 0.3)) * size });
  }

  glyphs.sort((a, b) => a.y - b.y);

  return el(
    "g",
    { id: "layer-glyphs" },
    glyphs.map((g) =>
      el("use", {
        href: `#${g.symbol}`,
        x: 0,
        y: 0,
        transform: `translate(${g.x.toFixed(1)} ${g.y.toFixed(1)}) scale(${g.scale.toFixed(2)})`,
      }),
    ),
  );
}
