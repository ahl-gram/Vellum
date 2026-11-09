// Issue #1155 round: the measurement behind every seed a rung names. For each seed, the world the seed draws on its own (no overrides) and what a rung needs of it: its map type and climate, whether it conjures a sea beast, how many realms bear arms, how many places a road reaches, and whether the capital has a road (the Print Room's road plate and the Ribbon).
// node out/1155/mock/sweep-seeds.ts <from> <to> > <out.tsv>
import { defaultRecipe, generateWorld } from "../../../src/world/generate.ts";
import { roadMask, roadReachable } from "../../../src/itinerary/route.ts";

const from = Number(process.argv[2] ?? 1);
const to = Number(process.argv[3] ?? 60);
const cols = ["seed", "type", "band", "culture", "title", "capital", "settlements", "roads", "realms", "arms", "beasts", "beast", "placesWithRoad", "capitalRoad", "ruins", "rivers", "lakes", "range", "forest"];
console.log(cols.join("\t"));
for (let seed = from; seed <= to; seed++) {
  const w = generateWorld(defaultRecipe(seed));
  const mask = roadMask(w);
  const reach = w.settlements.map((_, i) => roadReachable(w, mask, i).length > 0);
  const cap = w.settlements.findIndex((s) => s.kind === "capital");
  const row = [
    seed,
    w.recipe.mapType,
    w.recipe.band,
    w.culture.id,
    w.title.title,
    cap >= 0 ? w.settlements[cap]!.name : "",
    w.settlements.length,
    w.roads.length,
    w.names.realms.length,
    w.arms.length,
    w.beasts.length,
    w.beasts.map((b) => `${b.name} ${b.epithet}`).join("; "),
    reach.filter(Boolean).length,
    cap >= 0 && reach[cap] ? "yes" : "no",
    w.settlements.filter((s) => s.ruined).length,
    w.rivers.length,
    w.names.lakes.length,
    w.names.range ?? "",
    w.names.forest ?? "",
  ];
  console.log(row.join("\t"));
}
