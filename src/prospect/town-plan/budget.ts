import { simplify } from "./geom.ts";
import { BLOCK_TOLERANCE } from "./network.ts";
import type { PlanPoint, TownPlan } from "./types.ts";

export const PLAN_POINTS = 1950;
const LADDER_STEP = 0.001;
const LADDER_STEPS = 40;

const count = (lines: ReadonlyArray<ReadonlyArray<PlanPoint>>): number => lines.reduce((a, l) => a + l.length, 0);

export function planPoints(plan: TownPlan): number {
  return (
    (plan.wall?.length ?? 0) + count(plan.streets) + count(plan.blocks) + plan.landmarks.length + plan.gates.length
  );
}

export function withinBudget(plan: TownPlan): TownPlan {
  const rest = planPoints(plan) - count(plan.blocks);
  if (rest + count(plan.blocks) <= PLAN_POINTS) return plan;
  let blocks = plan.blocks;
  for (let k = 1; k <= LADDER_STEPS && rest + count(blocks) > PLAN_POINTS; k++) {
    const tolerance = BLOCK_TOLERANCE + k * LADDER_STEP;
    blocks = plan.blocks.map((b) => simplify(b, tolerance, true));
  }
  return { ...plan, blocks };
}
