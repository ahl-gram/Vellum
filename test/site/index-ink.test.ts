import { test } from "node:test";
import assert from "node:assert/strict";
import { entryAt, indexInk, readingAt } from "../../src/site/shared/index-ink.ts";

// Issue #462 document-room ruling 1: the section being read is the last head at or above the reading line.

const heads = [
  { id: "a", top: -400 },
  { id: "b", top: 60 },
  { id: "c", top: 900 },
];

test("the last head at or above the line is the one being read", () => {
  assert.equal(readingAt(heads, 145), "b");
  assert.equal(readingAt(heads, 60), "b", "a head exactly on the line is being read");
  assert.equal(readingAt(heads, 59), "a");
});

test("above the first head the first section reads; past the last, the last", () => {
  assert.equal(
    readingAt(
      [
        { id: "a", top: 300 },
        { id: "b", top: 900 },
      ],
      145,
    ),
    "a",
  );
  assert.equal(readingAt(heads, 5000), "c");
  assert.equal(readingAt([], 145), null);
});

test("an entry reads only once the line has reached it: above the first entry nothing is marked", () => {
  const entries = [
    { id: "x", top: 200 },
    { id: "y", top: 500 },
  ];
  assert.equal(entryAt(entries, 145, -Infinity), null);
  assert.equal(entryAt(entries, 210, -Infinity), "x");
  assert.equal(entryAt(entries, 5000, -Infinity), "y");
});

test("across the broadside's columns two entries sit level: the earlier one is the reading, not the later (the IX2 catch, 2026-08-29)", () => {
  const entries = [
    { id: "c1-first", top: 137.6 },
    { id: "c1-second", top: 300 },
    { id: "c2-first", top: 137.6 },
  ];
  assert.equal(entryAt(entries, 145.6, 90), "c1-first", "level entries fall to the earlier");
  assert.equal(
    entryAt(entries, 320, 90),
    "c1-second",
    "the entry nearest the line from above, not the last in the page's order",
  );
});

test("at a section's head no entry is marked yet, never the section above's last one (the IX2 catch, 2026-08-29)", () => {
  // The head at 138 (its scroll margin), the previous section's last entry above it at -300, its own first entry below the line at 185.
  const entries = [
    { id: "prev-last", top: -300 },
    { id: "first", top: 185 },
  ];
  assert.equal(entryAt(entries, 145, 138), null, "the section above's entry is not this section's reading");
  assert.equal(entryAt(entries, 190, 138), "first", "its own first entry marks once the line reaches it");
});

test("IK1 the inked row is brought into view by scrolling the index's own body alone, never through scrollIntoView, which scrolls every box around it and, below 1024, swung the whole page sideways to the index while the reader scrolled down (Issue #762)", () => {
  const at =
    (top: number, bottom = top + 20) =>
    () =>
      ({ top, bottom }) as DOMRect;
  const intoView: string[] = [];
  const row = (id: string, top: number) =>
    ({
      id,
      classList: { toggle: () => false },
      getBoundingClientRect: at(top),
      scrollIntoView: () => {
        intoView.push(id);
      },
    }) as unknown as HTMLElement;
  const box = { scrollTop: 40, getBoundingClientRect: at(100, 500) } as unknown as HTMLElement;
  const rows = new Map([
    ["a", row("a", 120)],
    ["b", row("b", 610)],
  ]);
  const head = (id: string, top: number) => ({ id, getBoundingClientRect: at(top) }) as unknown as Element;
  const ink = indexInk({
    heads: [head("a", -400), head("b", 60)],
    entries: [],
    rows,
    entryRows: new Map(),
    line: () => 145,
    keepInView: () => box,
  });
  ink();
  assert.deepEqual(intoView, [], "no scrollIntoView: it would scroll the window as well as the index");
  assert.equal(box.scrollTop, 40 + (630 - 500), "the body scrolls by exactly what the inked row overhangs its foot");
  rows.set("b", row("b", 300));
  ink();
  assert.equal(box.scrollTop, 170, "a row already inside the body moves nothing");
  rows.set("b", row("b", 60));
  ink();
  assert.deepEqual(intoView, [], "scrolling back up, still no scrollIntoView");
  assert.equal(box.scrollTop, 130, "a row above the body's top scrolls the body up by what it overhangs");
});

test("IK2 a section row taller than the index's body is aligned by its top once and then left still, the way scrollIntoView's nearest leaves a box that already fills the view, never flipped between its top and its foot on every scroll (the step 11 plate read on Issue #762 pull request C: 59 reversals reading the Q & A down at 1024x400)", () => {
  const box = {
    scrollTop: 40,
    getBoundingClientRect: () => ({ top: 100, bottom: 300 }) as DOMRect,
  } as unknown as HTMLElement;
  const tall = {
    id: "a",
    classList: { toggle: () => false },
    scrollIntoView: () => {
      throw new Error("scrollIntoView");
    },
    getBoundingClientRect: () => {
      const top = 190 - box.scrollTop;
      return { top, bottom: top + 300 } as DOMRect;
    },
  } as unknown as HTMLElement;
  const head = { id: "a", getBoundingClientRect: () => ({ top: 60 }) as DOMRect } as unknown as Element;
  const ink = indexInk({
    heads: [head],
    entries: [],
    rows: new Map([["a", tall]]),
    entryRows: new Map(),
    line: () => 145,
    keepInView: () => box,
  });
  const seen: number[] = [];
  for (let i = 0; i < 4; i++) {
    ink();
    seen.push(box.scrollTop);
  }
  assert.deepEqual(seen, [90, 90, 90, 90], "the row's top meets the body's top and stays there");
  box.scrollTop = 140;
  ink();
  assert.equal(
    box.scrollTop,
    140,
    "a row that already fills the body past both its edges is left where the reader put it",
  );
});
