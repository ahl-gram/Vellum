// Independent ground-truth geometry for the daily-hunt suite: never calls the
// module internals under test, so clues re-verify against a second source. Lives
// outside test/ so `node --test` does not collect it as a (0-test) test file.

import assert from "node:assert/strict";
import { BIOMES } from "../src/climate/biomes.ts";
import { chooseQuarry, type Clue, type Quarry } from "../src/world/daily-hunt.ts";
import type { World } from "../src/world/types.ts";

// Grid threshold (cells) within which buildClues will cite a named feature;
// mirrored here so the test can bound an emitted feature clue's distance. The
// test computes nearest features from raw geometry, independent of the module.
export const NEAR = 4;

export const ALLOWED_KINDS = new Set<Clue["kind"]>([
  "framing",
  "ew",
  "ns",
  "river",
  "lake",
  "coast",
  "onriver",
  "realm",
  "terrain",
  "road",
  "near",
]);

export function nearestNamed(
  entries: Iterable<readonly [number, string]>,
  pointsOf: (i: number) => ReadonlyArray<{ x: number; y: number }>,
  x: number,
  y: number,
): { name: string; dist: number } | null {
  let best: { name: string; dist: number } | null = null;
  for (const [i, name] of entries) {
    let d = Infinity;
    for (const p of pointsOf(i)) d = Math.min(d, Math.hypot(p.x - x, p.y - y));
    if (best === null || d < best.dist) best = { name, dist: d };
  }
  return best;
}

export function nearestNamedRiver(world: World, x: number, y: number) {
  return nearestNamed(
    world.names.rivers.entries(),
    (i) => world.rivers[i]?.points ?? [],
    x,
    y,
  );
}

export function nearestNamedLake(world: World, x: number, y: number) {
  let best: { name: string; dist: number } | null = null;
  for (const lk of world.names.lakes) {
    const d = Math.hypot(lk.x - x, lk.y - y);
    if (best === null || d < best.dist) best = { name: lk.name, dist: d };
  }
  return best;
}

export function realmNameAt(world: World, x: number, y: number): string | null {
  if (world.names.realms.length < 2) return null;
  const id = world.realms.labels[x + y * world.elev.w] as number;
  return id >= 0 ? (world.names.realms[id] ?? null) : null;
}

// Central-band fraction (1/8 of the dimension either side of the midpoint,
// i.e. the middle quarter of the chart); mirrored from buildClues so the
// sweep re-derives the band from raw geometry.
const CENTRAL_BAND = 1 / 8;

export function expectedEW(world: World, x: number): "east" | "west" | "central" {
  const c = (world.elev.w - 1) / 2;
  if (Math.abs(x - c) <= (world.elev.w - 1) * CENTRAL_BAND) return "central";
  return x < c ? "west" : "east";
}

export function expectedNS(world: World, y: number): "north" | "south" | "central" {
  const c = (world.elev.h - 1) / 2;
  if (Math.abs(y - c) <= (world.elev.h - 1) * CENTRAL_BAND) return "central";
  return y < c ? "north" : "south";
}

export function mustQuarry(world: World): Quarry {
  const q = chooseQuarry(world);
  assert.ok(q, "every swept world has at least one settlement, so a quarry exists");
  return q;
}

/** Count of the broad non-seat village pool chooseQuarry normally draws from. */
export function villagePoolSize(world: World): number {
  const seats = new Set(world.realms.seats);
  return world.settlements.filter((s, i) => s.kind === "village" && !seats.has(i)).length;
}

// --- #335 mirrors: terrain glyphs, road reach, the near anchor ---------------
// Numeric thresholds are MIRRORED from the render/engine constants, not
// imported, so the sweep re-derives every claim from raw geometry. If a
// mirrored value drifts from its source the sweep goes red, which is the alarm
// working as intended.

