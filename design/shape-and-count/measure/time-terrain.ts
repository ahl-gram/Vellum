// Issue #849: what each edge costs to build, terrain only, the world sheet (320x240) and a band-1 chain (its parent plus itself), median of 7 runs after 2 warm-ups. Timings only; nothing here feeds a still.
// Run from the tree: node out/844/measure/time-terrain.ts
import { writeFileSync } from "node:fs";
import { buildHeightfield } from "../../../src/terrain/heightfield.ts";
import { spikeHeightfield, placeLobes, LOBE_COVERAGE, type Edge } from "../mock/terrain.ts";
import { crescent, japan, outlineField, texas } from "../mock/outlines.ts";

const seed = 30;
const time = (f: () => void): number => {
  for (let i = 0; i < 2; i++) f();
  const xs: number[] = [];
  for (let i = 0; i < 7; i++) {
    const t0 = performance.now();
    f();
    xs.push(performance.now() - t0);
  }
  return xs.sort((a, b) => a - b)[3] as number;
};
const tf = outlineField(texas());
const edges: Array<[string, Edge]> = [
  ["dome (the spike's restatement)", { kind: "dome" }],
  ["soft, the crescent", { kind: "soft", outline: outlineField(crescent()) }],
  ["soft, Texas (79 vertices)", { kind: "soft", outline: tf }],
  ["soft, Japan (65 vertices)", { kind: "soft", outline: outlineField(japan(false)) }],
  ["hard, Texas", { kind: "hard", outline: tf }],
  ["bias 0.7, Texas", { kind: "bias", outline: tf, strength: 0.7 }],
  ["lobes, asked 20", { kind: "lobes", lobes: placeLobes(seed, 20, "equal", LOBE_COVERAGE), sunk: true }],
  ["lobes, asked 100", { kind: "lobes", lobes: placeLobes(seed, 100, "equal", LOBE_COVERAGE), sunk: true }],
  ["lobes, asked 100, biting wobble", { kind: "lobes", lobes: placeLobes(seed, 100, "equal", LOBE_COVERAGE), sunk: true, wobble: { scale: 1, amp: 1.2 } }],
];
const lines = ["# What each edge costs to build, terrain only (at 581a6de3; this machine, median of 7)", "", "| edge | world sheet, ms | band-1 window at detail 1, ms |", "|---|---|---|"];
lines.push(`| today's buildHeightfield | ${time(() => buildHeightfield({ seed, gridW: 320, gridH: 240, mapType: "island" })).toFixed(0)} | ${time(() => buildHeightfield({ seed, gridW: 320, gridH: 240, mapType: "island", window: { u0: 0.3125, v0: 0.375, u1: 0.8125, v1: 0.875 }, worldAspect: 319 / 239, detail: 1 })).toFixed(0)} |`);
for (const [name, edge] of edges) {
  const w = time(() => spikeHeightfield({ seed, mapType: "island", edge }, { gridW: 320, gridH: 240 }));
  const r = time(() => spikeHeightfield({ seed, mapType: "island", edge }, { gridW: 320, gridH: 240, window: { u0: 0.3125, v0: 0.375, u1: 0.8125, v1: 0.875 }, worldAspect: 319 / 239, detail: 1 }));
  lines.push(`| ${name} | ${w.toFixed(0)} | ${r.toFixed(0)} |`);
}
lines.push("", "A band-1 close-up on the detail arm builds its parent (the world sheet) and itself, so its terrain costs about the sum of the two columns. Command: `node out/844/measure/time-terrain.ts` from the design-844 worktree.");
writeFileSync("/Users/ahl/CodeProjects/Vellum/out/844/measurements/terrain-cost.md", lines.join("\n") + "\n");
console.log(lines.join("\n"));
