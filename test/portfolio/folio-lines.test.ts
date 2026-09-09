import { test } from "node:test";
import assert from "node:assert/strict";
import { BARE_LINE, beneathLine, boundLine, draftedLine, gatheredLine, isAwaited, roman, sheetLine } from "../../src/site/portfolio/folio-lines.ts";
import type { TableItem } from "../../src/site/shared/table-address.ts";

const survey = (seed: number): TableItem => ({ kind: "survey", seed, overrides: {}, rung: 1, lx: 4, ly: 4, style: "antique", legend: true, arms: false, beasts: false, theme: null });
const prospect = (seed: number): TableItem => ({ kind: "prospect", seed, overrides: {}, style: "antique", index: 0, year: null });

// The wording is the mockup's, quoted from design/chart-table/folio.tpl.html, so each of these is a spec line and not a snapshot of whatever the code happens to say.
test("PF1 the bound line reads as the mockup writes it: the first run names the sheets, the rest carry the figure alone, and the whole sentence opens with a capital", () => {
  assert.equal(
    boundLine([{ name: "The Isle of Rahai", count: 5 }, { name: "The Quiet Isles of Tri", count: 1 }]),
    "Five sheets from The Isle of Rahai and one from The Quiet Isles of Tri, each drafted here again from its chart's number.",
  );
  assert.equal(boundLine([{ name: "The Isle of Rahai", count: 6 }]), "Six sheets from The Isle of Rahai, each drafted here again from its chart's number.");
  assert.equal(boundLine([]), "");
});

test("PF2 one sheet is not 'each': a single gathered sheet drops the plural pronoun, and takes the singular noun with it", () => {
  assert.equal(boundLine([{ name: "The Isle of Rahai", count: 1 }]), "One sheet from The Isle of Rahai, drafted here again from its chart's number.");
});

test("PF3 the drafting stamp counts in the mockup's own form, 'four of six drafted', with no noun between the figures", () => {
  assert.equal(draftedLine(4, 6), "four of six drafted · the rest a moment more");
  assert.equal(draftedLine(1, 2), "one of two drafted · the rest a moment more");
  assert.equal(draftedLine(6, 6), "Six sheets drafted");
  assert.equal(draftedLine(1, 1), "One sheet drafted");
  assert.equal(draftedLine(0, 0), "");
  // The LOAD state, which is the first thing the page renders since retitle() runs before draft(): word(0) is "no", so
  // the naive form reads "no of six drafted".
  assert.equal(draftedLine(0, 6), "none of six drafted · a moment more");
  assert.equal(draftedLine(0, 1), "none of one drafted · a moment more");
});

test("PF4 a sheet names its place in the pile in the mockup's lower-case numerals, and falls back to the figure past the cap", () => {
  assert.equal(sheetLine("The Environs of Nurunui", 2, 6), "The Environs of Nurunui · Sheet ii of vi");
  assert.equal(roman(1), "i");
  assert.equal(roman(6), "vi");
  assert.equal(roman(7), "7");
});

test("PF5 a prospect is awaited and a survey is not: Sub 4 (#522) builds the prospect's page, and until it does the plate's place is reserved rather than drawn (#520's ruling, carried by #521)", () => {
  assert.equal(isAwaited(prospect(42)), true);
  assert.equal(isAwaited(survey(42)), false);
});

test("PF6 the bare line sends the reader where sheets are gathered, since neither sheet press has anything to act on (ruled 2026-09-08)", () => {
  assert.match(BARE_LINE, /table is laid at the Explorer/);
});

test("PF7 the pile's depth is spelled as a word, the way the mockup writes it, and the bottom sheet says so plainly (ruled 2026-09-08: C's line, in C's words)", () => {
  assert.equal(beneathLine(5), "five beneath it");
  assert.equal(beneathLine(1), "one beneath it");
  assert.equal(beneathLine(0), "the last of them");
});

test("PF8 the slip's where-line carries the tally the mockup gives it, and follows the folio rather than standing at six (ruled 2026-09-08)", () => {
  assert.equal(gatheredLine(6), "six sheets gathered at the Explorer");
  assert.equal(gatheredLine(1), "one sheet gathered at the Explorer");
  // The bare state, which is the DEFAULT way into the room (the Print Room's link carries no table): word(0) is "no", so
  // the line the page writes over BARE_LINE agrees with it instead of promising sheets nobody gathered.
  assert.equal(gatheredLine(0), "no sheets gathered at the Explorer");
});
