import { NEIGHBORS_8, type Field } from "../core/grid.ts";
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

const FLOOD_ORDER = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
] as const;

export function coastalParentCells(
  worldSea: Uint8Array,
  parentLand: Uint8Array,
  parentW: number,
  parentH: number,
): Uint8Array {
  const coastal = new Uint8Array(parentW * parentH);
  for (let y = 0; y < parentH; y++) {
    for (let x = 0; x < parentW; x++) {
      const p = x + y * parentW;
      if (parentLand[p] !== 1) continue;
      for (const offset of NEIGHBORS_8) {
        const nx = x + offset[0];
        const ny = y + offset[1];
        if (nx < 0 || nx >= parentW || ny < 0 || ny >= parentH) continue;
        if (worldSea[nx + ny * parentW] === 1) {
          coastal[p] = 1;
          break;
        }
      }
    }
  }
  return coastal;
}

export function refineSeaGate(input: SeaGateInput): Uint8Array {
  const { worldSea, parentLand, parentW, parentH, parentOf, elev, seaLevel } = input;
  const { w, h, data } = elev;
  const coastal = coastalParentCells(worldSea, parentLand, parentW, parentH);
  const gate = new Uint8Array(w * h);
  const isWater = (i: number): boolean => (data[i] as number) <= seaLevel;
  const allowed = (i: number): boolean => {
    const p = parentOf[i] as number;
    return worldSea[p] === 1 || coastal[p] === 1;
  };
  const stack: number[] = [];
  for (let i = 0; i < gate.length; i++) {
    if (isWater(i) && worldSea[parentOf[i] as number] === 1) {
      gate[i] = 1;
      stack.push(i);
    }
  }
  while (stack.length > 0) {
    const i = stack.pop() as number;
    const x = i % w;
    const y = (i / w) | 0;
    for (const [dx, dy] of FLOOD_ORDER) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      const j = nx + ny * w;
      if (gate[j] === 1 || !isWater(j) || !allowed(j)) continue;
      gate[j] = 1;
      stack.push(j);
    }
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
