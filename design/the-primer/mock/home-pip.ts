// Issue #1155 round, Alex's N7 ("Add a new pip for the guide"): the Primer as a station pip on home's chart, drawn over the real built home page. Home's stations are buttons seated at a place's chart fraction (`homeStations` and `howStation` in `src/site/home/stations.ts`, the places from `homeStage` in `src/site/home/stage-data.ts`); the pip is the How It Works pip's own markup, cloned and re-seated, with a card cloned from its card. Two moorings: the chart's key (its heading at 1236.7, 783.4 on the 1500-wide committed antique chart of seed 42) and Nailo on the western shore (a place `homeStage` gives). The probe reads the pip and its slip against every other station, the Glass, the seed card and the legend row; a third arm adds a fifth press to the legend row and counts its lines. Every word is a stand-in for the seats round.
// node out/1155/mock/home-pip.ts   then shoot measure/home-pip-shots.json (--site <tree>/dist --reduced-motion) into measure/home-pip-results.json   then   node out/1155/mock/home-pip.ts read
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homeStage } from "../../../src/site/home/stage-data.ts";
import { script } from "./drive.ts";
import { OUT_1155 } from "./paths.ts";

const j = JSON.stringify;
const nailo = homeStage().dots.find((d) => d.name === "Nailo")!;
const poalo = homeStage().dots.find((d) => d.name === "Poalo")!;
const MOORINGS = {
  key: { nx: 1236.7 / 1500, ny: 783.43 / 1157.93, sea: true, where: "at the key, where the chart explains itself" },
  nailo: { nx: nailo.nx, ny: nailo.ny, sea: false, where: "at Nailo, on the western shore" },
  poalo: { nx: poalo.nx, ny: poalo.ny, sea: false, where: "at Poalo, a harbour of the Ratoa Atolls" },
} as const;
type Mooring = keyof typeof MOORINGS;

export const pipAtJs = (at: { readonly nx: number; readonly ny: number; readonly sea: boolean; readonly where: string }, open: boolean, legend: boolean): string => {
  return `{const how=document.querySelector('.lf-station[data-station="how"]');const pip=how.cloneNode(true);pip.dataset.station="primer";pip.dataset.nx=${j(String(at.nx))};pip.dataset.ny=${j(String(at.ny))};
pip.style.left=${j(`${(at.nx * 100).toFixed(2)}%`)};pip.style.top=${j(`${(at.ny * 100).toFixed(2)}%`)};pip.classList.toggle("at-sea",${at.sea});pip.setAttribute("aria-label","The Primer. Learn one.");
const n=pip.querySelector(".lf-station-name");if(n)n.textContent="The Primer";const v=pip.querySelector(".lf-station-verb");if(v)v.textContent="Learn one";how.after(pip);
${open ? `const hc=document.getElementById("lf-card-how");const c=hc.cloneNode(true);c.id="lf-card-primer";c.setAttribute("aria-label","The Primer");c.querySelector(".lf-card-verb").textContent="Learn one";c.querySelector(".lf-card-title").textContent="The Primer";c.querySelector(".lf-card-where").textContent=${j(at.where)};
const sc=c.querySelector(".lf-card-scroll");const p=document.createElement("p");p.className="lf-card-prose";p.textContent="Every room, one small step at a time. Each step opens its room already set for it, and the room points at the control to touch.";sc.replaceWith(p);
const go=document.createElement("a");go.className="lf-card-enter";go.href="/primer/";go.textContent="Enter the room \\u2192";c.appendChild(go);hc.after(c);c.hidden=false;c.style.visibility="visible";c.style.opacity="1";` : ""}
${legend ? `const row=document.querySelector("#lf-legend");const b=row.querySelector(".lf-legend-btn").cloneNode(true);b.innerHTML='<span class="lf-legend-verb">Learn one</span> <span class="lf-legend-room">The Primer</span>';row.querySelector(".lf-legend-btn").parentNode.appendChild(b);` : ""}
window.dispatchEvent(new Event("resize"));for(let k=0;k<8;k++)await tick();}`;
};
const pipJs = (m: Mooring, open: boolean, legend: boolean): string => pipAtJs(MOORINGS[m], open, legend);

