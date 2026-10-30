import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { admitPlace } from "../../src/site/explorer/place-source.ts";
import { ringsOf, setPlaceSource, sourceGeneration } from "../../src/terrain/outline-store.ts";
import { placeId } from "../../src/world/outline-ids.ts";
import { PLACE_TABLE } from "../../test-support/outline-places.ts";

const TABLE = JSON.parse(readFileSync(PLACE_TABLE, "utf8")) as Record<string, string>;
const TEXAS = placeId("ne-1159315211");
const OTHER = placeId("ne-1159320937");

test("an admitted place draws, and the store is installed once (Issue #854)", () => {
  setPlaceSource(null);
  assert.throws(() => ringsOf(TEXAS), { message: `outline ${TEXAS} is not loaded` });
  const before = sourceGeneration();
  admitPlace({ id: TEXAS, text: TABLE[TEXAS] as string });
  assert.ok(ringsOf(TEXAS).length > 0, "Texas has rings once admitted");
  admitPlace({ id: OTHER, text: TABLE[OTHER] as string });
  assert.ok(ringsOf(OTHER).length > 0, "a second admitted place draws too");
  assert.ok(ringsOf(TEXAS).length > 0, "and the first still does, since the store only grows");
  assert.equal(sourceGeneration() - before, 1, "the store was installed once across two admits");
});
