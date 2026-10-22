import { boxBlur } from "../core/box-blur.ts";
import { fieldFrom, NEIGHBORS_8, quantile, type Field } from "../core/grid.ts";
import { createCellMinHeap } from "../core/heap.ts";
import { clamp } from "../core/math.ts";
import type { UvWindow } from "../terrain/heightfield.ts";
import { densifyCourse, type GridPoint, type RiverRun } from "./river-runs.ts";

// The Issue #950 round's stand-ins, kept as Alex ruled from them: `VALLEY_K` in `design/farther-interior/mock/reroute.ts`, `CORRIDOR_WORLD_CELLS` in `design/farther-interior/mock/corridor.ts`.
export const CORRIDOR_WORLD_CELLS = 1;
export const VALLEY_K = 6;
export const CENTRE_PULL = 1;

/** One world cell in region cells, never under 2: keyed to the WINDOW, so the corridor is the same width at any depth. */
export function corridorRadius(window: UvWindow, gridW: number, worldGridW: number): number {
  return Math.max(2, (CORRIDOR_WORLD_CELLS * (gridW - 1)) / ((window.u1 - window.u0) * (worldGridW - 1)));
}

/** The ground less its own blur: where the fine ground lies below its surroundings (a valley) it reads negative. */
export function fineRelief(ground: Field, radius: number): Field {
  const smooth = boxBlur(ground, Math.max(1, Math.round(radius / 2)));
  const data = new Float64Array(ground.data.length);
  for (let i = 0; i < data.length; i++) data[i] = (ground.data[i] as number) - (smooth.data[i] as number);
  return fieldFrom(ground.w, ground.h, data);
}

/** Each cell's Euclidean distance to the course, Infinity beyond `radius`. */
export function courseDistance(
  course: ReadonlyArray<GridPoint>,
  gridW: number,
  gridH: number,
  radius: number,
): Float64Array {
  const dist = new Float64Array(gridW * gridH).fill(Infinity);
  const r2 = radius * radius;
  for (let i = 1; i < course.length; i++) {
    const a = course[i - 1] as GridPoint;
    const b = course[i] as GridPoint;
    const x0 = Math.max(0, Math.floor(Math.min(a.x, b.x) - radius));
    const x1 = Math.min(gridW - 1, Math.ceil(Math.max(a.x, b.x) + radius));
    const y0 = Math.max(0, Math.floor(Math.min(a.y, b.y) - radius));
    const y1 = Math.min(gridH - 1, Math.ceil(Math.max(a.y, b.y) + radius));
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const t = len2 > 0 ? Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / len2)) : 0;
        const ex = x - (a.x + t * dx);
        const ey = y - (a.y + t * dy);
        const d2 = ex * ex + ey * ey;
        const cell = x + y * gridW;
        if (d2 <= r2 && Math.sqrt(d2) < (dist[cell] as number)) dist[cell] = Math.sqrt(d2);
      }
    }
  }
  return dist;
}

export type RouteFrame = {
  readonly elev: Field;
  readonly seaLevel: number;
  readonly relief: Field;
  readonly radius: number;
  readonly laid: Uint8Array;
};

/** Dijkstra with a fixed neighbour order (`NEIGHBORS_8`) and ties broken by cell index, so one window draws the same river every time. The start never counts as a target, and a cell that is not passable may still be entered when it is a target. */
export function cheapestPath(
  start: number,
  isTarget: (cell: number) => boolean,
  passable: (cell: number) => boolean,
  stepCost: (cell: number) => number,
  w: number,
  h: number,
): number[] | null {
  const best = new Float64Array(w * h).fill(Infinity);
  const prev = new Int32Array(w * h).fill(-1);
  const settled = new Uint8Array(w * h);
  const heap = createCellMinHeap();
  best[start] = 0;
  heap.push(start, 0);
  while (heap.size() > 0) {
    const cell = heap.pop();
    if (settled[cell] === 1) continue;
    settled[cell] = 1;
    if (cell !== start && isTarget(cell)) {
      const path: number[] = [];
      for (let k = cell; k !== -1; k = prev[k] as number) path.push(k);
      return path.reverse();
    }
    const x = cell % w;
    const y = (cell / w) | 0;
    for (const [dx, dy, length] of NEIGHBORS_8) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      const next = nx + ny * w;
      if (settled[next] === 1 || (!passable(next) && !isTarget(next))) continue;
      const cost = (best[cell] as number) + length * stepCost(next);
      if (cost < (best[next] as number)) {
        best[next] = cost;
        prev[next] = cell;
        heap.push(next, cost);
      }
    }
  }
  return null;
}

