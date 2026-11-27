import type { World } from "../../world/types.ts";
import { createRng } from "../../core/rng.ts";
import type { PlateEra } from "../caption.ts";
import { sampleBilinear } from "../transect.ts";
import type { TownPlan } from "../town-plan/types.ts";
import { dist, lineRingCrossings, nearestOnPolyline } from "../town-plan/geom.ts";
import type { BirdseyeHarbour, BirdseyeKind, BirdseyeWindow, Ship } from "./types.ts";
import { HALF_U, V_FAR, V_NEAR, projector, toUV } from "./window.ts";

const TRIES = 16;

export function harbourOf(
  world: World,
  w: BirdseyeWindow,
  plan: TownPlan,
  kind: BirdseyeKind,
  era: PlateEra,
): BirdseyeHarbour {
  const mark = plan.landmarks.find((l) => l.kind === "harbour");
  if (era !== "standing" || mark === undefined) return { quay: null, ships: [] };
  const to = projector(world, w);
  const rng = createRng(plan.seed).fork(`mock-birdseye-harbour:${plan.index}`);
  const nearest = [...plan.quay].sort(
    (a, b) => dist(nearestOnPolyline(mark.at, a), mark.at) - dist(nearestOnPolyline(mark.at, b), mark.at),
  )[0];
  const along = (nearest ?? []).filter((p) => dist(p, mark.at) < 1.4 + plan.radius * 0.15);
  const quay = nearest !== undefined && nearest.length > 1 && along.length > 1 ? along.map(to) : null;
  const reach = 2 * (plan.radius * 0.8 + 2);
  const wanted = kind === "capital" ? 7 : kind === "village" ? 2 : 4;
  const ships: Ship[] = [];
  for (let k = 0; k < wanted; k++) {
    for (let tries = 0; tries < TRIES; tries++) {
      const g = { x: mark.at.x + (rng.next() - 0.5) * reach, y: mark.at.y + (rng.next() - 0.5) * reach };
      if (sampleBilinear(world.elev, g.x, g.y) > world.seaLevel - 0.002) continue;
      const { u, v } = toUV(w, g);
      if (Math.abs(u) > HALF_U - 1 || v < V_NEAR + 0.5 || v > V_FAR - 1) continue;
      if (plan.wall !== null && lineRingCrossings([mark.at, g], plan.wall).length > 1) continue;
      const a = to(g);
      const s = 0.4 + rng.next() * 0.25;
      const great = kind !== "village" && rng.next() < 0.4;
      const wake: readonly [number, number, number] = [rng.next(), rng.next(), rng.next()];
      ships.push({ x: a.x, y: a.y, s, great, wake, grid: g });
      break;
    }
  }
  return { quay, ships };
}