export const PROBE = `JSON.stringify((()=>{const r=(e)=>{if(!e)return null;const b=e.getBoundingClientRect();return{l:b.left,t:b.top,r:b.right,b:b.bottom};};
const ov=(a,b)=>!a||!b?0:Math.round(Math.max(0,Math.min(a.r,b.r)-Math.max(a.l,b.l))*Math.max(0,Math.min(a.b,b.b)-Math.max(a.t,b.t)));
const pip=document.querySelector('.lf-station[data-station="primer"]');const pg=r(pip&&(pip.querySelector(".lf-station-glyph")||pip)),ps=r(pip&&pip.querySelector(".lf-station-slip"));
const others=[...document.querySelectorAll(".lf-station")].filter((e)=>e!==pip);
const gap=(a)=>Math.round(Math.min(...others.map((o)=>{const g=r(o.querySelector(".lf-station-glyph")||o);const dx=Math.max(0,g.l-a.r,a.l-g.r),dy=Math.max(0,g.t-a.b,a.t-g.b);return Math.hypot(dx,dy);}))*10)/10;
const slipOv=others.reduce((n,o)=>n+ov(ps,r(o.querySelector(".lf-station-slip")))+ov(ps,r(o.querySelector(".lf-station-glyph"))),0);
const notice=r(document.querySelector(".notice-stamp")),glass=r(document.querySelector(".corner.br")),seed=r(document.getElementById("seed-form")),legend=r(document.getElementById("lf-legend"));
const btns=[...document.querySelectorAll("#lf-legend .lf-legend-btn")].map((b)=>Math.round(b.getBoundingClientRect().top));
const card=r(document.getElementById("lf-card-primer"));
return{pip:pg,inWindow:!!pg&&pg.l>=0&&pg.t>=0&&pg.r<=innerWidth&&pg.b<=innerHeight,nearestStation:pg?gap(pg):null,slipOverOthers:slipOv,overGlass:ov(pg,glass)+ov(ps,glass),overSeedCard:ov(pg,seed)+ov(ps,seed),overLegend:ov(pg,legend)+ov(ps,legend),overNotice:ov(pg,notice)+ov(ps,notice),legendLines:new Set(btns).size,legendPresses:btns.length,legendToGlass:legend&&glass?Math.round(glass.l-legend.r):null,legendWidth:legend?Math.round(legend.r-legend.l):null,legendOverEach:Object.fromEntries([...document.querySelectorAll(".lf-station")].map((o)=>[o.id||o.dataset.station||o.className,ov(legend,r(o.querySelector(".lf-station-slip")))+ov(legend,r(o.querySelector(".lf-station-glyph")))])),legendOverStations:[...document.querySelectorAll(".lf-station")].reduce((n,o)=>n+ov(legend,r(o.querySelector(".lf-station-slip")))+ov(legend,r(o.querySelector(".lf-station-glyph"))),0),cardInWindow:card?card.l>=0&&card.t>=0&&card.r<=innerWidth&&card.b<=innerHeight:null,cardOverGlass:ov(card,glass)};})())`;

type Arm = { readonly key: string; readonly m: Mooring; readonly w: number; readonly h: number; readonly open: boolean; readonly legend: boolean };
const arms: Arm[] = [];
for (const [w, h] of [[1280, 800], [1024, 768]] as const) {
  for (const m of ["key", "nailo", "poalo"] as const) arms.push({ key: `home-pip-${m}-${w}`, m, w, h, open: false, legend: false });
  arms.push({ key: `home-pip-poalo-card-${w}`, m: "poalo", w, h, open: true, legend: false });
  arms.push({ key: `home-pip-poalo-legend-${w}`, m: "poalo", w, h, open: false, legend: true });
  arms.push({ key: `home-pip-key-card-${w}`, m: "key", w, h, open: true, legend: false });
  arms.push({ key: `home-pip-key-legend-${w}`, m: "key", w, h, open: false, legend: true });
}

const mode = import.meta.url === `file://${process.argv[1]}` ? (process.argv[2] ?? "shots") : "none";
if (mode === "none") {
  // imported for the mooring sweep
} else if (mode === "shots") {
  const shots = arms.flatMap((a) => [
    { url: "/", width: a.w, height: a.h, mobile: false, out: join(OUT_1155, "shots", "stills", `${a.key}.png`), waitMs: 1200, script: script([{ kind: "eval", js: pipJs(a.m, a.open, a.legend) }]), scriptWaitMs: 400, probe: PROBE },
  ]);
  mkdirSync(join(OUT_1155, "shots", "stills"), { recursive: true });
  writeFileSync(join(OUT_1155, "measure", "home-pip-shots.json"), JSON.stringify(shots, null, 1));
  console.log(`${shots.length} shots`);
} else {
  const results = JSON.parse(readFileSync(join(OUT_1155, "measure", "home-pip-results.json"), "utf8")) as Array<{ probe: string; http4xx: string[]; consoleErrors: string[] }>;
  const rows = results.map((r, i) => {
    const a = arms[i]!;
    const p = JSON.parse(r.probe) as Record<string, unknown>;
    return `| \`shots/stills/${a.key}.png\` | ${a.w} | ${MOORINGS[a.m].where} | ${p["inWindow"] ? "yes" : "NO"} | ${p["nearestStation"]} px | ${p["slipOverOthers"]} | ${p["overGlass"]} | ${p["overSeedCard"]} | ${p["overLegend"]} | ${p["overNotice"]} | ${p["legendPresses"]} on ${p["legendLines"]} line${p["legendLines"] === 1 ? "" : "s"} | ${p["legendWidth"]} px | ${p["legendToGlass"]} px | ${Object.entries((p["legendOverEach"] ?? {}) as Record<string, number>).filter(([, v]) => v > 0).map(([k, v]) => `${k} ${v}`).join(", ") || "none"} | ${a.open ? `${p["cardInWindow"] ? "in the window" : "OFF the window"}, ${p["cardOverGlass"]} over the Glass` : ""} | ${r.http4xx.length + r.consoleErrors.length} |`;
  });
  writeFileSync(
    join(OUT_1155, "measure", "home-pip.md"),
    `# A station pip for the Primer on home, measured\n\nThe How It Works pip's own markup, cloned onto home's real chart (\`node out/1155/mock/home-pip.ts shots\`, then \`node scripts/design/shoot.ts <that list> --site <tree>/out/1155/site --reduced-motion\`, then \`node out/1155/mock/home-pip.ts table\`, all from the design tree, over its built site at 089881ad, reduced motion). Areas are square CSS px shared with each piece; "nearest station" is the edge distance from the pip's glyph to the nearest other station's glyph.\n\n| still | width | where it moors | in the window | nearest station | slip over other stations | over the Glass | over the seed card | over the legend row | over the Notice to Mariners | legend row | row width | row to the Glass | row over a station (its slip and glyph) | card | 4xx and errors |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|\n${rows.join("\n")}\n`,
  );
  console.log(rows.join("\n"));
}
