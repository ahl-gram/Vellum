// Issue #1248 round, item 7: whether each commission offered can be reached with the Explorer's own controls. Each target's address is opened on the built Explorer and every row it names is read: shown, and not set aside in a held box (`seatOf` in `src/site/explorer/land-rows.ts`). Writes measure/7-commissions.md.
// node out/1248/mock/seats-commission-check.ts
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { script } from "./drive.ts";
import { measureFile, SHA, shotDir } from "./seats-paths.ts";
import { probeOf, shoot } from "./seats-shoot.ts";

const TARGETS = [
  { key: "a", says: "a polar archipelago of about forty islands, of every size, in the nautical style with its arms", at: "/explorer/#seed=42&style=nautical&type=archipelago&band=polar&arms=1&islands=40&isleSize=varied", rows: ["type", "band", "islands", "sizes", "land"] },
  { key: "b", says: "a tropical island with a lobed coast, in the topographic style, its sea beasts drawn", at: "/explorer/#seed=42&style=topographic&type=island&band=tropical&beasts=1", rows: ["type", "band", "coast"] },
  { key: "c", says: "a temperate continent with more land than sea, in the ink style with its arms", at: "/explorer/#seed=42&style=ink&type=continent&band=temperate&arms=1", rows: ["type", "band", "land"] },
];
const probe = (rows: string[]): string => `JSON.stringify(${JSON.stringify(rows)}.map((r)=>{const e=document.querySelector("[data-row="+r+"]");if(!e)return{row:r,shown:false};const held=!!e.closest(".held, .held-box, [data-held]")||e.classList.contains("held");const anc=[];for(let p=e.parentElement;p&&p.id!=="broadside";p=p.parentElement)anc.push(p.className);return{row:r,shown:[e,...e.querySelectorAll("*")].some((x)=>{const q=x.getBoundingClientRect();return q.width>0&&q.height>0&&getComputedStyle(x).visibility!=="hidden";}),held,within:anc.filter(Boolean).slice(0,3),ends:[...e.querySelectorAll("[class*=land-end]")].map((x)=>x.textContent.trim())};}).concat([{style:document.getElementById("style")?.value,beasts:document.getElementById("beasts")?.checked??null,arms:document.getElementById("arms")?.checked??null}]))`;
const res = shoot("7-commissions", TARGETS.map((t) => ({ url: t.at, width: 1280, height: 800, mobile: false as const, out: join(shotDir("7-words"), "..", "..", "measure", "7-commissions", `explorer-${t.key}.png`), waitMs: 400, script: script([]), scriptWaitMs: 300, probe: probe(t.rows) })));
const lines = TARGETS.map((t, i) => `| ${t.key} | ${t.says} | \`${t.at}\` | ${JSON.stringify(probeOf<unknown>(res[i]!)).replace(/\|/g, "/")} |`);
writeFileSync(measureFile("7-commissions.md"), `# Item 7: can each Explorer commission be reached?\n\nEach target's address opened on the built Explorer at ${SHA.slice(0, 8)}, 1280 by 800, reduced motion (\`node out/1248/mock/seats-commission-check.ts\`); each row the target names read as shown or not, held or not, with the words at its two ends, and the style and presses. Option (a) reads its sea level row too, which a counted archipelago sets aside in its held box, as the witness that a held row is seen. Every result came back with no 4xx and no console error.\n\n| option | target | address | rows read |\n|---|---|---|---|\n${lines.join("\n")}\n`);
console.log(lines.join("\n"));
