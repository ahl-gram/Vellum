import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// #270 The Broadside: the Explorer's controls are grouped by what they do to the
// WORLD, not by what kind of widget they are. The Land holds the generation
// controls (touch these and the geography changes), The Hand the dressing
// controls (the same world, dressed and annotated differently), The Press the
// actions. The split IS the point of the issue, so these pins hold each control
// to its group; moving one across the hairline is a re-ratification, not a tidy.
const here = (p: string): string => readFileSync(new URL(p, import.meta.url), { encoding: "utf8" });
const page = here("../../src/pages/explorer/index.astro");
const glossary = here("../../src/pages/glossary/index.astro");
const app = here("../../src/site/explorer/app.ts");

// Each group is a role="group" region labelled by its head id. Slice the page
// into the three group blocks by those ids, in reading order.
function groupBlock(headId: string, nextHeadId: string | null): string {
  const start = page.indexOf(`aria-labelledby="${headId}"`);
  assert.ok(start >= 0, `the page is missing the ${headId} group`);
  const end = nextHeadId ? page.indexOf(`aria-labelledby="${nextHeadId}"`) : page.length;
  assert.ok(end > start, `${headId} does not precede ${nextHeadId} in the page`);
  return page.slice(start, end);
}

const LAND = ['id="seed"', 'id="random"', 'id="type"', 'id="band"', 'id="land"', 'id="coast"'];
const HAND = ['id="style"', 'id="theme"', 'id="legend"', 'id="arms"', 'id="ages"'];
const PRESS = ['id="draw"', 'id="verso-turn"', 'id="order-plates"', 'id="journal-link"'];

test("the Broadside groups exist in reading order: Land, Hand, Press (#270)", () => {
  const land = page.indexOf('aria-labelledby="grp-land"');
  const hand = page.indexOf('aria-labelledby="grp-hand"');
  const press = page.indexOf('aria-labelledby="grp-press"');
  assert.ok(land >= 0, "the page is missing The Land group");
  assert.ok(hand > land, "The Hand does not follow The Land");
  assert.ok(press > hand, "The Press does not follow The Hand");
});

test("The Land holds every generation control and no dressing control (#270)", () => {
  const block = groupBlock("grp-land", "grp-hand");
  for (const id of LAND) {
    assert.ok(block.includes(id), `The Land lost ${id}, a control that reshapes the geography`);
  }
  for (const id of [...HAND, ...PRESS]) {
    assert.ok(!block.includes(id), `${id} sits under The Land but does not reshape the geography`);
  }
});

test("The Hand holds every dressing control and no generation control (#270)", () => {
  const block = groupBlock("grp-hand", "grp-press");
  for (const id of HAND) {
    assert.ok(block.includes(id), `The Hand lost ${id}, a control that dresses the same world`);
  }
  for (const id of [...LAND, ...PRESS]) {
    assert.ok(!block.includes(id), `${id} sits under The Hand but reshapes the world or presses it`);
  }
});

test("The Press holds the actions; Draw stays the sole primary; the Print Room stays a link (#270)", () => {
  const block = groupBlock("grp-press", null);
  for (const id of PRESS) {
    assert.ok(block.includes(id), `The Press lost ${id}`);
  }
  for (const id of [...LAND, ...HAND]) {
    assert.ok(!block.includes(id), `${id} sits under The Press but is not an action`);
  }
  assert.match(block, /<button id="draw" class="primary">/, "Draw is no longer the sole primary button");
  assert.match(block, /<a id="order-plates" class="action-link"/, "the Print Room link stopped being the action-link <a>");
});

// The journal pointer's new form (ratified 2026-08-11, decision 2 on #270): a gold
// action-link button beside the Print Room's, ALWAYS visible. This consciously
// updates #321 decision 3's hidden-unless-ticked caption; the old caption wrapper
// must be gone, not hidden.
test("the journal pointer is the always-visible action-link button, not the old caption (#270)", () => {
  assert.match(page, /<a id="journal-link" class="action-link"/, "the journal pointer is not the gold action-link button");
  assert.ok(!page.includes('id="journal-line"'), "the old #journal-line caption wrapper survived the move");
  assert.ok(page.includes("Read the Journal in the Reading Room"), "the ratified button copy is missing");
  assert.ok(!app.includes("journalLine"), "app.ts still gates a caption wrapper that no longer exists");
});

// The seals (ratified 2026-08-11, decision 4 on #270, variant B countersigned):
// the three overlay checkboxes wear the seal dressing but stay REAL checkboxes
// with their ids and label text untouched (explorer-page.test.ts pins the survey
// label string; these pin the seal class on all three).
test("the three overlay checkboxes wear the seal dressing with ids untouched (#270)", () => {
  for (const [label, id] of [["legend", "legend"], ["arms", "arms"], ["survey", "ages"]]) {
    const re = new RegExp(`<label class="[^"]*seal[^"]*">${label} <input id="${id}" type="checkbox"`);
    assert.match(page, re, `the ${label} checkbox is not dressed as a seal (or its markup shape drifted)`);
  }
});

// The footnote apparatus (ratified 2026-08-11, decision 5 on #270): four marks in
// the Fell set, each a real link to a /glossary/ anchor with its note real text in
// the DOM (never a title attribute).
const MARKS = [
  ["seeds-choice", "of the seed's choice"],
  ["coast-warp", "of the coast warp"],
  ["survey", "of the survey"],
  ["verso", "of the verso"],
] as const;

test("every footnote mark links a glossary anchor and carries a real note (#270)", () => {
  for (const [anchor, head] of MARKS) {
    assert.ok(page.includes(`href="/glossary/#${anchor}"`), `no mark links /glossary/#${anchor}`);
    assert.ok(page.includes(head), `the "${head}" note head is missing from the page`);
  }
  assert.ok(!/(<a class="fn"[^>]*title=)/.test(page), "a footnote mark leans on a title attribute");
});

test("every glossary anchor the marks point at exists on the glossary page (#270)", () => {
  const hrefs = [...page.matchAll(/href="\/glossary\/#([a-z0-9-]+)"/g)].map((m) => m[1]);
  assert.ok(hrefs.length >= 4, `expected at least the four ratified marks, found ${hrefs.length}`);
  for (const anchor of new Set(hrefs)) {
    assert.ok(glossary.includes(`id="${anchor}"`), `/glossary/#${anchor} has no matching id on the glossary page`);
  }
});

test("the glossary gained the drafting-table section for the control terms (#270)", () => {
  assert.ok(glossary.includes("At the drafting table"), "the 'At the drafting table' section is missing");
  for (const term of ["Survey", "Coast warp", "Seed's choice"]) {
    assert.ok(glossary.includes(`>${term}</p>`), `the glossary lost the ${term} entry`);
  }
});
