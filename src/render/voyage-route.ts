import { bfsPath } from "../core/bfs-path.ts";
import { bfsDistance } from "../core/bfs-distance.ts";
import { NEIGHBORS_8 } from "../core/grid.ts";
import { labelComponents } from "../core/mask-components.ts";
import { simplifyPath, type Pt } from "../core/rdp.ts";
import type { Survey } from "./survey.ts";
import type { VoyageLeg } from "./voyage.ts";

/**
 * The voyage's router (#120, Sub 3 of epic #117). It replaces v1's straight lerp
 * between ports with honest geometry: legs between road-connected ports follow the
 * drawn roads, legs between landmasses cross open water on a sea path, and the leg
 * remembers WHICH, so the overlay can put a rider on the road and a ship at sea.
 *
 * Pure and client-side. It consumes the worker's integer `survey` (survey.ts) and
 * runs only when the voyage toggle goes on, which is what lets that toggle animate
 * a survey with no redraw (#119's contract). Determinism is integer BFS with fixed
 * neighbour order; the only float math is the RDP simplification, which is
 * presentation-only and never reaches a baked SVG.
 *
 * Measured over seeds 1..40 (905 legs): ~71% road, ~24% sea, ~5% straight. Of the sea legs,
 * 6% are true cross-landmass crossings and the rest are coastal shortcuts the survey sails
 * rather than ride a long inland road around (SAIL_WHEN_ROAD_EXCEEDS).
 */

export type LegMode = "road" | "sea" | "straight";

/** A settlement's grid cell, keyed by its manifest idx. */
export type Site = { readonly idx: number; readonly x: number; readonly y: number };

/**
 * A leg with geometry. `mode` is set here by whichever router produced it, and
 * `points` are GRID-space vertices (the overlay projects them). It extends #118's
 * logical VoyageLeg rather than widening it: buildVoyagePlan is pure over the place
 * manifest and holds no terrain, so it cannot know a mode.
 */
export type RoutedLeg = VoyageLeg & {
  readonly mode: LegMode;
  readonly points: ReadonlyArray<Pt>;
};

/** Grid cells, so a 0.75 chord tolerance is about three quarters of one cell. */
export const RDP_EPSILON = 0.75;

/**
 * Two coastal ports the road connects only by a long inland loop should be sailed, not
 * ridden all the way around (Alex, 2026-07-10). The survey rides by default and takes ship
 * only when the road is at least this many times the coastal sea route. 1.3 catches the
 * egregious backtracks (a 2.2x inland loop on seed 3084684951, Gogkalei -> Dreigbra) while
 * leaving ordinary coastal roads as rides. Measured over seeds 1..40 it sails ~24% of legs:
 * fewer than a naive "always take the shorter" (~50% on an island world) because the embark
 * gate below rejects ports whose shared ocean sits behind a nearer pond. A one-line knob:
 * raise it for more riding, lower it for more sailing.
 */
export const SAIL_WHEN_ROAD_EXCEEDS = 1.3;

/** A port must be within this many cells of the sea to take a coastal sail shortcut, so a
 *  ship never embarks by marching far overland (that is #181's territory). This is a cheap
 *  prefilter on the nearest sea; the embark into the SHARED body is checked separately,
 *  because a port near an inland pond is close to water but far from the ocean. */
export const COAST_MAX_HOPS = 2;

/** Max straight embark from a port to the shared water body for a coastal shortcut. Keeps
 *  the overland stub of a same-landmass sail to a cell or two, so no ship marches inland. */
export const COAST_EMBARK_MAX = 3;

/**
 * True when a sea path's two overland stubs are both short. seaCrossing returns
 * [fromPort, ...open water..., toPort], jumping straight from each land port to its launch
 * cell, so the stub is the port-to-first-water gap. A coastal shortcut must embark right by
 * the shore; a far embark means the shared ocean is inland of the port (a pond fooled the
 * cheap prefilter), and the survey should ride instead.
 */
function embarksNearShore(water: ReadonlyArray<number>, w: number): boolean {
  if (water.length < 3) return true;
  const d = (a: number, b: number) => Math.hypot((a % w) - (b % w), ((a / w) | 0) - ((b / w) | 0));
  return (
    d(water[0] as number, water[1] as number) <= COAST_EMBARK_MAX &&
    d(water[water.length - 1] as number, water[water.length - 2] as number) <= COAST_EMBARK_MAX
  );
}

/** Total polyline length of a cell chain, in grid cells. */
function chainLength(cells: ReadonlyArray<number>, w: number): number {
  let d = 0;
  for (let i = 1; i < cells.length; i++) {
    const a = cells[i - 1] as number;
    const b = cells[i] as number;
    d += Math.hypot((a % w) - (b % w), ((a / w) | 0) - ((b / w) | 0));
  }
  return d;
}

