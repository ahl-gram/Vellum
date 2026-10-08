import { test } from "node:test";
import assert from "node:assert/strict";
import { access, mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CHART_OPTIONS, chartOptions, main, parseChartArgs } from "../../src/cli/main.ts";
import { recipeFromSvg } from "../../src/render/recipe-meta.ts";

// Bytes are compared only between two draws in the same run, never against a file from another run: an SVG byte-compare drifts across OS/Node; the --png path is raster.test.ts's.

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

const SMALL = ["--seed", "11", "--grid", "80x60"] as const;
const LAND_RANGE = "--land must be between 0.1 and 0.7";
const COAST_RANGE = "--coast-warp must be between 0 and 1";
const SCALE_RANGE = "--scale must be between 0.5 and 4";
const WIDTH_RANGE = "--width must be between 400 and 6000";

const REFUSALS: ReadonlyArray<readonly [flag: string, args: readonly string[], message: string]> = [
  ["land", ["--land", "abc"], LAND_RANGE],
  ["land", ["--land", "NaN"], LAND_RANGE],
  ["land", ["--land", "0.3abc"], LAND_RANGE],
  ["land", ["--land", " "], LAND_RANGE],
  ["land", ["--land", "Infinity"], LAND_RANGE],
  ["land", ["--land", "0.05"], LAND_RANGE],
  ["land", ["--land", "0.8"], LAND_RANGE],
  ["seed", ["--seed", "abc"], '--seed must be a number, got "abc"'],
  ["seed", ["--seed", ""], '--seed must be a number, got ""'],
  ["seed", ["--seed", " "], '--seed must be a number, got " "'],
  ["coast-warp", ["--coast-warp", "abc"], COAST_RANGE],
  ["coast-warp", ["--coast-warp", " "], COAST_RANGE],
  ["coast-warp", ["--coast-warp", "1.5"], COAST_RANGE],
  ["coast-warp", ["--coast-warp=-0.1"], COAST_RANGE],
  ["scale", ["--scale", "abc"], SCALE_RANGE],
  ["scale", ["--scale", " "], SCALE_RANGE],
  ["scale", ["--scale", "0.1"], SCALE_RANGE],
  ["scale", ["--scale", "5"], SCALE_RANGE],
  ["width", ["--width", "abc"], WIDTH_RANGE],
  ["width", ["--width", "100"], WIDTH_RANGE],
  ["width", ["--width", "7000"], WIDTH_RANGE],
  ["grid", ["--grid", "abc"], '--grid expects WxH (e.g. 320x240), got "abc"'],
  ["grid", ["--grid", "10x10"], "--grid must be between 40x30 and 1200x900"],
  ["style", ["--style", "bogus"], 'unknown style "bogus" (use antique | topographic | ink | nautical)'],
  ["type", ["--type", "bogus"], 'unknown map type "bogus"'],
  ["band", ["--band", "bogus"], 'unknown climate band "bogus"'],
  ["theme", ["--theme", "bogus"], 'unknown theme "bogus" (use vegetation | climate | moisture | population)'],
];

const STRING_FLAGS = Object.entries(CHART_OPTIONS)
  .filter(([, option]) => option.type === "string")
  .map(([flag]) => flag);
const BOOLEAN_FLAGS = Object.entries(CHART_OPTIONS)
  .filter(([, option]) => option.type === "boolean")
  .map(([flag]) => flag);

async function draw(args: readonly string[], name: string): Promise<string> {
  await mkdir(TMP, { recursive: true });
  const out = `${TMP}/${name}.svg`;
  await main(["chart", ...args, "--out", out]);
  return readFile(out, "utf8");
}

for (const [i, [flag, args, message]] of REFUSALS.entries()) {
  test(`chart refuses ${args.map((a) => JSON.stringify(a)).join(" ")} with "${message}", drawing nothing`, async (t) => {
    t.after(() => rm(TMP, { recursive: true, force: true }));
    await assert.rejects(() => draw([...SMALL, ...args], `refused-${flag}-${i}`), { message });
    await assert.rejects(
      () => access(`${TMP}/refused-${flag}-${i}.svg`),
      { code: "ENOENT" },
      "a refused flag writes no chart",
    );
  });
}

for (const flag of BOOLEAN_FLAGS) {
  test(`chart refuses a value given to the switch --${flag}`, async (t) => {
    t.after(() => rm(TMP, { recursive: true, force: true }));
    await assert.rejects(() => draw([...SMALL, `--${flag}`, ""], `switch-${flag}-empty`), {
      message: "Unexpected argument ''. This command does not take positional arguments",
    });
    await assert.rejects(() => draw([...SMALL, `--${flag}=yes`], `switch-${flag}-yes`), {
      message: `Option '--${flag}' does not take an argument`,
    });
  });
}

