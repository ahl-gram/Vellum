import { test } from "node:test";
import assert from "node:assert/strict";
import { hashString } from "../../src/core/rng.ts";
import { foundWorld } from "../../src/world/founding/found.ts";
import { setFoundingGazetteer } from "../../src/world/founding/shapes.ts";
import { NAMES_CHECKSUM, installNames } from "../../src/site/shared/founding-names.ts";
import { committedGazetteer } from "../../test-support/founding-gazetteer.ts";

test("the room installs only the name index version 1 was pinned with", () => {
  setFoundingGazetteer(null);
  const rows = committedGazetteer();
  assert.equal(
    hashString(JSON.stringify(rows)),
    NAMES_CHECKSUM,
    "the name index is part of version 1 (engine-invariants, Founding a world from a sentence): a change to it is version 2's",
  );
  assert.equal(installNames([...rows, ["ne-1159315211", "Xland", "state", "US"]]), false);
  assert.deepEqual(foundWorld("shaped like texas"), { ok: false, reason: "places-not-loaded" });
  assert.equal(installNames(rows), true);
  const f = foundWorld("shaped like texas");
  assert.ok(f.ok);
  assert.equal(f.overrides.outline, "ne-1159315211");
  setFoundingGazetteer(null);
});
