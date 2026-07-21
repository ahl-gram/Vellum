import { bfsDistance } from "../core/bfs-distance.ts";
import { clamp } from "../core/math.ts";
import { NEIGHBORS_8 } from "../core/grid.ts";
import { computeClimate } from "../climate/climate.ts";
import { classifyBiomes } from "../climate/biomes.ts";
import { computeFlow } from "../hydrology/flow.ts";
import { buildHeightfield, type UvWindow } from "../terrain/heightfield.ts";
import { buildRoads } from "../society/roads.ts";
import { placeHamlets } from "../society/hamlets.ts";
import { anchorRegionRivers } from "./region-rivers.ts";
import { seaMask } from "../hydrology/sea-mask.ts";
import { LOD_BANDS } from "./lod.ts";
import type { NamedLake, NamedSettlement, World } from "./types.ts";

export type RegionSpec = {
  readonly window: UvWindow;
  readonly gridW: number;
  readonly gridH: number;
  readonly title: string;
};

/**
 * A regional chart of the SAME world at finer sampling. Elevation is a
 * continuous function of world-space (u, v), so the terrain inside the
 * window matches the world chart exactly — just with more detail.
 * Settlements are projected from the world; rivers and roads re-derive
 * at the finer resolution.
 */
export function generateRegionWorld(world: World, spec: RegionSpec): World {
  const { recipe } = world;
  const { window, gridW, gridH } = spec;
  const worldAspect = (recipe.gridW - 1) / (recipe.gridH - 1);

  const elev = buildHeightfield({
    seed: recipe.seed,
    gridW,
    gridH,
    mapType: recipe.mapType,
    window,
    worldAspect,
  });
  const seaLevel = world.seaLevel; // absolute — same waterline as the world chart

  // #162: normalize climate/biomes against the PARENT world's elevation span, not
  // the window's own local max, so temperature and the snow/alpine bands are
  // continuous with the world chart across the window boundary (no banding seam).
  let worldMax = -Infinity;
  for (const v of world.elev.data) worldMax = Math.max(worldMax, v as number);
  const elevSpan = worldMax - seaLevel;

  const preClimate = computeClimate(elev, seaLevel, recipe.seed, {
    band: recipe.band,
    windDir: world.winds.dir, // the same wind blows over a region of the same world
    window,
    worldAspect,
    elevSpan,
  });
  const rain = new Float64Array(gridW * gridH);
  for (let i = 0; i < rain.length; i++) {
    rain[i] = 0.3 + 1.4 * (preClimate.moisture.data[i] as number);
  }
  const flow = computeFlow(elev, seaLevel, rain);
  // #162: anchor the re-derived rivers to the parent world so a stream does not
  // gain or lose river status between zoom levels and named world rivers never
  // vanish at the window boundary. (region-rivers.ts documents the two fixes.)
  const rivers = anchorRegionRivers(world, window, gridW, gridH, elev, flow, seaLevel);
  const riverCells = new Uint8Array(gridW * gridH);
  for (const r of rivers) {
    // projected world rivers carry fractional cell coords; snap for the raster.
    for (const p of r.points) riverCells[Math.round(p.x) + Math.round(p.y) * gridW] = 1;
  }
  const climate = computeClimate(elev, seaLevel, recipe.seed, {
    band: recipe.band,
    riverCells,
    windDir: world.winds.dir,
    window,
    worldAspect,
    elevSpan,
  });
  const biomes = classifyBiomes(elev, seaLevel, climate, elevSpan);

  // project world settlements that fall inside the window
  const du = window.u1 - window.u0;
  const dv = window.v1 - window.v0;
  const inset = 0.02;
  const settlements: NamedSettlement[] = [];
  // #162: map each surviving world settlement index to its new region index, so
  // realm seats project into the region instead of being dropped (region.ts used
  // to return seats: [], silently downgrading every seat's castle to a town dot).
  const regionIdxOf = new Map<number, number>();
  world.settlements.forEach((s, worldIdx) => {
    const u = s.x / (recipe.gridW - 1);
    const v = s.y / (recipe.gridH - 1);
    if (
      u < window.u0 + du * inset || u > window.u1 - du * inset ||
      v < window.v0 + dv * inset || v > window.v1 - dv * inset
    ) {
      return;
    }
    let gx = Math.round(((u - window.u0) / du) * (gridW - 1));
    let gy = Math.round(((v - window.v0) / dv) * (gridH - 1));
    // fine-grid coastline may wiggle: snap to a nearby land cell if needed
    if ((elev.data[gx + gy * gridW] as number) <= seaLevel) {
      let snapped = false;
      for (const [dx, dy] of NEIGHBORS_8) {
        const nx = clamp(gx + dx, 0, gridW - 1);
        const ny = clamp(gy + dy, 0, gridH - 1);
        if ((elev.data[nx + ny * gridW] as number) > seaLevel) {
          gx = nx;
          gy = ny;
          snapped = true;
          break;
        }
      }
      if (!snapped) return;
    }
    regionIdxOf.set(worldIdx, settlements.length);
    settlements.push({ ...s, x: gx, y: gy });
  });

  // Realm-indexed seats (array index = realm id), with a -1 sentinel for any seat
  // that fell outside the window. settlements.ts maps -1 to nothing, so it is
  // harmless there; the render gates the realm-tint halo off on region sheets.
  const seats = world.realms.seats.map((wi) => regionIdxOf.get(wi) ?? -1);

  // Roads are laid over the projected WORLD settlements only, before hamlets
  // append (#171). buildRoads filters town/village literals anyway, but keeping
  // hamlets out of its input makes "no hamlet gets a road" true by construction.
  const roads = buildRoads(elev, seaLevel, riverCells, settlements);

  // #171: the deepest band's payoff. Gated on the WINDOW SIZE, not a caller flag,
  // so every producer of a deepest-band sheet (live redraft, download redraw,
  // tests) agrees byte-for-byte with no parameter to forget. Appended AFTER the
  // projected settlements so the realm-seat indices above stay valid.
  const deepestSizeUV = (LOD_BANDS[LOD_BANDS.length - 1] as (typeof LOD_BANDS)[number]).sizeUV;
  const hamlets =
    du <= deepestSizeUV + 1e-9 ? placeHamlets(world, window, elev, seaLevel) : [];
  const peopled = hamlets.length > 0 ? [...settlements, ...hamlets] : settlements;

  const oceanDist = bfsDistance(gridW, gridH, (x, y) =>
    (elev.data[x + y * gridW] as number) > seaLevel,
  );

  // #234: the parent world's authoritative sea/lake partition, projected onto the
  // region grid. The region's OWN seaMask cannot classify this: cropping reconnects
  // an inland lake to the window edge, so the region floods it as border-sea. So the
  // sea caption would sit on a lake. We instead sample the parent's seaMask at each
  // region cell's world point. Coarse (world resolution) but only ever read at deep
  // water far from any shore, where the coarse boundary does not matter.
  const worldSea = seaMask(world.elev, world.seaLevel);
  const seaGate = new Uint8Array(gridW * gridH);
  for (let gy = 0; gy < gridH; gy++) {
    for (let gx = 0; gx < gridW; gx++) {
      const u = window.u0 + (gx / (gridW - 1)) * du;
      const v = window.v0 + (gy / (gridH - 1)) * dv;
      const wx = Math.round(u * (recipe.gridW - 1));
      const wy = Math.round(v * (recipe.gridH - 1));
      seaGate[gx + gy * gridW] = worldSea[wx + wy * recipe.gridW] as number;
    }
  }

  // #234: carry the parent's named lakes that fall inside the window, remapped to
  // region grid coords, so a lake captions as a lake instead of inheriting the sea
  // name (region.names used to strip lakes to []). Skip any whose projected centroid
  // is not region water: the finer field can reshape a lake's exact outline, and a
  // lake label on dry land would read as a bug.
  const regionLakes: NamedLake[] = world.names.lakes.flatMap((lake) => {
    const u = lake.x / (recipe.gridW - 1);
    const v = lake.y / (recipe.gridH - 1);
    if (u < window.u0 || u > window.u1 || v < window.v0 || v > window.v1) return [];
    const gx = ((u - window.u0) / du) * (gridW - 1);
    const gy = ((v - window.v0) / dv) * (gridH - 1);
    if ((elev.data[Math.round(gx) + Math.round(gy) * gridW] as number) > seaLevel) return [];
    return [{ x: gx, y: gy, name: lake.name }];
  });

  return {
    recipe: { ...recipe, gridW, gridH },
    elev,
    seaLevel,
    winds: world.winds, // the same wind blows over a region of the same world
    flow,
    rivers,
    riverCells,
    climate,
    biomes,
    settlements: peopled,
    roads,
    realms: { labels: new Int16Array(gridW * gridH).fill(-1), seats },
    arms: [],
    culture: world.culture,
    title: {
      title: spec.title,
      subtitle: `A regional survey, drawn from the greater chart of ${world.title.title}`,
      year: world.title.year,
    },
    names: {
      rivers: new Map(),
      sea: world.names.sea,
      range: null,
      forest: null,
      lakes: regionLakes,
      realms: [],
    },
    // regional plates show no chronicle; founded/ruined ride along on the
    // settlements (spread above), so ruins still render at the finer scale.
    history: { events: [] },
    oceanDist,
    region: { window, worldGridW: recipe.gridW, seaGate },
  };
}

