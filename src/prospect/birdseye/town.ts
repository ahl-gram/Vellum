import type { World } from "../../world/types.ts";
import { createRng } from "../../core/rng.ts";
import type { Pt } from "../geometry.ts";
import type { PlateEra } from "../caption.ts";
import { sampleBilinear } from "../transect.ts";
import type { PlanPoint, TownPlan } from "../town-plan/types.ts";
import { chaikin, dist, insideRing, nearestOnPolyline, simplify, unit } from "../town-plan/geom.ts";
import { boundaryRings, components, lattice, maskOf } from "../town-plan/lattice.ts";
import type { BirdseyeKind, BirdseyeTown, BirdseyeWindow, TownItem } from "./types.ts";
import { leanHouses } from "./houses.ts";
import { SX, SY, projector } from "./window.ts";

/** The town's own ground, the land inside its wall, so a creek or a basin of the sea inside the walls stays water. */
export function townGround(world: World, centre: PlanPoint, wall: ReadonlyArray<PlanPoint>): PlanPoint[][] {
  const reach = Math.max(...wall.map((p) => Math.max(Math.abs(p.x - centre.x), Math.abs(p.y - centre.y))));
  const L = lattice(centre.x, centre.y, 1.2 + reach);
  const m = maskOf(L, (p) => sampleBilinear(world.elev, p.x, p.y) > world.seaLevel && insideRing(p, wall));
  return components(L, m)
    .filter((c) => c.length > 6)
    .flatMap((c) => boundaryRings(L, c))
    .map((r) => simplify(chaikin(r, true), 0.03, true));
}

type Draft = { readonly key: number; readonly item: TownItem };

function bridgeDirection(world: World, at: PlanPoint): PlanPoint {
  let t: PlanPoint = { x: 1, y: 0 };
  let best = Infinity;
  for (const r of world.rivers) {
    for (let i = 0; i + 1 < r.points.length; i++) {
      const a = r.points[i]!;
      const b = r.points[i + 1]!;
      const d = dist(nearestOnPolyline(at, [a, b]), at);
      if (d < best) {
        best = d;
        t = unit(b.x - a.x, b.y - a.y) ?? t;
      }
    }
  }
  return t;
}

function wallOf(plan: TownPlan, to: (g: PlanPoint) => Pt): NonNullable<BirdseyeTown["wall"]> | null {
  const wall = plan.wall;
  if (wall === null) return null;
  const towers: PlanPoint[] = [];
  for (const p of wall) if (towers.length === 0 || dist(p, towers[towers.length - 1]!) >= 0.95) towers.push(p);
  const gates: PlanPoint[] = [];
  for (const g of plan.gates) if (!gates.some((s) => dist(s, g.at) < 0.25)) gates.push(g.at);
  return {
    ring: [...wall, wall[0]!].map(to),
    towers: towers.map(to),
    gates: gates.map(to),
    grid: wall,
    gateGrid: gates,
  };
}

/** The town as the plan stands it, in plate units, with every lean house standing: its bridges and wall only where the era keeps them, a ruin three houses in ten and none of its landmarks. */
export function townLayer(
  world: World,
  w: BirdseyeWindow,
  plan: TownPlan,
  kind: BirdseyeKind,
  era: PlateEra,
): BirdseyeTown | null {
  if (era === "before-founding") return null;
  const to = projector(world, w);
  const standing = era === "standing";
  const ruin = createRng(plan.seed).fork(`prospect:${plan.index}:c:ruin`);
  const drafts: Draft[] = [];
  for (const lh of leanHouses(plan, kind)) {
    if (!standing && ruin.next() < 0.7) continue;
    const a = to(lh.at);
    const item: TownItem = {
      kind: "house",
      grid: lh.at,
      x: a.x - (lh.w * SX) / 2,
      y: a.y,
      w: lh.w * SX,
      depth: lh.d * SY * 2,
      h: 0,
      window: false,
    };
    drafts.push({ key: a.y, item });
  }
  if (standing) {
    for (const l of plan.landmarks) {
      const a = to(l.at);
      if (l.kind === "church") {
        const great = kind === "capital" || kind === "seat";
        drafts.push({ key: a.y + 0.5, item: { kind: "church", x: a.x, y: a.y, great, window: false } });
      } else if (l.kind === "keep") {
        drafts.push({
          key: a.y + 0.5,
          item: { kind: "keep", x: a.x, y: a.y, scale: kind === "capital" ? 1 : 0.8, window: false },
        });
      } else if (l.kind === "market") {
        drafts.push({ key: a.y, item: { kind: "market", x: a.x, y: a.y } });
      }
    }
  }
  drafts.sort((p, q) => p.key - q.key);
  const draw = createRng(plan.seed).fork(`mock-birdseye:${plan.index}:land`);
  const items = drafts.map(({ item }): TownItem => {
    if (item.kind === "house") {
      const h = 2.2 + draw.next() * 1.6;
      return { ...item, h, window: draw.next() < 0.6 && h > 3 };
    }
    if (item.kind === "church" || item.kind === "keep") return { ...item, window: draw.next() < 0.6 };
    return item;
  });
  const bridges = plan.landmarks
    .filter((l) => l.kind === "bridge")
    .map((l): readonly [Pt, Pt] => {
      const t = bridgeDirection(world, l.at);
      return [
        to({ x: l.at.x - t.y * 0.32, y: l.at.y + t.x * 0.32 }),
        to({ x: l.at.x + t.y * 0.32, y: l.at.y - t.x * 0.32 }),
      ];
    });
  const marks = [...(plan.wall ?? []).map(to), ...plan.blocks.flat().map(to), ...plan.landmarks.map((l) => to(l.at))];
  const xs = marks.map((p) => p.x);
  const ys = marks.map((p) => p.y);
  const extent =
    marks.length === 0
      ? { x0: 0, x1: 0, y0: 0, y1: 0 }
      : { x0: Math.min(...xs) - 4, x1: Math.max(...xs) + 4, y0: Math.min(...ys) - 20, y1: Math.max(...ys) + 4 };
  return {
    ground: plan.wall === null ? [] : townGround(world, plan.centre, plan.wall).map((r) => r.map(to)),
    blocks: plan.blocks.map((b) => b.map(to)),
    streets: plan.streets.map((s) => s.map(to)),
    bridges,
    items,
    wall: standing ? wallOf(plan, to) : null,
    keepOut: plan.wall === null ? [] : plan.wall.map(to),
    extent,
  };
}
