import { test } from "node:test";
import assert from "node:assert/strict";
import { edgesOf, entryAt, indexInk, inViewBy, markEdges, readingAt } from "../../src/site/shared/index-ink.ts";

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
    inset: () => 0,
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
    inset: () => 0,
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

test("IK3 an entry in a folded room is never the one being read: its box is empty and its top reads as the window's own (Issue #1251)", () => {
  const rect = (top: number, size: number) => () => ({ top, bottom: top + size, width: size, height: size }) as DOMRect;
  const el = (id: string, top: number, size: number) =>
    ({ id, getBoundingClientRect: rect(top, size) }) as unknown as Element;
  const row = () => {
    const on: Record<string, boolean> = {};
    return { on, classList: { toggle: (name: string, force: boolean) => (on[name] = force) } };
  };
  const rows = new Map([["one", row()]]);
  const entryRows = new Map([
    ["seen", row()],
    ["folded", row()],
    ["next", row()],
  ]);
  indexInk({
    heads: [el("one", -400, 30)],
    entries: [el("seen", -50, 20), el("folded", 0, 0), el("next", 300, 20)],
    rows: rows as unknown as ReadonlyMap<string, HTMLElement>,
    entryRows: entryRows as unknown as ReadonlyMap<string, HTMLElement>,
    line: () => 145,
    keepInView: () => null,
    inset: () => 0,
  })();
  assert.equal(entryRows.get("seen")?.on["now"], true, "the visible entry above the line is the one being read");
  assert.equal(entryRows.get("folded")?.on["now"], false, "a folded room's entry, in no box, is not");
  assert.equal(entryRows.get("next")?.on["now"], false);
});

test("IK4 the inked row is kept clear of the slip's fades: the body scrolls until the row stands the fade's depth inside its foot, or inside its head, and a row already clear of both moves nothing (Issue #1363)", () => {
  const at =
    (top: number, bottom = top + 20) =>
    () =>
      ({ top, bottom }) as DOMRect;
  const row = (id: string, top: number) =>
    ({ id, classList: { toggle: () => false }, getBoundingClientRect: at(top) }) as unknown as HTMLElement;
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
    inset: () => 32,
  });
  ink();
  assert.equal(box.scrollTop, 40 + (630 - (500 - 32)), "a row below the foot stops the fade's depth above it");
  rows.set("b", row("b", 300));
  ink();
  assert.equal(box.scrollTop, 202, "a row already clear of both fades moves nothing");
  rows.set("b", row("b", 120));
  ink();
  assert.equal(
    box.scrollTop,
    202 - (100 + 32 - 120),
    "a row inside the head's fade stops the fade's depth below the head",
  );
});

test("IK5 a fade depth the page cannot read, not a number, zero or below, leaves the row at the body's very edge as the slip stood before it faded (Issue #1363)", () => {
  const row = { top: 610, bottom: 630 };
  const box = { top: 100, bottom: 500 };
  for (const inset of [Number.NaN, 0, -5]) assert.equal(inViewBy(row, box, inset), 130, `inset ${inset}`);
  assert.equal(inViewBy(row, box, 32), 162, "a depth it reads moves it clear");
});

test("IK6 a row taller than the body less its two fades, though shorter than the body, is aligned by its top at the head fade's foot once and then left still, never flipped between the fades on every pass (Issue #1363, after IK2)", () => {
  const box = {
    scrollTop: 40,
    getBoundingClientRect: () => ({ top: 100, bottom: 300 }) as DOMRect,
  } as unknown as HTMLElement;
  const tall = {
    id: "a",
    classList: { toggle: () => false },
    getBoundingClientRect: () => {
      const top = 190 - box.scrollTop;
      return { top, bottom: top + 150 } as DOMRect;
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
    inset: () => 40,
  });
  const seen: number[] = [];
  for (let i = 0; i < 4; i++) {
    ink();
    seen.push(box.scrollTop);
  }
  assert.deepEqual(seen, [50, 50, 50, 50], "the row's top meets the head fade's foot and stays there");
});

test("IK7 the list fades at its foot while more of it lies below and at its head once it has scrolled, a pixel's slack at either end reading as that end, since the scroll sizes are whole pixels rounded from the layout (Issue #1363)", () => {
  const at = (scrollTop: number, scrollHeight = 900, clientHeight = 400) =>
    edgesOf({ scrollTop, scrollHeight, clientHeight });
  assert.deepEqual(at(0), { above: false, below: true }, "at the head only the foot fades");
  assert.deepEqual(at(200), { above: true, below: true }, "mid-list both fade");
  assert.deepEqual(at(500), { above: true, below: false }, "at the end only the head fades");
  assert.deepEqual(at(0, 400), { above: false, below: false }, "a list that fits fades nowhere");
  assert.deepEqual(at(0.6), { above: false, below: true }, "under a pixel from the head is the head");
  assert.deepEqual(at(499.4), { above: true, below: false }, "under a pixel from the end is the end");
  assert.deepEqual(at(1.5), { above: true, below: true }, "past the slack is off the head");
});

test("IK8 the body itself carries the fades' marks, more-above and more-below, read from its own scroll (Issue #1363)", () => {
  const on: Record<string, boolean> = {};
  const fake = {
    scrollTop: 200,
    scrollHeight: 900,
    clientHeight: 400,
    classList: { toggle: (name: string, force: boolean) => (on[name] = force) },
  };
  markEdges(fake as unknown as HTMLElement);
  assert.deepEqual(on, { "more-above": true, "more-below": true });
  fake.scrollTop = 500;
  markEdges(fake as unknown as HTMLElement);
  assert.deepEqual(on, { "more-above": true, "more-below": false });
});
