import type { Field } from "../core/grid.ts";
import type { Climate, ClimateBand } from "../climate/climate.ts";
import type { FlowResult } from "../hydrology/flow.ts";
import type { River } from "../hydrology/rivers.ts";
import type { MapType, UvWindow } from "../terrain/heightfield.ts";
import type { Culture, MapTitle } from "../society/names.ts";
import type { Road } from "../society/roads.ts";
import type { Settlement } from "../society/sites.ts";
import type { RealmsResult } from "../society/realms.ts";
import type { Arms } from "../society/heraldry.ts";

export type WorldRecipe = {
  readonly seed: number;
  readonly gridW: number;
  readonly gridH: number;
  readonly mapType: MapType;
  readonly landFraction: number;
  readonly band: ClimateBand;
};

export type NamedSettlement = Settlement & { readonly name: string };

export type NamedLake = {
  readonly x: number;
  readonly y: number;
  readonly name: string;
};

export type FeatureNames = {
  /** Keyed by index into world.rivers. */
  readonly rivers: ReadonlyMap<number, string>;
  readonly sea: string;
  readonly range: string | null;
  readonly forest: string | null;
  readonly lakes: ReadonlyArray<NamedLake>;
  /** Indexed by realm id; empty when only one realm. */
  readonly realms: ReadonlyArray<string>;
};

export type World = {
  readonly recipe: WorldRecipe;
  readonly elev: Field;
  readonly seaLevel: number;
  readonly flow: FlowResult;
  readonly rivers: ReadonlyArray<River>;
  readonly riverCells: Uint8Array;
  readonly climate: Climate;
  readonly biomes: Uint8Array;
  readonly settlements: ReadonlyArray<NamedSettlement>;
  readonly roads: ReadonlyArray<Road>;
  readonly realms: RealmsResult;
  /** One coat of arms per realm, indexed by realm id (empty when no realms). */
  readonly arms: ReadonlyArray<Arms>;
  readonly culture: Culture;
  readonly title: MapTitle;
  readonly names: FeatureNames;
  /** Hop distance from the nearest land cell, over water. */
  readonly oceanDist: Float64Array;
  /** Present on regional charts: ties scale back to the parent world. */
  readonly region?: {
    readonly window: UvWindow;
    readonly worldGridW: number;
  };
};
