import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { sep } from "node:path";
import { fileURLToPath } from "node:url";
import { GALLERY_PAGE_CSS } from "../../src/cli/gallery.ts";
import { atlasDocument } from "../../src/atlas/document.ts";

// Two contracts over every authored sheet the site has, public/ and src/ alike (#289, #356, #358, #360): what tips must go somewhere or be a ratified chart instrument, and an inline-block link must pin its bullet or be recorded as living outside a marker-bearing list.
// A tip is defined by the shape `rotate(`, so a hover lift written as translate alone is not swept: motion.css's .rooms a lifts with translateY and no rotate (#461's addendum). It is not a false affordance today (an anchor), and widening the definition is a #289 question; so is the bare `rotate:` individual-transform property, which this fingerprint cannot see (guard-prover round 3, 2026-08-26).

const root = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const read = (p: string) => readFileSync(root(p), "utf8");

/** Generator-written trees under public/, gitignored and so absent from a fresh clone: each is skipped by the public/ walk and swept at the src/ source named beside it instead. */
const GENERATED_CSS = [["public/gallery/", "src/cli/gallery.ts"]] as const;

const AUTHORED_CSS = [
  "public/atelier.css",
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
  "public/prospect/index.css",
  "public/ribbon/index.css",
  "public/reading-frame.css",
  "public/reading-room/index.css",
  "public/seed-of-the-day/index.css",
] as const;

/** Joining a source's several <style> blocks is safe here: every sweep reads rules independently, none depends on cascade order between blocks. */
const styleBlocksIn = (source: string): string =>
  [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n");

/** Built rather than importing the two css constants, so this sweeps what the DOCUMENT ships: a refactor that dropped one from the <style> stops the sweep instead of leaving it to report coverage that had gone fictional. The fixture is empty because the data never reaches the css (measured: a fully populated fixture yields a byte-identical style block). */
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
        prospects: [],
        bannersHtml: "",
        chronicleHtml: "",
        gazetteerHtml: "",
      },
      () => "",
    ),
  );
};

/** Authored css outside public/ (#360), each paired with a way to get its css as a string. Keys keep the whole src/ path, so they cannot collide with the public/ side, which strips its prefix. */
const SRC_CSS: ReadonlyArray<readonly [string, () => string]> = [
  ["src/layouts/BaseLayout.astro", () => styleBlocksIn(read("src/layouts/BaseLayout.astro"))],
  ["src/pages/index.astro", () => styleBlocksIn(read("src/pages/index.astro"))],
  ["src/cli/gallery.ts", () => GALLERY_PAGE_CSS],
  ["src/atlas/document.ts", atlasCss],
];

const authoredSheets = (): ReadonlyArray<readonly [string, string]> => [
  ...AUTHORED_CSS.map((file) => [file.replace("public/", ""), read(file)] as const),
  ...SRC_CSS.map(([file, css]) => [file, css()] as const),
];

const withoutComments = (source: string): string =>
  source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

