// No byte pins here: world geometry descends from libm (Math.hypot in the transect), so
// real-seed plate bytes are platform-stable only within one process. Purity and structure
// are asserted instead; the cross-platform byte pins live on the synthetic fixtures.

import { test } from "node:test";
import assert from "node:assert/strict";
import { STYLES } from "../../src/render/style.ts";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";
import { buildProspectInput } from "../../src/prospect/input.ts";
import { prospectPlate } from "../../src/prospect/finished.ts";

const w42 = generateWorld(defaultRecipe(42));

test("seed 42's capital plate arrives finished, armed, and pure", () => {
  assert.ok(w42.settlements[0]!.harbor, "premise: the capital is a harbor");
  const svg = prospectPlate(w42, 0, STYLES.antique, w42.title.year);
  assert.ok(svg.includes("THE PROSPECT OF LAUKUWELUA"), "title from the world's own name");
  assert.ok(svg.includes("FOUNDED AN. "), "year line");
  assert.ok(svg.includes("chief port of "), "capital epithet");
  assert.ok(svg.includes("VELLUM · CHART № 42"), "the chart number is the seed");
  assert.ok(svg.includes('class="vellum-arms"'), "the capital hangs its realm's arms");
  assert.equal(svg, prospectPlate(w42, 0, STYLES.antique, w42.title.year), "pure");
});

test("a year before the founding bares the capital's ground", () => {
  const founded = w42.settlements[0]!.founded;
  const svg = prospectPlate(w42, 0, STYLES.antique, founded - 1);
  assert.ok(svg.includes("will rise"), "pre-founding note");
  assert.ok(!svg.includes("FOUNDED"), "no founded line yet");
  assert.ok(!svg.includes('class="vellum-arms"'), "no realm yet, no arms");
});

test("the viewing year turns a real ruin on and off", () => {
  const w3 = generateWorld(defaultRecipe(3));
  const ruinIndex = w3.settlements.findIndex((s) => s.ruined);
  assert.ok(ruinIndex >= 0, "premise: seed 3 carries a ruin");
  const input = buildProspectInput(w3, ruinIndex);
  assert.ok(input.ruinedYear !== null, "premise: the ruin is dated");
  const year = input.ruinedYear!;
  const fallen = prospectPlate(w3, ruinIndex, STYLES.ink, year);
  const standing = prospectPlate(w3, ruinIndex, STYLES.ink, year - 1);
  assert.ok(fallen.includes(`An. ${year}`), "the fallen plate names the year of ruin");
  assert.ok(!standing.includes(`An. ${year}`), "the standing plate does not");
  assert.notEqual(fallen, standing, "the year changes the plate");
});
