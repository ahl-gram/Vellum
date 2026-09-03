import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// #270 The Broadside: controls grouped by what they do to the WORLD (The Land = generation, The Hand = dressing). Since #463 the Broadside rides the slip; the seed row stands in the room's folio (#462 ruling 8) and the rest of the Press is the legend row (ruling 4). Moving a control across a hairline is a re-ratification, not a tidy.
const here = (p: string): string => readFileSync(new URL(p, import.meta.url), { encoding: "utf8" });
const page = here("../../src/pages/explorer/index.astro");
const glossary = here("../../src/pages/glossary/index.astro");
const app = here("../../src/site/explorer/app.ts");

// Each group is a role="group" region labelled by its head id; slice the page into its blocks in reading order.
function block(from: string, to: string): string {
  const start = page.indexOf(from);
  assert.ok(start >= 0, `the page is missing ${from}`);
  const end = page.indexOf(to, start);
  assert.ok(end > start, `${from} does not precede ${to} in the page`);
  return page.slice(start, end);
}

const SEED = ['id="seed"', 'id="random"', 'id="draw"'];
const LAND = ['id="type"', 'id="band"', 'id="land"', 'id="coast"'];
const HAND = ['id="style"', 'id="theme"', 'id="legend"', 'id="arms"', 'id="beasts"', 'id="ages"'];
const PRESS = ['id="verso-turn"', 'id="order-plates"', 'id="journal-link"'];

test("the Broadside groups exist in reading order: the seed row in the folio, then Land and Hand on the slip, then the Press as the legend row (#270, #463)", () => {
  const seed = page.indexOf('aria-label="The seed"');
  const land = page.indexOf('aria-labelledby="grp-land"');
  const hand = page.indexOf('aria-labelledby="grp-hand"');
  const press = page.indexOf('aria-labelledby="grp-press"');
  assert.ok(seed >= 0, "the page is missing the seed group");
  assert.ok(land > seed, "The Land does not follow the seed row");
  assert.ok(hand > land, "The Hand does not follow The Land");
  assert.ok(press > hand, "The Press does not follow The Hand");
});

test("the seed row holds the seed, the dice and Draw, and nothing else (#462 ruling 8)", () => {
  const row = block('aria-label="The seed"', "</RoomFolio>");
  for (const id of SEED) {
    assert.ok(row.includes(id), `the seed row lost ${id}`);
  }
  for (const id of [...LAND, ...HAND, ...PRESS]) {
    assert.ok(!row.includes(id), `${id} sits in the seed row but is not the seed`);
  }
  assert.match(row, /<button id="draw" class="primary">/, "Draw is no longer the room's sole primary button");
});

test("The Land holds every generation control and no dressing control (#270)", () => {
  const land = block('aria-labelledby="grp-land"', 'aria-labelledby="grp-hand"');
  for (const id of LAND) {
    assert.ok(land.includes(id), `The Land lost ${id}, a control that reshapes the geography`);
  }
  for (const id of [...SEED, ...HAND, ...PRESS]) {
    assert.ok(!land.includes(id), `${id} sits under The Land but does not reshape the geography there`);
  }
});

test("The Hand holds every dressing control and no generation control (#270)", () => {
  const hand = block('aria-labelledby="grp-hand"', 'class="fn-note"');
  for (const id of HAND) {
    assert.ok(hand.includes(id), `The Hand lost ${id}, a control that dresses the same world`);
  }
  for (const id of [...SEED, ...LAND, ...PRESS]) {
    assert.ok(!hand.includes(id), `${id} sits under The Hand but reshapes the world or presses it`);
  }
});

test("The Press is the legend row: Turn the sheet, then the Print Room and the journal as gold roads (#462 ruling 4)", () => {
  const press = block('aria-labelledby="grp-press"', "</nav>");
  for (const id of PRESS) {
    assert.ok(press.includes(id), `The Press lost ${id}`);
  }
  for (const id of [...SEED, ...LAND, ...HAND]) {
    assert.ok(!press.includes(id), `${id} sits under The Press but is not an action`);
  }
  assert.match(press, /<button id="verso-turn" class="legend-btn" type="button">/, "Turn the sheet is the row's one button");
  // #487: a road out is the kit's LegendButton; the rendered <a class="legend-btn gold"> is pinned in astro-scaffold.test.ts.
  assert.match(press, /<LegendButton id="order-plates" gold /, "the Print Room road stopped being the gold legend road");
  assert.match(press, /<LegendButton id="journal-link" gold /, "the journal road stopped being the gold legend road");
});

// The journal pointer (ratified 2026-08-11, decision 2 on #270): always visible, the print road's gold peer; the old caption wrapper must be GONE, not hidden.
test("the journal pointer is the always-visible gold road, not the old caption (#270)", () => {
  assert.ok(!page.includes('id="journal-line"'), "the old #journal-line caption wrapper survived the move");
  assert.ok(page.includes('verb="Read the journal in" room="The Reading Room"'), "the road's verb and room lines are missing");
  assert.ok(!app.includes("journalLine"), "app.ts still gates a caption wrapper that no longer exists");
});

// The seals (ratified 2026-08-11, decision 4 on #270, variant B countersigned): the overlay checkboxes wear the seal dressing but stay REAL checkboxes with ids and label text untouched.
test("the overlay checkboxes wear the seal dressing with ids untouched (#270)", () => {
  for (const [label, id] of [["legend", "legend"], ["arms", "arms"], ["beasts", "beasts"], ["survey", "ages"]]) {
    const re = new RegExp(`<label class="[^"]*seal[^"]*">${label} <input id="${id}" type="checkbox"`);
    assert.match(page, re, `the ${label} checkbox is not dressed as a seal (or its markup shape drifted)`);
  }
});

// The footnote apparatus (ratified 2026-08-11, decision 5 on #270): four Fell marks, each a real link to a /glossary/ anchor with its note as real text, never a title attribute.
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
