import { NEIGHBORS_8, type Field } from "../core/grid.ts";
import type { Rng } from "../core/rng.ts";
import { BIOMES } from "../climate/biomes.ts";
import type { FlowResult } from "../hydrology/flow.ts";
import { slopeField } from "../terrain/slope.ts";
import { clamp } from "../core/math.ts";

/** "hamlet" is a region-only tier (#171): grown by hamlets.ts at the deepest zoom
 *  band, never by placeSettlements, so a world sheet never carries one. */
export type SettlementKind = "capital" | "town" | "village" | "hamlet";

export type Settlement = {
  readonly x: number;
  readonly y: number;
  readonly kind: SettlementKind;
  readonly harbor: boolean;
  readonly onRiver: boolean;
  readonly score: number;
};

export type SiteOptions = {
  maxTowns?: number;
  maxVillages?: number;
};

/** Shared with hamlets.ts (#171): hamlets screen sites by the same appeal table. */
export const BIOME_APPEAL: Partial<Record<number, number>> = {
  [BIOMES.grassland]: 1.0,
  [BIOMES.temperateForest]: 0.85,
  [BIOMES.savanna]: 0.7,
  [BIOMES.rainforest]: 0.6,
  [BIOMES.tropicalForest]: 0.6,
  [BIOMES.shrubland]: 0.6,
  [BIOMES.beach]: 0.55,
  [BIOMES.steppe]: 0.5,
  [BIOMES.taiga]: 0.4,
  [BIOMES.jungle]: 0.35,
  [BIOMES.marsh]: 0.2,
  [BIOMES.desert]: 0.15,
  [BIOMES.tundra]: 0.1,
};

const TOWN_SPACING = 9;
const VILLAGE_SPACING = 6;
/** Shared with hamlets.ts (#171): hamlets keep the same world-border margin. */
export const EDGE_MARGIN = 4;

type Candidate = {
  x: number;
  y: number;
  score: number;
  harbor: boolean;
  onRiver: boolean;
};

export function placeSettlements(
  elev: Field,
  seaLevel: number,
  flow: FlowResult,
  riverCells: Uint8Array,
  biomes: Uint8Array,
  rng: Rng,
  opts: SiteOptions = {},
): Settlement[] {
  const { w, h, data } = elev;
  const slope = slopeField(elev);
  const jitter = rng.fork("site-jitter");

  let maxElev = -Infinity;
  for (const v of data) maxElev = Math.max(maxElev, v);
  const span = Math.max(1e-9, maxElev - seaLevel);

  let landCells = 0;
  const candidates: Candidate[] = [];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = x + y * w;
      const e = data[i] as number;
      if (e <= seaLevel) continue;
      landCells++;

      const biome = biomes[i] as number;
      if (biome === BIOMES.snow || biome === BIOMES.alpine) continue;
      if ((e - seaLevel) / span > 0.6) continue;
      if (x < EDGE_MARGIN || y < EDGE_MARGIN || x >= w - EDGE_MARGIN || y >= h - EDGE_MARGIN) {
        continue;
      }

      let harbor = false;
      let riverNear = false;
      let riverNeighbors = 0;
      for (const [dx, dy] of NEIGHBORS_8) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const ni = nx + ny * w;
        if ((data[ni] as number) <= seaLevel) harbor = true;
        if (riverCells[ni] === 1) {
          riverNear = true;
          riverNeighbors++;
        }
      }
      const onRiver = riverCells[i] === 1 || riverNear;

      let score = 0;
      if (harbor) score += 2.2;
      if (onRiver) score += 1.6;
      if (harbor && (riverCells[i] === 1 || riverNeighbors > 0)) score += 1.4; // river mouth
      if (riverNeighbors >= 3) score += 0.5; // confluence-ish
      score += (1 - Math.min(1, (slope.data[i] as number) * 8)) * 1.0;
      score += BIOME_APPEAL[biome] ?? 0.3;
      score += jitter.next() * 0.25;

      candidates.push({ x, y, score, harbor, onRiver });
    }
  }

  candidates.sort((a, b) => b.score - a.score || a.x - b.x || a.y - b.y);

  const maxTowns = opts.maxTowns ?? clamp(Math.round(landCells / 1400), 2, 9);
  const maxVillages = opts.maxVillages ?? clamp(Math.round(landCells / 700), 4, 16);

  const placed: Settlement[] = [];
  const farEnough = (c: Candidate, minDist: number): boolean =>
    placed.every((p) => Math.hypot(p.x - c.x, p.y - c.y) >= minDist);

  const capital =
    candidates.find((c) => c.harbor || c.onRiver) ?? candidates[0];
  if (!capital) return [];
  placed.push({ ...capital, kind: "capital" });

  for (const c of candidates) {
    if (placed.length >= 1 + maxTowns) break;
    if (farEnough(c, TOWN_SPACING)) {
      placed.push({ ...c, kind: "town" });
    }
  }

  for (const c of candidates) {
    if (placed.length >= 1 + maxTowns + maxVillages) break;
    if (farEnough(c, VILLAGE_SPACING)) {
      placed.push({ ...c, kind: "village" });
    }
  }

  return placed;
}
