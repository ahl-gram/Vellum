import { test } from "node:test";
import assert from "node:assert/strict";
import { entryAt, readingAt } from "../../src/site/shared/index-ink.ts";

// #462 document-room ruling 1: the section being read is the last head at or above the reading line.

const heads = [{ id: "a", top: -400 }, { id: "b", top: 60 }, { id: "c", top: 900 }];

test("the last head at or above the line is the one being read", () => {
  assert.equal(readingAt(heads, 145), "b");
  assert.equal(readingAt(heads, 60), "b", "a head exactly on the line is being read");
  assert.equal(readingAt(heads, 59), "a");
});

test("above the first head the first section reads; past the last, the last", () => {
  assert.equal(readingAt([{ id: "a", top: 300 }, { id: "b", top: 900 }], 145), "a");
  assert.equal(readingAt(heads, 5000), "c");
  assert.equal(readingAt([], 145), null);
});

test("an entry reads only once the line has reached it: above the first entry nothing is marked", () => {
  const entries = [{ id: "x", top: 200 }, { id: "y", top: 500 }];
  assert.equal(entryAt(entries, 145, -Infinity), null);
  assert.equal(entryAt(entries, 210, -Infinity), "x");
  assert.equal(entryAt(entries, 5000, -Infinity), "y");
});

test("across the broadside's columns two entries sit level: the earlier one is the reading, not the later (the IX2 catch, 2026-08-29)", () => {
  // Column one's first question and column two's first share a top; column one's second sits lower and is still above the line.
  const entries = [{ id: "c1-first", top: 137.6 }, { id: "c1-second", top: 300 }, { id: "c2-first", top: 137.6 }];
  assert.equal(entryAt(entries, 145.6, 90), "c1-first", "level entries fall to the earlier");
  assert.equal(entryAt(entries, 320, 90), "c1-second", "the entry nearest the line from above, not the last in the page's order");
});

test("at a section's head no entry is marked yet, never the section above's last one (the IX2 catch, 2026-08-29)", () => {
  // The head at 138 (its scroll margin), the previous section's last entry above it at -300, its own first entry below the line at 185.
  const entries = [{ id: "prev-last", top: -300 }, { id: "first", top: 185 }];
  assert.equal(entryAt(entries, 145, 138), null, "the section above's entry is not this section's reading");
  assert.equal(entryAt(entries, 190, 138), "first", "its own first entry marks once the line reaches it");
});
