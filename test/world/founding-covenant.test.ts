import { test } from "node:test";
import assert from "node:assert/strict";
import { hashString } from "../../src/core/rng.ts";
import { foundWorld, type FoundingOverrides } from "../../src/world/founding/found.ts";
import { FOUNDING_VERSION, LEXICON } from "../../src/world/founding/lexicon.ts";

const LOCK =
  "until the written-world link goes public in Issue #393, a change to version 1 re-pins these values; once it is public, version 1 is locked and a change is version 2, with version 1 kept (Alex, 2026-10-09)";

type Row = readonly [sentence: string, seed: number, residual: string, overrides: FoundingOverrides];

// Seeds are hashString of the residual, worked out by hand from the rules and computed apart from foundWorld.
const SHEET: ReadonlyArray<Row> = [
  [
    "a cold archipelago of black pines, iron harbors, and a drowned kingdom",
    1858074817,
    "iron harbors kingdom",
    { band: "polar", mapType: "archipelago", culture: "norden", landFraction: 0.132 },
  ],
  ["a land of quiet towns", 3094212841, "land quiet towns", {}],
  ["a cold land of quiet towns", 3094212841, "land quiet towns", { band: "polar", culture: "norden" }],
  ["a warm land of quiet towns", 3094212841, "land quiet towns", { band: "tropical", culture: "oromi" }],
  ["a drowned land of quiet towns", 3094212841, "land quiet towns", { landFraction: 0.187 }],
  ["a vast land of quiet towns", 3094212841, "land quiet towns", { landFraction: 0.476 }],
  ["a ragged land of quiet towns", 3094212841, "land quiet towns", { coastWarp: 0.95 }],
  ["an archipelago of black pines", 2166136261, "", { mapType: "archipelago", culture: "norden" }],
  [
    "a vast frozen continent of jagged fjords, black pines and quarrelling jarls",
    1787805371,
    "quarrelling",
    { landFraction: 0.644, band: "polar", mapType: "continent", coastWarp: 0.95, culture: "norden" },
  ],
  [
    "sun-drenched atolls ringed with shrines where the old kings drowned",
    4267065727,
    "ringed shrines old kings",
    { band: "tropical", mapType: "archipelago", culture: "oromi", landFraction: 0.132 },
  ],
  ["a tropical polar waste", 3247631223, "tropical polar waste", {}],
  ["a drowned vast continent", 332158114, "drowned vast", { mapType: "continent" }],
  ["the kingdom of the long afternoon", 1129642052, "kingdom long afternoon", {}],
  ["frozen isles", 2166136261, "", { band: "polar", mapType: "archipelago", culture: "norden" }],
  [
    "drowned warm island",
    2166136261,
    "",
    { landFraction: 0.187, band: "tropical", mapType: "island", culture: "oromi" },
  ],
  ["A COLD   Archipelago!!", 2166136261, "", { band: "polar", mapType: "archipelago", culture: "norden" }],
  ["create a futuristic world", 3094864275, "create futuristic world", {}],
  ["make a world that sdfhs fhsdfhsdf dsfhds", 2679030198, "make world that sdfhs fhsdfhsdf dsfhds", {}],
  ["Poopy pants", 3265339576, "poopy pants", {}],
  ["the island\u2019s last lighthouse", 2755850715, "last lighthouse", { mapType: "island" }],
  ["cold atolls and fjords", 3930381583, "cold", { mapType: "archipelago", coastWarp: 0.95 }],
];

for (const [sentence, seed, residual, overrides] of SHEET) {
  test(`the covenant: "${sentence}" founds the world version 1 founds`, () => {
    const f = foundWorld(sentence);
    assert.ok(f.ok, sentence);
    assert.equal(f.version, FOUNDING_VERSION);
    assert.equal(f.residual, residual);
    assert.equal(f.seed, seed, LOCK);
    assert.deepEqual(f.overrides, overrides, LOCK);
  });
}

test("the covenant: every word on the list founds what version 1 founds", () => {
  const all = LEXICON.flatMap(({ phrase }) => [foundWorld(phrase), foundWorld(`${phrase} stone`)]);
  assert.equal(FOUNDING_VERSION, 1);
  assert.equal(hashString(JSON.stringify(all)), 3678728154, LOCK);
});
