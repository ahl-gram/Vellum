import { namedForestBlob } from "../render/named-forest.ts";
import type { World } from "../world/types.ts";

export type BorderEvent = {
  readonly kind: "border";
  readonly dist: number;
  readonly k: number;
  readonly name: string;
  readonly fromName: string;
};
export type ForestEvent = { readonly kind: "forest"; readonly dist: number; readonly k: number; readonly name: string };

type BorderStep = { readonly k: number; readonly from: number; readonly to: number };

export function borderSteps(_labels: ReadonlyArray<number>): BorderStep[] {
  return [];
}

export function woodEntries(_inside: ReadonlyArray<boolean>): number[] {
  return [];
}

export function borderEvents(world: World, chain: ReadonlyArray<number>, dists: ReadonlyArray<number>): BorderEvent[] {
  return borderSteps(chain.map((c) => world.realms.labels[c] ?? -1)).map(({ k, from, to }) => ({
    kind: "border",
    dist: dists[k] as number,
    k,
    name: world.names.realms[to] as string,
    fromName: world.names.realms[from] as string,
  }));
}

export function forestEvents(world: World, chain: ReadonlyArray<number>, dists: ReadonlyArray<number>): ForestEvent[] {
  const blob = namedForestBlob(world);
  const name = world.names.forest;
  if (blob === null || !name) return [];
  const wood = new Uint8Array(world.elev.w * world.elev.h);
  for (const i of blob) wood[i] = 1;
  return woodEntries(chain.map((c) => wood[c] === 1)).map((k) => ({
    kind: "forest",
    dist: dists[k] as number,
    k,
    name,
  }));
}
