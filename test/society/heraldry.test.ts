import { test } from "node:test";
import assert from "node:assert/strict";
import { createRng } from "../../src/core/rng.ts";
import { CULTURES } from "../../src/society/names.ts";
import {
  blazonRealms,
  obeysTinctureRule,
  isMetal,
  CULTURE_CHARGES,
  type Arms,
} from "../../src/society/heraldry.ts";

// The rule-of-tincture checker is written to re-derive validity independently
// (from isMetal + structure), NOT by re-running the generator, so the
// across-seeds sweep below is a genuine property check rather than a tautology.

test("isMetal classifies the two metals against the five colours", () => {
  assert.equal(isMetal("or"), true);
  assert.equal(isMetal("argent"), true);
  for (const c of ["gules", "azure", "sable", "vert", "purpure"] as const) {
    assert.equal(isMetal(c), false, `${c} should be a colour`);
  }
});

test("obeysTinctureRule accepts a plain field with a contrasting charge", () => {
  const armsMetalField: Arms = {
    division: "plain",
    field: ["or"],
    charge: { kind: "mobile", charge: "anchor", tincture: "azure" },
  };
  const armsColourField: Arms = {
    division: "plain",
    field: ["azure"],
    charge: { kind: "ordinary", ordinary: "bend", tincture: "or" },
  };
  assert.equal(obeysTinctureRule(armsMetalField), true);
  assert.equal(obeysTinctureRule(armsColourField), true);
});

test("obeysTinctureRule rejects metal-on-metal and colour-on-colour charges", () => {
  const metalOnMetal: Arms = {
    division: "plain",
    field: ["or"],
    charge: { kind: "mobile", charge: "anchor", tincture: "argent" },
  };
  const colourOnColour: Arms = {
    division: "plain",
    field: ["gules"],
    charge: { kind: "ordinary", ordinary: "bend", tincture: "azure" },
  };
  assert.equal(obeysTinctureRule(metalOnMetal), false);
  assert.equal(obeysTinctureRule(colourOnColour), false);
});

test("obeysTinctureRule accepts a one-metal-one-colour division with no overall charge", () => {
  const perPale: Arms = { division: "perPale", field: ["or", "azure"], charge: null };
  const quarterly: Arms = { division: "quarterly", field: ["gules", "argent"], charge: null };
  assert.equal(obeysTinctureRule(perPale), true);
  assert.equal(obeysTinctureRule(quarterly), true);
});

test("obeysTinctureRule rejects same-class divisions and charged divisions", () => {
  const twoColours: Arms = { division: "perFess", field: ["gules", "azure"], charge: null };
  const twoMetals: Arms = { division: "perBend", field: ["or", "argent"], charge: null };
  const chargedDivision: Arms = {
    division: "perPale",
    field: ["or", "azure"],
    charge: { kind: "mobile", charge: "anchor", tincture: "gules" },
  };
  assert.equal(obeysTinctureRule(twoColours), false);
  assert.equal(obeysTinctureRule(twoMetals), false);
  assert.equal(obeysTinctureRule(chargedDivision), false);
});

// Single-realm worlds (island, citystate) have one seat and an empty
// names.realms, but must still produce exactly one valid coat of arms.
test("a single-realm world still gets one valid coat of arms", () => {
  for (const culture of CULTURES) {
    const arms = blazonRealms(culture, 1, createRng(42).fork("heraldry"));
    assert.equal(arms.length, 1);
    assert.equal(obeysTinctureRule(arms[0]!), true, `${culture.id} single realm invalid`);
  }
});

test("blazonRealms is deterministic for a given seed, culture, and count", () => {
  const a = blazonRealms(CULTURES[2]!, 4, createRng(123).fork("heraldry"));
  const b = blazonRealms(CULTURES[2]!, 4, createRng(123).fork("heraldry"));
  assert.deepEqual(a, b);
});

// Per-realm forking means realm i's arms never depend on the total count,
// so adding realms never re-rolls the existing ones.
test("each realm's arms is independent of the total realm count", () => {
  const three = blazonRealms(CULTURES[1]!, 3, createRng(7).fork("heraldry"));
  const five = blazonRealms(CULTURES[1]!, 5, createRng(7).fork("heraldry"));
  assert.deepEqual(three, five.slice(0, 3));
});

test("every realm's arms obeys the rule of tincture across seeds and cultures", () => {
  for (let seed = 0; seed < 60; seed++) {
    for (const culture of CULTURES) {
      const arms = blazonRealms(culture, 5, createRng(seed).fork("heraldry"));
      for (const a of arms) {
        assert.ok(
          obeysTinctureRule(a),
          `seed ${seed} ${culture.id}: ${JSON.stringify(a)}`,
        );
      }
    }
  }
});

test("mobile charges are drawn only from the culture's own charge set", () => {
  for (const culture of CULTURES) {
    assert.ok(
      (CULTURE_CHARGES[culture.id]?.length ?? 0) > 0,
      `${culture.id} has no charge set`,
    );
  }
  for (let seed = 0; seed < 60; seed++) {
    for (const culture of CULTURES) {
      const arms = blazonRealms(culture, 5, createRng(seed).fork("heraldry"));
      for (const a of arms) {
        if (a.charge?.kind === "mobile") {
          assert.ok(
            CULTURE_CHARGES[culture.id]!.includes(a.charge.charge),
            `${culture.id} drew a foreign charge: ${a.charge.charge}`,
          );
        }
      }
    }
  }
});
