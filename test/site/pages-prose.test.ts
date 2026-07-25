import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

/**
 * Prose facts the pages state about the engine (#289): the culture roster has
 * been ten since the tsuren/zoryan/tezcal additions (the seed-42 covenant test
 * pins it), but the site kept saying "six invented" in four places. Source-scan
 * guard so the count can never silently split again. The glossary is the one
 * deliberate exception path: it documents six of the tongues in detail, so its
 * intro states no count at all rather than a false one.
 */

const pagesDir = fileURLToPath(new URL("../../src/pages", import.meta.url));

const astroSources = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? astroSources(join(dir, e.name)) : e.name.endsWith(".astro") ? [join(dir, e.name)] : [],
  );

test("no page still counts six: the roster is ten (#289)", () => {
  const sources = astroSources(pagesDir);
  assert.ok(sources.length >= 4, "the src/pages tree should hold the authored pages");
  // Every phrasing the six-count ever wore, not just the one the issue quoted:
  // the review caught "the six cultures" surviving one Q&A below the fixed line.
  for (const path of sources) {
    const text = readFileSync(path, "utf8");
    for (const stale of ["six invented", "six cultures", "six languages", "six tongues"]) {
      assert.ok(!text.includes(stale), `${path} still says "${stale}"; the culture roster is ten`);
    }
  }
});

test("the FAQ states the ten-culture roster outright", () => {
  const faq = readFileSync(join(pagesDir, "faq/index.astro"), "utf8");
  assert.ok(faq.includes("ten invented cultures"), "the FAQ names the ten-culture roster");
});
