// Issue #950 round, a working check (not delivered): today's band-3 close-up of seed 42's capital, each river's distance from the others, to read the doubled line the live hold shows.
import { bandWindow, distToPolyline, uvOf, worldOf } from "./common.ts";
import { todayRegion } from "./sheets.ts";
const world = worldOf(42);
const cap = world.settlements[0]!;
const { u, v } = uvOf(world, cap.x, cap.y);
const w = bandWindow(u, v, 3);
const r = todayRegion(world, w);
r.rivers.forEach((a, i) => {
  const projected = a.points.some((p) => !Number.isInteger(p.x) || !Number.isInteger(p.y));
  const others = r.rivers.filter((_, j) => j !== i);
  const near = a.points.map((p) => Math.min(...others.map((o) => distToPolyline(p.x, p.y, o.points))));
  const within = (d: number): number => near.filter((x) => x <= d).length;
  console.log(`river ${i}: ${a.points.length} points, ${projected ? "projected world major" : "extracted"}, ocean ${a.endsInOcean}; points within 2/3/4/6 cells of another river: ${within(2)}/${within(3)}/${within(4)}/${within(6)}`);
});
// The shadow as `majorShadow` in src/world/region-rivers.ts builds it: the cells within two of each projected major's VERTICES.
const projected = r.rivers.filter((a) => a.points.some((p) => !Number.isInteger(p.x) || !Number.isInteger(p.y)));
const shadow = new Set<number>();
for (const m of projected) for (const p of m.points) for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) shadow.add(Math.round(p.x) + dx + (Math.round(p.y) + dy) * 320);
for (const e of r.rivers.filter((a) => !projected.includes(a))) {
  const inside = e.points.filter((p) => shadow.has(Math.round(p.x) + Math.round(p.y) * 320)).length;
  console.log(`extracted river of ${e.points.length} points: ${inside} inside the majors' shadow (${((100 * inside) / e.points.length).toFixed(0)}%); the projected majors' vertices stand ${projected.map((m) => m.points.slice(1).map((p, i) => Math.hypot(p.x - m.points[i]!.x, p.y - m.points[i]!.y).toFixed(1)).join(",")).join(" | ")} cells apart`);
}