/** Window of the given world-fraction size centered on a settlement. */
export function windowAround(
  world: World,
  s: { x: number; y: number },
  size: number,
): UvWindow {
  const u = s.x / (world.recipe.gridW - 1);
  const v = s.y / (world.recipe.gridH - 1);
  const half = size / 2;
  const u0 = clamp(u - half, 0.01, 0.99 - size);
  const v0 = clamp(v - half, 0.01, 0.99 - size);
  return { u0, v0, u1: u0 + size, v1: v0 + size };
}

/**
 * The deterministic title of a regional survey of `window`: "The Environs of X", where X is
 * the settlement nearest the window CENTRE in grid space (the same space windowAround maps
 * from). A pure function of (world, window) with NO free-form input, which is what lets the
 * Explorer's live redraft and the download-redraw path agree byte-for-byte (#169): a region
 * SVG stamps only its geometry (window + parent grid), never its title, so a downloaded sheet
 * redraws its cartouche by recomputing this from the recovered window over the regenerated
 * base world. (The atlas titles its two canonical plates by a settlement->window flow; for an
 * interior window centred on a settlement this rule resolves to that same settlement.)
 */
export function regionTitle(world: World, window: UvWindow): string {
  if (world.settlements.length === 0) return world.title.title;
  const cx = ((window.u0 + window.u1) / 2) * (world.recipe.gridW - 1);
  const cy = ((window.v0 + window.v1) / 2) * (world.recipe.gridH - 1);
  const nearest = world.settlements.reduce((a, b) =>
    Math.hypot(b.x - cx, b.y - cy) < Math.hypot(a.x - cx, a.y - cy) ? b : a,
  );
  return `The Environs of ${nearest.name}`;
}
