import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { sep } from "node:path";
import { fileURLToPath } from "node:url";
import { GALLERY_PAGE_CSS } from "../../src/cli/gallery.ts";
import { atlasDocument } from "../../src/atlas/document.ts";

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
 *
 * Both contracts sweep the AUTHORED CSS OF THE WHOLE SITE, which since #360 means
 * public/ and src/ alike. Before it, every sweep here read a list of files under
 * public/ and three sources in src/ sat outside all of them: a tip added there
 * promised something nobody checked, and an inline-block link added there went
 * green through all 1102 tests. That mutation is what filed the issue. The roster
 * that closes it, and the scan that keeps the roster complete, are at the foot of
 * this file, because a sweep is only worth its coverage.
 */

const root = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const read = (p: string) => readFileSync(root(p), "utf8");

/** Trees under public/ a generator writes, so they are gitignored: absent from a
 *  fresh clone and present after a build. The public/ walk below still skips them,
 *  because on a fresh clone there is nothing there to walk. They are no longer a gap:
 *  since #360 each one is swept at its SOURCE instead, in SRC_CSS below
 *  (public/gallery/index.css is written verbatim from GALLERY_PAGE_CSS), which is the
 *  same css and is present in every clone. Only trees that really hold css today are
 *  listed, so a future generated sheet reds the roster and someone decides about it
 *  on purpose -- and now the decision has an answer: name the source that writes it. */
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

/** Every `<style>` element's css in one source, joined. A file may hold more than
 *  one (an .astro page's scoped block beside the layout's global one), and joining
 *  them is safe here: the sweeps read rules independently, none cares about cascade
 *  order between blocks. */
