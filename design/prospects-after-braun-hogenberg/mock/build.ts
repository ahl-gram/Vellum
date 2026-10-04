// Renders every direction for every place in both dresses into the main checkout's out/747/stills/, writes the contact sheets and the small-size page, and the shot list for scripts/design/shoot.ts. OUT_ROOT is absolute on purpose: the code may run from a worktree while the stills land where Alex looks.
import { mkdirSync, writeFileSync } from "node:fs";
import { STYLES } from "../../../src/render/style.ts";
import { finishedPlateSvg } from "../../../src/prospect/finished.ts";
import { sceneFor, type Scene } from "./data.ts";
import { ANTIQUE_COLOURED, INK, type Dress } from "./dress.ts";
import { plateA } from "./direction-a.ts";
import { plateB, plateD, plateE } from "./direction-rise.ts";
import { plateC } from "./direction-c.ts";

export const OUT_ROOT = process.env["OUT_747"] ?? "/Users/ahl/CodeProjects/Vellum/out/747/";
const STILLS = `${OUT_ROOT}stills/`;
const SHEETS = `${OUT_ROOT}mock/sheets/`;
mkdirSync(STILLS, { recursive: true });
mkdirSync(SHEETS, { recursive: true });

export const PLACES = [
  { seed: 42, index: 0, slug: "capital-laukuwelua", title: "Laukuwelua, the capital (seed 42)" },
  { seed: 42, index: 4, slug: "town-nailo", title: "Nailo, a harbour town on the strand (seed 42)" },
  { seed: 42, index: 10, slug: "village-lokai", title: "Lokai, a fisher village under the pines (seed 42)" },
  { seed: 42, index: 22, slug: "ruin-homaitani", title: "Homaitani, a village ruined in 1039 (seed 42)" },
  { seed: 26, index: 22, slug: "hill-voorea", title: "Voorea, the only inland hill village in seeds 1 to 40 (seed 26)" },
  { seed: 42, index: 0, slug: "capital-laukuwelua-an400", title: "Laukuwelua before its founding, An. 400 (seed 42)", year: 400 },
] as const;

const DIRECTIONS = [
  { key: "control", name: "Today's plate (the control)", render: (d: Dress, s: Scene) => finishedPlateSvg(s.input, STYLES[d.key], s.year, { seaName: s.seaName }) },
  { key: "a", name: "A. The engraver's burin", render: plateA },
  { key: "b", name: "B. From the rise", render: plateB },
  { key: "c", name: "C. The bird's-eye", render: plateC },
  { key: "d", name: "D. The named plate", render: plateD },
  { key: "e", name: "E. After Hoefnagel (B + A + D, the recommendation)", render: plateE },
] as const;

const DRESSES: ReadonlyArray<{ key: string; name: string; dress: Dress }> = [
  { key: "antique", name: "antique, hand-coloured", dress: ANTIQUE_COLOURED },
  { key: "ink", name: "ink", dress: INK },
];

type Row = { place: string; dir: string; dress: string; file: string; bytes: number; ms: number };
const rows: Row[] = [];

for (const p of PLACES) {
  const scene = sceneFor(p.seed, p.index, "year" in p ? p.year : undefined);
  for (const dir of DIRECTIONS) {
    for (const dr of DRESSES) {
      const t0 = performance.now();
      const svg = dir.render(dr.dress, scene);
      const ms = performance.now() - t0;
      const file = `${dir.key}-${p.slug}-${dr.key}.svg`;
      writeFileSync(`${STILLS}${file}`, svg);
      rows.push({ place: p.slug, dir: dir.key, dress: dr.key, file, bytes: Buffer.byteLength(svg), ms });
    }
  }
}

const css = `body{margin:0;background:#2b2118;font-family:'EB Garamond','Iowan Old Style',Georgia,serif;color:#f2e8cf}
h1{font-size:22px;font-weight:400;margin:14px 20px 4px}h2{font-size:15px;font-weight:400;margin:10px 20px 4px;color:#d9c8a0}
.grid{display:grid;grid-template-columns:repeat(3,520px);gap:14px 18px;padding:6px 20px 18px}
figure{margin:0}figcaption{font-size:13px;margin:4px 0 0;color:#d9c8a0}img{display:block;width:520px;height:384px;background:#f2e8cf;box-shadow:0 6px 18px rgba(0,0,0,.5)}
.small .grid{grid-template-columns:repeat(6,1fr)}.small img{width:100%;height:auto}`;

