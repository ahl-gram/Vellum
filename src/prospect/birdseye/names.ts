import type { World } from "../../world/types.ts";
import type { Rng } from "../../core/rng.ts";
import { sampleBilinear } from "../transect.ts";
import { ruinedBy } from "../surroundings.ts";
import type { PlanGate, PlanPoint, TownPlan } from "../town-plan/types.ts";
import { dist, insideRing } from "../town-plan/geom.ts";
import type { BirdseyeKind, BirdseyeWindow, Neighbour, SeaBand } from "./types.ts";
import { HALF_U, V_FAR, V_NEAR, project, sampleAt, toUV } from "./window.ts";

export type KeyOf = "keep" | "church" | "market" | "bridge" | "quay" | "gate" | "world";
export type KeyDraft = { readonly label: string; readonly at: PlanPoint | null; readonly of: KeyOf };

export const KEY_ENTRIES = 8;

export const TAG_LIFT: Readonly<Record<KeyOf, number>> = {
  keep: 24,
  church: 26,
  market: 12,
  bridge: 8,
  quay: 8,
  gate: 17,
  world: 0,
};

export function gateTown(world: World, plan: TownPlan, gate: PlanGate): number | null {
  const wall = plan.wall;
  if (wall === null) return null;
  const width = world.elev.w;
  const cellOf = (p: PlanPoint): number => p.x + p.y * width;
  const joins: number[][] = [];
  const index = new Map<number, number>();
  const slot = (cell: number): number => {
    const known = index.get(cell);
    if (known !== undefined) return known;
    index.set(cell, joins.length);
    joins.push([]);
    return joins.length - 1;
  };
  for (const road of world.roads) {
    for (let i = 1; i < road.points.length; i++) {
      const a = slot(cellOf(road.points[i - 1]!));
      const b = slot(cellOf(road.points[i]!));
      if (a === b) continue;
      joins[a]!.push(b);
      joins[b]!.push(a);
    }
  }
  const outside = world.roads[gate.road]!.points.filter((p) => !insideRing(p, wall));
  let start: PlanPoint | null = null;
  for (const p of outside) if (start === null || dist(p, gate.at) < dist(start, gate.at)) start = p;
  if (start === null) return null;
  const townAt = new Map(world.settlements.map((s, i) => [cellOf(s), i] as const));
  const first = townAt.get(cellOf(start));
  if (first !== undefined && first !== plan.index) return first;
  const cells = [...index.keys()];
  const barred = new Set<number>();
  for (const road of world.roads) for (const p of road.points) if (insideRing(p, wall)) barred.add(cellOf(p));
  const visited = new Set<number>([cellOf(start), ...barred]);
  const queue: number[] = [cellOf(start)];
  for (let head = 0; head < queue.length; head++) {
    const here = index.get(queue[head]!);
    for (const nextSlot of here === undefined ? [] : joins[here]!) {
      const cell = cells[nextSlot]!;
      if (visited.has(cell)) continue;
      visited.add(cell);
      const town = townAt.get(cell);
      if (town !== undefined && town !== plan.index) return town;
      queue.push(cell);
    }
  }
  return null;
}

const CHURCH: Readonly<Record<BirdseyeKind, string>> = {
  capital: "The Great Church",
  seat: "The Church",
  town: "The Church",
  village: "The Chapel",
};

export function planKey(
  world: World,
  plan: TownPlan,
  kind: BirdseyeKind,
  seaName: string | null,
  riverName: string | null,
): KeyDraft[] {
  const drafts: KeyDraft[] = [];
  const marks = (k: string): PlanPoint[] => plan.landmarks.filter((l) => l.kind === k).map((l) => l.at);
  for (const at of marks("keep")) drafts.push({ label: "The Keep", at, of: "keep" });
  for (const at of marks("church")) drafts.push({ label: CHURCH[kind], at, of: "church" });
  for (const at of marks("market"))
    drafts.push({ label: kind === "village" ? "The Green" : "The Market", at, of: "market" });
  const bridges = marks("bridge");
  if (bridges.length > 0)
    drafts.push({ label: bridges.length > 1 ? "The Bridges" : "The Bridge", at: bridges[0]!, of: "bridge" });
  for (const at of marks("harbour")) drafts.push({ label: "The Quay", at, of: "quay" });
  const seen: PlanPoint[] = [];
  for (const gate of plan.gates) {
    if (seen.some((s) => dist(s, gate.at) < 0.25)) continue;
    seen.push(gate.at);
    const town = gateTown(world, plan, gate);
    if (town !== null) drafts.push({ label: `The ${world.settlements[town]!.name} Gate`, at: gate.at, of: "gate" });
  }
  if (seaName !== null) drafts.push({ label: seaName, at: null, of: "world" });
  if (riverName !== null) drafts.push({ label: riverName, at: null, of: "world" });
  return drafts;
}

const COUNT = { capital: 7, town: 5 } as const;

export function neighboursIn(world: World, w: BirdseyeWindow, index: number, year: number, rng: Rng): Neighbour[] {
  const out: Neighbour[] = [];
  world.settlements.forEach((n, i) => {
    if (i === index || n.founded > year || ruinedBy(world, i, year)) return;
    const { u, v } = toUV(w, n);
    if (Math.abs(u) > HALF_U - 1.5 || v < V_NEAR + 1 || v > V_FAR - 1) return;
    const p = project(w, u, v, sampleBilinear(world.elev, n.x, n.y));
    const count = n.kind === "capital" ? COUNT.capital : n.kind === "town" ? COUNT.town : 3;
    const houses: Array<{ x: number; y: number }> = [];
    for (let k = 0; k < count; k++) {
      houses.push({ x: p.x + (rng.next() - 0.5) * 9, y: p.y + (rng.next() - 0.5) * 5 });
      rng.next();
    }
    out.push({ x: p.x, y: p.y, name: n.name, steeple: n.kind === "capital" || n.kind === "town", houses });
  });
  return out;
}

const SEA_BAND = 3;

export function seaBands(w: BirdseyeWindow): SeaBand[] {
  const open = (i: number, j: number): boolean => {
    for (let k = 0; k < SEA_BAND; k++) if (sampleAt(w, i, j + k).land) return false;
    return true;
  };
  const out: SeaBand[] = [];
  for (let j = 0; j + SEA_BAND <= w.rows; j++) {
    let i = 0;
    while (i < w.cols) {
      if (!open(i, j)) {
        i++;
        continue;
      }
      let last = i;
      while (last + 1 < w.cols && open(last + 1, j)) last++;
      const p = sampleAt(w, i, j);
      const score = last - i + 1 - Math.abs(p.v - V_NEAR - 4) * 2;
      if (score > 12) out.push({ x0: p.x, x1: sampleAt(w, last, j).x, y: p.y, score });
      i = last + 1;
    }
  }
  return out.sort((a, b) => b.score - a.score);
}
