import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildRoster } from "../../scripts/outlines/build.ts";
import {
  KIT_README,
  PLACE_IDS,
  PLACE_NAMES,
  PLACE_TABLE,
  readKit,
  readKitFiles,
  readmeText,
} from "../../scripts/outlines/kit.ts";
import { decodeRings } from "../../src/terrain/outline-codec.ts";

const ID = /^ne-[1-9][0-9]*$/;
const table = (): Record<string, string> => JSON.parse(readFileSync(PLACE_TABLE, "utf8")) as Record<string, string>;

function rosterChecksum(places: Readonly<Record<string, string>>): number {
  let h = 0x811c9dc5;
  const fold = (n: number): void => {
    h ^= n & 0xffff;
    h = Math.imul(h, 0x01000193) >>> 0;
  };
  for (const id of Object.keys(places).sort()) {
    for (let i = 0; i < id.length; i++) fold(id.charCodeAt(i));
    const rings = decodeRings(places[id]!);
    fold(rings.length);
    for (const ring of rings) for (const n of [ring.length, ...ring]) fold(n);
  }
  return h;
}

test("the committed place table, ID list, name index and the kit's README are exactly what npm run outlines builds from the kit's extracts (Issue #853)", () => {
  const roster = buildRoster(readKit());
  for (const [path, built] of [
    [PLACE_TABLE, roster.table],
    [PLACE_IDS, roster.idsModule],
    [PLACE_NAMES, roster.names],
    [KIT_README, readmeText(readKitFiles())],
  ] as const)
    assert.equal(readFileSync(path, "utf8"), built, `${path} is stale or hand-edited: run npm run outlines -- build`);
});

test("every one of the 5,646 places carries Natural Earth's serial number as its ID, and no two share one (Issue #853, ruling 3)", () => {
  const ids = readKit().flatMap(([, places]) => places.map((p) => p.id));
  assert.equal(ids.length, 5646);
  for (const id of ids) assert.match(id, ID);
  assert.equal(new Set(ids).size, 5646);
  assert.deepEqual(Object.keys(table()), [...ids].sort());
});

test("every place in the kit is counted to the extract run that added it, and every run names its file's size and checksum (Issue #853)", () => {
  for (const [kind, kit] of readKitFiles()) {
    assert.ok(kit.runs.length > 0, `${kind}.json records no run`);
    assert.equal(
      kit.runs.reduce((n, r) => n + r.added, 0),
      kit.places.length,
      `${kind}.json: its runs added ${kit.runs.map((r) => r.added).join(" + ")} places, and it holds ${kit.places.length}`,
    );
    for (const r of kit.runs) {
      assert.match(r.sha256, /^[0-9a-f]{64}$/, `${kind}.json: a run without a checksum`);
      assert.ok(
        Number.isInteger(r.bytes) && r.bytes > 0 && r.added > 0,
        `${kind}.json: a run of ${r.bytes} bytes adding ${r.added}`,
      );
      assert.match(r.extracted, /^\d{4}-\d{2}-\d{2}$/, `${kind}.json: a run on ${r.extracted}`);
    }
  }
});

test("the place roster is append-only: its count and a checksum over every ID and its rings are pinned (Issue #853)", () => {
  const places = table();
  assert.equal(
    Object.keys(places).length,
    5646,
    "a place was added or lost: update the count and the checksum together",
  );
  assert.equal(
    rosterChecksum(places),
    999843902,
    "the roster changed: an append updates the count and this checksum, and a changed outline takes a new ID (D4)",
  );
});

test("every place sits on the thousandths grid in the ruled box, fills it on one axis, and repeats no vertex (Issue #853)", () => {
  for (const [id, text] of Object.entries(table())) {
    assert.match(id, ID);
    assert.ok(!["round", "crescent", "ring"].includes(id), `${id} shadows a form`);
    let lowest = Infinity,
      highest = -Infinity,
      leftmost = Infinity,
      rightmost = -Infinity;
    for (const ring of decodeRings(text)) {
      assert.ok(ring.length >= 6 && ring.length % 2 === 0, `${id}: a ring of ${ring.length} numbers`);
      for (let i = 0; i < ring.length; i += 2) {
        const [u, v] = [ring[i]!, ring[i + 1]!];
        assert.ok(Number.isInteger(u) && Number.isInteger(v), `${id}: ${u},${v} is not a whole thousandth`);
        assert.ok(u >= 60 && u <= 940 && v >= 60 && v <= 940, `${id}: ${u},${v} is outside the box`);
        const next = (i + 2) % ring.length;
        assert.ok(u !== ring[next] || v !== ring[next + 1], `${id}: vertex ${i / 2} repeats its next`);
        leftmost = Math.min(leftmost, u);
        rightmost = Math.max(rightmost, u);
        lowest = Math.min(lowest, v);
        highest = Math.max(highest, v);
      }
    }
    assert.ok(
      (leftmost === 60 && rightmost === 940) || (lowest === 60 && highest === 940),
      `${id} does not fill the box`,
    );
  }
});

test("the name index names every place, by kind, and leads from the names a reader types to their IDs (Issue #853)", () => {
  const names = JSON.parse(readFileSync(PLACE_NAMES, "utf8")) as Array<[string, string, string, string]>;
  assert.deepEqual(
    names.map((row) => row[0]),
    Object.keys(table()),
  );
  const tally: Record<string, number> = {};
  for (const row of names) tally[row[2]] = (tally[row[2]] ?? 0) + 1;
  assert.deepEqual(tally, { country: 258, lake: 745, state: 4596, unit: 47 });
  const named = (name: string, kind: string) => names.find((row) => row[1] === name && row[2] === kind);
  assert.deepEqual(named("Texas", "state"), ["ne-1159315211", "Texas", "state", "United States of America"]);
  assert.deepEqual(named("Hokkaidō", "state"), ["ne-1159309533", "Hokkaidō", "state", "Japan"]);
  assert.deepEqual(named("England", "unit"), ["ne-1159320743", "England", "unit", "United Kingdom"]);
  assert.deepEqual(named("Lake Superior", "lake"), ["ne-1159112991", "Lake Superior", "lake", ""]);
  assert.deepEqual(named("France", "country"), ["ne-1159320637", "France", "country", ""]);
});
