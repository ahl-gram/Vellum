import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * Pins the #289 review call that the FAQ and Glossary CONTENT lies on the
 * desk as a bounded survey sheet (adapted from Alex's ideas sheet): a
 * hairline frame with a double rule floating outside it, corner ticks at
 * top-left and bottom-right, a raised shadow, and panel paper a shade
 * lighter than the page ground. The running head, nav, and footer stay OFF
 * the sheet, on the desk (Alex's correction): the frame lives on a .sheet
 * wrapper inside the page content, never on main.
 */

const root = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url));

const PAGES = [
  { css: "public/faq/index.css", astro: "src/pages/faq/index.astro" },
  { css: "public/glossary/index.css", astro: "src/pages/glossary/index.astro" },
] as const;

for (const page of PAGES) {
  test(`the survey sheet frames ${page.css}, shell members off the sheet (#289)`, () => {
    const css = readFileSync(root(page.css), "utf8");
    const sheet = css.match(/\.sheet\s*\{([^}]*)\}/);
    assert.ok(sheet, `${page.css} should style .sheet as the survey sheet`);
    for (const [what, re] of [
      ["the hairline frame", /border:\s*1px solid var\(--line-tan\)/],
      ["the double rule outline", /outline:\s*3px double var\(--line-tan\)/],
      ["the raised shadow", /box-shadow:/],
      ["the panel paper", /background:\s*var\(--parchment-panel\)/],
    ] as const) {
      assert.ok(re.test(sheet[1]), `${page.css} sheet keeps ${what}`);
    }
    assert.ok(
      /\.sheet::before/.test(css) && /\.sheet::after/.test(css),
      `${page.css} keeps its corner ticks`,
    );
    assert.ok(
      !/main\s*\{[^}]*outline/.test(css),
      `${page.css} must not frame main (that would put the running head on the sheet)`,
    );

    const astro = readFileSync(root(page.astro), "utf8");
    assert.ok(
      astro.includes('<div class="sheet">'),
      `${page.astro} wraps its content in the .sheet (header and footer stay on the desk)`,
    );
  });
}
