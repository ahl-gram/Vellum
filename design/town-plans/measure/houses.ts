// Issue #793 round: how many houses each kind's plan stands, both street systems, over every settlement of seeds 42, 7 and 19 (the bytes.ts worlds). Run: node out/793/measure/houses.ts
import { defaultRecipe, generateWorld } from "../../../src/world/generate.ts";
import { buildProspectInput } from "../../../src/prospect/input.ts";
import { planTown } from "../planner/plan.ts";
import { housesOf } from "../mock/houses.ts";
const tally = new Map<string, number[]>();
for (const seed of [42, 7, 19]) {
  const world = generateWorld(defaultRecipe(seed));
  for (let i = 0; i < world.settlements.length; i++) {
    const kind = buildProspectInput(world, i).kind as "capital" | "seat" | "town" | "village";
    for (const dir of ["land", "grid"] as const) {
      const plan = planTown(world, i, dir);
      for (const detail of ["full", "lean"] as const) {
        const n = housesOf(plan, kind, detail).length;
        tally.set(`${kind} ${dir} ${detail}`, [...(tally.get(`${kind} ${dir} ${detail}`) ?? []), n]);
      }
    }
  }
}
for (const [k, xs] of [...tally].sort()) console.log(`${k}: ${xs.length} plans, houses mean ${(xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(0)} min ${Math.min(...xs)} max ${Math.max(...xs)}`);
