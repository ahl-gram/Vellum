// Issue #793 round: the census behind the choice of places. Seeds first, through defaultRecipe then generateWorld (handbook/specs/engine-invariants.md, Measuring a world in a script).
// Usage: node out/793/measure/sweep.ts [from] [to] [--rows]  (default seeds 1 to 40 and 42)
import { defaultRecipe, generateWorld } from "../../../src/world/generate.ts";
import { buildProspectInput } from "../../../src/prospect/input.ts";
import { sampleBilinear } from "../../../src/prospect/transect.ts";
import type { World } from "../../../src/world/types.ts";

type Pt = { x: number; y: number };
const TOWN_R: Record<string, number> = { capital: 4.6, seat: 3.8, town: 3.0, village: 1.9 };
const TYPICAL: Record<string, number> = { capital: 6, seat: 4.5, town: 3.5, village: 1.8 };
export const radiusFor = (kind: string, score: number): number =>
  TOWN_R[kind]! * Math.min(1.2, Math.max(0.8, score / TYPICAL[kind]!));

function ringCrossings(lines: ReadonlyArray<ReadonlyArray<Pt>>, c: Pt, R: number): number {
  let n = 0;
  for (const pts of lines)
    for (let k = 1; k < pts.length; k++) {
      const a = pts[k - 1]!, b = pts[k]!;
      const da = Math.sqrt((a.x - c.x) * (a.x - c.x) + (a.y - c.y) * (a.y - c.y)) - R;
      const db = Math.sqrt((b.x - c.x) * (b.x - c.x) + (b.y - c.y) * (b.y - c.y)) - R;
      if (da < 0 !== db < 0) n++;
    }
  return n;
}

function ringStats(world: World, c: Pt, R: number) {
  // the ring at radius R sampled at 48 points: share below sea level; and the disc sampled on a 0.25-cell lattice: land share, relief and how far the uphill direction turns
  let wet = 0;
  for (let k = 0; k < 48; k++) {
    const a = (k / 48) * 2 * Math.PI;
    if (sampleBilinear(world.elev, c.x + R * Math.cos(a), c.y + R * Math.sin(a)) <= world.seaLevel) wet++;
  }
  let lo = Infinity, hi = -Infinity, land = 0, all = 0;
  const top = Math.max(...Array.from(world.elev.data));
  const span = top - world.seaLevel || 1;
  let gxs = 0, gys = 0, gmag = 0;
  for (let oy = -R; oy <= R; oy += 0.25)
    for (let ox = -R; ox <= R; ox += 0.25) {
      if (ox * ox + oy * oy > R * R) continue;
      all++;
      const e = sampleBilinear(world.elev, c.x + ox, c.y + oy);
      if (e <= world.seaLevel) continue;
      land++;
      lo = Math.min(lo, e); hi = Math.max(hi, e);
      const gx = sampleBilinear(world.elev, c.x + ox + 0.5, c.y + oy) - sampleBilinear(world.elev, c.x + ox - 0.5, c.y + oy);
      const gy = sampleBilinear(world.elev, c.x + ox, c.y + oy + 0.5) - sampleBilinear(world.elev, c.x + ox, c.y + oy - 0.5);
      const m = Math.sqrt(gx * gx + gy * gy);
      if (m > 0) { gxs += gx / m; gys += gy / m; gmag++; }
    }
  // coherence 1 = the uphill direction is the same everywhere in the disc (one plane); near 0 = it turns (a knoll, a valley)
  const coherence = gmag > 0 ? Math.sqrt(gxs * gxs + gys * gys) / gmag : 0;
  return { wetRing: wet / 48, landShare: land / all, relief: land > 0 ? (hi - lo) / span : 0, coherence };
}

const args = process.argv.slice(2);
const rowsWanted = args.includes("--rows");
const nums = args.filter((a) => !a.startsWith("--")).map(Number);
const seeds = nums.length === 2 ? Array.from({ length: nums[1]! - nums[0]! + 1 }, (_, i) => i + nums[0]!) : [...Array.from({ length: 40 }, (_, i) => i + 1), 42];

type Row = { seed: number; i: number; name: string; kind: string; H: boolean; Rv: boolean; R: number; roads: number; rivers: number; wetRing: number; landShare: number; relief: number; coherence: number; ruined: boolean };
const rows: Row[] = [];
for (const seed of seeds) {
  const world = generateWorld(defaultRecipe(seed));
  world.settlements.forEach((s, i) => {
    const input = buildProspectInput(world, i);
    const R = radiusFor(input.kind, s.score);
    const st = ringStats(world, s, R);
    rows.push({
      seed, i, name: s.name, kind: input.kind, H: s.harbor, Rv: s.onRiver, R,
      roads: ringCrossings(world.roads.map((r) => r.points), s, R),
      rivers: ringCrossings(world.rivers.map((r) => r.points), s, R),
      ...st, ruined: s.ruined,
    });
  });
}

