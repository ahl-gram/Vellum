// Issue #793 round: how old each kind is against its world's capital, over seeds 1 to 40 and 42, for the menu's "by age" option. Run: node out/793/measure/founding.ts
import { defaultRecipe, generateWorld } from "../../../src/world/generate.ts";
import { buildProspectInput } from "../../../src/prospect/input.ts";
const gaps = new Map<string, number[]>();
for (const seed of [...Array.from({ length: 40 }, (_, i) => i + 1), 42]) {
  const w = generateWorld(defaultRecipe(seed));
  const cap = w.settlements.find((s) => s.kind === "capital")!;
  w.settlements.forEach((s, i) => {
    const k = buildProspectInput(w, i).kind;
    gaps.set(k, [...(gaps.get(k) ?? []), s.founded - cap.founded]);
  });
  if (seed === 42 || seed === 7) console.log(`seed ${seed}: capital founded ${cap.founded}, chart year ${w.title.year}; founded years ${w.settlements.slice(0, 10).map((s) => `${s.name} ${s.founded}`).join(", ")}`);
}
const q = (xs: number[], p: number) => [...xs].sort((a, b) => a - b)[Math.floor((xs.length - 1) * p)]!;
for (const [k, xs] of gaps) console.log(`${k}: years after the capital's founding: min ${Math.min(...xs)} p25 ${q(xs, 0.25)} median ${q(xs, 0.5)} p75 ${q(xs, 0.75)} max ${Math.max(...xs)}; founded within 100 years of it ${xs.filter((x) => x <= 100).length} of ${xs.length}`);
