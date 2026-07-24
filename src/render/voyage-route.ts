import { bfsPath } from "../core/bfs-path.ts";
import { bfsDistance } from "../core/bfs-distance.ts";
import { NEIGHBORS_8 } from "../core/grid.ts";
import { labelComponents } from "../core/mask-components.ts";
import { simplifyPath, type Pt } from "../core/rdp.ts";
import { waterSpanOf, type WaterSpan } from "./voyage-water.ts";
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
 * Since #184 the router is prepared ONCE per survey (prepareVoyageRouter) and also
 * measures pairs (legLength), so the itinerary can be ordered on an all-pairs
 * ACTUAL-travel matrix by the same walk that draws the legs.
 *
 * Since #181 a sea leg also carries its water span (voyage-water.ts): the ports are
 * land, so the mark rides an overland stub at each end of a crossing, and the span
 * is what lets the overlay swap rider <-> ship at the water's edge instead of
 * shipping the whole leg.
 *
 * Measured over seeds 1..40 with the travel-ordered ROUND-TRIP itinerary (#275, re-taken
 * 2026-07-24; 945 legs): 660 road (~70%), 237 sea (~25%), 48 straight (~5%). Of the sea
 * legs, 56 (~24%) are true cross-landmass crossings (the ordering makes island visits
 * adjacent, so a crossing is spent once, not scattered) and the rest are coastal
 * shortcuts the survey sails rather than ride a long inland road around
 * (SAIL_WHEN_ROAD_EXCEEDS). The tally includes one closing leg per world: 35 of the 40
 * ride home, 5 sail, and none of them hands off inland.
 *
 * Any per-leg number taken before #275 is VOID: the round trip both adds a leg per world
 * and reorders the tour on a closed objective, so which port pairs are adjacent changes
 * wholesale (seed 526413615's straight-line split moved from 2 sea / 21 road to 6 / 18).
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
  /**
   * #181: where the water is, as arc-length fractions of `points` (null off sea
   * legs). The overlay swaps rider <-> ship at these edges instead of keying the
   * whole leg on `mode`, so an inland port's crossing rides its overland stubs.
   */
  readonly water: WaterSpan | null;
  /** #181: true when either overland stub is long enough to narrate (voyage-water.ts). */
  readonly inlandHandoff: boolean;
};

/**
 * Grid cells, so a 0.75 chord tolerance is about three quarters of one cell.
 *
 * Reviewed under #185 (2026-07-25) and kept. Alone among the four constants here, epsilon
 * is itinerary-INDEPENDENT: legLength measures the raw cell walk, so this only ever
 * reaches the drawn polyline and can be swept in one pass. Over seeds 1..40, against the
 * lossless walk's 9353 vertices, as (vertices, worst stray of a walked cell from the drawn
 * line): 0.5 -> (7332, 0.50 cells), 0.75 -> (5869, 1.00), 1.0 -> (4781, 1.00),
 * 1.5 -> (3974, 1.49), 2.5 -> (3205, 2.50).
 *
 * Two things there are worth knowing before touching it. The worst stray at 0.75 is a
 * full CELL rather than 0.75, because RDP bounds each dropped vertex against the INFINITE
 * line through its anchors while a hairpin can leave the nearest drawn SEGMENT further
 * off. And 1.0 ties 0.75 on that worst case while shedding a fifth of the vertices, which
 * looks free but is not: the tie is this corpus's luck, RDP's bound scales with epsilon,
 * the vertices saved are ~27 per world in a `points` attribute nobody measures, and the
 * BOUND in voyage-route.test.ts is RDP_EPSILON + 0.5, so raising this quietly loosens a
 * real check rather than passing it.
 */
export const RDP_EPSILON = 0.75;

