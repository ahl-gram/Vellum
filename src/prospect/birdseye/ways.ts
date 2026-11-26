import type { World } from "../../world/types.ts";
import type { Pt } from "../geometry.ts";
import type { PlanPoint } from "../town-plan/types.ts";
import type { BirdseyeWindow, Way } from "./types.ts";
import { inView, projector } from "./window.ts";

type Run = { readonly run: Pt[]; readonly grid: PlanPoint[] };

function runsInside(w: BirdseyeWindow, to: (g: PlanPoint) => Pt, points: ReadonlyArray<PlanPoint>): Run[] {
  const runs: Run[] = [];
  let run: Pt[] = [];
  let grid: PlanPoint[] = [];
  for (const p of points) {
    if (inView(w, p)) {
      run.push(to(p));
      grid.push({ x: p.x, y: p.y });
    } else if (run.length > 0) {
      runs.push({ run, grid });
      run = [];
      grid = [];
    }
  }
  if (run.length > 0) runs.push({ run, grid });
  return runs.filter((r) => r.run.length >= 2);
}

export function waysIn(world: World, w: BirdseyeWindow): { rivers: Pt[][]; roads: Way[] } {
  const to = projector(world, w);
  const rivers = world.rivers.flatMap((r) => runsInside(w, to, r.points).map((x) => x.run));
  const roads = world.roads.flatMap((road) =>
    runsInside(w, to, road.points).map((x): Way => ({ run: x.run, grid: x.grid, trunk: road.rank === "trunk" })),
  );
  return { rivers, roads };
}
