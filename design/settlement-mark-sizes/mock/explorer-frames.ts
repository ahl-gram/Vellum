// Issue #1104 round: the glance stills. The built Explorer (this tree's dist/, 108f8db6) is taken to the deepest band on the first place, and the close-up it drew is swapped, element for element, for each direction's sheet from build.ts; then shot unheld and held. The first frame is the Explorer untouched, the control the swap is measured against.
// usage (after build.ts): node out/1104/mock/explorer-frames.ts
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { shootAll, type Shot } from "../../../scripts/design/shoot.ts";
import { createProjection, marginFor } from "../../../src/render/transform.ts";
import { LOD_BANDS } from "../../../src/world/lod.ts";
import { PLACES } from "./places.ts";
import { page, fig, row } from "./sheets.ts";
import { ladder } from "./ladder.ts";

const OUT_ROOT = "/Users/ahl/CodeProjects/Vellum/out/1104";
const SITE = fileURLToPath(new URL("../../../dist", import.meta.url));
const p = PLACES[0]!;
const size = LOD_BANDS[5]!.sizeUV;
const proj = createProjection(320, 240, 1500, marginFor(1500));
const cu = proj.px((p.band5.u0 + size / 2) * 319) / proj.widthPx;
const cv = proj.py((p.band5.v0 + size / 2) * 239) / proj.heightPx;

const DIRS = ["untouched", "today", "a", "b", "c", "a-grow", "b-grow"];

function script(dir: string, held: boolean): string {
  const svg = dir === "untouched" ? null : readFileSync(`${OUT_ROOT}/svg/${p.key}-b5-${dir}.svg`, "utf8");
  return `(async()=>{
const sleep=(ms)=>new Promise((r)=>setTimeout(r,ms));
const until=async(pred,tries,label)=>{for(let i=0;i<tries;i++){const v=pred();if(v)return v;await sleep(50);}throw new Error("1104 timeout: "+label);};
await until(()=>document.querySelector("#map > svg")&&window.__vellumRegion&&(document.getElementById("status").textContent||"")==="",600,"world drawn");
const vp=document.getElementById("map-viewport");const W=vp.clientWidth,H=vp.clientHeight;
const before=window.__vellumRegion().redrafts;
window.__vellumZoomTo({k:32,x:W/2-(${cu})*32*W,y:H/2-(${cv})*32*H});
await until(()=>{const s=window.__vellumRegion();return s.redrafts>before&&s.committed&&s.band===5;},600,"redraft to band 5");
await sleep(1500);
const isvg=[...document.querySelectorAll("#map .region-inset svg")].pop();
const read=(el)=>({names:[...el.querySelectorAll("g.settlement")].map((g)=>g.getAttribute("data-name")).join("|"),groups:el.querySelectorAll("*").length,viewBox:el.getAttribute("viewBox")});
const drawn=read(isvg);
let swapped=null;
${
  svg === null
    ? ""
    : `const t=document.createElement("template");t.innerHTML=${JSON.stringify(svg)};const mine=t.content.firstElementChild;swapped=read(mine);isvg.innerHTML=mine.innerHTML;await new Promise((r)=>requestAnimationFrame(()=>requestAnimationFrame(r)));`
}
${
  held
    ? `document.getElementById("zoom-hold").click();await until(()=>document.getElementById("zoom-hold").getAttribute("aria-pressed")==="true",200,"hold lit");window.__vellumZoomTo({k:96,x:W/2-(${cu})*96*W,y:H/2-(${cv})*96*H});await sleep(1500);`
    : ""
}
window.__f1104={dir:${JSON.stringify(dir)},held:${held},camK:window.__vellumZoomState().k,region:window.__vellumRegion(),drawn,swapped,same:swapped?swapped.names===drawn.names&&swapped.groups===drawn.groups&&swapped.viewBox===drawn.viewBox:null};
})()`;
}

const shots: Shot[] = DIRS.flatMap((dir) =>
  [false, true].map((held) => ({
    url: `/explorer/#seed=${p.seed}&style=antique`,
    width: 1280,
    height: 800,
    mobile: false,
    out: `${OUT_ROOT}/stills/explorer-${p.key}-${dir}${held ? "-held" : ""}.png`,
    waitMs: 1500,
    script: script(dir, held),
    scriptWaitMs: 400,
    probe: "JSON.stringify(window.__f1104)",
  })),
);

const results = await shootAll(shots, { site: SITE, reducedMotion: true });
const bad = results.filter((r) => r.http4xx.length > 0 || r.consoleErrors.length > 0);
writeFileSync(`${OUT_ROOT}/measure/explorer-frames-result.json`, JSON.stringify(results.map((r) => ({ ...r, probe: JSON.parse(r.probe!) })), null, 1));
if (bad.length > 0) {
  console.error("FAILED shots:", JSON.stringify(bad.map((b) => ({ out: b.out, http4xx: b.http4xx, consoleErrors: b.consoleErrors })), null, 1));
  process.exit(1);
}
for (const r of results) {
  const f = JSON.parse(r.probe!) as { dir: string; held: boolean; camK: number; same: boolean | null; drawn: { groups: number }; swapped: { groups: number } | null };
  console.log(f.dir, f.held ? "held" : "unheld", "camK", f.camK, "same structure as the Explorer's own drawing:", f.same, "elements", f.drawn.groups, f.swapped?.groups ?? "");
}

const NAME: Record<string, string> = {
  untouched: "Today, the Explorer untouched (the control)",
  today: "Today, drawn by this round's code and swapped in (proves the swap: the chart is pixel-identical to the control)",
  a: ladder("a").name,
  b: ladder("b").name,
  c: ladder("c").name,
  "a-grow": `${ladder("a").name}, grown with depth`,
  "b-grow": `${ladder("b").name}, grown with depth`,
};
const rows = DIRS.map((d) =>
  `<h2>${NAME[d]}</h2>` +
  row(
    fig(`<img class="full" src="../stills/explorer-${p.key}-${d}.png" width="640" height="400" alt="">`, `the deepest band, unheld (32 times): explorer-${p.key}-${d}.png, shown here at half size`),
    fig(`<img class="full" src="../stills/explorer-${p.key}-${d}-held.png" width="640" height="400" alt="">`, `held (96 times): explorer-${p.key}-${d}-held.png, shown here at half size`),
  ),
);
writeFileSync(
  `${OUT_ROOT}/sheets/explorer.html`,
  page(
    `In the Explorer: the Environs of ${p.anchor}, chart \u2116 ${p.seed}`,
    "The built Explorer at 1280 by 800 under reduced motion, taken to the deepest band, with the close-up it drew swapped for each direction's sheet. Each frame is half size here; the PNG it names is the frame one to one.",
    rows.join(""),
  ),
);
writeFileSync(
  `${OUT_ROOT}/sheets/explorer-shots.json`,
  JSON.stringify([{ url: "/out/1104/sheets/explorer.html", width: 1400, height: 900, mobile: false, full: true, out: `${OUT_ROOT}/stills/sheet-explorer.png`, waitMs: 2500, probe: "String(document.documentElement.scrollWidth)" }], null, 1),
);