/** Mirrors GLYPH_MTN_REL in src/render/layers/glyphs.ts. */
export const MIRROR_MTN_REL = 0.5;
/** Mirrors GLYPH_HILL_REL in src/render/layers/glyphs.ts. */
export const MIRROR_HILL_REL = 0.34;
/** Mirrors CELLS_PER_LEAGUE in src/render/layers/scalebar.ts. */
export const MIRROR_CELLS_PER_LEAGUE = 2.2;
/** Mirrors TERRAIN_RADIUS / TERRAIN_MIN / ROAD_NEAR / LEAGUE_LADDER in
 *  src/world/daily-hunt-clue-facts.ts. */
export const TERRAIN_RADIUS = 4;
export const TERRAIN_MIN = 6;
export const ROAD_NEAR = 1.5;
export const LEAGUE_LADDER = [3, 5, 8, 10, 12, 15, 20];

/** Mirrors the glyph tree-biome set (rel <= mountain) in glyphs.ts. */
export const TREE_IDS = new Set<number>([
  BIOMES.temperateForest,
  BIOMES.rainforest,
  BIOMES.taiga,
  BIOMES.tropicalForest,
  BIOMES.jungle,
]);

const spanCache = new WeakMap<World, number>();

/** Mirrors elevSpan in src/render/map-renderer.ts: max elevation above sea. */
function elevSpan(world: World): number {
  const cached = spanCache.get(world);
  if (cached !== undefined) return cached;
  let max = -Infinity;
  for (const e of world.elev.data) max = Math.max(max, e);
  const span = Math.max(1e-9, max - world.seaLevel);
  spanCache.set(world, span);
  return span;
}

export type TerrainBand = "mountains" | "hills" | "forest" | "marsh" | "dunes";

/**
 * Counts of glyph-eligible cells of each band within TERRAIN_RADIUS of (x, y),
 * mirroring the classification chain in glyphsLayer (glyphs.ts): mountains on
 * high ground, hills below, marsh/dune tufts on the low chain, trees over the
 * forest biomes anywhere at or below mountain height.
 */
export function terrainCounts(world: World, x: number, y: number): Record<TerrainBand, number> {
  const { w, h, data } = world.elev;
  const sea = world.seaLevel;
  const span = elevSpan(world);
  const counts: Record<TerrainBand, number> = { mountains: 0, hills: 0, forest: 0, marsh: 0, dunes: 0 };
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
      if (rel > MIRROR_MTN_REL) counts.mountains++;
      else if (rel > MIRROR_HILL_REL) counts.hills++;
      else if (b === BIOMES.marsh) counts.marsh++;
      else if (b === BIOMES.desert) counts.dunes++;
      if (rel <= MIRROR_MTN_REL && TREE_IDS.has(b)) counts.forest++;
    }
  }
  return counts;
}

export type RoadState = "road" | "track" | "pathless";

