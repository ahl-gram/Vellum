import type { Field } from "../core/grid.ts";
import { clamp } from "../core/math.ts";
import { REUSE_DISCOUNT, RIVER_CROSSING, SLOPE_PENALTY, type Road, type RoadPoint } from "../society/roads.ts";
import type { UvWindow } from "../terrain/heightfield.ts";
import { slopeField } from "../terrain/slope.ts";
import { cellsPerWorldCell } from "./region-parent.ts";
import { cheapestPath, corridorRadius, courseDistance } from "./river-route.ts";
import { landSnapRadius, snapToLand } from "./snap-to-land.ts";
import type { NamedSettlement, World } from "./types.ts";

const ROAD_CENTRE_PULL = 1;

export type RoadGround = {
  readonly elev: Field;
  readonly seaLevel: number;
  readonly riverCells: Uint8Array;
};
export type PlacedSettlements = {
  readonly settlements: ReadonlyArray<NamedSettlement>;
  readonly regionIdxOf: ReadonlyMap<number, number>;
};

type Frame = {
  readonly world: World;
  readonly window: UvWindow;
  readonly gridW: number;
  readonly gridH: number;
  readonly snapRadius: number;
};
type Pins = { readonly townAt: ReadonlyMap<number, number>; readonly junctions: ReadonlySet<number> };
type Run = {
  readonly rank: Road["rank"];
  readonly line: ReadonlyArray<RoadPoint>;
  readonly anchors: ReadonlyArray<number | null>;
};
type LegContext = {
  readonly ground: RoadGround;
  readonly slope: Field;
  readonly cpw: number;
  readonly radius: number;
  readonly laid: Uint8Array;
};

function toRegion(f: Frame, p: RoadPoint): RoadPoint {
  const { u0, u1, v0, v1 } = f.window;
  const ww = f.world.recipe.gridW - 1;
  const wh = f.world.recipe.gridH - 1;
  return { x: ((p.x / ww - u0) / (u1 - u0)) * (f.gridW - 1), y: ((p.y / wh - v0) / (v1 - v0)) * (f.gridH - 1) };
}

function clipSegment(a: RoadPoint, b: RoadPoint, f: Frame): readonly [number, number] | null {
  const { u0, u1, v0, v1 } = f.window;
  const ww = f.world.recipe.gridW - 1;
  const wh = f.world.recipe.gridH - 1;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const edges: ReadonlyArray<readonly [number, number]> = [
    [-dx, a.x - u0 * ww],
    [dx, u1 * ww - a.x],
    [-dy, a.y - v0 * wh],
    [dy, v1 * wh - a.y],
  ];
  let t0 = 0;
  let t1 = 1;
  for (const [p, q] of edges) {
    if (p === 0) {
      if (q < 0) return null;
      continue;
    }
    const r = q / p;
    if (p < 0) t0 = Math.max(t0, r);
    else t1 = Math.min(t1, r);
    if (t0 > t1) return null;
  }
  return [t0, t1];
}

function junctionCells(world: World): Set<number> {
  const width = world.recipe.gridW;
  const towns = new Set(world.settlements.map((s) => s.x + s.y * width));
  const junctions = new Set<number>();
  for (const road of world.roads) {
    const last = road.points[road.points.length - 1];
    if (last !== undefined && !towns.has(last.x + last.y * width)) junctions.add(last.x + last.y * width);
  }
  return junctions;
}

function anchorAt(f: Frame, ground: RoadGround, p: RoadPoint): number | null {
  const r = toRegion(f, p);
  const gx = clamp(Math.round(r.x), 0, f.gridW - 1);
  const gy = clamp(Math.round(r.y), 0, f.gridH - 1);
  const cell = snapToLand(ground.elev, ground.seaLevel, gx, gy, f.snapRadius);
  return cell === null ? null : cell.x + cell.y * f.gridW;
}

function dotOf(f: Frame, placed: PlacedSettlements, pins: Pins, v: RoadPoint): RoadPoint | null {
  const town = pins.townAt.get(v.x + v.y * f.world.recipe.gridW);
  const regionIdx = town === undefined ? undefined : placed.regionIdxOf.get(town);
  const dot = regionIdx === undefined ? undefined : placed.settlements[regionIdx];
  return dot === undefined ? null : { x: dot.x, y: dot.y };
}

