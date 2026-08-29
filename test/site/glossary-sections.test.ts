import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// The glossary's shape, guarded structurally (#353): sections cap at 5-8 terms; Zoryan and Ordai run over cap by ratified exception; homographs take Smyth's (1867) period form, one headword with its senses run together.
// The coverage test is deliberately a written-down spot-check pinning the words that prompted #353; the TOC guard exists because the TOC is hand-authored while the sections are not.

const glossaryPath = fileURLToPath(new URL("../../src/pages/glossary/index.astro", import.meta.url));
const source = readFileSync(glossaryPath, "utf8");

const CAP = 8;
const FLOOR = 5;
/** Ratified overage (#353), by heading prefix. Nothing else may exceed CAP. */
const OVER_CAP_BY_RATIFICATION = ["Zoryan", "Ordai"];
const RATIFIED_CEILING = 10;

interface Section {
  readonly heading: string;
  readonly level: number;
  readonly terms: readonly string[];
}

const sections = (html: string): readonly Section[] => {
  const parts = html.split(/<h([23])[^>]*>([\s\S]*?)<\/h\1>/);
  const out: Section[] = [];
  // parts[0] is the preamble before the first heading; then (level, heading, body) triples.
  for (let i = 1; i + 2 < parts.length + 1; i += 3) {
    const level = Number(parts[i]);
    const heading = parts[i + 1].replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").trim();
    const body = parts[i + 2] ?? "";
    // Tolerate attributes on the term: #270's per-term ids made an exact-tag match silently skip every such entry.
    const terms = [...body.matchAll(/<p class="term"[^>]*>([\s\S]*?)<\/p>/g)].map((m) =>
      m[1].replace(/<[^>]*>/g, "").trim(),
    );
    out.push({ heading, level, terms });
  }
  return out;
};

const withTerms = (): readonly Section[] => sections(source).filter((s) => s.terms.length > 0);

test("no glossary section runs past the cap of 8 terms (#353)", () => {
  const found = withTerms();
  assert.ok(found.length >= 5, "the glossary should parse into its sections");
  for (const section of found) {
    const exempt = OVER_CAP_BY_RATIFICATION.some((name) => section.heading.startsWith(name));
    const ceiling = exempt ? RATIFIED_CEILING : CAP;
    assert.ok(
      section.terms.length <= ceiling,
      `"${section.heading}" carries ${section.terms.length} terms, past its ceiling of ${ceiling}; ` +
        `#353 caps a section at ${CAP} (Zoryan and Ordai excepted at ${RATIFIED_CEILING})`,
    );
  }
});

test("the seven sections #353 adds are each within 5 to 8 terms", () => {
  const added = [
    "Coming in from the sea",
    "The waterfront",
    "The river & the fen",
    "The road & the market",
    "The court & the realm",
    "What a place smells of",
    "What a place ships",
  ];
  const found = withTerms();
  for (const heading of added) {
    const section = found.find((s) => s.heading === heading);
    assert.ok(section, `the glossary is missing the "${heading}" section that #353 adds`);
    assert.ok(
      section.terms.length >= FLOOR && section.terms.length <= CAP,
      `"${heading}" carries ${section.terms.length} terms; #353 wants ${FLOOR} to ${CAP}`,
    );
  }
});

test("the chart section is split into the three #353 ratified (#353)", () => {
  const headings = withTerms().map((s) => s.heading);
  for (const heading of ["The sheet and its frame", "On the chart itself", "Soundings & sea marks"]) {
    assert.ok(headings.includes(heading), `the glossary is missing the "${heading}" section`);
  }
});

test("every term the voyage and the gazetteer print is documented (#353)", () => {
  // Drawn from the terms that actually print in lore.ts, voyage-log.ts and the scale bar.
  const owed = [
    "Quay", "Weir", "Breakwater", "Chandler", "Osier", "Drover", "Reeve", "Reach",
    "Holding ground", "Warp", "Beck", "Fen", "Waterman", "Wharf", "Moorings",
    "League", "Plate", "Colophon", "Docket", "Neat line", "Contour line",
    "Attar", "Kvass", "Copal", "Copra", "Cochineal", "Iron bloom", "Kurgan",
  ];
  const terms = withTerms().flatMap((s) => s.terms);
  for (const term of owed) {
    assert.ok(
      terms.some((t) => t.toLowerCase() === term.toLowerCase()),
      `the glossary does not document "${term}"; it prints in Vellum's own output`,
    );
  }
});

