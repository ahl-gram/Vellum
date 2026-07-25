import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * Green from the start by design (a guard, not red-green): pins the #289
 * review call that the FAQ and Glossary lie on the desk as bounded survey
 * sheets (adapted from Alex's ideas sheet): a hairline frame with a double
 * rule floating outside it, corner ticks at top-left and bottom-right, a
 * raised shadow, and panel paper a shade lighter than the page ground.
 */

const root = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url));

for (const page of ["public/faq/index.css", "public/glossary/index.css"] as const) {
  test(`the survey sheet frames ${page} (#289)`, () => {
    const css = readFileSync(root(page), "utf8");
    const main = css.match(/main\s*\{([^}]*)\}/);
    assert.ok(main, `${page} should style main as the sheet`);
    for (const [what, re] of [
      ["the hairline frame", /border:\s*1px solid var\(--line-tan\)/],
      ["the double rule outline", /outline:\s*3px double var\(--line-tan\)/],
      ["the raised shadow", /box-shadow:/],
      ["the panel paper", /background:\s*var\(--parchment-panel\)/],
    ] as const) {
      assert.ok(re.test(main[1]), `${page} sheet keeps ${what}`);
    }
    assert.ok(
      /main::before/.test(css) && /main::after/.test(css),
      `${page} keeps its corner ticks`,
    );
  });
}