function runsOfRoad(f: Frame, ground: RoadGround, placed: PlacedSettlements, pins: Pins, road: Road): Run[] {
  const width = f.world.recipe.gridW;
  const runs: Run[] = [];
  let line: RoadPoint[] = [];
  let anchors: Array<number | null> = [];
  const flush = (): void => {
    if (line.length >= 2) runs.push({ rank: road.rank, line, anchors });
    line = [];
    anchors = [];
  };
  const vertexPoint = (v: RoadPoint): RoadPoint => dotOf(f, placed, pins, v) ?? toRegion(f, v);
  const vertexAnchor = (v: RoadPoint): number | null => {
    const dot = dotOf(f, placed, pins, v);
    return dot === null ? anchorAt(f, ground, v) : dot.x + dot.y * f.gridW;
  };
  for (let i = 1; i < road.points.length; i++) {
    const a = road.points[i - 1] as RoadPoint;
    const b = road.points[i] as RoadPoint;
    const t = clipSegment(a, b, f);
    if (t === null) {
      flush();
      continue;
    }
    const at = (s: number): RoadPoint => ({ x: a.x + (b.x - a.x) * s, y: a.y + (b.y - a.y) * s });
    if (line.length === 0) {
      const opensAtVertex = t[0] === 0 && i === 1;
      line.push(opensAtVertex ? vertexPoint(a) : toRegion(f, at(t[0])));
      anchors.push(opensAtVertex ? vertexAnchor(a) : anchorAt(f, ground, at(t[0])));
    }
    if (t[1] < 1) {
      line.push(toRegion(f, at(t[1])));
      anchors.push(anchorAt(f, ground, at(t[1])));
      flush();
      continue;
    }
    line.push(vertexPoint(b));
    const cell = b.x + b.y * width;
    if (i === road.points.length - 1 || pins.junctions.has(cell) || pins.townAt.has(cell))
      anchors.push(vertexAnchor(b));
  }
  flush();
  return runs;
}

function routeLeg(
  from: number,
  to: number,
  dist: Float64Array,
  stepCost: (cell: number) => number,
  ground: RoadGround,
): number[] | null {
  if (from === to) return [from];
  const { elev, seaLevel } = ground;
  const isTarget = (c: number): boolean => c === to;
  const isLand = (c: number): boolean => (elev.data[c] as number) > seaLevel;
  const inCorridor = (c: number): boolean => isLand(c) && Number.isFinite(dist[c]);
  return (
    cheapestPath(from, isTarget, inCorridor, stepCost, elev.w, elev.h) ??
    cheapestPath(from, isTarget, isLand, stepCost, elev.w, elev.h)
  );
}

function layRun(run: Run, ctx: LegContext): Road[] {
  const { ground, slope, cpw, radius, laid } = ctx;
  const { w, h } = ground.elev;
  const dist = courseDistance(run.line, w, h, radius);
  const stepCost = (c: number): number => {
    const d = dist[c] as number;
    const pull = Number.isFinite(d) ? d / radius : 1;
    const river = ground.riverCells[c] === 1 ? RIVER_CROSSING : 0;
    const base = 1 + (slope.data[c] as number) * cpw * SLOPE_PENALTY + river + ROAD_CENTRE_PULL * pull * pull;
    return laid[c] === 1 ? base * REUSE_DISCOUNT : base;
  };
  const roads: Road[] = [];
  let chain: number[] = [];
  const emit = (): void => {
    if (chain.length >= 2) roads.push({ points: chain.map((c) => ({ x: c % w, y: (c / w) | 0 })), rank: run.rank });
    chain = [];
  };
  for (let k = 1; k < run.anchors.length; k++) {
    const from = run.anchors[k - 1] as number | null;
    const to = run.anchors[k] as number | null;
    const path = from === null || to === null ? null : routeLeg(from, to, dist, stepCost, ground);
    if (path === null) {
      emit();
      continue;
    }
    chain = chain.length === 0 ? path : chain.concat(path.slice(1));
    for (const c of path) laid[c] = 1;
  }
  emit();
  return roads;
}

export function layWorldRoads(world: World, window: UvWindow, ground: RoadGround, placed: PlacedSettlements): Road[] {
  const { w, h } = ground.elev;
  const worldW = world.recipe.gridW;
  const f: Frame = { world, window, gridW: w, gridH: h, snapRadius: landSnapRadius(w, window, worldW) };
  const townAt = new Map<number, number>();
  world.settlements.forEach((s, i) => townAt.set(s.x + s.y * worldW, i));
  const pins: Pins = { townAt, junctions: junctionCells(world) };
  const ctx: LegContext = {
    ground,
    slope: slopeField(ground.elev),
    cpw: cellsPerWorldCell(w, window, worldW),
    radius: corridorRadius(window, w, worldW),
    laid: new Uint8Array(w * h),
  };
  return world.roads.flatMap((road) => runsOfRoad(f, ground, placed, pins, road).flatMap((run) => layRun(run, ctx)));
}
