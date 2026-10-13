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

test("AK7 the camera's keys slip and home's own camera presses stay retired (#505, ruled 2026-09-02; kept for Issue #779 part 2i: retired names; G1, G9 and G10 read the press's face)", () => {
  assert.doesNotMatch(read("public/atelier.css"), /zoom-keys/, "the keys slip retired everywhere");
  assert.doesNotMatch(
    read("src/layouts/Glass.astro") +
      read("public/index.css") +
      read("src/site/home/app.ts") +
      read("src/pages/index.astro"),
    /zoom-keys|\.lf-btn|\.lf-controls|lf-in|lf-out|lf-home/,
    "home's own presses and the slip are gone",
  );
});

// A second seat rule that repeats the first changes nothing a page shows, so the count stays a source read for part 2i of Issue #779.
test("AK8 home's camera has one seat rule, at every width (#505, ruled 2026-09-02: home keeps its own seat)", () => {
  const seats = [...read("public/index.css").matchAll(/#lf-controls\s*\{([^}]*)\}/g)];
  assert.equal(
    seats.length,
    1,
    "one seat rule, at every width (the phone twin was dead: the id already outranks the kit's 900px seat)",
  );
});