const HYPHENATED_DECLARATION =
  /\{[^{}]*(?:^|[\s;{])(?:-{0,2}[a-z][a-z0-9]*(?:-[a-z0-9]+)+)\s*:\s*[^{};]*;/m;

/** A file matching ANY of these joins the roster: one hit is enough, because a fingerprint only has to be right about the FILE, and extraction there is exact. */
const CSS_FINGERPRINTS: ReadonlyArray<readonly [string, (source: string) => boolean]> = [
  ["a <style> element", (s) => /<style[^>]*>[\s\S]*?<\/style>/.test(s)],
  ["a hyphenated declaration", (s) => HYPHENATED_DECLARATION.test(s)],
  ["an inline-block", (s) => /display\s*:\s*inline-block/.test(s)],
  ["a rotate-on-hover tip", (s) => /:hover/.test(s) && /rotate\(/.test(s)],
];

/** public/ and src/ are the whole authored-css surface: CLAUDE.md forbids .js outside src/, and public/ is otherwise static assets, so nothing else can hold a stylesheet. */
const cssBearingSources = (): string[] =>
  readdirSync(root("src"), { recursive: true, encoding: "utf8" })
    .map((entry) => `src/${entry.split(sep).join("/")}`)
    // .css is scanned though there are zero stylesheets under src/ today, so the one obvious way to add authored css is not the way the scan misses.
    .filter((p) => p.endsWith(".ts") || p.endsWith(".astro") || p.endsWith(".css"))
    .filter((p) => {
      const source = withoutComments(read(p));
      return CSS_FINGERPRINTS.some(([, matches]) => matches(source));
    });

/** The surfaces that tip AND navigate (each is a link or wraps one). */
const TIPPING_LINKS = new Set([
  "motion.css :: .plate:hover",
  "motion.css :: body:has(.room-name) .wordmark a:hover, body:has(.room-name) .wordmark a:focus-visible",
  // #270 ruling 7: the footnote marks follow through to /glossary/ anchors, so the ruling extended the tipping surface to them.
  "explorer/broadside.css :: a.fn:hover",
  // #360, measured 2026-08-12: `cardFigureHtml` in `src/cli/gallery.ts` wraps every contact-sheet plate in a link to its full-size SVG.
  "src/cli/gallery.ts :: figure img:hover",
  // #368, ruled 2026-08-12 and measured after: the lift is scoped to `figure a img`, and all three hosts of ATLAS_SHEET_CSS anchor their plates, so where no link is made no lift applies.
  "src/atlas/document.ts :: .atlas-sheet figure a img:hover",
  // #242: the place card's "View the prospect" slip navigates to /prospect/, so it tips (#289's promise).
  "living-chart.css :: .pc-prospect:hover, .pc-prospect:focus-visible",
  // #402: the Reading Room's beat plate links to /prospect/, so it carries the atlas plates' lift.
  "reading-room/index.css :: .rr-prospect a:hover img, .rr-prospect a:focus-visible img",
]);

/** Chart instruments, ratified by Alex 2026-08-24 (in session, PR #468 live review): the lift-or-grow gesture still promises navigation everywhere else, but a station pip is a different thing altogether with its own rule. A pip is the chart's own instrument, and its grow promises "this opens the station's slip in place"; the slip's Enter link is what leaves the page. Kept apart from TIPPING_LINKS so that set stays true when it says a surface goes somewhere. */
const CHART_INSTRUMENTS = new Set<string>([
  "index.css :: .lf-station:hover .lf-station-glyph, .lf-station:focus-visible .lf-station-glyph",
]);

/** A tip whose surface does not navigate, held on the record until Alex rules: kept apart from TIPPING_LINKS so that set stays true when it says a surface goes somewhere. */
// Explicitly Set<string>: while the set is empty an inferred Set<never> reds every `.has(key)` below rather than accepting a parked line.
const TIPS_AWAITING_A_RULING = new Set<string>([
  // Empty again on purpose: the station glyph parked here 2026-08-24 and graduated the same day to CHART_INSTRUMENTS on Alex's ruling. Park a line here only with the measurement written under it.
]);

/** A flat matcher over `rotate(` hover rules, not a css parser: fine while tips live in top-level rules. */
const hoverTipsIn = (css: string): string[] => {
  const bare = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const tips: string[] = [];
  for (const m of bare.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = m[1].trim().replace(/\s+/g, " ");
    if (selector.includes(":hover") && /rotate\(/.test(m[2])) tips.push(selector);
  }
  return tips;
};

test("the footnote marks go to the glossary, so they tip, at the wordmark's numbers (#270 ruling 7)", () => {
  assert.match(
    read("public/explorer/broadside.css"),
    /a\.fn:hover\s*\{\s*transform:\s*translateY\(var\(--raise\)\)\s+rotate\(-0\.6deg\)/,
    "the marks navigate but carry no tip; ruling 7 extends the tipping surface to them",
  );
});

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

/** Merged in source order so a later override wins; flat like hoverTipsIn, so a rule nested in @media counts as unconditional, and both bullet pins are unconditional today. */
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

// Hand-measured (#356, #353): an inline-block takes its baseline from its LAST line box, so a wrapped tipping slip drops its bullet 26.00px to line two (measured on the FAQ and glossary TOCs, retired at #462; the class outlives its first instances), and vertical-align: top pins it back. Nothing overflows and a ::marker is not reachable from the DOM, so the bullet's position exists only in paint: no structural test can see it, which is why the rule is guarded as text.
/** Each entry is a MEASUREMENT of the markup taken 2026-08-12, not a rule: it says these boxes are not list items on the pages that use them today, so re-take it when you touch one. */
const INLINE_BLOCKS_OUTSIDE_MARKER_LISTS = new Set([
  // Re-taken 2026-09-01 (#463 part 4/4): no page wears an <a class="control"> any more (the prospect's and ribbon's <div class="actions"> retired with their conversion; Today's left at #462), so this measures the rule alone; re-take it when a page wears one again.
  "house.css :: a.control",
  // Inside <p class="wordmark"> or <h1 class="wordmark"> in BaseLayout's head cluster (#461; the rooms nav pins vertical-align itself).
  "motion.css :: .wordmark a",
  // A period mark inline in a control's label (#270), not a list item.
  "explorer/broadside.css :: a.fn",
]);

/** Every inline-block BOX, not every inline-block link: a link is not identifiable from css, and the same defect wearing a class on an anchor would escape a narrower sweep. */
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

const sweptBoxes = (): Set<string> =>
  new Set(
    authoredSheets().flatMap(([key, css]) =>
      inlineBlocksIn(css).map((selector) => `${key} :: ${selector}`),
    ),
  );

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
  assert.deepEqual(selectorsIn(":is(.toc, .gazetteer) a, .faq a"), [
    ":is(.toc, .gazetteer) a",
    ".faq a",
  ]);
  assert.equal(subjectOf(":is(.toc, .gazetteer) a"), "a", "a functional pseudo-class is not a combinator");
  assert.equal(subjectOf(".toc li:first-child a"), "a", "the subject is the element the rule lands on");
  assert.equal(subjectOf(".broadside .seal::before"), ".seal::before", "a pseudo-element IS the subject");
});

test("every tip allowlisted or parked still names a live tip (#360)", () => {
  const swept = new Set(
    authoredSheets().flatMap(([key, css]) => hoverTipsIn(css).map((s) => `${key} :: ${s}`)),
  );
  for (const key of [...TIPPING_LINKS, ...CHART_INSTRUMENTS, ...TIPS_AWAITING_A_RULING]) {
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
      if (CHART_INSTRUMENTS.has(key) || TIPS_AWAITING_A_RULING.has(key)) continue;
      assert.ok(
        TIPPING_LINKS.has(key),
        `${key} tips on hover but is not a navigating surface; ` +
          `the tip gesture promises "goes somewhere" (#289), and only a ratified ` +
          `CHART_INSTRUMENTS entry carries a different rule`,
      );
    }
  }
});

test("the authored roster is exactly the css-bearing sources under src/ (#360)", () => {
  assert.deepEqual(
    cssBearingSources().sort(),
    SRC_CSS.map(([file]) => file).sort(),
    "authored css in src/ is swept only if it is on SRC_CSS; add the file with a way " +
      "to get its css as a string, or if this is not really css, say why the scan thinks it is",
  );
});

const fingerprintsOf = (source: string): string[] =>
  CSS_FINGERPRINTS.filter(([, matches]) => matches(withoutComments(source))).map(([name]) => name);

test("the css-source scan sees css, and sees the defects it polices (#360)", () => {
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
