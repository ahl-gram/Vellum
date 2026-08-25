import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { buildPlaceManifest } from "../../src/render/place-manifest.ts";
import { writeFileSync } from "node:fs";

const world = generateWorld(defaultRecipe(42));
const m = buildPlaceManifest(world, 1200);
const out = {
  title: world.title,
  presentYear: m.presentYear,
  widthPx: m.widthPx,
  heightPx: m.heightPx,
  realms: world.realms.names,
  places: m.places.map(p => ({
    name: p.name, kind: p.kind, founded: p.founded,
    ruined: p.ruined, seat: p.seat,
    nx: +p.nx.toFixed(4), ny: +p.ny.toFixed(4),
  })),
};
writeFileSync("out/atelier-map/places-42.json", JSON.stringify(out, null, 1));
console.log(world.title, m.places.length, "places, sheet", m.widthPx, "x", m.heightPx);
