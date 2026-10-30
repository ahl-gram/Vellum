// Issue #1104 round: which settlement names each ladder leaves unplaced on the four deepest-band places, under the round's gap rule (a name's gap grows with a grown mark and stays today's where a mark shrinks) or, with GAP_SHRINKS_1104=1, a gap that also shrinks with a shrunk mark.
// usage: node --import ./out/1104/mock/hooks.ts out/1104/measure/gap-rule.ts   (and again with GAP_SHRINKS_1104=1)
import { PLACES, explorerRegion, explorerSvg } from "../mock/places.ts";
import { setMarks, ladder } from "../mock/ladder.ts";

const rule = process.env["GAP_SHRINKS_1104"] === "1" ? "gap shrinks too" : "gap never shrinks (the round's rule)";
for (const p of PLACES) {
  const sh = explorerRegion(p, 5);
  const row: string[] = [];
  for (const k of ["today", "a", "b", "c"]) {
    setMarks(ladder(k).mult, "antique");
    const svg = explorerSvg(sh);
    const groups = svg.split('<g class="settlement" ').slice(1);
    const nameless = groups.filter((g) => !g.split("</g>").some((part) => part.includes("<text"))).map((g) => /data-name="([^"]+)"/.exec(g)?.[1]);
    row.push(`${k}: ${nameless.join(", ") || "none"}`);
  }
  console.log(`${rule} | ${p.key} | nameless: ${row.join(" | ")}`);
}
