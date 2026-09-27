import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  TABLE_KEY,
  parseTable,
  emitTable,
  prospectItemFrom,
} from "../../src/site/shared/table-address.ts";
import { layOnTable } from "../../src/site/explorer/chart-drawer.ts";
import { chartTarget, ribbonTarget, yearHash } from "../../src/site/prospect/address.ts";
import { SURVEY, PROSPECT, survey, prospect, hashOf } from "../../test-support/table-address-fixtures.ts";

const REPO = resolve(import.meta.dirname, "..", "..");

test("chartTarget carries the table home from the Prospect page (#401 ruling 7 depends on it; the Explorer's writer is Sub 2's half)", () => {
  const hash = `#seed=42&style=antique&${TABLE_KEY}=${SURVEY}&i=4&year=300`;
  assert.ok(chartTarget(hash).includes(`${TABLE_KEY}=${SURVEY}`), "chartTarget drops only i and year, so the table comes home");
  assert.deepEqual(parseTable(chartTarget(hash).replace("/explorer/", "")), [survey]);
});

test("TP1 prospectItemFrom normalises the dress through plateDressFor, so the plate a cutting shows and the dress its address states cannot disagree (#237, #522)", () => {
  const at = { seed: 42, overrides: {}, index: 3, year: 814 } as const;
  assert.equal(prospectItemFrom({ ...at, style: "ink" })?.style, "ink");
  assert.equal(prospectItemFrom({ ...at, style: "antique" })?.style, "antique");
  // The two styles that have no plate of their own: plateDressFor sends both to the antique plate, so the address says antique too.
  assert.equal(prospectItemFrom({ ...at, style: "topographic" })?.style, "antique");
  assert.equal(prospectItemFrom({ ...at, style: "nautical" })?.style, "antique");
});

// A same-inputs compare through ONE builder is a tautology: it cannot tell a normalising builder from a
// pass-through one, because both doors get the same answer either way. What can actually diverge is a door
// that builds its own literal, so the guard is that BOTH doors route through the builder.
test("TP2 both capture points route through prospectItemFrom rather than building a literal: sameSheet is byte equality on the emitted item, so a second builder would seat one plate twice and miscount the cap (#522)", () => {
  const strip = (p: string): string =>
    readFileSync(resolve(REPO, p), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
  // The Explorer reaches the builder THROUGH `filingAt`, which also holds the mid-turn refusal (CT7); the page reaches it
  // directly. Either route is fine, a third spelling is not.
  assert.match(
    strip("src/site/explorer/chart-drawer.ts").slice(strip("src/site/explorer/chart-drawer.ts").indexOf("export function filingAt")),
    /\bprospectItemFrom\b/,
    "filingAt no longer ends at the one builder, so the Explorer's door has a spelling of its own again",
  );
  for (const door of ["src/site/explorer/app.ts", "src/site/prospect/app.ts"]) {
    const src = strip(door);
    assert.match(src, /\b(prospectItemFrom|filingAt)\b/, `${door} does not reach the one builder, so its spelling of a prospect can drift from the other door's`);
    // Keyed on what the DEFECT looks like, not on the words: a table ITEM literal pairs the kind with the item's own
    // `style`, where the prospect JOB literal both doors legitimately write pairs it with `dress`.
    // Tolerates ONE level of nested braces between the two fields: the first version stopped at any `}`, so a literal
    // carrying `overrides: {}` between them evaded it entirely while the exact-variable form was caught. A bare closer
    // still ends the match, which is what keeps the prospect JOB literal (no `style`) out of it.
    assert.doesNotMatch(
      src,
      /kind:\s*"prospect"(?:[^{}]|\{[^}]*\})*\bstyle:/,
      `${door} writes its own prospect ITEM literal beside the builder, which is the second spelling this guard exists to refuse`,
    );
  }
});

test("TP2b one plate filed twice is refused rather than seated twice, which is what the shared spelling buys (#522)", () => {
  const item = prospectItemFrom({ seed: 42, overrides: {}, style: "topographic", index: 3, year: 814 });
  assert.ok(item);
  const laid = layOnTable(layOnTable([], item).items, item);
  assert.equal(laid.refused, true, "the second filing is refused as a duplicate");
  assert.equal(laid.reason, "already");
  assert.equal(laid.items.length, 1, "and the table holds one sheet, not two");
});

test("TP3 the same town at two different years is TWO sheets, which is what lets a reader turn the year back and gather a run of one place (#522, ruled 2026-09-17)", () => {
  const then = prospectItemFrom({ seed: 42, overrides: {}, style: "ink", index: 3, year: 814 });
  const now = prospectItemFrom({ seed: 42, overrides: {}, style: "ink", index: 3, year: 1059 });
  assert.ok(then && now);
  assert.notEqual(emitTable([then]), emitTable([now]), "the year is part of the sheet's identity");
  const laid = layOnTable(layOnTable([], then).items, now);
  assert.equal(laid.refused, false, "the second year is not deduped away");
  assert.equal(laid.items.length, 2);
});

test("TP4 prospectItemFrom refuses what would emit a colliding or unreadable address: a null index emits no i at all and would collide with a hand-typed capital (#522)", () => {
  const at = { seed: 42, overrides: {}, style: "ink" } as const;
  assert.equal(prospectItemFrom({ ...at, index: null, year: 814 }), null, "a null index emits no i, so it may not be filed");
  assert.equal(prospectItemFrom({ ...at, index: -1, year: 814 }), null);
  assert.equal(prospectItemFrom({ ...at, index: 1.5, year: 814 }), null);
  assert.equal(prospectItemFrom({ ...at, index: 3, year: null }), null, "the year is the Explorer's present or the page's drawn year, never absent");
  assert.equal(prospectItemFrom({ ...at, index: 3, year: 0 }), null);
  assert.equal(prospectItemFrom({ seed: -1, overrides: {}, style: "ink", index: 3, year: 814 }), null);
});

test("TP5 a built item round-trips through the grammar unchanged, so what the doors file is what the Explorer restores (#522)", () => {
  const item = prospectItemFrom({ seed: 42, overrides: { mapType: "island", band: "polar" }, style: "ink", index: 3, year: 814 });
  assert.ok(item);
  assert.deepEqual(parseTable(hashOf(emitTable([item]))), [item]);
});

test("TP6 the table key rides yearHash and ribbonTarget untouched, so a filing survives a re-engrave and a hop to the Ribbon (#522; the chartTarget leg is pinned above)", () => {
  const hash = `#seed=42&style=antique&${TABLE_KEY}=${PROSPECT}&i=4&year=300`;
  const reYear = yearHash(hash, 812);
  assert.ok(reYear.includes(`${TABLE_KEY}=${PROSPECT}`), "turning the year back keeps the table");
  assert.deepEqual(parseTable(reYear), [prospect]);
  const ribbon = ribbonTarget(hash, 4);
  assert.ok(ribbon.includes(`${TABLE_KEY}=${PROSPECT}`), "taking the road keeps the table");
  assert.deepEqual(parseTable(ribbon.replace("/ribbon/", "")), [prospect]);
});
