import { bfsDistance } from "../core/bfs-distance.ts";
import { clamp } from "../core/math.ts";
import { computeClimate, type Climate } from "../climate/climate.ts";
import type { Field } from "../core/grid.ts";
import { classifyBiomes } from "../climate/biomes.ts";
import { computeFlow, type FlowResult } from "../hydrology/flow.ts";
import type { River } from "../hydrology/rivers.ts";
import { buildHeightfield, type UvWindow } from "../terrain/heightfield.ts";
import type { Road } from "../society/roads.ts";
import { placeHamlets } from "../society/hamlets.ts";
import { layRegionRivers } from "./region-rivers.ts";
import { layWorldRoads } from "./region-roads.ts";
import { chainedFieldAndGround, detailForWindow, type ChainCache } from "./detail-chain.ts";
import { terrainInputsOf } from "./terrain-inputs.ts";
import { landSnapRadius, snapToLand } from "./snap-to-land.ts";
import { realmOwners, refineRegionRealms, type RealmTown } from "./realm-refine.ts";
import { regionSeaGate } from "./region-sea-gate.ts";
import { harbourReachCells, seatProjected } from "./seat-settlements.ts";
import { regionRealmBorders, regionRealmRings } from "./realm-carry.ts";
import { LOD_BANDS } from "./lod.ts";
import type { FeatureNames, NamedLake, NamedSettlement, World } from "./types.ts";

export type RegionSpec = {
  readonly window: UvWindow;
  readonly gridW: number;
  readonly gridH: number;
  readonly title: string;
  /** Draw the terrain from the chained detail field (Issue #396-Issue #398) instead of the bare heightfield. Dark by default: Issue #400 turns it on for the Glass and leaves the atlas plates bare. */
  readonly detail?: boolean;
  /** A chain cache to build the ancestry in, so a caller drawing many windows of one world shares their parents (Issue #400). Omitted, each call builds its own and shares nothing. */
  readonly chainCache?: ChainCache;
};

export function regionDetailLevel(spec: RegionSpec): number {
  return spec.detail === true ? detailForWindow(spec.window) : 0;
}

type RegionGrid = {
  readonly world: World;
  readonly window: UvWindow;
  readonly gridW: number;
  readonly gridH: number;
  readonly worldAspect: number;
};

function regionElevation(
  g: RegionGrid,
  spec: RegionSpec,
  seaLevel: number,
): { readonly elev: Field; readonly ground: Field } {
  const { world, window, gridW, gridH, worldAspect } = g;
  const { recipe } = world;
  const terrain = terrainInputsOf(recipe);
  if (spec.detail === true) {
    const chainSpec = {
      seed: recipe.seed,
      mapType: recipe.mapType,
      window,
      gridW,
      gridH,
      worldAspect,
      seaLevel,
      ...terrain,
    };
    const { field, ground } = chainedFieldAndGround(chainSpec, spec.chainCache);
    return { elev: field, ground };
  }
  const elev = buildHeightfield({
    seed: recipe.seed,
    gridW,
    gridH,
    mapType: recipe.mapType,
    window,
    worldAspect,
    ...terrain,
  });
  return { elev, ground: elev };
}

function worldElevSpan(world: World, seaLevel: number): number {
  let worldMax = -Infinity;
  for (const v of world.elev.data) worldMax = Math.max(worldMax, v);
  return worldMax - seaLevel;
}

function regionWaters(
  g: RegionGrid,
  land: { readonly elev: Field; readonly ground: Field; readonly seaLevel: number },
  elevSpan: number,
): { flow: FlowResult; rivers: River[]; riverCells: Uint8Array } {
  const { world, window, gridW, gridH, worldAspect } = g;
  const { elev, ground, seaLevel } = land;
  const { recipe } = world;
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
  const { laid, extracted } = layRegionRivers(world, window, { elev, flow, seaLevel, ground });
  const rivers = [...laid, ...extracted];
  const riverCells = new Uint8Array(gridW * gridH);
  for (const r of rivers) {
    for (const p of r.points) riverCells[Math.round(p.x) + Math.round(p.y) * gridW] = 1;
  }
  return { flow, rivers, riverCells };
}

