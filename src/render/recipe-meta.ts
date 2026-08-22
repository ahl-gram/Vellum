import type { World, WorldRecipe } from "../world/types.ts";
import type { MapType, UvWindow } from "../terrain/heightfield.ts";
import type { ClimateBand } from "../climate/climate.ts";
import type { StyleName } from "./style.ts";
import { el, type SvgNode } from "./svg.ts";

/** All fields are primitive, keeping the region stamp free of XML-escaping hazards. */
export type RegionRecipe = {
  readonly window: UvWindow;
  readonly worldGridW: number;
  /** Required, not optional: a sheet must state the detail it was DRAWN at so it redraws as itself, and a missing value would silently mean 0 (#398). A pre-#376 stamp has no attribute and parses as 0, which is what those sheets were drawn at. */
  readonly detail: number;
};

// Kept local: render is browser-bundled, and a shared src/version.ts would widen that graph for one string.
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
  const coast = r.coastWarp !== undefined ? ` coast=${r.coastWarp}` : "";
  const summary =
    `Vellum chart. Recipe: seed=${r.seed} type=${r.mapType} band=${r.band} ` +
    `land=${r.landFraction} grid=${r.gridW}x${r.gridH} style=${styleName} ` +
    `engine=${ENGINE_VERSION}${coast}${regionMetadataSuffix(regionRecipe)}`;
  return el("metadata", {}, [summary]);
}

export function regionRecipeAttrs(
  rr: RegionRecipe,
): Record<string, string | number> {
  return {
    "data-vellum-region-u0": rr.window.u0,
    "data-vellum-region-v0": rr.window.v0,
    "data-vellum-region-u1": rr.window.u1,
    "data-vellum-region-v1": rr.window.v1,
    "data-vellum-region-world-grid-w": rr.worldGridW,
    "data-vellum-region-detail": rr.detail,
  };
}

function regionMetadataSuffix(rr: RegionRecipe | undefined): string {
  if (rr === undefined) return "";
  const w = rr.window;
  return ` region=[${w.u0},${w.v0},${w.u1},${w.v1}] worldGrid=${rr.worldGridW} detail=${rr.detail}`;
}

export type ParsedRecipe = {
  readonly recipe: WorldRecipe;
  readonly style: StyleName;
  readonly version: string;
  readonly region?: RegionRecipe;
};

function readAttr(svg: string, name: string): string | null {
  const m = svg.match(new RegExp(`\\b${name}="([^"]*)"`));
  return m ? (m[1] as string) : null;
}

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
    ...parseRegion(svg),
  };
}

function parseRegion(svg: string): { region?: RegionRecipe } {
  const u0 = readAttr(svg, "data-vellum-region-u0");
  const v0 = readAttr(svg, "data-vellum-region-v0");
  const u1 = readAttr(svg, "data-vellum-region-u1");
  const v1 = readAttr(svg, "data-vellum-region-v1");
  const worldGridW = readAttr(svg, "data-vellum-region-world-grid-w");
  if (u0 === null || v0 === null || u1 === null || v1 === null || worldGridW === null) {
    return {};
  }
  const detail = readAttr(svg, "data-vellum-region-detail");
  return {
    region: {
      window: { u0: Number(u0), v0: Number(v0), u1: Number(u1), v1: Number(v1) },
      worldGridW: Number(worldGridW),
      detail: detail === null ? 0 : Number(detail),
    },
  };
}
