// Issue #849: the biting wobble (the designer's own direction) measured as the breakdown measured the inert one:
// islands achieved and border land, seeds 1 to 10, and whether the coast slider now moves the shore (shore cells per
// land cell, the breakdown's raggedness proxy, `count-through-outline-2.md`).
// Run from the tree: node out/844/measure/sweep-wobble.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { pickSeaLevel, landMask } from "../../../src/terrain/sealevel.ts";
import { labelLandmasses } from "../../../src/world/landmass.ts";
import { LOBE_COVERAGE, placeLobes, spikeHeightfield, type LobeWobble } from "../mock/terrain.ts";
import { BITING } from "../mock/cases.ts";

const OUT = "/Users/ahl/CodeProjects/Vellum/out/844/measurements";
const W = 320,
  H = 240;
const SEEDS = Array.from({ length: 10 }, (_, i) => i + 1);

function run(seed: number, n: number, coastWarp: number, wobble: LobeWobble | undefined): { islands: number; border: number; shore: number } {
  const lobes = placeLobes(seed, n, "equal", LOBE_COVERAGE);
  const elev = spikeHeightfield({ seed, mapType: "archipelago", coastWarp, edge: { kind: "lobes", lobes, sunk: true, ...(wobble ? { wobble } : {}) } }, { gridW: W, gridH: H });
  const sea = pickSeaLevel(elev, 0.24);
  const m = landMask(elev, sea);
  let border = 0,
    shore = 0,
    land = 0;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = x + y * W;
      if (m[i] !== 1) continue;
      land++;
      if (x === 0 || y === 0 || x === W - 1 || y === H - 1) border++;
      else if (m[i - 1] === 0 || m[i + 1] === 0 || m[i - W] === 0 || m[i + W] === 0) shore++;
    }
  return { islands: labelLandmasses(elev, sea).sizes.filter((s) => s >= 20).length, border, shore: shore / land };
}
const range = (xs: number[], d = 0): string => `${Math.min(...xs).toFixed(d)} to ${Math.max(...xs).toFixed(d)}`;

const lines = [`# The biting wobble (noise ${BITING.scale} unit across the mean lobe radius, ${BITING.amp} lobe radii at full slider), archipelago, share 0.24, equal, sunk, seeds 1 to 10 (at 581a6de3)`, ""];
lines.push("| asked | coast | wobble | islands (min to max) | shore cells per land cell (min to max) | border land (sum) |");
lines.push("|---|---|---|---|---|---|");
const json: Record<string, unknown> = { sha: "581a6de3", BITING };
for (const n of [2, 5, 20, 100]) {
  for (const cw of n === 20 ? [0.1, 0.55, 0.95] : [0.55]) {
    for (const wob of [undefined, BITING]) {
      const rs = SEEDS.map((s) => run(s, n, cw, wob));
      json[`${n}|${cw}|${wob ? "biting" : "measured"}`] = rs;
      lines.push(`| ${n} | ${cw} | ${wob ? "biting" : "today's (inert)"} | ${range(rs.map((r) => r.islands))} | ${range(rs.map((r) => r.shore), 3)} | ${rs.reduce((a, r) => a + r.border, 0)} |`);
    }
  }
}
lines.push("");
lines.push("Command: `node out/844/measure/sweep-wobble.ts` from the design-844 worktree at 581a6de3.");
mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/wobble-sweep.md`, lines.join("\n") + "\n");
writeFileSync(`${OUT}/wobble-sweep.json`, JSON.stringify(json, null, 1));
console.log(lines.join("\n"));
