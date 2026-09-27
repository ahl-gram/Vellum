import type { Survey, SurveyRoad } from "../src/render/survey.ts";
import { buildSurvey } from "../src/render/survey.ts";
import { routeVoyage } from "../src/render/voyage-route.ts";
import { buildVoyagePlan } from "../src/render/voyage.ts";
import { buildPlaceManifest } from "../src/render/place-manifest.ts";
import { defaultRecipe, generateWorld } from "../src/world/generate.ts";

// Picture legend: '#' land, '.' sea, '=' land carrying a road.

export function survey(rows: string[]): Survey {
  const gridH = rows.length;
  const gridW = rows[0]!.length;
  const land = new Uint8Array(gridW * gridH);
  const roadCells: Array<readonly [number, number]> = [];
  rows.forEach((r, y) =>
    [...r].forEach((c, x) => {
      if (c !== ".") land[x + y * gridW] = 1;
      if (c === "=") roadCells.push([x, y]);
    }),
  );
  // The router only ever reads the SET of road cells, so the polyline split does not matter here.
  const roads: SurveyRoad[] = roadCells.length ? [roadCells] : [];
  return { gridW, gridH, land, roads };
}

export const site = (idx: number, x: number, y: number) => ({ idx, x, y });
export const leg = (fromIdx: number, toIdx: number) => ({ fromIdx, toIdx });
export const isLand = (s: Survey, p: { x: number; y: number }) => s.land[p.x + p.y * s.gridW] === 1;

export const realWorld = (seed: number) => {
  const world = generateWorld(defaultRecipe(seed));
  const manifest = buildPlaceManifest(world, 1500);
  const plan = buildVoyagePlan(manifest.places, manifest.presentYear);
  const s = buildSurvey(world.elev, world.seaLevel, world.roads);
  const sites = manifest.places.map((p) => site(p.idx, p.gx, p.gy));
  return { world, s, plan, sites, routed: routeVoyage(plan.legs, sites, s) };
};
