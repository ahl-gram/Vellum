import { bfsDistance } from "../core/bfs-distance.ts";
import { createRng } from "../core/rng.ts";
import { classifyBiomes, BIOMES } from "../climate/biomes.ts";
import { computeClimate, type ClimateBand } from "../climate/climate.ts";
import { computeFlow } from "../hydrology/flow.ts";
import { extractRivers } from "../hydrology/rivers.ts";
import { findLakes } from "../hydrology/lakes.ts";
import { buildHeightfield, type MapType } from "../terrain/heightfield.ts";
import { pickSeaLevel } from "../terrain/sealevel.ts";
import { CULTURES, createNamer, makeMapTitle } from "../society/names.ts";
import { placeSettlements } from "../society/sites.ts";
import { buildRoads } from "../society/roads.ts";
import { partitionRealms } from "../society/realms.ts";
import { blazonRealms } from "../society/heraldry.ts";
import { simulateHistory } from "../society/history.ts";
import type { FeatureNames, World, WorldRecipe } from "./types.ts";

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
  // the seed always rolls every pick — overrides replace results, never
  // skip draws, so forcing one parameter cannot shift the others
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

export function generateWorld(recipe: WorldRecipe): World {
  const { seed, gridW, gridH, mapType } = recipe;
  const rng = createRng(seed);

  const elev = buildHeightfield({
    seed,
    gridW,
    gridH,
    mapType,
    ...(recipe.coastWarp !== undefined ? { coastWarp: recipe.coastWarp } : {}),
  });
  const seaLevel = pickSeaLevel(elev, recipe.landFraction);

  // one prevailing direction per world; its own fork so no other stream shifts
  const winds = { dir: rng.fork("winds").range(0, Math.PI * 2) };

  // base moisture drives rainfall; final climate adds river wetness after
  const preClimate = computeClimate(elev, seaLevel, seed, { band: recipe.band });
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

  const climate = computeClimate(elev, seaLevel, seed, {
    band: recipe.band,
    riverCells,
  });
  const biomes = classifyBiomes(elev, seaLevel, climate);

  const citystate = mapType === "citystate";
  const settlements = placeSettlements(
    elev,
    seaLevel,
    flow,
    riverCells,
    biomes,
    rng.fork("sites"),
    citystate ? { maxTowns: 2, maxVillages: 18 } : {},
  );

  const roads = buildRoads(elev, seaLevel, riverCells, settlements);
  const realms = partitionRealms(
    elev,
    seaLevel,
    riverCells,
    settlements,
    citystate ? { maxRealms: 1 } : {},
  );

  const culture = rng.fork("culture").pick(CULTURES);
  const arms = blazonRealms(culture, realms.seats.length, rng.fork("heraldry"));
  const namer = createNamer(rng.fork("names"), culture);
  const named = settlements.map((s) => ({ ...s, name: namer.name("settlement") }));

  const riverNames = new Map<number, string>();
  rivers.forEach((r, i) => {
    const mouthAcc = r.points[r.points.length - 1]?.acc ?? 0;
    if (r.endsInOcean && r.points.length >= 14 && mouthAcc > 0) {
      riverNames.set(i, namer.name("river"));
    }
  });

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

  const lakes = findLakes(elev, seaLevel, Math.max(12, Math.round(gridW * gridH * 0.0008)))
    .slice(0, 2)
    .map((lake) => ({
      x: lake.centroid.x,
      y: lake.centroid.y,
      name: namer.name("lake"),
    }));

  const names: FeatureNames = {
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

  // a city-state's chart is named for its city
  const capitalName = named.find((s) => s.kind === "capital")?.name;
  const title = makeMapTitle(
    rng.fork("title"),
    culture,
    mapType,
    citystate ? capitalName : undefined,
  );

  // history runs LAST on its own fork: appending it cannot reshuffle any
  // earlier stream, so geography, names, and the title are unchanged.
  const history = simulateHistory(
    {
      settlements: named,
      seats: realms.seats,
      realmNames: names.realms,
      presentYear: title.year,
    },
    rng.fork("history"),
  );
  const settled = named.map((s, i) => ({
    ...s,
    founded: history.founded[i] as number,
    ruined: history.ruined[i] as boolean,
  }));

  const oceanDist = bfsDistance(gridW, gridH, (x, y) =>
    (elev.data[x + y * gridW] as number) > seaLevel,
  );

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
    history: { events: history.events },
    oceanDist,
  };
}
