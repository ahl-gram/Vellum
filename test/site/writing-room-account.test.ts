import { test } from "node:test";
import assert from "node:assert/strict";
import { foundWorld, type Founding } from "../../src/world/founding/found.ts";
import { isFormId, type OutlineId } from "../../src/world/outline-ids.ts";
import { nameOf } from "../../src/site/explorer/place-match.ts";
import { accountOf, chartNumberLine } from "../../src/site/writing-room/account.ts";
import { committedGazetteer, useCommittedGazetteer } from "../../test-support/founding-gazetteer.ts";

const placeName = (id: OutlineId): string =>
  isFormId(id) ? "a " + id : (nameOf(committedGazetteer() as never, id) ?? id);

function founded(sentence: string): Founding {
  useCommittedGazetteer();
  const f = foundWorld(sentence);
  assert.ok(f.ok, sentence);
  return f;
}

test("the account says exactly what the founding steered, cancelled and hashed", () => {
  const flagship = accountOf(
    founded("a cold archipelago of black pines, iron harbors, and a drowned kingdom"),
    placeName,
  );
  assert.deepEqual(flagship.steered, [
    { phrase: "cold", set: "a cold climate" },
    { phrase: "archipelago", set: "an archipelago" },
    { phrase: "black pines", set: "names in the Norden tongue" },
    { phrase: "drowned", set: "less land" },
  ]);
  assert.deepEqual(flagship.contested, []);
  assert.equal(flagship.quiet, false);
  assert.equal(chartNumberLine(flagship), "№ 1858074817, from “iron harbors kingdom”");

  const counted = accountOf(founded("100 islands shaped like Texas"), placeName);
  assert.deepEqual(counted.steered, [
    { phrase: "100 islands", set: "an archipelago" },
    { phrase: "shaped like texas", set: "the shape of Texas" },
  ]);

  const cancelled = accountOf(founded("a tropical polar waste"), placeName);
  assert.deepEqual(cancelled.steered, []);
  assert.deepEqual(cancelled.contested, ["tropical", "polar"]);
  assert.equal(cancelled.quiet, true);

  const none = accountOf(founded("make a world that sdfhs fhsdfhsdf dsfhds"), placeName);
  assert.equal(none.quiet, true);
  assert.deepEqual(none.contested, []);

  const coral = accountOf(founded("a cold coral islands"), placeName);
  assert.deepEqual(coral.steered, [{ phrase: "coral islands", set: "an archipelago" }]);
  assert.deepEqual(coral.contested, ["cold"]);

  const varied = accountOf(founded("100 varied islands"), placeName);
  assert.deepEqual(varied.steered, [
    { phrase: "100 varied islands", set: "about 100 islands and islands of every size and an archipelago" },
  ]);
  assert.equal(chartNumberLine(varied), `№ ${varied.seed}, from no words at all`);
  const equal = accountOf(founded("100 equal islands"), placeName);
  assert.deepEqual(equal.steered, [
    { phrase: "100 equal islands", set: "about 100 islands and islands alike and an archipelago" },
  ]);
});
