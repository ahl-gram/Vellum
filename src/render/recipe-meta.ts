import type { World, WorldRecipe } from "../world/types.ts";
import type { MapType, UvWindow } from "../terrain/heightfield.ts";
import type { ClimateBand } from "../climate/climate.ts";
import type { StyleName } from "./style.ts";
import { el, type SvgNode } from "./svg.ts";

/**
 * The extra recipe a regional survey needs beyond the flat WorldRecipe: the uv
 * window it crops and the parent world's grid width (to line the window up).
 * A caller (the Explorer's "region" worker job) opts a region sheet into being
 * self-describing by passing this as RenderOptions.regionRecipe; the atlas region
 * plates do NOT, so their bytes stay un-stamped. All fields are primitive, so the
 * stamp keeps the flat recipe's "no XML-escaping hazard" property.
 */
export type RegionRecipe = {
  readonly window: UvWindow;
  readonly worldGridW: number;
};

/**
 * Embeds a chart's full recipe in the SVG so a saved file is self-describing:
 * a chart prints its seed and style, but type/band/land/grid are otherwise
 * lost. The recipe lives as `data-vellum-*` attributes on the root (primitive
 * values, so no XML escaping hazard) plus a readable <metadata> summary, and
 * `recipeFromSvg` reads it back. The values derive only from the recipe, so a
 * given recipe stays byte-identical.
 */

// Kept local rather than in a shared src/version.ts: src/render is part of the
// browser-bundled engine graph (Vite compiles it into the app bundles since
// #260), and a top-level version module would widen that graph for one string.
export const ENGINE_VERSION = "0.1.0";

export function recipeAttrs(
  world: World,
  styleName: StyleName,
): Record<string, string | number> {
  const r = world.recipe;
  return {
    "data-vellum-version": ENGINE_VERSION,
    "data-vellum-seed": r.seed,
    "data-vellum-map-type": r.mapType,
    "data-vellum-band": r.band,
    "data-vellum-land-fraction": r.landFraction,
    "data-vellum-grid-w": r.gridW,
    "data-vellum-grid-h": r.gridH,
    "data-vellum-style": styleName,
    // #137: coastWarp is optional. Stamped ONLY when the recipe carries an explicit
    // warp, spread so an undefined value never becomes a key. A default world omits
    // it, keeping its chart bytes (the committed charts + the golden) byte-identical;
    // a warped world stamps it so recipeFromSvg round-trips the warp.
    ...(r.coastWarp !== undefined
      ? { "data-vellum-coast-warp": r.coastWarp }
      : {}),
  };
}

export function recipeMetadataNode(
  world: World,
  styleName: StyleName,
  regionRecipe?: RegionRecipe,
): SvgNode {
  const r = world.recipe;
  // #137: append the warp only when present, so a default world's <metadata> (part of
  // the committed bytes) is unchanged; existing tokens keep their positions.
  const coast = r.coastWarp !== undefined ? ` coast=${r.coastWarp}` : "";
  const summary =
    `Vellum chart. Recipe: seed=${r.seed} type=${r.mapType} band=${r.band} ` +
    `land=${r.landFraction} grid=${r.gridW}x${r.gridH} style=${styleName} ` +
    `engine=${ENGINE_VERSION}${coast}${regionMetadataSuffix(regionRecipe)}`;
  return el("metadata", {}, [summary]);
}

// #168: the region window as data-vellum-region-* attrs, so a downloaded regional
// survey redraws from seed + window. All values are primitive numbers (no XML-escape
// hazard). The caller spreads this ONLY when a regionRecipe is present, so a world
// chart or an un-opted region emits nothing and keeps its bytes.
export function regionRecipeAttrs(
  rr: RegionRecipe,
): Record<string, string | number> {
  return {
    "data-vellum-region-u0": rr.window.u0,
    "data-vellum-region-v0": rr.window.v0,
    "data-vellum-region-u1": rr.window.u1,
    "data-vellum-region-v1": rr.window.v1,
    "data-vellum-region-world-grid-w": rr.worldGridW,
  };
}

