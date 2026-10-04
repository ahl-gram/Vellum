import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { buildProspectInput } from "../../src/prospect/input.ts";
import { treatmentFor } from "../../src/prospect/foreground.ts";

const seed = Number(process.argv[2] ?? 42);
const w = generateWorld(defaultRecipe(seed));
console.log("title", JSON.stringify(w.title), "sea", w.names.sea, "realms", JSON.stringify(w.names.realms), "culture", w.culture.id);
w.settlements.forEach((s, i) => {
  const p = buildProspectInput(w, i);
  const ridgeMax = Math.max(...p.backdrop.map((v) => v - p.siteRel));
  console.log(
    i, p.name, p.kind, "score", p.score.toFixed(2), "harbor", p.harbor, "river", p.onRiver,
    "siteRel", p.siteRel.toFixed(3), "founded", p.founded, "ruined", p.ruined, p.ruinedYear,
    "realm", p.realmName, "treat", treatmentFor(p.foreground), "ridgeMax", ridgeMax.toFixed(3),
    "view", p.view.dx.toFixed(2), p.view.dy.toFixed(2),
  );
});
console.log("events", w.history.events.length);
for (const e of w.history.events) console.log(" ", e.year, e.kind, e.settlement ?? "", e.text);
