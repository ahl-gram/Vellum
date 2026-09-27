import { bfsDistance } from "../core/bfs-distance.ts";
import { createRng, type Rng } from "../core/rng.ts";
import type { Field } from "../core/grid.ts";
import { classifyBiomes, BIOMES } from "../climate/biomes.ts";
import { computeClimate, type Climate, type ClimateBand } from "../climate/climate.ts";
import { computeFlow, type FlowResult } from "../hydrology/flow.ts";
import { extractRivers, isMajorRiver, type River } from "../hydrology/rivers.ts";
import { mountainCrests } from "../hydrology/crests.ts";
import { findLakes } from "../hydrology/lakes.ts";
import { buildHeightfield, type MapType } from "../terrain/heightfield.ts";
import { pickSeaLevel } from "../terrain/sealevel.ts";
import { CULTURES, createNamer, makeMapTitle, type Culture, type MapTitle, type Namer } from "../society/names.ts";
import { placeSettlements, type Settlement } from "../society/sites.ts";
import { buildRoads } from "../society/roads.ts";
import { partitionRealms, type RealmsResult } from "../society/realms.ts";
import { blazonRealms } from "../society/heraldry.ts";
import { simulateHistory, type HistoricalEvent } from "../society/history.ts";
import { assignFormerNames } from "../society/renames.ts";
import { conjureBestiary, type SeaBeast } from "../society/bestiary.ts";
import { nameSetOf } from "../society/hamlets.ts";
import { seaMask } from "../hydrology/sea-mask.ts";
import type { FeatureNames, NamedSettlement, Winds, World, WorldRecipe } from "./types.ts";

const MAP_TYPE_WEIGHTS: ReadonlyArray<readonly [MapType, number]> = [
  ["island", 0.4],
  ["archipelago", 0.27],
  ["continent", 0.23],
  ["citystate", 0.1],
];

const BAND_WEIGHTS: ReadonlyArray<readonly [ClimateBand, number]> = [
  ["temperate", 0.6],
  ["tropical", 0.25],
  ["polar", 0.15],
];

const LAND_FRACTION: Record<MapType, number> = {
  island: 0.34,
  archipelago: 0.24,
  continent: 0.46,
  citystate: 0.3,
};

function weightedPick<T>(
  pairs: ReadonlyArray<readonly [T, number]>,
  roll: number,
): T {
  let acc = 0;
  for (const [value, weight] of pairs) {
    acc += weight;
    if (roll < acc) return value;
  }
  return (pairs[pairs.length - 1] as readonly [T, number])[0];
}

export function defaultRecipe(
  seed: number,
  overrides: Partial<WorldRecipe> = {},
): WorldRecipe {
  const rng = createRng(seed).fork("recipe");
  const rolledType = weightedPick(MAP_TYPE_WEIGHTS, rng.next());
  const rolledBand = weightedPick(BAND_WEIGHTS, rng.next());
  const mapType = overrides.mapType ?? rolledType;
  return {
    seed,
    gridW: 320,
    gridH: 240,
    mapType,
    landFraction: LAND_FRACTION[mapType],
    band: rolledBand,
    ...stripUndefined(overrides),
  };
}

function stripUndefined<T extends object>(obj: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out as Partial<T>;
}

type NamedSettlementCore = Settlement & { readonly name: string };

function terrainStage(recipe: WorldRecipe, rng: Rng): { elev: Field; seaLevel: number; winds: Winds } {
  const { seed, gridW, gridH, mapType } = recipe;
  const elev = buildHeightfield({
    seed,
    gridW,
    gridH,
    mapType,
    ...(recipe.coastWarp !== undefined ? { coastWarp: recipe.coastWarp } : {}),
  });
  const seaLevel = pickSeaLevel(elev, recipe.landFraction);

  const winds = { dir: rng.fork("winds").range(0, Math.PI * 2) };
  return { elev, seaLevel, winds };
}

