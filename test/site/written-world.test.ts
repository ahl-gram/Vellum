import { test } from "node:test";
import assert from "node:assert/strict";
import { foundWorld, type Founding } from "../../src/world/founding/found.ts";
import { setFoundingGazetteer } from "../../src/world/founding/shapes.ts";
import { createFounder, recipeOverrides } from "../../src/site/shared/founding.ts";
import { writtenHash } from "../../src/site/shared/written-address.ts";
import { foundAddress, heldFor, type WrittenWorld } from "../../src/site/shared/written-world.ts";
import { holdWritten, writtenFor, writtenNow } from "../../src/site/explorer/written-hold.ts";
import { committedGazetteer, useCommittedGazetteer } from "../../test-support/founding-gazetteer.ts";

const FLAGSHIP = "a cold archipelago of black pines, iron harbors, and a drowned kingdom";
const TEXAS = "tropical island in the shape of Texas";

test("a hash carrying a founding sentence names its founded world; a hash with no sentence, a refused one or an unreadable name list names none", async () => {
  setFoundingGazetteer(null);
  const founder = createFounder(() => Promise.resolve(committedGazetteer()));
  useCommittedGazetteer();
  const flagship = foundWorld(FLAGSHIP) as Founding;
  assert.deepEqual(await foundAddress(writtenHash(FLAGSHIP, 1) + "&style=ink", founder), {
    sentence: FLAGSHIP,
    version: 1,
    seed: 1858074817,
    overrides: recipeOverrides(flagship),
  });
  assert.equal(await foundAddress("#seed=42&style=ink", founder), null);
  assert.equal(await foundAddress(writtenHash("x".repeat(121), 1), founder), null);
  assert.equal(await foundAddress(writtenHash(FLAGSHIP, 2), founder), null);
  setFoundingGazetteer(null);
  assert.equal((await foundAddress(writtenHash(TEXAS, 1), founder))?.overrides.outline, "ne-1159315211");
  setFoundingGazetteer(null);
  const offline = createFounder(() => Promise.reject(new Error("offline")));
  assert.equal(await foundAddress(writtenHash(TEXAS, 1), offline), null);
  setFoundingGazetteer(null);
});

const world = (seed: number): WrittenWorld => ({ sentence: FLAGSHIP, version: 1, seed, overrides: {} });

test("a written world holds only its own chart number", () => {
  const w = world(1858074817);
  assert.equal(heldFor(w, w.seed), w);
  assert.equal(heldFor(w, w.seed + 1), null);
  assert.equal(heldFor(null, 5), null);
});

test("the Explorer lets a written world go at a new chart number and never takes it back", () => {
  const w = world(1858074817);
  holdWritten(w);
  assert.equal(writtenFor(w.seed), w);
  assert.equal(writtenNow(), w);
  assert.equal(writtenFor(w.seed + 1), null);
  assert.equal(writtenFor(w.seed), null);
  assert.equal(writtenNow(), null);
  holdWritten(null);
});
