// Independent ground-truth geometry for the daily-hunt suite: never calls the
// module internals under test, so clues re-verify against a second source. Lives
// outside test/ so `node --test` does not collect it as a (0-test) test file.

import assert from "node:assert/strict";
import { chooseQuarry, type Clue, type Quarry } from "../src/world/daily-hunt.ts";
import type { World } from "../src/world/types.ts";

// Grid threshold (cells) within which buildClues will cite a named feature;
// mirrored here so the test can bound an emitted feature clue's distance. The
// test computes nearest features from raw geometry, independent of the module.
export const NEAR = 4;

export const ALLOWED_KINDS = new Set<Clue["kind"]>([
  "framing",
  "ew",
  "ns",
  "river",
  "lake",
  "coast",
  "onriver",
  "realm",
]);

export function nearestNamed(
  entries: Iterable<readonly [number, string]>,
  pointsOf: (i: number) => ReadonlyArray<{ x: number; y: number }>,
  x: number,
  y: number,
): { name: string; dist: number } | null {
  let best: { name: string; dist: number } | null = null;
  for (const [i, name] of entries) {
    let d = Infinity;
    for (const p of pointsOf(i)) d = Math.min(d, Math.hypot(p.x - x, p.y - y));
    if (best === null || d < best.dist) best = { name, dist: d };
  }
  return best;
}

export function nearestNamedRiver(world: World, x: number, y: number) {
  return nearestNamed(
    world.names.rivers.entries(),
    (i) => world.rivers[i]?.points ?? [],
    x,
    y,
  );
}

export function nearestNamedLake(world: World, x: number, y: number) {
  let best: { name: string; dist: number } | null = null;
  for (const lk of world.names.lakes) {
    const d = Math.hypot(lk.x - x, lk.y - y);
    if (best === null || d < best.dist) best = { name: lk.name, dist: d };
  }
  return best;
}

export function realmNameAt(world: World, x: number, y: number): string | null {
  if (world.names.realms.length < 2) return null;
  const id = world.realms.labels[x + y * world.elev.w] as number;
  return id >= 0 ? (world.names.realms[id] ?? null) : null;
}

export function expectedEW(world: World, x: number): "east" | "west" | "central" {
  const c = (world.elev.w - 1) / 2;
  return x < c ? "west" : x > c ? "east" : "central";
}

export function expectedNS(world: World, y: number): "north" | "south" | "central" {
  const c = (world.elev.h - 1) / 2;
  return y < c ? "north" : y > c ? "south" : "central";
}

export function mustQuarry(world: World): Quarry {
  const q = chooseQuarry(world);
  assert.ok(q, "every swept world has at least one settlement, so a quarry exists");
  return q;
}

/** Count of the broad non-seat village pool chooseQuarry normally draws from. */
export function villagePoolSize(world: World): number {
  const seats = new Set(world.realms.seats);
  return world.settlements.filter((s, i) => s.kind === "village" && !seats.has(i)).length;
}
