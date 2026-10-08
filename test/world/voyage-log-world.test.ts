import { test } from "node:test";
import assert from "node:assert/strict";
import { buildVoyageLog, type VoyageLogPort } from "../../src/world/voyage-log.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { buildPlaceManifest } from "../../src/render/place-manifest.ts";
import { buildVoyagePlan } from "../../src/render/voyage.ts";
import { buildSurvey } from "../../src/render/survey.ts";
import { routeVoyage } from "../../src/render/voyage-route.ts";

test("on a real routed world the mode-aware voice reaches the right ports (seed 42)", () => {
  const world = generateWorld(defaultRecipe(42));
  const manifest = buildPlaceManifest(world, 1500);
  const plan = buildVoyagePlan(manifest.places, manifest.presentYear);
  const survey = buildSurvey(world.elev, world.seaLevel, world.roads);
  const sites = manifest.places.map((p) => ({ idx: p.idx, x: p.gx, y: p.gy }));
  const routed = routeVoyage(plan.legs, sites, survey);
  const byIdx = new Map(manifest.places.map((p) => [p.idx, p]));
  const gridLen = (pts: ReadonlyArray<{ x: number; y: number }>): number => {
    let s = 0;
    for (let i = 1; i < pts.length; i++) s += Math.hypot(pts[i]!.x - pts[i - 1]!.x, pts[i]!.y - pts[i - 1]!.y);
    return s;
  };
  const logPorts: VoyageLogPort[] = plan.ports.map((pt, i) => {
    const pm = byIdx.get(pt.idx)!;
    return {
      idx: pm.idx,
      name: pm.name,
      kind: pm.kind,
      founded: pm.founded,
      arrivalMode: i === 0 ? null : routed[i - 1]!.mode,
      inlandHandoff: i === 0 ? false : routed[i - 1]!.inlandHandoff,
      legLength: i === 0 ? 0 : gridLen(routed[i - 1]!.points),
    };
  });
  const closing = routed[routed.length - 1]!;
  const log = buildVoyageLog(logPorts, manifest.presentYear, world.recipe.seed, world.title.subtitle, {
    arrivalMode: closing.mode,
    inlandHandoff: closing.inlandHandoff,
    legLength: gridLen(closing.points),
  });

  assert.equal(plan.legs.length, plan.ports.length, "#275: the real world's tour closes too");
  assert.equal(closing.toIdx, plan.ports[0]!.idx, "the closing leg routes home to the capital");
  assert.equal(log.entries.length, plan.ports.length + 1, "one entry per port plus the homecoming");
  assert.ok(log.entries[0]!.text.includes("set out"), "the survey departs the capital");
  assert.ok(log.entries[log.entries.length - 1]!.text.includes("whence we set out"), "and comes home to it");

  const firstSea = logPorts.findIndex((p) => p.arrivalMode === "sea");
  const firstRoad = logPorts.findIndex((p) => p.arrivalMode === "road");
  assert.ok(firstSea > 0, "seed 42 has a sea arrival");
  assert.ok(firstRoad > 0, "seed 42 has a road arrival");
  assert.ok(log.entries[firstSea]!.text.includes("made sail"), "the sea port sailed in");
  assert.ok(log.entries[firstRoad]!.text.includes("rode on"), "the road port rode in");
});
