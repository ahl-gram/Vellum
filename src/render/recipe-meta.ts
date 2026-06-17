import type { World, WorldRecipe } from "../world/types.ts";
import type { MapType } from "../terrain/heightfield.ts";
import type { ClimateBand } from "../climate/climate.ts";
import type { StyleName } from "./style.ts";
import { el, type SvgNode } from "./svg.ts";

/**
 * Embeds a chart's full recipe in the SVG so a saved file is self-describing:
 * a chart prints its seed and style, but type/band/land/grid are otherwise
 * lost. The recipe lives as `data-vellum-*` attributes on the root (primitive
 * values, so no XML escaping hazard) plus a readable <metadata> summary, and
 * `recipeFromSvg` reads it back. The values derive only from the recipe, so a
 * given recipe stays byte-identical.
 */

// Kept local rather than in a shared src/version.ts: tsconfig.browser.json's
// include is per-subdirectory with no top-level src/*.ts glob, and src/render
// is already in the browser engine set.
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
  };
}

export function recipeMetadataNode(world: World, styleName: StyleName): SvgNode {
  const r = world.recipe;
  const summary =
    `Vellum chart. Recipe: seed=${r.seed} type=${r.mapType} band=${r.band} ` +
    `land=${r.landFraction} grid=${r.gridW}x${r.gridH} style=${styleName} ` +
    `engine=${ENGINE_VERSION}`;
  return el("metadata", {}, [summary]);
}

export type ParsedRecipe = {
  readonly recipe: WorldRecipe;
  readonly style: StyleName;
  readonly version: string;
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
  return {
    recipe: {
      seed: Number(seed),
      gridW: Number(gridW),
      gridH: Number(gridH),
      mapType: mapType as MapType,
      landFraction: Number(landFraction),
      band: band as ClimateBand,
    },
    style: style as StyleName,
    version,
  };
}