// The readable <metadata> suffix for a region window; empty (no trailing token) on a
// world chart, so the committed world charts' <metadata> is unchanged.
function regionMetadataSuffix(rr: RegionRecipe | undefined): string {
  if (rr === undefined) return "";
  const w = rr.window;
  return ` region=[${w.u0},${w.v0},${w.u1},${w.v1}] worldGrid=${rr.worldGridW}`;
}

export type ParsedRecipe = {
  readonly recipe: WorldRecipe;
  readonly style: StyleName;
  readonly version: string;
  /** Present only when the SVG carries a region window stamp (#168). */
  readonly region?: RegionRecipe;
};

function readAttr(svg: string, name: string): string | null {
  const m = svg.match(new RegExp(`\\b${name}="([^"]*)"`));
  return m ? (m[1] as string) : null;
}

/**
 * Recovers the recipe embedded by `recipeAttrs`. Returns null when the SVG
 * carries no Vellum recipe. Re-rendering `generateWorld(recipe)` at the
 * default width and without a legend reproduces the chart byte-for-byte;
 * width and legend are display options, not part of the world's identity.
 */
export function recipeFromSvg(svg: string): ParsedRecipe | null {
  const seed = readAttr(svg, "data-vellum-seed");
  const gridW = readAttr(svg, "data-vellum-grid-w");
  const gridH = readAttr(svg, "data-vellum-grid-h");
  const mapType = readAttr(svg, "data-vellum-map-type");
  const landFraction = readAttr(svg, "data-vellum-land-fraction");
  const band = readAttr(svg, "data-vellum-band");
  const style = readAttr(svg, "data-vellum-style");
  const version = readAttr(svg, "data-vellum-version");
  if (
    seed === null ||
    gridW === null ||
    gridH === null ||
    mapType === null ||
    landFraction === null ||
    band === null ||
    style === null ||
    version === null
  ) {
    return null;
  }
  // #137: coastWarp is optional (absent on every pre-#137 chart and every default
  // world). Read it separately and spread only when present, so a default recipe has
  // no coastWarp key and stays deepEqual to the world's own recipe.
  const coastWarp = readAttr(svg, "data-vellum-coast-warp");
  return {
    recipe: {
      seed: Number(seed),
      gridW: Number(gridW),
      gridH: Number(gridH),
      mapType: mapType as MapType,
      landFraction: Number(landFraction),
      band: band as ClimateBand,
      ...(coastWarp !== null ? { coastWarp: Number(coastWarp) } : {}),
    },
    style: style as StyleName,
    version,
    // #168: the region window is optional (absent on every world chart and every
    // un-opted region). Spread the `region` key ONLY when the full window is present,
    // so a world chart's ParsedRecipe has no region key and stays deepEqual to today.
    ...parseRegion(svg),
  };
}

// Reads the data-vellum-region-* window, returning `{ region }` only when the whole
// window is stamped (else `{}`, so the spread adds no key). Mirrors regionRecipeAttrs.
function parseRegion(svg: string): { region?: RegionRecipe } {
  const u0 = readAttr(svg, "data-vellum-region-u0");
  const v0 = readAttr(svg, "data-vellum-region-v0");
  const u1 = readAttr(svg, "data-vellum-region-u1");
  const v1 = readAttr(svg, "data-vellum-region-v1");
  const worldGridW = readAttr(svg, "data-vellum-region-world-grid-w");
  if (u0 === null || v0 === null || u1 === null || v1 === null || worldGridW === null) {
    return {};
  }
  return {
    region: {
      window: { u0: Number(u0), v0: Number(v0), u1: Number(u1), v1: Number(v1) },
      worldGridW: Number(worldGridW),
    },
  };
}
