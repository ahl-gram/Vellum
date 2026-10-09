import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { CULTURES } from "../../src/society/names.ts";

// Prose facts the pages state about the engine (Issue #289, Issue #292): the culture count is read from the roster, never a number written down twice.

const pagesDir = fileURLToPath(new URL("../../src/pages", import.meta.url));

test("the FAQ states the ten-culture roster outright", () => {
  const faq = readFileSync(join(pagesDir, "faq/index.astro"), "utf8");
  assert.ok(faq.includes("ten invented cultures"), "the FAQ names the ten-culture roster");
});

// The roster comes from CULTURES, so an eleventh culture reds the moment it lands; case-insensitive, and draket passes on the combined "Thalassic &amp; Draket" heading it shares with thalassic.
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
