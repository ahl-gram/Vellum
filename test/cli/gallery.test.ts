import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { GALLERY_PAGE_CSS, buildGallery, cardFigureHtml, galleryCards } from "../../src/cli/gallery.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";

test("a gallery card is the same world as the canonical chart for that seed", async () => {
  const seed = 42;
  const dir = "out/test-gallery";
  await rm(dir, { recursive: true, force: true });
  try {
    await buildGallery(seed, { count: 1, out: dir });
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

test("a card's figure reserves its frame: img dims mirror the rendered svg root (#329)", () => {
  const [card] = galleryCards(42, 1);
  const svg = renderMap(generateWorld(defaultRecipe(42)), { style: "antique", widthPx: 900 });
  const dims = svg.match(/width="(\d+)" height="(\d+)"/);
  assert.ok(card, "fixture card exists");
  assert.ok(dims, "rendered svg root carries width/height");
  const html = cardFigureHtml(card);
  assert.ok(
    html.includes(`width="${dims[1]}" height="${dims[2]}"`),
    `img reserves the svg root's frame (${dims[1]}x${dims[2]}); got: ${html}`,
  );
  assert.match(html, /decoding="async"/, "plates decode off the click path");
  assert.match(html, /loading="lazy"/, "below-fold plates stay lazy");
});

test("the waiting frame says Drafting… until the plate covers it (#329)", () => {
  assert.match(GALLERY_PAGE_CSS, /\.grid a\s*\{[^}]*position:\s*relative/, "the frame anchors its label");
  assert.match(GALLERY_PAGE_CSS, /\.grid a::before\s*\{[^}]*content:\s*"Drafting…"/, "the label speaks the drafting voice");
  assert.match(GALLERY_PAGE_CSS, /\.grid a::before\s*\{[^}]*z-index:\s*-1/, "the loaded plate paints over its label");
});

test("the gallery stays in the motion folio: its tiles tip under the hand on the desk's timing (#130)", async () => {
  const dir = "out/test-gallery-motion";
  await rm(dir, { recursive: true, force: true });
  try {
    await buildGallery(100, { count: 1, out: dir });
    // Since #268 the composer writes the page css; the shelled /gallery/ route links /motion.css through BaseLayout, so that link left with the shell.
    const css = await readFile(join(dir, "index.css"), "utf8").catch(() => "");
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
