import { test } from "node:test";
import assert from "node:assert/strict";
import { decodeRings, encodeRings } from "../../src/terrain/outline-codec.ts";
import { OUTLINE_RINGS } from "../../src/terrain/outlines.ts";

test("a place's rings survive the text they are stored as, exactly (Issue #853)", () => {
  assert.equal(encodeRings([[830, 500, 829, 478, 828, 457]]), "m830 500l-1 -22 -1 -21z");
  const samples = [
    OUTLINE_RINGS.round,
    OUTLINE_RINGS.crescent,
    OUTLINE_RINGS.ring,
    [
      [-5, 7, 1200000, -3, 0, 0],
      [60, 60, 940, 60, 940, 940],
    ],
  ];
  for (const rings of samples) {
    assert.deepEqual(
      decodeRings(encodeRings(rings)),
      rings.map((ring) => [...ring]),
    );
  }
});

test("outline text that is not whole rings of whole points is refused, never half read (Issue #853)", () => {
  for (const text of [
    "",
    "m1 2l3 4 5 6",
    "m1 2l3 4z",
    "m1 2l3 4 5z",
    "m1 2l3 4 5 6 7z",
    "m1.5 2l3 4 5 6z",
    "x1 2l3 4 5 6z",
    "m1 2l3 4 5 6zm7 8l9z",
  ]) {
    assert.throws(() => decodeRings(text), { name: "RangeError" }, JSON.stringify(text));
  }
});
