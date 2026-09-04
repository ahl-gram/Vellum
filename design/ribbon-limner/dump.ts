// Dumps chart 42's default ribbon (the capital to the farthest roaded town) as the current plate plus the
// geometry the limner mockups draw on: strip frames, road points, samples, seated events, the realm's arms.
import { writeFileSync } from "node:fs";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { createRng } from "../../src/core/rng.ts";
import { STYLES } from "../../src/render/style.ts";
import { ribbonResultFor } from "../../src/site/explorer/ribbon-job.ts";
import { buildRibbonInput } from "../../src/itinerary/input.ts";
import { eventCaption, ribbonTitle, tierTag } from "../../src/itinerary/prose.ts";
import { layoutRibbon, stripPos } from "../../src/itinerary/dress/layout.ts";
import { CELLS_PER_LEAGUE } from "../../src/render/layers/scalebar.ts";
import { BIOMES } from "../../src/climate/biomes.ts";
import { armsSvgDocument, paletteForStyle } from "../../src/render/layers/heraldry.ts";

const seed = Number(process.argv[2] ?? 42);
const here = new URL(".", import.meta.url);
const world = generateWorld(defaultRecipe(seed));
for (const dress of ["antique", "ink"] as const) {
  const r = ribbonResultFor(world, { from: null, to: null, dress });
  writeFileSync(new URL(`current-${seed}-${dress}.svg`, here), r.svg);
}
const ribbon = ribbonResultFor(world, { from: null, to: null, dress: "antique" });
const input = buildRibbonInput(world, ribbon.fromIdx, ribbon.toIdx)!;
const rng = createRng(seed).fork(`ribbon-${ribbon.fromIdx}-${ribbon.toIdx}`);
const layout = layoutRibbon(input);
const biomeNames = Object.fromEntries(Object.entries(BIOMES).map(([k, v]) => [v, k]));

const to = world.settlements[ribbon.toIdx]!;
const from = world.settlements[ribbon.fromIdx]!;
const w = world.elev.w;
const realmTo = world.realms.labels[to.x + to.y * w] ?? -1;
const realmFrom = world.realms.labels[from.x + from.y * w] ?? -1;
const pal = paletteForStyle(STYLES.antique);
if (realmTo >= 0) writeFileSync(new URL(`arms-${seed}-to.svg`, here), armsSvgDocument(world.arms[realmTo]!, 120, pal, "to"));
if (realmFrom >= 0) writeFileSync(new URL(`arms-${seed}-from.svg`, here), armsSvgDocument(world.arms[realmFrom]!, 120, pal, "from"));

const out = {
  seed, cellsPerLeague: CELLS_PER_LEAGUE,
  title: ribbonTitle(input), worldName: input.worldName, year: input.year, realm: input.realmName,
  realmFrom: realmFrom >= 0 ? world.names.realms[realmFrom] : null,
  realmTo: realmTo >= 0 ? world.names.realms[realmTo] : null,
  from: input.fromName, to: input.toName, leagues: input.totalLeagues, totalCells: input.totalCells,
  strips: layout.strips.map((s) => ({
    index: s.index, x0: s.x0, y0: s.y0, w: s.w, h: s.h, d0: s.d0, d1: s.d1, needleDeg: s.needleDeg, lean: s.lean, pxPerCell: s.pxPerCell,
    pts: s.pts.map((p) => [Math.round(p.sx * 10) / 10, Math.round(p.sy * 10) / 10, Math.round(p.dist * 100) / 100]),
    samples: s.samples.map((p) => ({ dist: Math.round(p.dist * 100) / 100, rel: p.rel, relL: p.relL, relR: p.relR, bl: biomeNames[p.biomeL], br: biomeNames[p.biomeR] })),
  })),
  events: input.events.map((e) => {
    const strip = layout.strips.find((s) => e.dist >= s.d0 && e.dist < s.d1) ?? null;
    const seat = strip ? stripPos(strip, e.dist) : null;
    return { ...e, caption: eventCaption(e, rng), tierTag: "tier" in e ? tierTag(e.tier) : null, strip: strip?.index ?? null, sx: seat?.sx ?? null, sy: seat?.sy ?? null, leagues: e.dist / CELLS_PER_LEAGUE };
  }),
};
writeFileSync(new URL(`ribbon-${seed}.json`, here), JSON.stringify(out, null, 1));
console.log(`${input.fromName} -> ${input.toName}, ${Math.round(input.totalLeagues)} leagues, ${layout.strips.length} strips, ${input.events.length} events, realms ${out.realmFrom} -> ${out.realmTo}`);
