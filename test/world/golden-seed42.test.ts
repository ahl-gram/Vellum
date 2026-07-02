import { test } from "node:test";
import assert from "node:assert/strict";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";

/**
 * Golden snapshot of seed 42's IDENTITY (names + geography). It proved the #19
 * history work was additive (no earlier stream reshuffled), was updated once in
 * the #17 name-screen commit, again when coastline domain-warp landed, and again
 * for #74 wind-driven moisture: rainfall now follows world.winds, so rivers,
 * biomes, settlements, and every downstream name re-rolled. Title/year/capital
 * are drawn before terrain settles and stayed put.
 */

function labelsChecksum(labels: Int16Array): number {
  let h = 0x811c9dc5 >>> 0;
  for (const v of labels) {
    h ^= v & 0xffff;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

test("seed 42 golden identity (post #74 orographic-moisture re-roll)", () => {
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
  assert.equal(labelsChecksum(w.realms.labels), 778853820);
});
