import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { heroChartSvgs } from "../../scripts/hero-charts.ts";
import { diffSvg, DRIFT_TOL } from "../../scripts/svg-drift.ts";

// Drift guard (#40 part 2): nothing else re-renders the committed public/charts heroes, so a src/render change could leave the homepage stale; this re-renders via heroChartSvgs() (the charts:regen function) and compares via diffSvg, tolerant of cross-platform float noise.
// On a real drift: run npm run charts:regen and land the regen ALONE. See svg-drift.ts for the tolerance rationale.

const chartsDir = fileURLToPath(new URL("../../public/charts/", import.meta.url));

test("committed public/charts heroes match a fresh src/ render (structure exact, numbers ULP-tolerant)", async () => {
  let worstAbs = 0;
  for (const [name, svg] of heroChartSvgs()) {
    const committed = await readFile(chartsDir + name, "utf8");
    const d = diffSvg(committed, svg);
    if (d === null) continue; // byte-identical (same platform)
    if (d.kind === "structure") {
      assert.fail(
        `public/charts/${name} drifted from src/ — a structural change at offset ${d.at}. ` +
          `Run \`npm run charts:regen\` to regenerate.\n  committed: …${d.committed}…\n  fresh:     …${d.fresh}…`,
      );
    }
    worstAbs = Math.max(worstAbs, d.maxAbs);
    assert.equal(
      d.overTol,
      0,
      `public/charts/${name}: ${d.overTol}/${d.total} numbers drifted beyond ${DRIFT_TOL}px ` +
        `(max Δ ${d.maxAbs.toExponential(2)}) — run \`npm run charts:regen\` to regenerate. e.g. ${d.examples.join("; ")}`,
    );
  }
  // A green run logs the platform float noise, documenting it was ULP, not drift.
  if (worstAbs > 0) {
    console.log(`hero-charts drift guard: max cross-render numeric Δ = ${worstAbs.toExponential(2)}px (tol ${DRIFT_TOL})`);
  }
});

test("committed public/charts has no orphaned or missing SVGs", async () => {
  const produced = new Set(heroChartSvgs().keys());
  const committed = new Set((await readdir(chartsDir)).filter((f) => f.endsWith(".svg")));
  const orphans = [...committed].filter((f) => !produced.has(f));
  const missing = [...produced].filter((f) => !committed.has(f));
  assert.deepEqual(
    { orphans, missing },
    { orphans: [], missing: [] },
    "public/charts file set disagrees with heroChartSvgs() — run `npm run charts:regen` to regenerate",
  );
});
