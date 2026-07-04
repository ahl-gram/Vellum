import type { World } from "./types.ts";
import type { Quarry } from "./daily-hunt.ts";

export type DistanceBand = "cold" | "cool" | "warm" | "hot";

/**
 * Map a grid distance to a warmer/colder band for click feedback. Monotonic:
 * a direct hit (distance 0) is "hot", and increasing distance never warms.
 */
export function classifyDistanceBand(gridDist: number, gridDiagonal: number): DistanceBand {
  const ratio = gridDiagonal > 0 ? gridDist / gridDiagonal : 0;
  if (ratio <= 0.1) return "hot";
  if (ratio <= 0.25) return "warm";
  if (ratio <= 0.5) return "cool";
  return "cold";
}

/** The outcome of one hunt click: a win, or a miss with warmer/colder guidance. */
export type ClickFeedback =
  | { readonly kind: "hit" }
  | {
      readonly kind: "miss";
      readonly band: DistanceBand;
      readonly pickedIdx: number;
      readonly pickedName: string;
    };

/**
 * Classify one map click (in grid coordinates) into hunt feedback. The player
 * "selects" the settlement nearest the click; if that is the quarry it is a win
 * (unchanged from the original hunt). Otherwise the warmer/colder band is scored
 * from the CLICK-to-quarry distance -- continuous, so stepping toward the quarry
 * always warms -- and the selected settlement is named so a cluster of identical
 * village glyphs is no longer an indistinguishable dead-end "Hot".
 */
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
