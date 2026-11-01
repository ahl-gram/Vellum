import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { foundWorld, type Founding } from "../../src/world/founding/found.ts";
import { setFoundingGazetteer } from "../../src/world/founding/shapes.ts";
import { createFounder, opensOnPlate, recipeOverrides } from "../../src/site/writing-room/founding.ts";
import { committedGazetteer, useCommittedGazetteer } from "../../test-support/founding-gazetteer.ts";

const FLAGSHIP = "a cold archipelago of black pines, iron harbors, and a drowned kingdom";
const KEPT = JSON.parse(
  readFileSync(new URL("../world/founding-sample.json", import.meta.url), "utf8"),
) as ReadonlyArray<{ sentence: string }>;

function founded(sentence: string): Founding {
  useCommittedGazetteer();
  const f = foundWorld(sentence);
  assert.ok(f.ok, sentence);
  return f;
}

test("a sentence is lettered only when a word was recognised, and is drawn from the founding's own overrides", () => {
  const flagship = founded(FLAGSHIP);
  assert.deepEqual(recipeOverrides(flagship), { ...flagship.overrides, foundingText: flagship.sentence });
  const none = founded("make a world that sdfhs fhsdfhsdf dsfhds");
  assert.deepEqual(recipeOverrides(none), none.overrides);
  assert.equal("foundingText" in recipeOverrides(none), false);
  const cancelled = founded("a tropical polar waste");
  assert.deepEqual(recipeOverrides(cancelled), { foundingText: "a tropical polar waste" });
});

test("a world opens on the vegetation plate only when the words that steered set its climate and nothing but the climate and the naming tongue", () => {
  for (const sentence of [
    "Upon the frozen roof of the world the herdsmen of Vael keep their reindeer and their grudges.",
    "Merchant republics squabble over a warm inland sea dotted with harbors, banks, galleys, and very expensive pirates.",
  ]) {
    assert.equal(opensOnPlate(founded(sentence)), true, sentence);
  }
  for (const sentence of [
    FLAGSHIP,
    "make a world that sdfhs fhsdfhsdf dsfhds",
    "a tropical polar waste",
    "tropical island in the shape of Texas",
  ]) {
    assert.equal(opensOnPlate(founded(sentence)), false, sentence);
  }
  useCommittedGazetteer();
  let count = 0;
  for (const { sentence } of KEPT) {
    const f = foundWorld(sentence);
    if (f.ok && opensOnPlate(f)) count++;
  }
  assert.equal(
    count,
    42,
    "the vegetation plate's rule moved: Issue #393 ruling 6 (comment 6550522707) set which worlds open on it",
  );
});

test("a sentence asking for a real place's shape fetches the name index once and founds again; a failed fetch is the room's own refusal; a plain sentence fetches nothing", async () => {
  const TEXAS = "tropical island in the shape of Texas";
  let calls = 0;
  const ok = () => {
    calls++;
    return Promise.resolve(committedGazetteer());
  };
  setFoundingGazetteer(null);
  const founder = createFounder(ok);
  assert.equal(founder.installed(), null);
  const texas = await founder.found(TEXAS, 1);
  assert.ok(texas.ok);
  assert.equal(texas.overrides.outline, "ne-1159315211");
  assert.equal(founder.installed()?.length, committedGazetteer().length);
  const japan = await founder.found("a land shaped like japan", 1);
  assert.ok(japan.ok);
  assert.equal(calls, 1);

  setFoundingGazetteer(null);
  const plain = await createFounder(ok).found("a cold island", 1);
  assert.ok(plain.ok);
  assert.equal(calls, 1);

  setFoundingGazetteer(null);
  const offline = createFounder(() => Promise.reject(new Error("offline")));
  assert.deepEqual(await offline.found(TEXAS, 1), { ok: false, reason: "names-unread" });

  setFoundingGazetteer(null);
  const foreign = createFounder(() =>
    Promise.resolve([...committedGazetteer(), ["ne-1159315211", "Xland", "state", "US"] as const]),
  );
  assert.deepEqual(await foreign.found(TEXAS, 1), { ok: false, reason: "names-unread" });
  assert.equal(foreign.installed(), null);
  setFoundingGazetteer(null);
});