function regionClimate(
  g: RegionGrid,
  elev: Field,
  seaLevel: number,
  riverCells: Uint8Array,
  elevSpan: number,
): { climate: Climate; biomes: Uint8Array } {
  const { world, window, worldAspect } = g;
  const { recipe } = world;
  const climate = computeClimate(elev, seaLevel, recipe.seed, {
    band: recipe.band,
    riverCells,
    windDir: world.winds.dir,
    window,
    worldAspect,
    elevSpan,
  });
  const biomes = classifyBiomes(elev, seaLevel, climate, elevSpan);
  return { climate, biomes };
}

type RegionLand = { readonly elev: Field; readonly seaLevel: number; readonly riverCells: Uint8Array };

function projectSettlements(
  g: RegionGrid,
  spec: RegionSpec,
  land: RegionLand,
): { settlements: NamedSettlement[]; regionIdxOf: Map<number, number> } {
  const { world, window, gridW, gridH } = g;
  const { elev, seaLevel } = land;
  const { recipe } = world;
  const du = window.u1 - window.u0;
  const dv = window.v1 - window.v0;
  const inset = 0.02;
  const snapRadius = landSnapRadius(gridW, window, recipe.gridW);
  const harbourReach = harbourReachCells(gridW, window, recipe.gridW);
  const settlements: NamedSettlement[] = [];
  const regionIdxOf = new Map<number, number>();
  const drowned: string[] = [];
  world.settlements.forEach((s, worldIdx) => {
    const u = s.x / (recipe.gridW - 1);
    const v = s.y / (recipe.gridH - 1);
    if (
      u < window.u0 + du * inset ||
      u > window.u1 - du * inset ||
      v < window.v0 + dv * inset ||
      v > window.v1 - dv * inset
    ) {
      return;
    }
    const gx = Math.round(((u - window.u0) / du) * (gridW - 1));
    const gy = Math.round(((v - window.v0) / dv) * (gridH - 1));
    const cell = snapToLand(elev, seaLevel, gx, gy, snapRadius);
    if (cell === null) {
      drowned.push(s.name);
      return;
    }
    regionIdxOf.set(worldIdx, settlements.length);
    const seat = seatProjected(s, cell, land, harbourReach);
    settlements.push({ ...s, x: seat.x, y: seat.y });
  });
  if (drowned.length > 0) {
    console.warn(
      `[region] ${spec.title}: ${drowned.length} settlement(s) found no shore within ${snapRadius} cell(s) and were dropped: ${drowned.join(", ")}`,
    );
  }
  return { settlements, regionIdxOf };
}

function regionRoadLabels(
  g: RegionGrid,
  land: RegionLand,
  placed: { readonly settlements: ReadonlyArray<NamedSettlement>; readonly regionIdxOf: ReadonlyMap<number, number> },
): Int16Array {
  const { world, window } = g;
  const { recipe } = world;
  const towns: RealmTown[] = [];
  for (const [worldIdx, regionIdx] of placed.regionIdxOf) {
    const ws = world.settlements[worldIdx] as NamedSettlement;
    const rs = placed.settlements[regionIdx] as NamedSettlement;
    towns.push({ x: rs.x, y: rs.y, realm: world.realms.labels[ws.x + ws.y * recipe.gridW] as number });
  }
  return refineRegionRealms(world, window, land, towns);
}

function regionLakes(g: RegionGrid, elev: Field, seaLevel: number): NamedLake[] {
  const { world, window, gridW, gridH } = g;
  const { recipe } = world;
  const du = window.u1 - window.u0;
  const dv = window.v1 - window.v0;
  return world.names.lakes.flatMap((lake) => {
    const u = lake.x / (recipe.gridW - 1);
    const v = lake.y / (recipe.gridH - 1);
    if (u < window.u0 || u > window.u1 || v < window.v0 || v > window.v1) return [];
    const gx = ((u - window.u0) / du) * (gridW - 1);
    const gy = ((v - window.v0) / dv) * (gridH - 1);
    if ((elev.data[Math.round(gx) + Math.round(gy) * gridW] as number) > seaLevel) return [];
    return [{ x: gx, y: gy, name: lake.name }];
  });
}

