import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// The Atelier Kit (Issue #487): the markup shapes the rooms pasted are components in src/layouts/; the built html is pinned in astro-scaffold.test.ts.
const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");

test("AK6 the kit's glass-keys.ts reads every [data-zoom] press on the page, the premise vellum/explorer-no-glass-keys rests on (kept for Issue #779 part 2i as that rule's witness; SB13 and SB15 press what it binds)", () => {
  assert.match(
    read("src/site/shared/glass-keys.ts"),
    /querySelectorAll<HTMLElement>\("\[data-zoom\]"\)/,
    "the kit's binding reads every data-zoom press on the page",
  );
});
