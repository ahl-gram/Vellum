// Issue #793 round: the planner's plan, twice, from two freshly generated worlds of the same seed, both street systems, compared as JSON (the shape of the plan's TP1). Exits 1 on any difference. Run: node out/793/measure/determinism.ts
import { defaultRecipe, generateWorld } from "../../../src/world/generate.ts";
import { planTown } from "../planner/plan.ts";
let compared = 0,
  differ = 0;
for (const seed of [42, 7, 1, 30]) {
  const a = generateWorld(defaultRecipe(seed)),
    b = generateWorld(defaultRecipe(seed));
  for (let i = 0; i < a.settlements.length; i++)
    for (const dir of ["land", "grid"] as const) {
      const pa = JSON.stringify(planTown(a, i, dir));
      planTown(a, (i + 1) % a.settlements.length, dir);
      const pb = JSON.stringify(planTown(b, i, dir));
      compared++;
      if (pa !== pb) {
        differ++;
        console.log(`seed ${seed} index ${i} ${dir}: the two plans differ`);
      }
    }
}
console.log(`${compared} plans compared across two fresh worlds per seed, another plan drawn between each pair; ${differ} differ`);
if (differ > 0) process.exitCode = 1;
