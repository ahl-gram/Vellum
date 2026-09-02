import { test } from "node:test";
import assert from "node:assert/strict";
import { STYLES } from "../../src/render/style.ts";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";
import { buildProspectInput } from "../../src/prospect/input.ts";
import { composeProspect } from "../../src/prospect/compose.ts";
import { eraFor, plateCaption } from "../../src/prospect/caption.ts";
import { plateKey } from "../../src/prospect/key.ts";
import { engravedProspectPlate, prospectPlate } from "../../src/prospect/finished.ts";

// #463 part 4/4: the Prospect room's slip reads the plate's own key, era and epithet, so the engraving hands them back beside the svg from the ONE composition the plate was drawn from.

const w42 = generateWorld(defaultRecipe(42));
const present = w42.title.year;

test("the engraved plate is prospectPlate's bytes with the key, the era and the caption of the same composition", () => {
  const e = engravedProspectPlate(w42, 0, STYLES.antique, present);
  const input = buildProspectInput(w42, 0);
  assert.equal(e.svg, prospectPlate(w42, 0, STYLES.antique, present), "no ink of its own");
  assert.equal(e.era, "standing");
  const g = composeProspect({ ...input, ruined: false });
  assert.deepEqual(e.key, plateKey(g), "the key names what the standing plate drew");
  assert.deepEqual(e.caption, plateCaption(input, g, "standing", present, w42.names.sea));
  assert.ok(e.key.length > 0, "premise: the capital's plate has a lettered key");
  assert.match(e.caption.epithet, /chief port of /, "premise: the capital's epithet");
});

test("before the founding the key is the bare ground's (nothing), never the standing town's", () => {
  const input = buildProspectInput(w42, 0);
  const year = input.founded - 1;
  const bare = plateKey(composeProspect(input, { era: "before-founding" }));
  assert.notDeepEqual(bare, plateKey(composeProspect(input)), "premise: the bare ground and the town differ in what the key can name");
  const e = engravedProspectPlate(w42, 0, STYLES.antique, year);
  assert.equal(e.era, "before-founding");
  assert.deepEqual(e.key, bare, "the key follows the era the plate was drawn in");
  assert.equal(e.svg, prospectPlate(w42, 0, STYLES.antique, year));
  assert.match(e.caption.epithet, /will rise/);
});

test("a ruined place at the present engraves as ruined: the era, the epithet and the key of the ruin", () => {
  const i = w42.settlements.findIndex((s) => s.ruined);
  assert.ok(i >= 0, "premise: seed 42 carries a ruin");
  const input = buildProspectInput(w42, i);
  const e = engravedProspectPlate(w42, i, STYLES.ink, present);
  assert.equal(e.era, eraFor(input, present));
  assert.equal(e.era, "ruined");
  assert.deepEqual(e.key, plateKey(composeProspect(input)), "the ruined composition's key");
  assert.equal(e.svg, prospectPlate(w42, i, STYLES.ink, present));
  assert.match(e.caption.epithet, /ruined|thrown down|lost to the waters/);
});
