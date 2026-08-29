import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { indexCount, roomSections } from "../../src/layouts/room-sections.ts";

// #462 document-room ruling 1: the index is read from the page's own source at build, so every section and every entry on the page is in it and nothing else is.

const read = (p: string) => readFileSync(fileURLToPath(new URL(`../../${p}`, import.meta.url)), "utf8");

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
    { id: "about", title: "About & more", entries: [{ id: "what", text: "What is it?" }, { id: "why", text: "Why?" }] },
    { id: "how", title: "How", entries: [{ id: "when", text: "When?" }] },
  ]);
  assert.equal(indexCount(sections), 3);
});

test("an entry with no id is a build error, never a silent gap in the index", () => {
  assert.throws(
    () => roomSections(`<h2 id="a">A</h2><p class="term">Bare</p>`, "term"),
    /"Bare" under "A" has no id/,
  );
});

test("the other entry class is invisible: a term list read as questions finds none", () => {
  const sections = roomSections(`<h2 id="a">A</h2><p class="term" id="t">T</p>`, "q");
  assert.deepEqual(sections[0].entries, []);
});

for (const [route, cls] of [["faq", "q"], ["glossary", "term"]] as const) {
  test(`${route}: every h2 section and every ${cls} on the page is in the index, ids unique (#462)`, () => {
    const source = read(`src/pages/${route}/index.astro`);
    const sections = roomSections(source, cls);
    const h2s = [...source.matchAll(/<h2 id="([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(sections.map((s) => s.id), h2s, "the index lists exactly the page's sections, in order");
    const onPage = [...source.matchAll(new RegExp(`<p class="${cls}"[^>]*>`, "g"))].length;
    assert.equal(indexCount(sections), onPage, `every ${cls} on the page is an index entry`);
    assert.ok(onPage > 0, "the page has entries to index");
    const ids = sections.flatMap((s) => s.entries.map((e) => e.id));
    assert.equal(new Set(ids).size, ids.length, "no two entries share an anchor");
    for (const id of ids) assert.match(id, /^[a-z0-9-]+$/, `${id} is a plain anchor`);
  });
}
