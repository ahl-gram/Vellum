// The #494 round's real content for chart 42: the prospect of the capital, the road unrolled from it, the atlas's plate roster, and small plates for the slip's thumbnails (SVG to out/, rasterized by thumbs.mjs).
import { writeFileSync, mkdirSync } from "node:fs";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { createRng } from "../../src/core/rng.ts";
import { createLoreWriter } from "../../src/society/lore.ts";
import { capitalBlurb } from "../../src/world/seed-of-the-day.ts";
import { STYLES } from "../../src/render/style.ts";
import { buildProspectInput } from "../../src/prospect/input.ts";
import { composeProspect } from "../../src/prospect/compose.ts";
import { eraFor, plateCaption } from "../../src/prospect/caption.ts";
import { plateKey } from "../../src/prospect/key.ts";
import { prospectPlate } from "../../src/prospect/finished.ts";
import { ribbonResultFor } from "../../src/site/explorer/ribbon-job.ts";
import { buildRibbonInput } from "../../src/itinerary/input.ts";
import { eventCaption, ribbonTitle } from "../../src/itinerary/prose.ts";
import { composeAtlas } from "../../src/atlas/compose.ts";

const seed = 42;
const here = new URL(".", import.meta.url);
const out = new URL("../../out/494-plates/", import.meta.url);
mkdirSync(out, { recursive: true });
const world = generateWorld(defaultRecipe(seed));
const capitalIdx = world.settlements.findIndex((s) => s.kind === "capital");
const capital = world.settlements[capitalIdx]!;
const lore = createLoreWriter(world, createRng(seed).fork("seed-of-the-day"));

const pInput = buildProspectInput(world, capitalIdx);
const era = eraFor(pInput, world.title.year);
const g = composeProspect(pInput);
const caption = plateCaption(pInput, g, era, world.title.year, world.names.sea);
writeFileSync(new URL("prospect-42-antique.svg", here), prospectPlate(world, capitalIdx, STYLES.antique, world.title.year));

const ribbon = ribbonResultFor(world, { from: null, to: null, dress: "antique" });
writeFileSync(new URL("ribbon-42-antique.svg", here), ribbon.svg);
const rInput = buildRibbonInput(world, ribbon.fromIdx, ribbon.toIdx)!;
const rng = createRng(seed).fork(`ribbon-${ribbon.fromIdx}-${ribbon.toIdx}`);

const atlas = composeAtlas(world, { width: 600 });
const plates = [atlas.hero, ...atlas.draughtings, ...atlas.themes, ...atlas.regions, ...atlas.prospects];
for (const p of plates) writeFileSync(new URL(`${p.key}.svg`, out), p.svg);

writeFileSync(new URL("plates.json", here), JSON.stringify({
  title: world.title,
  capital: { name: capital.name, note: capitalBlurb(capital, lore.settlementNote(capital)) },
  prospect: { caption, key: plateKey(g).map((k) => ({ letter: k.letter, label: k.label })), era, kind: pInput.kind, founded: pInput.founded },
  ribbon: {
    from: ribbon.fromName, to: ribbon.toName, leagues: ribbon.leagues, year: rInput.year, realm: rInput.realmName,
    heading: ribbonTitle(rInput),
    events: rInput.events.map((e) => ({ kind: e.kind, leagues: e.dist / (rInput.totalCells / rInput.totalLeagues), text: eventCaption(e, rng), ...("tier" in e ? { tier: e.tier } : {}) })),
    options: ribbon.options.filter((o) => o.i === ribbon.fromIdx || ribbon.reachable.includes(o.i)).map((o) => ({ name: o.name, kind: o.kind })),
  },
  atlas: {
    hero: atlas.hero.title,
    draughtings: atlas.draughtings.map((p) => p.title), themes: atlas.themes.map((p) => p.title),
    regions: atlas.regions.map((p) => p.title), prospects: atlas.prospects.map((p) => p.title),
    plateKeys: plates.map((p) => p.key),
    figures: plates.length + (atlas.bannersHtml.match(/<figure/g) ?? []).length,
    banners: (atlas.bannersHtml.match(/<figure/g) ?? []).length,
    chronicleEntries: (atlas.chronicleHtml.match(/<li/g) ?? []).length,
    gazetteerRows: (atlas.gazetteerHtml.match(/<tr/g) ?? []).length - 1,
  },
}, null, 1));
console.log("wrote", plates.length, "plates to out/494-plates/, prospect + ribbon + plates.json beside the templates");
