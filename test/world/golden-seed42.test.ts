import { test } from "node:test";
import assert from "node:assert/strict";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";

/**
 * Golden snapshot of seed 42's IDENTITY (names + geography). It proved the #19
 * history work was additive (no earlier stream reshuffled), then was updated
 * once here in the #17 name-screen commit — the intended, one-time re-roll.
 * The realm names that triggered #17 ("The Main Atolls" / "The Mai Atolls")
 * are now distinct, and the geometry (realms.labels) is unchanged, since the
 * name screen never touches terrain.
 */

function labelsChecksum(labels: Int16Array): number {
  let h = 0x811c9dc5 >>> 0;
  for (const v of labels) {
    h ^= v & 0xffff;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

test("seed 42 golden identity (post #17 name re-roll)", () => {
  const w = generateWorld(defaultRecipe(42));
  assert.equal(w.title.title, "The Isle of Rahai");
  assert.equal(w.title.year, 1059);
  assert.equal(w.settlements[0]!.name, "Laukuwelua"); // capital
  assert.deepEqual(w.names.realms, [
    "The Woaku Atolls",
    "The Chiefdom of Tauwau",
    "The Chiefdom of Peroa",
  ]);
  assert.equal(w.names.sea, "The Sea of Roanono");
  // geometry is untouched by the name screen
  assert.equal(labelsChecksum(w.realms.labels), 2894501552);
});