export function routeVoyage(
  legs: ReadonlyArray<VoyageLeg>,
  sites: ReadonlyArray<Site>,
  survey: Survey,
): ReadonlyArray<RoutedLeg> {
  if (legs.length === 0) return [];

  const { gridW: w, gridH: h, land } = survey;
  const byIdx = new Map(sites.map((s) => [s.idx, s]));
  const cellOf = (s: Site) => s.x + s.y * w;
  const toPt = (cell: number): Pt => ({ x: cell % w, y: (cell / w) | 0 });

  // The road network as a cell MASK, not an assembled adjacency graph. Measured: road
  // polylines step 8-adjacently, share their junction cells, and the whole union is a
  // single 8-connected component reachable from the capital. So an 8-connected BFS
  // restricted to road cells IS the graph walk, with no chance of forging a false edge
  // between the tail of one polyline and the head of the next.
  const road = new Uint8Array(w * h);
  for (const polyline of survey.roads) for (const [x, y] of polyline) road[x + y * w] = 1;

  const comp = labelComponents(land, w, h);
  // Water is labelled 8-connected because the sea walk is: two sea cells are walkable
  // to each other exactly when they share an 8-connected component. Worlds carry inland
  // ponds (seed 526413615 has 9 distinct water bodies), and a port's NEAREST water is
  // sometimes a pond rather than the ocean, so the crossing below has to pick a body
  // both ports can actually reach.
  const seaMask = Uint8Array.from(land, (v) => (v === 1 ? 0 : 1));
  const seaComp = labelComponents(seaMask, w, h, 8);
  const isRoad = (c: number) => road[c] === 1;
  const isSea = (c: number) => land[c] === 0;
  const isLand = (c: number) => land[c] === 1;
  // Hop distance from the nearest sea, to gate which ports may sail a coastal shortcut.
  const oceanHops = bfsDistance(w, h, (x, y) => land[x + y * w] === 0);
  const coastal = (c: number) => (oceanHops[c] as number) <= COAST_MAX_HOPS;

  const finish = (mode: LegMode, cells: ReadonlyArray<number>, leg: VoyageLeg): RoutedLeg => ({
    ...leg,
    mode,
    points: simplifyPath(dedupe(cells).map(toPt), RDP_EPSILON),
  });

  return legs.map((leg) => {
    const a = byIdx.get(leg.fromIdx);
    const b = byIdx.get(leg.toIdx);
    // Legs and sites are both derived from the same place manifest, so a missing site is a
    // caller bug. Say so here rather than return an empty polyline: that would surface far
    // away, as the overlay formatting an undefined vertex into the track's `points`.
    if (!a || !b) throw new Error(`voyage leg ${leg.fromIdx} -> ${leg.toIdx} has no site in the manifest`);
    const from = cellOf(a);
    const to = cellOf(b);

    // 1. Different landmasses: the survey must sail. Measured across seeds 1..40: every
    //    cross-landmass leg has both endpoints within 2 cells of water, so no
    //    road-to-coast-to-road composite leg is needed.
    if (comp[from] !== comp[to]) {
      const water = seaCrossing(w, h, from, to, isSea, seaComp);
      if (water) return finish("sea", water, leg);
      return finish("straight", straightFallback(w, h, from, to, isRoad, isLand), leg);
    }

    // 2. Same landmass and both on the road network: ride, UNLESS the road loops far
    //    around a coastal shortcut the survey could sail. The road network is one
    //    connected component, so the walk cannot fail; the null guard is defensive.
    if (isRoad(from) && isRoad(to)) {
      const walk = bfsPath(w, h, from, (c) => c === to, isRoad);
      if (walk) {
        // Only coastal ports may sail, and only when the road is meaningfully longer than
        // the sea route (SAIL_WHEN_ROAD_EXCEEDS). This is what stops a survey riding all
        // the way around a bay when a boat could cut across it.
        if (coastal(from) && coastal(to)) {
          const water = seaCrossing(w, h, from, to, isSea, seaComp);
          if (
            water &&
            embarksNearShore(water, w) &&
            chainLength(walk, w) >= SAIL_WHEN_ROAD_EXCEEDS * chainLength(water, w)
          ) {
            return finish("sea", water, leg);
          }
        }
        return finish("road", walk, leg);
      }
    }

    // 3. The documented fallback: a port is off the road network (an over-budget village),
    //    so ride the road as far as it goes and hop straight to the port. Never claims
    //    mode "road", which keeps "a road leg never crosses open water" true by construction.
    return finish("straight", straightFallback(w, h, from, to, isRoad, isLand), leg);
  });
}

