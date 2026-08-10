/**
 * The foreground grammar (#239): what stands between the townscape and the
 * plate's foot. Harbor places the quay, water, and masts (the main stage:
 * 590 of 609 settlements are harbors, per the 2026-08-10 measured facts on
 * #229); a river places the bridge or the village weir; otherwise the biome
 * band dresses the ground. Shapes and positions only; ink is Sub 3's.
 */

import type { Rng } from "../core/rng.ts";
import type { ProspectKind } from "./input.ts";
import type { BiomeName } from "../climate/biomes.ts";
import {
  BASE_GROUND,
  SHORE_DROP,
  VIEW_X0,
  VIEW_X1,
  WATER_BOTTOM,
  type ForegroundElement,
  type Ground,
  type Mass,
  type Water,
  type XYS,
} from "./geometry.ts";

/** The dress vocabularies the band can wear, from the spike's plates. */
export type Treatment =
  | "fields"
  | "forest"
  | "pines"
  | "palms"
  | "strand"
  | "marsh"
  | "scrub";

const TREATMENT_OF: Record<BiomeName, Treatment | null> = {
  ocean: null,
  beach: "strand",
  marsh: "marsh",
  tundra: "scrub",
  taiga: "pines",
  steppe: "fields",
  grassland: "fields",
  shrubland: "fields",
  temperateForest: "forest",
  rainforest: "forest",
  savanna: "fields",
  desert: "strand",
  tropicalForest: "palms",
  jungle: "palms",
  alpine: "scrub",
  snow: "scrub",
};

/** Tie-break priority: the more distinctive dress wins an even band. */
const PRIORITY: ReadonlyArray<Treatment> = [
  "marsh",
  "forest",
  "pines",
  "palms",
  "strand",
  "scrub",
  "fields",
];

/** Majority treatment over the band's land samples; an all-ocean band (a
 * site in open water's lee) falls back to the strand. */
