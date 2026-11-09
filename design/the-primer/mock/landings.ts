// Issue #1155 round: every step done for real on the built site, and photographed once done. The shot opens the step's address, does what the reader did first, then the step itself, then reads the step's "then" words and a snapshot of the room (the chart's stamp, the folio, the readouts, the status lines). These are the pictures the mocks hang beside each step, and the reading is the evidence for every "what you will see".
// node out/1155/mock/landings.ts shots   then   node scripts/design/shoot.ts <out>/measure/landings-shots.json --site <tree>/dist --reduced-motion > <out>/measure/landings-results.json   then   node out/1155/mock/landings.ts read
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { READ } from "./check.ts";
import { script } from "./drive.ts";
import { DONE } from "./ladder/done.ts";
import { everyStep } from "./ladder/guide.ts";
import { OUT_1155 } from "./paths.ts";

export const SNAPSHOT = `(()=>{const t=(s)=>{const e=document.querySelector(s);return e?e.textContent.replace(/\\s+/g," ").trim():null;};
const svg=document.querySelector("#map > svg[data-vellum-style], #wr-chart svg, #pr-preview svg");const stamp={};if(svg)for(const a of svg.attributes)if(a.name.startsWith("data-vellum-")&&!/grid|version/.test(a.name))stamp[a.name.slice(12)]=a.value;
return{href:location.pathname+location.hash,title:t("#folio-title"),lines:[...document.querySelectorAll(".corner.bl.folio p")].map((p)=>p.textContent.trim()).filter(Boolean),stamp,
readouts:[...document.querySelectorAll(".land-readout")].filter((r)=>r.offsetParent).map((r)=>r.id.replace("-readout","")+"="+r.textContent),
status:["#hunt-status","#pr-bound-status","#pp-era","#pp-lay-count","#chart-drawer-count","#wr-refusal",".rf-year",".rf-told",".wr-account"].map((s)=>[s,t(s)]).filter(([,v])=>v),
drawer:t("#chart-drawer-tab"),loupe:!!document.querySelector(".loupe:not([hidden])"),verso:(()=>{const v=document.getElementById("verso");return !!v&&getComputedStyle(v).visibility!=="hidden"&&document.querySelector("#sheet-inner.flipped,#sheet.flipped,.flipped")!==null;})(),
track:!!document.querySelector("#map .voyage-track")};})()`;

const steps = everyStep().filter(({ ladder, step }) => DONE[`${ladder.route}#${step.id}`] !== undefined);
const fileOf = (route: string, id: string): string => `${route.replace(/^\/|\/$/g, "").replace(/\//g, "-") || "home"}--${id}.png`;
export const landingFile = fileOf;

const mode = import.meta.url === `file://${process.argv[1]}` ? (process.argv[2] ?? "shots") : "none";
if (mode === "none") {
  // imported for landingFile
} else if (mode === "shots") {
  const shots = steps.map(({ ladder, step }) => {
    const done = DONE[`${ladder.route}#${step.id}`]!;
    return {
      url: step.at,
      width: 1280,
      height: 800,
      mobile: false,
      out: join(OUT_1155, "shots", "landings", fileOf(ladder.route, step.id)),
      waitMs: 300,
      script: script([...(step.first ?? []), ...done.do]),
      scriptWaitMs: 500,
      probe: `(async()=>({then:await (${READ})(${JSON.stringify(done.then ?? [])}),room:${SNAPSHOT}}))()`,
    };
  });
  mkdirSync(join(OUT_1155, "shots", "landings"), { recursive: true });
  writeFileSync(join(OUT_1155, "measure", "landings-shots.json"), JSON.stringify(shots, null, 1));
  console.log(`${shots.length} shots`);
} else {
  const results = JSON.parse(readFileSync(join(OUT_1155, "measure", "landings-results.json"), "utf8")) as Array<{ out: string; probe: string; http4xx: string[]; consoleErrors: string[] }>;
  if (results.length !== steps.length) throw new Error(`${steps.length} steps against ${results.length} results`);
  type T = { css: string; says: string; got: string | null; ok?: boolean };
  let held = 0;
  const rows = results.map((r, i) => {
    const { ladder, step } = steps[i]!;
    const p = JSON.parse(r.probe) as { then: { reads: T[] }; room: Record<string, unknown> };
    const thenOk = p.then.reads.every((x) => x.ok === true);
    if (thenOk) held++;
    const room = p.room as { title: string | null; stamp: Record<string, string>; readouts: string[]; status: string[][]; drawer: string | null; loupe: boolean; verso: boolean; track: boolean };
    const facts = [
      room.title ? `title "${room.title}"` : "",
      Object.keys(room.stamp).length ? `stamp ${Object.entries(room.stamp).filter(([k]) => !/land-fraction|coast-warp/.test(k)).map(([k, v]) => `${k}=${v.slice(0, 40)}`).join(" ")}` : "",
      room.readouts.length ? `readouts ${room.readouts.join(", ")}` : "",
      room.status.map(([k, v]) => `${k} "${(v ?? "").slice(0, 140)}"`).join("; "),
      room.loupe ? "loupe shown" : "",
      room.track ? "survey track inked" : "",
    ].filter(Boolean).join("; ");
    const thenText = p.then.reads.length === 0 ? "none written" : p.then.reads.map((x) => `${x.ok ? "held" : "**MISSED**"}: "${x.says}" (read "${(x.got ?? "").slice(0, 60)}")`).join("; ");
    return `| \`${ladder.route}#${step.id}\` | ${thenText} | ${facts.replace(/\|/g, "/")} | \`shots/landings/${fileOf(ladder.route, step.id)}\`${r.http4xx.length || r.consoleErrors.length ? ` 4xx ${r.http4xx.length}, console ${r.consoleErrors.length}` : ""} |`;
  });
  writeFileSync(
    join(OUT_1155, "measure", "landings.md"),
    `# Every step, done for real\n\nEach step's address opened on the design tree's built site at 089881ad, the step done by the shot's script, the room read once it settled (1280 by 800, reduced motion; \`node out/1155/mock/landings.ts\`). "then" is the outcome the step's sentence promises, where the page can say it; ${held} of ${steps.length} held. The room column is what the page showed, for checking each "what you will see" by eye against its still.\n\n| step | then | the room, once done | still |\n|---|---|---|---|\n${rows.join("\n")}\n`,
  );
  console.log(`${held} of ${steps.length} held`);
}