const by = (k: string) => rows.filter((r) => r.kind === k);
const q = (xs: number[], p: number) => { const s = [...xs].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(s.length * p))]!; };
console.log(`seeds ${seeds[0]}..${seeds[seeds.length - 1]} (${seeds.length} worlds), ${rows.length} settlements`);
for (const k of ["capital", "seat", "town", "village"]) {
  const rs = by(k);
  const f = (xs: number[]) => `median ${q(xs, 0.5).toFixed(3)} p90 ${q(xs, 0.9).toFixed(3)} max ${Math.max(...xs).toFixed(3)}`;
  const hist = (xs: number[]) => JSON.stringify(Object.fromEntries([...new Map(xs.map((x) => [x, xs.filter((y) => y === x).length])).entries()].sort((a, b) => a[0] - b[0])));
  console.log(`\n${k}: ${rs.length}  harbour ${rs.filter((r) => r.H).length}  river ${rs.filter((r) => r.Rv).length}  inland (no harbour) ${rs.filter((r) => !r.H).length}  ruined ${rs.filter((r) => r.ruined).length}`);
  console.log(`  radius R (cells): ${f(rs.map((r) => r.R))} min ${Math.min(...rs.map((r) => r.R)).toFixed(2)}`);
  console.log(`  share of the ring R below sea level: ${f(rs.map((r) => r.wetRing))}; rings wholly dry ${rs.filter((r) => r.wetRing === 0).length}`);
  console.log(`  land share of the disc: ${f(rs.map((r) => r.landShare))} min ${Math.min(...rs.map((r) => r.landShare)).toFixed(3)}`);
  console.log(`  relief in the disc (share of land span): ${f(rs.map((r) => r.relief))}`);
  console.log(`  uphill coherence in the disc (1 = one plane): ${f(rs.map((r) => r.coherence))} min ${Math.min(...rs.map((r) => r.coherence)).toFixed(3)}; under 0.5: ${rs.filter((r) => r.coherence < 0.5).length}`);
  console.log(`  world-road crossings of the ring: ${hist(rs.map((r) => r.roads))}`);
  console.log(`  world-river crossings of the ring: ${hist(rs.map((r) => r.rivers))}`);
}
const top = (k: string, key: keyof Row, n: number, filter: (r: Row) => boolean = () => true) =>
  by(k).filter(filter).sort((a, b) => (b[key] as number) - (a[key] as number)).slice(0, n)
    .map((r) => `seed ${r.seed} index ${r.i} ${r.name} (${r.H ? "harbour" : "inland"}${r.Rv ? ", river" : ""}) ${String(key)} ${(r[key] as number).toFixed(3)} roads ${r.roads} rivers ${r.rivers} wet ${r.wetRing.toFixed(2)} relief ${r.relief.toFixed(3)}`);
console.log("\nhighest relief, capitals:"); top("capital", "relief", 4).forEach((l) => console.log("  " + l));
console.log("highest relief, seats:"); top("seat", "relief", 4).forEach((l) => console.log("  " + l));
console.log("most roads, towns:"); top("town", "roads", 4).forEach((l) => console.log("  " + l));
console.log("most roads, seats:"); top("seat", "roads", 4).forEach((l) => console.log("  " + l));
console.log("inland villages by relief:"); top("village", "relief", 6, (r) => !r.H).forEach((l) => console.log("  " + l));
console.log("inland river villages by roads:"); top("village", "roads", 4, (r) => !r.H && r.Rv).forEach((l) => console.log("  " + l));
console.log("harbour villages with no river, by roads:"); top("village", "roads", 4, (r) => r.H && !r.Rv).forEach((l) => console.log("  " + l));
if (rowsWanted) {
  console.log("\nseed\tindex\tname\tkind\tharbour\triver\tR\troads\trivers\twetRing\tlandShare\trelief\tcoherence\truined");
  for (const r of rows) console.log([r.seed, r.i, r.name, r.kind, r.H ? "H" : "-", r.Rv ? "R" : "-", r.R.toFixed(2), r.roads, r.rivers, r.wetRing.toFixed(3), r.landShare.toFixed(3), r.relief.toFixed(3), r.coherence.toFixed(3), r.ruined ? "ruin" : ""].join("\t"));
}
