import { test } from "node:test";
import assert from "node:assert/strict";
import { useCommittedGazetteer } from "../../test-support/founding-gazetteer.ts";
import { foundWorld } from "../../src/world/founding/found.ts";
import { setFoundingGazetteer } from "../../src/world/founding/shapes.ts";

test("a sentence asking for a real place's outline is refused until the gazetteer is installed, and a form, a count or a plain sentence needs none", () => {
  setFoundingGazetteer(null);
  assert.deepEqual(foundWorld("shaped like texas"), { ok: false, reason: "places-not-loaded" });
  const form = foundWorld("shaped like a crescent");
  assert.ok(form.ok);
  assert.equal(form.overrides.outline, "crescent");
  assert.ok(foundWorld("exactly 100 equal sized round islands").ok);
  assert.ok(foundWorld("a cold land of quiet towns").ok);

  useCommittedGazetteer();
  const installed = foundWorld("shaped like texas");
  assert.ok(installed.ok);
  assert.equal(installed.overrides.outline, "ne-1159315211");

  setFoundingGazetteer(null);
  assert.deepEqual(foundWorld("shaped like texas"), { ok: false, reason: "places-not-loaded" });

  useCommittedGazetteer();
  assert.ok(foundWorld("shaped like texas").ok);
});
