import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdir, readFile, rm } from "node:fs/promises";
import { main } from "../../src/cli/main.ts";
import { recipeFromSvg } from "../../src/render/recipe-meta.ts";

// The `chart` verb is the reproducibility covenant's one-command proof, and after
// the CLI diet (#138) it is the ONLY verb main.ts carries. Nothing exercised main()'s
// boundary before this: arg parsing -> generateWorld -> renderMap -> file. These pin
// that boundary at the STRUCTURE level (the SVG's stamped recipe), never at bytes: an
// SVG byte-compare drifts across OS/Node (Math.sin/cos are not correctly rounded) and
// would red on CI. The --png path stays covered by raster.test.ts.

const TMP = "out/test-tmp-chart";

test("chart writes an SVG whose stamped recipe round-trips the seed and covenant width", async (t) => {
  await mkdir(TMP, { recursive: true });
  t.after(() => rm(TMP, { recursive: true, force: true }));
  const out = `${TMP}/chart-42.svg`;
  await main(["chart", "--seed", "42", "--out", out]);

  const svg = await readFile(out, "utf8");
  const parsed = recipeFromSvg(svg);
  assert.ok(parsed, "the chart SVG carries a round-trippable recipe");
  assert.equal(parsed.recipe.seed, 42);
  assert.equal(parsed.style, "antique", "default style is antique");
  assert.match(svg, /<svg\b[^>]*\bwidth="1500"/, "default width is the covenant 1500");
});

test("chart honors --style and --seed (acceptance: chart --seed 7 --style ink)", async (t) => {
  await mkdir(TMP, { recursive: true });
  t.after(() => rm(TMP, { recursive: true, force: true }));
  const out = `${TMP}/chart-7-ink.svg`;
  await main(["chart", "--seed", "7", "--style", "ink", "--out", out]);

  const svg = await readFile(out, "utf8");
  const parsed = recipeFromSvg(svg);
  assert.ok(parsed);
  assert.equal(parsed.recipe.seed, 7);
  assert.equal(parsed.style, "ink");
});

test("an unknown verb is rejected once chart is the only command", async () => {
  await assert.rejects(
    () => main(["poster", "--seed", "42"]),
    /unknown command "poster"/,
    "poster and the other retired verbs must error, not silently draw",
  );
});
