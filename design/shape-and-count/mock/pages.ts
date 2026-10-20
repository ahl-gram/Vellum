// Issue #849: the contact sheets, the overviews, the plate page and the shot list, from out/844/facts.json.
// Every caption quotes a measured fact of the world drawn. The sheets link the house faces from design/kit/fonts.css
// by a relative path, so they work served from the main checkout (`--site` the checkout) and from file://.
// Run from the tree: node out/844/mock/pages.ts
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import type { Plate } from "./build.ts";

const OUT = "/Users/ahl/CodeProjects/Vellum/out/844";
const PAGES = `${OUT}/pages`;
const STILLS = `${OUT}/stills`;
const SHA = "581a6de3";
// The SVG root is 1500 by 1158 (`renderMap` at `widthPx: 1500`, `MARGIN_FRACTION` 0.045 in `src/render/transform.ts`).
const SVG_W = 1500,
  SVG_H = 1158,
  MARGIN = Math.round(1500 * 0.045);
const FULL_W = 1040,
  FULL_H = Math.round((SVG_H * FULL_W) / SVG_W);
const CROP_W = 480,
  CROP_H = 360;

type CaseRow = { slug: string; group: string; title: string; why: string; seed: number; mapType: string; coastWarp?: number; overrides?: { band?: string; culture?: string }; window: { u0: number; v0: number; u1: number; v1: number }; primary: boolean; outline?: { id: string; name: string; source: string; fit: string }; dirs: string[] };
const facts = JSON.parse(readFileSync(`${OUT}/facts.json`, "utf8")) as { sha: string; cases: CaseRow[]; plates: Plate[] };
const plateOf = (caseSlug: string, dir: string): Plate => {
  const p = facts.plates.find((x) => x.caseSlug === caseSlug && x.dir === dir);
  if (p === undefined) throw new Error(`no plate ${caseSlug} ${dir}`);
  return p;
};
const pct = (x: number, d = 0): string => `${(100 * x).toFixed(d)}%`;
const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const typeName = (t: string): string => (t === "citystate" ? "city-state" : t);
const win = (w: CaseRow["window"]): string => `u ${w.u0.toFixed(4)} to ${w.u1.toFixed(4)}, v ${w.v0.toFixed(4)} to ${w.v1.toFixed(4)}`;

const CSS = `body{margin:0;background:#2b2118;color:#f2e8cf;font-family:'EB Garamond','Iowan Old Style',Georgia,serif}
h1{font-family:'IM Fell English SC','Iowan Old Style',Georgia,serif;font-weight:400;font-size:27px;margin:16px 22px 2px;letter-spacing:.02em}
.lede{font-family:'IM Fell English','Iowan Old Style',Georgia,serif;font-style:italic;font-size:16px;color:#e3d3ad;margin:2px 22px 4px;max-width:1600px}
.meta{font-size:13.5px;color:#cdbb93;margin:2px 22px 10px;max-width:1640px;line-height:1.4}
.row{margin:12px 22px 20px}
.row h2{font-weight:400;font-size:17px;margin:0 0 5px;color:#f2e8cf}
.row h2 .pipe{font-size:13px;color:#cdbb93;font-style:italic}
.row h2 .mine{font-size:13px;color:#f0b98a}
.cells{display:grid;gap:12px}
figure{margin:0}
img{display:block;background:#f2e8cf;box-shadow:0 4px 14px rgba(0,0,0,.45)}
figcaption{font-size:12.5px;line-height:1.38;color:#dccb9f;margin-top:5px}
figcaption b{font-weight:600;color:#f2e8cf}
.warn{color:#f0b98a}`;

const head = (title: string): string => `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(title)}</title><link rel="stylesheet" href="../../../design/kit/fonts.css"><style>${CSS}</style><body>`;

function worldCaption(p: Plate, dress: string): string {
  const w = p.world;
  const asked = p.asked ? ` of <b>${p.asked.n} asked</b> (${p.asked.spread}, ${p.asked.sunk ? "sunk" : "as measured"}, lobes covering ${p.asked.coverage.toFixed(2)})` : "";
  const shape = p.shape ? `<br>outline covers <b>${pct(p.shape.outlineShare)}</b> of the sheet against a land share of ${p.recipe.landFraction}; likeness ${p.shape.likeness.toFixed(2)}; land beyond the outline ${pct(p.shape.landBeyond)}` : "";
  const border = w.borderLand > 0 ? ` <span class="warn">border land ${w.borderLand} cells: the ocean-at-the-border rule breaks</span>` : " border land 0";
  return `<b>World sheet</b>, ${dress}. <b>${w.islands} islands</b> of 20+ cells${asked}; land ${pct(w.landShare, 1)}; the largest landmass ${pct(w.largestShare)} of the land; ${w.realms} realm${w.realms === 1 ? "" : "s"}, ${w.towns} towns;${border}${shape}`;
}

