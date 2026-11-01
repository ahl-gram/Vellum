import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { foundWorld } from "../../src/world/founding/found.ts";
import { readWritten, writtenHash } from "../../src/site/shared/written-address.ts";
import { useCommittedGazetteer } from "../../test-support/founding-gazetteer.ts";

const KEPT = JSON.parse(
  readFileSync(new URL("../world/founding-sample.json", import.meta.url), "utf8"),
) as ReadonlyArray<{ sentence: string }>;
const AWKWARD = ["an isle where 2+2=5 & the tide is 100% #1", "Fire & Ice: a cold isle", "  spaced   out  words  "];

test("a written link carries the display sentence and its version, and founds the same world when read back", () => {
  useCommittedGazetteer();
  let read = 0;
  for (const sentence of [...KEPT.map((row) => row.sentence), ...AWKWARD]) {
    const f = foundWorld(sentence);
    if (!f.ok) continue;
    const back = readWritten(writtenHash(f.sentence, f.version));
    assert.deepEqual(back, { sentence: f.sentence, version: f.version }, sentence);
    assert.deepEqual(foundWorld(back.sentence, back.version), f, sentence);
    read++;
  }
  assert.ok(read >= AWKWARD.length + KEPT.length, "every sentence founded, so every one was read back");
});

test("a link with no version means version 1, a version that is not a whole number founds nothing, and no hash throws", () => {
  assert.deepEqual(readWritten("#found=a+cold+island"), { sentence: "a cold island", version: 1 });
  assert.equal(readWritten("found=a+cold+island&v=2")?.version, 2);
  assert.equal(readWritten("#found=x&v=abc")?.version, 0);
  for (const raw of ["0", "01", "007", "1.5", "-1", "1000000000", "9".repeat(31)]) {
    assert.equal(readWritten(`#found=x&v=${raw}`)?.version, 0, `v=${raw} is not a whole number from 1 to nine digits`);
  }
  assert.equal(readWritten("#found=x&v=999999999")?.version, 999999999);
  assert.deepEqual(foundWorld("x", 0), { ok: false, reason: "unknown-version" });
  assert.equal(readWritten("#seed=42&type=island"), null);
  assert.equal(readWritten(""), null);
  assert.notEqual(readWritten("#found=%E0%A4%A&v=1"), null);
  assert.deepEqual(readWritten("#found=&v=1"), { sentence: "", version: 1 });
});
