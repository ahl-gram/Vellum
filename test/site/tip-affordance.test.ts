import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { sep } from "node:path";
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
 * sits (#356). Same gesture, second contract, swept the same way (#358): find
 * every inline-block link mechanically, and require each one to either pin its
 * bullet or be recorded as living outside a marker-bearing list.
 */

const root = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const read = (p: string) => readFileSync(root(p), "utf8");

/** Trees under public/ a generator writes, so they are gitignored: absent from a
 *  fresh clone and present after a build. They are NOT swept, and nothing else
 *  sweeps them either: test/cli/gallery.test.ts pins GALLERY_PAGE_CSS's frame and
 *  label, not this rule. Recorded as a known gap rather than described as covered.
 *  Only trees that really hold css today are listed, so a future generated sheet
 *  reds the roster and someone decides about it on purpose. */
const GENERATED_CSS = ["public/gallery/"] as const;

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

/** One selector list split on its TOP-LEVEL commas. A plain split(",") breaks
 *  `:is(.toc, .gazetteer) a` into two fragments, and the second, `.gazetteer) a`,
 *  is a selector no rule has: it would be looked up, found nowhere, and quietly
 *  dropped. `:is()` and `:not()` are house style here (house.css:107), so the
 *  reader has to survive them. */
const selectorsIn = (selectorList: string): string[] => {
  const out: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of selectorList) {
    if (ch === "(") depth += 1;
    if (ch === ")") depth -= 1;
    if (ch === "," && depth === 0) {
      out.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  out.push(current);
  return out.map((s) => s.trim().replace(/\s+/g, " ")).filter(Boolean);
};

/** The element a selector finally styles: its last compound. Combinators inside
 *  a functional pseudo-class do not divide it, so `:is(.toc > .index) a` has the
 *  subject `a`, the element that actually takes the declarations. */
const subjectOf = (selector: string): string => {
  let depth = 0;
  let subject = "";
  for (const ch of selector) {
    if (ch === "(") depth += 1;
    if (ch === ")") depth -= 1;
    if (depth === 0 && /[\s>+~]/.test(ch)) {
      subject = "";
      continue;
    }
    subject += ch;
  }
  return subject;
};

/** Every declaration a selector finally wins, merged in source order. Reading
 *  only the FIRST matching rule would miss a later override, and would go red on
 *  the behavior-preserving split of one declaration into its own rule. Flat, like
 *  hoverTipsIn above: a rule nested in @media counts as unconditional. That errs
 *  toward reporting an override, and for the bullet sweep it also errs the other
 *  way, since a pin written ONLY inside a media query would satisfy a sweep that
 *  wants an unconditional one. Both pins are unconditional today. */
const settled = (css: string, selector: string): Readonly<Record<string, string>> => {
  const bare = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const out: Record<string, string> = {};
  for (const m of bare.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!selectorsIn(m[1]).includes(selector)) continue;
    for (const declaration of m[2].split(";")) {
      const [prop, ...value] = declaration.split(":");
      if (value.length) out[prop.trim()] = value.join(":").trim();
    }
  }
  return out;
};

/**
 * The tip has a cost, and this is it (#356, #353). A slip is an inline-block so
 * it can carry the transform, and an inline-block takes its baseline from its
 * LAST line box: let one wrap and its list marker drops beside the second line,
 * measured at 26.00px down. At 320 to 330px three of the FAQ's five entries wrap
 * even on the fully loaded webfont, so in that band it is the steady state rather
 * than a first-paint flash; from 335 to 360 only the fallback paint wraps. On the
 * glossary, 5 of 15 wrap at 320px in the font-fallback paint that font-display:
 * swap makes the first paint of every cold load. vertical-align: top pins the
 * marker back to the first line.
 *
 * No structural test can see this: nothing overflows (scrollWidth equals
 * clientWidth), and a ::marker is not reachable from the DOM, so the bullet's
 * position only exists in paint. That is why the rule is guarded as text here,
 * and why both fixes shipped with a rendered measurement rather than a green suite.
 *
 * Guarded as a CLASS (#358), because the rule is a property of the tip gesture
 * and not of either page: any future page that tips a wrapping list-item link
 * inherits the same defect. The two per-file guards this replaces (#356 here,
 * #353 in glossary-sections.test.ts) could each only see their own file.
 *
 * The class is link-shaped because the tip is. Whether an element sits in a
 * marker-bearing list is an html fact, not a css one, and the markup that would
 * answer it is spread across the page, the shared BaseLayout and generated dom,
 * so the sweep asks css what it can answer (is this an inline-block link) and
 * keeps the html half as a measured allowlist, the same shape as TIPPING_LINKS.
 */
/** Each entry is a MEASUREMENT of the markup, taken 2026-08-12, not a rule. It
 *  says this selector's boxes are not list items today, on the pages that use it
 *  today. Two of the four live in sheets every page links, so a later use of the
 *  same class inside a marker-bearing li would inherit the defect behind its
 *  exemption. Re-take the measurement when you touch one:
 *  `grep -rn 'class="[^"]*control' src/` and its siblings. */
const INLINE_BLOCKS_OUTSIDE_MARKER_LISTS = new Set([
  // <div class="actions"> on the seed page (src/pages/seed-of-the-day/index.astro:51).
  "house.css :: a.control",
  // Direct children of <nav class="topnav">, separated by a middot, no list at all.
  "motion.css :: .topnav a",
  // Inside <p class="wordmark"> or <h1 class="wordmark"> (BaseLayout.astro:235).
  "motion.css :: .wordmark a",
  // A period mark inline in a control's label (#270), not a list item.
  "explorer/broadside.css :: a.fn",
]);

/** Every selector in one sheet whose settled box is an inline-block.
 *
 *  Not "every inline-block LINK": a link is not identifiable from css. The first
 *  cut required the subject to be an `a` type selector, which reads as the class
 *  but is narrower than it, since `.toc .slip { display: inline-block }` on an
 *  <a class="slip"> is the same defect wearing a class. Sweeping every box costs
 *  nothing today (all six live inline-blocks in authored css are already links)
 *  and closes that hole; the cost lands on whoever adds an inline-block that is
 *  genuinely not a list item, as one allowlist line.
 *
 *  The test is on the SUBJECT, not the whole selector: a pseudo-class on an
 *  ancestor says nothing about the box the declarations land on, so
 *  `.toc li:first-child a` is swept. A subject carrying its own `:` is not: that
 *  is a state (`a:hover`) or generated content (`.seal::before`), neither of
 *  which is the element's own steady-state box. Attribute values are stripped
 *  before that test, since `a[href^="https://x"]` carries a colon that is not a
 *  pseudo-class. */
const inlineBlocksIn = (css: string): string[] => {
  const bare = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const found = new Set<string>();
  for (const m of bare.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    for (const selector of selectorsIn(m[1])) {
      if (subjectOf(selector).replace(/\[[^\]]*\]/g, "").includes(":")) continue;
      if (settled(css, selector)["display"] === "inline-block") found.add(selector);
    }
  }
  return [...found];
};