/**
 * [fromPort, ...open water..., toPort]. The ports are LAND, so the walk launches from a
 * coastal cell near each and crosses sea-only between them.
 *
 * The launch may NOT simply be each port's nearest sea cell. Worlds carry inland ponds,
 * and a port's nearest water is sometimes one of them (on seed 526413615, Thilthoport's
 * nearest water is a 20-cell pond, not the ocean). Launching there strands the walk in a
 * puddle, it finds no route, and the leg silently degrades to a straight line with a
 * RIDER drawn across the strait, which is the exact defect this sub exists to remove.
 *
 * So: find, for each port, the nearest cell of EVERY water body, then sail across the
 * body they share, choosing the one with the shortest combined launch. Ties break on the
 * lower component id and then the lower cell id, so the choice never depends on grid
 * iteration order.
 *
 * The sea walk is 8-connected while landmasses are labelled 4-connected. That mismatch is
 * deliberate: a corner pinch splits two landmasses (so the leg is classified a crossing),
 * and only an 8-connected walker can thread that same pinch to route it.
 */
function seaCrossing(
  w: number,
  h: number,
  from: number,
  to: number,
  isSea: (c: number) => boolean,
  seaComp: Int32Array,
): number[] | null {
  const fromLaunches = launchesByWaterBody(w, h, from, isSea, seaComp);
  const toLaunches = launchesByWaterBody(w, h, to, isSea, seaComp);

  let bestBody = -1;
  let bestCost = Infinity;
  for (const [body, a] of fromLaunches) {
    const b = toLaunches.get(body);
    if (!b) continue;
    const cost = a.hops + b.hops;
    if (cost < bestCost || (cost === bestCost && body < bestBody)) {
      bestCost = cost;
      bestBody = body;
    }
  }
  if (bestBody === -1) return null; // no water body touches both shores

  const start = (fromLaunches.get(bestBody) as Launch).cell;
  const goal = (toLaunches.get(bestBody) as Launch).cell;
  // Both launches lie in the same 8-connected water body, so this cannot fail.
  const water = bfsPath(w, h, start, (c) => c === goal, isSea);
  if (!water) return null;
  return [from, ...water, to];
}

type Launch = { readonly cell: number; readonly hops: number };

/**
 * One BFS outward from a land port over every cell, recording the first sea cell reached
 * in each distinct water body. First-reached is nearest, because the frontier is FIFO;
 * among equidistant cells the fixed NEIGHBORS_8 order decides, so the result is stable.
 */
function launchesByWaterBody(
  w: number,
  h: number,
  start: number,
  isSea: (c: number) => boolean,
  seaComp: Int32Array,
): Map<number, Launch> {
  const found = new Map<number, Launch>();
  const seen = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  const hops = new Int32Array(w * h);
  let head = 0;
  let tail = 0;
  seen[start] = 1;
  queue[tail++] = start;

  while (head < tail) {
    const i = queue[head++] as number;
    if (isSea(i)) {
      const body = seaComp[i] as number;
      if (!found.has(body)) found.set(body, { cell: i, hops: hops[i] as number });
      continue; // a body's nearest cell is enough; do not flood the whole ocean
    }
    const x = i % w;
    const y = (i / w) | 0;
    for (const [dx, dy] of NEIGHBORS_8) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      const ni = nx + ny * w;
      if (seen[ni]) continue;
      seen[ni] = 1;
      hops[ni] = (hops[i] as number) + 1;
      queue[tail++] = ni;
    }
  }
  return found;
}

/**
 * Ride the road as far as it reaches, then hop straight to the stranded port: snap each
 * off-network endpoint to its nearest road cell OVER LAND (never across a strait, which
 * an unrestricted search would happily do), walk the road between the snapped cells, and
 * bookend with the true ports. A landmass with no roads at all degrades to a plain
 * straight line, which is what a world with no capital gets for every leg.
 */
function straightFallback(
  w: number,
  h: number,
  from: number,
  to: number,
  isRoad: (c: number) => boolean,
  isLand: (c: number) => boolean,
): number[] {
  const snap = (cell: number): number | null => {
    if (isRoad(cell)) return cell;
    const reach = bfsPath(w, h, cell, isRoad, isLand);
    return reach ? (reach[reach.length - 1] as number) : null;
  };
  const snapFrom = snap(from);
  const snapTo = snap(to);
  if (snapFrom === null || snapTo === null) return [from, to];
  const walk = bfsPath(w, h, snapFrom, (c) => c === snapTo, isRoad);
  if (!walk) return [from, to];
  return [from, ...walk, to];
}

/** Drop repeated cells so a port that already sits on its launch cell is not doubled. */
function dedupe(cells: ReadonlyArray<number>): number[] {
  const out: number[] = [];
  for (const c of cells) if (out[out.length - 1] !== c) out.push(c);
  return out;
}
