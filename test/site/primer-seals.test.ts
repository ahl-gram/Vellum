import test from "node:test";
import assert from "node:assert/strict";
import {
  clearSeals,
  emitSeals,
  parseSeals,
  PRIMER_STORE_KEY,
  readSeals,
  writeSeal,
} from "../../src/site/shared/primer/seals.ts";
import { asStorage, FakeStore, shut } from "../../test-support/fake-store.ts";

test("PS1 the seal store reads, writes once and clears the Primer's own key, against the storage it is given (Issue #1155 N1)", () => {
  const fake = new FakeStore({ [PRIMER_STORE_KEY]: "explorer-dice", "vellum.table.v1": "T", "vellum.hunt.v1": "H" });
  assert.deepEqual([...readSeals(asStorage(fake))], ["explorer-dice"]);

  writeSeal(asStorage(fake), "explorer-draw");
  writeSeal(asStorage(fake), "explorer-draw");
  assert.equal(fake.held[PRIMER_STORE_KEY], "explorer-dice,explorer-draw");
  assert.equal(
    fake.calls.filter((c) => c === `set ${PRIMER_STORE_KEY}`).length,
    1,
    "a step already sealed is not written again",
  );

  const before = fake.calls.length;
  writeSeal(asStorage(fake), "Not An Id");
  assert.equal(fake.calls.length, before, "an id that is not a step id touches nothing");

  clearSeals(asStorage(fake));
  assert.deepEqual(fake.held, { "vellum.table.v1": "T", "vellum.hunt.v1": "H" });
  assert.equal(fake.calls.at(-1), `remove ${PRIMER_STORE_KEY}`);

  assert.deepEqual([...parseSeals("a,,B!,b-2")], ["a", "b-2"]);
  assert.equal(emitSeals(["a", "b"]), "a,b");

  assert.deepEqual([...readSeals(shut)], []);
  assert.doesNotThrow(() => writeSeal(shut, "explorer-dice"));
  assert.doesNotThrow(() => clearSeals(shut));
});
