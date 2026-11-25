// Issue #1248 round, item 5: the Primer's place on the chart of the atelier (owed by Sub 5: a `PLACES` entry, a road, and the dashed track of the Q & A alias, N5), drawn into the real panel's SVG on the built Questions & Answers page (Q & A the place you stand on) and on the Primer's own page (the Issue #1155 round's page laid over the same document room, the Primer the place you stand on), at three moorings. Each is measured for its label against every other word, pip and the rose in the panel. Writes shots/5-atelier/ and measure/5-atelier.md.
// node out/1248/mock/seats-atelier.ts
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { PLACES, roadPath } from "../../../src/layouts/atelier-chart.ts";
import { script } from "./drive.ts";
import { primerJs } from "./inject.ts";
import { relayJs } from "./seats-home-js.ts";
import { measureFile, pictureUrl, SHA, shotDir } from "./seats-paths.ts";
import { probeOf, shoot, type Shot } from "./seats-shoot.ts";

const j = JSON.stringify;
type Mooring = { key: string; caption: string; x: number; y: number; rank: "village" | "isle"; road: string };
const MOORINGS: Mooring[] = [
  { key: "a-at-the-landing", caption: "A, a village at the landing, on the road up from Vellum: the first place ashore", x: 104, y: 266, rank: "village", road: "/" },
  { key: "b-an-isle-of-its-own", caption: "B, an isle of its own off the south-west shore, a road from Vellum as the Atlas has", x: 52, y: 376, rank: "isle", road: "/" },
  { key: "c-on-the-south-shore", caption: "C, a village on the south shore beside Q & A, on a road from the Reading Room", x: 214, y: 316, rank: "village", road: "/reading-room/" },
];
const PIP_R = { village: 3, isle: 4 } as const;
const placeJs = (m: Mooring, here: boolean): string => {
  const from = PLACES[m.road]!;
  const qa = PLACES["/faq/"]!;
  const curve = (p: { x: number; y: number }, q: { x: number; y: number }): string => `M${p.x} ${p.y} Q ${(p.x + q.x) / 2 + 12} ${(p.y + q.y) / 2 - 10} ${q.x} ${q.y}`;
  if (roadPath(["/", "/explorer/"]) !== curve(PLACES["/"]!, PLACES["/explorer/"]!)) throw new Error("the panel's road curve has changed; redraw with roadPath's own");
  return `{const NS="http://www.w3.org/2000/svg";const svg=document.querySelector(".atelier svg");const rose=svg.querySelector(".rose");
const mk=(t,a)=>{const e=document.createElementNS(NS,t);for(const[k,v]of Object.entries(a))e.setAttribute(k,v);return e;};
const firstPlace=svg.querySelector(".place");
svg.insertBefore(mk("path",{class:"road primer1248",d:${j(curve(from, m))}}),firstPlace);
svg.insertBefore(mk("path",{class:"road track primer1248",d:${j(curve(qa, m))}}),firstPlace);
${here ? `const old=svg.querySelector("g.place.here");if(old){const a=mk("a",{href:"/faq/",class:old.getAttribute("class").replace(" here","")});old.querySelectorAll(".pip,text").forEach((n)=>a.appendChild(n));old.replaceWith(a);}svg.querySelector("g.you")?.remove();` : ""}
const g=mk(${here ? `"g"` : `"a"`},{class:"place ${m.rank}${here ? " here" : ""} primer1248"${here ? "" : `,href:"/primer/"`}});
${here ? `g.appendChild(mk("circle",{class:"halo",cx:"${m.x}",cy:"${m.y}",r:"16"}));` : ""}
g.appendChild(mk("circle",{class:"pip",cx:"${m.x}",cy:"${m.y}",r:"${PIP_R[m.rank]}"}));const t=mk("text",{x:"${m.x}",y:"${m.y - 11}"});t.textContent="The Primer";g.appendChild(t);svg.insertBefore(g,rose);
${here ? `const you=mk("g",{class:"you"});you.appendChild(mk("path",{d:"M${m.x} ${m.y + 19} L${m.x} ${m.y + 29}"}));const yt=mk("text",{x:"${m.x}",y:"${m.y + 42}"});yt.textContent="you are here";you.appendChild(yt);svg.insertBefore(you,rose);` : ""}}`;
};
const OPEN = `{const f=document.querySelector(".atelier-fold");f.open=true;for(let k=0;k<4;k++)await tick();}`;
const PROBE = `JSON.stringify((()=>{const svg=document.querySelector(".atelier svg");const R=(e)=>{const b=e.getBoundingClientRect();return{l:b.left,t:b.top,r:b.right,b:b.bottom};};
const ov=(a,b)=>Math.max(0,Math.min(a.r,b.r)-Math.max(a.l,b.l))*Math.max(0,Math.min(a.b,b.b)-Math.max(a.t,b.t));
const s=svg.getBoundingClientRect();const k=600/s.width;
const texts=[...svg.querySelectorAll("text")].map((t)=>({n:t.textContent,b:R(t),mine:!!t.closest(".primer1248")||(t.closest(".you")&&document.querySelector(".primer1248.here"))}));
const pips=[...svg.querySelectorAll("circle.pip")].map((c)=>({n:c.parentNode.querySelector("text")?.textContent,b:R(c),mine:!!c.closest(".primer1248")}));
const rose=R(svg.querySelector(".rose"));const mine=texts.filter((t)=>t.mine);const others=texts.filter((t)=>!t.mine);
const hits=[];for(const m of mine){for(const o of others)if(ov(m.b,o.b)>0)hits.push(m.n+" over "+o.n+" "+Math.round(ov(m.b,o.b)*k*k));for(const p of pips)if(!p.mine&&ov(m.b,p.b)>0)hits.push(m.n+" over the pip of "+p.n);if(ov(m.b,rose)>0)hits.push(m.n+" over the rose");}
for(const p of pips.filter((p)=>p.mine))for(const o of others)if(ov(p.b,o.b)>0)hits.push("its pip under "+o.n);
const gap=(a,b)=>Math.hypot(Math.max(0,b.l-a.r,a.l-b.r),Math.max(0,b.t-a.b,a.t-b.b))*k;
const label=mine.find((t)=>t.n==="The Primer");const pip=pips.find((p)=>p.mine);
const nearLabel=label?others.map((o)=>({n:o.n,d:gap(label.b,o.b)})).sort((a,b)=>a.d-b.d)[0]:null;
const nearPip=pip?pips.filter((p)=>!p.mine).map((o)=>({n:o.n,d:Math.hypot((pip.b.l+pip.b.r)/2-(o.b.l+o.b.r)/2,(pip.b.t+pip.b.b)/2-(o.b.t+o.b.b)/2)*k})).sort((a,b)=>a.d-b.d)[0]:null;
const panel=R(document.querySelector(".atelier"));
return{hits,nearLabel:nearLabel&&{n:nearLabel.n,d:Math.round(nearLabel.d*10)/10},nearPip:nearPip&&{n:nearPip.n,d:Math.round(nearPip.d*10)/10},panel:{w:Math.round(panel.r-panel.l),h:Math.round(panel.b-panel.t),inWindow:panel.b<=innerHeight&&panel.r<=innerWidth}};})())`;

