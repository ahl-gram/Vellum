import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { CULTURES } from "../../src/society/names.ts";

/**
 * Prose facts the pages state about the engine (#289): the culture roster has
 * been ten since the tsuren/zoryan/tezcal additions (the seed-42 covenant test
 * pins it), but the site kept saying "six invented" in four places. Source-scan
 * guard so the count can never silently split again.
 *
 * #292 closes the last gap: the glossary's "Words on your own map" section
 * documented six of the ten tongues, so its intro was deliberately made
 * countless rather than false. With all ten documented the count is stated
 * again, and the coverage guard below is what keeps the two honest, by reading
 * the roster from the engine rather than from a number written down twice.
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

// The roster comes from CULTURES, not from a hand-kept list: an eleventh
// culture reds this the moment it lands, which is exactly how the site fell
// four tongues behind in the first place. Case-insensitive because the ids are
// lowercase and the headings are capitalized; draket passes on the combined
// "Thalassic &amp; Draket" heading it already shares with thalassic.
test("the glossary documents every culture in the roster (#292)", () => {
  const glossary = readFileSync(join(pagesDir, "glossary/index.astro"), "utf8").toLowerCase();
  const names = glossary.slice(glossary.indexOf('id="names"'));
  assert.ok(names.length > 0, "the glossary should carry its Words on your own map section");
  for (const culture of CULTURES) {
    assert.ok(
      names.includes(culture.id),
      `the glossary does not document the ${culture.id} tongue; every culture in CULTURES needs a vocabulary section`,
    );
  }
});

test("the glossary states the count again, now that it documents all ten (#292)", () => {
  const glossary = readFileSync(join(pagesDir, "glossary/index.astro"), "utf8");
  assert.ok(
    glossary.includes("ten invented cultures"),
    "the glossary intro states the ten-culture count outright (it was countless while it covered only six)",
  );
});
