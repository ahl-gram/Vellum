// Issue #793 round: the size budget's evidence. Every settlement of seeds 42, 7 and 19 drawn in each view and arm, in both dresses, measured in UTF-8 bytes and render milliseconds, against today's plate (prospectPlate, the dry run's 793-sizes.log baseline). Run: node out/793/measure/bytes.ts > out/793/measure/bytes.log
import { STYLES } from "../../../src/render/style.ts";
import { prospectPlate } from "../../../src/prospect/finished.ts";
import { sceneFor } from "../ccam/data.ts";
import { ANTIQUE_COLOURED, INK } from "../ccam/dress.ts";
import { plateC, plateCWith } from "../ccam/direction-c.ts";
import { planTown } from "../planner/plan.ts";
import { planViewPlate } from "../mock/plan-view.ts";
import { planLayer } from "../mock/birdseye.ts";
import { profilePlate } from "../mock/profile.ts";

type Row = { view: string; arm: string; dress: string; kind: string; bytes: number; ms: number };
const rows: Row[] = [];
const time = (view: string, arm: string, dress: string, kind: string, f: () => string): void => {
  const t0 = performance.now();
  const svg = f();
  rows.push({ view, arm, dress, kind, bytes: Buffer.byteLength(svg, "utf8"), ms: performance.now() - t0 });
};
for (const seed of [42, 7, 19]) {
  const world = sceneFor(seed, 0).world;
  for (let i = 0; i < world.settlements.length; i++) {
    const scene = sceneFor(seed, i);
    const kind = scene.input.kind as "capital" | "seat" | "town" | "village";
    for (const [dress, d] of [["antique", ANTIQUE_COLOURED], ["ink", INK]] as const) {
      time("profile", "control", dress, kind, () => prospectPlate(world, i, STYLES[dress], world.title.year));
      time("birdseye", "control", dress, kind, () => plateC(d, scene));
      for (const dir of ["land", "grid"] as const) {
        const plan = planTown(world, i, dir);
        time("profile", dir, dress, kind, () => profilePlate(world, i, plan, kind, dress, "today", "closed"));
        time("birdseye", dir, dress, kind, () => plateCWith(d, scene, planLayer(world, plan, kind, "closed", "m")));
        time("birdseye", `${dir}-lean`, dress, kind, () => plateCWith(d, scene, planLayer(world, plan, kind, "closed", "m", "lean")));
        time("plan", dir, dress, kind, () => planViewPlate(d, scene, plan, kind, { shore: "closed", label: "m" }));
      }
    }
  }
}
const kb = (b: number): string => (b / 1024).toFixed(0);
const groups = new Map<string, Row[]>();
for (const r of rows) {
  const k = `${r.view}\t${r.arm}\t${r.dress}\t${r.kind}`;
  groups.set(k, [...(groups.get(k) ?? []), r]);
  const all = `${r.view}\t${r.arm}\t${r.dress}\tall`;
  groups.set(all, [...(groups.get(all) ?? []), r]);
}
console.log("view\tarm\tdress\tkind\tplates\tmean KB\tmax KB\tmean ms\tmax ms");
for (const [k, rs] of [...groups].sort()) {
  const b = rs.map((r) => r.bytes),
    m = rs.map((r) => r.ms);
  console.log(`${k}\t${rs.length}\t${kb(b.reduce((a, x) => a + x, 0) / b.length)}\t${kb(Math.max(...b))}\t${(m.reduce((a, x) => a + x, 0) / m.length).toFixed(0)}\t${Math.max(...m).toFixed(0)}`);
}
