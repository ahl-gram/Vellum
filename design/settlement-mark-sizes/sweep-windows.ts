// Issue #1104 round: which deepest-band windows hold the most settlement tiers at once. Stage 1 counts the world's own tiers in every lattice window the Glass can draw at band 5 around a capital or seat; stage 2 surveys the best windows as the Explorer does and counts the close-up's tiers, hamlets, farmsteads and mills included.
// usage: node out/1104/sweep-windows.ts <fromSeed> <toSeed> [stage2PerSeed] [minWorldTiers]
import { writeFileSync, mkdirSync } from "node:fs";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld, regionTitle } from "../../src/world/region.ts";
import { LOD_BANDS, lodWindowFor, quantizeCenter } from "../../src/world/lod.ts";
import { createChainCache } from "../../src/world/detail-chain.ts";
import type { World } from "../../src/world/types.ts";
import type { UvWindow } from "../../src/terrain/heightfield.ts";

const OUT_ROOT = "/Users/ahl/CodeProjects/Vellum/out/1104";
const BAND = LOD_BANDS[5]!;
const SIZE = BAND.sizeUV;
const STEP = SIZE / 8;
const EDGE = 0.15;

type Tier = "capital" | "seat" | "town" | "village" | "hamlet" | "farmstead" | "mill";
const TIERS: readonly Tier[] = ["capital", "seat", "town", "village", "hamlet", "farmstead", "mill"];

const tierOf = (w: World, i: number): Tier => {
  const s = w.settlements[i]!;
  if (s.kind === "capital") return "capital";
  if (w.realms.seats.includes(i)) return "seat";
  return s.kind as Tier;
};

const uvOf = (w: World, i: number) => {
  const s = w.settlements[i]!;
  return { u: s.x / (w.recipe.gridW - 1), v: s.y / (w.recipe.gridH - 1) };
};

const inside = (win: UvWindow, u: number, v: number, edge: number): boolean => {
  const e = (win.u1 - win.u0) * edge;
  return u >= win.u0 + e && u <= win.u1 - e && v >= win.v0 + e && v <= win.v1 - e;
};

function countWorld(w: World, win: UvWindow): Record<Tier, number> & { ruined: number } {
  const c = { capital: 0, seat: 0, town: 0, village: 0, hamlet: 0, farmstead: 0, mill: 0, ruined: 0 };
  w.settlements.forEach((s, i) => {
    const { u, v } = uvOf(w, i);
    if (!inside(win, u, v, 0.05)) return;
    c[tierOf(w, i)]++;
    if (s.ruined) c.ruined++;
  });
  return c;
}

function countRegion(r: World): Record<Tier, number> & { ruined: number } {
  const c = { capital: 0, seat: 0, town: 0, village: 0, hamlet: 0, farmstead: 0, mill: 0, ruined: 0 };
  r.settlements.forEach((s, i) => {
    c[tierOf(r, i)]++;
    if (s.ruined) c.ruined++;
  });
  return c;
}

const key = (win: UvWindow) => `${win.u0.toFixed(6)},${win.v0.toFixed(6)}`;

function stage1(w: World) {
  const seen = new Map<string, { win: UvWindow; anchor: number; counts: ReturnType<typeof countWorld>; score: number }>();
  w.settlements.forEach((_, i) => {
    const t = tierOf(w, i);
    if (t !== "capital" && t !== "seat" && t !== "town") return;
    const { u, v } = uvOf(w, i);
    for (let du = -SIZE / 2; du <= SIZE / 2 + 1e-9; du += STEP) {
      for (let dv = -SIZE / 2; dv <= SIZE / 2 + 1e-9; dv += STEP) {
        const q = quantizeCenter(u + du, v + dv, SIZE);
        const win = lodWindowFor(q.cx, q.cy, SIZE);
        if (!inside(win, u, v, EDGE)) continue;
        const k = key(win);
        if (seen.has(k)) continue;
        const counts = countWorld(w, win);
        const distinct = TIERS.filter((tt) => counts[tt] > 0).length;
        const score = distinct * 100 + counts.town * 3 + counts.village * 2 - counts.ruined * 5;
        seen.set(k, { win, anchor: i, counts, score });
      }
    }
  });
  return [...seen.values()].sort((a, b) => b.score - a.score);
}

const from = Number(process.argv[2] ?? 1);
const to = Number(process.argv[3] ?? 40);
const perSeed = Number(process.argv[4] ?? 2);
const minWorld = Number(process.argv[5] ?? 0);
const rows: unknown[] = [];
const started = Date.now();
for (let seed = from; seed <= to; seed++) {
  const w = generateWorld(defaultRecipe(seed));
  const cands = stage1(w)
    .filter((c) => TIERS.filter((t) => c.counts[t] > 0).length >= minWorld)
    .slice(0, perSeed);
  const cache = createChainCache();
  for (const c of cands) {
    const title = regionTitle(w, c.win);
    const r = generateRegionWorld(w, { window: c.win, gridW: BAND.gridW, gridH: BAND.gridH, title, detail: true, chainCache: cache });
    const rc = countRegion(r);
    const distinct = TIERS.filter((t) => rc[t] > 0);
    const row = {
      seed,
      anchor: c.anchor,
      anchorName: w.settlements[c.anchor]!.name,
      anchorTier: tierOf(w, c.anchor),
      window: c.win,
      title,
      world: c.counts,
      region: rc,
      distinct: distinct.length,
      tiers: distinct.join("+"),
    };
    rows.push(row);
    console.log(
      [seed, c.anchor, row.anchorName, row.anchorTier, `u0=${c.win.u0.toFixed(5)}`, `v0=${c.win.v0.toFixed(5)}`, `distinct=${distinct.length}`, row.tiers, JSON.stringify(rc)].join(" "),
    );
  }
}
mkdirSync(`${OUT_ROOT}/measure`, { recursive: true });
writeFileSync(`${OUT_ROOT}/measure/sweep-windows-${from}-${to}.json`, JSON.stringify(rows, null, 1));
console.log(`swept seeds ${from}..${to} in ${((Date.now() - started) / 1000).toFixed(1)} s`);