function regionTitleFor(world: World, spec: RegionSpec): World["title"] {
  return {
    title: spec.title,
    subtitle: `A regional survey, drawn from the greater chart of ${world.title.title}`,
    year: world.title.year,
  };
}

function regionNames(world: World, lakes: NamedLake[]): FeatureNames {
  return {
    rivers: new Map(),
    sea: world.names.sea,
    range: null,
    forest: null,
    lakes,
    realms: world.names.realms,
  };
}

function regionCarry(
  g: RegionGrid,
  land: Pick<RegionLand, "elev" | "seaLevel">,
  labels: Int16Array,
): NonNullable<World["region"]> {
  const { world, window, gridW, gridH } = g;
  const { recipe } = world;
  return {
    window,
    worldGridW: recipe.gridW,
    worldGridH: recipe.gridH,
    seaGate: regionSeaGate(world, window, { gridW, gridH }, land),
    realmRings: regionRealmRings(realmOwners(world, window, land, labels), gridW, gridH),
    realmBorders: regionRealmBorders(labels, gridW, gridH),
    parentRealmLabels: world.realms.labels,
  };
}

function regionPeople(
  g: RegionGrid,
  spec: RegionSpec,
  land: RegionLand,
): { peopled: NamedSettlement[]; roads: Road[]; roadLabels: Int16Array; seats: number[] } {
  const { world, window } = g;
  const { elev, seaLevel } = land;
  const placed = projectSettlements(g, spec, land);
  const { settlements } = placed;
  const seats = world.realms.seats.map((wi) => placed.regionIdxOf.get(wi) ?? -1);
  const roadLabels = regionRoadLabels(g, land, placed);
  const roads = layWorldRoads(world, window, land, placed);

  const deepestSizeUV = (LOD_BANDS[LOD_BANDS.length - 1] as (typeof LOD_BANDS)[number]).sizeUV;
  const hamlets = window.u1 - window.u0 <= deepestSizeUV + 1e-9 ? placeHamlets(world, window, elev, seaLevel) : [];
  const peopled = hamlets.length > 0 ? [...settlements, ...hamlets] : settlements;
  return { peopled, roads, roadLabels, seats };
}

export function generateRegionWorld(world: World, spec: RegionSpec): World {
  const { recipe } = world;
  const { window, gridW, gridH } = spec;
  const worldAspect = (recipe.gridW - 1) / (recipe.gridH - 1);
  const g: RegionGrid = { world, window, gridW, gridH, worldAspect };

  const seaLevel = world.seaLevel;
  const { elev, ground } = regionElevation(g, spec, seaLevel);
  const elevSpan = worldElevSpan(world, seaLevel);
  const { flow, rivers, riverCells } = regionWaters(g, { elev, ground, seaLevel }, elevSpan);
  const { climate, biomes } = regionClimate(g, elev, seaLevel, riverCells, elevSpan);

  const { peopled, roads, roadLabels, seats } = regionPeople(g, spec, { elev, seaLevel, riverCells });

  const oceanDist = bfsDistance(gridW, gridH, (x, y) => (elev.data[x + y * gridW] as number) > seaLevel);

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
    realms: { labels: roadLabels, seats },
    arms: [],
    culture: world.culture,
    title: regionTitleFor(world, spec),
    names: regionNames(world, regionLakes(g, elev, seaLevel)),
    history: { events: [] },
    beasts: [],
    oceanDist,
    region: regionCarry(g, { elev, seaLevel }, roadLabels),
  };
}

export function windowAround(world: World, s: { x: number; y: number }, size: number): UvWindow {
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
