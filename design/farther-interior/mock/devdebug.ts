// Issue #950 round, a working check (not delivered): arm B's river against its corridor and its carved ground, one window.
// Run from the tree root: node out/950/mock/devdebug.ts <seed> <cx> <cy> <band>
import { bandWindow, worldOf } from "./common.ts";
import { armBRegion, todayRegion } from "./sheets.ts";
import { corridorOf, corridorRadius } from "./corridor.ts";
import { worldRuns } from "./course.ts";

const [seed, cx, cy, band] = process.argv.slice(2, 6).map(Number) as [number, number, number, number];
const world = worldOf(seed);
const window = bandWindow(cx, cy, band);
const today = todayRegion(world, window);
const b = armBRegion(world, window);
const runs = worldRuns(world, window);
const R = corridorRadius(world, window);
const cor = corridorOf(runs, 320, 240, R);
console.log(`R ${R.toFixed(1)}; runs ${runs.map((r) => `[${r.major ? "major" : "minor"} enters ${r.entersAtEdge} leaves ${r.leavesAtEdge} ocean ${r.endsInOcean} conf ${r.endsAtConfluence} pts ${r.pts.map((p) => `${p.x.toFixed(0)},${p.y.toFixed(0)}`).join(" ")} acc0 ${r.acc[0]!.toFixed(0)}]`).join(" ")}`);
console.log(`sea ${world.seaLevel}`);
for (const r of b.rivers) {
  const pts = r.points;
  console.log(`B river ${pts.length} pts, ocean ${r.endsInOcean}`);
  for (let i = 0; i < pts.length; i += Math.max(1, Math.floor(pts.length / 25))) {
    const p = pts[i]!;
    const c = Math.round(p.x) + Math.round(p.y) * 320;
    console.log(`  ${p.x},${p.y} dist ${(cor.dist[c] as number).toFixed(1)} along ${(cor.along[c] as number).toFixed(2)} carved ${(b.elev.data[c] as number).toFixed(5)} today ${(today.elev.data[c] as number).toFixed(5)} acc ${p.acc.toFixed(0)}`);
  }
}
