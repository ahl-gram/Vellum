import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// The Glossary's Issue #353 shape and both document rooms' columns and fold are read on the served pages (e2e IX10, IX12); what stays here is two retired dresses, rules for classes no page wears, which no browser can see (Issue #779 part 2f, for part 2i).

test("no TOC dress survives in the document rooms' sheets (#462 rulings 1 and 3, superseding #461 ruling 4's dot-row and ~26rem)", () => {
  for (const page of ["faq", "glossary"]) {
    const css = readFileSync(fileURLToPath(new URL(`../../public/${page}/index.css`, import.meta.url)), "utf8");
    assert.ok(!/\.toc\b/.test(css), `${page}: the dot-row TOC's dress retired with it`);
    assert.ok(!/columns:\s*2/.test(css), `${page}: the #353 two-column TOC box stays retired`);
  }
});
