import test from "node:test";
import assert from "node:assert/strict";
import { foundWorld, type Founding } from "../../src/world/founding/found.ts";
import { recipeOverrides } from "../../src/site/shared/founding.ts";
import { surveyItemFrom } from "../../src/site/explorer/chart-drawer.ts";
import {
  emitTable,
  groupByWorld,
  parseTableValue,
  prospectItemFrom,
  tableOverridesOf,
} from "../../src/site/shared/table-address.ts";
import { useCommittedGazetteer } from "../../test-support/founding-gazetteer.ts";

const FLAGSHIP = "a cold archipelago of black pines, iron harbors, and a drowned kingdom";

test("a sheet carries its world's naming tongue and never its sentence, two tongues of one chart number are two worlds, and a tongue the house does not know drops the sheet", () => {
  useCommittedGazetteer();
  const f = foundWorld(FLAGSHIP) as Founding;
  const filed = (overrides: ReturnType<typeof recipeOverrides>) =>
    prospectItemFrom({ seed: f.seed, overrides, style: "antique", index: 0, year: 891 });
  const item = filed(recipeOverrides(f));
  assert.ok(item !== null);
  assert.equal(item.overrides.culture, "norden");
  assert.equal("foundingText" in item.overrides, false);
  const emitted = emitTable([item]);
  assert.match(emitted, /\.culture-norden(\.|$)/);
  assert.deepEqual(parseTableValue(emitted), [item]);
  const other = filed(Object.fromEntries(Object.entries(f.overrides).filter(([key]) => key !== "culture")));
  assert.ok(other !== null);
  assert.equal(groupByWorld([item, other]).length, 2);
  assert.deepEqual(parseTableValue(emitted.replace("culture-norden", "culture-klingon")), []);
});

test("a survey filed from a written world keeps its tongue and leaves its sentence", () => {
  useCommittedGazetteer();
  const f = foundWorld("a cold archipelago of black pines, iron harbors, and a drowned kingdom") as Founding;
  const o = surveyItemFrom({
    seed: f.seed,
    overrides: recipeOverrides(f),
    render: { style: "antique", widthPx: 1500 },
    band: 2,
    seat: { lx: 3, ly: 4 },
  })?.overrides;
  assert.ok(o !== undefined);
  assert.equal(o.culture, "norden");
  assert.equal("foundingText" in o, false);
  assert.deepEqual(o, tableOverridesOf(recipeOverrides(f)));
});