test("no headword is defined twice: homographs run their senses together (#353)", () => {
  // Strip a parenthetical or comma qualifier first: "Bar (of a harbour)" vs "Bar, of a river" is the numbered-homograph form decision 7 rejects, and a whole-string compare would wave both through.
  const bare = (t: string): string => t.toLowerCase().replace(/\s*[(,].*$/, "").trim();
  const seen = new Map<string, string>();
  for (const term of withTerms().flatMap((s) => s.terms)) {
    const key = bare(term);
    const first = seen.get(key);
    assert.ok(
      first === undefined,
      `"${term}" repeats the headword already defined as "${first}"; ` +
        `#353 runs a headword's senses together in one entry rather than numbering them`,
    );
    seen.set(key, term);
  }
});

test("the index slip replaced the hand-authored TOC: the sections are read from the page itself (#353, then #462 ruling 1)", () => {
  // The old guard existed because the TOC was hand-authored while the sections were not; room-sections.test.ts now pins that every h2 and every term reaches the index.
  assert.ok(!source.includes('class="toc"'), "the dot-row TOC is gone");
  assert.ok(source.includes('<IndexSlip sections={sections} kind="terms" />'), "the index slip stands in its place, fed from the page's own sections");
  assert.ok(source.indexOf("<IndexSlip") < source.indexOf('<div class="sheet">'), "and precedes the prose it indexes, so the tab and a reader reach it first");
  assert.match(source, /roomSections\(readFileSync\(fileURLToPath\(import\.meta\.url\), "utf8"\), "term"\)/, "the sections are parsed from THIS file at build");
});

test("terms stay alphabetical inside their section (#353)", () => {
  // The key drops a leading hyphen so the suffix entries (-grad, -tlan, -yama) file under their letter.
  const key = (term: string): string => term.toLowerCase().replace(/^-/, "");
  for (const section of withTerms()) {
    const sorted = [...section.terms].sort((a, b) => key(a).localeCompare(key(b)));
    assert.deepEqual(
      section.terms,
      sorted,
      `"${section.heading}" is out of alphabetical order; #353 keeps each section sorted`,
    );
  }
});

test("the broadside stands beside the index at 22rem columns, and no TOC dress survives (#462 rulings 1 and 3, superseding #461 ruling 4's dot-row and ~26rem)", () => {
  for (const page of ["faq", "glossary"]) {
    const css = readFileSync(fileURLToPath(new URL(`../../public/${page}/index.css`, import.meta.url)), "utf8");
    assert.match(css, /\.columns\s*\{[^}]*column-width:\s*22rem/, `${page}: 22rem columns beside the open index (26rem left one 800px line at 1280)`);
    assert.ok(!/\.toc\b/.test(css), `${page}: the dot-row TOC's dress retired with it`);
    assert.ok(!/columns:\s*2/.test(css), `${page}: the #353 two-column TOC box stays retired`);
    assert.match(css, /body\.room:has\(\.slip\.folded\) main\s*\{[^}]*margin-right:\s*0/, `${page}: folding the index hands the sheet the width (ruling 2)`);
    assert.match(css, /body\.room main\s*\{[^}]*transition:\s*margin-right/, `${page}: in one settle, not a jump`);
  }
});

// The wrapped-slip bullet rule moved at #358: one sweep in test/site/tip-affordance.test.ts now holds every authored sheet, this one included.

test("every term carries a definition (#353)", () => {
  // Terms and defs alternate, so a dropped def silently orphans the headword above; counting per section catches the drift where it happens.
  const bodies = source.split(/<h([23])[^>]*>([\s\S]*?)<\/h\1>/);
  for (let i = 1; i + 2 < bodies.length + 1; i += 3) {
    const heading = (bodies[i + 1] ?? "").replace(/<[^>]*>/g, "").trim();
    const body = bodies[i + 2] ?? "";
    const terms = [...body.matchAll(/<p class="term"[^>]*>/g)].length;
    const defs = [...body.matchAll(/<p class="def">/g)].length;
    // A section with terms=0 but defs>0 is what an unmatched term tag looks like; only neither is legitimately empty (an h2 whose terms live under its h3s).
    if (terms === 0 && defs === 0) continue;
    assert.equal(defs, terms, `"${heading}" carries ${terms} terms but ${defs} definitions`);
  }
});