/** The road network's state at (x, y): a trunk within reach, else a lane, else nothing. */
export function roadState(world: World, x: number, y: number): RoadState {
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

/**
 * The nearest anchor settlement (capital, realm seat, or town: the tiers whose
 * labels sort first in placement and essentially always win space), excluding
 * the quarry itself.
 */
export function nearestAnchor(
  world: World,
  exceptIdx: number,
): { name: string; dist: number; idx: number } | null {
  const seats = new Set(world.realms.seats);
  const from = world.settlements[exceptIdx];
  if (!from) return null;
  let best: { name: string; dist: number; idx: number } | null = null;
  world.settlements.forEach((s, idx) => {
    if (idx === exceptIdx) return;
    if (s.kind !== "capital" && s.kind !== "town" && !seats.has(idx)) return;
    const d = Math.hypot(s.x - from.x, s.y - from.y);
    if (best === null || d < best.dist) best = { name: s.name, dist: d, idx };
  });
  return best;
}

/** Mirrors chooseQuarry's base pool: non-seat villages, with its fallbacks. */
export function quarryPoolMirror(
  world: World,
): Array<{ s: World["settlements"][number]; idx: number }> {
  const seats = new Set(world.realms.seats);
  const indexed = world.settlements.map((s, idx) => ({ s, idx }));
  const villages = indexed.filter(({ s, idx }) => s.kind === "village" && !seats.has(idx));
  const nonCapital = indexed.filter(({ s, idx }) => s.kind !== "capital" && !seats.has(idx));
  return villages.length > 0 ? villages : nonCapital.length > 0 ? nonCapital : indexed;
}

/**
 * Whether `clue`'s assertion holds at settlement (s, idx), from mirrors only.
 * This is the narrowing test's ground truth: the villages consistent with a
 * day's clue list are exactly those where every emitted clue holds.
 */
export function clueHoldsAt(
  world: World,
  clue: Clue,
  s: { x: number; y: number; harbor: boolean; onRiver: boolean },
  idx: number,
): boolean {
  switch (clue.kind) {
    case "framing":
      return true;
    case "ew":
      return expectedEW(world, s.x) === clue.subject;
    case "ns":
      return expectedNS(world, s.y) === clue.subject;
    case "coast":
      return s.harbor;
    case "onriver":
      return s.onRiver;
    case "river":
      return namedFeatureWithin(world, "river", clue.subject, s.x, s.y);
    case "lake":
      return namedFeatureWithin(world, "lake", clue.subject, s.x, s.y);
    case "realm":
      return realmNameAt(world, s.x, s.y) === clue.subject;
    case "terrain":
      return terrainCounts(world, s.x, s.y)[clue.subject as TerrainBand] >= TERRAIN_MIN;
    case "road":
      return roadState(world, s.x, s.y) === clue.subject;
    case "near": {
      const anchor = world.settlements.find((a) => a.name === clue.subject);
      if (!anchor || clue.leagues === undefined) return false;
      return (
        Math.hypot(anchor.x - s.x, anchor.y - s.y) <=
        clue.leagues * MIRROR_CELLS_PER_LEAGUE + 1e-9
      );
    }
  }
}

/** Distance from (x, y) to the SPECIFIC named river/lake, <= NEAR. */
function namedFeatureWithin(
  world: World,
  kind: "river" | "lake",
  name: string | undefined,
  x: number,
  y: number,
): boolean {
  if (name === undefined) return false;
  let d = Infinity;
  if (kind === "river") {
    for (const [i, n] of world.names.rivers) {
      if (n !== name) continue;
      for (const p of world.rivers[i]?.points ?? []) d = Math.min(d, Math.hypot(p.x - x, p.y - y));
    }
  } else {
    for (const lk of world.names.lakes) {
      if (lk.name === name) d = Math.min(d, Math.hypot(lk.x - x, lk.y - y));
    }
  }
  return d <= NEAR + 1e-9;
}

// --- page-equivalent findability gates (mirror setupHunt in
// src/site/seed-of-the-day/app.ts), built from the rendered SVG STRING so the
// tests exercise the delivered list without a DOM. -----------------------------

/** A label emits as ">Name<"; capital and seat labels render .toUpperCase()
 *  (settlementsLayer in src/render/layers/settlements.ts), so both spellings
 *  count as printed. */
export function labelGate(markup: string): (name: string) => boolean {
  return (name) => markup.includes(`>${name}<`) || markup.includes(`>${name.toUpperCase()}<`);
}

/** Mirrors the app's glyph-band prefixes for #layer-glyphs <use> hrefs. */
export const GLYPH_PREFIX: Record<TerrainBand, string> = {
  mountains: "gl-mtn",
  hills: "gl-hill",
  forest: "gl-tree",
  marsh: "gl-marsh",
  dunes: "gl-dune",
};

/** Parse the drawn glyphs' symbol + render-pixel position out of the markup. */
export function drawnGlyphs(
  markup: string,
): Array<{ symbol: string; x: number; y: number }> {
  const out: Array<{ symbol: string; x: number; y: number }> = [];
  for (const tag of markup.matchAll(/<use [^>]*>/g)) {
    const href = /href="#(gl-[a-z0-9-]+)"/.exec(tag[0]);
    const at = /transform="translate\((-?[\d.]+) (-?[\d.]+)\)/.exec(tag[0]);
    if (href && at) out.push({ symbol: href[1]!, x: Number(at[1]), y: Number(at[2]) });
  }
  return out;
}

/** True when a drawn glyph of `band` sits within `radiusPx` of (qpx, qpy). */
export function glyphGate(
  markup: string,
  qpx: number,
  qpy: number,
  radiusPx: number,
): (band: TerrainBand) => boolean {
  const glyphs = drawnGlyphs(markup);
  return (band) =>
    glyphs.some(
      (g) => g.symbol.startsWith(GLYPH_PREFIX[band]) && Math.hypot(g.x - qpx, g.y - qpy) <= radiusPx,
    );
}

/**
 * The exact prose each (kind, subject) pair must carry, so a swapped text-table
 * entry cannot ship a false line while the suite stays green.
 */
export function expectedClueText(clue: Clue): string {
  const s = clue.subject ?? "";
  switch (clue.kind) {
    case "framing":
      return (
        "Today's survey hides one small place, set down on the chart but left " +
        "unnamed in these notes. Read the lines, then find it."
      );
    case "ew":
      return s === "east"
        ? "It lies toward the eastern reach of the chart."
        : s === "west"
          ? "It lies toward the western reach of the chart."
          : "It sits near the chart's central meridian, neither east nor west.";
    case "ns":
      return s === "north"
        ? "It lies in the northern part of the chart."
        : s === "south"
          ? "It lies in the southern part of the chart."
          : "It sits near the chart's middle latitude, neither north nor south.";
    case "river":
      return `It stands within sight of the river ${s}.`;
    case "lake":
      return `Its prospect takes in the waters of ${s}.`;
    case "coast":
      return "It is a harbor settlement, open to the sea.";
    case "onriver":
      return "A river runs through its bounds.";
    case "realm":
      return `It answers to ${s}.`;
    case "terrain":
      return {
        mountains: "It sits in the shadow of the mountains.",
        hills: "Hill country rises all about it.",
        forest: "Deep woods stand close about it.",
        marsh: "Marshland lies hard by its bounds.",
        dunes: "Desert sands lie hard by its bounds.",
      }[s as TerrainBand]!;
    case "road":
      return {
        road: "A made road comes to its gate.",
        track: "No made road serves it, only a track.",
        pathless: "Neither road nor track comes to it.",
      }[s as RoadState]!;
    case "near":
      return `It lies within ${clue.leagues} leagues of ${s}.`;
  }
}

/**
 * Every truthful candidate clue the quarry could have drawn, as (kind, subject)
 * pairs, re-derived from mirrors. The exhaustion half of the narrowing
 * contract checks unemitted members of this set against the remaining field.
 */
export function truthfulCandidates(
  world: World,
  q: Quarry,
): Array<{ kind: Clue["kind"]; subject?: string; leagues?: number }> {
  const { x, y } = q.settlement;
  const out: Array<{ kind: Clue["kind"]; subject?: string; leagues?: number }> = [
    { kind: "ew", subject: expectedEW(world, x) },
    { kind: "ns", subject: expectedNS(world, y) },
  ];
  const nr = nearestNamedRiver(world, x, y);
  if (nr && nr.dist <= NEAR) out.push({ kind: "river", subject: nr.name });
  const nl = nearestNamedLake(world, x, y);
  if (nl && nl.dist <= NEAR) out.push({ kind: "lake", subject: nl.name });
  if (q.settlement.harbor) out.push({ kind: "coast" });
  if (q.settlement.onRiver) out.push({ kind: "onriver" });
  const realm = realmNameAt(world, x, y);
  if (realm) out.push({ kind: "realm", subject: realm });
  const counts = terrainCounts(world, x, y);
  for (const band of Object.keys(counts) as TerrainBand[]) {
    if (counts[band] >= TERRAIN_MIN) out.push({ kind: "terrain", subject: band });
  }
  out.push({ kind: "road", subject: roadState(world, x, y) });
  const anchor = nearestAnchor(world, q.idx);
  if (anchor) {
    const leagues = LEAGUE_LADDER.find(
      (b) => anchor.dist <= b * MIRROR_CELLS_PER_LEAGUE,
    );
    if (leagues !== undefined) out.push({ kind: "near", subject: anchor.name, leagues });
  }
  return out;
}
