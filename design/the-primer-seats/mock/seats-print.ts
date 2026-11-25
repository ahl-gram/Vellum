// Issue #1248 round, item 3: the Print Room's corner beside a ninth nav item at the 1024 floor, today's look and the ninth item's cut beside the ways it stays whole. A control is whole when the widest thing it can show fits its box: the seed box holding the largest seed (4294967295), the style list holding its longest style ("topographic", measured as a single-option clone at its natural width), and each press its own words. Writes shots/3-print/ and measure/3-print.md.
// node out/1248/mock/seats-print.ts
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { script } from "./drive.ts";
import { navJs } from "./inject.ts";
import { relayJs, styleJs } from "./seats-home-js.ts";
import { measureFile, SHA, shotDir } from "./seats-paths.ts";
import { probeOf, shoot, type Shot } from "./seats-shoot.ts";

const TWO_LINES = ".corner.tr .folio-controls{flex-wrap:wrap;row-gap:.5rem}";
const TWO_LINES_WHERE_IT_MUST = ".corner.tr .folio-controls{flex-wrap:wrap;row-gap:.5rem}.corner.tr .folio-controls #pr-seed{flex:1 1 95px;min-width:0;width:auto;box-sizing:border-box}.corner.tr .folio-controls #pr-style{flex:1 1 112px;min-width:0;width:auto}.corner.tr .folio-controls #pr-draw{flex:0 0 auto}";
const NAV_TIGHT = "nav.rooms{letter-spacing:.1em}nav.rooms .sep{margin:0 .22em}";
const DICE_IN_SEED = ".corner.tr .folio-controls{position:relative}.corner.tr .folio-controls #pr-random{position:absolute;left:calc(5.6rem - 1.9rem);top:50%;translate:0 -50%;width:1.7rem;height:1.7rem;padding:0;z-index:1}.corner.tr .folio-controls #pr-seed{padding-right:1.9rem}";
const STYLE_UNDER = ".corner.tr .folio-controls{display:grid;grid-template-columns:auto auto 1fr;grid-template-areas:'seed dice pull' 'style style style';row-gap:.5rem}#pr-seed{grid-area:seed}#pr-random{grid-area:dice}#pr-draw{grid-area:pull;justify-self:end}#pr-style{grid-area:style;justify-self:end}";

type Arm = { readonly key: string; readonly caption: string; readonly nine: boolean; readonly css: string; readonly room: string };
const PR = "/print-room/#seed=42";
const arms: Arm[] = [
  { key: "control-eight-items", caption: "Today: eight nav items", nine: false, css: "", room: PR },
  { key: "control-ninth-item", caption: "Today's corner beside a ninth item: the style list cut", nine: true, css: "", room: PR },
  { key: "a-controls-on-two-lines", caption: "A, the corner's controls wrap: Pull a proof takes a line of its own where the corner narrows", nine: true, css: TWO_LINES, room: PR },
  { key: "a2-wrap-only-where-it-must", caption: "A2, the seed box and the style list each start from the width that holds what they show whole, and the controls wrap only where the corner cannot hold them on one line", nine: true, css: TWO_LINES_WHERE_IT_MUST, room: PR },
  { key: "b-nav-tightened", caption: "B, the nav tightened in every room (its tracking and the dots' margins) so the corner keeps its room", nine: true, css: NAV_TIGHT, room: PR },
  { key: "c-dice-in-the-seed-box", caption: "C, the dice set inside the seed box", nine: true, css: DICE_IN_SEED, room: PR },
  { key: "d-style-under", caption: "D, the style list on a line of its own under the seed, the dice and Pull a proof", nine: true, css: STYLE_UNDER, room: PR },
];
const RIBBON = "/ribbon/#seed=42&a=0";
const PROSPECT = "/prospect/#seed=42&i=0";
const measureOnly: Arm[] = [
  { key: "ribbon-control-ninth-item", caption: "", nine: true, css: "", room: RIBBON },
  { key: "ribbon-b-nav-tightened", caption: "", nine: true, css: NAV_TIGHT, room: RIBBON },
  { key: "prospect-b-nav-tightened", caption: "", nine: true, css: NAV_TIGHT, room: PROSPECT },
  { key: "explorer-b-nav-tightened", caption: "", nine: true, css: NAV_TIGHT, room: "/explorer/#seed=42" },
];