for (const p of PLACES) {
  const blocks = DRESSES.map((dr) => `<h2>${dr.name}</h2><div class="grid">${DIRECTIONS.map((dir) => `<figure><img src="../../stills/${dir.key}-${p.slug}-${dr.key}.svg" alt=""><figcaption>${dir.name}</figcaption></figure>`).join("")}</div>`).join("");
  writeFileSync(`${SHEETS}${p.slug}.html`, `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${p.slug}</title><style>${css}</style><h1>Issue #747, ${p.title}</h1>${blocks}`);
}

const smallSizes = [352, 160];
const small = smallSizes.map((w) => `<h2>${w}px wide (${w === 352 ? "the prospect page's folio column, 22rem, as a proxy for the Reading Room stage" : "an inset or place-mark card"})</h2><div class="grid" style="grid-template-columns:repeat(6,${w}px)">${DIRECTIONS.map((dir) => `<figure><img style="width:${w}px;height:${Math.round((w * 384) / 520)}px" src="../../stills/${dir.key}-capital-laukuwelua-antique.svg" alt=""><figcaption>${dir.name}</figcaption></figure>`).join("")}</div>`).join("");
writeFileSync(`${SHEETS}small.html`, `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>small</title><style>${css}</style><h1>Issue #747, the capital at the sizes the surfaces show a plate</h1>${small}`);

writeFileSync(`${SHEETS}plate.html`, `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>plate</title><style>body{margin:0;background:#f2e8cf}img{display:block}</style><img id="p" alt=""><script>const q=new URLSearchParams(location.search);const i=document.getElementById('p');i.src='../../stills/'+q.get('f');i.style.width=(q.get('w')||'1040')+'px';</script>`);

const shots: unknown[] = [];
for (const p of PLACES) shots.push({ url: `/mock/sheets/${p.slug}.html`, width: 1660, height: 900, mobile: false, out: `${STILLS}sheet-${p.slug}.png`, full: true, waitMs: 1800 });
shots.push({ url: "/mock/sheets/small.html", width: 2200, height: 700, mobile: false, out: `${STILLS}sheet-small-sizes.png`, full: true, waitMs: 1800 });
for (const dir of ["control", "a", "b", "c", "d", "e"]) {
  for (const dr of ["antique", "ink"]) {
    shots.push({ url: `/mock/sheets/plate.html?f=${dir}-capital-laukuwelua-${dr}.svg&w=1040`, width: 1040, height: 768, mobile: false, out: `${STILLS}full-${dir}-capital-laukuwelua-${dr}.png`, waitMs: 1200 });
  }
  shots.push({ url: `/mock/sheets/plate.html?f=${dir}-capital-laukuwelua-antique.svg&w=1040`, width: 1040, height: 768, mobile: false, out: `${STILLS}crop-${dir}-capital-town.png`, waitMs: 1200, clip: { x: 300, y: 300, width: 520, height: 260, scale: 2 } });
  shots.push({ url: `/mock/sheets/plate.html?f=${dir}-capital-laukuwelua-antique.svg&w=1040`, width: 1040, height: 768, mobile: false, out: `${STILLS}crop-${dir}-capital-foreground.png`, waitMs: 1200, clip: { x: 60, y: 420, width: 520, height: 300, scale: 2 } });
}
writeFileSync(`${SHEETS}shots.json`, JSON.stringify(shots, null, 1));

const byDir = new Map<string, { bytes: number[]; ms: number[] }>();
for (const r of rows) {
  const b = byDir.get(r.dir) ?? { bytes: [], ms: [] };
  b.bytes.push(r.bytes); b.ms.push(r.ms);
  byDir.set(r.dir, b);
}
const stat = (xs: number[]): string => `min ${Math.min(...xs).toFixed(0)} max ${Math.max(...xs).toFixed(0)} mean ${(xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(0)}`;
for (const [dir, b] of byDir) console.log(`${dir}: bytes ${stat(b.bytes)}; ms ${stat(b.ms)}`);
console.log(`${rows.length} plates written to ${STILLS}`);
