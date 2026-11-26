// Issue #793 round: planTown, one settlement of a world sheet in, one TownPlan out, on its own named stream `town-plan:<index>`. The `direction` argument is the sitting's switch between the two street systems; a ruled planner takes (world, index) alone.
import type { World } from "../../../src/world/types.ts";
import { createRng } from "../../../src/core/rng.ts";
import { buildProspectInput } from "../../../src/prospect/input.ts";
import type { P, PlanGate, PlanLandmark, StreetSystem, TownPlan } from "./types.ts";
import { dist, lineRingCrossings, nearestOnPolyline, unit } from "./geom.ts";
import { footprint, radiusFor, readGround, type Ground, type PlanKind } from "./ground.ts";
import { bridgesOn, churchAt, harbourAt, keepAt, marketAt, PLOT } from "./landmarks.ts";
import { blocksOf, buildable, carver, corridor, outlines, plotMask, type Plot } from "./network.ts";
import { HALF_WIDTH, landStreets } from "./streets-land.ts";
import { gridAxis, gridBlocks, gridStreets } from "./streets-grid.ts";
import { greenVillage, streetVillage } from "./villages.ts";

export function gatesOn(world: World, wall: ReadonlyArray<P>): PlanGate[] {
  const out: PlanGate[] = [];
  world.roads.forEach((road, i) => {
    for (const x of lineRingCrossings(road.points, wall)) out.push({ at: x.at, road: i });
  });
  return out;
}

// A river through the wall that no street crosses still gets its bridge: a lane over it where it runs nearest the market.
function bridgeLane(G: Ground, wall: ReadonlyArray<P>, market: P, streets: ReadonlyArray<ReadonlyArray<P>>): { lane: P[]; bridge: P } | null {
  const through = G.rivers.filter((r) => lineRingCrossings(r, wall).length > 0);
  let best: { at: P; r: ReadonlyArray<P> } | null = null;
  for (const r of through) {
    const at = nearestOnPolyline(market, r);
    if (best === null || dist(at, market) < dist(best.at, market)) best = { at, r };
  }
  if (best === null) return null;
  const pts = best.r;
  let k = 0;
  for (let i = 0; i + 1 < pts.length; i++) if (dist(nearestOnPolyline(best.at, [pts[i]!, pts[i + 1]!]), best.at) < 1e-9) k = i;
  const t = unit(pts[k + 1]!.x - pts[k]!.x, pts[k + 1]!.y - pts[k]!.y) ?? { x: 1, y: 0 };
  const n = { x: -t.y, y: t.x };
  const a = { x: best.at.x - n.x * 0.45, y: best.at.y - n.y * 0.45 };
  const b = { x: best.at.x + n.x * 0.45, y: best.at.y + n.y * 0.45 };
  const join = streets.map((s) => nearestOnPolyline(a, s)).reduce<P | null>((m, q) => (m === null || dist(q, a) < dist(m, a) ? q : m), null);
  return { lane: [...(join ? [join] : []), a, best.at, b], bridge: best.at };
}

export function planTown(world: World, index: number, direction: StreetSystem): TownPlan {
  if (world.region !== undefined) throw new RangeError("a town's plan is drawn from a world sheet alone; a close-up renumbers its towns");
  const s = world.settlements[index];
  if (s === undefined) throw new RangeError(`settlement index ${index} out of range 0..${world.settlements.length - 1}`);
  const pk = buildProspectInput(world, index).kind;
  if (pk === "hamlet") throw new RangeError("a world sheet holds no hamlet");
  const kind: PlanKind = pk;
  const rng = createRng(world.recipe.seed).fork(`town-plan:${index}`);
  const R = radiusFor(kind, s.score);
  const G = readGround(world, { x: s.x, y: s.y }, R);
  const base = { seed: world.recipe.seed, index, centre: { x: s.x, y: s.y }, direction, radius: R };
  if (kind === "village") return village(G, base, direction, rng.fork("village"));

  const fp = footprint(G, rng.fork("wall"));
  const wall = fp.ring;
  const gates = gatesOn(world, wall);
  const market = marketAt(G, fp.inside, wall, gates, fp.quay);
  const keep = keepAt(G, fp.inside, kind, market, wall);
  const church = churchAt(G, fp.inside, kind, market, keep);
  const plots: Plot[] = [
    { at: market, r: PLOT.market[kind] },
    ...(keep ? [{ at: keep, r: PLOT.keep[kind] }] : []),
    ...(church ? [{ at: church, r: PLOT.church[kind] }] : []),
  ];
  const barred = plots.filter((p) => p.at !== market);
  const gi = { G, kind, wall, gates, market, axis: gridAxis(gates, fp.quay, market), blocked: barred };
  let streets =
    direction === "land"
      ? landStreets({ G, kind, inside: fp.inside, wall, gates, market, blocked: barred, rng: rng.fork("streets") })
      : gridStreets(gi);
  let bridges = bridgesOn(G, streets, wall, R);
  if (bridges.length === 0) {
    const extra = bridgeLane(G, wall, market, streets);
    if (extra) {
      streets = [...streets, extra.lane];
      bridges = [{ kind: "bridge", at: extra.bridge }];
    }
  }
  const half = HALF_WIDTH[kind];
  const ok = buildable(G, fp.inside, wall, 0.12);
  const blocks =
    direction === "land"
      ? blocksOf(G, fp.inside, corridor(G.L, streets, half), plotMask(G.L, plots), wall, 0.1)
      : gridBlocks({ gi, deep: outlines(G, ok), carve: carver(G, ok, plots.filter((p) => p.at !== market)), half: half * 0.8 });
  const harbour = s.harbor ? harbourAt(fp.quay, market) : null;
  const landmarks: PlanLandmark[] = [
    { kind: "market", at: market },
    ...(keep ? [{ kind: "keep" as const, at: keep }] : []),
    ...(church ? [{ kind: "church" as const, at: church }] : []),
    ...bridges,
    ...(harbour ? [{ kind: "harbour" as const, at: harbour }] : []),
  ];
  return { ...base, wall, gates, streets, blocks, landmarks, quay: fp.quay };
}

function village(G: Ground, base: Omit<TownPlan, "wall" | "gates" | "streets" | "blocks" | "landmarks" | "quay">, direction: StreetSystem, rng: ReturnType<typeof createRng>): TownPlan {
  const v = direction === "land" ? streetVillage(G, rng) : greenVillage(G);
  const church = churchAt(G, v.inside, "village", v.market, null);
  const plots: Plot[] = [{ at: v.market, r: PLOT.market.village }, ...(church ? [{ at: church, r: PLOT.church.village }] : [])];
  const blocks = blocksOf(G, v.inside, corridor(G.L, v.streets, HALF_WIDTH.village), plotMask(G.L, plots), null, 0);
  const bridges = bridgesOn(G, v.streets, null, G.R);
  const harbour = G.world.settlements[base.index]!.harbor ? harbourAt(v.quay, v.market) : null;
  return {
    ...base,
    wall: null,
    gates: [],
    streets: v.streets,
    blocks,
    landmarks: [
      { kind: "market", at: v.market },
      ...(church ? [{ kind: "church" as const, at: church }] : []),
      ...bridges,
      ...(harbour ? [{ kind: "harbour" as const, at: harbour }] : []),
    ],
    quay: v.quay,
  };
}
