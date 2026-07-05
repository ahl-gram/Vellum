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
 *
 * #140 (major rivers as hard flood frontiers) re-pinned the label checksum ONLY,
 * same shape: the three realms and every name are unchanged. Major rivers are now
 * a barrier the realm flood cannot cross, so a border falls ON the river where two
 * realms meet across it. Reshaped the partition, 2474185067 -> 1087747788.
 *
 * #141 (mountain crests as hard flood frontiers) re-pinned the label checksum ONLY,
 * same shape: the three realms and every name are unchanged. Large mountain crests
 * (elevation-gated watershed divides) now join major rivers as a barrier the realm
 * flood cannot cross, and #80's border snap -- fully superseded by the two hard
 * frontiers -- is removed. Reshapes the partition, 1087747788 -> 1792806240, and
 * nothing else. (Seed 42's atoll realms reshape here from the added crest barrier
 * and the removed #80 snap alike; the frontier upgrade simply reads far more on
 * mountainous continents like seed 1889814795, where borders visibly trace ranges.)
 */

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