test("chart refuses a flag it does not know", async (t) => {
  t.after(() => rm(TMP, { recursive: true, force: true }));
  await assert.rejects(() => draw([...SMALL, "--lnad", "0.3"], "unknown-flag"), { message: "Unknown option '--lnad'" });
});

test("an empty --scale means the default scale, 2", () => {
  assert.equal(chartOptions(parseChartArgs(["--scale", ""])).scale, 2);
  assert.equal(
    chartOptions(parseChartArgs(["--scale", "3"])).scale,
    3,
    "a given scale is read, so the default is not a hardcode",
  );
});

test("every string flag that can refuse a value has a refusal row", () => {
  assert.ok(STRING_FLAGS.length > 0, "the roster sweep read no flags");
  assert.ok(BOOLEAN_FLAGS.length > 0, "the roster sweep read no switches");
  for (const flag of STRING_FLAGS.filter((f) => f !== "out")) {
    const named = (arg: string | undefined): boolean => arg === `--${flag}` || (arg?.startsWith(`--${flag}=`) ?? false);
    assert.ok(
      REFUSALS.some(([f, args]) => f === flag && named(args[0])),
      `--${flag} has no refusal row`,
    );
  }
});

for (const flag of STRING_FLAGS.filter((f) => f !== "seed" && f !== "grid" && f !== "out")) {
  test(`an empty --${flag} draws exactly the chart drawn without it`, async (t) => {
    t.after(() => rm(TMP, { recursive: true, force: true }));
    const absent = await draw(SMALL, `absent-${flag}`);
    const empty = await draw([...SMALL, `--${flag}`, ""], `empty-${flag}`);
    assert.ok(empty === absent, `--${flag} "" must mean the flag's default`);
  });
}

test("an empty --grid draws exactly the chart drawn at the default grid", async (t) => {
  t.after(() => rm(TMP, { recursive: true, force: true }));
  const absent = await draw(["--seed", "11"], "absent-grid");
  const empty = await draw(["--seed", "11", "--grid", ""], "empty-grid");
  assert.ok(empty === absent, `--grid "" must mean the default grid`);
});

test("an empty --out writes the chart to the default path", async (t) => {
  const home = process.cwd();
  const dir = await mkdtemp(join(tmpdir(), "vellum-chart-out-"));
  t.after(async () => {
    process.chdir(home);
    await rm(dir, { recursive: true, force: true });
    await rm(TMP, { recursive: true, force: true });
  });
  const absent = await draw(SMALL, "absent-out");
  process.chdir(dir);
  await main(["chart", ...SMALL, "--out", ""]);
  const empty = await readFile(join(dir, "out", "chart-11-antique.svg"), "utf8");
  assert.ok(empty === absent, `--out "" must write the default path's chart`);
});

const ACCEPTED: ReadonlyArray<readonly [flag: string, value: string, drawn: (svg: string) => number | undefined]> = [
  ["land", "0.1", (svg) => recipeFromSvg(svg)?.recipe.landFraction],
  ["land", "0.3", (svg) => recipeFromSvg(svg)?.recipe.landFraction],
  ["land", "0.7", (svg) => recipeFromSvg(svg)?.recipe.landFraction],
  ["coast-warp", "0", (svg) => recipeFromSvg(svg)?.recipe.coastWarp],
  ["coast-warp", "1", (svg) => recipeFromSvg(svg)?.recipe.coastWarp],
  ["width", "400", (svg) => Number(/<svg\b[^>]*\bwidth="(\d+)"/.exec(svg)?.[1])],
  ["width", "6000", (svg) => Number(/<svg\b[^>]*\bwidth="(\d+)"/.exec(svg)?.[1])],
];

for (const [flag, value, drawn] of ACCEPTED) {
  test(`a valid --${flag} ${value} at or inside its edge draws, with that value`, async (t) => {
    t.after(() => rm(TMP, { recursive: true, force: true }));
    const svg = await draw([...SMALL, `--${flag}`, value], `accepted-${flag}-${value}`);
    assert.equal(drawn(svg), Number(value), `--${flag} ${value}`);
  });
}

for (const scale of ["0.5", "4"]) {
  test(`a valid --scale ${scale} at its edge is accepted without --png`, async (t) => {
    t.after(() => rm(TMP, { recursive: true, force: true }));
    await draw([...SMALL, "--scale", scale], `accepted-scale-${scale}`);
  });
}
