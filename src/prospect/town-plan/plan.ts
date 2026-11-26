import type { World } from "../../world/types.ts";
import { createRng } from "../../core/rng.ts";
import type { TownPlan } from "./types.ts";

const shared = createRng(0);

export function planTown(world: World, index: number): TownPlan {
  const s = world.settlements[index]!;
  const corners = [
    { x: s.x - 2, y: s.y - 2 },
    { x: s.x + 2, y: s.y - 2 },
    { x: s.x + 2, y: s.y + 2 },
    { x: s.x - 2, y: s.y + 2 },
  ];
  return {
    seed: world.recipe.seed,
    index,
    centre: { x: s.x, y: s.y },
    radius: shared.next(),
    wall: corners,
    gates: corners.map((at) => ({ at, road: 0 })),
    streets: [],
    blocks: [corners],
    landmarks: [{ kind: "bridge", at: corners[0]! }],
    quay: [],
  };
}
