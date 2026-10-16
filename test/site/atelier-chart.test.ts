import { test } from "node:test";
import assert from "node:assert/strict";
import { PLACES, ROADS, TRACKS, roadPath } from "../../src/layouts/atelier-chart.ts";
import { NAV_ITEMS, ROUTE_CHILDREN, ROUTE_NAMES, aliasesOf } from "../../src/layouts/nav.ts";
import { ATLAS_ROUTE } from "../../scripts/generate-discovery.ts";

test("AC1 every route in the tree, and home, is a place on the chart of the atelier, and the one place off the tree is the atlas, drawn as an isle off home (Issue #671; Alex, 2026-10-16, D3)", () => {
  const want = [...new Set(["/", ...NAV_ITEMS.map((i) => i.href), ...Object.values(ROUTE_CHILDREN).flat(), ATLAS_ROUTE])];
  assert.deepEqual(Object.keys(PLACES).sort(), want.sort());
  assert.equal(PLACES[ATLAS_ROUTE]?.rank, "isle");
  assert.ok(ROADS.some(([a, b]) => a === "/" && b === ATLAS_ROUTE), "the atlas isle has its road from home");
});

test("AC2 every road and the alias track joins two places on the chart, and the tracks are exactly the tree's aliases (Issue #671)", () => {
  for (const pair of [...ROADS, ...TRACKS]) {
    for (const end of pair) assert.ok(end in PLACES, `${end} is a place`);
    assert.ok(roadPath(pair).startsWith("M"), `${pair.join(" to ")} draws a path`);
  }
  const aliases = Object.keys(ROUTE_NAMES).flatMap((r) => aliasesOf(r).map((a) => [a, r]));
  assert.ok(aliases.length > 0, "the tree has at least one alias for the track to draw");
  assert.deepEqual(TRACKS, aliases);
  assert.throws(() => roadPath(["/", "/nowhere/"]), /no place on the chart of the atelier for \/nowhere\//);
});
