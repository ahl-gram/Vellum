// Issue #1155 round: what a ninth item on the nav's top line costs, read off every room as the built page lays it out at the 1024 floor and at 1280, today and with each candidate name added before Q & A. The top row's own script narrows the room's corner toward the kit's width when the nav needs the room (`src/site/shared/shell/top-row.ts`), so the reading is whether the nav keeps its one line, the gap left between it and the corner, and whether any control in the corner is cut short (its text wider than its box).
// node out/1155/mock/top-row.ts shots   then shoot measure/top-row-shots.json into measure/top-row-results.json (--site <tree>/dist --reduced-motion)   then   node out/1155/mock/top-row.ts read
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { script } from "./drive.ts";
import { navJs, relayJs } from "./inject.ts";
import { OUT_1155 } from "./paths.ts";

const ROOMS = ["/explorer/#seed=42", "/writing-room/", "/reading-room/#seed=42", "/print-room/#seed=42", "/prospect/#seed=42&i=0", "/ribbon/#seed=42&a=0", "/explorer/portfolio/", "/seed-of-the-day/", "/gallery/", "/faq/", "/glossary/"];
const NAMES = [null, "Primer", "Hornbook", "Schoolroom"] as const;
const WINDOWS: ReadonlyArray<readonly [number, number]> = [[1024, 768], [1280, 800]];

const PROBE = `(()=>{const nav=document.querySelector("nav.rooms");const items=[...nav.querySelectorAll("a,span:not(.sep)")];const tops=new Set(items.map((e)=>Math.round(e.getBoundingClientRect().top)));
const nr=nav.getBoundingClientRect();const last=items[items.length-1].getBoundingClientRect();const corner=document.querySelector(".corner.tr");const cr=corner.getBoundingClientRect();
const span=document.createElement("span");span.style.cssText="position:absolute;visibility:hidden;white-space:pre";document.body.appendChild(span);
const textW=(e,t)=>{const cs=getComputedStyle(e);span.style.font=cs.font;span.style.letterSpacing=cs.letterSpacing;span.textContent=t;return span.getBoundingClientRect().width;};
const room=(e)=>{const cs=getComputedStyle(e);return e.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);};
const cut=[...corner.querySelectorAll("select,input,button")].filter((e)=>e.offsetParent).map((e)=>{const t=e.tagName==="SELECT"?e.options[e.selectedIndex].textContent:e.tagName==="INPUT"?e.value:e.textContent;const w=textW(e,t);return{e,t,w,r:room(e)};}).filter((x)=>x.w>x.r+0.5).map((x)=>(x.e.id||x.e.className)+" '"+x.t+"' "+Math.round(x.w)+" in "+Math.round(x.r));span.remove();
const lineOf=(e)=>Math.round(e.getBoundingClientRect().top);const rowsOfCorner=new Set([...corner.querySelectorAll(".folio-controls > *, .journey > *")].filter((e)=>e.offsetParent).map(lineOf)).size;
return JSON.stringify({navLines:tops.size,navRight:Math.round(last.right),cornerLeft:Math.round(cr.left),cornerWidth:Math.round(cr.width),overlapY:!(cr.bottom<=nr.top||nr.bottom<=cr.top),cut,cornerRows:rowsOfCorner});})()`;

const mode = process.argv[2] ?? "shots";
const arms = ROOMS.flatMap((room) => WINDOWS.flatMap(([w, h]) => NAMES.map((name) => ({ room, w, h, name }))));
if (mode === "shots") {
  const shots = arms.map((a) => ({
    url: a.room,
    width: a.w,
    height: a.h,
    mobile: false,
    out: join(OUT_1155, "measure", "top-row", `${(a.room.split("/")[1] || "home") + (a.room.includes("portfolio") ? "-portfolio" : "")}-${a.w}-${a.name ?? "today"}.png`),
    waitMs: 300,
    script: script(a.name === null ? [] : [{ kind: "eval", js: navJs("ninth", a.name, false) + relayJs }]),
    scriptWaitMs: 300,
    clip: { x: 0, y: 0, width: a.w, height: 200 },
    probe: PROBE,
  }));
  mkdirSync(join(OUT_1155, "measure", "top-row"), { recursive: true });
  writeFileSync(join(OUT_1155, "measure", "top-row-shots.json"), JSON.stringify(shots, null, 1));
  console.log(`${shots.length} shots`);
} else {
  const results = JSON.parse(readFileSync(join(OUT_1155, "measure", "top-row-results.json"), "utf8")) as Array<{ probe: string; http4xx: string[]; consoleErrors: string[] }>;
  if (results.length !== arms.length) throw new Error(`${arms.length} arms against ${results.length} results`);
  type P = { navLines: number; navRight: number; cornerLeft: number; cornerWidth: number; overlapY: boolean; cut: string[]; cornerRows: number };
  const rows = results.map((r, i) => {
    const a = arms[i]!;
    const p = JSON.parse(r.probe) as P;
    return `| ${a.room.split("#")[0]} | ${a.w} | ${a.name ?? "today (eight items)"} | ${p.navLines} | ${p.cornerLeft - p.navRight} | ${p.cornerWidth} | ${p.cornerRows} | ${p.cut.join("; ") || "none"} |`;
  });
  writeFileSync(
    join(OUT_1155, "measure", "top-row.md"),
    `# A ninth item on the nav, measured\n\nEach room at the 1024 floor and at 1280, today and with a ninth item added before Q & A under each candidate name, the built page laid out again after the item went in (\`node out/1155/mock/top-row.ts\`, the design tree's \`dist/\` at 089881ad, reduced motion). "Gap" is the room's corner's left edge less the nav's last item's right edge, in CSS px, on the shared top row (a negative gap would be an overlap). "Corner rows" counts the lines the corner's own controls stand on. "Cut" lists any control in the corner whose text is wider than its box. With scripts off the top row's script does not run, so the scripts-off case is not measured here: UNVERIFIABLE, and \`handbook/errata/site.md\` already records two corners running under the eighth item at 1024 with scripts off.\n\n| room | width | ninth item | nav lines | gap | corner width | corner rows | cut |\n|---|---|---|---|---|---|---|---|\n${rows.join("\n")}\n`,
  );
  console.log("wrote measure/top-row.md");
}
