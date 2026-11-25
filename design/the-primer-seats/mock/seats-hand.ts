// Issue #1248 round, item 4: where the pointing hand's slip stands in the Explorer (ruling 1), drawn at the islands step (the Land, step 2 of 6) over the real built room at 1024 by 768 and 1280 by 800, as the reader arrives and once the step is done (islands at 20), today's room beside it. The ring and the manicule are the Issue #1155 round's (`ringJs` in inject.ts); the slip's seats are this round's. Writes shots/4-hand/ and measure/4-hand.md.
// node out/1248/mock/seats-hand.ts
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { script } from "./drive.ts";
import { ringJs, type StripOpts } from "./inject.ts";
import { EXPLORER } from "./ladder/explorer.ts";
import { actHtml } from "./primer.ts";
import { HAND_PROBE } from "./seats-hand-probe.ts";
import { SLIP_CSS } from "./seats-slip.ts";
import { relayJs, styleJs } from "./seats-home-js.ts";
import { measureFile, SHA, shotDir } from "./seats-paths.ts";
import { probeOf, shoot, type Shot } from "./seats-shoot.ts";

const j = JSON.stringify;
const islands = EXPLORER.lessons.find((l) => l.id === "land")!.steps[1]!;
const AT = "/explorer/#seed=42&type=archipelago";
const RING = "[data-row=islands]";
const DONE = `{const e=document.getElementById("islands");e.value="20";e.dispatchEvent(new Event("input",{bubbles:true}));e.dispatchEvent(new Event("change",{bubbles:true}));for(let k=0;k<8;k++)await tick();await until("settled",settled);}`;
const fromPrimer: StripOpts = { verb: "From The Primer", head: "The Explorer · the Land, step 2 of 6", step: islands, dots: { total: 6, done: 1 }, left: [`<a href="/primer/#explorer-land">Back to The Primer</a>`], right: [`<a href="#" class="dim">Next step</a>`], seat: { css: "#broadside", side: "left" } };

const dots = `<span class="d">${Array.from({ length: 6 }, (_, i) => `<i class="${i < 1 ? "on" : i === 1 ? "now" : ""}"></i>`).join("")}</span>`;
const body = `<p class="h"><span class="v">From The Primer</span><span class="t">The Land, step 2 of 6</span>${dots}</p><p class="a">${actHtml(islands)}</p><p class="s">${islands.see}</p><div class="r"><a href="/primer/#explorer-land">Back to The Primer</a><a href="#" class="dim">Next step</a></div>`;
const slim = `<p class="h"><span class="v">From The Primer</span><span class="t">The Land, step 2 of 6</span>${dots}</p><p class="a">${actHtml(islands)}</p><div class="r"><a href="/primer/#explorer-land">Back to The Primer</a><a href="#" class="dim">Next step</a></div>`;
const note = `<span>${actHtml(islands)}</span>${dots}`;
const relay = relayJs + `for(let k=0;k<6;k++)await tick();`;