type Tier = { readonly isTarget: (cell: number) => boolean; readonly passable: (cell: number) => boolean };

const cellAt = (p: GridPoint, w: number, h: number): number =>
  clamp(Math.round(p.x), 0, w - 1) + clamp(Math.round(p.y), 0, h - 1) * w;

/** The relief and the pull to the world's line, scaled by the corridor's own land: the 5% and 95% quantiles of the relief over the corridor's land set the valley's span. */
function stepCostOf(dist: Float64Array, frame: RouteFrame): (cell: number) => number {
  const { elev, seaLevel, relief, radius } = frame;
  const inside: number[] = [];
  for (let c = 0; c < dist.length; c++) {
    if (Number.isFinite(dist[c]) && (elev.data[c] as number) > seaLevel)
      inside.push(relief.data[c] as number);
  }
  const lo = inside.length > 0 ? quantile(inside, 0.05) : 0;
  const hi = inside.length > 0 ? quantile(inside, 0.95) : 0;
  const span = Math.max(1e-12, hi - lo);
  return (cell) => {
    const pull = Math.min(1, (dist[cell] as number) / radius);
    return 1 + VALLEY_K * (clamp(((relief.data[cell] as number) - lo) / span, 0, 1) + CENTRE_PULL * pull * pull);
  };
}

function startCell(course: ReadonlyArray<GridPoint>, frame: RouteFrame): number {
  const { w, h } = frame.elev;
  const samples = densifyCourse(course);
  const land = samples.find((p) => (frame.elev.data[cellAt(p, w, h)] as number) > frame.seaLevel);
  return cellAt(land ?? (samples[samples.length - 1] as GridPoint), w, h);
}

/** A run that leaves at the edge targets its exit cell. A run that ends inside first targets a MEETING cell (water, or a cell an earlier run laid, within twice the corridor radius of its last point), and only then its exit. Each target tries the corridor's land, then any land, then any cell; the first tier that finds a path wins. */
function tiersOf(run: RiverRun, frame: RouteFrame, dist: Float64Array): ReadonlyArray<Tier> {
  const { w, h } = frame.elev;
  const { elev, seaLevel, laid, radius } = frame;
  const tail = run.course[run.course.length - 1] as GridPoint;
  const exit = cellAt(tail, w, h);
  const isLand = (c: number): boolean => (elev.data[c] as number) > seaLevel;
  const corridorLand = (c: number): boolean => Number.isFinite(dist[c]) && isLand(c);
  const reach2 = 4 * radius * radius;
  const meeting = (c: number): boolean => {
    const dx = (c % w) - tail.x;
    const dy = ((c / w) | 0) - tail.y;
    return (!isLand(c) || laid[c] === 1) && dx * dx + dy * dy <= reach2;
  };
  const atExit = (c: number): boolean => c === exit;
  const toExit: ReadonlyArray<Tier> = [
    { isTarget: atExit, passable: corridorLand },
    { isTarget: atExit, passable: isLand },
    { isTarget: atExit, passable: () => true },
  ];
  if (run.leavesAtEdge) return toExit;
  return [{ isTarget: meeting, passable: corridorLand }, { isTarget: meeting, passable: isLand }, ...toExit];
}

/** The cells of the cheapest path from the run's first land cell to its target, before the mouth walk. The caller has checked the course has land under it; when the start is the exit, the path is the start alone. */
export function routeRun(run: RiverRun, frame: RouteFrame): number[] {
  const { w, h } = frame.elev;
  const dist = courseDistance(run.course, w, h, frame.radius);
  const stepCost = stepCostOf(dist, frame);
  const start = startCell(run.course, frame);
  for (const tier of tiersOf(run, frame, dist)) {
    const path = cheapestPath(start, tier.isTarget, tier.passable, stepCost, w, h);
    if (path !== null) return path;
  }
  return [start];
}
