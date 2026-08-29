import { test } from "node:test";
import assert from "node:assert/strict";
import { findMarks, sectionEmpty } from "../../src/site/shared/term-find.ts";

// #462 document-room ruling 4: the find box narrows the index by term NAME, case-folded, and never by definition.

const names = ["Cartouche", "Colophon", "Rhumb line", "Surveyor's glass"];

test("a query marks the names containing it as hits and the rest as misses, whatever the case", () => {
  assert.deepEqual(findMarks(names, "GLASS").map((m) => m.hit), [false, false, false, true]);
  assert.deepEqual(findMarks(names, "co").map((m) => m.miss), [true, false, true, true], "Colophon alone carries \"co\"");
});

test("an empty or blank query clears every mark, so the whole index stands again", () => {
  for (const q of ["", "   "]) {
    assert.ok(findMarks(names, q).every((m) => !m.hit && !m.miss), `"${q}" marks nothing`);
    assert.equal(sectionEmpty(findMarks(names, q), q), false, "and folds no section");
  }
});

test("a section with a query and no hit folds away; one hit keeps it", () => {
  assert.equal(sectionEmpty(findMarks(names, "zzz"), "zzz"), true);
  assert.equal(sectionEmpty(findMarks(names, "line"), "line"), false);
});