function closeCaption(p: Plate, c: CaseRow, dress: string): string {
  const by = p.closeUpPipeline === "engine" ? (c.coastWarp !== undefined ? `drawn by the engine as it is today, whose close-up path drops the coast warp (Issue #453), so this window is drawn at the default 0.55 while its chart is at ${c.coastWarp}` : "drawn by the engine as it is today") : "drawn by the spike, which hands the close-up every terrain input (the coast warp and the edge), as Sub 1 will";
  const dis = p.closeUp.disagreement;
  const flag = dis > 0.025 ? ` <span class="warn">disagrees with its chart on ${pct(dis, 2)} of cells</span>` : ` disagrees with its chart on ${pct(dis, 2)} of cells (the resampling floor is about 1.5%)`;
  const dropped = p.closeUp.dropped > 0 ? `; <span class="warn">${p.closeUp.dropped} town${p.closeUp.dropped === 1 ? "" : "s"} of the sheet found no land here and ${p.closeUp.dropped === 1 ? "was" : "were"} dropped</span>` : "";
  return `<b>Band-1 close-up</b>, ${dress}, the Glass's detail arm, ${win(c.window)}; ${by};${flag}; ${p.closeUp.islands} islands in the window${dropped}`;
}

const svgSrc = (file: string): string => `../svg/${encodeURIComponent(file)}`;

function caseSheet(c: CaseRow, dirs: ReadonlyArray<string>, suffix: string, extraTitle: string): { file: string; width: number } {
  const imgW = 400,
    imgH = Math.round((SVG_H * imgW) / SVG_W);
  const width = 22 * 2 + 4 * imgW + 3 * 12;
  const rows = dirs.map((d) => {
    const p = plateOf(c.slug, d);
    const pipe = p.pipeline === "engine" ? "the engine at " + SHA : "the spike at " + SHA;
    const mine = p.mine ? ` <span class="mine">(${esc(p.mine)})</span>` : "";
    const cells = (["antique", "ink"] as const)
      .flatMap((dress) => [
        `<figure><img src="${svgSrc(p.files[`world-${dress}`] as string)}" width="${imgW}" height="${imgH}" alt=""><figcaption>${worldCaption(p, dress)}</figcaption></figure>`,
        `<figure><img src="${svgSrc(p.files[`close-${dress}`] as string)}" width="${imgW}" height="${imgH}" alt=""><figcaption>${closeCaption(p, c, dress)}</figcaption></figure>`,
      ])
      .join("");
    return `<section class="row"><h2>${esc(p.label)} <span class="pipe">drawn by ${pipe}; chart ${p.recipe.seed}, "${esc(p.title)}"</span>${mine}</h2><div class="cells" style="grid-template-columns:repeat(4,${imgW}px)">${cells}</div></section>`;
  });
  const p0 = plateOf(c.slug, dirs[0] as string);
  const outline = c.outline ? `<br>Outline: ${esc(c.outline.name)}; ${esc(c.outline.source)}; ${esc(c.outline.fit)} (the inner box is a stand-in, not ruled).` : "";
  const html = `${head(c.title)}<h1>Issue #849 &middot; ${esc(c.title)}${esc(extraTitle)}</h1><p class="lede">${esc(c.why)}.</p><p class="meta">Seed ${c.seed}, the ${typeName(c.mapType)} type set by override, land share ${p0.recipe.landFraction}, the ${p0.recipe.band} band ${c.overrides?.band ? "set by the founding" : "from the seed"}, coast ${c.coastWarp ?? "0.55 (the default)"}. Every world drawn at ${SHA}; the control by the engine, the directions by the spike (the engine's own pipeline, its terrain made pluggable: out/844/mock/). An island is a landmass of 20 or more of the sheet's 76,800 cells, four-connected, counted on the world drawn. Charts rendered as the Explorer renders them (1500 wide, the legend on).${outline}</p>${rows.join("")}</body></html>`;
  const file = `${c.slug}${suffix}.html`;
  writeFileSync(`${PAGES}/${file}`, html);
  return { file, width };
}

