// Issue #1104 round: for each capital-or-seat and town pair seat-spacing.ts finds close enough to share a deepest-band window, which lattice windows the Glass can draw hold both, and what each close-up then holds.
// usage: node out/1104/measure/pair-windows.ts   (the pairs are seat-spacing.ts 1 150's "fits" lines, measure/seat-spacing-1-150-fits.txt)
import { defaultRecipe, generateWorld } from "../../../src/world/generate.ts";
import { generateRegionWorld, regionTitle } from "../../../src/world/region.ts";
import { createChainCache } from "../../../src/world/detail-chain.ts";
import { lodWindowFor, quantizeCenter, LOD_BANDS } from "../../../src/world/lod.ts";

const PAIRS = [
  [83, "Maulaipanui", "Ruhau"],
  [84, "Leal", "Liomiomere"],
] as const;
for (const [seed, an, bn] of PAIRS) {
  const w = generateWorld(defaultRecipe(seed));
  const size = LOD_BANDS[5]!.sizeUV;
  const step = size / 8;
  const a = w.settlements.find((s) => s.name === an)!;
  const b = w.settlements.find((s) => s.name === bn)!;
  const uv = (s: { x: number; y: number }) => [s.x / 319, s.y / 239] as const;
  const [au, av] = uv(a);
  const [bu, bv] = uv(b);
  const seen = new Set<string>();
  const cache = createChainCache();
  let n = 0;
  for (let cu = 0; cu <= 1; cu += step)
    for (let cv = 0; cv <= 1; cv += step) {
      const q = quantizeCenter(cu, cv, size);
      const win = lodWindowFor(q.cx, q.cy, size);
      const k = `${win.u0.toFixed(6)},${win.v0.toFixed(6)}`;
      if (seen.has(k)) continue;
      seen.add(k);
      const ins = (u: number, v: number) => u > win.u0 && u < win.u1 && v > win.v0 && v < win.v1;
      if (!(ins(au, av) && ins(bu, bv))) continue;
      n++;
      const r = generateRegionWorld(w, { window: win, gridW: 320, gridH: 240, title: regionTitle(w, win), detail: true, chainCache: cache });
      const c: Record<string, number> = {};
      r.settlements.forEach((s, i) => {
        const t = s.kind === "capital" ? "capital" : r.realms.seats.includes(i) ? "seat" : s.kind;
        c[t] = (c[t] ?? 0) + 1;
      });
      console.log(seed, an, a.kind, bn, b.kind, `u0=${win.u0 * 256}/256`, `v0=${win.v0 * 256}/256`, JSON.stringify(c));
    }
  console.log(`seed ${seed}: ${n} lattice windows hold both ${an} and ${bn}`);
}
