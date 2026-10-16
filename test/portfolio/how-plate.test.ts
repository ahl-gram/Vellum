import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { tabLine } from "../../src/site/explorer/chart-drawer.ts";
import { TABLE_CAP } from "../../src/site/shared/table-address.ts";
import { PLATE_TITLE } from "../../src/site/portfolio/folio-lines.ts";
import {
  PLATE_CHART,
  PLATE_ROOM,
  PLATE_STEPS,
  PLATE_TAB,
  PLATE_VERB,
  howPlate,
} from "../../src/site/portfolio/how-plate.ts";

const texts = (svg: string): string[] => [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]!);

test("PL1 the plate says the three steps in the words ruled from its stills, each a text of its own, and quotes the Explorer's own labels (Issue #670)", () => {
  assert.deepEqual(PLATE_STEPS, [
    {
      numeral: "i",
      head: "At the Explorer",
      lines: ["Draw nearer with the Glass until a", "region is surveyed anew, then turn", "down the survey's corner."],
    },
    {
      numeral: "ii",
      head: "On the Table",
      lines: [
        "Each sheet turned down is laid on the",
        "Chart Table, in the drawer at the",
        "chart's right edge, up to six.",
      ],
    },
    {
      numeral: "iii",
      head: "In the Portfolio",
      lines: [
        "Take the table here: each sheet is",
        "drafted again from its number, and",
        "downloads as the engraving.",
      ],
    },
  ]);
  assert.equal(PLATE_TAB, "The Drawer");
  assert.equal(PLATE_VERB, "Take the table to");
  assert.equal(PLATE_ROOM, "The Portfolio");
  const [i, ii, iii] = PLATE_STEPS;
  assert.deepEqual(texts(howPlate(PLATE_CHART)), [
    PLATE_TITLE,
    `${i.numeral} · ${i.head}`,
    ...i.lines,
    PLATE_TAB,
    `${ii.numeral} · ${ii.head}`,
    ...ii.lines,
    PLATE_VERB,
    PLATE_ROOM,
    `${iii.numeral} · ${iii.head}`,
    ...iii.lines,
  ]);
  assert.ok(tabLine([]).startsWith(`${PLATE_TAB} · `), "the plate's tab reads as the Explorer's drawer tab does");
  assert.equal(TABLE_CAP, 6, `the plate's row ii says "up to six"; rewrite it with the cap`);
});

test("PL2 the plate writes no colour and no face of its own, so the page's tokens dress every mark (Issue #670)", () => {
  const svg = howPlate(PLATE_CHART);
  assert.doesNotMatch(svg, /#[0-9a-fA-F]{3,8}\b/);
  assert.doesNotMatch(svg, /\b(fill|stroke|style|font-family|font-size)=/);
  assert.doesNotMatch(svg, /<style/);
  assert.doesNotMatch(svg, /rgb\(/);
  const marks = [...svg.matchAll(/<(rect|path|line|text)\b[^>]*>/g)].map((m) => m[0]);
  assert.ok(marks.length > 0, "the plate has marks to dress");
  for (const mark of marks) assert.match(mark, /\bclass="/, `${mark} carries no class`);
});

test("PL3 the plate's one picture is the committed antique chart, reached from the Portfolio's own address (Issue #670)", () => {
  const hrefs = [...howPlate(PLATE_CHART).matchAll(/href="([^"]*)"/g)].map((m) => m[1]);
  assert.ok(hrefs.length > 0, "the plate draws its chart");
  for (const href of hrefs) assert.equal(href, PLATE_CHART);
  assert.equal(
    new URL(PLATE_CHART, "https://vellum.example/explorer/portfolio/").pathname,
    "/charts/chart-42-antique.svg",
  );
  assert.ok(existsSync(fileURLToPath(new URL("../../public/charts/chart-42-antique.svg", import.meta.url))));
});
