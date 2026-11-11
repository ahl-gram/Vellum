import type { World } from "./types.ts";
import type { Quarry } from "./daily-hunt.ts";

export type DistanceBand = "cold" | "cool" | "warm" | "hot";

export function classifyDistanceBand(gridDist: number, gridDiagonal: number): DistanceBand {
  const ratio = gridDiagonal > 0 ? gridDist / gridDiagonal : 0;
  if (ratio <= 0.1) return "hot";
  if (ratio <= 0.25) return "warm";
  if (ratio <= 0.5) return "cool";
  return "cold";
}

export type ClickFeedback =
  | { readonly kind: "hit" }
  | {
      readonly kind: "miss";
      readonly band: DistanceBand;
      readonly dist: number;
      readonly pickedIdx: number;
      readonly pickedName: string;
    };

export function classifyClick(
  world: World,
  quarry: Quarry,
  click: { readonly x: number; readonly y: number },
): ClickFeedback {
  const nearest = nearestSettlement(world, click.x, click.y);
  if (nearest === quarry.idx) return { kind: "hit" };

  const picked = world.settlements[nearest];
  const diagonal = Math.hypot(world.elev.w - 1, world.elev.h - 1);
  const dist = Math.hypot(click.x - quarry.settlement.x, click.y - quarry.settlement.y);
  return {
    kind: "miss",
    band: classifyDistanceBand(dist, diagonal),
    dist,
    pickedIdx: nearest,
    pickedName: picked ? picked.name : "",
  };
}

function nearestSettlement(world: World, x: number, y: number): number {
  let nearest = -1;
  let nd = Infinity;
  world.settlements.forEach((st, i) => {
    const d = Math.hypot(st.x - x, st.y - y);
    if (d < nd) {
      nd = d;
      nearest = i;
    }
  });
  return nearest;
}
