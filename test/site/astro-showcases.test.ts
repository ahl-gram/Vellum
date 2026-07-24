import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { GENERATED_SUBTREES } from "../../scripts/clean-public-generated.ts";
import { generateShowcases } from "../../scripts/generate-showcases.ts";
import { HERO_CHART_DIRS, regenHeroCharts } from "../../scripts/regen-hero-charts.ts";

/**
 * Scriptorium Sub 4 (#205): build-time generation replaces the homegrown site
 * build. The spec is the ratified Sub 1 decision doc (the 2026-07-21 comment on
 * #202), section 2 (atlas/gallery keep generating) and decision D (generate
 * into public/ BEFORE astro build, clean-before-regen grows to cover the
 * showcases, and a thin charts:regen successor exists before build-site.ts
 * dies). The hero-charts decision was ratified 2026-07-24: option (a), the
 * goldens stay committed; test/site/hero-charts.test.ts passes unmodified.
 */

const root = (p = "") => fileURLToPath(new URL(`../../${p}`, import.meta.url));

test("the cleaned set grew to cover the showcases (atlas and gallery regenerate fresh)", () => {
  for (const sub of ["atlas", "gallery"]) {
    assert.ok(GENERATED_SUBTREES.includes(sub), `GENERATED_SUBTREES must include ${sub}`);
  }
});

test("the generated showcases are gitignored in public/", () => {
  const lines = readFileSync(root(".gitignore"), "utf8").split("\n");
  for (const line of ["public/atlas/", "public/gallery/"]) {
    assert.ok(lines.includes(line), `.gitignore should carry the exact line ${line}`);
  }
});

test("build-site.ts is retired; charts:regen and the showcase step replace it", () => {
  assert.ok(!existsSync(root("scripts/build-site.ts")), "build-site.ts should be deleted (decision D)");
  const pkg = JSON.parse(readFileSync(root("package.json"), "utf8"));
  assert.equal(pkg.scripts["site"], undefined, "npm run site is retired");
  assert.equal(
    pkg.scripts["astro:generate"],
    "node scripts/clean-public-generated.ts && node scripts/build-app-bundles.ts && node scripts/generate-showcases.ts",
    "astro:generate must end by generating the showcases into public/ (tsc emit retired at Sub 9, #260)",
  );
  assert.equal(pkg.scripts["charts:regen"], "node scripts/regen-hero-charts.ts", "the thin golden-writer successor");
  assert.equal(pkg.scripts["dev"], "npm run astro:dev", "local preview repoints to the Astro dev server");
  assert.equal(
    pkg.scripts["build"],
    "npm run astro:generate && astro build",
    "the deploy build is the Astro build since the Sub 5 cutover (#206)",
  );
});

test("generateShowcases writes the atlas and gallery a deploy expects", { timeout: 180_000 }, async () => {
  const tmp = root("out/test-showcases");
  rmSync(tmp, { recursive: true, force: true });
  await generateShowcases(tmp);

  // The atlas stays a self-shelled generated document (out of #268's scope).
  const atlasIndex = join(tmp, "atlas", "index.html");
  assert.ok(existsSync(atlasIndex), "atlas/index.html should exist");
  const atlasHtml = readFileSync(atlasIndex, "utf8");
  assert.ok(atlasHtml.includes('href="/fonts.css"'), "atlas links the root-absolute fonts.css it hard-depends on");
  assert.ok(atlasHtml.includes('href="/motion.css"'), "atlas links the root-absolute motion.css it hard-depends on");
  const atlasSvgs = readdirSync(join(tmp, "atlas")).filter((f) => f.endsWith(".svg"));
  assert.equal(atlasSvgs.length, 10, "atlas should hold 10 SVGs");
  // Identity pin (green from the start by design, like Sub 2's boundary
  // guards): counts alone would pass a wrong-seed showcase. The atlas title
  // carries the seed-42 hero world's deterministic name, so a wrong seed or a
  // silent re-roll changes it.
  assert.ok(
    atlasHtml.includes("The Isle of Rahai: a Vellum atlas"),
    "the atlas must be the seed-42 hero world's bound volume",
  );

  // The gallery is a shelled Astro route since #268, so its generated tree is
  // assets alone: the chart SVGs and the page css, never an index.html that
  // would collide with the route in dist/.
  const galleryFiles = readdirSync(join(tmp, "gallery"));
  assert.equal(galleryFiles.filter((f) => f.endsWith(".svg")).length, 12, "gallery should hold 12 SVGs");
  assert.ok(galleryFiles.includes("index.css"), "gallery should hold the generated page css");
  assert.ok(!galleryFiles.includes("index.html"), "the standalone gallery shell retired with the #268 re-shell");
  // Identity pins: the ratified seed-100, count-12 contact sheet on its prime
  // stride (7919), pinned by the first and last card filenames.
  assert.ok(galleryFiles.includes("chart-100.svg"), "the first card must be seed 100");
  assert.ok(galleryFiles.includes(`chart-${100 + 11 * 7919}.svg`), "the last card must sit 11 prime strides along");
  rmSync(tmp, { recursive: true, force: true });
});

test("the no-arg CLI generates into ./public relative to CWD (the exact astro:generate invocation)", { timeout: 180_000 }, () => {
  const scratch = root("out/test-showcases-cli");
  rmSync(scratch, { recursive: true, force: true });
  mkdirSync(scratch, { recursive: true });
  execFileSync(process.execPath, [root("scripts/generate-showcases.ts")], { cwd: scratch });
  assert.ok(existsSync(join(scratch, "public", "atlas", "index.html")), "the CLI should write <cwd>/public/atlas");
  assert.ok(existsSync(join(scratch, "public", "gallery", "index.css")), "the CLI should write <cwd>/public/gallery");
  rmSync(scratch, { recursive: true, force: true });
});

test("charts:regen writes the single committed charts dir (docs/ retired at Sub 5)", () => {
  assert.deepEqual([...HERO_CHART_DIRS], ["public/charts"]);
});

test("regenHeroCharts writes the committed golden set, identically, into every charts dir", { timeout: 120_000 }, async () => {
  const tmpA = root("out/test-charts-a");
  const tmpB = root("out/test-charts-b");
  for (const t of [tmpA, tmpB]) rmSync(t, { recursive: true, force: true });
  await regenHeroCharts([tmpA, tmpB]);

  const committed = readdirSync(root("public/charts")).filter((f) => f.endsWith(".svg")).sort();
  for (const dir of [tmpA, tmpB]) {
    const written = readdirSync(dir).filter((f) => f.endsWith(".svg")).sort();
    assert.deepEqual(written, committed, "the successor must write exactly the committed golden filenames");
  }
  for (const name of committed) {
    const a = readFileSync(join(tmpA, name), "utf8");
    assert.ok(a.startsWith("<svg") || a.startsWith("<?xml"), `${name} should be an SVG document`);
    assert.equal(a, readFileSync(join(tmpB, name), "utf8"), `${name} must be identical across charts dirs`);
  }
  for (const t of [tmpA, tmpB]) rmSync(t, { recursive: true, force: true });
});
