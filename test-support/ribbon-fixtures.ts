import { buildRibbonInput, type RibbonInput } from "../src/itinerary/input.ts";
import { roadMask, roadReachable } from "../src/itinerary/route.ts";
import type { World } from "../src/world/types.ts";

export function capitalJourneys(world: World): RibbonInput[] {
  const mask = roadMask(world);
  const capital = world.settlements.findIndex((s) => s.kind === "capital");
  return roadReachable(world, mask, capital)
    .map((to) => buildRibbonInput(world, capital, to))
    .filter((i): i is RibbonInput => i !== null);
}

export function namedJourney(world: World, from: string, to: string): RibbonInput {
  const a = world.settlements.findIndex((s) => s.name === from);
  const b = world.settlements.findIndex((s) => s.name === to);
  if (a < 0) throw new Error(`namedJourney: no settlement named ${from} on seed ${world.recipe.seed}`);
  if (b < 0) throw new Error(`namedJourney: no settlement named ${to} on seed ${world.recipe.seed}`);
  const input = buildRibbonInput(world, a, b);
  if (input === null) throw new Error(`namedJourney: no road from ${from} to ${to} on seed ${world.recipe.seed}`);
  return input;
}
