// Issue #950 round: is the finer tier monotone? farmsteads.ts claims every farmstead drawn at band 5 is drawn at band 6. Its spacing test reads the window's own towns and hamlets and the marks already placed, and its spot and its mill test read the window's own ground and rivers, so the claim is measured here rather than taken: on every place, each band-5 mark whose spot lies inside the band-6 window (inside its 2 % inset) is looked for at band 6 by name, a mill and a farmstead of one name counting as the same mark.
// Run from the tree root: node out/950/mock/tier-monotone.ts
import { readFileSync, writeFileSync } from "node:fs";
import { bandWindow, DELIVERY, GRID_W, GRID_H, SHA, uvOf, worldOf } from "./common.ts";
import { armARegion, todayRegion } from "./sheets.ts";
import { finerTier } from "./farmsteads.ts";
import { slugOf, type Pick } from "./build.ts";

const { picks } = JSON.parse(readFileSync(`${DELIVERY}/measure/places.json`, "utf8")) as { picks: Pick[] };
const base = (n: string): string => n.replace(/ Mill$/, "");
const L = [`finer tier, band 5 to band 6, at ${SHA}: each band-5 farmstead or mill whose spot lies inside the band-6 window, and whether band 6 draws it`];
let kept = 0;
let lost = 0;
for (const pick of picks) {
  const world = worldOf(pick.seed);
  const { u, v } = uvOf(world, pick.x, pick.y);
  const w5 = bandWindow(u, v, 5);
  const w6 = bandWindow(u, v, 6);
  const m5 = finerTier(world, w5, 5, armARegion(world, w5, todayRegion(world, w5)).region);
  const m6 = finerTier(world, w6, 6, armARegion(world, w6, todayRegion(world, w6)).region);
  const names6 = new Set(m6.map((m) => base(m.name)));
  const du = w6.u1 - w6.u0;
  const inside = m5.filter((m) => {
    const mu = w5.u0 + (m.settlement.x / (GRID_W - 1)) * (w5.u1 - w5.u0);
    const mv = w5.v0 + (m.settlement.y / (GRID_H - 1)) * (w5.v1 - w5.v0);
    return mu > w6.u0 + 0.02 * du && mu < w6.u1 - 0.02 * du && mv > w6.v0 + 0.02 * du && mv < w6.v1 - 0.02 * du;
  });
  const missing = inside.filter((m) => !names6.has(base(m.name)));
  kept += inside.length - missing.length;
  lost += missing.length;
  L.push(`${slugOf(pick)}: band 5 draws ${m5.length}, ${inside.length} inside the band-6 window, ${missing.length} of them missing at band 6${missing.length ? ` (${missing.map((m) => m.name).join(", ")})` : ""}; band 6 draws ${m6.length}`);
}
L.push(`in all: ${kept} carried, ${lost} lost`);
writeFileSync(`${DELIVERY}/measure/tier-monotone.txt`, L.join("\n") + "\n");
console.log(L.join("\n"));