const styleBlocksIn = (source: string): string =>
  [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n");

/** The atlas document's css, resolved by BUILDING one (#360).
 *
 *  src/atlas/document.ts is the awkward source the issue flagged: its <style> is
 *  `${PAGE_CHROME_CSS}\n${ATLAS_SHEET_CSS}`, and PAGE_CHROME_CSS is itself a template
 *  literal interpolating `${paletteRootCss()}`. Read as TEXT it yields `${...}` markers
 *  rather than css, and PAGE_CHROME_CSS is not exported to be read as a value.
 *  Running the real function resolves every interpolation exactly, needs no export
 *  added to production code for a test's convenience, and cannot drift from what the
 *  document actually ships. The data never reaches the css, so the fixture is empty. */
const atlasCss = (): string => {
  const plate = { key: "x", title: "x", svg: "<svg></svg>" };
  return styleBlocksIn(
    atlasDocument(
      {
        title: "",
        subtitle: "",
        seed: 0,
        hero: plate,
        draughtings: [],
        themes: [],
        regions: [],
        bannersHtml: "",
        chronicleHtml: "",
        gazetteerHtml: "",
      },
      () => "",
    ),
  );
};

/** Authored css that does NOT live under public/ (#360).
 *
 *  Each entry pairs the file with a way to get its css as a STRING. Extraction is
 *  per-source on purpose, because the three arrive differently: a <style> block is
 *  plain css and yields to a regex, an exported constant is read as the value it
 *  already is, and an interpolated one is resolved by running the code that builds it.
 *  Keys keep the `src/` path whole, so they never collide with the public/ side
 *  (which strips its prefix) and so the key names the file you go open. */
const SRC_CSS: ReadonlyArray<readonly [string, () => string]> = [
  ["src/layouts/BaseLayout.astro", () => styleBlocksIn(read("src/layouts/BaseLayout.astro"))],
  ["src/cli/gallery.ts", () => GALLERY_PAGE_CSS],
  ["src/atlas/document.ts", atlasCss],
];

/** Every authored sheet, as (key, css) pairs: the committed files under public/,
 *  then the src/ sources. One list, so a sweep cannot cover one side and quietly
 *  miss the other, which is the whole defect #360 closes. */
const authoredSheets = (): ReadonlyArray<readonly [string, string]> => [
  ...AUTHORED_CSS.map((file) => [file.replace("public/", ""), read(file)] as const),
  ...SRC_CSS.map(([file, css]) => [file, css()] as const),
];

/** Comments are prose, and prose is full of hyphenated words followed by a colon
 *  ("touch-primary: the click falls through", footnotes.ts), which is a css
 *  declaration's shape exactly. Strip them or three files holding no css at all join
 *  the roster. `//` only opens a comment where it does not follow a `:`, so a
 *  `url(https://...)` inside a css block survives. Deliberately not the comment strip
 *  the css readers below use: those read css, where `//` starts nothing. */
const withoutComments = (source: string): string =>
  source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

/** One css rule's fingerprint: a brace block holding an UNQUOTED HYPHENATED property
 *  whose `;`-terminated value does not begin with a quote.
 *
 *  Every discriminator is load-bearing, and each was picked against this tree rather
 *  than in the abstract. The HYPHEN does most of the work: an unquoted hyphenated key
 *  is not legal JS or TS, so `{ t: 0.14, color: "#c3d5a1" }` in render/style.ts cannot
 *  match it, while `font-family:`, `box-shadow:` and `--ink-dark:` all do. The `;`
 *  rejects object literals, which separate with commas. The unquoted value rejects
 *  src/atlas/palette.ts's `"--ink-dark": "#4a3826"`, whose key is quoted BECAUSE the
 *  hyphen forces it. Measured 2026-08-12: across all 174 .ts/.astro files under src/
 *  this selects exactly the three real css sources and nothing else, which is why
 *  there is no hand-kept not-css exemption list here to rot.
 *
 *  It only has to be right about the FILE, not about every rule in it: one matching
 *  rule puts the file on the roster, and extraction there is exact. */
const CSS_RULE = /\{[^{}]*(?:^|[\s;{])(?:-{0,2}[a-z][a-z0-9]*(?:-[a-z0-9]+)+)\s*:\s*[^"'{};][^{};]*;/m;

/** Every file under src/ carrying authored css, found mechanically rather than listed.
 *  public/ and src/ are the whole authored-css surface: CLAUDE.md forbids .js outside
 *  src/, and public/ is otherwise static assets, so nothing else can hold a stylesheet. */
const cssBearingSources = (): string[] =>
  readdirSync(root("src"), { recursive: true, encoding: "utf8" })
    .map((entry) => `src/${entry.split(sep).join("/")}`)
    .filter((p) => p.endsWith(".ts") || p.endsWith(".astro"))
    .filter((p) => CSS_RULE.test(withoutComments(read(p))));

/** The surfaces that tip AND navigate (each is a link or wraps one). */
const TIPPING_LINKS = new Set([
  "motion.css :: .plate:hover",
  "motion.css :: body:has(.room-name) .wordmark a:hover",
  "faq/index.css :: .toc a:hover",
  "glossary/index.css :: .toc a:hover",
  // #270 ruling 7: the footnote marks follow through to /glossary/ anchors, so
  // they tip; this entry IS the conscious extension the ruling recorded.
  "explorer/broadside.css :: a.fn:hover",
  // #360, measured 2026-08-12: cardFigureHtml (src/cli/gallery.ts:70) wraps every
  // contact-sheet plate in <a href="${card.file}">, so the tile really does go
  // somewhere (to its full-size SVG). Legitimate, and until #360 unread.
  "src/cli/gallery.ts :: figure img:hover",
]);

/** Tips the #360 sweep reached for the first time whose surface does NOT navigate,
 *  and which are NOT being changed here because a shipped guard already ratified the
 *  gesture. This set is a QUESTION on the record, not a pardon: the entry stays until
 *  Alex rules, and a new tip cannot be parked here casually, because writing the line
 *  means writing the measurement under it.
 *
 *  Kept apart from TIPPING_LINKS deliberately. That set means "measured: this surface
 *  goes somewhere", and filing a non-navigating surface into it would make the
 *  allowlist say something false about the page, which is exactly the failure #289
 *  exists to prevent. Better a second name that tells the truth. */
const TIPS_AWAITING_A_RULING = new Set([
  // The atlas plates lift on hover, and in two of their three hosts nothing wraps
  // them, measured 2026-08-12:
  //   - the CLI /atlas/ page passes anchor:true, so the plate links its full-size
  //     SVG (src/atlas/document.ts:157). Goes somewhere.
  //   - the Print Room's bound preview writes its own <figure><img> with no anchor
  //     at all (src/site/print-room/bound-atlas.ts:127). Goes nowhere.
  //   - the single-file download passes anchor:false (bound-atlas.ts:222). Goes nowhere.
  // The lift predates the #289 tip contract (it moved here from the Explorer's
  // retired D5, #199) and scripts/e2e/suite-print-room.mjs PR20b asserts it IS wired
  // on the unanchored preview plates. So the contract and a shipped e2e guard now
  // disagree about the same rule, and resolving that is Alex's call, not this sub's:
  // changing the selector here would reverse a ratified decision from a test file.
  "src/atlas/document.ts :: .atlas-sheet figure img:hover",
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
  // #360, measured 2026-08-12: the you-are-here <span> is a direct child of
  // <nav class="topnav"> (BaseLayout.astro:250), the same middot-separated nav
  // with no list at all that the `motion.css :: .topnav a` line above measures.
  // It takes display: inline-block for that rule's reason, not a tip's: a
  // multi-word nav label must not wrap mid-label (BaseLayout.astro:211).
  'src/layouts/BaseLayout.astro :: .topnav [aria-current="page"]',
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
    authoredSheets().flatMap(([key, css]) =>
      inlineBlocksIn(css).map((selector) => `${key} :: ${selector}`),
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
  for (const [file, css] of authoredSheets()) {
    for (const selector of inlineBlocksIn(css)) {
      const key = `${file} :: ${selector}`;
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

test("every tip allowlisted or parked still names a live tip (#360)", () => {
  // The bullet contract got this premise check at #358 and the tip contract never
  // had one, which was survivable while every entry sat in a file a per-rule guard
  // also pinned. Two of them no longer do: the gallery and atlas tips are reached
  // only by the src/ sweep, so a rename there would leave a line that reads as a
  // considered ruling while covering nothing. Cheap, and it holds both lists.
  const swept = new Set(
    authoredSheets().flatMap(([key, css]) => hoverTipsIn(css).map((s) => `${key} :: ${s}`)),
  );
  for (const key of [...TIPPING_LINKS, ...TIPS_AWAITING_A_RULING]) {
    assert.ok(
      swept.has(key),
      `${key} is on a tip list but is no longer a tip the sweep finds; delete the ` +
        `line rather than leaving it to look like a decision someone made`,
    );
  }
});

test("every hover tip belongs to a surface that goes somewhere (#289; #324 feel review)", () => {
  for (const [file, css] of authoredSheets()) {
    for (const selector of hoverTipsIn(css)) {
      const key = `${file} :: ${selector}`;
      if (TIPS_AWAITING_A_RULING.has(key)) continue;
      assert.ok(
        TIPPING_LINKS.has(key),
        `${key} tips on hover but is not a navigating surface; ` +
          `the tip gesture promises "goes somewhere" (#289)`,
      );
    }
  }
});


test("the authored roster is exactly the css-bearing sources under src/ (#360)", () => {
  // Equality, not coverage, so it bites in BOTH directions: a new authored sheet in
  // src/ (the .astro page with a scoped <style> the issue names) reds until someone
  // adds it and writes its extractor, and a roster entry the scan no longer finds
  // reds too. That second half is this guard's own premise check: without it a scan
  // that had quietly gone blind would leave the roster passing on nothing.
  assert.deepEqual(
    cssBearingSources().sort(),
    SRC_CSS.map(([file]) => file).sort(),
    "authored css in src/ is swept only if it is on SRC_CSS; add the file with a way " +
      "to get its css as a string, or if this is not really css, say why the scan thinks it is",
  );
});

test("the css-source scan reads css, not JS wearing its shape (#360)", () => {
  // The scan is a hand-rolled reader, and #358 shipped three escapes from one of
  // those. These pin the discriminators, so loosening one goes red here rather than
  // silently emptying the roster the test above compares against.
  assert.ok(CSS_RULE.test(".toc a { font-family: serif; }"), "a hyphenated property is css");
  assert.ok(CSS_RULE.test(":root {\n  --ink-dark: #4a3826;\n}"), "a custom property is css");
  assert.ok(
    !CSS_RULE.test('const STOPS = [{ t: 0.14, color: "#c3d5a1" }];'),
    "an object literal separates with commas and quotes its values",
  );
  assert.ok(
    !CSS_RULE.test('const P = { "--ink-dark": "#4a3826" };'),
    "a hyphenated JS key must be quoted, and a quoted key is not a css property",
  );
  assert.ok(
    !CSS_RULE.test("function f() { const a: string = b; }"),
    "a type annotation carries no hyphen",
  );
  assert.equal(
    withoutComments("x\n// touch-primary: the click falls through\ny"),
    "x\n\ny",
    "prose in a comment wears the css shape and must not put its file on the roster",
  );
  assert.match(
    withoutComments("a { background: url(https://x/y.png); }"),
    /https:\/\/x/,
    "a protocol's // is not a comment",
  );
});

test("the authored roster covers every stylesheet under public/ (#358)", () => {
  const sheets = readdirSync(root("public"), { recursive: true, encoding: "utf8" })
    .map((entry) => `public/${entry.split(sep).join("/")}`)
    .filter((p) => p.endsWith(".css"));
  for (const sheet of sheets) {
    assert.ok(
      AUTHORED_CSS.includes(sheet as (typeof AUTHORED_CSS)[number]) ||
        GENERATED_CSS.some((tree) => sheet.startsWith(tree)),
      `${sheet} is on disk but not on AUTHORED_CSS, so every sweep skips it; add it, ` +
        `or add its tree to GENERATED_CSS if a generator writes it`,
    );
  }
});
