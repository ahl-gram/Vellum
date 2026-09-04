// Renders the limner mockups over the dumped geometry: `node design/ribbon-limner/build.ts` writes the SVGs here and the PNGs plus a gallery to out/ribbon-limner/.
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { el, renderSvg, type SvgNode } from "../../src/render/svg.ts";
import { createRng } from "../../src/core/rng.ts";
import { findBrowser, rasterizeSvg } from "../../src/cli/raster.ts";
import { P, FONT, VARIANTS, type Variant } from "./palette.ts";
import { armsInner, loadRibbon, MARGIN, RIBBON_H, RIBBON_W, type Ribbon } from "./data.ts";
import { titleNodes } from "./cartouche.ts";
import { stripNodes } from "./strip.ts";

const OUT = resolve("out/ribbon-limner");
const HERE = resolve("design/ribbon-limner");
const ARMS_FROM = "ARMSFROMTOKEN";
const ARMS_TO = "ARMSTOTOKEN";

function defs(v: Variant, rb: Ribbon): SvgNode {
  const rolls = rb.strips.map((s) =>
    el("linearGradient", { id: `roll-${s.index}`, x1: 0, y1: 0, x2: 0, y2: 1 }, [
      el("stop", { offset: "0%", "stop-color": P.sepia, "stop-opacity": 0.6 }),
      el("stop", { offset: "42%", "stop-color": P.paper, "stop-opacity": 1 }),
      el("stop", { offset: "100%", "stop-color": P.sepia, "stop-opacity": 0.62 }),
    ]));
  return el("defs", {}, [
    el("filter", { id: `grain-${v.key}` }, [
      el("feTurbulence", { type: "fractalNoise", baseFrequency: 0.82, numOctaves: 2, seed: rb.seed % 997, stitchTiles: "stitch" }),
      el("feColorMatrix", { type: "matrix", values: "0 0 0 0 0.29 0 0 0 0 0.22 0 0 0 0 0.15 0 0 0 0.05 0" }),
    ]),
    ...rolls,
  ]);
}

function plateFrame(): SvgNode[] {
  const m = MARGIN - 14;
  return [
    el("rect", { x: m, y: m, width: RIBBON_W - m * 2, height: RIBBON_H - m * 2, fill: "none", stroke: P.ink, "stroke-width": 1.7 }),
    el("rect", { x: m + 4, y: m + 4, width: RIBBON_W - (m + 4) * 2, height: RIBBON_H - (m + 4) * 2, fill: "none", stroke: P.soft, "stroke-width": 0.6 }),
  ];
}

function colophon(rb: Ribbon): SvgNode {
  return el("text", { x: RIBBON_W / 2, y: RIBBON_H - MARGIN + 9, "text-anchor": "middle", "font-family": FONT, "font-size": 8, "letter-spacing": 1.6, fill: P.soft }, [`CHART № ${rb.seed} · ${rb.worldName.toUpperCase()}`]);
}

function plate(v: Variant, rb: Ribbon, armsFrom: string | null, armsTo: string | null): string {
  const rng = createRng(rb.seed).fork(`ribbon-limner-${v.key}`);
  const strips = rb.strips.map((s, i) => stripNodes(v, s, rb, rng, i === rb.strips.length - 1));
  const root = el("svg", { xmlns: "http://www.w3.org/2000/svg", width: RIBBON_W, height: RIBBON_H, viewBox: `0 0 ${RIBBON_W} ${RIBBON_H}` }, [
    defs(v, rb),
    el("rect", { x: 0, y: 0, width: RIBBON_W, height: RIBBON_H, fill: P.paper }),
    el("rect", { x: 0, y: 0, width: RIBBON_W, height: RIBBON_H, filter: `url(#grain-${v.key})` }),
    ...plateFrame(),
    ...titleNodes(v, rb, armsFrom === null ? null : ARMS_FROM, armsTo === null ? null : ARMS_TO),
    ...strips,
    colophon(rb),
  ]);
  return renderSvg(root).replace(ARMS_FROM, armsFrom ?? "").replace(ARMS_TO, armsTo ?? "");
}

const JOBS: ReadonlyArray<{ seed: number; keys: ReadonlyArray<string> }> = [
  { seed: 42, keys: VARIANTS.map((v) => v.key) },
  { seed: 15, keys: ["a-limner"] },
];

mkdirSync(OUT, { recursive: true });
const browser = findBrowser();
const shots: Array<{ file: string; name: string; note: string }> = [];
for (const job of JOBS) {
  const rb = loadRibbon(job.seed);
  const armsFrom = armsInner(`arms-${job.seed}-from.svg`);
  const armsTo = armsInner(`arms-${job.seed}-to.svg`);
  const current = `current-${job.seed}-antique`;
  if (browser) await rasterizeSvg(browser, resolve(HERE, `${current}.svg`), resolve(OUT, `0-${current}.png`), 2);
  shots.push({ file: `0-${current}.png`, name: `Today: chart ${job.seed}, antique`, note: `${rb.from} to ${rb.to}, ${Math.round(rb.leagues)} leagues, as the site draws it now.` });
  for (const v of VARIANTS.filter((x) => job.keys.includes(x.key))) {
    const name = `${v.key}-${job.seed}`;
    writeFileSync(resolve(HERE, `${name}.svg`), plate(v, rb, armsFrom, armsTo));
    if (browser) await rasterizeSvg(browser, resolve(HERE, `${name}.svg`), resolve(OUT, `${name}.png`), 2);
    shots.push({ file: `${name}.png`, name: `${v.name} (chart ${job.seed})`, note: v.note });
    console.log(`out/ribbon-limner/${name}.png`);
  }
}
const figures = shots.map((s) => `<figure><img src="${s.file}" alt="${s.name}"><figcaption><b>${s.name}</b> ${s.note}</figcaption></figure>`).join("\n");
writeFileSync(resolve(OUT, "index.html"), `<!doctype html><meta charset="utf-8"><title>The Wayfarer's Ribbon, coloured</title>
<style>body{margin:0;padding:2rem;background:#26221d;color:#e8dfc8;font-family:'Iowan Old Style',Palatino,Georgia,serif}figure{margin:0 auto 3rem;max-width:1400px}img{width:100%;display:block;box-shadow:0 12px 40px rgba(0,0,0,.5)}figcaption{margin:.8rem .2rem 0;font-size:1rem;line-height:1.5;max-width:70ch}b{font-weight:600;letter-spacing:.02em}</style>
${figures}`);
console.log("out/ribbon-limner/index.html");
