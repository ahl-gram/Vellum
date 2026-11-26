// Issue #793 round: how much wider today's plate draws a town than the land it stands on: today's run (the x reach of composeTownscape's masses and walls) against the plan's wall or blocks seen across the view at the transect's own scale (474 px for 64 cells), over every settlement of seeds 42, 7 and 19. Run: node out/793/measure/widths.ts
import { defaultRecipe, generateWorld } from "../../../src/world/generate.ts";
import { buildProspectInput } from "../../../src/prospect/input.ts";
import { planTown } from "../planner/plan.ts";
import { planGeometry } from "../mock/profile.ts";
const ratios = new Map<string, number[]>();
for (const seed of [42, 7, 19]) {
  const w = generateWorld(defaultRecipe(seed));
  for (let i = 0; i < w.settlements.length; i++) {
    const kind = buildProspectInput(w, i).kind as "capital" | "seat" | "town" | "village";
    const plan = planTown(w, i, "land");
    const today = planGeometry(w, i, plan, kind, "today", "closed");
    const truth = planGeometry(w, i, plan, kind, "true", "closed");
    const r = (today.run[1] - today.run[0]) / (truth.run[1] - truth.run[0]);
    ratios.set(kind, [...(ratios.get(kind) ?? []), r]);
  }
}
for (const [k, xs] of ratios) { const s = [...xs].sort((a, b) => a - b); console.log(`${k}: ${xs.length} places, today's width over the land's own: median ${s[s.length >> 1]!.toFixed(2)} min ${s[0]!.toFixed(2)} max ${s[s.length - 1]!.toFixed(2)}`); }
