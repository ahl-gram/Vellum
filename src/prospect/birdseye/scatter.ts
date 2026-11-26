import type { Rng } from "../../core/rng.ts";
import type { Pt } from "../geometry.ts";
import { insideRing } from "../town-plan/geom.ts";
import type { BirdseyeWindow, Scatter } from "./types.ts";
import { sampleAt } from "./window.ts";

const TREE_BIOMES = new Set(["temperateForest", "rainforest", "taiga", "tropicalForest", "jungle"]);
const FIELD_BIOMES = new Set(["grassland", "steppe", "shrubland", "savanna"]);

export function scatterIn(w: BirdseyeWindow, rng: Rng, radius: number, keepOut: ReadonlyArray<Pt>): Scatter[] {
  const out: Scatter[] = [];
  const reach = (radius + 0.6) * (radius + 0.6);
  for (let j = w.rows - 1; j >= 0; j -= 2) {
    for (let i = 1; i < w.cols - 1; i += 2) {
      const p = sampleAt(w, i, j);
      const here = p.u * p.u + p.v * p.v;
      if (!p.land || here < reach) continue;
      const hidden = keepOut.length > 2 && insideRing(p, keepOut);
      const keep = (item: Scatter): void => {
        if (!hidden) out.push(item);
      };
      if (TREE_BIOMES.has(p.biome) && rng.next() < 0.42) {
        const s = 0.8 + rng.next() * 0.9;
        const x = p.x + (rng.next() - 0.5) * 4;
        const species =
          p.biome === "taiga" ? "pine" : p.biome === "jungle" || p.biome === "tropicalForest" ? "palm" : "round";
        keep({ kind: "tree", x, y: p.y + 2, s, species });
      } else if (FIELD_BIOMES.has(p.biome) && here < 81 && rng.next() < 0.5) {
        const fw = 6 + rng.next() * 8;
        const fh = 3 + rng.next() * 3;
        const quad = [
          { x: p.x - fw / 2, y: p.y - fh / 2 },
          { x: p.x + fw / 2 + 1.5, y: p.y - fh / 2 },
          { x: p.x + fw / 2, y: p.y + fh / 2 },
          { x: p.x - fw / 2 - 1.5, y: p.y + fh / 2 },
        ];
        const wash = rng.next() < 0.5 ? "grass" : "ground";
        keep({ kind: "field", quad, wash, slope: rng.next() < 0.5 ? 0.08 : 0.5 });
      } else if (p.biome === "marsh" && rng.next() < 0.3) {
        keep({ kind: "marsh", x: p.x, y: p.y });
      }
    }
  }
  return out;
}