type Shot = { url: string; width: number; height: number; mobile: false; out: string; waitMs: number; full?: boolean; clip?: { x: number; y: number; width: number; height: number; scale: number }; probe?: string };
const shots: Shot[] = [];
const PROBE = "document.documentElement.scrollWidth";
mkdirSync(PAGES, { recursive: true });
mkdirSync(STILLS, { recursive: true });

const written: Array<{ file: string; title: string }> = [];
const sheetShot = (file: string, width: number, outName: string): void => {
  written.push({ file, title: outName.replace(/[.]png$/, "") });
  shots.push({ url: `/out/844/pages/${file}`, width, height: 900, mobile: false, out: `${OUT}/${outName}`, waitMs: 2500, full: true, probe: PROBE });
};

for (const c of facts.cases) {
  if (c.slug === `count-${c.seed}` && c.dirs.some((d) => d.includes("varied"))) {
    for (const spread of ["equal", "varied"]) {
      const s = caseSheet(c, ["control", ...c.dirs.filter((d) => d.includes(`-${spread}-`))], `-${spread}`, `, ${spread} sizes`);
      sheetShot(s.file, s.width, `sheet-${c.slug}-${spread}.png`);
    }
  } else {
    const s = caseSheet(c, c.dirs, "", "");
    sheetShot(s.file, s.width, `sheet-${c.slug}.png`);
  }
}

// The overviews: the first look, one antique world sheet per cell.
function overview(file: string, title: string, lede: string, rows: ReadonlyArray<{ label: string; cells: ReadonlyArray<{ p: Plate; label: string }> }>, imgW: number): number {
  const imgH = Math.round((SVG_H * imgW) / SVG_W);
  const cols = Math.max(...rows.map((r) => r.cells.length));
  const width = 44 + cols * imgW + (cols - 1) * 12;
  const body = rows
    .map((r) => {
      const cells = r.cells
        .map(({ p, label }) => {
          const w = p.world;
          const extra = p.shape ? `; likeness ${p.shape.likeness.toFixed(2)}, land beyond ${pct(p.shape.landBeyond)}` : "";
          const asked = p.asked ? ` (asked ${p.asked.n})` : "";
          return `<figure><img src="${svgSrc(p.files["world-antique"] as string)}" width="${imgW}" height="${imgH}" alt=""><figcaption><b>${esc(label)}</b><br>${w.islands} islands${asked}; land ${pct(w.landShare, 1)}${extra}; border land ${w.borderLand}</figcaption></figure>`;
        })
        .join("");
      return `<section class="row"><h2>${esc(r.label)}</h2><div class="cells" style="grid-template-columns:repeat(${cols},${imgW}px)">${cells}</div></section>`;
    })
    .join("");
  writeFileSync(`${PAGES}/${file}`, `${head(title)}<h1>Issue #849 &middot; ${esc(title)}</h1><p class="lede">${esc(lede)}</p><p class="meta">Antique world sheets only; each case's own sheet carries the ink dress and the band-1 close-ups. Drawn at ${SHA}.</p>${body}</body></html>`);
  return width;
}

const shapeRows = facts.cases
  .filter((c) => c.group === "shape" && c.primary)
  .map((c) => ({ label: `${c.title} (${c.why})`, cells: c.dirs.map((d) => ({ p: plateOf(c.slug, d), label: plateOf(c.slug, d).label })) }));
const shapesW = overview("overview-shapes.html", "The shapes at a glance", "Each outline at its median seed: today's dome, then the soft likeness (ruled), the hard cut-out, the bias at two strengths, and the soft likeness with the outline drawn larger, to 0.06 from the edge (the designer's own).", shapeRows, 270);
sheetShot("overview-shapes.html", shapesW, "overview-shapes.png");

const countMedian = facts.cases.find((c) => c.group === "count" && c.primary) as CaseRow;
const typeCases = facts.cases.filter((c) => c.group === "type");
const typeRows = [countMedian, ...typeCases].map((c) => ({
  label: `${c.title} (${c.why})`,
  cells: ["control", "n20-equal-measured", "n20-equal-sunk", "n100-equal-measured", "n100-equal-sunk"].map((d) => ({ p: plateOf(c.slug, d), label: d === "control" ? "today (the control)" : plateOf(c.slug, d).label })),
}));
const typesW = overview("overview-types.html", "A count on every map type", "Asked 20 and asked 100, equal sizes, as measured and with the ground between sunk, each type at its own default land share and shape numbers (D14).", typeRows, 300);
sheetShot("overview-types.html", typesW, "overview-types.png");