/**
 * Two coastal ports the road connects only by a long inland loop should be sailed, not
 * ridden all the way around (Alex, 2026-07-10). The survey rides by default and takes ship
 * only when the road is at least this many times the coastal sea route. 1.3 catches the
 * egregious backtracks (a 2.2x inland loop on seed 3084684951, Gogkalei -> Dreigbra) while
 * leaving ordinary coastal roads as rides. Measured over seeds 1..40 it sails ~25% of legs
 * (237 of 945 under #275's round trip; ~24% under the open path it replaced):
 * fewer than a naive "always take the shorter" (~50% on an island world) because the embark
 * gate below rejects ports whose shared ocean sits behind a nearer pond. A one-line knob:
 * raise it for more riding, lower it for more sailing.
 *
 * Reviewed under #185 (2026-07-25) and kept. Sea legs of 945 over seeds 1..40 by value:
 * 1.0 -> 329, 1.15 -> 272, 1.3 -> 237, 1.5 -> 199, 2.0 -> 152, 3.0 -> 110. The naive
 * figure above re-measures at exactly 50.0% on the isle fixture, so that claim survived
 * both itinerary reorders. What settles the value is not taste, though. From 1.5 up, the
 * LEANEST genuine inland handoff falls from 8.94 cells to 4.24, which drags the measured
 * upper end of the gap INLAND_STUB_CELLS = 4 sits in (voyage-water.ts) down onto its
 * structural lower end of 3, and #181's ride-sail-ride prose starts firing on stubs too
 * short to be worth narrating. 1.3 is the most permissive value keeping that better
 * than 2x apart, so treat it as bounded above, not free.
 */
export const SAIL_WHEN_ROAD_EXCEEDS = 1.3;

/** A port must be within this many cells of the sea to take a coastal sail shortcut, so a
 *  ship never embarks by marching far overland (that is #181's territory). This is a cheap
 *  prefilter on the nearest sea; the embark into the SHARED body is checked separately,
 *  because a port near an inland pond is close to water but far from the ocean.
 *
 *  NOT A TUNING KNOB. Swept 1, 2, 3, 5 and 8 over seeds 1..40 it moves not one leg of 945
 *  (#185, 2026-07-25), because embarksNearShore already rejects every pair it would, and
 *  timing the whole route pass with the gate against without it shows a 0.5% difference,
 *  which is noise. So it is neither a routing rule nor, measurably, a cost guard: it reads
 *  as intent. Anyone reaching for it should be considering deleting it, not retuning it. */
export const COAST_MAX_HOPS = 2;

/** Max straight embark from a port to the shared water body for a coastal shortcut. Keeps
 *  the overland stub of a same-landmass sail to a cell or two, so no ship marches inland.
 *
 *  INVARIANT: THIS MUST STAY BELOW INLAND_STUB_CELLS (voyage-water.ts, 4). A sea leg's raw
 *  chain is [port, launch, ...open water...], so the stub waterSpanOf measures to decide
 *  `inlandHandoff` is EXACTLY the chord embarksNearShore bounds here. While 3 < 4, a
 *  coastal shortcut cannot be narrated as a genuine inland handoff. That is one cell of
 *  margin and it is exact, not comfortable: swept to 4 (#185, 2026-07-25) the leanest
 *  "genuine" handoff over seeds 1..40 lands at precisely 4.00 cells, and at 6 the handoff
 *  count goes 8 -> 11, every new one a coastal shortcut wearing #181's ride-sail-ride
 *  prose. Lowering is safe (2 routes all but identically, 236 sea legs of 945 against 237,
 *  and tightens the worst coastal stub from 3.00 to 1.41); raising is not. */
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

/**
 * A router prepared once over a survey (#184). `route` draws a leg exactly as
 * routeVoyage always has; `legLength` measures a pair's actual routed travel in grid
 * cells, on the RAW cell walk (no simplification), always walked lower-idx-first so
 * the matrix is symmetric by construction. Both share one walk, so the itinerary is
 * ordered by exactly the miles the drawn legs ride.
 */
export type VoyageRouter = {
  readonly route: (leg: VoyageLeg) => RoutedLeg;
  readonly legLength: (fromIdx: number, toIdx: number) => number;
};

