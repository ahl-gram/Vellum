import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import ts from "typescript";
import { MAX_TILT } from "../../src/render/voyage-geometry.ts";
import { RDP_EPSILON, COAST_EMBARK_MAX } from "../../src/render/voyage-route.ts";
import { INLAND_STUB_CELLS } from "../../src/render/voyage-water.ts";
import { huntProjection } from "../../src/site/seed-of-the-day/app-hunt.ts";
import { rv4TiltAndFacing } from "../../e2e/suites/room-voyage-route.ts";
import type { SuiteContext } from "../../e2e/types.ts";
import { stringConfig } from "../../scripts/build-app-bundles.ts";
import { BACKDROP_SAMPLES, FOREGROUND_SAMPLES } from "../../src/prospect/transect.ts";
import { LOD_BANDS } from "../../src/world/lod.ts";
import { defaultRecipe } from "../../src/world/generate.ts";
import { POSTER_PRESETS } from "../../src/site/print-room/poster-presets.ts";
import { MAX_PIXELS, fitScaleToBudget } from "../../src/site/lib/rasterize.ts";

// Constant contracts that span files: each pair must move together.

const ROOT = resolve(import.meta.dirname, "..", "..");
const src = (p: string) => readFileSync(join(ROOT, p), "utf8");
const walk = (dir: string): string[] =>
  readdirSync(join(ROOT, dir), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : e.name.endsWith(".ts") ? [join(dir, e.name)] : [],
  );

test("RDP_EPSILON is pinned absolutely, so an epsilon bump is a conscious change here too", () => {
  assert.equal(RDP_EPSILON, 0.75);
});

test("COAST_EMBARK_MAX stays strictly below INLAND_STUB_CELLS", () => {
  assert.ok((COAST_EMBARK_MAX as number) < INLAND_STUB_CELLS);
});

test("the backdrop lattice lands a foreground sample exactly on a backdrop stride", () => {
  assert.equal((BACKDROP_SAMPLES - 1) % (FOREGROUND_SAMPLES - 1), 0);
});

test("every region band obeys lodWindowFor's size <= 0.98 precondition", () => {
  for (const band of LOD_BANDS) {
    if (band.isRegion) assert.ok(band.sizeUV <= 0.98, `band ${band.index} sizeUV ${band.sizeUV}`);
  }
});

test("POSTER_PRESETS stays width-ascending: the clamp envelope reads first and last", () => {
  for (let i = 1; i < POSTER_PRESETS.length; i++) {
    assert.ok(POSTER_PRESETS[i]!.width > POSTER_PRESETS[i - 1]!.width);
  }
});

test("the 24 Mpx budget clears every poster at x1 and clamps exactly Wall and Grand at x2", () => {
  const recipe = defaultRecipe(42);
  const aspect = recipe.gridH / recipe.gridW;
  const clampedAt2: string[] = [];
  for (const p of POSTER_PRESETS) {
    const h = Math.round(p.width * aspect);
    assert.equal(fitScaleToBudget(p.width, h, 1, MAX_PIXELS).clamped, false, `${p.key} at x1`);
    if (fitScaleToBudget(p.width, h, 2, MAX_PIXELS).clamped) clampedAt2.push(p.key);
  }
  assert.deepEqual(clampedAt2, ["wall", "grand"]);
});

test("RV4 passes a mark that tips to MAX_TILT and fails one a step past it, the page reading the tilt to two decimals", async () => {
  const rv4 = async (maxTilt: number): Promise<boolean> => {
    const seen: Array<readonly [string, boolean]> = [];
    const page = { evaluate: () => Promise.resolve({ maxTilt, flips: 0, naiveFlips: 3, legIdx: 0, worstNaive: 3 }) };
    const check = (name: string, ok: boolean) => {
      seen.push([name, ok]);
    };
    await rv4TiltAndFacing({ ...page, check } as unknown as SuiteContext);
    const verdict = seen.find(([name]) => name.startsWith("RV4 "));
    assert.ok(verdict, "RV4 made no check");
    return verdict[1];
  };
  assert.equal(await rv4(MAX_TILT), true, `a mark at MAX_TILT (${MAX_TILT}) fails RV4`);
  assert.equal(await rv4(MAX_TILT + 0.01), false, `a mark past MAX_TILT (${MAX_TILT}) passes RV4`);
});

test("the Hunt projects onto the chart renderMap drew: every town stands where the chart put it", async () => {
  const { realWorld } = await import("../../test-support/living-chart-hosts.ts");
  const { manifest, world } = await realWorld();
  const proj = huntProjection(world);
  assert.equal(proj.heightPx, manifest.heightPx, "the Hunt's sheet is not the chart's height");
  for (const place of manifest.places) {
    const town = world.settlements[place.idx]!;
    const at = { x: proj.px(town.x), y: proj.py(town.y) };
    assert.ok(
      Math.abs(at.x - place.nx * manifest.widthPx) < 1e-9 && Math.abs(at.y - place.ny * manifest.heightPx) < 1e-9,
      `the Hunt puts ${place.name} at ${JSON.stringify(at)}, off the town the chart drew`,
    );
  }
});

test("the voyage session projects onto the chart renderMap drew: its origin stands on the origin town, at two widths", async () => {
  const [{ createSessionBuilder }, { barlessLogPanel }, { realWorld, stackedMount }, { buildPlaceManifest }] =
    await Promise.all([
      import("../../src/site/living-chart/voyage-session.ts"),
      import("../../src/site/living-chart/no-bar.ts"),
      import("../../test-support/living-chart-hosts.ts"),
      import("../../src/render/place-manifest.ts"),
    ]);
  const { manifest, survey, world } = await realWorld();
  for (const chart of [manifest, buildPlaceManifest(world, 1200)]) {
    const sessions = createSessionBuilder({ mapEl: stackedMount().el, logPanel: barlessLogPanel() });
    const session = sessions.build(chart, survey, 42, "as surveyed");
    assert.ok(session, `seed 42 routes no voyage at ${chart.widthPx} px, so the comparison below reads nothing`);
    const origin = chart.places.find((p) => p.idx === session.plan.ports[0]!.idx);
    assert.ok(origin, "the voyage's first port is no place on the chart");
    const at = { x: origin.nx * chart.widthPx, y: origin.ny * chart.heightPx };
    assert.ok(
      Math.abs(session.originPt.x - at.x) < 1e-9 && Math.abs(session.originPt.y - at.y) < 1e-9,
      `at ${chart.widthPx} px the voyage starts at ${JSON.stringify(session.originPt)}, the chart drew its town at ${JSON.stringify(at)}`,
    );
  }
});

const workerSpawns = (file: string): number => {
  let spawns = 0;
  const visit = (node: ts.Node): void => {
    if (ts.isNewExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "Worker") spawns++;
    ts.forEachChild(node, visit);
  };
  visit(ts.createSourceFile(file, src(file), ts.ScriptTarget.Latest, true));
  return spawns;
};

test("a worker spawn stands under src/site, so vellum/worker-spawn-static has a spawn to hold (Issue #675)", () => {
  const spawns = walk("src/site").reduce((n, file) => n + workerSpawns(file), 0);
  assert.ok(spawns >= 1, "no worker spawn stands under src/site, so the lint rule on its form passes over nothing");
});

test("the string build keeps public/ out of its config, though it writes nothing a run could see", () => {
  assert.equal(stringConfig("/tmp/entry.ts").publicDir, false);
});
