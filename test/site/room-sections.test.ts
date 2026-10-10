import { test } from "node:test";
import assert from "node:assert/strict";
import { indexCount, roomSections } from "../../src/layouts/room-sections.ts";

// Issue #462 document-room ruling 1: the index is read from the page's own source at build, so every section and every entry on the page is in it and nothing else is.

const FIXTURE = `
<h2 id="about">About &amp; more</h2>
<p class="q" id="what">What <em>is</em> it?</p>
<p class="a">A thing.</p>
<p class="q" id="why">Why?</p>
<h2 id="how">How</h2>
<h3>A sub head</h3>
<p class="q" id="when">When?</p>
`;

test("sections are the h2s in order, each with the entries under it, tags stripped and entities decoded", () => {
  const sections = roomSections(FIXTURE, "q");
  assert.deepEqual(sections, [
    {
      id: "about",
      title: "About & more",
      entries: [
        { id: "what", text: "What is it?" },
        { id: "why", text: "Why?" },
      ],
    },
    { id: "how", title: "How", entries: [{ id: "when", text: "When?" }] },
  ]);
  assert.equal(indexCount(sections), 3);
});

test("an entry with no id is a build error, never a silent gap in the index", () => {
  assert.throws(() => roomSections(`<h2 id="a">A</h2><p class="term">Bare</p>`, "term"), /"Bare" under "A" has no id/);
});

test("attributes in any order: a class before the id, an id before the class, an h2 with a class (the #462 body's own gotcha)", () => {
  const src = `<h2 class="x" id="a">A</h2><p id="t1" class="term">T1</p><p class="term" id="t2">T2</p><h2 id="b" class="y">B</h2><p class="term other" id="t3">T3</p>`;
  assert.deepEqual(
    roomSections(src, "term").map((s) => [s.id, s.entries.map((e) => e.id)]),
    [
      ["a", ["t1", "t2"]],
      ["b", ["t3"]],
    ],
  );
  assert.throws(
    () => roomSections(`<h2 class="x">A</h2>`, "term"),
    /section "A" has no id/,
    "an h2 without an id is a build error too, never a section folded into the one above",
  );
});

test("the other entry class is invisible: a term list read as questions finds none", () => {
  const sections = roomSections(`<h2 id="a">A</h2><p class="term" id="t">T</p>`, "q");
  assert.deepEqual(sections[0]!.entries, []);
});
