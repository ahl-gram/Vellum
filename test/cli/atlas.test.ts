import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { buildAtlas } from "../../src/cli/atlas.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";

test("the atlas includes the nautical plate under Other Draughtings", async () => {
  const seed = 42;
  const dir = "out/test-atlas-nautical";
  await rm(dir, { recursive: true, force: true });
  try {
    await buildAtlas(seed, { out: dir });
    const html = await readFile(join(dir, "index.html"), "utf8");
    // the file is written and the index links + captions it
    const svg = await readFile(join(dir, "world-nautical.svg"), "utf8");
    assert.match(svg, /^<svg/);
    assert.match(html, /world-nautical\.svg/);
    assert.match(html, /Sea chart: soundings &amp; winds/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("the atlas includes the thematic survey plates", async () => {
  const seed = 42;
  const dir = "out/test-atlas-themes";
  await rm(dir, { recursive: true, force: true });
  try {
    await buildAtlas(seed, { out: dir });
    const html = await readFile(join(dir, "index.html"), "utf8");
    assert.match(html, /Thematic Surveys/);
    for (const theme of ["vegetation", "climate", "moisture", "population"]) {
      const svg = await readFile(join(dir, `theme-${theme}.svg`), "utf8");
      assert.match(svg, /^<svg/, `${theme} plate written`);
      assert.match(html, new RegExp(`theme-${theme}\\.svg`), `${theme} linked`);
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("the atlas carries a banner plate with one coat of arms per realm", async () => {
  const seed = 42;
  const dir = "out/test-atlas";
  await rm(dir, { recursive: true, force: true });
  try {
    await buildAtlas(seed, { out: dir });
    const html = await readFile(join(dir, "index.html"), "utf8");
    const world = generateWorld(defaultRecipe(seed));

    assert.match(html, /Banners of the Realms/);
    const banners = (html.match(/class="banner"/g) ?? []).length;
    assert.equal(banners, world.arms.length, "one banner per realm seat");
    assert.ok(world.arms.length >= 1, "fixture should have at least one realm");
    for (const name of world.names.realms) {
      assert.ok(html.includes(name), `expected a banner caption for ${name}`);
    }
    assert.ok(!html.includes("NaN"), "no NaN in the atlas");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
