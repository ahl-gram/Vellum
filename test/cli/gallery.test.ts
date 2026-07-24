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

test("the gallery stays in the motion folio: its tiles tip under the hand on the desk's timing (#130)", async () => {
  const dir = "out/test-gallery-motion";
  await rm(dir, { recursive: true, force: true });
  try {
    await buildGallery(100, { count: 1, out: dir });
    // Since #268 the composer writes the page css (the shelled /gallery/ route
    // links /motion.css through BaseLayout, so the link left with the shell).
    const css = await readFile(join(dir, "index.css"), "utf8").catch(() => "");
    // the contact-sheet tiles tip like loose plates: a hover transform that rotates
    assert.match(
      css,
      /figure img:hover\s*\{[^}]*transform:[^}]*rotate/,
      "gallery tiles should tip (a rotate) under the hand",
    );
    assert.match(
      css,
      /var\(--paper\)/,
      "the tip rides the motion desk's shared timing token",
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