type Arm = { key: string; caption: string; url: string; js: string };
const primerPage = primerJs({ seat: "ninth", label: "Primer", pictures: pictureUrl, nextRoads: true });
const arms: Arm[] = [
  { key: "control-in-q-and-a", caption: "Today, opened in Questions & Answers", url: "/faq/", js: OPEN },
  ...MOORINGS.map((m) => ({ key: `${m.key}-in-q-and-a`, caption: `${m.caption}; opened in Questions & Answers, the dashed track the second way in`, url: "/faq/", js: OPEN + placeJs(m, false) })),
  ...MOORINGS.map((m) => ({ key: `${m.key}-on-the-primer`, caption: `${m.caption}; opened on the Primer's own page, the pin on it`, url: "/faq/", js: primerPage + OPEN + placeJs(m, true) })),
];
const shots: Shot[] = [];
for (const a of arms) {
  shots.push({ url: a.url, width: 1280, height: 800, mobile: false, out: join(shotDir("5-atelier"), `${a.key}.png`), waitMs: 400, script: script([{ kind: "eval", js: a.js + relayJs }]), scriptWaitMs: 300, probe: PROBE });
  shots.push({ url: a.url, width: 1280, height: 800, mobile: false, out: join(shotDir("5-atelier"), `${a.key}-2x.png`), waitMs: 400, script: script([{ kind: "eval", js: a.js + relayJs }]), scriptWaitMs: 300, clip: { x: 20, y: 150, width: 580, height: 440, scale: 2 } });
}
const res = shoot("5-atelier", shots).filter((r) => r.probe !== null);
type P = { hits: string[]; nearLabel: { n: string; d: number } | null; nearPip: { n: string; d: number } | null; panel: { w: number; h: number; inWindow: boolean } };
const ps = res.map((r) => probeOf<P>(r));
const lines = arms.map((a, i) => {
  const p = ps[i]!;
  return `| ${a.key} | ${p.hits.length ? p.hits.join("; ") : "none"} | ${p.nearLabel ? `${p.nearLabel.d} to "${p.nearLabel.n}"` : ""} | ${p.nearPip ? `${p.nearPip.d} to ${p.nearPip.n}` : ""} | ${p.panel.w} by ${p.panel.h}, ${p.panel.inWindow ? "in the window" : "CUT"} | \`shots/5-atelier/${a.key}.png\` |`;
});
writeFileSync(
  measureFile("5-atelier.md"),
  `# Item 5: the Primer's place on the chart of the atelier, measured\n\nThe real panel on the built Questions & Answers page at ${SHA.slice(0, 8)}, 1280 by 800, reduced motion, with the Primer's place, its road (drawn by the panel's own curve, \`roadPath\` in \`src/layouts/atelier-chart.ts\`) and the dashed track from Q & A laid into its SVG (\`node out/1248/mock/seats-atelier.ts\` from the design tree). The panel is 34rem wide at every window, so 1280 stands for 1024 too. "Collisions" lists any box the Primer's words or pip share with another word, pip or the rose; distances are in the panel's own units (its viewBox is 600 wide). Every result came back with no 4xx and no console error.\n\n| arm | collisions | its label to the nearest word | its pip to the nearest pip | panel | still |\n|---|---|---|---|---|---|\n${lines.join("\n")}\n`,
);
console.log(lines.join("\n"));
