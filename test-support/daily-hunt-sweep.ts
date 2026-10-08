import { defaultRecipe, generateWorld } from "../src/world/generate.ts";
import type { Quarry } from "../src/world/daily-hunt.ts";
import { createProjection, marginFor } from "../src/render/transform.ts";
import { renderMap } from "../src/render/map-renderer.ts";
import type { World } from "../src/world/types.ts";
import { glyphGate, labelGate, TERRAIN_RADIUS, type TerrainBand } from "./daily-hunt-geometry.ts";

const MARGIN = marginFor(1500);

export const DAILY_SEEDS = Array.from({ length: 30 }, (_, i) => 20260601 + i);
export const DAILY: ReadonlyArray<World> = DAILY_SEEDS.map((s) => generateWorld(defaultRecipe(s)));
const OFFGRID: ReadonlyArray<World> = [1, 7, 12345].map((s) => generateWorld(defaultRecipe(s)));
export const SWEEP: ReadonlyArray<World> = [...DAILY, ...OFFGRID];

export const SWEEP_SVGS: ReadonlyArray<string> = SWEEP.map((w) => renderMap(w, { style: "antique", legend: true }));

export type Gates = {
  readonly isLabeled: (name: string) => boolean;
  readonly hasGlyphNear: (band: TerrainBand) => boolean;
};

export function gatesFor(world: World, q: Quarry, markup: string): Gates {
  const proj = createProjection(world.elev.w, world.elev.h, 1500, MARGIN);
  return {
    isLabeled: labelGate(markup),
    hasGlyphNear: glyphGate(markup, proj.px(q.settlement.x), proj.py(q.settlement.y), TERRAIN_RADIUS * proj.scale),
  };
}
