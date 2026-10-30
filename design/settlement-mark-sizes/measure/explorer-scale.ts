// Issue #1104 round, the premise behind item 2: how big a settlement mark stands ON SCREEN in the shipped Explorer as the Glass descends. Drives the built site (dist/ of this tree) through shootAll, one shot per camera depth, and reads each tier's painted box at rest and inside the region inset.
// usage: node out/1104/measure/explorer-scale.ts <seed> <u0> <v0> [width height [fold]]   (u0, v0: the band-5 window the sweep chose, plot uv; fold folds the Broadside first)
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { shootAll, type Shot } from "../../../scripts/design/shoot.ts";
import { createProjection, marginFor } from "../../../src/render/transform.ts";
import { LOD_BANDS } from "../../../src/world/lod.ts";

const OUT_ROOT = "/Users/ahl/CodeProjects/Vellum/out/1104";
const SITE = fileURLToPath(new URL("../../../dist", import.meta.url));
const OUT = `${OUT_ROOT}/measure`;

const seed = Number(process.argv[2] ?? 42);
const u0 = Number(process.argv[3] ?? 0.5);
const v0 = Number(process.argv[4] ?? 0.5);
const VIEW = { width: Number(process.argv[5] ?? 1280), height: Number(process.argv[6] ?? 800) };
const FOLD = process.argv[7] === "fold";
const TAG = `${VIEW.width}x${VIEW.height}${FOLD ? "-folded" : ""}`;
const size = LOD_BANDS[5]!.sizeUV;
const uc = u0 + size / 2;
const vc = v0 + size / 2;
const proj = createProjection(320, 240, 1500, marginFor(1500));
const cu = proj.px(uc * 319) / proj.widthPx;
const cv = proj.py(vc * 239) / proj.heightPx;

type Depth = { readonly k: number; readonly band: number; readonly hold?: number };
const DEPTHS: readonly Depth[] = [
  { k: 1, band: 0 },
  { k: 2, band: 1 },
  { k: 3, band: 1 },
  { k: 4, band: 2 },
  { k: 8, band: 3 },
  { k: 16, band: 4 },
  { k: 24, band: 4 },
  { k: 26, band: 5 },
  { k: 32, band: 5 },
  { k: 32, band: 5, hold: 96 },
];

const TIERS = ["capital", "seat", "town", "village", "hamlet", "farmstead", "mill"];

function script(d: Depth): string {
  return `(async()=>{
const sleep=(ms)=>new Promise((r)=>setTimeout(r,ms));
const until=async(pred,tries,label)=>{for(let i=0;i<tries;i++){const v=pred();if(v)return v;await sleep(50);}throw new Error("1104 timeout: "+label);};
await until(()=>document.querySelector("#map > svg")&&window.__vellumRegion&&(document.getElementById("status").textContent||"")==="",600,"world drawn");
${FOLD ? `const sw=()=>document.querySelector("#map > svg").getBoundingClientRect().width;const w0=sw();document.querySelector("#broadside .slip-fold").click();for(let i=0;i<40&&Math.abs(sw()-w0)<=1;i++)await sleep(50);let last=-1,calm=0;await until(()=>{const w=sw();calm=Math.abs(w-last)<0.01?calm+1:0;last=w;return calm>=6;},200,"refit settles");` : ""}
const vp=document.getElementById("map-viewport");const W=vp.clientWidth,H=vp.clientHeight;
const box=(el)=>{if(!el)return null;const r=el.getBoundingClientRect();return [+r.width.toFixed(3),+r.height.toFixed(3)];};
const med=(els)=>{const bs=els.map(box).filter(Boolean);if(!bs.length)return null;bs.sort((a,b)=>a[0]-b[0]);return {n:bs.length,box:bs[Math.floor(bs.length/2)]};};
const world=document.querySelector("#map > svg");
const rest={sheet:box(world),capital:med([...world.querySelectorAll("g.settlement-capital")]),seat:med([...world.querySelectorAll("g.settlement-seat")]),town:med([...world.querySelectorAll('g.settlement > circle[r="3.4"]')]),village:med([...world.querySelectorAll('g.settlement > circle[r="2.3"]')])};
if(${d.k}>1){const before=window.__vellumRegion().redrafts;window.__vellumZoomTo({k:${d.k},x:W/2-(${cu})*${d.k}*W,y:H/2-(${cv})*${d.k}*H});
await until(()=>{const s=window.__vellumRegion();return s.redrafts>before&&s.committed&&s.band===${d.band};},600,"redraft to band ${d.band}");await sleep(1200);}
${
  d.hold === undefined
    ? ""
    : `document.getElementById("zoom-hold").click();await until(()=>document.getElementById("zoom-hold").getAttribute("aria-pressed")==="true",200,"hold lit");
window.__vellumZoomTo({k:${d.hold},x:W/2-(${cu})*${d.hold}*W,y:H/2-(${cv})*${d.hold}*H});await sleep(1500);`
}
const isvg=[...document.querySelectorAll("#map .region-inset svg")].pop()||null;
const inset={};for(const t of ${JSON.stringify(TIERS)}){inset[t]=isvg?med([...isvg.querySelectorAll('g.settlement[data-tier="'+t+'"]')].map((g)=>g.firstElementChild)):null;}
const z=window.__vellumZoomState();const s=window.__vellumRegion();
window.__m1104={k:${d.k},hold:${d.hold ?? "null"},camK:z.k,band:s.band,window:s.window,title:s.title,viewport:[W,H],rest,insetSvg:box(isvg),insetViewBox:isvg?isvg.getAttribute("viewBox"):null,inset};
})()`;
}

const shots: Shot[] = DEPTHS.map((d) => ({
  url: `/explorer/#seed=${seed}&style=antique`,
  width: VIEW.width,
  height: VIEW.height,
  mobile: false,
  out: `${OUT}/explorer-${TAG}-k${d.hold ?? d.k}${d.hold ? "-held" : ""}.png`,
  waitMs: 1500,
  script: script(d),
  scriptWaitMs: 300,
  probe: "JSON.stringify(window.__m1104)",
}));

mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/explorer-scale-${TAG}-shots.json`, JSON.stringify(shots, null, 1));
const results = await shootAll(shots, { site: SITE });
writeFileSync(`${OUT}/explorer-scale-${TAG}-result.json`, JSON.stringify(results, null, 1));
const bad = results.filter((r) => r.http4xx.length > 0 || r.consoleErrors.length > 0);
if (bad.length > 0) {
  console.error("FAILED shots:", JSON.stringify(bad, null, 1));
  process.exit(1);
}
const rows = results.map((r) => JSON.parse(r.probe!) as Record<string, unknown>);
writeFileSync(`${OUT}/explorer-scale-${TAG}.json`, JSON.stringify({ seed, u0, v0, cu, cv, view: VIEW, fold: FOLD, rows }, null, 1));
for (const row of rows) console.log(JSON.stringify(row));
