import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { foundWorld, type Founding } from "../../src/world/founding/found.ts";
import { setFoundingGazetteer } from "../../src/world/founding/shapes.ts";
import { createFounder, recipeOverrides } from "../../src/site/shared/founding.ts";
import { writtenHash } from "../../src/site/shared/written-address.ts";
import {
  foundAddress,
  heldFor,
  identityParams,
  writtenParams,
  type WrittenWorld,
} from "../../src/site/shared/written-world.ts";
import { holdWritten, writtenFor, writtenNow } from "../../src/site/explorer/written-hold.ts";
import { overridesOfLand, readWorldKeys } from "../../src/site/shared/address-grammar.ts";
import { committedGazetteer, useCommittedGazetteer } from "../../test-support/founding-gazetteer.ts";

const FLAGSHIP = "a cold archipelago of black pines, iron harbors, and a drowned kingdom";
const TEXAS = "tropical island in the shape of Texas";
const KEPT = JSON.parse(
  readFileSync(new URL("../world/founding-sample.json", import.meta.url), "utf8"),
) as ReadonlyArray<{ sentence: string }>;

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

test("a written world's link leads with its sentence and version, drops every identity key and keeps every other key in order, and a link with no sentence is left as it is", () => {
  const p = new URLSearchParams(
    "seed=5&style=ink&type=island&band=polar&land=300&coast=40&outline=ne-1159315211&looseness=50&islands=20&isleSize=varied&raggedness=10&theme=vegetation&legend=1&cx=0.5000&cy=0.5000&k=2.0000&survey=&table=k-s.seed-1",
  );
  assert.equal(
    writtenParams(p, { sentence: FLAGSHIP, version: 1 }).toString(),
    new URLSearchParams([
      ["found", FLAGSHIP],
      ["v", "1"],
      ["style", "ink"],
      ["theme", "vegetation"],
      ["legend", "1"],
      ["cx", "0.5000"],
      ["cy", "0.5000"],
      ["k", "2.0000"],
      ["survey", ""],
      ["table", "k-s.seed-1"],
    ]).toString(),
  );
  assert.equal(writtenParams(p, null), p);
  assert.equal(
    writtenParams(new URLSearchParams("found=old&v=1&style=ink"), { sentence: "new", version: 1 }).toString(),
    "found=new&v=1&style=ink",
  );
});

test("a written world's settings seat as the ordinary keys the Explorer's controls read, exactly, for every sentence of the founding sample", () => {
  useCommittedGazetteer();
  let seated = 0;
  let landed = 0;
  for (const row of KEPT) {
    const f = foundWorld(row.sentence);
    if (!f.ok) continue;
    const p = identityParams(new URLSearchParams("found=x&v=1&style=ink&theme=climate"), f.seed, f.overrides);
    const k = readWorldKeys(p);
    assert.equal(k.seed, f.seed, row.sentence);
    const want = Object.fromEntries(Object.entries(f.overrides).filter(([key]) => key !== "culture"));
    assert.deepEqual(
      {
        ...(k.type !== null ? { mapType: k.type } : {}),
        ...(k.band !== null ? { band: k.band } : {}),
        ...overridesOfLand(k),
      },
      want,
      row.sentence,
    );
    assert.equal(p.get("style"), "ink");
    assert.equal(p.get("theme"), "climate");
    assert.equal(p.has("found"), false);
    assert.equal(p.has("v"), false);
    seated++;
    if (f.overrides.landFraction !== undefined) landed++;
  }
  assert.equal(seated, KEPT.length);
  assert.ok(landed > 0, "the sample holds a sentence that sets the sea level");
});
