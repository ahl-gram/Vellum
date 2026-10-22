// Issue #950 round: the live Explorer as it ships today, photographed and measured through the shared camera, so the controls are the real thing and every mock surface is drawn at a measured size. Built from the tree (`npm run build` at the round's sha) and served from its dist/ (`--site`). The place is seed 42's capital, Laukuwelua, the breakdown's witness.
//   live-b3-*      : the band-3 close-up at 8 times, committed by the Glass (today's deepest look), at 1440 by 900 and 1024 by 768;
//   live-held16/24 : the same sheet held and magnified to 16 and 24 times;
//   live-drawer    : the sheet laid on the Chart Table, the drawer open, its cutting measured;
//   live-portfolio : the Portfolio with that sheet, its plate and its contents thumbnail measured;
//   live-loupe     : the loupe lit over the band-3 sheet, its glass measured.
// Run from the tree root: node out/950/mock/live.ts, then node scripts/design/shoot.ts <DELIVERY>/live/shots.json --site <tree>/dist
import { mkdirSync, writeFileSync } from "node:fs";
import { createProjection, marginFor } from "../../../src/render/transform.ts";
import { DELIVERY, worldOf } from "./common.ts";

const OUT = `${DELIVERY}/live`;
mkdirSync(OUT, { recursive: true });
const world = worldOf(42);
const cap = world.settlements[0]!;
const proj = createProjection(world.recipe.gridW, world.recipe.gridH, 1500, marginFor(1500));
const cx = proj.px(cap.x) / proj.widthPx;
const cy = proj.py(cap.y) / proj.heightPx;

const WAIT = `const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));const until=async(f,n=400)=>{for(let i=0;i<n;i++){try{if(f())return true;}catch(e){}await sleep(50);}return false;};`;
const DRAWN = `await until(()=>document.querySelector("#map > svg")&&window.__vellumRegion&&!(document.getElementById("status").textContent||"").trim());await sleep(600);`;
const ZOOM = (k: number): string => `{const vp=document.getElementById("map-viewport");const W=vp.clientWidth,H=vp.clientHeight;window.__vellumZoomTo({k:${k},x:W/2-${cx}*${k}*W,y:H/2-${cy}*${k}*H});}`;
const BAND3 = `${ZOOM(8)}await until(()=>{const s=window.__vellumRegion();return s.committed&&s.band===3&&!document.querySelector("#map .survey-pencil");},400);await sleep(1200);`;
const RECT = (sel: string): string => `(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;const r=e.getBoundingClientRect();return{x:Math.round(r.left),y:Math.round(r.top),w:+r.width.toFixed(1),h:+r.height.toFixed(1)};})()`;
const PROBE = `JSON.stringify({scrollWidth:document.documentElement.scrollWidth,zoom:window.__vellumZoomState?window.__vellumZoomState():null,region:window.__vellumRegion?window.__vellumRegion():null,viewport:${RECT("#map-viewport")},inset:${RECT("#map .region-inset")},cutting:${RECT(".cuttings img")},pfSheet:${RECT("#sheet")},thumb:${RECT(".contents .thumb")},loupe:${RECT(".loupe .loupe-glass")},caption:(document.getElementById("caption")||{}).textContent||null,hold:(document.getElementById("zoom-hold")||{getAttribute:()=>null}).getAttribute("aria-pressed")})`;

const url = "/explorer/#seed=42&style=antique";
type Shot = { url: string; width: number; height: number; mobile: false; out: string; waitMs: number; script?: string; scriptWaitMs?: number; probe: string };
const shot = (name: string, width: number, height: number, script: string, u = url): Shot => ({ url: u, width, height, mobile: false, out: `${OUT}/${name}.png`, waitMs: 1500, script: `(async()=>{${WAIT}${script}})()`, scriptWaitMs: 600, probe: PROBE });
const shots: Shot[] = [
  shot("live-b3-1440x900", 1440, 900, `${DRAWN}${BAND3}`),
  shot("live-b3-1024x768", 1024, 768, `${DRAWN}${BAND3}`),
  shot("live-held16-1440x900", 1440, 900, `${DRAWN}${BAND3}document.getElementById("zoom-hold").click();await sleep(300);${ZOOM(16)}await sleep(1500);`),
  shot("live-held24-1440x900", 1440, 900, `${DRAWN}${BAND3}document.getElementById("zoom-hold").click();await sleep(300);${ZOOM(24)}await sleep(1500);`),
  shot("live-loupe-1440x900", 1440, 900, `${DRAWN}${BAND3}document.getElementById("zoom-loupe").click();await sleep(300);{const v=document.getElementById("map-viewport");const r=v.getBoundingClientRect();for(const t of ["pointermove","mousemove"])v.dispatchEvent(new (t==="pointermove"?PointerEvent:MouseEvent)(t,{bubbles:true,clientX:r.left+r.width/2,clientY:r.top+r.height/2,pointerType:"mouse"}));}await sleep(1500);`),
  shot("live-drawer-1440x900", 1440, 900, `${DRAWN}${BAND3}{const e=document.querySelector("#map .region-inset .dog-ear");if(e)e.click();}await sleep(1200);document.getElementById("chart-drawer-tab").click();await until(()=>{const i=document.querySelector(".cuttings img");return i&&i.complete&&i.naturalWidth>0;},300);await sleep(900);`),
  shot("live-portfolio-1440x900", 1440, 900, `await until(()=>document.querySelector(".pf-sheet svg"),400);await sleep(1500);`, "/explorer/portfolio/"),
];
writeFileSync(`${OUT}/shots.json`, JSON.stringify(shots, null, 1));
console.log(`${shots.length} live shots; the capital at sheet fraction ${cx.toFixed(4)}, ${cy.toFixed(4)}`);
