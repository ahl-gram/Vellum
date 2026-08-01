import { BIOMES } from "../climate/biomes.ts";
import { GLYPH_HILL_REL, GLYPH_MTN_REL, TREE_BIOMES } from "../render/layers/glyphs.ts";
import { CELLS_PER_LEAGUE } from "../render/layers/scalebar.ts";
import type { Clue } from "./daily-hunt-clues.ts";
import type { Quarry } from "./daily-hunt.ts";
import type { NamedSettlement, World } from "./types.ts";

/**
 * Truthful clue CANDIDATES for the daily hunt (#335). Every candidate pairs an
 * antique survey line (true of the quarry by construction) with a `holds`
 * predicate any candidate village can be tested against, so the selection walk
 * in daily-hunt-clues.ts can measure how far each line narrows the field.
 *
 * Findability rule: every candidate points at something the antique sheet
 * draws (terrain glyphs, roads and tracks, printed names, the scale bar). The
 * glyph thresholds and the leagues scale are IMPORTED from the render layers,
 * never mirrored, so a clue and the drawing cannot drift apart. Wind is
 * deliberately absent: style.winds is nautical-only, so a wind clue would not
 * be checkable on the hunt's antique sheet.
 */

/** Grid-cell radius within which a named river or lake is "near" the quarry. */
export const NEAR = 4;

/**
 * Fraction of a chart dimension, either side of the midpoint, that counts as
 * "central": the middle quarter of the chart. Without a band, a quarry two
 * cells off dead-center reads "western reach", which live play proved
 * misleading (seed 20260731, #333).
 */
const CENTRAL_BAND = 1 / 8;

/** Radius (cells) of the neighborhood a terrain clue describes, and the
 *  minimum qualifying cells within it. The floor keeps the clue findable: the
 *  glyph field samples candidates, so a lone qualifying cell may draw nothing,
 *  but a neighborhood of six almost surely shows glyphs. */
export const TERRAIN_RADIUS = 4;
export const TERRAIN_MIN = 6;

/** Reach (cells) within which the road network serves a settlement. */
export const ROAD_NEAR = 1.5;

/** Round leagues bounds the near clue may quote (read against the scale bar).
 *  Capped at 20: past that the circle covers so much chart the line reads as
 *  filler, so a farther-flung quarry simply gets no near clue. */
export const LEAGUE_LADDER: ReadonlyArray<number> = [3, 5, 8, 10, 12, 15, 20];

export type PoolEntry = { readonly s: NamedSettlement; readonly idx: number };

/** The base pool chooseQuarry draws from: non-seat villages, falling back to
 *  any non-capital non-seat settlement, then to everything. The narrowing walk
 *  counts consistent villages over this same pool, so the two never disagree
 *  about who the candidates are. */
export function quarryPool(world: World): ReadonlyArray<PoolEntry> {
  const seats = new Set(world.realms.seats);
  const indexed = world.settlements.map((s, idx) => ({ s, idx }));
  const villages = indexed.filter(({ s, idx }) => s.kind === "village" && !seats.has(idx));
  const nonCapital = indexed.filter(({ s, idx }) => s.kind !== "capital" && !seats.has(idx));
  return villages.length > 0 ? villages : nonCapital.length > 0 ? nonCapital : indexed;
}

export type ClueCandidate = {
  readonly clue: Clue;
  readonly holds: (e: PoolEntry) => boolean;
};

export type TerrainBand = "mountains" | "hills" | "forest" | "marsh" | "dunes";

/**
 * The page's findability gates, applied BEFORE selection so every guarantee
 * (narrowing, floor, line count) holds on the list the player actually sees.
 * The rendered SVG is the only source of truth for what was drawn, so the
 * page supplies these; omitted gates admit everything (engine-side callers).
 */
