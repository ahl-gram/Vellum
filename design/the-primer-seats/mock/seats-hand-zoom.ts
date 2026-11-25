// Issue #1248 round, item 4: what becomes of the slim slip in the head cluster (B2) while the reader zooms, as the Glass lesson's "anew" step asks ("Keep pressing Draw nearer until the chart is drafted anew"), at 1024 by 768 and 1280 by 800, reduced motion: the slip's box against the window at rest, after one and two presses of Draw nearer, once a region is drafted anew, and on to four and six presses. Writes shots/4-hand/zoom-*.png and measure/4-hand-zoom.md.
// node out/1248/mock/seats-hand-zoom.ts
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { script, type Act } from "./drive.ts";
import { ringJs } from "./inject.ts";
import { EXPLORER } from "./ladder/explorer.ts";
import { actHtml } from "./primer.ts";
import { relayJs, styleJs } from "./seats-home-js.ts";
import { measureFile, SHA, shotDir } from "./seats-paths.ts";
import { probeOf, shoot, type Shot } from "./seats-shoot.ts";
import { SLIP_CSS } from "./seats-slip.ts";

const j = JSON.stringify;
const anew = EXPLORER.lessons.find((l) => l.id === "glass")!.steps.find((s) => s.id === "anew")!;
const dots = `<span class="d">${Array.from({ length: 7 }, (_, i) => `<i class="${i < 2 ? "on" : i === 2 ? "now" : ""}"></i>`).join("")}</span>`;
const slim = `<p class="h"><span class="v">From The Primer</span><span class="t">The Surveyor's Glass, step 3</span>${dots}</p><p class="a">${actHtml(anew)}</p><div class="r"><a href="/primer/#explorer-glass">Back to The Primer</a><a href="#" class="dim">Next step</a></div>`;
const seat = styleJs("slip1248css", SLIP_CSS) + `{const s=document.createElement("aside");s.className="slip1248 head-seat slim";s.innerHTML=${j(slim)};const h=document.querySelector("header.chrome");h.appendChild(s);s.style.maxWidth=Math.min(620,document.getElementById("broadside").getBoundingClientRect().left-h.getBoundingClientRect().left-24)+"px";}` + relayJs + ringJs("#zoom-in", null);
// A press of Draw nearer arms the head's slide-away through its pointerdown on the Glass (`watchInput` in `src/site/shared/slide-away-page.ts`), which a script's click does not fire, so the reader's pointerdown is dispatched first.
const ARM = `{document.getElementById("zoom-in").dispatchEvent(new PointerEvent("pointerdown",{bubbles:true,pointerType:"mouse"}));for(let k=0;k<2;k++)await tick();}`;
const PROBE = `JSON.stringify((()=>{const s=document.querySelector(".slip1248").getBoundingClientRect();const h=document.querySelector("header.chrome");const cs=getComputedStyle(h);const hb=h.getBoundingClientRect();return{headTop:Math.round(hb.top),top:Math.round(s.top),bottom:Math.round(s.bottom),inWindow:s.top>=0&&s.bottom<=innerHeight,visible:Math.max(0,Math.min(s.bottom,innerHeight)-Math.max(s.top,0)),height:Math.round(s.height),headTranslate:cs.translate,region:!!document.querySelector("#map .region-inset .dog-ear")};})())`;
const STATES: Array<{ key: string; acts: Act[] }> = [
  { key: "at-rest", acts: [] },
  { key: "one-press", acts: [{ kind: "nearer", until: "presses", presses: 1 }] },
  { key: "two-presses", acts: [{ kind: "nearer", until: "presses", presses: 2 }] },
  { key: "drafted-anew", acts: [{ kind: "nearer", until: "region" }] },
  { key: "four-presses", acts: [{ kind: "nearer", until: "presses", presses: 4 }] },
  { key: "six-presses", acts: [{ kind: "nearer", until: "presses", presses: 6 }] },
];
const arms = STATES.flatMap((st) => ([[1024, 768], [1280, 800]] as const).map(([w, h]) => ({ st, w, h })));
const shots: Shot[] = arms.map((a) => ({ url: "/explorer/#seed=42", width: a.w, height: a.h, mobile: false, out: join(shotDir("4-hand"), `zoom-b2-${a.st.key}-${a.w}.png`), waitMs: 400, script: script([{ kind: "eval", js: seat + ARM }, ...a.st.acts, { kind: "ticks", n: 8 }]), scriptWaitMs: 400, probe: PROBE }));
const ps = shoot("4-hand-zoom", shots).map((r) => probeOf<{ top: number; bottom: number; inWindow: boolean; visible: number; height: number; headTranslate: string; headTop: number; region: boolean }>(r));
const lines = arms.map((a, i) => { const p = ps[i]!; return `| ${a.st.key} | ${a.w} | ${p.top} to ${p.bottom} | ${p.visible} of ${p.height} px | ${p.inWindow ? "yes" : "NO"} | ${p.headTranslate}, its top at ${p.headTop} | ${p.region ? "yes" : "no"} | \`shots/4-hand/zoom-b2-${a.st.key}-${a.w}.png\` |`; });
writeFileSync(measureFile("4-hand-zoom.md"), `# Item 4: the slim slip in the head cluster while the reader zooms\n\nThe Glass lesson's "anew" step ("${anew.act.replace(/[{}]/g, "")}") on the built Explorer at ${SHA.slice(0, 8)}, reduced motion, seed 42, the slim slip (B2) in the head cluster and the ring on Draw nearer, the head's slide-away armed by a pointerdown on the Glass as a reader's press arms it (\`node out/1248/mock/seats-hand-zoom.ts\`). Each row reads the slip's box against the window: its top and foot in px from the window's top, how much of its height stands in the window, the head cluster's own translate and where its top stands, and whether a region has been drafted anew. Every result came back with no 4xx and no console error.\n\n| state | width | slip's top to foot | in the window | wholly in the window | head cluster's translate | region drafted | still |\n|---|---|---|---|---|---|---|---|\n${lines.join("\n")}\n`);
console.log(lines.join("\n"));
