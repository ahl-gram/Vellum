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

// 2026-11-03, every reachable road of 44 seeds: hold 1 sets two borders 13.3 apart on one strip (253 pairs under 40), hold 3 none under 42.4 (Issue #431 plan, finding 2).
const BORDER_HOLD = 3;
const WOOD_HOLD = 6;
const WOOD_REARM = 24;

function runLength<T>(items: ReadonlyArray<T>, from: number): number {
  let end = from;
  while (end < items.length && items[end] === items[from]) end++;
  return end - from;
}

export function borderSteps(labels: ReadonlyArray<number>): BorderStep[] {
  const first = labels.findIndex((l) => l >= 0);
  if (first < 0) return [];
  const steps: BorderStep[] = [];
  let cur = labels[first] as number;
  for (let k = first; k < labels.length; ) {
    const l = labels[k] as number;
    const len = runLength(labels, k);
    if (l >= 0 && l !== cur && (len >= BORDER_HOLD || k + len === labels.length)) {
      steps.push({ k, from: cur, to: l });
      cur = l;
    }
    k += len;
  }
  return steps;
}

export function woodEntries(inside: ReadonlyArray<boolean>): number[] {
  const entries: number[] = [];
  let clear = inside[0] === false ? WOOD_REARM : 0;
  for (let k = 0; k < inside.length; k++) {
    if (!inside[k]) {
      clear++;
      continue;
    }
    if (clear >= WOOD_REARM) {
      const len = runLength(inside, k);
      if (len >= WOOD_HOLD || k + len === inside.length) entries.push(k);
    }
    clear = 0;
  }
  return entries;
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