export function treatmentFor(band: ReadonlyArray<BiomeName>): Treatment {
  const counts = new Map<Treatment, number>();
  for (const biome of band) {
    const t = TREATMENT_OF[biome];
    if (t !== null) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  let best: Treatment = "strand";
  let bestCount = 0;
  for (const t of PRIORITY) {
    const c = counts.get(t) ?? 0;
    if (c > bestCount) {
      best = t;
      bestCount = c;
    }
  }
  return best;
}

const cxOf = (): number => (VIEW_X0 + VIEW_X1) / 2;
const width = (): number => VIEW_X1 - VIEW_X0;

function scatter(
  rng: Rng,
  count: number,
  make: (r: Rng, i: number) => XYS,
): XYS[] {
  return Array.from({ length: count }, (_, i) => make(rng, i));
}

/** Natural (pre-founding) dressing for the land band. Fields are plowed and
 * so man-made; before the founding their ground reads bare (grass texture
 * is Sub 3 dress), but the boundary trees stay. */
export function composeLandDressing(
  treatment: Treatment,
  kind: ProspectKind,
  ground: Ground,
  rng: Rng,
  opts: { readonly built: boolean; readonly frontRow: ReadonlyArray<Mass> },
): ForegroundElement[] {
  const cx = cxOf();
  const base = ground.base;
  const out: ForegroundElement[] = [];
  switch (treatment) {
    case "fields": {
      if (opts.built) {
        const rows = Array.from({ length: 4 }, (_, row) => {
          const y = base + 10 + row * 9;
          const x0 = VIEW_X0 + 18 + row * 12 + rng.next() * 8;
          const x1 = VIEW_X1 - 20 - row * 9 - rng.next() * 8;
          return { y, x0, x1 };
        });
        out.push({ kind: "fieldRows", rows });
      }
      out.push({
        kind: "trees",
        species: "round",
        items: [
          { x: VIEW_X0 + 42 + rng.next() * 20, y: base + 26, s: 1.7 },
          { x: VIEW_X1 - 50 - rng.next() * 20, y: base + 30, s: 1.9 },
        ],
      });
      break;
    }
    case "forest":
    case "pines": {
      const back = scatter(rng, 8, (r, i) => ({
        x: cx + (i % 2 === 0 ? -1 : 1) * (105 + r.next() * 105),
        y: base - 4 - r.next() * 10,
        s: 1.3 + r.next() * 0.5,
      }));
      const frontTrees = scatter(rng, 8, (r, i) => ({
        x: cx + (i % 2 === 0 ? -1 : 1) * (66 + r.next() * 145),
        y: base + 12 + r.next() * 22,
        s: 1.9 + r.next() * 0.9,
      }));
      out.push({
        kind: "trees",
        species: treatment === "pines" ? "pine" : "round",
        items: [...back, ...frontTrees],
      });
      break;
    }
    case "palms": {
      out.push({
        kind: "trees",
        species: "palm",
        items: scatter(rng, 6, (r, i) => ({
          x: cx + (i % 2 === 0 ? -1 : 1) * (88 + r.next() * 60),
          y: base + (i < 3 ? -2 : 8) + r.next() * 6,
          s: 2.1 + r.next() * 0.5,
        })),
      });
      break;
    }
    case "strand": {
      out.push({
        kind: "dunes",
        items: scatter(rng, 5, (r) => ({
          x: VIEW_X0 + 40 + r.next() * (width() - 80),
          y: base - 8 + r.next() * 11,
          s: 1.6 + r.next() * 0.5,
        })),
      });
      out.push({
        kind: "trees",
        species: "palm",
        items: [
          { x: cx - 95 - rng.next() * 30, y: base - 2, s: 2.1 },
          { x: cx + 88 + rng.next() * 30, y: base - 4, s: 2.4 },
          { x: cx - 130 - rng.next() * 30, y: base + 1, s: 2.6 },
        ],
      });
      break;
    }
    case "marsh": {
      out.push({
        kind: "marshTufts",
        items: scatter(rng, 9, (r) => ({
          x: VIEW_X0 + 30 + r.next() * (width() - 60),
          y: base + 12 + r.next() * 26,
          s: 1.5 + r.next() * 0.7,
        })),
      });
      out.push({
        kind: "ripples",
        items: scatter(rng, 4, (r) => ({
          x: VIEW_X0 + 30 + r.next() * (width() - 120),
          y: base + 14 + r.next() * 22,
          s: 0.8,
        })),
      });
      // Stilts under the fen village's near houses (the spike's Reedholt).
      if (opts.built && kind === "village") {
        const posts = opts.frontRow.slice(0, 3).flatMap((b) => [
          { x: b.x + 2, y: b.base },
          { x: b.x + b.w - 2, y: b.base },
        ]);
        out.push({ kind: "stilts", posts });
      }
      break;
    }
    case "scrub": {
      const rows = Array.from({ length: 3 }, (_, row) => ({
        y: base + 12 + row * 9,
        x0: VIEW_X0 + 30 + row * 16,
        x1: VIEW_X1 - 30 - row * 12,
      }));
      out.push({ kind: "scrubRows", rows });
      break;
    }
  }
  return out;
}

export function seaWater(ground: Ground): Water {
  return { kind: "sea", y0: ground.base + SHORE_DROP, y1: WATER_BOTTOM };
}

export function riverWater(ground: Ground): Water {
  return { kind: "river", y0: ground.base + 10, y1: ground.base + 38 };
}

/** The harbor stage (#229 measured facts: design it first). Capital, seat,
 * and town build the quay with its articulate face (#237 GO condition 9:
 * steps, arcade, bollards; the edge shadow is Sub 3 ink) and moor a mast
 * row; a village or hamlet beaches its hulls on the strand instead. Ruin
 * keeps the masonry and loses the craft. */
export function composeSeaFront(
  kind: ProspectKind,
  ruined: boolean,
  water: Water,
  rng: Rng,
): ForegroundElement[] {
  const cx = cxOf();
  const shore = water.y0;
  const out: ForegroundElement[] = [];
  if (kind === "capital" || kind === "seat" || kind === "town") {
    const q0 = cx - 130;
    const q1 = cx + 40;
    out.push({
      kind: "quay",
      x0: q0,
      x1: q1,
      y: shore,
      bollards: [q0 + 10, (q0 + q1) / 2, q1 - 10],
      steps: { x: q1 - 18, y: shore, count: 3 },
      arcade: { x0: q0 + 8, x1: cx - 20, arches: 4 },
    });
    if (!ruined) {
      const count = kind === "capital" ? 5 : 4;
      const m0 = q1 + 14;
      const m1 = VIEW_X1 - 60;
      out.push({
        kind: "mastRow",
        masts: Array.from({ length: count }, (_, i) => ({
          x: m0 + (i + 0.5) * ((m1 - m0) / count) + (rng.next() - 0.5) * 8,
          hullY: shore + 10 + rng.next() * 6,
          mastH: 42 + rng.next() * 26,
        })),
      });
      out.push({
        kind: "ship",
        x: VIEW_X0 + 70 + rng.next() * 30,
        y: water.y1 - 16,
        s: 1.15,
      });
      if (kind === "capital") {
        out.push({ kind: "mole", rootX: VIEW_X1 - 10, headX: VIEW_X1 - 52, headY: shore + 10 });
      }
    }
  } else if (!ruined) {
    const hulls =
      kind === "village"
        ? [
            { x: cx - 60, y: shore - 2, tilt: -7 },
            { x: cx + 34, y: shore - 2, tilt: 5 },
          ]
        : [{ x: cx - 30, y: shore - 2, tilt: -5 }];
    out.push({ kind: "beachedHulls", hulls });
    const jx = cx + 110;
    out.push({
      kind: "jetty",
      x0: jx - 30,
      y0: shore - 1,
      x1: jx + 34,
      y1: shore + 6,
      posts: Array.from({ length: 4 }, (_, i) => ({
        x: jx - 20 + i * 16,
        y: shore + 0.5 + i * 1.6,
      })),
    });
    if (kind === "village") out.push({ kind: "nets", x: cx - 122, y: shore - 16 });
  }
  return out;
}

/** The river stage: capital, seat, and town anchor a bridge (#237 GO
 * condition 4: abutments and a bridge-gate tower at the town bank; the
 * capital spans five arches); the village keeps the ratified weir, its mill
 * turning only while the village lives (GO condition 6, keyed on river
 * villages); a hamlet fords. Bridges and weirs are masonry and survive
 * ruin; the mill wheel does not. */
export function composeRiverFront(
  kind: ProspectKind,
  ruined: boolean,
  water: Water,
  rng: Rng,
): ForegroundElement[] {
  void rng;
  const cx = cxOf();
  const out: ForegroundElement[] = [];
  if (kind === "capital" || kind === "seat" || kind === "town") {
    const grand = kind === "capital";
    const x0 = grand ? cx - 150 : cx + 10;
    const x1 = grand ? cx + 150 : cx + 158;
    const deckY = water.y0 - 3;
    out.push({
      kind: "bridge",
      x0,
      x1,
      deckY,
      waterY: water.y1 - 5,
      arches: grand ? 5 : 3,
      gateTower: {
        form: "tower",
        x: x0 - 6,
        w: 12,
        h: 22,
        base: deckY + 1,
        raise: 0,
        broken: false,
      },
    });
  } else if (kind === "village") {
    out.push({ kind: "weir", x0: cx - 90, x1: cx + 90, y: water.y0 + 9 });
    if (!ruined) {
      const mx = cx + 108;
      out.push({
        kind: "mill",
        house: { form: "gable", x: mx, w: 22, h: 15, base: water.y1 + 9, raise: 0, broken: false },
        wheel: { cx: mx - 4, cy: water.y1 + 1, r: 6 },
      });
    }
  }
  return out;
}

/** Birds over the plate: a pair riding the sea wind, a wheeling six over a
 * ruin (the spike's ratified counts). */
export function composeBirds(count: number, rng: Rng): ForegroundElement {
  return {
    kind: "birds",
    items: scatter(rng, count, (r) => ({
      x: VIEW_X0 + 60 + r.next() * (width() - 120),
      y: 70 + r.next() * 36,
      s: 0.7 + r.next() * 0.5,
    })),
  };
}
