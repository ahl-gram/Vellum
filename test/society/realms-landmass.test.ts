import { test } from "node:test";
import assert from "node:assert/strict";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";
import { labelLandmasses } from "../../src/world/landmass.ts";

// #79: islands are their own realms. Open water is a hard frontier; a realm never
// spans the sea; a substantial inhabited island is its own realm; small or empty
// islands attach to the nearest realm by sea route. Behaviour is exercised on the
// 320x240 production grid via generateWorld (archipelago geometry is a full-grid
// phenomenon). Seed 9 = "The Kost Archipelago" (47 landmasses), the headline case.

function landmassOf(w: ReturnType<typeof generateWorld>) {
  const { ids, sizes } = labelLandmasses(w.elev, w.seaLevel);
  const main = sizes.reduce((best, sz, id) => (sz > (sizes[best] ?? -1) ? id : best), 0);
  const width = w.elev.w;
  const lmOfCell = (i: number) => ids[i] as number;
  const seatLm = w.realms.seats.map((si) => {
    const s = w.settlements[si]!;
    return ids[s.x + s.y * width] as number;
  });
  return { ids, sizes, main, width, lmOfCell, seatLm };
}

test("#79 archipelago (seed 9) yields more than the collapsed 2 realms", () => {
  const w = generateWorld(defaultRecipe(9));
  assert.ok(
    w.realms.seats.length > 2,
    `expected >2 realms on the Kost Archipelago, got ${w.realms.seats.length}`,
  );
});

test("#79 archipelago has at least one island realm (seat off the mainland)", () => {
  const w = generateWorld(defaultRecipe(9));
  const { main, seatLm } = landmassOf(w);
  const offMainland = seatLm.filter((lm) => lm !== main);
  assert.ok(
    offMainland.length >= 1,
    `expected >=1 seat on a non-mainland landmass, all ${seatLm.length} seats are on lm#${main}`,
  );
});

test("#79 no realm spans open water: seated-landmass cells belong to a realm seated there", () => {
  const w = generateWorld(defaultRecipe(9));
  const { ids, seatLm } = landmassOf(w);
  const seated = new Set(seatLm);
  const n = w.elev.w * w.elev.h;
  for (let i = 0; i < n; i++) {
    const r = w.realms.labels[i] as number;
    if (r < 0) continue;
    const lm = ids[i] as number;
    if (seated.has(lm)) {
      assert.equal(
        seatLm[r],
        lm,
        `cell ${i} on seated landmass lm#${lm} is realm ${r} whose seat is on lm#${seatLm[r]}`,
      );
    }
  }
});

test("#79 each seatless island attaches whole to exactly one realm", () => {
  const w = generateWorld(defaultRecipe(9));
  const { ids, sizes, seatLm } = landmassOf(w);
  const seated = new Set(seatLm);
  const perLm = new Map<number, Set<number>>();
  const n = w.elev.w * w.elev.h;
  for (let i = 0; i < n; i++) {
    const lm = ids[i] as number;
    if (lm < 0 || seated.has(lm)) continue;
    const r = w.realms.labels[i] as number;
    if (r < 0) continue;
    (perLm.get(lm) ?? perLm.set(lm, new Set()).get(lm)!).add(r);
  }
  for (const [lm, realms] of perLm) {
    assert.equal(
      realms.size,
      1,
      `seatless island lm#${lm} (${sizes[lm]} cells) is split across realms ${[...realms]}`,
    );
  }
});

test("#79 seats-indexed integrity holds as realm count rises", () => {
  for (const seed of [9, 5, 42, 100]) {
    const w = generateWorld(defaultRecipe(seed));
    const { seats, labels } = w.realms;
    // (1) every seat is a valid settlement index
    for (const si of seats) {
      assert.ok(si >= 0 && si < w.settlements.length, `bad seat index ${si} (seed ${seed})`);
    }
    // (2) every label is in [-1, seats.length-1]
    for (let i = 0; i < labels.length; i++) {
      const r = labels[i] as number;
      assert.ok(r >= -1 && r < seats.length, `label ${r} out of range (seed ${seed})`);
    }
    // (3) realm id == index into the parallel arms/names arrays
    assert.equal(w.arms.length, seats.length, `arms/seat length mismatch (seed ${seed})`);
    if (seats.length > 1) {
      assert.equal(w.names.realms.length, seats.length, `names/seat length mismatch (seed ${seed})`);
    }
    // ceiling holds
    assert.ok(seats.length <= 8, `realm count ${seats.length} exceeds ceiling 8 (seed ${seed})`);
  }
});
