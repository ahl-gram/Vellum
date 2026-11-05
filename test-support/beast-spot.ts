import { beastExtents } from "../src/render/layers/beast-glyphs.ts";
import type { BeastKind } from "../src/society/bestiary.ts";

// The waterline spot `beastNode` in `src/render/layers/beasts.ts` labels, read back from a 1500-wide sheet; null when no beast or no label was drawn.
export function beastSpot(svg: string, kind: BeastKind): { readonly x: number; readonly y: number } | null {
  const at = svg.indexOf('id="beast-0"');
  if (at < 0) return null;
  const group = svg.slice(at, svg.indexOf("</g>", at));
  const label = /<text x="(-?[\d.]+)" y="(-?[\d.]+)"/.exec(group);
  if (label === null) return null;
  return { x: Number(label[1]), y: Number(label[2]) - beastExtents(kind, 1).down - 15 };
}
