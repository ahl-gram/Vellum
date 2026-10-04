import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { buildProspectInput } from "../../src/prospect/input.ts";
import { moundRise } from "../../src/prospect/ground.ts";
import { treatmentFor } from "../../src/prospect/foreground.ts";

const from = Number(process.argv[2] ?? 1);
const to = Number(process.argv[3] ?? 40);
for (let seed = from; seed <= to; seed++) {
  const w = generateWorld(defaultRecipe(seed));
  w.settlements.forEach((_, i) => {
    const p = buildProspectInput(w, i);
    const inland = !p.harbor;
    const hill = moundRise(p.siteRel) > 0;
    const bridge = !p.harbor && p.onRiver && (p.kind === "capital" || p.kind === "seat" || p.kind === "town");
    if (inland || hill || p.ruined) {
      console.log(
        seed, i, p.name, p.kind, "harbor", p.harbor, "river", p.onRiver, "siteRel", p.siteRel.toFixed(3),
        "mound", moundRise(p.siteRel).toFixed(1), "treat", treatmentFor(p.foreground), "ruined", p.ruined, p.ruinedYear,
        inland ? "INLAND" : "", hill ? "HILL" : "", bridge ? "BRIDGE" : "",
      );
    }
  });
}
