import { test } from "node:test";
import assert from "node:assert/strict";
import { parseHTML } from "linkedom";
import { paintTop } from "../../src/site/explorer/portfolio/paint-top.ts";

test("PF10 the sheet on top is laid out only once its title and lines are written, so the press row is seated for the folio as it reads (Issue #1253 pull request 9, Q5)", () => {
  const { document } = parseHTML(
    `<div id="pf-sheet"></div><p id="folio-title">Chart № 42</p><p id="folio-sub"></p><p id="folio-coords"></p>`,
  );
  const el = (id: string): HTMLElement => document.getElementById(id) as HTMLElement;
  const roomEls = { sheet: el("pf-sheet"), title: el("folio-title"), sub: el("folio-sub"), coords: el("folio-coords") };
  const seen: string[][] = [];
  paintTop(
    roomEls,
    {
      svg: "<svg></svg>",
      title: "The Environs of Nanawotani · Sheet i of ii",
      sub: "a regional survey at band 1, antique · from The Isle of Rahai, chart № 42",
      coords: "one beneath it",
    },
    () => {
      seen.push([
        roomEls.sheet.querySelector("svg") === null ? "no sheet" : "the sheet",
        roomEls.title.textContent,
        roomEls.sub.textContent,
        roomEls.coords.textContent,
      ]);
    },
  );
  assert.deepEqual(seen, [
    [
      "the sheet",
      "The Environs of Nanawotani · Sheet i of ii",
      "a regional survey at band 1, antique · from The Isle of Rahai, chart № 42",
      "one beneath it",
    ],
  ]);
});
