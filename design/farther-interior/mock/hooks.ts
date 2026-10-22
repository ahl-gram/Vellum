// Issue #950 round: the seams the forked region pipeline (region-copy.ts, chain-copy.ts) opens for river arm B. With no hook given the fork is the engine, byte for byte (selfcheck.ts).
import type { Field } from "../../../src/core/grid.ts";
import type { FlowResult } from "../../../src/hydrology/flow.ts";
import type { River } from "../../../src/hydrology/rivers.ts";
import type { UvWindow } from "../../../src/terrain/heightfield.ts";
import type { World } from "../../../src/world/types.ts";

export type WatersInput = {
  readonly world: World;
  readonly window: UvWindow;
  readonly gridW: number;
  readonly gridH: number;
  readonly elev: Field;
  readonly seaLevel: number;
  readonly rain: Float64Array;
};

export type ChainCarve = {
  /** Applied to every level the chain builds, its ancestors and the window itself, after that level is floored and de-bridged. */
  readonly fn: (field: Field, window: UvWindow) => Field;
  /** Joins the chain cache key, so a carved level is never served for an uncarved one. */
  readonly key: string;
};

export type RegionHooks = {
  /** After the chain: applied once, to the window's finished field, before anything reads it. */
  readonly carve?: (field: Field, window: UvWindow) => Field;
  /** Inside the chain. */
  readonly chainCarve?: ChainCarve;
  /** Replaces the water stage's `computeFlow` and `anchorRegionRivers` calls. */
  readonly waters?: (input: WatersInput) => { readonly flow: FlowResult; readonly rivers: River[] };
};
