// Issue #793 round: the ported bird's-eye camera (out/793/ccam/) against the archived round's own still, byte for byte, at the place that still was drawn at. Run: node out/793/measure/port-check.ts
import { readFileSync } from "node:fs";
import { sceneFor } from "../ccam/data.ts";
import { plateC } from "../ccam/direction-c.ts";
import { ANTIQUE_COLOURED, INK } from "../ccam/dress.ts";
for (const [key, d] of [["antique", ANTIQUE_COLOURED], ["ink", INK]] as const) {
  const port = plateC(d, sceneFor(42, 0));
  const archived = readFileSync(new URL(`../../../design/prospects-after-braun-hogenberg/stills/c-capital-laukuwelua-${key}.svg`, import.meta.url), "utf8");
  console.log(`${key}: port ${port.length} chars, archived ${archived.length} chars, identical ${port === archived}`);
}
