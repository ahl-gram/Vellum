import { test } from "node:test";
import assert from "node:assert/strict";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";

// Seed 42's identity: a checksum change here means world identity moved (the label checksum alone re-pins legitimately when only the realm partition reshapes).

function labelsChecksum(labels: Int16Array): number {
  let h = 0x811c9dc5 >>> 0;
  for (const v of labels) {
    h ^= v & 0xffff;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

test("seed 42 golden identity (post #141 mountain-crests re-roll)", () => {
  const w = generateWorld(defaultRecipe(42));
  assert.equal(w.title.title, "The Isle of Rahai");
  assert.equal(w.title.year, 1059);
  assert.equal(w.settlements[0]!.name, "Laukuwelua"); // capital
  assert.deepEqual(w.names.realms, [
    "The Chiefdom of Rekekoa",
    "The Hauwaiwa Atolls",
    "The Ratoa Atolls",
  ]);
  assert.equal(w.names.sea, "The Great Woaku");
  assert.equal(labelsChecksum(w.realms.labels), 1792806240);
});
