// Issue #849 spike: the copies are faithful. With today's dome as the edge, the spike's heightfield, world sheet and
// close-up must equal the real engine's, byte for byte on this machine; and at a non-default coast the spike's close-up
// must agree with its chart where today's does not (Issue #453). Exits non-zero on any mismatch.
// Run from the tree: node out/844/mock/selfcheck.ts
import { buildHeightfield } from "../../../src/terrain/heightfield.ts";
import { lodWindowFor } from "../../../src/world/lod.ts";
import { spikeHeightfield, type TerrainInputs } from "./terrain.ts";
import { buildCloseUp, buildWorld, closeUpDisagreement, recipeFor, renderCloseUp, renderWorld } from "./sheets.ts";

let failed = 0;
const check = (name: string, ok: boolean, detail = ""): void => {
  console.log(`${ok ? "ok  " : "FAIL"} ${name}${detail ? `: ${detail}` : ""}`);
  if (!ok) failed++;
};

const window = lodWindowFor(0.5625, 0.4375, 0.5);
for (const seed of [2, 42, 12]) {
  const recipe = recipeFor(seed, {});
  const inputs: TerrainInputs = { seed, mapType: recipe.mapType, edge: { kind: "dome" } };
  const a = buildHeightfield({ seed, gridW: 320, gridH: 240, mapType: recipe.mapType });
  const b = spikeHeightfield(inputs, { gridW: 320, gridH: 240 });
  check(`seed ${seed} (${recipe.mapType}) heightfield`, a.data.every((v, i) => v === b.data[i]));
  const real = buildWorld(recipe, "engine", inputs);
  const spike = buildWorld(recipe, "spike", inputs);
  check(`seed ${seed} world sheet SVG`, renderWorld(real, "antique") === renderWorld(spike, "antique"));
  const rc = buildCloseUp(real, window, "engine", inputs);
  const sc = buildCloseUp(spike, window, "spike", inputs);
  check(`seed ${seed} band-1 close-up SVG (detail arm)`, renderCloseUp(real, rc.region, rc.spec, "antique") === renderCloseUp(spike, sc.region, sc.spec, "antique"));
}

for (const cw of [0.1, 0.95]) {
  const seed = 2;
  const recipe = recipeFor(seed, { coastWarp: cw });
  const inputs: TerrainInputs = { seed, mapType: recipe.mapType, coastWarp: cw, edge: { kind: "dome" } };
  const real = buildWorld(recipe, "engine", inputs);
  const spike = buildWorld(recipe, "spike", inputs);
  check(`seed 2 coast ${cw} world sheet SVG`, renderWorld(real, "antique") === renderWorld(spike, "antique"));
  const today = closeUpDisagreement(real, buildCloseUp(real, window, "engine", inputs).region);
  const passed = closeUpDisagreement(spike, buildCloseUp(spike, window, "spike", inputs).region);
  check(`seed 2 coast ${cw}: today's close-up disagrees, the pass-through one sits near the floor`, today > 0.04 && passed < 0.025, `today ${(100 * today).toFixed(2)}%, pass-through ${(100 * passed).toFixed(2)}%`);
}
process.exitCode = failed === 0 ? 0 : 1;
