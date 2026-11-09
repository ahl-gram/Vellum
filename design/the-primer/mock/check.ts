// Issue #1155 round: a prototype of the browser check that holds every step to the room it names. For each step it opens the step's own address on the built site, does what the step says the reader did first, then finds every control the step quotes and asks three things: is it there, can the reader reach it (shown, not held, not covered), and does it carry exactly the words the step quotes. It also asks whether the address the step opens kept every key it carried. The mutate arm renames one label, removes one press and moves one held note on the live page before the read, to show the check reds when a room changes under its guide.
// node out/1155/mock/check.ts shots [mutate]   then   node scripts/design/shoot.ts <out>/measure/check-shots.json --site <tree>/dist --reduced-motion > <out>/measure/check-results.json   then   node out/1155/mock/check.ts read [mutate]
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { script, type Act } from "./drive.ts";
import { everyStep } from "./ladder/guide.ts";
import { OUT_1155 } from "./paths.ts";

export const READ = `(()=>{const norm=(s)=>(s||"").replace(/\\s+/g," ").trim();
const reach=(e)=>{if(!e)return"absent";if(e.closest("[hidden]"))return"hidden";const b=e.getBoundingClientRect();if(b.width===0||b.height===0)return"no box";
const s=getComputedStyle(e);if(s.visibility==="hidden"||s.display==="none")return"hidden";if(e.closest(".held")||e.getAttribute("aria-disabled")==="true")return"held";
const x=Math.min(Math.max(b.left+b.width/2,0),innerWidth-1),y=Math.min(Math.max(b.top+b.height/2,0),innerHeight-1);const top=document.elementFromPoint(x,y);
if(top&&top!==e&&!e.contains(top)&&!(top.contains&&top.contains(e))&&!(e.labels&&[...e.labels].some((l)=>l.contains(top))))return"covered by "+(top.id?"#"+top.id:top.className||top.tagName);return"reachable";};
const wordsOf=(e,w)=>{let got=null;if(w.read==="text")got=norm(e.textContent);else if(w.read==="aria")got=norm(e.getAttribute("aria-label"));else if(w.read==="title")got=norm(e.getAttribute("title"));else if(w.read==="attr")got=e.getAttribute(w.attr);else if(w.read==="placeholder")got=e.getAttribute("placeholder");
else if(w.read==="label"){const l=e.closest("label")||(e.id&&e.ownerDocument.querySelector("label[for="+e.id+"]"));got=norm(l?l.textContent:"");}else if(w.read==="road")got=norm((e.querySelector(".verb")||{}).textContent)+" "+norm((e.querySelector(".room")||{}).textContent);
else if(w.read==="option"){const o=[...e.options].find((o)=>norm(o.textContent)===w.says);got=o?(o.disabled?w.says+" (disabled)":w.says):"no such option";}
return w.match==="starts"?(got||"").startsWith(w.says):w.match==="contains"?(got||"").includes(w.says):got===w.says;};
const readOf=(w)=>{const e=document.querySelector(w.css);if(!e)return{state:"absent",got:null,expect:w.state??"reachable",fits:false};
let got=null;if(w.read==="text")got=norm(e.textContent);else if(w.read==="aria")got=norm(e.getAttribute("aria-label"));else if(w.read==="title")got=norm(e.getAttribute("title"));else if(w.read==="attr")got=e.getAttribute(w.attr);else if(w.read==="placeholder")got=e.getAttribute("placeholder");
else if(w.read==="label")got=norm(e.labels&&e.labels[0]?e.labels[0].textContent:"");else if(w.read==="road")got=norm((e.querySelector(".verb")||{}).textContent)+" "+norm((e.querySelector(".room")||{}).textContent);
else if(w.read==="option"){const o=[...e.options].find((o)=>norm(o.textContent)===w.says);got=o?(o.disabled?w.says+" (disabled)":w.says):"no such option";}
const ok=w.match==="starts"?(got||"").startsWith(w.says):w.match==="contains"?(got||"").includes(w.says):got===w.says;const state=reach(e);return{state,got,ok,expect:w.state??"reachable",fits:state===(w.state??"reachable")||(w.state==="hidden"&&state==="no box")};};
return async(words)=>{let doc=null;try{doc=new DOMParser().parseFromString(await (await fetch(location.pathname)).text(),"text/html");}catch(e){}
return{href:location.pathname+location.search+location.hash,reads:words.map((w)=>{const st=doc&&doc.querySelector(w.css);return{css:w.css,says:w.says,...readOf(w),inMarkup:!!st&&wordsOf(st,w)};})};};})()`;

const MUTATIONS: ReadonlyArray<{ readonly step: string; readonly what: string; readonly js: string }> = [
  { step: "/explorer/#sea-level", what: "the sea level row's label renamed to tide", js: `document.querySelector("label[for=land]").textContent="tide";` },
  { step: "/explorer/#loupe", what: "the loupe press taken off the Glass", js: `document.getElementById("zoom-loupe").remove();` },
  { step: "/explorer/#archipelago", what: "archipelago taken out of the type list", js: `[...document.getElementById("type").options].find((o)=>o.value==="archipelago").remove();` },
  { step: "/reading-room/#play", what: "Play renamed Begin", js: `document.querySelector(".rf-play").textContent="Begin";` },
  { step: "/explorer/#held", what: "the held note reworded", js: `document.getElementById("land-held-note").textContent="the shape keeps the count";` },
  { step: "/print-room/#bind", what: "Bind the atlas moved into a hidden fold", js: `document.getElementById("pr-bind").closest(".bind-row").hidden=true;` },
];

