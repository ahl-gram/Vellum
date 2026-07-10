import { test } from "node:test";
import assert from "node:assert/strict";
import { labelComponents } from "../../src/core/mask-components.ts";

// #120: the client's landmass labeller over the shipped land mask. A voyage leg
// whose two ports sit in different components is a genuine sea crossing.

/** '#' set, '.' clear. */
function mask(rows: string[]) {
  const h = rows.length;
  const w = rows[0]!.length;
  const m = new Uint8Array(w * h);
  rows.forEach((r, y) => [...r].forEach((c, x) => (m[x + y * w] = c === "#" ? 1 : 0)));
  return { m, w, h };
}

test("clear cells are -1", () => {
  const { m, w, h } = mask(["..", ".."]);
  const ids = labelComponents(m, w, h);
  for (const v of ids) assert.equal(v, -1);
});

test("one blob is one component", () => {
  const { m, w, h } = mask(["##.", "##.", "..."]);
  const ids = labelComponents(m, w, h);
  assert.equal(ids[0], 0);
  assert.equal(ids[1], 0);
  assert.equal(ids[0 + 1 * w], 0);
  assert.equal(ids[2], -1);
});

test("two separated blobs get distinct ids, numbered in row-major first-seen order", () => {
  const { m, w, h } = mask(["#.#", "#.#"]);
  const ids = labelComponents(m, w, h);
  assert.equal(ids[0 + 0 * w], 0);
  assert.equal(ids[0 + 1 * w], 0);
  assert.equal(ids[2 + 0 * w], 1);
  assert.equal(ids[2 + 1 * w], 1);
});

test("connectivity is 4-connected: corner-touching blobs are SEPARATE", () => {
  // This is the load-bearing choice. It matches world/landmass.ts and the drawn
  // coastline, and it is why a diagonal pinch counts as a sea crossing.
  const { m, w, h } = mask(["#.", ".#"]);
  const ids = labelComponents(m, w, h);
  assert.notEqual(ids[0 + 0 * w], ids[1 + 1 * w]);
});

test("a 4-connected diagonal staircase is ONE component", () => {
  const { m, w, h } = mask(["##.", ".##", "..#"]);
  const ids = labelComponents(m, w, h);
  const a = ids[0 + 0 * w];
  assert.equal(ids[2 + 2 * w], a);
});

test("a ring encloses a hole that is its own clear region, not part of the ring", () => {
  const { m, w, h } = mask(["###", "#.#", "###"]);
  const ids = labelComponents(m, w, h);
  assert.equal(ids[1 + 1 * w], -1);
  assert.equal(ids[0], 0);
});

test("deterministic and does not mutate the mask", () => {
  const { m, w, h } = mask(["#.#", ".#.", "#.#"]);
  const before = Uint8Array.from(m);
  const a = labelComponents(m, w, h);
  const b = labelComponents(m, w, h);
  assert.deepEqual(Array.from(a), Array.from(b));
  assert.deepEqual(Array.from(m), Array.from(before));
});

test("an all-set mask is a single component", () => {
  const { m, w, h } = mask(["###", "###"]);
  const ids = labelComponents(m, w, h);
  for (const v of ids) assert.equal(v, 0);
});

test("connectivity 8 joins corner-touching blobs into ONE component", () => {
  // Water is labelled this way, because the voyage's sea walk is 8-connected: a
  // diagonally-joined strait is one sea, not two.
  const { m, w, h } = mask(["#.", ".#"]);
  const ids = labelComponents(m, w, h, 8);
  assert.equal(ids[0 + 0 * w], ids[1 + 1 * w]);
});

test("connectivity 8 still separates genuinely disjoint blobs", () => {
  const { m, w, h } = mask(["#..#", "#..#"]);
  const ids = labelComponents(m, w, h, 8);
  assert.notEqual(ids[0], ids[3]);
});

test("connectivity defaults to 4 (land), so callers cannot silently get 8", () => {
  const { m, w, h } = mask(["#.", ".#"]);
  assert.notEqual(labelComponents(m, w, h)[0], labelComponents(m, w, h)[1 + 1 * w]);
});
