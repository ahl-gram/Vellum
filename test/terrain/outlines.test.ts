import { test } from "node:test";
import assert from "node:assert/strict";
import { OUTLINE_RINGS } from "../../src/terrain/outlines.ts";
import { OUTLINE_IDS, type OutlineId } from "../../src/world/outline-ids.ts";

const PINNED: Readonly<Record<OutlineId, number>> = { round: 3375666475, crescent: 3293496430, ring: 3800718399 };

function checksum(rings: ReadonlyArray<ReadonlyArray<number>>): number {
  let h = 0x811c9dc5;
  for (const ring of rings) {
    for (const n of [ring.length, ...ring]) {
      h ^= n & 0xffff;
      h = Math.imul(h, 0x01000193) >>> 0;
    }
  }
  return h;
}

test("the outline roster is append-only: its IDs and each outline's rings are pinned (Issue #851)", () => {
  assert.deepEqual([...OUTLINE_IDS], ["round", "crescent", "ring"]);
  for (const id of OUTLINE_IDS) {
    assert.equal(
      checksum(OUTLINE_RINGS[id]),
      PINNED[id],
      `${id}: its stored rings changed, so a corrected shape needs a new ID`,
    );
  }
});

test("every outline sits in the ruled box, nearly edge to edge, with no repeated vertex (Issue #851)", () => {
  for (const id of OUTLINE_IDS) {
    const reach = { u: [Infinity, -Infinity], v: [Infinity, -Infinity] };
    for (const ring of OUTLINE_RINGS[id]) {
      assert.ok(
        ring.length % 2 === 0 && ring.length >= 6,
        `${id}: a ring needs an even length of at least 6, got ${ring.length}`,
      );
      const n = ring.length / 2;
      for (let i = 0; i < n; i++) {
        const u = ring[2 * i] as number;
        const v = ring[2 * i + 1] as number;
        assert.ok(u >= 60 && u <= 940 && v >= 60 && v <= 940, `${id}: vertex ${i} (${u}, ${v}) is outside 60 to 940`);
        reach.u = [Math.min(reach.u[0] as number, u), Math.max(reach.u[1] as number, u)];
        reach.v = [Math.min(reach.v[0] as number, v), Math.max(reach.v[1] as number, v)];
        const j = (i + 1) % n;
        assert.ok(u !== ring[2 * j] || v !== ring[2 * j + 1], `${id}: vertex ${i} repeats the next`);
      }
    }
    const fillsU = reach.u[0] === 60 && reach.u[1] === 940;
    const fillsV = reach.v[0] === 60 && reach.v[1] === 940;
    assert.ok(
      fillsU || fillsV,
      `${id}: reaches u ${reach.u.join(" to ")} and v ${reach.v.join(" to ")}, so fills neither axis`,
    );
  }
});
