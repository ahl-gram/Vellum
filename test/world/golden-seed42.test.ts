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
 *
 * #79 (islands as realms) re-pinned the label checksum ONLY: seed 42's three
 * realms are subdivisions of its one mainland (every seat on it), so the roster,
 * title, capital, and sea are unchanged; the offshore islets now attach by sea
 * route instead of straight-line, which moves only their per-cell labels.
 *
 * #80 (rivers + watershed divides as frontiers) re-pinned the label checksum
 * ONLY, same shape: the three realms and every name are unchanged; the internal
 * borders now snap onto the major rivers and watershed divides that run alongside
 * them, which moves ~44 cells (0.06%) of the partition and nothing else.
 */

function labelsChecksum(labels: Int16Array): number {
  let h = 0x811c9dc5 >>> 0;
  for (const v of labels) {
    h ^= v & 0xffff;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

test("seed 42 golden identity (post #80 river/watershed-frontier re-roll)", () => {
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
  assert.equal(labelsChecksum(w.realms.labels), 2474185067);
});
