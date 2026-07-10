import type { Field } from "../core/grid.ts";
import type { Road } from "../society/roads.ts";

/**
 * The surveyor's working knowledge of the world, projected for the client (#120).
 *
 * The voyage's router needs two things the client has never held: where the water
 * is, and where the roads run. Both are grid-space INTEGER facts, which is the
 * point: unlike a routed polyline of floats, they cross the worker boundary and
 * compare byte-exactly worker-vs-inline (e2e A2), immune to the transcendental
 * drift that forces the committed charts to be compared with a tolerance.
 *
 * This is the `draw` job's second structured-cloneable projection, alongside
 * place-manifest.ts. It ships world FACTS; the client's router (voyage-route.ts)
 * turns them into geometry. That split is what lets the voyage toggle route a
 * survey with no redraw, per #119's contract.
 */
export type SurveyRoad = ReadonlyArray<readonly [number, number]>;

export type Survey = {
  readonly gridW: number;
  readonly gridH: number;
  /** 1 = land, 0 = sea, indexed x + y * gridW. */
  readonly land: Uint8Array;
  /** Every drawn road as a grid-space polyline of 8-adjacent cells. */
  readonly roads: ReadonlyArray<SurveyRoad>;
};

export function buildSurvey(elev: Field, seaLevel: number, roads: ReadonlyArray<Road>): Survey {
  const { w, h, data } = elev;
  const land = new Uint8Array(w * h);
  // Strictly above the waterline, matching world/landmass.ts and generate.ts. A cell
  // exactly AT seaLevel is sea; flipping this comparison would give the router a
  // coastline one cell wider than the one the chart draws.
  for (let i = 0; i < w * h; i++) land[i] = (data[i] as number) > seaLevel ? 1 : 0;
  return {
    gridW: w,
    gridH: h,
    land,
    roads: roads.map((r) => r.points.map((p) => [p.x, p.y] as const)),
  };
}
