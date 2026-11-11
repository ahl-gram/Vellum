import { test } from "node:test";
import assert from "node:assert/strict";
import { createRng } from "../../src/core/rng.ts";
import { freshPicker } from "../../src/core/fresh-pick.ts";

const SHORE = ["a", "b", "c", "d", "e"];
const RIVER = ["v", "w", "x"];

test("a fresh picker draws every item of a list once before it draws any again, and keeps each list's memory apart", () => {
  const pick = freshPicker(createRng(1314));
  const shore: string[] = [];
  const river: string[] = [];
  for (let i = 0; i < 20; i++) {
    shore.push(pick(SHORE));
    if (i % 2 === 0) river.push(pick(RIVER));
  }
  for (const [draws, list] of [
    [shore, SHORE],
    [river, RIVER],
  ] as const) {
    for (let at = 0; at + list.length <= draws.length; at += list.length) {
      const round = draws.slice(at, at + list.length);
      assert.deepEqual(
        [...round].sort(),
        [...list].sort(),
        `draws ${at} to ${at + list.length - 1} of ${list.join("")}: ${round.join("")}`,
      );
    }
  }
});