type Seat = "control" | "a-beside-the-broadside" | "b-in-the-head-cluster" | "b2-a-slim-line-under-the-trail" | "c-in-the-broadside" | "c2-in-the-broadsides-masthead" | "d-folded-to-a-tab" | "d2-one-line-beside-the-ring" | "e-at-the-foot";
const seatJs = (seat: Seat): string => {
  const css = styleJs("slip1248css", SLIP_CSS);
  switch (seat) {
    case "control":
      return "";
    case "a-beside-the-broadside":
      return ringJs(RING, fromPrimer);
    case "b-in-the-head-cluster":
      return css + `{const s=document.createElement("aside");s.className="slip1248 head-seat";s.setAttribute("aria-label","the step in hand");s.innerHTML=${j(body)};const h=document.querySelector("header.chrome");h.appendChild(s);s.style.maxWidth=Math.min(544,document.getElementById("broadside").getBoundingClientRect().left-h.getBoundingClientRect().left-24)+"px";}` + relay + ringJs(RING, null);
    case "b2-a-slim-line-under-the-trail":
      return css + `{const s=document.createElement("aside");s.className="slip1248 head-seat slim";s.setAttribute("aria-label","the step in hand");s.innerHTML=${j(slim)};const h=document.querySelector("header.chrome");h.appendChild(s);s.style.maxWidth=Math.min(620,document.getElementById("broadside").getBoundingClientRect().left-h.getBoundingClientRect().left-24)+"px";}` + relay + ringJs(RING, null);
    case "c-in-the-broadside":
      return css + `{const s=document.createElement("aside");s.className="slip1248 in-bill";s.setAttribute("aria-label","the step in hand");s.innerHTML=${j(body)};const b=document.querySelector("#broadside .slip-body")||document.getElementById("broadside");b.insertBefore(s,b.firstChild);}` + relay + ringJs(RING, null);
    case "c2-in-the-broadsides-masthead":
      return css + `{const head=document.querySelector("#broadside .slip-head");if(!head)throw new Error("no masthead");[...head.querySelectorAll(".card-verb,.card-title,.card-where,.fn")].forEach((e)=>{e.style.display="none";});const s=document.createElement("aside");s.className="slip1248 in-bill masthead";s.setAttribute("aria-label","the step in hand");s.innerHTML=${j(body)};head.appendChild(s);}` + relay + ringJs(RING, null);
    case "d2-one-line-beside-the-ring":
      return css + ringJs(RING, null) + `{const s=document.createElement("aside");s.className="slip1248 tab note";s.setAttribute("aria-label","the step in hand");s.innerHTML=${j(note)};document.body.appendChild(s);const r=window.__ring1155;const w=s.getBoundingClientRect();s.style.left=Math.max(12,r.left-6-w.width-58)+"px";s.style.top=(r.top+r.height/2-w.height/2)+"px";}`;
    case "d-folded-to-a-tab":
      return css + ringJs(RING, null) + `{const s=document.createElement("button");s.type="button";s.className="slip1248 tab";s.setAttribute("aria-label","From The Primer: the Land, step 2 of 6. Open the step.");s.innerHTML='<span>Step 2 of 6</span>'+${j(dots)};document.body.appendChild(s);const r=window.__ring1155;const w=s.getBoundingClientRect();s.style.left=Math.max(12,r.left-6-w.width-58)+"px";s.style.top=(r.top+r.height/2-w.height/2)+"px";}`;
    case "e-at-the-foot":
      return css + ringJs(RING, null) + `{const s=document.createElement("aside");s.className="slip1248 foot";s.setAttribute("aria-label","the step in hand");s.innerHTML=${j(body)};document.body.appendChild(s);const sheet=document.querySelector("#map > svg[data-vellum-style]").getBoundingClientRect();const lg=document.querySelector(".legend").getBoundingClientRect();const bs=document.getElementById("broadside").getBoundingClientRect();const gl=document.querySelector(".corner.br").getBoundingClientRect();s.style.width=Math.min(560,Math.min(bs.left,gl.left)-26-14)+"px";const h=s.getBoundingClientRect().height;s.style.left="26px";s.style.top=Math.max(sheet.top,lg.top-h-14)+"px";}`;
  }
};
const SEATS: readonly Seat[] = ["control", "a-beside-the-broadside", "b-in-the-head-cluster", "b2-a-slim-line-under-the-trail", "c-in-the-broadside", "c2-in-the-broadsides-masthead", "d-folded-to-a-tab", "d2-one-line-beside-the-ring", "e-at-the-foot"];
const WINDOWS = [[1024, 768], [1280, 800]] as const;
type Arm = { seat: Seat; w: number; h: number; done: boolean; style: string };
const arms: Arm[] = [];
for (const seat of SEATS) for (const [w, h] of WINDOWS) for (const done of [false, true]) arms.push({ seat, w, h, done, style: "antique" });
const DRESSED: Seat = (process.env["HAND_DRESSED"] as Seat | undefined) ?? "d-folded-to-a-tab";
for (const style of ["ink", "topographic", "nautical"]) arms.push({ seat: DRESSED, w: 1280, h: 800, done: true, style });

