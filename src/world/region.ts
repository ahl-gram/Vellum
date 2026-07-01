import { bfsDistance } from "../core/bfs-distance.ts";
import { clamp } from "../core/math.ts";
import { NEIGHBORS_8 } from "../core/grid.ts";
import { computeClimate } from "../climate/climate.ts";
import { classifyBiomes } from "../climate/biomes.ts";
import { computeFlow } from "../hydrology/flow.ts";
import { extractRivers } from "../hydrology/rivers.ts";
import { buildHeightfield, type UvWindow } from "../terrain/heightfield.ts";
import { buildRoads } from "../society/roads.ts";
import type { NamedSettlement, World } from "./types.ts";

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

  const preClimate = computeClimate(elev, seaLevel, recipe.seed, {
    band: recipe.band,
    window,
    worldAspect,
  });
  const rain = new Float64Array(gridW * gridH);
  for (let i = 0; i < rain.length; i++) {
    rain[i] = 0.3 + 1.4 * (preClimate.moisture.data[i] as number);
  }
  const flow = computeFlow(elev, seaLevel, rain);
  const rivers = extractRivers(elev, flow, seaLevel);
  const riverCells = new Uint8Array(gridW * gridH);
  for (const r of rivers) {
    for (const p of r.points) riverCells[p.x + p.y * gridW] = 1;
  }
  const climate = computeClimate(elev, seaLevel, recipe.seed, {
    band: recipe.band,
    riverCells,
    window,
    worldAspect,
  });
  const biomes = classifyBiomes(elev, seaLevel, climate);

  // project world settlements that fall inside the window
  const du = window.u1 - window.u0;
  const dv = window.v1 - window.v0;
  const inset = 0.02;
  const settlements: NamedSettlement[] = [];
  for (const s of world.settlements) {
    const u = s.x / (recipe.gridW - 1);
    const v = s.y / (recipe.gridH - 1);
    if (
      u < window.u0 + du * inset || u > window.u1 - du * inset ||
      v < window.v0 + dv * inset || v > window.v1 - dv * inset
    ) {
      continue;
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
      if (!snapped) continue;
    }
    settlements.push({ ...s, x: gx, y: gy });
  }

  const roads = buildRoads(elev, seaLevel, riverCells, settlements);

  const oceanDist = bfsDistance(gridW, gridH, (x, y) =>
    (elev.data[x + y * gridW] as number) > seaLevel,
  );

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
    settlements,
    roads,
    realms: { labels: new Int16Array(gridW * gridH).fill(-1), seats: [] },
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
      lakes: [],
      realms: [],
    },
    // regional plates show no chronicle; founded/ruined ride along on the
    // settlements (spread above), so ruins still render at the finer scale.
    history: { events: [] },
    oceanDist,
    region: { window, worldGridW: recipe.gridW },
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
