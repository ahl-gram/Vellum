// Issue #950 round: the measurement that chooses the round's places, kept with the round. On the five seeds the committed sweeps use, every candidate of each kind the issue names is scored at band 5 (the middle of the depth range) and the best taken, spreading the kinds over the seeds; the capital is the breakdown's witness, Laukuwelua on seed 42, and Won (seed 42) is kept as the breakdown's second witness.
// Kinds: a town a world river runs past; a town a world road runs through; a capital; a river mouth on a detailed shore; a realm border; a shore where the sea decorations stop.
// Run from the tree root: node out/950/mock/sweep-places.ts   (writes measure/places.tsv and places.json to the delivery)
import { mkdirSync, writeFileSync } from "node:fs";
import { isMajorRiver } from "../../../src/hydrology/rivers.ts";
import { realmBorderChains } from "../../../src/world/realm-carry.ts";
import type { UvWindow } from "../../../src/terrain/heightfield.ts";
import type { World } from "../../../src/world/types.ts";
import { bandWindow, DELIVERY, distToPolyline, SEEDS, SHA, uvOf, winLabel, worldOf } from "./common.ts";
import { todayRegion } from "./sheets.ts";

const BAND = 5;
type Cand = { seed: number; kind: string; name: string; x: number; y: number; window: UvWindow; score: number; why: string };

function crossing(world: World, w: UvWindow, pts: ReadonlyArray<{ x: number; y: number }>): boolean {
  return pts.some((p) => {
    const { u, v } = uvOf(world, p.x, p.y);
    return u >= w.u0 && u <= w.u1 && v >= w.v0 && v <= w.v1;
  });
}

function towns(world: World): Array<{ s: World["settlements"][number]; i: number }> {
  return world.settlements.map((s, i) => ({ s, i })).filter(({ s }) => s.kind !== "capital" && s.kind !== "hamlet");
}

function riverTowns(world: World, seed: number): Cand[] {
  return towns(world).flatMap(({ s }) => {
    const near = world.rivers.filter((r) => distToPolyline(s.x, s.y, r.points) <= 1);
    if (near.length === 0) return [];
    const { u, v } = uvOf(world, s.x, s.y);
    const window = bandWindow(u, v, BAND);
    const minors = world.rivers.filter((r) => !isMajorRiver(r) && crossing(world, window, r.points)).length;
    const majors = world.rivers.filter((r) => isMajorRiver(r) && crossing(world, window, r.points)).length;
    const minorNear = near.filter((r) => !isMajorRiver(r)).length;
    return [{ seed, kind: "river town", name: s.name, x: s.x, y: s.y, window, score: 10 * minorNear + minors + majors, why: `${near.length} world river(s) within one world cell of the ${s.kind} (${minorNear} minor); ${minors} minor and ${majors} major world rivers cross its band-5 window` }];
  });
}

function roadTowns(world: World, seed: number): Cand[] {
  return towns(world).flatMap(({ s }) => {
    const on = world.roads.filter((r) => distToPolyline(s.x, s.y, r.points) <= 0.5).length;
    if (on === 0) return [];
    const { u, v } = uvOf(world, s.x, s.y);
    const window = bandWindow(u, v, BAND);
    const roads = world.roads.filter((r) => crossing(world, window, r.points)).length;
    return [{ seed, kind: "road town", name: s.name, x: s.x, y: s.y, window, score: roads, why: `${on} world road(s) run through the ${s.kind}; ${roads} world roads cross its band-5 window` }];
  });
}

function borders(world: World, seed: number): Cand[] {
  const chains = realmBorderChains(world);
  const out: Cand[] = [];
  chains.forEach((chain, ci) => {
    for (let k = 0; k < chain.length; k += 6) {
      const [x, y] = chain[k]!;
      const xi = Math.round(x);
      const yi = Math.round(y);
      if ((world.elev.data[xi + yi * world.recipe.gridW] as number) <= world.seaLevel) continue;
      const { u, v } = uvOf(world, x, y);
      const window = bandWindow(u, v, BAND);
      const inside = chain.filter(([cx, cy]) => crossing(world, window, [{ x: cx, y: cy }])).length;
      const nearTown = Math.min(...world.settlements.map((s) => Math.hypot(s.x - x, s.y - y)));
      out.push({ seed, kind: "realm border", name: `border chain ${ci}, vertex ${k}`, x, y, window, score: inside - nearTown / 10, why: `${inside} vertices of the world's border chain ${ci} fall in the band-5 window; the nearest town stands ${nearTown.toFixed(1)} world cells off` });
    }
  });
  return out;
}

type RegionScore = { coastCells: number; gatedSeaNearShore: number; seaCells: number };
function regionScores(world: World, w: UvWindow): RegionScore {
  const region = todayRegion(world, w);
  const { w: W, h: H } = region.elev;
  const sea = region.seaLevel;
  const gate = region.region?.seaGate ?? new Uint8Array(W * H);
  const isLand = (i: number): boolean => (region.elev.data[i] as number) > sea;
  let coast = 0;
  let gated = 0;
  let seaCells = 0;
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const i = x + y * W;
      const land = isLand(i);
      if (!land) seaCells++;
      let shoreNear = false;
      for (let dy = -3; dy <= 3 && !shoreNear; dy++) for (let dx = -3; dx <= 3 && !shoreNear; dx++) {
        const j = x + dx + (y + dy) * W;
        if (x + dx >= 0 && x + dx < W && y + dy >= 0 && y + dy < H && isLand(j) !== land) shoreNear = true;
      }
      if (land && shoreNear) coast++;
      if (!land && shoreNear && gate[i] === 0) gated++;
    }
  }
  return { coastCells: coast, gatedSeaNearShore: gated, seaCells };
}

