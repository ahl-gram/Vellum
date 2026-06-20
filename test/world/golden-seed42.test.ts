import { test } from "node:test";
import assert from "node:assert/strict";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";

/**
 * Golden snapshot of seed 42's IDENTITY (names + geography), pinned so the
 * #19 history work is proven additive: appending the history fork must not
 * reshuffle any earlier stream. These values intentionally change exactly
 * once, in the #17 name-screen commit, where they are updated in lockstep.
 */

function labelsChecksum(labels: Int16Array): number {
  let h = 0x811c9dc5 >>> 0;
  for (const v of labels) {
    h ^= v & 0xffff;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

test("seed 42 identity is unchanged by the history layer", () => {
  const w = generateWorld(defaultRecipe(42));
  assert.equal(w.title.title, "The Isle of Rahai");
  assert.equal(w.title.year, 1059);
  assert.equal(w.settlements[0]!.name, "Laukuwelua"); // capital
  assert.deepEqual(w.names.realms, [
    "The Nelo Atolls",
    "The Main Atolls",
    "The Mai Atolls",
  ]);
  assert.equal(w.names.sea, "The Great Puki");
  assert.equal(labelsChecksum(w.realms.labels), 2894501552);
});