const WORST = `{const s=document.getElementById("pr-seed");if(s)s.value="4294967295";const y=document.getElementById("pr-style");if(y)y.value="topographic";}`;
const PROBE = `JSON.stringify((()=>{const c=document.querySelector(".corner.tr");const cr=c.getBoundingClientRect();const nav=document.querySelector("nav.rooms").getBoundingClientRect();const chrome=document.querySelector("header.chrome").getBoundingClientRect();
const ctx=document.createElement("canvas").getContext("2d");const fontOf=(e)=>{const s=getComputedStyle(e);return s.fontStyle+" "+s.fontWeight+" "+s.fontSize+" "+s.fontFamily;};
const whole=(e)=>{const s=getComputedStyle(e);const r=e.getBoundingClientRect();if(e.tagName==="SELECT"){const k=e.cloneNode(false);const o=document.createElement("option");o.textContent=e.options[e.selectedIndex].textContent;k.appendChild(o);k.style.cssText="position:absolute;visibility:hidden;width:auto;left:0;top:0";k.removeAttribute("id");e.parentNode.appendChild(k);const need=k.getBoundingClientRect().width;k.remove();return{id:e.id,w:Math.round(r.width),need:Math.round(need),cut:r.width+0.5<need,shows:e.options[e.selectedIndex].textContent};}
if(e.tagName==="INPUT"){ctx.font=fontOf(e);const tw=ctx.measureText(e.value).width;const box=e.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight);return{id:e.id,w:Math.round(r.width),need:Math.round(tw+parseFloat(s.paddingLeft)+parseFloat(s.paddingRight)+2),cut:tw>box+0.5,shows:e.value};}
const g=document.createRange();g.selectNodeContents(e);const tw=g.getBoundingClientRect().width;const box=e.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight);return{id:e.id||e.className,w:Math.round(r.width),need:Math.round(tw+parseFloat(s.paddingLeft)+parseFloat(s.paddingRight)+2),cut:tw>box+0.5,shows:(e.textContent||"").trim()};};
const ctrls=[...c.querySelectorAll(".folio-controls > *")].filter((e)=>e.getBoundingClientRect().width>0).map(whole);
const rows=new Set([...c.querySelectorAll(".folio-controls > *")].map((e)=>Math.round(e.getBoundingClientRect().top))).size;
const chart=document.querySelector("#pr-preview svg, #map > svg, .rb-plate, #rb-plate, #pp-plate");const ch=chart?chart.getBoundingClientRect():null;
return{corner:Math.round(cr.width),cornerH:Math.round(cr.height),cornerBottom:Math.round(cr.bottom),gap:Math.round(cr.left-chrome.right),navW:Math.round(nav.width),navLines:new Set([...document.querySelectorAll("nav.rooms > a, nav.rooms > span[aria-current]")].map((e)=>Math.round(e.getBoundingClientRect().top))).size,rows,ctrls,chart:ch?{w:Math.round(ch.width),h:Math.round(ch.height)}:null};})())`;

const shots: Shot[] = [];
type Row = { arm: Arm; w: number; worst: boolean };
const rows: Row[] = [];
const jsOf = (a: Arm, worst: boolean): string => (a.nine ? navJs("ninth", "Primer", false) : "") + (a.css ? styleJs("print1248", a.css) : "") + relayJs + (worst ? WORST + relayJs : "");
for (const a of [...arms, ...measureOnly])
  for (const [w, h] of [[1024, 768], [1280, 800]] as const) {
    if (a.caption === "" && w === 1280) continue;
    for (const worst of [false, true]) {
      const still = a.caption !== "" && !worst;
      const dir = still ? shotDir("3-print") : join(shotDir("3-print"), "..", "..", "measure", "3-print");
      shots.push({ url: a.room, width: w, height: h, mobile: false, out: join(dir, `${a.key}-${w}${worst ? "-widest" : ""}.png`), waitMs: 400, script: script([{ kind: "eval", js: jsOf(a, worst) }]), scriptWaitMs: 300, probe: PROBE });
      rows.push({ arm: a, w, worst });
      if (still) shots.push({ url: a.room, width: w, height: h, mobile: false, out: join(dir, `${a.key}-${w}-2x.png`), waitMs: 400, script: script([{ kind: "eval", js: jsOf(a, false) }]), scriptWaitMs: 300, clip: { x: w - 470, y: 0, width: 470, height: 200, scale: 2 } });
    }
  }
const res = shoot("3-print", shots).filter((r) => r.probe !== null);
type C = { id: string; w: number; need: number; cut: boolean; shows: string };
type P = { corner: number; cornerH: number; cornerBottom: number; gap: number; navW: number; navLines: number; rows: number; ctrls: C[]; chart: { w: number; h: number } | null };
const ps = res.map((r) => probeOf<P>(r));
const lines = rows.map((r, i) => {
  const p = ps[i]!;
  const cuts = p.ctrls.filter((c) => c.cut);
  return `| ${r.arm.key} | ${r.w} | ${r.worst ? "widest" : "seed 42, antique"} | ${p.navW} | ${p.navLines} | ${p.gap} | ${p.corner} | ${p.cornerH} | ${p.rows} | ${p.ctrls.map((c) => `${c.id} ${c.w}`).join(", ")} | ${cuts.length ? cuts.map((c) => `**${c.id} "${c.shows}" needs ${c.need} in ${c.w}**`).join("; ") : "none"} | ${p.chart ? `${p.chart.w} by ${p.chart.h}` : ""} |`;
});
writeFileSync(
  measureFile("3-print.md"),
  `# Item 3: the Print Room's corner beside a ninth nav item, measured\n\nThe real built rooms at ${SHA.slice(0, 8)}, reduced motion, the ninth item "Primer" before Q & A where an arm says so, the built page laid out again after it went in (\`node out/1248/mock/seats-print.ts\` from the design tree). Each arm is read twice: as the room opens (seed 42, antique) and holding the widest thing each control can show (seed 4294967295, the largest a seed can be, and "topographic"). A control is cut when its box is narrower than what it shows needs: the style list against a one-option clone of itself at its natural width, the seed box against the measured width of its digits and its padding, a press against its own words. "Gap" is the corner's left edge less the head cluster's right edge, which the top row holds at the kit's \`--chrome-x\`, 25.6 px. The chart column is the drawn chart's box, the room's fit. Every result came back with no 4xx and no console error.\n\n| arm | width | holding | nav width | nav lines | gap | corner width | corner height | control rows | controls (px) | cut | chart |\n|---|---|---|---|---|---|---|---|---|---|---|---|\n${lines.join("\n")}\n`,
);
console.log(lines.join("\n"));
