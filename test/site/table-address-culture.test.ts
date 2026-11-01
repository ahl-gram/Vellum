import test from "node:test";
import assert from "node:assert/strict";
import { foundWorld, type Founding } from "../../src/world/founding/found.ts";
import { recipeOverrides } from "../../src/site/shared/founding.ts";
import { emitTable, groupByWorld, parseTableValue, prospectItemFrom } from "../../src/site/shared/table-address.ts";
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
  const { culture: _culture, ...bare } = f.overrides;
  const other = filed(bare);
  assert.ok(other !== null);
  assert.equal(groupByWorld([item, other]).length, 2);
  assert.deepEqual(parseTableValue(emitted.replace("culture-norden", "culture-klingon")), []);
});
