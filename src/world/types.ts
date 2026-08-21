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
import type { SeaBeast } from "../society/bestiary.ts";

export type WorldRecipe = {
  readonly seed: number;
  readonly gridW: number;
  readonly gridH: number;
  readonly mapType: MapType;
  readonly landFraction: number;
  readonly band: ClimateBand;
  /** Coastline irregularity in [0, 1]; omitted uses the map type's SHAPES value. */
  readonly coastWarp?: number;
};

export type NamedSettlement = Settlement & {
  readonly name: string;
  readonly founded: number;
  readonly ruined: boolean;
  readonly formerName?: string;
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

/** Radians, the direction the wind blows TOWARD, in grid coords (x east, y south); consumers read this and never re-fork "winds". */
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
  readonly arms: ReadonlyArray<Arms>;
  readonly culture: Culture;
  readonly title: MapTitle;
  readonly names: FeatureNames;
  readonly history: History;
  /** The deep's named inhabitants. */
  readonly beasts: ReadonlyArray<SeaBeast>;
  /** Hop distance from the nearest land cell, over water. */
  readonly oceanDist: Float64Array;
  readonly region?: {
    readonly window: UvWindow;
    readonly worldGridW: number;
    readonly worldGridH?: number;
    /** 1 = genuine border-connected sea, 0 = land or an inland lake; a cropped region's own seaMask floods lakes as sea, so sea furniture reads THIS, not oceanDist. */
    readonly seaGate?: Uint8Array;
    /** #423 the realm carry: the parent's grown realm outlines mapped into this window's grid coordinates, drawn by the realm layers in place of label-derived geometry. */
    readonly realmRings?: ReadonlyArray<{
      readonly realm: number;
      readonly rings: ReadonlyArray<ReadonlyArray<readonly [number, number]>>;
    }>;
    /** #423: the parent's border chains (one per land boundary) in this window's grid coordinates; strokes come from these, never from the rings, so a seam is inked once. */
    readonly realmBorders?: ReadonlyArray<ReadonlyArray<readonly [number, number]>>;
    /** #423: the parent's full realm label field, so tint assignment is computed from the PARENT's geometry (the #162 hazard) for whichever style renders. */
    readonly parentRealmLabels?: Int16Array;
  };
};
