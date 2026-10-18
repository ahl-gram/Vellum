import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { heroChartSvgs } from "../../scripts/hero-charts.ts";
import { diffSvg, DRIFT_TOL } from "../../scripts/svg-drift.ts";

// Drift guard (Issue #40): nothing else re-renders the committed src/static/charts heroes, so this re-renders via heroChartSvgs() and compares via diffSvg, tolerant of cross-platform float noise; on a real drift run npm run charts:regen and land the regen ALONE.

const chartsDir = fileURLToPath(new URL("../../src/static/charts/", import.meta.url));

test("committed src/static/charts heroes match a fresh src/ render (structure exact, numbers ULP-tolerant)", async () => {
  let worstAbs = 0;
  for (const [name, svg] of heroChartSvgs()) {
    const committed = await readFile(chartsDir + name, "utf8");
    const d = diffSvg(committed, svg);
    if (d === null) continue; // byte-identical (same platform)
    if (d.kind === "structure") {
      assert.fail(
        `src/static/charts/${name} drifted from src/ — a structural change at offset ${d.at}. ` +
          `Run \`npm run charts:regen\` to regenerate.\n  committed: …${d.committed}…\n  fresh:     …${d.fresh}…`,
      );
    }
    worstAbs = Math.max(worstAbs, d.maxAbs);
    assert.equal(
      d.overTol,
      0,
      `src/static/charts/${name}: ${d.overTol}/${d.total} numbers drifted beyond ${DRIFT_TOL}px ` +
        `(max Δ ${d.maxAbs.toExponential(2)}) — run \`npm run charts:regen\` to regenerate. e.g. ${d.examples.join("; ")}`,
    );
  }
  if (worstAbs > 0) {
    console.log(
      `hero-charts drift guard: max cross-render numeric Δ = ${worstAbs.toExponential(2)}px (tol ${DRIFT_TOL})`,
    );
  }
});

test("committed src/static/charts has no orphaned or missing SVGs", async () => {
  const produced = new Set(heroChartSvgs().keys());
  const committed = new Set((await readdir(chartsDir)).filter((f) => f.endsWith(".svg")));
  const orphans = [...committed].filter((f) => !produced.has(f));
  const missing = [...produced].filter((f) => !committed.has(f));
  assert.deepEqual(
    { orphans, missing },
    { orphans: [], missing: [] },
    "src/static/charts file set disagrees with heroChartSvgs() — run `npm run charts:regen` to regenerate",
  );
});