export function prepareVoyageRouter(sites: ReadonlyArray<Site>, survey: Survey): VoyageRouter {
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

  // #184: a port's launch map is the router's expensive flood (one full-grid BFS per
  // port), and the all-pairs travel matrix asks about every pair, so each port's map
  // is computed once and shared across every walk that needs it.
  const launchesMemo = new Map<number, Map<number, Launch>>();
  const launchesFor = (cell: number): Map<number, Launch> => {
    let m = launchesMemo.get(cell);
    if (!m) {
      m = launchesByWaterBody(w, h, cell, isSea, seaComp);
      launchesMemo.set(cell, m);
    }
    return m;
  };

  // The mode decision and its raw cell walk, shared by `route` (which simplifies it
  // into drawn geometry) and `legLength` (which only measures it).
  const walkLeg = (from: number, to: number): { mode: LegMode; cells: ReadonlyArray<number> } => {
    // 1. Different landmasses: the survey must sail. The note here used to claim every
    //    cross-landmass leg has both endpoints within 2 cells of water. Re-measured under
    //    #275's round trip (#185, 2026-07-25) that premise no longer holds: 1 of the 56
    //    crossings over seeds 1..40 embarks 28 cells inland (seed 35, leg 16 -> 20). Its
    //    conclusion does hold, and for a better reason than the old one. No composite
    //    road-to-coast-to-road leg is needed, because #181 measures that overland stub as
    //    an inland handoff and the mark RIDES it, so no ship sails over dry land.
    if (comp[from] !== comp[to]) {
      const water = seaCrossing(w, h, from, to, isSea, launchesFor);
      if (water) return { mode: "sea", cells: water };
      return { mode: "straight", cells: straightFallback(w, h, from, to, isRoad, isLand) };
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
          const water = seaCrossing(w, h, from, to, isSea, launchesFor);
          if (
            water &&
            embarksNearShore(water, w) &&
            chainLength(walk, w) >= SAIL_WHEN_ROAD_EXCEEDS * chainLength(water, w)
          ) {
            return { mode: "sea", cells: water };
          }
        }
        return { mode: "road", cells: walk };
      }
    }

    // 3. The documented fallback: a port is off the road network (an over-budget village),
    //    so ride the road as far as it goes and hop straight to the port. Never claims
    //    mode "road", which keeps "a road leg never crosses open water" true by construction.
    return { mode: "straight", cells: straightFallback(w, h, from, to, isRoad, isLand) };
  };

  const route = (leg: VoyageLeg): RoutedLeg => {
    const a = byIdx.get(leg.fromIdx);
    const b = byIdx.get(leg.toIdx);
    // Legs and sites are both derived from the same place manifest, so a missing site is a
    // caller bug. Say so here rather than return an empty polyline: that would surface far
    // away, as the overlay formatting an undefined vertex into the track's `points`.
    if (!a || !b) throw new Error(`voyage leg ${leg.fromIdx} -> ${leg.toIdx} has no site in the manifest`);
    const { mode, cells } = walkLeg(cellOf(a), cellOf(b));
    const chain = dedupe(cells);
    const points = simplifyPath(chain.map(toPt), RDP_EPSILON);
    const span =
      mode === "sea" ? waterSpanOf(chain, points, isSea, w) : { water: null, inlandHandoff: false };
    return { ...leg, mode, points, water: span.water, inlandHandoff: span.inlandHandoff };
  };

  const lengthMemo = new Map<string, number>();
  const legLength = (fromIdx: number, toIdx: number): number => {
    const a = byIdx.get(fromIdx);
    const b = byIdx.get(toIdx);
    if (!a || !b) throw new Error(`voyage leg ${fromIdx} -> ${toIdx} has no site in the manifest`);
    const [lo, hi] = a.idx <= b.idx ? [a, b] : [b, a];
    const key = `${lo.idx}:${hi.idx}`;
    const hit = lengthMemo.get(key);
    if (hit !== undefined) return hit;
    const len = chainLength(walkLeg(cellOf(lo), cellOf(hi)).cells, w);
    lengthMemo.set(key, len);
    return len;
  };

  return { route, legLength };
}

export function routeVoyage(
  legs: ReadonlyArray<VoyageLeg>,
  sites: ReadonlyArray<Site>,
  survey: Survey,
): ReadonlyArray<RoutedLeg> {
  if (legs.length === 0) return [];
  const router = prepareVoyageRouter(sites, survey);
  return legs.map(router.route);
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
 * So: find, for each port, the nearest cell of EVERY water body (launchesFor, memoized
 * per port since #184), then sail across the body they share, choosing the one with the
 * shortest combined launch. Ties break on the lower component id and then the lower cell
 * id, so the choice never depends on grid iteration order.
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
  launchesFor: (cell: number) => Map<number, Launch>,
): number[] | null {
  const fromLaunches = launchesFor(from);
  const toLaunches = launchesFor(to);

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
