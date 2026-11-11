import assert from "node:assert/strict";
import { test } from "node:test";
import { RESTAGES, withStyle, witnessProbe } from "../../scripts/still-judge/restage.ts";
import { reaskedOf, shotsOf, stillsOf } from "../../scripts/still-judge/trial-set.ts";
import { RAIN, SHEET } from "../../test-support/still-judge-fixtures.ts";

const CLIP = { x: 286, y: 486, width: 600, height: 400 };

test("each seed gives seven stills from six sheets, in the trial's order and under the trial's names", () => {
  const { files, stills } = stillsOf(1, SHEET, RAIN);
  assert.deepEqual(
    stills.map((s) => [s.kind, s.arm, s.svg, s.png]),
    [
      ["sheet", "clean", "1-sheet-clean.svg", "stills/1-sheet-clean.png"],
      ["rainfall", "clean", "1-rain-clean.svg", "stills/1-rainfall-clean.png"],
      ["rainfall", "rain-faint", "1-rain-rain-faint.svg", "stills/1-rainfall-rain-faint.png"],
      ["sheet", "realm-faint", "1-sheet-realm-faint.svg", "stills/1-sheet-realm-faint.png"],
      ["crop", "range-thin", "1-sheet-range-thin.svg", "stills/1-crop-range-thin.png"],
      ["sheet", "title-small", "1-sheet-title-small.svg", "stills/1-sheet-title-small.png"],
      ["crop", "clean", "1-sheet-clean.svg", "stills/1-crop-clean.png"],
    ],
  );
  assert.deepEqual(
    files.map((f) => f.name),
    [
      "1-sheet-clean.svg",
      "1-rain-clean.svg",
      "1-rain-rain-faint.svg",
      "1-sheet-realm-faint.svg",
      "1-sheet-range-thin.svg",
      "1-sheet-title-small.svg",
    ],
  );
  const text = (name: string): string => files.find((f) => f.name === name)!.text;
  assert.equal(text("1-rain-rain-faint.svg"), withStyle(RAIN, RESTAGES[0]!.css));
  assert.equal(text("1-sheet-realm-faint.svg"), withStyle(SHEET, RESTAGES[1]!.css));
  assert.equal(text("1-sheet-range-thin.svg"), withStyle(SHEET, RESTAGES[2]!.css));
  assert.equal(text("1-sheet-title-small.svg"), withStyle(SHEET, RESTAGES[3]!.css));
  assert.equal(text("1-sheet-clean.svg"), SHEET);
  assert.equal(text("1-rain-clean.svg"), RAIN);
});

test("a crop still is clipped around the range name, a restaged still carries its witness, and a clean one carries neither", () => {
  const { files, stills } = stillsOf(1, SHEET, RAIN);
  const shots = shotsOf("/o", stills, new Map(files.map((f) => [f.name, f.text])));
  assert.equal(shots.length, 7);
  assert.deepEqual(shots[0], {
    url: "/1-sheet-clean.svg",
    width: 1500,
    height: 1158,
    mobile: false,
    out: "/o/stills/1-sheet-clean.png",
    waitMs: 200,
  });
  assert.equal(shots[2]!.probe, witnessProbe(RESTAGES[0]!));
  assert.equal("clip" in shots[2]!, false);
  assert.deepEqual(shots[4]!.clip, CLIP);
  assert.equal(shots[4]!.probe, witnessProbe(RESTAGES[2]!));
  assert.equal(shots[5]!.probe, witnessProbe(RESTAGES[3]!));
  assert.equal("clip" in shots[5]!, false);
  assert.deepEqual(shots[6]!.clip, CLIP);
  assert.equal("probe" in shots[6]!, false);
});

test("only the clean stills of the first seeds are asked twice", () => {
  const stills = [5, 9].flatMap((seed) => stillsOf(seed, SHEET, RAIN).stills);
  const again = reaskedOf(stills, [5, 9], 1);
  assert.equal(again.length, 3);
  assert.ok(again.every((s) => s.seed === 5 && s.arm === "clean"));
  assert.deepEqual(
    again.map((s) => s.kind),
    ["sheet", "rainfall", "crop"],
  );
});
