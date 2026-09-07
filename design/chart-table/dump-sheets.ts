// Sub 0 of the Chart Table (#518): the real seed-42 sheets the mockups are drawn from, through the same inputs the region job takes (RegionJob in src/site/explorer/worker-client.ts, dispatched by lod-controller.ts) and the prospect plate takes (src/prospect/finished.ts). Writes the SVGs and thumbnail wrappers to sheets-42/ beside this file, plus sheets.json; shoot.mjs rasterizes the wrappers (see the README).
import { writeFileSync, mkdirSync } from "node:fs";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld, regionDetailLevel, regionTitle } from "../../src/world/region.ts";
import { LOD_BANDS, quantizeCenter, lodWindowFor } from "../../src/world/lod.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { STYLES } from "../../src/render/style.ts";
import type { StyleName } from "../../src/render/style.ts";
import { prospectPlate } from "../../src/prospect/finished.ts";
import { plateDressFor } from "../../src/prospect/dress/context.ts";
import { buildProspectInput } from "../../src/prospect/input.ts";
import { composeProspect } from "../../src/prospect/compose.ts";
import { eraFor, plateCaption } from "../../src/prospect/caption.ts";
import { buildPlaceManifest } from "../../src/render/place-manifest.ts";
import { composePlaceCard } from "../../src/render/place-card.ts";

const seed = 42;
const out = new URL("sheets-42/", import.meta.url);
mkdirSync(out, { recursive: true });
const world = generateWorld(defaultRecipe(seed));
const year = world.title.year;
const gridW = world.recipe.gridW, gridH = world.recipe.gridH;

const byKind = (kind: string) => world.settlements.map((s, i) => ({ s, i })).filter((x) => x.s.kind === kind);
const capital = byKind("capital")[0]!;
const towns = byKind("town");
const villages = byKind("village");
const town1 = towns[0]!, town2 = towns[1] ?? towns[0]!, village = villages[Math.floor(villages.length / 2)] ?? towns[2]!;

const render = { widthPx: 1500, legend: true, arms: false, beasts: false } as const;
const world15 = generateWorld(defaultRecipe(15));

function survey(key: string, at: { x: number; y: number }, band: number, style: StyleName, of = world, ofSeed = seed) {
  const gw = of.recipe.gridW, gh = of.recipe.gridH;
  const size = LOD_BANDS[band]!.sizeUV;
  const q = quantizeCenter(at.x / (gw - 1), at.y / (gh - 1), size);
  const window = lodWindowFor(q.cx, q.cy, size);
  const title = regionTitle(of, window);
  const spec = { window, gridW: LOD_BANDS[band]!.gridW, gridH: LOD_BANDS[band]!.gridH, title, detail: true };
  const region = generateRegionWorld(of, spec);
  const svg = renderMap(region, { ...render, style, regionRecipe: { window, worldGridW: gw, detail: regionDetailLevel(spec) } });
  writeFileSync(new URL(`${key}.svg`, out), svg);
  return { key, kind: "survey", dress: style, band, title, window, seed: ofSeed, chart: of.title.title, year: of.title.year, w: 1500, h: 1157.93 };
}

function prospect(key: string, idx: number, style: StyleName) {
  const input = buildProspectInput(world, idx);
  const g = composeProspect(input);
  const cap = plateCaption(input, g, eraFor(input, year), year, world.names.sea);
  const svg = prospectPlate(world, idx, STYLES[style], year);
  writeFileSync(new URL(`${key}.svg`, out), svg);
  return { key, kind: "prospect", dress: plateDressFor(style), idx, title: cap.title, epithet: cap.epithet, yearLine: cap.yearLine, name: world.settlements[idx]!.name, seed, chart: world.title.title, year, w: 520, h: 384 };
}

writeFileSync(new URL("world-antique.svg", out), renderMap(world, { ...render, style: "antique" }));
const sheets = [
  survey("stage-band2-capital-antique", capital.s, 2, "antique"),
  survey("band1-capital-antique", capital.s, 1, "antique"),
  survey("band3-village-antique", village.s, 3, "antique"),
  // every collectible survey is antique: the redraft is gated on the antique dress (regionEligible), so no ink or nautical survey can reach the table
  survey("band2-town-antique", town1.s, 2, "antique"),
  prospect("prospect-town-ink", town1.i, "ink"),
  prospect("prospect-capital-antique", capital.i, "antique"),
  // ruling 4 on #401 (different worlds allowed, drafted grouped by world) needs a second world on the folio page: seed 15, #511's own second seed.
  survey("band2-capital15-antique", world15.settlements.find((s) => s.kind === "capital")!, 2, "antique", world15, 15),
];
for (const s of [...sheets, { key: "world-antique", w: 1500, h: 1157.93 }]) {
  const svg = new URL(`${s.key}.svg`, out);
  const data = "data:image/svg+xml;base64," + Buffer.from(await import("node:fs").then((m) => m.readFileSync(svg))).toString("base64");
  writeFileSync(new URL(`${s.key}.thumb.html`, out), `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#3d2f1f}img{display:block;width:420px;height:auto}</style><img src="${data}">`);
}
const manifest = buildPlaceManifest(world, 1500);
const capitalMark = manifest.places.find((p) => p.idx === capital.i);
writeFileSync(new URL("sheets.json", import.meta.url), JSON.stringify({
  title: world.title, title15: world15.title, capital: { name: capital.s.name, idx: capital.i, mark: capitalMark, card: composePlaceCard(capitalMark!, manifest.events, manifest.cultureId) }, town: { name: town1.s.name, idx: town1.i }, sheets,
}, null, 1));
console.log("wrote", sheets.length, "sheets to sheets-42/;", sheets.map((s) => `${s.key}: ${s.title}`).join("; "));
