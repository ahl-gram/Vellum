import type { World } from "../world/types.ts";
import { BIOMES } from "../climate/biomes.ts";
import { largestBlob } from "../render/blobs.ts";
import { viewDirection, viewRight, type ProspectView } from "./transect.ts";

export type RoadTown = { readonly index: number; readonly name: string; readonly kind: string; readonly lateral: number; readonly dist: number };
export type PlateBeast = { readonly name: string; readonly epithet: string; readonly lateral: number };

export type Surroundings = {
  readonly seaName: string | null;
  readonly riverName: string | null;
  readonly rangeName: string | null;
  readonly roadTowns: ReadonlyArray<RoadTown>;
  readonly roadCount: number;
  readonly beast: PlateBeast | null;
  readonly realmProclaimed: boolean;
};

export const NO_SURROUNDINGS: Surroundings = { seaName: null, riverName: null, rangeName: null, roadTowns: [], roadCount: 0, beast: null, realmProclaimed: true };

const NEAR = 40;
const RANGE_REACH = 60;
const RIVER_REACH = 3;
const MIN_RANGE_CELLS = 10;
const ROAD_TOWNS = 2;

type Site = World["settlements"][number];

/** The settlements a road reaches from this one before any other: along each road's polyline, stopping at the first settlement met. */
export function townsReachedFirst(world: World, index: number): Set<number> {
  const w = world.elev.w;
  const next = new Map<number, number[]>();
  const link = (a: number, b: number): void => {
    if (a === b) return;
    next.set(a, [...(next.get(a) ?? []), b]);
    next.set(b, [...(next.get(b) ?? []), a]);
  };
  for (const road of world.roads) {
    for (let i = 1; i < road.points.length; i++) {
      const p = road.points[i - 1]!, q = road.points[i]!;
      link(p.x + p.y * w, q.x + q.y * w);
    }
  }
  const town = new Map(world.settlements.map((s, i) => [s.x + s.y * w, i] as const));
  const s0 = world.settlements[index]!;
  const start = s0.x + s0.y * w;
  const seen = new Set([start]);
  const found = new Set<number>();
  const queue = [start];
  for (let head = 0; head < queue.length; head++) {
    for (const n of next.get(queue[head]!) ?? []) {
      if (seen.has(n)) continue;
      seen.add(n);
      const t = town.get(n);
      if (t !== undefined && t !== index) found.add(t);
      else queue.push(n);
    }
  }
  return found;
}

const ruinedBy = (world: World, i: number, year: number): boolean =>
  world.history.events.some((e) => e.kind === "ruin" && e.settlement === i && e.year <= year);

/** The mock's view cone (design/prospects-after-braun-hogenberg/mock/data.ts), kept only where a road reaches the town first (Issue #754 ruling D1). */
function roadTowns(world: World, index: number, view: ProspectView, year: number): RoadTown[] {
  const s = world.settlements[index]!;
  if (year < s.founded) return [];
  const right = viewRight(view);
  const reached = townsReachedFirst(world, index);
  return world.settlements
    .map((n, i) => {
      const ox = n.x - s.x, oy = n.y - s.y;
      return { index: i, name: n.name, kind: n.kind, dist: Math.sqrt(ox * ox + oy * oy), lateral: (ox * right.dx + oy * right.dy) / NEAR, depth: ox * view.dx + oy * view.dy };
    })
    .filter((n) => n.index !== index && n.dist <= NEAR && n.depth > 2 && Math.abs(n.lateral) <= 1)
    .filter((n) => world.settlements[n.index]!.founded <= year && !ruinedBy(world, n.index, year) && reached.has(n.index))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, ROAD_TOWNS)
    .map(({ index: i, name, kind, dist, lateral }) => ({ index: i, name, kind, dist, lateral }));
}

function riverUnder(world: World, s: Site): string | null {
  if (!s.onRiver) return null;
  let best: { name: string; d: number } | null = null;
  for (const [i, name] of world.names.rivers) {
    for (const p of world.rivers[i]?.points ?? []) {
      const d = Math.abs(p.x - s.x) + Math.abs(p.y - s.y);
      if (d <= RIVER_REACH && (best === null || d < best.d)) best = { name, d };
    }
  }
  return best?.name ?? null;
}

function rangeBehind(world: World, s: Site, view: ProspectView): string | null {
  const name = world.names.range;
  if (name === null) return null;
  const { w, h } = world.elev;
  const blob = largestBlob(w, h, (i) => world.biomes[i] === BIOMES.alpine || world.biomes[i] === BIOMES.snow);
  if (blob.length < MIN_RANGE_CELLS) return null;
  let sx = 0, sy = 0;
  for (const i of blob) { sx += i % w; sy += Math.floor(i / w); }
  const cx = sx / blob.length - s.x, cy = sy / blob.length - s.y;
  return Math.sqrt(cx * cx + cy * cy) <= RANGE_REACH && cx * view.dx + cy * view.dy > 0 ? name : null;
}

const roadsEndingAt = (world: World, s: Site): number =>
  world.roads.filter((r) => [r.points[0], r.points[r.points.length - 1]].some((p) => p !== undefined && Math.abs(p.x - s.x) <= 1 && Math.abs(p.y - s.y) <= 1)).length;

function beastInBay(world: World, s: Site, view: ProspectView): PlateBeast | null {
  if (!s.harbor) return null;
  const right = viewRight(view);
  const near = world.beasts
    .map((b) => {
      const ox = b.x - s.x, oy = b.y - s.y;
      return { name: b.name, epithet: b.epithet, dist: Math.sqrt(ox * ox + oy * oy), lateral: (ox * right.dx + oy * right.dy) / NEAR, depth: ox * view.dx + oy * view.dy };
    })
    .filter((b) => b.dist <= NEAR && b.depth < 0)
    .sort((a, b) => a.dist - b.dist)[0];
  return near === undefined ? null : { name: near.name, epithet: near.epithet, lateral: near.lateral };
}

/** World sheets only, like buildProspectInput: what the plate of settlement `index` may truthfully name at `year`. */
export function plateSurroundings(world: World, index: number, year: number): Surroundings {
  const s = world.settlements[index];
  if (s === undefined) throw new RangeError(`settlement index ${index} out of range 0..${world.settlements.length - 1}`);
  const view = viewDirection(world.elev, world.seaLevel, s);
  return {
    seaName: world.names.sea,
    riverName: riverUnder(world, s),
    rangeName: rangeBehind(world, s, view),
    roadTowns: roadTowns(world, index, view, year),
    roadCount: roadsEndingAt(world, s),
    beast: beastInBay(world, s, view),
    realmProclaimed: true,
  };
}