export type ClueFindability = {
  /** Was this name printed on the sheet? Mind the case: capital and seat
   *  labels render `.toUpperCase()` (`settlementsLayer` in
   *  `src/render/layers/settlements.ts`). */
  readonly isLabeled?: (name: string) => boolean;
  /** Does at least one DRAWN glyph of this band stand within TERRAIN_RADIUS
   *  of the quarry? Eligible cells are not enough: `glyphsLayer` in
   *  `src/render/layers/glyphs.ts` shuffles tree candidates and caps them
   *  globally, so a wooded neighborhood can draw no tree at all. */
  readonly hasGlyphNear?: (band: TerrainBand) => boolean;
};

export type ClueFacts = {
  /** The two always-true compass bands, [east/west, north/south]. */
  readonly compass: ReadonlyArray<ClueCandidate>;
  /** Every other clue that holds at the quarry AND passes the findability gates. */
  readonly features: ReadonlyArray<ClueCandidate>;
  readonly pool: ReadonlyArray<PoolEntry>;
};

export function buildClueFacts(
  world: World,
  quarry: Quarry,
  findable: ClueFindability = {},
): ClueFacts {
  const s = quarry.settlement;
  const { x, y } = s;
  const pool = quarryPool(world);
  const labeled = findable.isLabeled ?? (() => true);
  const glyphNear = findable.hasGlyphNear ?? (() => true);

  const compass = [ewCandidate(world, x), nsCandidate(world, y)];
  const features: ClueCandidate[] = [];

  const river = nearestNamedRiver(world, x, y);
  if (river && river.dist <= NEAR && labeled(river.name)) {
    features.push({
      clue: {
        kind: "river",
        subject: river.name,
        text: `It stands within sight of the river ${river.name}.`,
      },
      holds: (e) => riverDist(world, river.i, e.s.x, e.s.y) <= NEAR,
    });
  }

  const lake = nearestNamedLake(world, x, y);
  if (lake && lake.dist <= NEAR && labeled(lake.name)) {
    features.push({
      clue: {
        kind: "lake",
        subject: lake.name,
        text: `Its prospect takes in the waters of ${lake.name}.`,
      },
      holds: (e) => Math.hypot(lake.x - e.s.x, lake.y - e.s.y) <= NEAR,
    });
  }

  if (s.harbor) {
    features.push({
      clue: { kind: "coast", text: "It is a harbor settlement, open to the sea." },
      holds: (e) => e.s.harbor,
    });
  }

  if (s.onRiver) {
    features.push({
      clue: { kind: "onriver", text: "A river runs through its bounds." },
      holds: (e) => e.s.onRiver,
    });
  }

  const realm = realmNameAt(world, x, y);
  if (realm) {
    features.push({
      clue: { kind: "realm", subject: realm, text: `It answers to ${realm}.` },
      holds: (e) => realmNameAt(world, e.s.x, e.s.y) === realm,
    });
  }

  features.push(...terrainCandidates(world, x, y).filter((c) => glyphNear(c.band)));
  features.push(roadCandidate(world, x, y));
  const near = nearCandidate(world, quarry);
  if (near && labeled(near.clue.subject as string)) features.push(near);

  return { compass, features, pool };
}

// --- compass bands (#333) ----------------------------------------------------

function ewBandOf(world: World, x: number): "east" | "west" | "central" {
  const c = (world.elev.w - 1) / 2;
  if (Math.abs(x - c) <= (world.elev.w - 1) * CENTRAL_BAND) return "central";
  return x < c ? "west" : "east";
}

function nsBandOf(world: World, y: number): "north" | "south" | "central" {
  const c = (world.elev.h - 1) / 2;
  if (Math.abs(y - c) <= (world.elev.h - 1) * CENTRAL_BAND) return "central";
  return y < c ? "north" : "south";
}

function ewCandidate(world: World, x: number): ClueCandidate {
  const ew = ewBandOf(world, x);
  return {
    clue: {
      kind: "ew",
      subject: ew,
      text:
        ew === "east"
          ? "It lies toward the eastern reach of the chart."
          : ew === "west"
            ? "It lies toward the western reach of the chart."
            : "It sits near the chart's central meridian, neither east nor west.",
    },
    holds: (e) => ewBandOf(world, e.s.x) === ew,
  };
}

