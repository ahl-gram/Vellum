// Issue #1155 round, a first look before any step is written: opens the Explorer at the addresses the Land and Strand steps would use and reads back what the page really did with each (the hash after the first draw, every row's seat, the readouts, the held notes), and whether a key outside the grammar survives the rewrite, in the hash or in the query.
// node out/1155/mock/explore-probe.ts   then   node scripts/design/shoot.ts <out>/measure/explore-shots.json --site <tree>/dist --reduced-motion > <out>/measure/explore-results.json
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { script } from "./drive.ts";
import { OUT_1155 } from "./paths.ts";

export const ICELAND = "ne-1159320917";

export const EXPLORER_STATE = `(()=>{const q=(s)=>document.querySelector(s);
const rows=[...document.querySelectorAll("#broadside .l-row[data-row]")].map((r)=>({row:r.dataset.row,hidden:r.hidden,held:!!r.closest(".held")||r.getAttribute("aria-disabled")==="true",readout:(r.querySelector(".land-readout")||{}).textContent||""}));
const svg=q("#map > svg[data-vellum-style]");
return{href:location.pathname+location.search+location.hash,rows,landNote:q("#land-held-note").textContent,strandNote:q("#strand-held-note").textContent,
type:q("#type").value,band:q("#band").value,style:q("#style").value,place:q("#place").value,imprint:q("#imprint-no").textContent,
outline:svg&&svg.getAttribute("data-vellum-outline"),caption:[...document.querySelectorAll(".chart-folio p, .chart-folio .folio-title")].map((p)=>p.textContent.trim()).filter(Boolean)};})()`;

const looks: ReadonlyArray<readonly [string, string]> = [
  ["bare", "#seed=42"],
  ["arch", "#seed=42&type=archipelago"],
  ["arch20", "#seed=42&type=archipelago&islands=20"],
  ["arch20varied", "#seed=42&type=archipelago&islands=20&isleSize=varied"],
  ["arch20ragged", "#seed=42&type=archipelago&islands=20&raggedness=40"],
  ["iceland", `#seed=42&outline=${ICELAND}`],
  ["iceland-loose", `#seed=42&outline=${ICELAND}&looseness=60`],
  ["arch-iceland", `#seed=42&type=archipelago&outline=${ICELAND}`],
  ["bad-shape", `#seed=42&islands=20`],
  ["polar", "#seed=42&band=polar"],
  ["foreign-hash", "#seed=42&lesson=land-2"],
];

const shots = looks.map(([name, hash]) => ({
  url: `/explorer/${hash}`,
  width: 1280,
  height: 800,
  mobile: false,
  out: join(OUT_1155, "measure", "explore", `${name}.png`),
  waitMs: 800,
  script: script([]),
  scriptWaitMs: 300,
  probe: EXPLORER_STATE,
}));
shots.push({
  url: `/explorer/?lesson=land-2#seed=42&type=archipelago`,
  width: 1280,
  height: 800,
  mobile: false,
  out: join(OUT_1155, "measure", "explore", "foreign-query.png"),
  waitMs: 800,
  script: script([{ kind: "set", css: "#type", value: "continent" }]),
  scriptWaitMs: 300,
  probe: EXPLORER_STATE,
});
mkdirSync(join(OUT_1155, "measure", "explore"), { recursive: true });
writeFileSync(join(OUT_1155, "measure", "explore-shots.json"), JSON.stringify(shots, null, 1));
console.log(`${shots.length} shots`);
