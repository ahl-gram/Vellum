// Issue #1155 round: where on home's chart a Primer pip can moor, swept over every seed-42 place no station claims, at the 1024 floor and at 1280. A mooring is clear when, at both widths, the pip and its slip are in the window and share no area with any other station, the Glass, the seed card, the legend row, home's Notice to Mariners stamp or the head cluster. Writes measure/pip-sweep.md.
// node out/1155/mock/pip-sweep.ts shots   then shoot measure/pip-sweep-shots.json (--site <tree>/dist --reduced-motion) into measure/pip-sweep-results.json   then   node out/1155/mock/pip-sweep.ts read
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homeStage } from "../../../src/site/home/stage-data.ts";
import { homeStations, unclaimedDots } from "../../../src/site/home/stations.ts";
import { script } from "./drive.ts";
import { pipAtJs, PROBE } from "./home-pip.ts";
import { OUT_1155 } from "./paths.ts";

const CLUSTER = `(()=>{const r=(e)=>{if(!e)return null;const b=e.getBoundingClientRect();return{l:b.left,t:b.top,r:b.right,b:b.bottom};};const ov=(a,b)=>!a||!b?0:Math.round(Math.max(0,Math.min(a.r,b.r)-Math.max(a.l,b.l))*Math.max(0,Math.min(a.b,b.b)-Math.max(a.t,b.t)));
const pip=document.querySelector('.lf-station[data-station="primer"]');const g=r(pip&&(pip.querySelector(".lf-station-glyph")||pip)),s=r(pip&&pip.querySelector(".lf-station-slip"));const h=r(document.querySelector("header.chrome"));return ov(g,h)+ov(s,h);})()`;
const probe = `JSON.stringify({...JSON.parse(${PROBE}),overCluster:${CLUSTER}})`;
const dots = unclaimedDots(homeStage().dots, homeStations()).filter((d) => !d.ruined);
const WINDOWS: ReadonlyArray<readonly [number, number]> = [[1024, 768], [1280, 800]];
const arms = dots.flatMap((d) => WINDOWS.map(([w, h]) => ({ d, w, h })));

const mode = process.argv[2] ?? "shots";
if (mode === "shots") {
  const shots = arms.map(({ d, w, h }) => ({ url: "/", width: w, height: h, mobile: false, out: join(OUT_1155, "measure", "pip-sweep", `${d.name}-${w}.png`), waitMs: 900, script: script([{ kind: "eval", js: pipAtJs({ nx: d.nx, ny: d.ny, sea: false, where: d.name }, false, false) }]), scriptWaitMs: 250, probe }));
  mkdirSync(join(OUT_1155, "measure", "pip-sweep"), { recursive: true });
  writeFileSync(join(OUT_1155, "measure", "pip-sweep-shots.json"), JSON.stringify(shots, null, 1));
  console.log(`${shots.length} shots over ${dots.length} places`);
} else {
  const results = JSON.parse(readFileSync(join(OUT_1155, "measure", "pip-sweep-results.json"), "utf8")) as Array<{ probe: string }>;
  type P = { inWindow: boolean; nearestStation: number; slipOverOthers: number; overGlass: number; overSeedCard: number; overLegend: number; overNotice: number; overCluster: number };
  const byPlace = new Map<string, P[]>();
  results.forEach((r, i) => {
    const name = arms[i]!.d.name;
    byPlace.set(name, [...(byPlace.get(name) ?? []), JSON.parse(r.probe) as P]);
  });
  const clear = (p: P): boolean => p.inWindow && p.slipOverOthers === 0 && p.overGlass === 0 && p.overSeedCard === 0 && p.overLegend === 0 && p.overNotice === 0 && p.overCluster === 0;
  const rows = [...byPlace.entries()].map(([name, [a, b]]) => {
    const ok = clear(a!) && clear(b!);
    const why = (p: P): string => [p.inWindow ? "" : "off the window", p.slipOverOthers ? "over a station" : "", p.overGlass ? "under the Glass" : "", p.overSeedCard ? "under the seed card" : "", p.overLegend ? "under the legend row" : "", p.overNotice ? "over the Notice" : "", p.overCluster ? "under the head cluster" : ""].filter(Boolean).join(", ") || "clear";
    return { name, ok, near: Math.min(a!.nearestStation, b!.nearestStation), line: `| ${name} | ${why(a!)} | ${why(b!)} | ${Math.round(Math.min(a!.nearestStation, b!.nearestStation))} px | ${ok ? "**clear at both**" : ""} |` };
  });
  rows.sort((x, y) => Number(y.ok) - Number(x.ok) || y.near - x.near);
  writeFileSync(
    join(OUT_1155, "measure", "pip-sweep.md"),
    `# Where a Primer pip can moor on home\n\nEvery seed-42 place no station claims and no ruin (\`unclaimedDots\` in \`src/site/home/stations.ts\` over \`homeStage\`), a pip seated there on the real built home page at 1024 by 768 and 1280 by 800 (\`node out/1155/mock/pip-sweep.ts\`, the design tree's \`dist/\` at 089881ad, reduced motion). "Nearest station" is the smaller, over the two widths, of the edge distance from the pip's glyph to the nearest other station's glyph. ${rows.filter((r) => r.ok).length} of ${rows.length} places are clear at both widths.\n\n| place | at 1024 | at 1280 | nearest station | |\n|---|---|---|---|---|\n${rows.map((r) => r.line).join("\n")}\n`,
  );
  console.log(rows.map((r) => r.line).join("\n"));
}
