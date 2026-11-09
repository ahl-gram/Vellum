// Issue #1155 round, the second pass: direction D (the recommendation) and C at the 1024 by 768 floor and in every chart dress, each with a probe reporting the step's slip against the chart, the Glass and the ringed control; and the "learn this room" press on every room's trail line, measured against the corner and the cluster's other links (the 24 px a thumb needs, DR16).
// node out/1155/mock/extra.ts   then shoot measure/extra-shots.json (--site <tree>/out/1155/site --reduced-motion) into measure/extra-results.json   then   node out/1155/mock/extra.ts read
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { script } from "./drive.ts";
import { learnPressJs, relayJs, ringJs, type StripOpts } from "./inject.ts";
import { EXPLORER } from "./ladder/explorer.ts";
import type { Step } from "./ladder/shape.ts";
import { OUT_1155 } from "./paths.ts";

const land = EXPLORER.lessons.find((l) => l.id === "land")!;
const archipelago = land.steps[0]!;
const islands = land.steps[1]!;
const fromPrimer = (step: Step, done?: string): StripOpts => ({
  verb: "From The Primer",
  head: "The Explorer · the Land, step 2 of 6",
  step,
  dots: { total: 6, done: 1 },
  left: [`<a href="/primer/#explorer-land">Back to The Primer</a>`],
  right: [`<a href="#" class="dim">Next step</a>`],
  ...(done ? { done: { next: done } } : {}),
  seat: { css: "#broadside", side: "left" },
});
const tour = (step: Step): StripOpts => ({ verb: "Learning the room", head: "The Land, step 1 of 6", step, dots: { total: 6, done: 0 }, left: [`<a href="#">Leave the lesson</a>`], right: [`<a href="#" class="dim">Skip</a>`], seat: { css: "#broadside", side: "left" } });

const OVERLAP = `JSON.stringify((()=>{const r=(s)=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();return{l:Math.round(b.left),t:Math.round(b.top),r:Math.round(b.right),b:Math.round(b.bottom)};};
const s=r(".strip1155"),sheet=r("#sheet"),glass=r(".corner.br"),ring=r(".ring1155"),slip=r("#broadside"),legend=r(".legend");
const ov=(a,b)=>!a||!b?0:Math.max(0,Math.min(a.r,b.r)-Math.max(a.l,b.l))*Math.max(0,Math.min(a.b,b.b)-Math.max(a.t,b.t));
const area=(a)=>a?(a.r-a.l)*(a.b-a.t):0;
return{strip:s,overChart:sheet&&s?Math.round(100*ov(s,sheet)/area(sheet)):0,overGlass:ov(s,glass),overSlip:ov(s,slip),overLegend:ov(s,legend),overRing:ov(s,ring),inWindow:!!s&&s.l>=0&&s.t>=0&&s.r<=innerWidth&&s.b<=innerHeight};})())`;

const LEARN = `JSON.stringify((()=>{const b=(e)=>{const r=e.getBoundingClientRect();return{l:r.left,t:r.top,r:r.right,b:r.bottom};};
const press=document.querySelector(".learn1155");if(!press)return{missing:true};const p=b(press);
const corner=b(document.querySelector(".corner.tr"));
const others=[...document.querySelectorAll("header.chrome a, header.chrome summary, header.chrome button")].filter((e)=>e!==press&&e.offsetParent!==null).map((e)=>({e,x:b(e)}));
const dist=(a,c)=>{const dx=Math.max(0,c.l-a.r,a.l-c.r),dy=Math.max(0,c.t-a.b,a.t-c.b);return Math.hypot(dx,dy);};
const near=others.map((o)=>({name:(o.e.textContent||"").trim().slice(0,30),d:dist(p,o.x)})).sort((x,y)=>x.d-y.d)[0];
return{pressRight:Math.round(p.r),cornerLeft:Math.round(corner.l),toCorner:Math.round(corner.l-p.r),sameRow:!(corner.b<=p.t||p.b<=corner.t),nearest:near?{name:near.name,d:Math.round(near.d*10)/10}:null,wrapped:Math.round(p.b-p.t)>24};})())`;