const countRows = ["equal", "varied"].map((spread) => ({
  label: `${countMedian.title}, ${spread} sizes, the ground between sunk`,
  cells: ["control", ...[2, 5, 20, 100].map((n) => `n${n}-${spread}-sunk`)].map((d) => ({ p: plateOf(countMedian.slug, d), label: d === "control" ? "today (the control)" : plateOf(countMedian.slug, d).label })),
}));
const wobbleCase = facts.cases.find((c) => c.slug.startsWith("count-wobble-"));
if (wobbleCase) countRows.push({ label: `${wobbleCase.title}: the designer's own direction, each island's coast wobbled at its own scale, at coast 0.1, 0.55 and 0.95`, cells: ["n20-equal-sunk", "n20-equal-sunk-wobble-coast0.1", "n20-equal-sunk-wobble", "n20-equal-sunk-wobble-coast0.95", "n100-equal-sunk-wobble"].map((d) => ({ p: plateOf(wobbleCase.slug, d), label: plateOf(wobbleCase.slug, d).label })) });
const countsW = overview("overview-counts.html", "The count at a glance", `${countMedian.why}. Asked 2, 5, 20 and 100, both sizes, the ground between the lobes sunk (each case sheet has the as-measured variant beside it).`, countRows, 300);
sheetShot("overview-counts.html", countsW, "overview-counts.png");

// The plate page for the full-scale and 2x crop stills.
writeFileSync(`${PAGES}/plate.html`, `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>plate</title><style>body{margin:0;background:#f2e8cf}img{display:block}</style><body><img id="p" alt=""><script>const q=new URLSearchParams(location.search);const i=document.getElementById("p");i.src="../svg/"+encodeURIComponent(q.get("f"));i.style.width=(q.get("w")||"${FULL_W}")+"px";</script></body></html>`);

const plotX = (u: number): number => ((MARGIN + u * (SVG_W - 2 * MARGIN)) * FULL_W) / SVG_W;
const plotY = (v: number): number => ((MARGIN + v * (SVG_H - 2 * MARGIN)) * FULL_W) / SVG_W;
const clipAt = (cx: number, cy: number): Shot["clip"] => ({ x: Math.round(Math.max(0, Math.min(FULL_W - CROP_W, cx - CROP_W / 2))), y: Math.round(Math.max(0, Math.min(FULL_H - CROP_H, cy - CROP_H / 2))), width: CROP_W, height: CROP_H, scale: 2 });
const STILL_DIRS_ON_COAST = new Set(["control", "control-pass", "soft"]);
const stillPlates = facts.plates.filter((p) => {
  const c = facts.cases.find((x) => x.slug === p.caseSlug) as CaseRow;
  return c.primary || (c.slug.includes("coast") && c.group === "shape" && STILL_DIRS_ON_COAST.has(p.dir));
});
for (const p of stillPlates) {
  const c = facts.cases.find((x) => x.slug === p.caseSlug) as CaseRow;
  const cu = (c.window.u0 + c.window.u1) / 2,
    cv = (c.window.v0 + c.window.v1) / 2;
  for (const dress of ["antique", "ink"]) {
    for (const sheet of ["world", "close"] as const) {
      const f = p.files[`${sheet}-${dress}`] as string;
      const base = `${p.id}--${sheet}-${dress}`;
      shots.push({ url: `/out/844/pages/plate.html?f=${encodeURIComponent(f)}&w=${FULL_W}`, width: FULL_W, height: FULL_H, mobile: false, out: `${STILLS}/full--${base}.png`, waitMs: 900 });
      const clip = sheet === "world" ? clipAt(plotX(cu), plotY(cv)) : clipAt(plotX(0.5), plotY(0.5));
      shots.push({ url: `/out/844/pages/plate.html?f=${encodeURIComponent(f)}&w=${FULL_W}`, width: FULL_W, height: FULL_H, mobile: false, out: `${STILLS}/crop2x--${base}.png`, waitMs: 900, ...(clip ? { clip } : {}) });
    }
  }
}
writeFileSync(`${PAGES}/shots.json`, JSON.stringify(shots, null, 1));
writeFileSync(`${PAGES}/index.html`, `${head("Issue #849 pages")}<h1>Issue #849 &middot; the pages behind the stills</h1><p class="meta">Open a page alone; the stills in the folder above are these pages photographed by scripts/design/shoot.ts.</p><ul>${written.map((w) => `<li><a href="${w.file}">${esc(w.title)}</a></li>`).join("")}</ul></body></html>`);
console.log(`${shots.length} shots listed in ${PAGES}/shots.json (${stillPlates.length} plates with full and crop stills)`);
