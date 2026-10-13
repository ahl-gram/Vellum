import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// The Atelier Kit (Issue #487): the markup shapes the rooms pasted are components in src/layouts/; the built html is pinned in astro-scaffold.test.ts.
const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");

test("AK6 the kit's glass-keys.ts binds every [data-zoom] press on the page, document-wide, the premise vellum/explorer-no-glass-keys rests on (kept at the close of Issue #779 as that rule's witness, and the only check that the binding reaches the fit press: SB15 holds the out press, SB13 presses the fit press without holding it, and nothing reads what the fit press does)", () => {
  assert.match(
    read("src/site/shared/glass-keys.ts"),
    /\bdocument\.querySelectorAll<HTMLElement>\("\[data-zoom\]"\)/,
    "the kit's binding reads every data-zoom press on the page",
  );
});
