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
import type { History } from "../society/history.ts";

export type WorldRecipe = {
  readonly seed: number;
  readonly gridW: number;
  readonly gridH: number;
  readonly mapType: MapType;
  readonly landFraction: number;
  readonly band: ClimateBand;
  /** Coastline irregularity in [0, 1]: 0 is the pure radial island, 1 deeply lobed
   * with offshore islets. Omitted uses the map type's natural SHAPES value (0.55);
   * the Explorer coast slider (#137) and --coast-warp set it. */
  readonly coastWarp?: number;
};

export type NamedSettlement = Settlement & {
  readonly name: string;
  /** Founding year, from the history simulation. */
  readonly founded: number;
  /** True when the settlement is a ruin (abandoned in the chronicle). */
  readonly ruined: boolean;
};

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

/**
 * The prevailing wind: radians, the direction the wind blows toward, in grid
 * coordinates (x east, y south). One roll per world on its own named fork;
 * the nautical arrows read it, and (from #74) so does the climate. Consumers
 * must read this value, never re-fork "winds" to derive their own.
 */
export type Winds = { readonly dir: number };

export type World = {
  readonly recipe: WorldRecipe;
  readonly elev: Field;
  readonly seaLevel: number;
  readonly winds: Winds;
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
  /** The world's deterministic history: founding dates, ruins, a chronicle. */
  readonly history: History;
  /** Hop distance from the nearest land cell, over water. */
  readonly oceanDist: Float64Array;
  /** Present on regional charts: ties scale back to the parent world. */
  readonly region?: {
    readonly window: UvWindow;
    readonly worldGridW: number;
  };
};
