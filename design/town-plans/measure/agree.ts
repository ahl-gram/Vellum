// Issue #793 round: the planner over every settlement of seeds 1 to 40 and 42, both street systems. Measures its time per town and its size, and checks the agreement the build's tests will hold (the plan's TW1, TW2 and TW4): every gate on the road it names, every road over the wall met by a gate, every bridge on a world river, and a bridge wherever a river runs through the wall. Exits 1 if any row breaks one.
// Run: node out/793/measure/agree.ts > out/793/measure/agree.log
import { defaultRecipe, generateWorld } from "../../../src/world/generate.ts";
import { buildProspectInput } from "../../../src/prospect/input.ts";
import { planTown } from "../planner/plan.ts";
import { distanceToPolyline, lineRingCrossings } from "../planner/geom.ts";

const GATE_ON_ROAD = 0.001;
const seeds = [...Array.from({ length: 40 }, (_, i) => i + 1), 42];
type Stat = { ms: number[]; verts: number[]; gates: number[]; blocks: number[]; streets: number[] };
const stats = new Map<string, Stat>();
const fail: string[] = [];
let walled = 0,
  gatesTotal = 0,
  riverWalls = 0,
  bridgesTotal = 0;
for (const seed of seeds) {
  const world = generateWorld(defaultRecipe(seed));
  for (let i = 0; i < world.settlements.length; i++) {
    const kind = buildProspectInput(world, i).kind;
    for (const dir of ["land", "grid"] as const) {
      const t0 = performance.now();
      const plan = planTown(world, i, dir);
      const ms = performance.now() - t0;
      const key = `${kind} ${dir}`;
      const st = stats.get(key) ?? { ms: [], verts: [], gates: [], blocks: [], streets: [] };
      st.ms.push(ms);
      st.verts.push((plan.wall?.length ?? 0) + plan.streets.reduce((a, s) => a + s.length, 0) + plan.blocks.reduce((a, b) => a + b.length, 0) + plan.landmarks.length + plan.gates.length);
      st.gates.push(plan.gates.length);
      st.blocks.push(plan.blocks.length);
      st.streets.push(plan.streets.length);
      stats.set(key, st);
      const where = `seed ${seed} index ${i} ${kind} ${dir}`;
      for (const l of plan.landmarks.filter((x) => x.kind === "bridge")) {
        if (!world.rivers.some((r) => distanceToPolyline(l.at, r.points) <= GATE_ON_ROAD)) fail.push(`${where}: a bridge at ${l.at.x.toFixed(3)},${l.at.y.toFixed(3)} stands on no river`);
        if (dir === "land") bridgesTotal++;
      }
      if (plan.wall === null) continue;
      if (dir === "land") walled++;
      for (const g of plan.gates) {
        if (distanceToPolyline(g.at, world.roads[g.road]!.points) > GATE_ON_ROAD) fail.push(`${where}: a gate stands off road ${g.road}`);
        if (dir === "land") gatesTotal++;
      }
      world.roads.forEach((road, r) => {
        for (const x of lineRingCrossings(road.points, plan.wall!))
          if (!plan.gates.some((g) => g.road === r && Math.abs(g.at.x - x.at.x) + Math.abs(g.at.y - x.at.y) <= GATE_ON_ROAD)) fail.push(`${where}: road ${r} crosses the wall with no gate`);
      });
      const crossed = world.rivers.some((r) => lineRingCrossings(r.points, plan.wall!).length > 0);
      if (crossed && dir === "land") riverWalls++;
      if (crossed && !plan.landmarks.some((l) => l.kind === "bridge")) fail.push(`${where}: a river runs through the wall and no bridge stands`);
    }
  }
}
const q = (xs: number[], p: number): number => [...xs].sort((a, b) => a - b)[Math.min(xs.length - 1, Math.floor(xs.length * p))]!;
const f = (xs: number[], d = 1): string => `median ${q(xs, 0.5).toFixed(d)} p90 ${q(xs, 0.9).toFixed(d)} max ${Math.max(...xs).toFixed(d)}`;
console.log(`seeds 1 to 40 and 42: ${[...stats.values()].reduce((a, s) => a + s.ms.length, 0) / 2} settlements, each planned both ways`);
for (const [key, s] of [...stats].sort()) {
  console.log(`${key} (${s.ms.length}): ms ${f(s.ms)} total ${s.ms.reduce((a, b) => a + b, 0).toFixed(0)}; vertices ${f(s.verts, 0)}; gates ${f(s.gates, 0)}; streets ${f(s.streets, 0)}; blocks ${f(s.blocks, 0)}`);
}
console.log(`walled plans ${walled}; gates ${gatesTotal}; walled plans a world river crosses ${riverWalls}; bridges (streets with the land) ${bridgesTotal}`);
console.log(`agreement failures: ${fail.length}`);
for (const l of fail.slice(0, 40)) console.log(`  ${l}`);
if (fail.length > 0) process.exitCode = 1;
