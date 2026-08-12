import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * The tip is a promise (#289, motion.css): in Vellum, what goes somewhere tips.
 * A hover tip on an element that navigates nowhere is a false affordance, the
 * exact miss the post-use feel review of #324 caught on the glossary terms.
 * This sweep finds every :hover rule that rotates and requires its selector to
 * be on the measured allowlist of surfaces that really go somewhere. Adding a
 * new tip means either making it navigate or consciously extending the list.
 *
 * The file also guards what the tip COSTS. It needs a block box, so a tipping
 * link is an inline-block, and that changes where a wrapped entry's list marker
 * sits (#356). Same gesture, second contract.
 */

const root = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const read = (p: string) => readFileSync(root(p), "utf8");

/** Every committed hand-authored stylesheet (generated css has its own source). */
const AUTHORED_CSS = [
  "public/explorer/broadside.css",
  "public/explorer/index.css",
  "public/faq/index.css",
  "public/fonts.css",
  "public/glossary/index.css",
  "public/house.css",
  "public/index.css",
  "public/living-chart.css",
  "public/motion.css",
  "public/print-room/index.css",
  "public/reading-frame.css",
  "public/reading-room/index.css",
  "public/seed-of-the-day/index.css",
] as const;

/** The surfaces that tip AND navigate (each is a link or wraps one). */
const TIPPING_LINKS = new Set([
  "motion.css :: .plate:hover",
  "motion.css :: body:has(.room-name) .wordmark a:hover",
  "faq/index.css :: .toc a:hover",
  "glossary/index.css :: .toc a:hover",
  // #270 ruling 7: the footnote marks follow through to /glossary/ anchors, so
  // they tip; this entry IS the conscious extension the ruling recorded.
  "explorer/broadside.css :: a.fn:hover",
]);

/** All `selector:hover { ...rotate(... }` rules in one sheet, comments stripped.
 *  A flat matcher, not a css parser: fine while tips live in top-level rules. */
const hoverTipsIn = (css: string): string[] => {
  const bare = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const tips: string[] = [];
  for (const m of bare.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = m[1].trim().replace(/\s+/g, " ");
    if (selector.includes(":hover") && /rotate\(/.test(m[2])) tips.push(selector);
  }
  return tips;
};

test("the TOC slips tip with the wordmark's text-scale gesture (#324 feel review)", () => {
  for (const file of ["public/faq/index.css", "public/glossary/index.css"]) {
    const css = read(file);
    assert.match(
      css,
      /\.toc a:hover\s*\{\s*transform:\s*translateY\(-2px\)\s+rotate\(-0\.6deg\)/,
      `${file}: the TOC entries go somewhere, so they tip, at the wordmark's numbers`,
    );
  }
});

test("the footnote marks go to the glossary, so they tip, at the wordmark's numbers (#270 ruling 7)", () => {
  assert.match(
    read("public/explorer/broadside.css"),
    /a\.fn:hover\s*\{\s*transform:\s*translateY\(-2px\)\s+rotate\(-0\.6deg\)/,
    "the marks navigate but carry no tip; ruling 7 extends the tipping surface to them",
  );
});

/** Every declaration a selector finally wins, merged in source order. Reading
 *  only the FIRST matching rule would miss a later override, and would go red on
 *  the behavior-preserving split of one declaration into its own rule. Flat, like
 *  hoverTipsIn above: a rule nested in @media counts as unconditional, which errs
 *  toward reporting an override rather than missing one. */
const settled = (css: string, selector: string): Readonly<Record<string, string>> => {
  const bare = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const out: Record<string, string> = {};
  for (const m of bare.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selectors = m[1].split(",").map((s) => s.trim().replace(/\s+/g, " "));
    if (!selectors.includes(selector)) continue;
    for (const declaration of m[2].split(";")) {
      const [prop, ...value] = declaration.split(":");
      if (value.length) out[prop.trim()] = value.join(":").trim();
    }
  }
  return out;
};

/**
 * The tip has a cost, and this is it (#356). A slip is an inline-block so it can
 * carry the transform, and an inline-block takes its baseline from its LAST line
 * box: let one wrap and its list marker drops beside the second line, measured at
 * 26.00px down. At 320 to 330px three of the FAQ's five entries wrap even on the
 * fully loaded webfont, so in that band it is the steady state rather than a
 * first-paint flash; from 335 to 360 only the fallback paint wraps.
 * vertical-align: top pins the marker back to the first line.
 *
 * No structural test can see this: nothing overflows (scrollWidth equals
 * clientWidth), and a ::marker is not reachable from the DOM, so the bullet's
 * position only exists in paint. That is why the rule is guarded as text here,
 * and why the fix shipped with a rendered measurement rather than a green suite.
 *
 * Scoped to the FAQ because that is the file #356 fixes. public/glossary/index.css
 * carries the identical pair and takes the same fix on #353 (PR #354). #358 tracks
 * folding both into one sweep over AUTHORED_CSS once they are on main together;
 * until then this guard is shaped like the instance, not the class.
 */
test("a wrapped TOC slip keeps its list marker on the first line (#356)", () => {
  const decls = settled(read("public/faq/index.css"), ".toc a");
  assert.equal(
    decls["display"],
    "inline-block",
    "the FAQ's .toc a is no longer an inline-block; re-check this guard's premise",
  );
  assert.equal(
    decls["vertical-align"],
    "top",
    "an inline-block slip takes its baseline from its last line box, so a wrapped " +
      "entry drops its bullet to line two; vertical-align: top pins it to the first",
  );
});

test("every hover tip belongs to a surface that goes somewhere (#289; #324 feel review)", () => {
  for (const file of AUTHORED_CSS) {
    for (const selector of hoverTipsIn(read(file))) {
      const key = `${file.replace("public/", "")} :: ${selector}`;
      assert.ok(
        TIPPING_LINKS.has(key),
        `${key} tips on hover but is not a navigating surface; ` +
          `the tip gesture promises "goes somewhere" (#289)`,
      );
    }
  }
});
