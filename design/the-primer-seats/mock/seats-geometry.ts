// Issue #1248 round: the rects home's pieces stand at today, at the 1024 floor and at 1280, read off the built page before any direction is drawn, so each direction is drawn against measured geometry rather than a picture.
// node out/1248/mock/seats-geometry.ts
import { join } from "node:path";
import { script } from "./drive.ts";
import { OUT } from "./seats-paths.ts";
import { probeOf, shoot } from "./seats-shoot.ts";

const GEO = `JSON.stringify((()=>{const r=(e)=>{if(!e)return null;const b=e.getBoundingClientRect();return{l:Math.round(b.left),t:Math.round(b.top),r:Math.round(b.right),b:Math.round(b.bottom)};};
const st=Object.fromEntries([...document.querySelectorAll(".lf-station")].map((s)=>[s.dataset.station,{glyph:r(s.querySelector(".lf-station-glyph")),slip:r(s.querySelector(".lf-station-slip"))}]));
return{w:innerWidth,h:innerHeight,stations:st,legend:r(document.getElementById("lf-legend")),head:r(document.querySelector(".lf-legend-head")),btns:[...document.querySelectorAll(".lf-legend-btn")].map(r),glass:r(document.querySelector(".corner.br")),glassBtns:[...document.querySelectorAll(".corner.br button")].map(r),seed:r(document.getElementById("seed-form")),notice:r(document.querySelector(".notice-stamp")),coords:r(document.getElementById("lf-coords")),more:r(document.querySelector(".lf-more")),chrome:r(document.querySelector("header.chrome")),sheet:r(document.getElementById("lf-sheet"))};})())`;

const shots = ([[1024, 768], [1280, 800]] as const).map(([w, h]) => ({ url: "/", width: w, height: h, mobile: false as const, out: join(OUT, "measure", "geometry", `home-${w}.png`), waitMs: 1200, script: script([]), scriptWaitMs: 300, probe: GEO }));
const res = shoot("geometry", shots);
for (const r of res) console.log(JSON.stringify(probeOf(r)));
