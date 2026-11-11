import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { MODEL } from "../../scripts/jev/system-one.ts";
import { ABOUT, isKind, KINDS, referenceOf, requestFor, SLOT, type Kind } from "../../scripts/still-judge/questions.ts";
import { pngHeader } from "../../test-support/still-judge-fixtures.ts";

const png = pngHeader(1500, 1158);

test("a still's request carries its image once, under a reference its state names and no question repeats", () => {
  const ref = "still-9794a67357f621b9";
  for (const kind of KINDS) {
    const req = requestFor(kind, png);
    assert.deepEqual(Object.keys(req.assets!), [ref], kind);
    assert.deepEqual(req.state, { [SLOT[kind]]: ref, about: ABOUT[kind] }, kind);
    assert.equal(JSON.stringify(req.questions).includes(ref), false, kind);
    const asset = req.assets![ref]!;
    assert.ok(Buffer.from(asset.data_base64, "base64").equals(png), kind);
    assert.equal(asset.type, "image");
    assert.equal(asset.format, "png");
    assert.equal(req.model, MODEL);
  }
  assert.notEqual(referenceOf(pngHeader(1500, 1159)), ref);
});

test("each kind asks its own questions, in the trial's order and word for word", () => {
  const keys: Record<Kind, string[]> = {
    sheet: ["realm_names_read", "title_reads_first"],
    rainfall: ["realm_names_read", "rain_lines_lead", "title_reads_first"],
    crop: ["names_read"],
  };
  const hashes: Record<Kind, string> = {
    sheet: "f29c6bba76ab1f1c38acdc919433db8456d8f1ba622009610801ee27f4197e65",
    rainfall: "eea5bf8d4feebf4de85cbdba74e3338b97243f22c51fdc0c36c28bd42fd8f39a",
    crop: "398d3648f87e0f6546561efdbfd278091b6aed2ed6182fc21a91a542ab4b6482",
  };
  for (const kind of KINDS) {
    const request = requestFor(kind, png);
    assert.deepEqual(Object.keys(request.questions), keys[kind], kind);
    assert.equal(createHash("sha256").update(JSON.stringify(request)).digest("hex"), hashes[kind], kind);
  }
});

test("a kind is one of the three words, and nothing else", () => {
  for (const word of ["sheet", "rainfall", "crop"]) assert.equal(isKind(word), true, word);
  for (const word of ["page", ""]) assert.equal(isKind(word), false, word);
});
