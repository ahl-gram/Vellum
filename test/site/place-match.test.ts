import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  NO_SUCH_PLACE,
  createMatcher,
  fold,
  largestNameGroup,
  moreWords,
  nameOf,
  subLine,
  type NameRow,
} from "../../src/site/explorer/place-match.ts";
import { placeId } from "../../src/world/outline-ids.ts";

const rows = JSON.parse(
  readFileSync(new URL("../../src/world/outline-place-names.json", import.meta.url), "utf8"),
) as NameRow[];
const match = createMatcher(rows);
const rowFor = (hit: { id: string }): NameRow => rows.find((r) => r[0] === hit.id) as NameRow;

test("the drawn lists come back in the drawn order (Issue #854)", () => {
  assert.deepEqual(
    match("tex").hits.map((h) => h.name),
    ["Texas", "Lake Texoma"],
  );
  const georgia = match("georgia").hits;
  assert.deepEqual(
    georgia.map((h) => h.name),
    [
      "Georgia",
      "Georgia",
      "Georgian Bay",
      "South Georgia and the Islands",
      "South Georgia and the South Sandwich Islands",
    ],
  );
  assert.deepEqual(
    georgia.map((h) => rowFor(h)[2]),
    ["country", "state", "lake", "country", "state"],
  );
  assert.deepEqual(
    georgia.map((h) => h.sub),
    ["a country", "in United States of America", "a lake", "a country", "in South Georgia and the Islands"],
  );
});

test("accents fold, so the letters a reader can type find the place (Issue #854)", () => {
  for (const q of ["calarasi", "CĂLĂRAȘI"]) {
    const hits = match(q).hits;
    assert.deepEqual(
      hits.map((h) => h.name),
      ["Călărași", "Călărași"],
      q,
    );
    assert.deepEqual(hits.map((h) => rowFor(h)[3]).sort(), ["Moldova", "Romania"], q);
  }
  assert.equal(fold("Călărași"), "calarasi");
});

test("the second line is the in-Latvia form for every kind (Issue #854)", () => {
  const first = (kind: string) => rows.find((r) => r[2] === kind) as NameRow;
  assert.equal(subLine(first("country")), "a country");
  assert.equal(subLine(first("lake")), "a lake");
  assert.equal(subLine([placeId("ne-1159315211"), "Rīga", "state", "Latvia"]), "in Latvia");
  assert.equal(subLine([placeId("ne-1159315211"), "Brussels", "unit", "Belgium"]), "in Belgium");
  for (const r of rows) assert.doesNotMatch(subLine(r), /^in\s*$/, r[1]);
});

test("a list runs to the largest group of alike names, so every twin is reachable, and says how many more past it (Issue #854)", () => {
  const valmiera = rows.filter((r) => r[1] === "Valmiera");
  assert.ok(valmiera.length > 6, "witness: the Valmiera group is longer than a screenful");
  assert.equal(largestNameGroup(rows), valmiera.length);
  const twins = match("valmiera");
  assert.equal(twins.hits.length, valmiera.length);
  assert.equal(twins.more, 0);
  for (const h of twins.hits) assert.equal(h.sub, "in Latvia");
  const matches = rows.filter((r) => fold(r[1]).includes("a")).length;
  const a = match("a");
  assert.equal(a.hits.length, valmiera.length);
  assert.equal(a.more, matches - valmiera.length);
});

test("the marked letters are the query's own, in the name as written (Issue #854)", () => {
  const marks = (q: string) => match(q).hits.map((h) => [h.name, h.mark]);
  assert.deepEqual(marks("georgia")[0], ["Georgia", [0, 7]]);
  assert.deepEqual(
    marks("georgia").filter(([n]) => n === "South Georgia and the Islands"),
    [["South Georgia and the Islands", [6, 13]]],
  );
  assert.deepEqual(
    marks("lara").filter(([n]) => n === "Călărași"),
    [
      ["Călărași", [2, 6]],
      ["Călărași", [2, 6]],
    ],
  );
});

test("an empty query lists nothing; the words are the ruled ones (Issue #854)", () => {
  assert.deepEqual(match(""), { hits: [], more: 0 });
  assert.deepEqual(match("  "), { hits: [], more: 0 });
  assert.equal(NO_SUCH_PLACE, "no such place in the gazetteer");
  assert.equal(moreWords(15), "and 15 more; type more of the name");
  assert.equal(nameOf(rows, placeId("ne-1159315211")), "Texas");
  assert.equal(nameOf(rows, "ne-0" as never), null);
});

test("a name starting with the letters ranks before one with a word starting with them, and that before one holding them mid-word (Issue #854)", () => {
  const row = (id: string, name: string): NameRow => [id as never, name, "state", "Nowhere"];
  const twins = ["ne-d", "ne-e", "ne-f"].map((id) => row(id, "Zeta"));
  const rows = [row("ne-a", "Malbork"), row("ne-b", "Port Alba"), row("ne-c", "Albany"), ...twins];
  assert.deepEqual(
    createMatcher(rows)("alb").hits.map((h) => h.name),
    ["Albany", "Port Alba", "Malbork"],
    "alphabet alone would put Malbork before Port Alba",
  );
});
