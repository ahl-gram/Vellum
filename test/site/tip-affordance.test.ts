import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { sep } from "node:path";
import { fileURLToPath } from "node:url";
import { GENERATED_CSS, sheetsOnDisk } from "../../scripts/lint/sheet-tokens.ts";
import { SITE_SHEETS, SRC_CSS_FILES } from "../../test-support/site-sheets.ts";

// What tips and what pins its bullet is the stylesheet lint's (vellum/css-tip-goes-somewhere and vellum/css-inline-block-bullet, Issue #779 part 2d); this file holds the footnote marks' tip, the roster of CSS-bearing sources under src/ that the lint reaches by running them (test/repo/css-beyond-sheets.test.ts), and the sheets the lint's walk of public/ reads.

const root = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const read = (p: string) => readFileSync(root(p), "utf8");

const withoutComments = (source: string): string =>
  source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

const HYPHENATED_DECLARATION = /\{[^{}]*(?:^|[\s;{])(?:-{0,2}[a-z][a-z0-9]*(?:-[a-z0-9]+)+)\s*:\s*[^{};]*;/m;

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

test("the footnote marks go to the glossary, so they tip, at the wordmark's numbers (#270 ruling 7)", () => {
  assert.match(
    read("public/explorer/broadside.css"),
    /a\.fn:hover\s*\{\s*transform:\s*translateY\(var\(--raise\)\)\s+rotate\(-0\.6deg\)/,
    "the marks navigate but carry no tip; ruling 7 extends the tipping surface to them",
  );
});

test("the authored roster is exactly the css-bearing sources under src/ (#360)", () => {
  assert.deepEqual(
    cssBearingSources().sort(),
    [...SRC_CSS_FILES].sort(),
    "authored css in src/ is linted only if it is on SRC_CSS_FILES (scripts/lint/sheet-tokens.ts); add the file there and to SRC_CSS in " +
      "test/repo/css-beyond-sheets.test.ts with a way to get its css as a string, or if this is not really css, say why the scan thinks it is",
  );
});

const fingerprintsOf = (source: string): string[] =>
  CSS_FINGERPRINTS.filter(([, matches]) => matches(withoutComments(source))).map(([name]) => name);

function assertScanSeesCss(): void {
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
}

function assertScanIgnoresNonCss(): void {
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
  assert.deepEqual(fingerprintsOf("function f() { const a: string = b; }"), [], "a type annotation carries no hyphen");
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
}

test("the css-source scan sees css, and sees the defects it polices (#360)", () => {
  assertScanSeesCss();
  assertScanIgnoresNonCss();
});

test("every generated tree names a source the lint actually reads (#360)", () => {
  const swept = new Set<string>(SRC_CSS_FILES);
  for (const [tree, source] of GENERATED_CSS) {
    assert.ok(
      swept.has(source),
      `${tree} is skipped by the public/ walk because ${source} is supposed to be ` +
        `linted in its place, and ${source} is not on SRC_CSS_FILES. Either add it there or ` +
        `stop exempting the tree; as it stands that css is in no lint at all`,
    );
  }
});

test("the sheet roster git lists is every stylesheet on disk under public/ that no generator writes (#358, Issue #709)", () => {
  assert.deepEqual(
    sheetsOnDisk(),
    SITE_SHEETS,
    "a sheet on disk and off SITE_SHEETS is gitignored, so the stylesheet lint never lints it while its rules read it as a sheet: add its tree to GENERATED_CSS " +
      "if a generator writes it, or stop ignoring it; a sheet on SITE_SHEETS and off the disk was deleted without git rm",
  );
});