type Arm = { readonly key: string; readonly url: string; readonly w: number; readonly h: number; readonly js: string; readonly probe: string; readonly still: boolean };
const arms: Arm[] = [];
const D_AT = "/explorer/#seed=42&type=archipelago";
for (const [w, h] of [[1024, 768], [1280, 800]] as const) {
  arms.push({ key: `d-explorer-${w}`, url: D_AT, w, h, js: ringJs("[data-row=islands]", fromPrimer(islands)), probe: OVERLAP, still: w === 1024 });
  arms.push({ key: `d-explorer-done-${w}`, url: D_AT, w, h, js: `{const e=document.getElementById("islands");e.value="20";e.dispatchEvent(new Event("input",{bubbles:true}));e.dispatchEvent(new Event("change",{bubbles:true}));for(let j=0;j<8;j++)await tick();await until("settled",settled);}` + ringJs("[data-row=islands]", fromPrimer(islands, "Next, sizes ›")), probe: OVERLAP, still: w === 1024 });
  arms.push({ key: `c-explorer-${w}`, url: "/explorer/#seed=42", w, h, js: learnPressJs("learn this room") + ringJs("[data-row=type]", tour(archipelago)), probe: OVERLAP, still: w === 1024 });
}
for (const style of ["ink", "topographic", "nautical"]) {
  arms.push({ key: `d-explorer-${style}-1280`, url: `${D_AT}&style=${style}`, w: 1280, h: 800, js: ringJs("[data-row=islands]", fromPrimer(islands)), probe: OVERLAP, still: true });
}
const ROOMS = ["/explorer/#seed=42", "/writing-room/", "/reading-room/#seed=42", "/print-room/#seed=42", "/prospect/#seed=42&i=0", "/ribbon/#seed=42&a=0", "/explorer/portfolio/", "/seed-of-the-day/", "/gallery/"];
for (const room of ROOMS) {
  const name = (room.split("/")[1] || "home") + (room.includes("portfolio") ? "-portfolio" : "");
  for (const [w, h] of [[1024, 768], [1280, 800]] as const) arms.push({ key: `learn-${name}-${w}`, url: room, w, h, js: learnPressJs("learn this room") + relayJs, probe: LEARN, still: false });
}

const mode = process.argv[2] ?? "shots";
if (mode === "shots") {
  const shots = arms.map((a) => ({
    url: a.url,
    width: a.w,
    height: a.h,
    mobile: false,
    out: join(OUT_1155, a.still ? "shots/stills" : "measure/extra", `${a.key}.png`),
    waitMs: 400,
    script: script([{ kind: "eval", js: a.js }]),
    scriptWaitMs: 400,
    probe: a.probe,
  }));
  mkdirSync(join(OUT_1155, "measure", "extra"), { recursive: true });
  writeFileSync(join(OUT_1155, "measure", "extra-shots.json"), JSON.stringify(shots, null, 1));
  console.log(`${shots.length} shots`);
} else {
  const results = JSON.parse(readFileSync(join(OUT_1155, "measure", "extra-results.json"), "utf8")) as Array<{ probe: string; http4xx: string[]; consoleErrors: string[] }>;
  if (results.length !== arms.length) throw new Error(`${arms.length} arms against ${results.length} results`);
  const slips: string[] = [];
  const learn: string[] = [];
  results.forEach((r, i) => {
    const a = arms[i]!;
    const p = JSON.parse(r.probe) as Record<string, unknown>;
    if (a.key.startsWith("learn-")) {
      const q = p as { toCorner: number; sameRow: boolean; nearest: { name: string; d: number } | null; wrapped: boolean };
      learn.push(`| ${a.url.split("#")[0]} | ${a.w} | ${q.sameRow ? q.toCorner : "below the corner"} | ${q.nearest ? `${q.nearest.d} px, to "${q.nearest.name}"` : "none"} | ${q.wrapped ? "yes" : "no"} |`);
    } else {
      const q = p as { overChart: number; overGlass: number; overSlip: number; overLegend: number; overRing: number; inWindow: boolean };
      slips.push(`| ${a.key} | ${a.w} | ${q.overChart}% | ${q.overGlass} | ${q.overSlip} | ${q.overLegend} | ${q.overRing} | ${q.inWindow ? "yes" : "NO"} | ${r.http4xx.length + r.consoleErrors.length} |${a.still ? ` \`shots/stills/${a.key}.png\`` : ""} |`);
    }
  });
  writeFileSync(
    join(OUT_1155, "measure", "slip-and-press.md"),
    `# The step's slip in the room, and the trail line's press, measured\n\nRead off the built rooms at 089881ad with reduced motion (\`node out/1155/mock/extra.ts\`).\n\n## The slip D and C seat beside the Broadside\n\n"Over the chart" is the share of the chart's own box the slip covers; the other columns are the area, in square CSS px, it shares with the Glass, the Broadside, the press row and the ring around the step's own control. "In the window" is whether the whole slip is on screen.\n\n| still | width | over the chart | over the Glass | over the Broadside | over the press row | over the ring | in the window | 4xx and errors | file |\n|---|---|---|---|---|---|---|---|---|---|\n${slips.join("\n")}\n\n## The "learn this room" press on the trail line (direction C's way in, and option 2(d))\n\n"To the corner" is the room's corner's left edge less the press's right edge where the two share a row. "Nearest" is the distance from the press to the nearest other link or press in the head cluster; the house holds every trail link 24 px clear of the cluster's other links (\`handbook/specs/ui-design.md\`, DR16).\n\n| room | width | to the corner | nearest | wrapped onto two lines |\n|---|---|---|---|---|\n${learn.join("\n")}\n`,
  );
  console.log("wrote measure/slip-and-press.md");
}
