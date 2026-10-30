// Issue #1104 round: proves the variant modules draw today's sheets byte for byte at multiplier 1. Run once plain and once under the hooks, then compare the two printed digests:
//   node out/1104/mock/control-proof.ts plain
//   node --import ./out/1104/mock/hooks.ts out/1104/mock/control-proof.ts hooked
import { createHash } from "node:crypto";
import { PLACES, explorerRegion, explorerSvg, worldSheet, atlasRegionSvg } from "./places.ts";
import { setMarks, ladder } from "./ladder.ts";

const arm = process.argv[2] ?? "plain";
if (arm === "hooked-set") setMarks(ladder("today").mult, "antique");
if (arm === "hooked-b") setMarks(ladder("b").mult, "antique");
const digest = (s: string) => createHash("sha256").update(s).digest("hex").slice(0, 16);
const out: Record<string, string> = {};
for (const p of PLACES) {
  out[`${p.key}-band5`] = digest(explorerSvg(explorerRegion(p, 5)));
  out[`${p.key}-band3`] = digest(explorerSvg(explorerRegion(p, 3)));
  for (const style of ["antique", "ink", "topographic", "nautical"] as const) out[`${p.key}-world-${style}`] = digest(explorerSvg(worldSheet(p), style));
  out[`${p.key}-atlas`] = digest(atlasRegionSvg(p));
}
console.log(JSON.stringify({ arm, out }));
