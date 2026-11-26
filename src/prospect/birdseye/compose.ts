import type { World } from "../../world/types.ts";
import type { ProspectInput } from "../input.ts";
import { eraFor } from "../caption.ts";
import type { Surroundings } from "../surroundings.ts";
import type { BirdseyeGeometry } from "./types.ts";

export function composeBirdseye(
  world: World,
  input: ProspectInput,
  year: number,
  surroundings: Surroundings,
): BirdseyeGeometry {
  const kind = input.kind === "hamlet" ? "village" : input.kind;
  return {
    seed: world.recipe.seed,
    index: input.index,
    kind,
    era: eraFor(input, year),
    strips: [],
    coast: [],
    hatch: [],
    shade: [],
    rivers: [],
    roads: [],
    scatter: [],
    town: {
      ground: [],
      blocks: [],
      streets: [],
      bridges: [],
      items: [],
      wall: null,
      keepOut: [],
      extent: { x0: 0, x1: 0, y0: 0, y1: 0 },
    },
    harbour: { quay: null, ships: [] },
    neighbours: surroundings.roadTowns.map(() => ({ x: 0, y: 0, name: "", steeple: false, houses: [] })).slice(0, 0),
    seaName: null,
    key: [],
  };
}
