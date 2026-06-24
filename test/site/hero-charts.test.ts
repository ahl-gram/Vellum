import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { heroChartSvgs } from "../../scripts/hero-charts.ts";

/**
 * Drift guard (#40 part 2): the committed `docs/charts/*.svg` heroes are content
 * the homepage embeds by relative path, but nothing re-rendered them from src/.
 * A `src/render` change that alters how seed 42 draws could leave the homepage
 * showing stale charts silently. This re-renders them via heroChartSvgs() (the
 * same function `npm run site` writes with) and byte-compares.
 *
 * Node-vs-Node, so a STRICT byte compare is correct: the only same-seed SVG
 * discrepancy is a ~1-ULP browser-vs-Node trig diff, which never applies here
 * (both the committed files and this render come from Node). On failure, run
 * `npm run site` to regenerate the showcase.
 */

const chartsDir = fileURLToPath(new URL("../../docs/charts/", import.meta.url));

test("committed docs/charts heroes match a fresh src/ render", async () => {
  const fresh = heroChartSvgs();
  for (const [name, svg] of fresh) {
    const committed = await readFile(chartsDir + name, "utf8");
    assert.equal(
      committed,
      svg,
      `docs/charts/${name} has drifted from src/ — run \`npm run site\` to regenerate`,
    );
  }
});

test("committed docs/charts has no orphaned or missing SVGs", async () => {
  const produced = new Set(heroChartSvgs().keys());
  const committed = new Set((await readdir(chartsDir)).filter((f) => f.endsWith(".svg")));
  const orphans = [...committed].filter((f) => !produced.has(f));
  const missing = [...produced].filter((f) => !committed.has(f));
  assert.deepEqual(
    { orphans, missing },
    { orphans: [], missing: [] },
    "docs/charts file set disagrees with heroChartSvgs() — run `npm run site` to regenerate",
  );
});
