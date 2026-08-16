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
  const rivers = anchorRegionRivers(world, window, gridW, gridH, elev, flow, seaLevel);
  const riverCells = new Uint8Array(gridW * gridH);
  for (const r of rivers) {
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

  const du = window.u1 - window.u0;
  const dv = window.v1 - window.v0;
  const inset = 0.02;
  const settlements: NamedSettlement[] = [];
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

  const seats = world.realms.seats.map((wi) => regionIdxOf.get(wi) ?? -1);

  const roadLabels = new Int16Array(gridW * gridH).fill(-1);
  for (let gy = 0; gy < gridH; gy++) {
    for (let gx = 0; gx < gridW; gx++) {
      if ((elev.data[gx + gy * gridW] as number) <= seaLevel) continue;
      const u = window.u0 + (gx / (gridW - 1)) * du;
      const v = window.v0 + (gy / (gridH - 1)) * dv;
      const wx = Math.round(u * (recipe.gridW - 1));
      const wy = Math.round(v * (recipe.gridH - 1));
      roadLabels[gx + gy * gridW] = world.realms.labels[wx + wy * recipe.gridW] as number;
    }
  }
  for (const [worldIdx, regionIdx] of regionIdxOf) {
    const ws = world.settlements[worldIdx] as NamedSettlement;
    const rs = settlements[regionIdx] as NamedSettlement;
    roadLabels[rs.x + rs.y * gridW] = world.realms.labels[ws.x + ws.y * recipe.gridW] as number;
  }
  const roads = buildRoads(elev, seaLevel, riverCells, settlements, { labels: roadLabels, seats });

  const deepestSizeUV = (LOD_BANDS[LOD_BANDS.length - 1] as (typeof LOD_BANDS)[number]).sizeUV;
  const hamlets =
    du <= deepestSizeUV + 1e-9 ? placeHamlets(world, window, elev, seaLevel) : [];
  const peopled = hamlets.length > 0 ? [...settlements, ...hamlets] : settlements;

  const oceanDist = bfsDistance(gridW, gridH, (x, y) =>
    (elev.data[x + y * gridW] as number) > seaLevel,
  );

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
    history: { events: [] },
    oceanDist,
    region: { window, worldGridW: recipe.gridW, seaGate },
  };
}

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

export function regionTitle(world: World, window: UvWindow): string {
  if (world.settlements.length === 0) return world.title.title;
  const cx = ((window.u0 + window.u1) / 2) * (world.recipe.gridW - 1);
  const cy = ((window.v0 + window.v1) / 2) * (world.recipe.gridH - 1);
  const nearest = world.settlements.reduce((a, b) =>
    Math.hypot(b.x - cx, b.y - cy) < Math.hypot(a.x - cx, a.y - cy) ? b : a,
  );
  return `The Environs of ${nearest.name}`;
}