function mouths(world: World, seed: number): Cand[] {
  return world.rivers.filter(isMajorRiver).flatMap((r) => {
    const p = r.points[r.points.length - 2]!;
    const { u, v } = uvOf(world, p.x, p.y);
    const window = bandWindow(u, v, BAND);
    const sc = regionScores(world, window);
    return [{ seed, kind: "river mouth", name: `mouth of world river ${world.rivers.indexOf(r)}`, x: p.x, y: p.y, window, score: sc.coastCells, why: `the last land point of a major world river; ${sc.coastCells} close-up land cells stand within 3 cells of the detailed shore in its band-5 window` }];
  });
}

function seaEdges(world: World, seed: number): Cand[] {
  const W = world.recipe.gridW;
  const out: Cand[] = [];
  for (let y = 20; y < world.recipe.gridH - 20; y += 20) {
    for (let x = 20; x < W - 20; x += 20) {
      // the nearest coast cell to this lattice point, within 10 cells
      let best: { x: number; y: number; d: number } | null = null;
      for (let dy = -10; dy <= 10; dy++) for (let dx = -10; dx <= 10; dx++) {
        const cx = x + dx;
        const cy = y + dy;
        const i = cx + cy * W;
        if ((world.elev.data[i] as number) <= world.seaLevel) continue;
        const shore = [i - 1, i + 1, i - W, i + W].some((j) => (world.elev.data[j] as number) <= world.seaLevel);
        const d = Math.hypot(dx, dy);
        if (shore && (best === null || d < best.d)) best = { x: cx, y: cy, d };
      }
      if (best === null) continue;
      const { u, v } = uvOf(world, best.x, best.y);
      const window = bandWindow(u, v, BAND);
      const sc = regionScores(world, window);
      out.push({ seed, kind: "sea edge", name: `shore at world cell ${best.x},${best.y}`, x: best.x, y: best.y, window, score: sc.gatedSeaNearShore, why: `${sc.gatedSeaNearShore} close-up sea cells within 3 cells of the detailed shore are shut by the sea gate (the world charts land at their nearest world cell), of ${sc.seaCells} sea cells in its band-5 window` });
    }
  }
  return out;
}

mkdirSync(`${DELIVERY}/measure`, { recursive: true });
const all: Cand[] = [];
for (const seed of SEEDS) {
  const world = worldOf(seed);
  all.push(...riverTowns(world, seed), ...roadTowns(world, seed), ...borders(world, seed), ...mouths(world, seed), ...seaEdges(world, seed));
  console.error(`seed ${seed}: ${all.length} candidates so far`);
}
const rows = ["seed\tkind\tname\tworld x\tworld y\tband-5 window\tscore\twhy", ...all.map((c) => [c.seed, c.kind, c.name, c.x.toFixed(1), c.y.toFixed(1), winLabel(c.window), c.score.toFixed(2), c.why].join("\t"))];
writeFileSync(`${DELIVERY}/measure/places.tsv`, rows.join("\n") + "\n");

// The picks: the capital and Won are the breakdown's witnesses on seed 42; each other kind takes its best candidate on a seed not yet used, falling back to a used seed only when no unused one has a candidate.
const used = new Set<number>([42]);
const picks: Array<Cand & { pickedBecause: string }> = [];
const w42 = worldOf(42);
const cap = w42.settlements[0]!;
const capUv = uvOf(w42, cap.x, cap.y);
picks.push({ seed: 42, kind: "capital", name: cap.name, x: cap.x, y: cap.y, window: bandWindow(capUv.u, capUv.v, BAND), score: 0, why: `seed 42's capital; at band 5 its close-up draws no road where four of the world's roads cross the window (the breakdown's witness)`, pickedBecause: "the breakdown's witness" });
for (const kind of ["river town", "road town", "river mouth", "realm border", "sea edge"]) {
  const ranked = all.filter((c) => c.kind === kind).sort((a, b) => b.score - a.score);
  const fresh = ranked.find((c) => !used.has(c.seed));
  const pick = fresh ?? ranked[0]!;
  used.add(pick.seed);
  const how = fresh ? "on a seed not yet used" : "on any seed, every seed being taken by an earlier kind";
  picks.push({ ...pick, pickedBecause: `best ${kind} by score ${how} (score ${pick.score.toFixed(2)}; best overall ${ranked[0]!.score.toFixed(2)} on seed ${ranked[0]!.seed})` });
}
const won = w42.settlements.find((s) => s.name === "Won")!;
const wonUv = uvOf(w42, won.x, won.y);
picks.push({ seed: 42, kind: "river and road village", name: "Won", x: won.x, y: won.y, window: bandWindow(wonUv.u, wonUv.v, BAND), score: 0, why: "the breakdown's second witness: at band 5 its close-up draws no river and no road where the world has one river and two roads", pickedBecause: "the breakdown's witness" });
writeFileSync(`${DELIVERY}/measure/places.json`, JSON.stringify({ sha: SHA, band: BAND, picks }, null, 1));
for (const p of picks) console.log(`${p.kind}: seed ${p.seed}, ${p.name} (${p.x.toFixed(1)}, ${p.y.toFixed(1)}), ${winLabel(p.window)}; ${p.why}; ${p.pickedBecause}`);