const mode = import.meta.url === `file://${process.argv[1]}` ? (process.argv[2] ?? "shots") : "none";
const mutate = process.argv[3] === "mutate";
const motion = process.argv[3] === "motion";
const steps = everyStep().filter(({ ladder, step }) =>
  mutate ? MUTATIONS.some((m) => m.step === `${ladder.route}#${step.id}`) : motion ? step.only === "motion" : true,
);
const listName = mutate ? "check-mutate" : motion ? "check-motion" : "check";
const wordsOf = (step: (typeof steps)[number]["step"]) =>
  step.only === "motion" && !motion ? step.words.map((w) => ({ ...w, state: "hidden" as const })) : step.words;

if (mode === "none") {
  // imported for READ
} else if (mode === "shots") {
  const shots = steps.map(({ ladder, step }) => {
    const m = MUTATIONS.find((x) => x.step === `${ladder.route}#${step.id}`);
    const acts: Act[] = [...(step.first ?? []), ...(mutate && m ? [{ kind: "eval", js: m.js } as const] : [])];
    return {
      url: step.at,
      width: step.only === "touch" ? 1024 : 1280,
      height: step.only === "touch" ? 768 : 800,
      mobile: step.only === "touch",
      out: join(OUT_1155, "measure", listName, `${ladder.route.replace(/\//g, "_")}${step.id}.png`),
      waitMs: 300,
      script: script(acts),
      scriptWaitMs: 200,
      probe: `(${READ})(${JSON.stringify(wordsOf(step))})`,
    };
  });
  mkdirSync(join(OUT_1155, "measure", listName), { recursive: true });
  writeFileSync(join(OUT_1155, "measure", `${listName}-shots.json`), JSON.stringify(shots, null, 1));
  console.log(`${shots.length} shots`);
} else {
  type R = { css: string; says: string; state: string; got: string | null; ok?: boolean; expect: string; fits: boolean; inMarkup: boolean };
  const results = JSON.parse(readFileSync(join(OUT_1155, "measure", `${listName}-results.json`), "utf8")) as Array<{ probe: string; http4xx: string[]; consoleErrors: string[] }>;
  if (results.length !== steps.length) throw new Error(`${steps.length} steps against ${results.length} results`);
  const kept = (at: string, href: string): string => {
    const want = new URLSearchParams(at.split("#")[1] ?? "");
    const have = new URLSearchParams(href.split("#")[1] ?? "");
    const lost = [...want.keys()].filter((k) => !have.has(k));
    return lost.length === 0 ? "kept" : `lost ${lost.join(", ")}`;
  };
  let pass = 0,
    markupWhole = 0,
    markupWords = 0,
    allWords = 0;
  const rows: string[] = [];
  results.forEach((r, i) => {
    const { ladder, step } = steps[i]!;
    const p = JSON.parse(r.probe) as { href: string; reads: R[] };
    const good = p.reads.every((x) => x.ok === true && x.fits) && r.http4xx.length === 0 && r.consoleErrors.length === 0;
    if (good) pass++;
    if (p.reads.every((x) => x.inMarkup)) markupWhole++;
    markupWords += p.reads.filter((x) => x.inMarkup).length;
    allWords += p.reads.length;
    const fails = p.reads.filter((x) => !(x.ok === true && x.fits)).map((x) => `\`${x.css}\` ${x.state} (wanted ${x.expect}), read "${x.got ?? ""}" for "${x.says}"`);
    const m = MUTATIONS.find((x) => x.step === `${ladder.route}#${step.id}`);
    rows.push(`| ${good ? "pass" : "**RED**"} | \`${ladder.route}#${step.id}\` | ${p.reads.length} | ${p.reads.filter((x) => x.inMarkup).length} of ${p.reads.length} | ${kept(step.at, p.href)} | ${mutate && m ? m.what + "; " : ""}${fails.join("; ") || ""}${r.http4xx.length ? ` 4xx: ${r.http4xx.join(" ")}` : ""}${r.consoleErrors.length ? ` console: ${r.consoleErrors.join(" ").slice(0, 160)}` : ""} |`);
  });
  const head = mutate
    ? `# The drift check, made to bite\n\nThe same check as \`measure/check.md\`, run on the steps below with the live page changed under each step before the read (\`node out/1155/mock/check.ts shots mutate\`). Each change is one a room could make tomorrow. ${steps.length - pass} of ${steps.length} went red.\n`
    : motion
      ? `# The drift check, the steps that need motion\n\nThe steps marked motion-only, run with motion on (\`node out/1155/mock/check.ts shots motion\`, shot without \`--reduced-motion\`): there the control must be reachable, where the reduced-motion run holds it hidden. ${pass} of ${steps.length} pass.\n`
      : `# The drift check over every step\n\nMotion-only steps are held to "hidden" in this run, since reduced motion stands their controls down, and are read with motion on in \`measure/check-motion.md\`; the touch-only step is held to "hidden" on a desktop, and a touch run was not made (UNVERIFIABLE here). Each step's own address opened on the design tree's built site at 089881ad, 1280 by 800, reduced motion, one browser (\`node out/1155/mock/check.ts\`). A step passes when every control it quotes is there, reachable (shown, not held, not covered at its centre) and carries exactly the quoted words, with no 4xx and no console error. ${pass} of ${steps.length} pass. A read of the built HTML alone, with no browser, finds ${markupWords} of the ${allWords} quoted controls with their words, and every control of ${markupWhole} of the ${steps.length} steps: the rest are built by the room's script after load, or carry words a script writes.\n`;
  writeFileSync(join(OUT_1155, "measure", `${listName}.md`), `${head}\n| | step | controls | in the built markup | address | what failed |\n|---|---|---|---|---|---|\n${rows.join("\n")}\n`);
  console.log(`${pass} of ${steps.length} pass`);
}
