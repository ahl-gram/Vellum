import { bfsPath } from "../core/bfs-path.ts";
import { NEIGHBORS_8 } from "../core/grid.ts";
import { labelComponents } from "../core/mask-components.ts";
import { simplifyPath, type Pt } from "../core/rdp.ts";
import { waterSpanOf, type WaterSpan } from "./voyage-water.ts";
import type { Survey } from "./survey.ts";
import type { VoyageLeg } from "./voyage.ts";

/** Voyage router: pure and client-side over the worker's integer survey. Integer BFS with fixed neighbour order keeps it deterministic; the only float math (RDP) is presentation-only and never reaches a baked SVG. */

export type LegMode = "road" | "sea" | "straight";

export type Site = { readonly idx: number; readonly x: number; readonly y: number };

/** mode is set by the producing router; points are GRID-space vertices the overlay projects. */
export type RoutedLeg = VoyageLeg & {
  readonly mode: LegMode;
  readonly points: ReadonlyArray<Pt>;
  /** Where the water is, as arc-length fractions of points; null off sea legs. */
  readonly water: WaterSpan | null;
  readonly inlandHandoff: boolean;
};

/** Grid cells. */
export const RDP_EPSILON = 0.75;

/** Sail when the road is this many times the sea route. Bounded above: past ~1.5 the leanest genuine inland handoff falls into the INLAND_STUB_CELLS gap (voyage-water.ts) and stubs too short to narrate start firing the handoff prose. */
export const SAIL_WHEN_ROAD_EXCEEDS = 1.3;

/** Max embark stub for a coastal shortcut, in grid cells. */
export const COAST_EMBARK_MAX = 3;

function embarksNearShore(water: ReadonlyArray<number>, w: number): boolean {
  if (water.length < 3) return true;
  const d = (a: number, b: number) => Math.hypot((a % w) - (b % w), ((a / w) | 0) - ((b / w) | 0));
  return (
    d(water[0] as number, water[1] as number) <= COAST_EMBARK_MAX &&
    d(water[water.length - 1] as number, water[water.length - 2] as number) <= COAST_EMBARK_MAX
  );
}

function chainLength(cells: ReadonlyArray<number>, w: number): number {
  let d = 0;
  for (let i = 1; i < cells.length; i++) {
    const a = cells[i - 1] as number;
    const b = cells[i] as number;
    d += Math.hypot((a % w) - (b % w), ((a / w) | 0) - ((b / w) | 0));
  }
  return d;
}

export type VoyageRouter = {
  readonly route: (leg: VoyageLeg) => RoutedLeg;
  readonly legLength: (fromIdx: number, toIdx: number) => number;
};

export function prepareVoyageRouter(sites: ReadonlyArray<Site>, survey: Survey): VoyageRouter {
  const { gridW: w, gridH: h, land } = survey;
  const byIdx = new Map(sites.map((s) => [s.idx, s]));
  const cellOf = (s: Site) => s.x + s.y * w;
  const toPt = (cell: number): Pt => ({ x: cell % w, y: (cell / w) | 0 });

  // Road polylines form one 8-connected component per settled landmass (#309), so BFS over the cell mask IS the road-graph walk; a pair with no shared component has no walk and degrades below.
  const road = new Uint8Array(w * h);
  for (const polyline of survey.roads) for (const [x, y] of polyline) road[x + y * w] = 1;

  const comp = labelComponents(land, w, h);
  const seaMask = Uint8Array.from(land, (v) => (v === 1 ? 0 : 1));
  const seaComp = labelComponents(seaMask, w, h, 8);
  const isRoad = (c: number) => road[c] === 1;
  const isSea = (c: number) => land[c] === 0;
  const isLand = (c: number) => land[c] === 1;

  const launchesMemo = new Map<number, Map<number, Launch>>();
  const launchesFor = (cell: number): Map<number, Launch> => {
    let m = launchesMemo.get(cell);
    if (!m) {
      m = launchesByWaterBody(w, h, cell, isSea, seaComp);
      launchesMemo.set(cell, m);
    }
    return m;
  };

  const walkLeg = (from: number, to: number): { mode: LegMode; cells: ReadonlyArray<number> } => {
    if (comp[from] !== comp[to]) {
      const water = seaCrossing(w, h, from, to, isSea, launchesFor);
      if (water) return { mode: "sea", cells: water };
      return { mode: "straight", cells: straightFallback(w, h, from, to, isRoad, isLand) };
    }

    if (isRoad(from) && isRoad(to)) {
      const walk = bfsPath(w, h, from, (c) => c === to, isRoad);
      if (walk) {
        const water = seaCrossing(w, h, from, to, isSea, launchesFor);
        if (
          water &&
          embarksNearShore(water, w) &&
          chainLength(walk, w) >= SAIL_WHEN_ROAD_EXCEEDS * chainLength(water, w)
        ) {
          return { mode: "sea", cells: water };
        }
        return { mode: "road", cells: walk };
      }
    }

    return { mode: "straight", cells: straightFallback(w, h, from, to, isRoad, isLand) };
  };

  const route = (leg: VoyageLeg): RoutedLeg => {
    const a = byIdx.get(leg.fromIdx);
    const b = byIdx.get(leg.toIdx);
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

/** [fromPort, ...open water..., toPort]: sail the shared body with the shortest combined launch. Ties break on lower body id then cell id, so the choice never depends on grid iteration order. */
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
  const water = bfsPath(w, h, start, (c) => c === goal, isSea);
  if (!water) return null;
  return [from, ...water, to];
}

type Launch = { readonly cell: number; readonly hops: number };

/** Nearest sea cell per water body from one BFS; FIFO frontier plus fixed NEIGHBORS_8 order keeps equidistant ties stable. */
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

function straightFallback(
  w: number,
  h: number,
  from: number,
  to: number,
  isRoad: (c: number) => boolean,
  isLand: (c: number) => boolean,
): number[] {
  const snap = (cell: number): ReadonlyArray<number> | null => {
    if (isRoad(cell)) return [cell];
    return bfsPath(w, h, cell, isRoad, isLand);
  };
  const reachFrom = snap(from);
  if (reachFrom) {
    const reachTo = snap(to);
    if (reachTo) {
      const snapFrom = reachFrom[reachFrom.length - 1] as number;
      const snapTo = reachTo[reachTo.length - 1] as number;
      const walk = bfsPath(w, h, snapFrom, (c) => c === snapTo, isRoad);
      if (walk) return [...reachFrom, ...walk, ...[...reachTo].reverse()];
    }
  }
  const landWalk = bfsPath(w, h, from, (c) => c === to, isLand);
  return landWalk ? [...landWalk] : [from, to];
}

function dedupe(cells: ReadonlyArray<number>): number[] {
  const out: number[] = [];
  for (const c of cells) if (out[out.length - 1] !== c) out.push(c);
  return out;
}