function nsCandidate(world: World, y: number): ClueCandidate {
  const ns = nsBandOf(world, y);
  return {
    clue: {
      kind: "ns",
      subject: ns,
      text:
        ns === "north"
          ? "It lies in the northern part of the chart."
          : ns === "south"
            ? "It lies in the southern part of the chart."
            : "It sits near the chart's middle latitude, neither north nor south.",
    },
    holds: (e) => nsBandOf(world, e.s.y) === ns,
  };
}

// --- terrain neighborhoods ----------------------------------------------------

const TERRAIN_TEXT: Record<TerrainBand, string> = {
  mountains: "It sits in the shadow of the mountains.",
  hills: "Hill country rises all about it.",
  forest: "Deep woods stand close about it.",
  marsh: "Marshland lies hard by its bounds.",
  dunes: "Desert sands lie hard by its bounds.",
};

/** Glyph-eligible cell counts by band within TERRAIN_RADIUS of (x, y),
 *  classified by the exact chain glyphsLayer draws with. */
function terrainCounts(
  world: World,
  span: number,
  x: number,
  y: number,
): Record<TerrainBand, number> {
  const { w, h, data } = world.elev;
  const sea = world.seaLevel;
  const counts: Record<TerrainBand, number> = {
    mountains: 0,
    hills: 0,
    forest: 0,
    marsh: 0,
    dunes: 0,
  };
  for (let dy = -TERRAIN_RADIUS; dy <= TERRAIN_RADIUS; dy++) {
    for (let dx = -TERRAIN_RADIUS; dx <= TERRAIN_RADIUS; dx++) {
      if (Math.hypot(dx, dy) > TERRAIN_RADIUS) continue;
      const gx = x + dx;
      const gy = y + dy;
      if (gx < 0 || gy < 0 || gx >= w || gy >= h) continue;
      const i = gx + gy * w;
      const e = data[i] as number;
      if (e <= sea) continue;
      const rel = (e - sea) / span;
      const b = world.biomes[i] as number;
      if (rel > GLYPH_MTN_REL) counts.mountains++;
      else if (rel > GLYPH_HILL_REL) counts.hills++;
      else if (b === BIOMES.marsh) counts.marsh++;
      else if (b === BIOMES.desert) counts.dunes++;
      if (rel <= GLYPH_MTN_REL && TREE_BIOMES.has(b)) counts.forest++;
    }
  }
  return counts;
}

function terrainCandidates(
  world: World,
  x: number,
  y: number,
): Array<ClueCandidate & { readonly band: TerrainBand }> {
  let max = -Infinity;
  for (const e of world.elev.data) max = Math.max(max, e);
  const span = Math.max(1e-9, max - world.seaLevel);

  const memo = new Map<number, Record<TerrainBand, number>>();
  const countsAt = (e: PoolEntry): Record<TerrainBand, number> => {
    const cached = memo.get(e.idx);
    if (cached) return cached;
    const fresh = terrainCounts(world, span, e.s.x, e.s.y);
    memo.set(e.idx, fresh);
    return fresh;
  };

  const here = terrainCounts(world, span, x, y);
  const out: Array<ClueCandidate & { readonly band: TerrainBand }> = [];
  for (const band of Object.keys(here) as TerrainBand[]) {
    if (here[band] < TERRAIN_MIN) continue;
    out.push({
      band,
      clue: { kind: "terrain", subject: band, text: TERRAIN_TEXT[band] },
      holds: (e) => countsAt(e)[band] >= TERRAIN_MIN,
    });
  }
  return out;
}

// --- roads --------------------------------------------------------------------

type RoadState = "road" | "track" | "pathless";

const ROAD_TEXT: Record<RoadState, string> = {
  road: "A made road comes to its gate.",
  track: "No made road serves it, only a track.",
  pathless: "Neither road nor track comes to it.",
};

