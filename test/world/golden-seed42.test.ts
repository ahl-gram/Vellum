import { test } from "node:test";
import assert from "node:assert/strict";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";

// Golden snapshot of seed 42's IDENTITY (names + geography): any reshuffle of a generation stream re-rolls it, so a checksum change here means world identity moved.
// The label checksum alone has been legitimately re-pinned by frontier changes (#79, #80, #140, #141) that reshaped only the realm partition; the roster, title, capital, and sea stayed put each time.

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
