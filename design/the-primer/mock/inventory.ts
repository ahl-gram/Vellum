// Issue #1155 round: every control each room shows today, read off the built page in a real browser rather than from source, so each step quotes the words on the screen. Writes the shot list; the results become `measure/inventory.md`.
// node out/1155/mock/inventory.ts shots   then shoot it with --site <tree>/dist --reduced-motion into measure/inventory-results.json, then   node out/1155/mock/inventory.ts read
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { script, type Act } from "./drive.ts";
import { OUT_1155 } from "./paths.ts";

export const INVENTORY = `(()=>{const vis=(e)=>{if(e.closest("[hidden]"))return false;const b=e.getBoundingClientRect();if(b.width===0||b.height===0)return false;const s=getComputedStyle(e);return s.visibility!=="hidden"&&s.display!=="none";};
const name=(e)=>(e.getAttribute("aria-label")||(e.labels&&e.labels[0]&&e.labels[0].textContent)||e.getAttribute("title")||e.textContent||e.getAttribute("placeholder")||"").replace(/\\s+/g," ").trim();
const sel="button, a.legend-btn, select, input, textarea, [role=button], .place-hit, a.fn, .dog-ear, .contents a, .contents button, .itinerary li";
const els=[...document.querySelectorAll(sel)].filter(vis);
const seen=new Set();const out=[];
for(const e of els){const id=e.id?"#"+e.id:"";const cls=e.className&&typeof e.className==="string"?"."+e.className.trim().split(/\\s+/).join("."):"";
const kind=e.tagName.toLowerCase()+(e.type&&e.tagName==="INPUT"?"["+e.type+"]":"");
let words=name(e);if(e.tagName==="SELECT")words=words+" {"+[...e.options].map((o)=>o.textContent.trim()+(o.disabled?" (disabled)":"")).join(" | ")+"}";
if(e.disabled)words+=" (disabled)";const key=kind+id+cls+words;if(seen.has(key))continue;seen.add(key);out.push({kind,id,cls:cls.slice(0,60),words:words.slice(0,160)});}
const heads=[...document.querySelectorAll(".slip-head, .corner.tr .room-name, .legend .legend-head, h1, h2")].filter(vis).map((h)=>h.textContent.replace(/\\s+/g," ").trim().slice(0,120));
return{href:location.pathname+location.search+location.hash,heads,controls:out.slice(0,90)};})()`;

type Look = { readonly name: string; readonly url: string; readonly acts?: readonly Act[] };

export const TABLE_ONE_SURVEY_PROBE = "table";

const looks: Look[] = [
  { name: "explorer", url: "/explorer/#seed=42" },
  {
    name: "explorer-card",
    url: "/explorer/#seed=42",
    acts: [{ kind: "eval", js: `{const h=document.querySelector('.place-hit[data-idx="0"]');h.focus();h.click();for(let j=0;j<8;j++)await tick();}` }],
  },
  {
    name: "explorer-region",
    url: "/explorer/#seed=42",
    acts: [{ kind: "nearer", until: "region" }],
  },
  {
    name: "explorer-laid",
    url: "/explorer/#seed=42",
    acts: [
      { kind: "nearer", until: "region" },
      { kind: "click", css: "#map .region-inset .dog-ear" },
      { kind: "click", css: "#chart-drawer-tab" },
    ],
  },
  { name: "reading-room", url: "/reading-room/#seed=42" },
  { name: "print-room", url: "/print-room/#seed=42" },
  {
    name: "print-room-bound",
    url: "/print-room/#seed=42",
    acts: [{ kind: "click", css: "#pr-bind" }, { kind: "ticks", n: 40 }],
  },
  { name: "writing-room", url: "/writing-room/" },
  { name: "prospect", url: "/prospect/#seed=42&i=0" },
  { name: "ribbon", url: "/ribbon/#seed=42&a=0" },
  { name: "portfolio-bare", url: "/explorer/portfolio/" },
  { name: "today", url: "/seed-of-the-day/" },
  { name: "gallery", url: "/gallery/" },
  { name: "home", url: "/" },
];

const mode = process.argv[2] ?? "shots";
if (mode === "shots") {
  const shots = looks.map((l) => ({
    url: l.url,
    width: 1280,
    height: 800,
    mobile: false,
    out: join(OUT_1155, "measure", "inventory", `${l.name}.png`),
    waitMs: 800,
    script: script(l.acts ?? []),
    scriptWaitMs: 400,
    probe: INVENTORY,
  }));
  mkdirSync(join(OUT_1155, "measure", "inventory"), { recursive: true });
  writeFileSync(join(OUT_1155, "measure", "inventory-shots.json"), JSON.stringify(shots, null, 1));
  console.log(`${shots.length} shots`);
} else {
  const results = JSON.parse(readFileSync(join(OUT_1155, "measure", "inventory-results.json"), "utf8")) as Array<{ out: string; probe: string; http4xx: string[]; consoleErrors: string[] }>;
  const lines = ["# The controls each room shows today, read off the built page", "", "Read at 1280 by 800 with reduced motion on the design tree's own `dist/` (`node out/1155/mock/inventory.ts`). Each row is one visible control: its element, its id or class, and its words as a reader's assistive technology would name it (aria-label, then its label, then its title, then its text).", ""];
  results.forEach((r, i) => {
    const p = JSON.parse(r.probe) as { href: string; heads: string[]; controls: Array<{ kind: string; id: string; cls: string; words: string }> };
    lines.push(`## ${looks[i]!.name}: \`${p.href}\``, "", `Heads: ${p.heads.map((h) => `"${h}"`).join(", ")}`, "", `4xx: ${r.http4xx.length}, console errors: ${r.consoleErrors.length}`, "", "| element | id | class | words |", "|---|---|---|---|");
    for (const c of p.controls) lines.push(`| ${c.kind} | ${c.id} | ${c.cls} | ${c.words.replace(/\|/g, "/")} |`);
    lines.push("");
  });
  writeFileSync(join(OUT_1155, "measure", "inventory.md"), lines.join("\n"));
  console.log("wrote measure/inventory.md");
}