function roadStateAt(world: World, x: number, y: number): RoadState {
  let trunk = Infinity;
  let lane = Infinity;
  for (const road of world.roads) {
    for (const p of road.points) {
      const d = Math.hypot(p.x - x, p.y - y);
      if (road.rank === "trunk") trunk = Math.min(trunk, d);
      else lane = Math.min(lane, d);
    }
  }
  if (trunk <= ROAD_NEAR) return "road";
  if (lane <= ROAD_NEAR) return "track";
  return "pathless";
}

function roadCandidate(world: World, x: number, y: number): ClueCandidate {
  const state = roadStateAt(world, x, y);
  const memo = new Map<number, RoadState>();
  return {
    clue: { kind: "road", subject: state, text: ROAD_TEXT[state] },
    holds: (e) => {
      const cached = memo.get(e.idx);
      const got = cached ?? roadStateAt(world, e.s.x, e.s.y);
      if (cached === undefined) memo.set(e.idx, got);
      return got === state;
    },
  };
}

// --- the near anchor ----------------------------------------------------------

/** The nearest capital, realm seat, or town: the tiers whose labels sort first
 *  in placement and essentially always win space. The page still gates the
 *  emitted clue on the label actually having been drawn (the #91 prune). */
function nearCandidate(world: World, quarry: Quarry): ClueCandidate | null {
  const seats = new Set(world.realms.seats);
  const from = quarry.settlement;
  let best: { name: string; x: number; y: number; dist: number } | null = null;
  world.settlements.forEach((a, idx) => {
    if (idx === quarry.idx) return;
    if (a.kind !== "capital" && a.kind !== "town" && !seats.has(idx)) return;
    const d = Math.hypot(a.x - from.x, a.y - from.y);
    if (best === null || d < best.dist) best = { name: a.name, x: a.x, y: a.y, dist: d };
  });
  if (best === null) return null;
  const anchor = best as { name: string; x: number; y: number; dist: number };
  const leagues = LEAGUE_LADDER.find((b) => anchor.dist <= b * CELLS_PER_LEAGUE);
  if (leagues === undefined) return null;
  return {
    clue: {
      kind: "near",
      subject: anchor.name,
      leagues,
      text: `It lies within ${leagues} leagues of ${anchor.name}.`,
    },
    holds: (e) =>
      Math.hypot(anchor.x - e.s.x, anchor.y - e.s.y) <= leagues * CELLS_PER_LEAGUE,
  };
}

// --- named-feature geometry ---------------------------------------------------

function riverDist(world: World, riverIdx: number, x: number, y: number): number {
  let d = Infinity;
  for (const p of world.rivers[riverIdx]?.points ?? []) {
    d = Math.min(d, Math.hypot(p.x - x, p.y - y));
  }
  return d;
}

function nearestNamedRiver(
  world: World,
  x: number,
  y: number,
): { i: number; name: string; dist: number } | null {
  let best: { i: number; name: string; dist: number } | null = null;
  for (const [i, name] of world.names.rivers) {
    const d = riverDist(world, i, x, y);
    if (best === null || d < best.dist) best = { i, name, dist: d };
  }
  return best;
}

function nearestNamedLake(
  world: World,
  x: number,
  y: number,
): { x: number; y: number; name: string; dist: number } | null {
  let best: { x: number; y: number; name: string; dist: number } | null = null;
  for (const lk of world.names.lakes) {
    const d = Math.hypot(lk.x - x, lk.y - y);
    if (best === null || d < best.dist) best = { x: lk.x, y: lk.y, name: lk.name, dist: d };
  }
  return best;
}

export function realmNameAt(world: World, x: number, y: number): string | null {
  if (world.names.realms.length < 2) return null;
  const id = world.realms.labels[x + y * world.elev.w];
  return id >= 0 ? (world.names.realms[id] ?? null) : null;
}