const fileOf = (a: Arm): string => `${a.seat}-${a.w}${a.done ? "-done" : ""}${a.style === "antique" ? "" : `-${a.style}`}`;
const shots: Shot[] = [];
for (const a of arms) {
  const url = a.style === "antique" ? AT : `${AT}&style=${a.style}`;
  const js = (a.done ? DONE : "") + seatJs(a.seat) + relay;
  shots.push({ url, width: a.w, height: a.h, mobile: false, out: join(shotDir("4-hand"), `${fileOf(a)}.png`), waitMs: 400, script: script([{ kind: "eval", js }]), scriptWaitMs: 400, probe: HAND_PROBE });
}
const res = shoot("4-hand", shots);
type P = { chartBox: { w: number; h: number }; overChartBox: number; overVisibleChart: number; landSeen: number; landUnder: number; landUnderShare: number; marks: number; marksUnder: number; overRing: number; overBroadside: number; overGlass: number; overLegend: number; overFolio: number; inWindow: boolean; broadsideScrolls: boolean | null; islands: string | null };
const ps = res.map((r) => probeOf<P>(r));
const ctrl = (a: Arm): P => ps[arms.findIndex((x) => x.seat === "control" && x.w === a.w && x.done === a.done && x.style === a.style)] ?? ps[arms.findIndex((x) => x.seat === "control" && x.w === a.w && x.done === a.done)]!;
const lines = arms.map((a, i) => {
  const p = ps[i]!;
  const c = ctrl(a);
  return `| ${a.seat} | ${a.w} | ${a.done ? "done (islands 20)" : "arriving"} | ${a.style} | ${p.chartBox.w} by ${p.chartBox.h}${a.seat !== "control" && (p.chartBox.w !== c.chartBox.w || p.chartBox.h !== c.chartBox.h) ? ` (today ${c.chartBox.w} by ${c.chartBox.h})` : ""} | ${p.overChartBox}% | ${p.landUnderShare}% (${p.landUnder} of ${p.landSeen}) | ${p.marksUnder} of ${p.marks} | ${p.overRing} | ${p.overBroadside} | ${p.overGlass} | ${p.overLegend} | ${p.overFolio} | ${a.seat === "control" ? "" : p.inWindow ? "yes" : "NO"} | ${p.broadsideScrolls ? "SCROLLS" : "no"} | \`shots/4-hand/${fileOf(a)}.png\` |`;
});
writeFileSync(
  measureFile("4-hand.md"),
  `# Item 4: the pointing hand's slip in the Explorer, measured\n\nThe islands step (the Land, step 2 of 6, "${islands.act.replace(/[{}]/g, "")}") at its own address, ${AT}, on the real built Explorer at ${SHA.slice(0, 8)}, reduced motion (\`node out/1248/mock/seats-hand.ts\` from the design tree), as the reader arrives and once the step is done (islands set to 20, the state the step asks the reader to watch). "Over the chart" is the share of the drawn chart's box the slip covers. "Land under it" samples the chart every 6 px across the part a reader can see (in the window and under no corner, the Broadside, the head cluster or the press row), keeps the samples inside the fill of the land layer's paths, and counts those the slip covers: the isles the step asks the reader to watch. "Marks" counts the place marks in that same visible part. The other columns are square CSS px the slip shares with the ring round the islands row, the Broadside, the Glass, the press row and the chart folio. "Broadside scrolls" reads the Broadside's own body. Every result came back with no 4xx and no console error.\n\n| seat | width | state | dress | chart drawn | over the chart | land under it | marks under it | over the ring | over the Broadside | over the Glass | over the press row | over the chart folio | in the window | Broadside scrolls | still |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|\n${lines.join("\n")}\n`,
);
console.log(lines.join("\n"));
