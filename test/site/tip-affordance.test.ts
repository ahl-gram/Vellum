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
 * Since #360 both contracts read every authored sheet the site has, public/ and src/
 * alike. Before it, every sweep here read a list of files under public/ and three
 * sources in src/ sat outside all of them: a tip added there promised something
 * nobody checked, and an inline-block link added there went green through all 1102
 * tests. That mutation is what filed the issue. The roster that closes it, and the
 * scan that keeps the roster complete, are at the foot of this file, because a sweep
 * is only worth its coverage.
 *
 * That is coverage of FILES. Be careful not to read it as coverage of the contract:
 * what each sweep then looks FOR is unchanged from #289 and #358, and the tip half is
 * still shaped like `rotate(`. A hover lift written as translate alone is not a tip by
 * this file's definition and is not swept, which is a live shape, not a hypothetical:
 * motion.css's `.card:hover` and `.topnav a:hover` both lift with translateY and no
 * rotate. Neither is a false affordance today (both are anchors), so nothing is broken,
 * and widening the definition is a #289 question rather than a #360 one. Recorded here
 * because #360 widened WHERE this file looks, and it would be easy to come away
 * thinking it had widened what counts. */

const root = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const read = (p: string) => readFileSync(root(p), "utf8");

/** Trees under public/ a generator writes, so they are gitignored: absent from a
 *  fresh clone and present after a build. The public/ walk below still skips them,
 *  because on a fresh clone there is nothing there to walk. They are no longer a gap:
 *  since #360 each is swept at its SOURCE instead, and each therefore has to NAME that
 *  source, which must be on SRC_CSS. public/gallery/index.css is written verbatim from
 *  GALLERY_PAGE_CSS in src/cli/gallery.ts, so sweeping the source sweeps the sheet, and
 *  the source is in every clone rather than only after a build.
 *
 *  The mapping is enforced below, not merely described here. Left as prose it would be
 *  an invariant with nothing behind it: the next session could silence a red by adding
 *  a tree prefix to this list and re-open the exact gap #360 was filed to close, since
 *  a listed tree is skipped by the public/ walk. Adding a tree now costs naming the
 *  src/ module that writes it, which is the decision, made on purpose. */
const GENERATED_CSS = [["public/gallery/", "src/cli/gallery.ts"]] as const;

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
 *  `${PAGE_CHROME_CSS}\n${ATLAS_SHEET_CSS}`. Be precise about which half is awkward,
 *  because an earlier draft of this comment was not: ATLAS_SHEET_CSS IS exported and
 *  could simply be imported. PAGE_CHROME_CSS is the problem. It is not exported, and
 *  it interpolates `${paletteRootCss()}`, so read as text it yields a `${...}` marker
 *  rather than css.
 *
 *  Running the real function is still the better answer for BOTH halves, and not just
 *  because it avoids adding an export for a test's convenience. Importing the two
 *  constants would test the two constants. This tests the DOCUMENT: if a refactor
 *  stopped including one of them in the <style>, importing it would keep sweeping css
 *  no page ships, reporting coverage that had quietly become fictional, while this
 *  follows the document and stops. That is the same reason the roster exists at all.
 *
 *  The data never reaches the css (verified: a fully populated fixture yields a
 *  byte-identical style block), so the fixture is empty. */
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

/** A brace block holding an UNQUOTED HYPHENATED property with a `;`-terminated value.
 *
 *  The HYPHEN is what does the work: an unquoted hyphenated key is not legal JS or TS,
 *  so `{ t: 0.14, color: "#c3d5a1" }` in render/style.ts cannot match, while
 *  `font-family:`, `box-shadow:` and `--ink-dark:` all do. The key boundary
 *  `(?:^|[\s;{])` is the second real discriminator: it rejects src/atlas/palette.ts's
 *  `"--ink-dark": "#4a3826"`, whose key is quoted BECAUSE the hyphen forces it.
 *
 *  The `;` terminator really does discriminate (it is what would reject a
 *  comma-separated `{ a: 1, foo-bar: 2 }`), but be honest about its value HERE:
 *  measured on today's tree, relaxing it to accept a comma still selects the same
 *  three files, because the other two have already excluded every object literal in
 *  src/. It is insurance against a future one, not a load-bearing part of the current
 *  result. An earlier draft of this comment claimed all three discriminators were
 *  doing work and the self-test below claimed to pin them; neither was true, and the
 *  guard-prover weakened two of them and escaped all 1105 tests. Both now hold. */
