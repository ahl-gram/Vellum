// Issue #793 round: what a plan's key may truthfully name. A gate is named for the first town its road reaches going out (a strict walk along the world's roads, the town's own road cells barred, as townsReachedFirst in src/prospect/surroundings.ts walks), and a landmark only where the plan stands one.
import type { World } from "../../../src/world/types.ts";
import type { PlanGate, TownPlan } from "../planner/types.ts";
import { insideRing, dist } from "../planner/geom.ts";

export function gateTown(world: World, plan: TownPlan, gate: PlanGate): number | null {
  const w = world.elev.w;
  const next = new Map<number, number[]>();
  const link = (a: number, b: number): void => {
    if (a === b) return;
    next.set(a, [...(next.get(a) ?? []), b]);
    next.set(b, [...(next.get(b) ?? []), a]);
  };
  for (const road of world.roads)
    for (let i = 1; i < road.points.length; i++) {
      const p = road.points[i - 1]!,
        q = road.points[i]!;
      link(p.x + p.y * w, q.x + q.y * w);
    }
  const wall = plan.wall;
  const road = world.roads[gate.road]!.points;
  const out = road.filter((p) => wall !== null && !insideRing(p, wall));
  const start = out.reduce<(typeof out)[number] | null>((a, b) => (a === null || dist(b, gate.at) < dist(a, gate.at) ? b : a), null);
  if (start === null) return null;
  const town = new Map(world.settlements.map((s, i) => [s.x + s.y * w, i] as const));
  const startKey = start.x + start.y * w;
  const atStart = town.get(startKey);
  if (atStart !== undefined && atStart !== plan.index) return atStart;
  const seen = new Set<number>([startKey]);
  for (const r of world.roads) for (const p of r.points) if (wall !== null && insideRing(p, wall)) seen.add(p.x + p.y * w);
  const queue = [startKey];
  for (let head = 0; head < queue.length; head++)
    for (const n of next.get(queue[head]!) ?? []) {
      if (seen.has(n)) continue;
      seen.add(n);
      const t = town.get(n);
      if (t !== undefined && t !== plan.index) return t;
      queue.push(n);
    }
  return null;
}

export type GateName = { readonly gate: PlanGate; readonly town: number | null; readonly label: string };

export function gateNames(world: World, plan: TownPlan): GateName[] {
  const out: GateName[] = [];
  for (const g of plan.gates) {
    if (out.some((o) => dist(o.gate.at, g.at) < 0.25)) continue;
    const t = gateTown(world, plan, g);
    const name = t === null ? null : world.settlements[t]!.name;
    out.push({ gate: g, town: t, label: name === null ? "A Gate" : `The ${name} Gate` });
  }
  return out;
}

export type PlanKey = { readonly n: number; readonly label: string; readonly at: { x: number; y: number } | null };

export function planKey(world: World, plan: TownPlan, kind: string, seaName: string | null, riverName: string | null): PlanKey[] {
  const lines: Array<{ label: string; at: { x: number; y: number } | null }> = [];
  const lm = (k: string) => plan.landmarks.filter((l) => l.kind === k);
  for (const l of lm("keep")) lines.push({ label: "The Keep", at: l.at });
  for (const l of lm("church")) lines.push({ label: kind === "capital" ? "The Great Church" : kind === "village" ? "The Chapel" : "The Church", at: l.at });
  for (const l of lm("market")) lines.push({ label: kind === "village" ? "The Green" : "The Market", at: l.at });
  const bridges = lm("bridge");
  if (bridges.length > 0) lines.push({ label: bridges.length > 1 ? "The Bridges" : "The Bridge", at: bridges[0]!.at });
  for (const l of lm("harbour")) lines.push({ label: "The Quay", at: l.at });
  for (const g of gateNames(world, plan)) if (g.town !== null) lines.push({ label: g.label, at: g.gate.at });
  if (seaName !== null) lines.push({ label: seaName, at: null });
  if (riverName !== null) lines.push({ label: riverName, at: null });
  return lines.slice(0, 8).map((l, i) => ({ n: i + 1, ...l }));
}