/** Every inline-block the sweep finds, keyed as the allowlist keys it. */
const sweptBoxes = (): Set<string> =>
  new Set(
    AUTHORED_CSS.flatMap((file) =>
      inlineBlocksIn(read(file)).map((selector) => `${file.replace("public/", "")} :: ${selector}`),
    ),
  );

/** The links the sweep must still reach. Candidacy is derived from `display:
 *  inline-block`, so dropping that declaration would drop the entry out of the
 *  sweep in silence; this is the premise check the two per-file guards made by
 *  hand, kept because a guard that can quietly stop guarding is not one. */
const PINNED_MARKER_LIST_LINKS = [
  ["public/faq/index.css", ".toc a"],
  ["public/glossary/index.css", ".toc a"],
] as const;

test("an inline-block in a marker-bearing list keeps its bullet on line one (#358)", () => {
  for (const file of AUTHORED_CSS) {
    const css = read(file);
    for (const selector of inlineBlocksIn(css)) {
      const key = `${file.replace("public/", "")} :: ${selector}`;
      if (INLINE_BLOCKS_OUTSIDE_MARKER_LISTS.has(key)) continue;
      assert.equal(
        settled(css, selector)["vertical-align"],
        "top",
        `${key} is an inline-block, so as a marker-bearing list item a wrapped entry ` +
          `drops its bullet to line two (#356, #353). Either set vertical-align: top, ` +
          `or record it in INLINE_BLOCKS_OUTSIDE_MARKER_LISTS with the markup that ` +
          `exempts it`,
      );
    }
  }
});

test("every marker-list exemption still names a live inline-block (#358)", () => {
  // The pinned side has a premise test; without this the exempted side has none,
  // and an exemption whose rule is gone or renamed sits forever, silently
  // covering nothing while reading as a considered decision.
  const swept = sweptBoxes();
  for (const key of INLINE_BLOCKS_OUTSIDE_MARKER_LISTS) {
    assert.ok(
      swept.has(key),
      `${key} is exempted from the bullet sweep but is no longer an inline-block the ` +
        `sweep finds; delete the exemption rather than leaving it to look like cover`,
    );
  }
});

test("the sweep's selector reader survives the house's :is() and :not() forms (#358)", () => {
  // Found by mutation: the first cut split selector lists on every comma and
  // rejected any selector carrying a `:`, so `.toc li:first-child a` and
  // `:is(.toc) a` both escaped the sweep while looking exactly like the defect.
  assert.deepEqual(selectorsIn(":is(.toc, .gazetteer) a, .faq a"), [
    ":is(.toc, .gazetteer) a",
    ".faq a",
  ]);
  assert.equal(subjectOf(":is(.toc, .gazetteer) a"), "a", "a functional pseudo-class is not a combinator");
  assert.equal(subjectOf(".toc li:first-child a"), "a", "the subject is the element the rule lands on");
  assert.equal(subjectOf(".broadside .seal::before"), ".seal::before", "a pseudo-element IS the subject");
});

test("both TOC slips still enter the bullet sweep (#358, the guard's premise)", () => {
  for (const [file, selector] of PINNED_MARKER_LIST_LINKS) {
    assert.ok(
      inlineBlocksIn(read(file)).includes(selector),
      `${file}: ${selector} is no longer an inline-block, so the bullet sweep no ` +
        `longer covers it; re-check the premise before deleting this line`,
    );
  }
});

test("the authored roster covers every stylesheet under public/ (#358)", () => {
  const sheets = readdirSync(root("public"), { recursive: true, encoding: "utf8" })
    .map((entry) => `public/${entry.split(sep).join("/")}`)
    .filter((p) => p.endsWith(".css"));
  for (const sheet of sheets) {
    assert.ok(
      AUTHORED_CSS.includes(sheet as (typeof AUTHORED_CSS)[number]) ||
        GENERATED_CSS.some((tree) => sheet.startsWith(tree)),
      `${sheet} is on disk but not on AUTHORED_CSS, so every sweep in this file skips ` +
        `it; add it, or add its tree to GENERATED_CSS if a generator writes it`,
    );
  }
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