const HYPHENATED_DECLARATION =
  /\{[^{}]*(?:^|[\s;{])(?:-{0,2}[a-z][a-z0-9]*(?:-[a-z0-9]+)+)\s*:\s*[^{};]*;/m;

/** What makes a file authored css. A file matching ANY of these joins the roster.
 *
 *  The union exists because a single fingerprint was measurably blind, and blind in
 *  the worst possible place. The first cut of this scan required a hyphenated property,
 *  and `display` and `transform` carry no hyphen: those are the exact two properties
 *  BOTH contracts in this file exist to police. A scoped <style> in a page whose only
 *  declarations were `display: inline-block` and a `transform: rotate()` tip therefore
 *  never joined the roster, and went green through all 1105 tests carrying both defects
 *  at once. Worse, the bias ran the wrong way: the FIX (`vertical-align: top`) is
 *  hyphenated and would have been seen, the DEFECT is not. Found by the guard-prover
 *  on #360 before this shipped, on src/pages/faq/index.astro, which is precisely the
 *  "any future page" case the issue was filed to prevent.
 *
 *  So the last two fingerprints name the two defects literally. They are narrow and
 *  that is fine: they are a floor under the general ones, not a replacement for them.
 *
 *  Measured 2026-08-12 across all 174 .ts/.astro files under src/: the union selects
 *  exactly the three real css sources and nothing else, which is why no hand-kept
 *  not-css exemption list is needed here to rot. Each was measured alone too, and
 *  `<style` WITHOUT its closing tag is not one of them: it also matches src/cli/main.ts,
 *  whose --help text spells the flag `--style <style>`.
 *
 *  A fingerprint only has to be right about the FILE, not about every rule in it: one
 *  hit puts the file on the roster, and extraction there is exact. */
const CSS_FINGERPRINTS: ReadonlyArray<readonly [string, (source: string) => boolean]> = [
  ["a <style> element", (s) => /<style[^>]*>[\s\S]*?<\/style>/.test(s)],
  ["a hyphenated declaration", (s) => HYPHENATED_DECLARATION.test(s)],
  ["an inline-block", (s) => /display\s*:\s*inline-block/.test(s)],
  ["a rotate-on-hover tip", (s) => /:hover/.test(s) && /rotate\(/.test(s)],
];

/** Every file under src/ carrying authored css, found mechanically rather than listed.
 *  public/ and src/ are the whole authored-css surface: CLAUDE.md forbids .js outside
 *  src/, and public/ is otherwise static assets, so nothing else can hold a stylesheet. */
const cssBearingSources = (): string[] =>
  readdirSync(root("src"), { recursive: true, encoding: "utf8" })
    .map((entry) => `src/${entry.split(sep).join("/")}`)
    // .css is here for a file that does not exist yet: there are zero stylesheets
    // under src/ today (they all live in public/). Cheaper to scan the extension now
    // than to discover later that the one obvious way to add authored css was the
    // one the scan did not look at.
    .filter((p) => p.endsWith(".ts") || p.endsWith(".astro") || p.endsWith(".css"))
    .filter((p) => {
      const source = withoutComments(read(p));
      return CSS_FINGERPRINTS.some(([, matches]) => matches(source));
    });

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
  // #368, ruled 2026-08-12 and measured after: the atlas plate lift, now scoped to
  // `figure a img` so it can only fire on a plate that IS a link. All three hosts of
  // ATLAS_SHEET_CSS anchor their plates: the CLI /atlas/ page server-side (anchor:true),
  // the Print Room preview to its existing blob (bound-atlas.ts), and the self-contained
  // download at load (PLATE_LINK_SCRIPT, because a plain <a href="data:"> is refused by
  // the browser). Where no link is made, no lift applies, so this entry cannot go stale
  // into a false affordance the way the unscoped rule did.
  "src/atlas/document.ts :: .atlas-sheet figure a img:hover",
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
// Explicitly Set<string>: while the set is empty the element type cannot be inferred, and
// an inferred Set<never> reds every `.has(key)` below rather than accepting a parked line.
const TIPS_AWAITING_A_RULING = new Set<string>([
  // EMPTY, and that is the finished state, not an unwritten one. Its only occupant was the
  // atlas plate lift, parked here by #360 because the lift fired on all three hosts of
  // ATLAS_SHEET_CSS while two of them wrapped nothing. #368 ruled it (2026-08-12): rather
  // than pardon the gesture or drop it, all three hosts were made to navigate, so the entry
  // graduated to TIPPING_LINKS above on the merits instead of being excused.
  //
  // The mechanism stays because the next tip that arrives ahead of its ruling needs
  // somewhere honest to sit. Park a line here only with the measurement written under it.
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

/** The scan's verdict on one source, as the names of the fingerprints that hit. */
const fingerprintsOf = (source: string): string[] =>
  CSS_FINGERPRINTS.filter(([, matches]) => matches(withoutComments(source))).map(([name]) => name);

test("the css-source scan sees css, and sees the defects it polices (#360)", () => {
  // The scan is a hand-rolled reader, and #358 shipped three escapes from one of
  // those. Each case below is named for the fingerprint it pins, so deleting or
  // loosening that one goes red HERE rather than silently emptying the roster the
  // test above compares against. The first cut of this test did not do that: two of
  // its negatives passed on the hyphen rule no matter what the other discriminators
  // did, so the guard-prover could weaken those and escape all 1105 tests.
  assert.deepEqual(
    fingerprintsOf(".toc a { font-family: serif; }"),
    ["a hyphenated declaration"],
    "a hyphenated property is css",
  );
  assert.deepEqual(
    fingerprintsOf(":root {\n  --ink-dark: #4a3826;\n}"),
    ["a hyphenated declaration"],
    "a custom property is css",
  );
  assert.deepEqual(
    fingerprintsOf("<style is:global>\n.x { color: red; }\n</style>"),
    ["a <style> element"],
    "a style element is css whatever its declarations say",
  );

  // The row-1 escape, pinned. Neither declaration carries a hyphen, so the general
  // rule cannot see either, and both ARE the defects the sweeps look for.
  assert.deepEqual(
    fingerprintsOf(".slip { display: inline-block; }"),
    ["an inline-block"],
    "the bullet defect must be visible to the scan without a hyphen anywhere",
  );
  assert.deepEqual(
    fingerprintsOf(".slip:hover { transform: rotate(-0.6deg); }"),
    ["a rotate-on-hover tip"],
    "the tip defect must be visible to the scan without a hyphen anywhere",
  );

  // Not css, by each general fingerprint's own discriminator.
  assert.deepEqual(
    fingerprintsOf('const P = {\n  "--ink-dark": "#4a3826",\n  "--ink-brown": "#6b5a40",\n};'),
    [],
    "src/atlas/palette.ts's shape: a hyphenated JS key MUST be quoted, and the key " +
      "boundary is what rejects it, since the hyphen alone would happily match",
  );
  assert.deepEqual(
    fingerprintsOf("const S = { a: 1, foo-bar: 2, b: 3 };"),
    [],
    "and the `;` terminator is what rejects a comma-separated one; this is the case " +
      "that makes it more than decoration, so do not relax it to accept a comma",
  );
  assert.deepEqual(
    fingerprintsOf("function f() { const a: string = b; }"),
    [],
    "a type annotation carries no hyphen",
  );
  assert.deepEqual(
    fingerprintsOf("cli --style <style> writes a chart"),
    [],
    "help text naming a --style flag is not a <style> element; it has no closing tag",
  );

  // Comment stripping, which every fingerprint runs behind: prose wears the css shape.
  assert.deepEqual(
    fingerprintsOf("const x = 1;\n// touch-primary: the click falls through\n"),
    [],
    "a line comment must not put its file on the roster",
  );
  assert.deepEqual(
    fingerprintsOf("const x = 1;\n/* a { display: inline-block; } in prose */\n"),
    [],
    "a block comment must not either, including one quoting css at it",
  );
  assert.match(
    withoutComments("a { background: url(https://x/y.png); }"),
    /https:\/\/x/,
    "a protocol's // is not a comment",
  );
});

test("every generated tree names a source the sweeps actually read (#360)", () => {
  // A tree on GENERATED_CSS is EXEMPT from the public/ walk, so without this the list
  // is a way to opt css out of every sweep in this file by adding one string. The
  // exemption is only honest while the tree's css is swept at its source instead.
  const swept = new Set(SRC_CSS.map(([file]) => file));
  for (const [tree, source] of GENERATED_CSS) {
    assert.ok(
      swept.has(source),
      `${tree} is skipped by the public/ walk because ${source} is supposed to be ` +
        `swept in its place, and ${source} is not on SRC_CSS. Either add it there or ` +
        `stop exempting the tree; as it stands that css is in no sweep at all`,
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
        GENERATED_CSS.some(([tree]) => sheet.startsWith(tree)),
      `${sheet} is on disk but not on AUTHORED_CSS, so every sweep skips it; add it, ` +
        `or add its tree to GENERATED_CSS if a generator writes it`,
    );
  }
});