function hydrologyStage(
  recipe: WorldRecipe,
  elev: Field,
  seaLevel: number,
  winds: Winds,
): { flow: FlowResult; rivers: River[]; riverCells: Uint8Array } {
  const { seed, gridW, gridH } = recipe;
  const preClimate = computeClimate(elev, seaLevel, seed, {
    band: recipe.band,
    windDir: winds.dir,
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
  return { flow, rivers, riverCells };
}

function climateStage(
  recipe: WorldRecipe,
  elev: Field,
  seaLevel: number,
  winds: Winds,
  riverCells: Uint8Array,
): { climate: Climate; biomes: Uint8Array } {
  const climate = computeClimate(elev, seaLevel, recipe.seed, {
    band: recipe.band,
    riverCells,
    windDir: winds.dir,
  });
  const biomes = classifyBiomes(elev, seaLevel, climate);
  return { climate, biomes };
}

type Ground = {
  readonly elev: Field;
  readonly seaLevel: number;
  readonly flow: FlowResult;
  readonly rivers: ReadonlyArray<River>;
  readonly riverCells: Uint8Array;
  readonly biomes: Uint8Array;
};

function siteStage(ground: Ground, rng: Rng, citystate: boolean): Settlement[] {
  const { elev, seaLevel, flow, riverCells, biomes } = ground;
  return placeSettlements(
    elev,
    seaLevel,
    flow,
    riverCells,
    biomes,
    rng.fork("sites"),
    citystate ? { maxTowns: 2, maxVillages: 18 } : {},
  );
}

function frontierMask(ground: Ground, gridW: number, gridH: number): Uint8Array {
  const { elev, seaLevel, flow, rivers } = ground;
  const mask = new Uint8Array(gridW * gridH);
  for (const r of rivers) {
    if (!isMajorRiver(r)) continue;
    for (const p of r.points) {
      const i = p.x + p.y * gridW;
      if ((elev.data[i] as number) > seaLevel) mask[i] = 1;
    }
  }
  const crests = mountainCrests(elev, flow, seaLevel);
  for (let i = 0; i < mask.length; i++) if (crests[i] === 1) mask[i] = 1;
  return mask;
}

function realmStage(
  ground: Ground,
  settlements: ReadonlyArray<Settlement>,
  recipe: WorldRecipe,
  citystate: boolean,
): { realms: RealmsResult; roads: ReturnType<typeof buildRoads> } {
  const { elev, seaLevel, riverCells } = ground;
  const realms = partitionRealms(elev, seaLevel, riverCells, settlements, {
    ...(citystate ? { maxRealms: 1 } : {}),
    barrier: frontierMask(ground, recipe.gridW, recipe.gridH),
  });
  const roads = buildRoads(elev, seaLevel, riverCells, settlements, realms);
  return { realms, roads };
}

function namePlaces(
  namer: Namer,
  settlements: ReadonlyArray<Settlement>,
  rivers: ReadonlyArray<River>,
): { named: NamedSettlementCore[]; riverNames: Map<number, string> } {
  const named = settlements.map((s) => ({ ...s, name: namer.name("settlement") }));

  const riverNames = new Map<number, string>();
  rivers.forEach((r, i) => {
    if (isMajorRiver(r)) {
      riverNames.set(i, namer.name("river"));
    }
  });
  return { named, riverNames };
}

function landCensus(biomes: Uint8Array): { hasRange: boolean; forestCells: number; landCells: number } {
  let hasRange = false;
  let forestCells = 0;
  let landCells = 0;
  for (let i = 0; i < biomes.length; i++) {
    const b = biomes[i] as number;
    if (b !== BIOMES.ocean) landCells++;
    if (b === BIOMES.snow || b === BIOMES.alpine) hasRange = true;
    if (
      b === BIOMES.temperateForest ||
      b === BIOMES.tropicalForest ||
      b === BIOMES.rainforest ||
      b === BIOMES.jungle ||
      b === BIOMES.taiga
    ) {
      forestCells++;
    }
  }
  return { hasRange, forestCells, landCells };
}

function featureNames(
  namer: Namer,
  ground: Ground,
  recipe: WorldRecipe,
  riverNames: Map<number, string>,
  realms: RealmsResult,
): FeatureNames {
  const { elev, seaLevel, biomes } = ground;
  const { gridW, gridH } = recipe;
  const { hasRange, forestCells, landCells } = landCensus(biomes);

  const lakes = findLakes(elev, seaLevel, Math.max(12, Math.round(gridW * gridH * 0.0008)))
    .slice(0, 2)
    .map((lake) => ({
      x: lake.centroid.x,
      y: lake.centroid.y,
      name: namer.name("lake"),
    }));

  return {
    rivers: riverNames,
    sea: namer.name("sea"),
    range: hasRange ? namer.name("peak") : null,
    forest: landCells > 0 && forestCells / landCells > 0.06 ? namer.name("forest") : null,
    lakes,
    realms:
      realms.seats.length > 1
        ? realms.seats.map(() => namer.name("realm"))
        : [],
  };
}

function worldTitle(rng: Rng, culture: Culture, mapType: MapType, named: ReadonlyArray<NamedSettlementCore>): MapTitle {
  const capitalName = named.find((s) => s.kind === "capital")?.name;
  return makeMapTitle(
    rng.fork("title"),
    culture,
    mapType,
    mapType === "citystate" ? capitalName : undefined,
  );
}

function worldHistory(
  rng: Rng,
  culture: Culture,
  named: ReadonlyArray<NamedSettlementCore>,
  realms: RealmsResult,
  names: FeatureNames,
  presentYear: number,
): { settled: NamedSettlement[]; events: ReadonlyArray<HistoricalEvent> } {
  const history = simulateHistory(
    {
      settlements: named,
      seats: realms.seats,
      realmNames: names.realms,
      presentYear,
    },
    rng.fork("history"),
  );
  const dated = named.map((s, i) => ({
    ...s,
    founded: history.founded[i] as number,
    ruined: history.ruined[i] as boolean,
  }));
  const formerNames = assignFormerNames(
    dated,
    culture,
    rng.fork("renames"),
    nameSetOf(dated, names),
  );
  const settled = dated.map((s, i) => {
    const formerName = formerNames.get(i);
    return formerName === undefined ? s : { ...s, formerName };
  });
  return { settled, events: history.events };
}

function oceanDistance(elev: Field, seaLevel: number, gridW: number, gridH: number): Float64Array {
  return bfsDistance(gridW, gridH, (x, y) =>
    (elev.data[x + y * gridW] as number) > seaLevel,
  );
}

function worldBestiary(
  ground: Ground,
  recipe: WorldRecipe,
  oceanDist: Float64Array,
  lore: { readonly culture: Culture; readonly settled: ReadonlyArray<NamedSettlement>; readonly presentYear: number; readonly names: FeatureNames },
  rng: Rng,
): ReadonlyArray<SeaBeast> {
  const { gridW, gridH } = recipe;
  return conjureBestiary(
    {
      gridW,
      gridH,
      oceanDist,
      seaMask: seaMask(ground.elev, ground.seaLevel),
      culture: lore.culture,
      settlements: lore.settled,
      presentYear: lore.presentYear,
    },
    rng.fork("bestiary"),
    nameSetOf(lore.settled, lore.names),
  );
}

export function generateWorld(recipe: WorldRecipe): World {
  const { seed, gridW, gridH, mapType } = recipe;
  const rng = createRng(seed);

  const { elev, seaLevel, winds } = terrainStage(recipe, rng);
  const { flow, rivers, riverCells } = hydrologyStage(recipe, elev, seaLevel, winds);
  const { climate, biomes } = climateStage(recipe, elev, seaLevel, winds, riverCells);
  const ground: Ground = { elev, seaLevel, flow, rivers, riverCells, biomes };

  const citystate = mapType === "citystate";
  const settlements = siteStage(ground, rng, citystate);
  const { realms, roads } = realmStage(ground, settlements, recipe, citystate);

  const culture = rng.fork("culture").pick(CULTURES);
  const arms = blazonRealms(culture, realms.seats.length, rng.fork("heraldry"));
  const namer = createNamer(rng.fork("names"), culture);
  const { named, riverNames } = namePlaces(namer, settlements, rivers);
  const names = featureNames(namer, ground, recipe, riverNames, realms);

  const title = worldTitle(rng, culture, mapType, named);
  const { settled, events } = worldHistory(rng, culture, named, realms, names, title.year);
  const oceanDist = oceanDistance(elev, seaLevel, gridW, gridH);
  const beasts = worldBestiary(ground, recipe, oceanDist, { culture, settled, presentYear: title.year, names }, rng);

  return {
    recipe,
    elev,
    seaLevel,
    winds,
    flow,
    rivers,
    riverCells,
    climate,
    biomes,
    settlements: settled,
    roads,
    realms,
    arms,
    culture,
    title,
    names,
    history: { events },
    beasts,
    oceanDist,
  };
}
