import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { buildGallery } from "../../src/cli/gallery.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";

test("a gallery card is the same world as the canonical chart for that seed", async () => {
  const seed = 42;
  const dir = "out/test-gallery";
  await rm(dir, { recursive: true, force: true });
  try {
    await buildGallery(seed, { count: 1, out: dir });
    // the first card is rendered at the start seed, antique, 900px wide
    const card = await readFile(join(dir, `chart-${seed}.svg`), "utf8");
    const canonical = renderMap(generateWorld(defaultRecipe(seed)), {
      style: "antique",
      widthPx: 900,
    });
    assert.equal(
      card,
      canonical,
      "gallery card should match `chart --seed N` (same default grid)",
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
