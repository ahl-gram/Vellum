import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * The glossary's shape, guarded structurally rather than by a written-down list
 * (#353). Three ratified rules from that issue:
 *
 * 1. A section caps at 5 to 8 terms, which is why the voyage journal's nautical
 *    vocabulary lands as three sections rather than one of twenty. Before #353
 *    "On the chart itself" carried 13, so this guard was red on arrival.
 * 2. Zoryan and Ordai stay over cap by ratified exception: splitting a single
 *    culture's word-list costs more legibility than the overage does.
 * 3. Homographs take the period form, one headword whose senses run together
 *    ("Also, ..."), following Smyth's Sailor's Word-Book (1867), rather than the
 *    modern numbered-homograph form. The no-duplicate-headword guard below is
 *    what makes that decision enforceable: glass and hand each earn one entry.
 *
 * Most of these read the page's own shape rather than a list, so they keep
 * biting as terms come and go. The one exception is the coverage test, which is
 * deliberately a written-down spot-check: it pins the words that prompted #353,
 * so deleting an entry cannot pass quietly.
 *
 * The TOC guard exists because the table of contents is hand-authored while the
 * sections are not, and #353 adds seven sections at once.
 */

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

/** Split the page into its h2/h3 sections and the terms each one carries. */
const sections = (html: string): readonly Section[] => {
  const parts = html.split(/<h([23])[^>]*>([\s\S]*?)<\/h\1>/);
  const out: Section[] = [];
  // parts[0] is the preamble before the first heading; then (level, heading, body) triples.
  for (let i = 1; i + 2 < parts.length + 1; i += 3) {
    const level = Number(parts[i]);
    const heading = parts[i + 1].replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").trim();
    const body = parts[i + 2] ?? "";
    const terms = [...body.matchAll(/<p class="term">([\s\S]*?)<\/p>/g)].map((m) =>
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
  // A spot-check across all seven new sections plus the chart split, drawn from
  // the terms that actually print in lore.ts, voyage-log.ts and the scale bar.
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
  // The period convention (Smyth 1867) is one entry per headword. Two entries
  // for "Glass" would be the modern numbered-homograph form this page rejects.
  // Strip a parenthetical or comma qualifier first: "Bar (of a harbour)" and
  // "Bar, of a river" are the numbered-homograph form decision 7 rejects, and a
  // whole-string compare would wave both through.
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

test("the table of contents lists every section, and no section it lacks (#353)", () => {
  const tocBlock = source.slice(source.indexOf('class="toc"'), source.indexOf("</div>", source.indexOf('class="toc"')));
  const linked = [...tocBlock.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
  const ids = [...source.matchAll(/<h2 id="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(ids.length > 0, "the glossary should carry id'd h2 sections");
  for (const id of ids) {
    assert.ok(linked.includes(id), `the TOC does not link the "${id}" section`);
  }
  for (const href of linked) {
    assert.ok(ids.includes(href), `the TOC links "#${href}", which is not a section on the page`);
  }
});

test("terms stay alphabetical inside their section (#353)", () => {
  // The sort key drops a leading hyphen so the suffix entries (-grad, -tlan,
  // -yama) file under their letter, which is how the culture lists already read.
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

test("every term carries a definition (#353)", () => {
  // Terms and defs alternate, so a dropped def silently orphans the headword
  // above it. Counting per section catches the drift where it happens.
  const bodies = source.split(/<h[23][^>]*>/).slice(1);
  for (const body of bodies) {
    const terms = [...body.matchAll(/<p class="term">/g)].length;
    const defs = [...body.matchAll(/<p class="def">/g)].length;
    if (terms === 0) continue;
    assert.equal(defs, terms, `a section carries ${terms} terms but ${defs} definitions`);
  }
});
