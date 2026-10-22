import type { Field } from "../core/grid.ts";
import { seaMask } from "../hydrology/sea-mask.ts";
import type { UvWindow } from "../terrain/heightfield.ts";
import { nearestParentCells } from "./region-parent.ts";
import type { World } from "./types.ts";

export type SeaGateInput = {
  readonly worldSea: Uint8Array;
  readonly parentLand: Uint8Array;
  readonly parentW: number;
  readonly parentH: number;
  readonly parentOf: Int32Array;
  readonly elev: Field;
  readonly seaLevel: number;
};

export function coastalParentCells(
  worldSea: Uint8Array,
  parentLand: Uint8Array,
  parentW: number,
  parentH: number,
): Uint8Array {
  void [worldSea, parentLand];
  return new Uint8Array(parentW * parentH);
}

export function refineSeaGate(input: SeaGateInput): Uint8Array {
  const { worldSea, parentOf, elev, seaLevel } = input;
  const gate = new Uint8Array(elev.data.length);
  for (let i = 0; i < gate.length; i++) {
    if ((elev.data[i] as number) <= seaLevel && worldSea[parentOf[i] as number] === 1) gate[i] = 1;
  }
  return gate;
}

export function regionSeaGate(
  world: World,
  window: UvWindow,
  grid: { readonly gridW: number; readonly gridH: number },
  land: { readonly elev: Field; readonly seaLevel: number },
): Uint8Array {
  const { recipe } = world;
  const parentLand = new Uint8Array(world.elev.data.length);
  for (let p = 0; p < parentLand.length; p++) parentLand[p] = (world.elev.data[p] as number) > world.seaLevel ? 1 : 0;
  return refineSeaGate({
    worldSea: seaMask(world.elev, world.seaLevel),
    parentLand,
    parentW: recipe.gridW,
    parentH: recipe.gridH,
    parentOf: nearestParentCells(recipe.gridW, recipe.gridH, window, grid.gridW, grid.gridH),
    elev: land.elev,
    seaLevel: land.seaLevel,
  });
}
