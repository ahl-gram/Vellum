import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { heroChartSvgs } from "../../scripts/hero-charts.ts";
import { diffSvg, DRIFT_TOL } from "../../scripts/svg-drift.ts";

/**
 * Drift guard (#40 part 2): the committed `public/charts/*.svg` heroes are content
 * the homepage embeds by relative path, but nothing re-rendered them from src/.
 * A `src/render` change that alters how seed 42 draws could leave the homepage
 * showing stale charts silently. This re-renders them via heroChartSvgs() (the
 * same function `npm run charts:regen` writes with) and compares via diffSvg,
 * which is tolerant of cross-platform float noise but catches real drift (see
 * svg-drift.ts for the why, and svg-drift.test.ts for the tolerance/structure
 * guarantees). On a real drift this fails loudly with the offending magnitudes;
 * then run `npm run charts:regen` (and land the regen alone).
 */

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
