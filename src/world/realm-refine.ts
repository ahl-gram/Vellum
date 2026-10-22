import type { Field } from "../core/grid.ts";
import type { UvWindow } from "../terrain/heightfield.ts";
import { grownRealmLabels } from "./realm-carry.ts";
import { cellsPerWorldCell, nearestParentCells } from "./region-parent.ts";
import type { World } from "./types.ts";

export type RealmTown = { readonly x: number; readonly y: number; readonly realm: number };

export type RefineInput = {
  readonly grownParent: Int16Array;
  readonly parentLand: Uint8Array;
  readonly parentW: number;
  readonly parentH: number;
  readonly parentOf: Int32Array;
  readonly elev: Field;
  readonly seaLevel: number;
  readonly riverCells: Uint8Array;
  readonly cellsPerWorldCell: number;
  readonly towns: ReadonlyArray<RealmTown>;
};

export function refineRealmLabels(input: RefineInput): Int16Array {
  const { grownParent, parentOf, elev, seaLevel, towns } = input;
  const labels = new Int16Array(elev.data.length).fill(-1);
  for (let i = 0; i < labels.length; i++) {
    if ((elev.data[i] as number) > seaLevel) labels[i] = grownParent[parentOf[i] as number] as number;
  }
  for (const t of towns) labels[t.x + t.y * elev.w] = t.realm;
  return labels;
}

type RefineLand = { readonly elev: Field; readonly seaLevel: number; readonly riverCells: Uint8Array };

export function refineRegionRealms(
  world: World,
  window: UvWindow,
  land: RefineLand,
  towns: ReadonlyArray<RealmTown>,
): Int16Array {
  const { recipe } = world;
  const parentLand = new Uint8Array(world.elev.data.length);
  for (let p = 0; p < parentLand.length; p++) parentLand[p] = (world.elev.data[p] as number) > world.seaLevel ? 1 : 0;
  return refineRealmLabels({
    grownParent: grownRealmLabels(world),
    parentLand,
    parentW: recipe.gridW,
    parentH: recipe.gridH,
    parentOf: nearestParentCells(recipe.gridW, recipe.gridH, window, land.elev.w, land.elev.h),
    elev: land.elev,
    seaLevel: land.seaLevel,
    riverCells: land.riverCells,
    cellsPerWorldCell: cellsPerWorldCell(land.elev.w, window, recipe.gridW),
    towns,
  });
}

/** The owner of every region cell: the refined label on land, the parent's grown label at the nearest parent cell on water. */
export function realmOwners(
  world: World,
  window: UvWindow,
  land: { readonly elev: Field; readonly seaLevel: number },
  labels: Int16Array,
): Int16Array {
  const { recipe } = world;
  const grown = grownRealmLabels(world);
  const parentOf = nearestParentCells(recipe.gridW, recipe.gridH, window, land.elev.w, land.elev.h);
  const owner = new Int16Array(labels.length);
  for (let i = 0; i < owner.length; i++) {
    owner[i] =
      (land.elev.data[i] as number) > land.seaLevel ? (labels[i] as number) : (grown[parentOf[i] as number] as number);
  }
  return owner;
}
