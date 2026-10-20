// Issue #849, the designer's own additions (flagged in notes.md): every shipped dress for one shaped and one counted
// world, and the shapes and counts at the sizes the site's other surfaces show a whole sheet.
// Run from the tree after build.ts and pages.ts: node out/844/mock/extras.ts
import { readFileSync, writeFileSync } from "node:fs";
import type { StyleName } from "../../../src/render/style.ts";
import { countCases, shapeCases, type Case, type Dir } from "./cases.ts";
import { buildWorld, recipeFor, renderWorld } from "./sheets.ts";
import type { Plate } from "./build.ts";

const OUT = "/Users/ahl/CodeProjects/Vellum/out/844";
const STYLES: ReadonlyArray<StyleName> = ["antique", "topographic", "ink", "nautical"];
// Measured on the live built pages at 581a6de3 (out/844/measurements/gallery-*.png and explorer/width-sweep-result.json), save the drawer, which is read from its sheet.
const SIZES = [
  { w: 537, what: "the Explorer's whole sheet at 1024 by 900, measured on the live page" },
  { w: 382, what: "a gallery card at 1280, measured on the live gallery (461 at 1024, 435 at 1440)" },
  { w: 170, what: "a cutting in the Chart Table's drawer: `flex: 0 1 10.6rem` in src/styles/explorer/chart-drawer.css, read from the sheet, not measured live" },
] as const;

const facts = JSON.parse(readFileSync(`${OUT}/facts.json`, "utf8")) as { plates: Plate[] };
const plate = (caseSlug: string, dir: string): Plate => facts.plates.find((p) => p.caseSlug === caseSlug && p.dir === dir) as Plate;
const all = [...shapeCases(), ...countCases()];
const find = (slug: string, dir: string): { c: Case; d: Dir } => {
  const c = all.find((x) => x.slug === slug) as Case;
  return { c, d: c.dirs.find((x) => x.key === dir) as Dir };
};

const texasCase = all.find((c) => c.group === "shape" && c.primary && c.slug.startsWith("texas-")) as Case;
const countCase = all.find((c) => c.group === "count" && c.primary) as Case;
const dressRows: Array<{ label: string; files: string[] }> = [];
for (const [slug, dir] of [[texasCase.slug, "soft"], [texasCase.slug, "hard"], [countCase.slug, "n20-equal-sunk"]] as const) {
  const { c, d } = find(slug, dir);
  const recipe = recipeFor(c.seed, { mapType: c.mapType });
  const w = buildWorld(recipe, "spike", { seed: c.seed, mapType: c.mapType, edge: d.edge });
  const files = STYLES.map((s) => {
    const f = `dress--${slug}--${dir}--${s}.svg`;
    writeFileSync(`${OUT}/svg/${f}`, renderWorld(w, s));
    return f;
  });
  dressRows.push({ label: `${d.label}, ${c.title}`, files });
}

const head = (title: string): string => `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${title}</title><link rel="stylesheet" href="../../../design/kit/fonts.css"><style>body{margin:0;background:#2b2118;color:#f2e8cf;font-family:'EB Garamond','Iowan Old Style',Georgia,serif}h1{font-family:'IM Fell English SC','Iowan Old Style',Georgia,serif;font-weight:400;font-size:27px;margin:16px 22px 2px}.lede{font-family:'IM Fell English','Iowan Old Style',Georgia,serif;font-style:italic;font-size:16px;color:#e3d3ad;margin:2px 22px 10px}h2{font-weight:400;font-size:16px;margin:14px 22px 6px}.cells{display:flex;gap:14px;align-items:flex-start;margin:0 22px 8px}figure{margin:0}img{display:block;background:#f2e8cf;box-shadow:0 4px 14px rgba(0,0,0,.45)}figcaption{font-size:12.5px;color:#dccb9f;margin-top:4px}</style><body>`;
const src = (f: string): string => `../svg/${encodeURIComponent(f)}`;
const H = (w: number): number => Math.round((1158 * w) / 1500);

const dressW = 400;
writeFileSync(`${OUT}/pages/dresses.html`, `${head("Every dress")}<h1>Issue #849 &middot; every shipped dress</h1><p class="lede">The four styles the Explorer ships, on the Texas soft likeness and cut-out and on a counted archipelago (asked 20, sunk). A style is a palette over identical geometry: ink and nautical carry no realm tint, so these show whether a shape still reads when the tint goes. Drawn at 581a6de3 by the spike.</p>${dressRows.map((r) => `<h2>${r.label}</h2><div class="cells">${r.files.map((f, i) => `<figure><img src="${src(f)}" width="${dressW}" height="${H(dressW)}" alt=""><figcaption>${STYLES[i]}</figcaption></figure>`).join("")}</div>`).join("")}</body></html>`);

const smallPlates = [
  plate(texasCase.slug, "control"),
  plate(texasCase.slug, "soft"),
  plate(texasCase.slug, "hard"),
  plate(countCase.slug, "control"),
  plate(countCase.slug, "n20-equal-sunk"),
  plate(countCase.slug, "n100-equal-sunk"),
];
writeFileSync(
  `${OUT}/pages/small.html`,
  `${head("Small sizes")}<h1>Issue #849 &middot; at the sizes the site shows a whole sheet</h1><p class="lede">A shape that reads full width and turns to mud small has not been drawn yet. Antique world sheets, each row one size.</p>${SIZES.map((s) => `<h2>${s.w} px wide: ${s.what}</h2><div class="cells">${smallPlates.map((p) => `<figure><img src="${src(p.files["world-antique"] as string)}" width="${s.w}" height="${H(s.w)}" alt=""><figcaption style="max-width:${Math.max(s.w, 150)}px">${p.label}${p.asked ? "" : ""}</figcaption></figure>`).join("")}</div>`).join("")}</body></html>`,
);

const PROBE = "document.documentElement.scrollWidth";
const smallW = 44 + 6 * 537 + 5 * 14;
const shots = [
  { url: "/out/844/pages/dresses.html", width: 44 + 4 * dressW + 3 * 14, height: 900, mobile: false, out: `${OUT}/sheet-every-dress.png`, waitMs: 2500, full: true, probe: PROBE },
  { url: "/out/844/pages/small.html", width: smallW, height: 900, mobile: false, out: `${OUT}/sheet-small-sizes.png`, waitMs: 2500, full: true, probe: PROBE },
];
writeFileSync(`${OUT}/pages/extras-shots.json`, JSON.stringify(shots, null, 1));
console.log(`wrote dresses.html, small.html and ${shots.length} shots`);
