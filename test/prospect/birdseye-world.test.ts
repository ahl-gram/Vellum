import { test } from "node:test";
import assert from "node:assert/strict";
import { STYLES } from "../../src/render/style.ts";
import { buildProspectInput } from "../../src/prospect/input.ts";
import { eraFor } from "../../src/prospect/caption.ts";
import { plateSurroundings } from "../../src/prospect/surroundings.ts";
import { sampleBilinear } from "../../src/prospect/transect.ts";
import { planTown } from "../../src/prospect/town-plan/plan.ts";
import { insideRing } from "../../src/prospect/town-plan/geom.ts";
import { composeBirdseye } from "../../src/prospect/birdseye/compose.ts";
import { BIRDSEYE_LIMIT_KB, engraveBirdseye, utf8Bytes } from "../../src/prospect/birdseye/plate.ts";
import type { Box, TownItem } from "../../src/prospect/birdseye/types.ts";
import { firstTownsByRoad } from "../../test-support/road-walk.ts";
import { worldFor } from "../../test-support/seed-worlds.ts";

const SEEDS = [1, 7, 42] as const;
// 2026-11-26: every wall vertex of seeds 1 to 40 and 42 swept at 184d7079; the lowest stands 1.421e-4 below the sea (seed 20 index 1, a seat, as Issue #793 call 10 records), so 0.001 leaves seven times that.
const WALL_SINK = 0.001;

const places = (seed: number) => {
  const w = worldFor(seed);
  return w.settlements.flatMap((_, index) => {
    const input = buildProspectInput(w, index);
    return input.kind === "hamlet" ? [] : [{ w, index, input, year: w.title.year }];
  });
};

const bird = (p: ReturnType<typeof places>[number], year = p.year) =>
  composeBirdseye(p.w, p.input, year, plateSurroundings(p.w, p.index, year));

test("every house, gate, road and ship the bird's-eye draws stands where the ground says", () => {
  const seen = { houses: 0, roads: 0, gates: 0, walls: 0, ships: 0 };
  for (const seed of SEEDS) {
    for (const p of places(seed)) {
      const g = bird(p);
      const height = (q: { x: number; y: number }): number => sampleBilinear(p.w.elev, q.x, q.y) - p.w.seaLevel;
      const where = `seed ${seed} index ${p.index}`;
      for (const item of g.town?.items ?? []) {
        if (item.kind !== "house") continue;
        seen.houses++;
        assert.ok(height(item.grid) > 0, `${where}: a house stands on the sea`);
      }
      for (const way of g.roads)
        for (const q of way.grid) {
          seen.roads++;
          assert.ok(height(q) > 0, `${where}: a road runs under the sea`);
        }
      for (const q of g.town?.wall?.gateGrid ?? []) {
        seen.gates++;
        assert.ok(height(q) > 0, `${where}: a gate stands on the sea`);
      }
      for (const q of g.town?.wall?.grid ?? []) {
        seen.walls++;
        assert.ok(height(q) >= -WALL_SINK, `${where}: a wall vertex sinks past ${WALL_SINK}`);
      }
      for (const ship of g.harbour.ships) {
        seen.ships++;
        assert.ok(height(ship.grid) < 0, `${where}: a ship rides on land`);
      }
    }
  }
  for (const [what, n] of Object.entries(seen)) assert.ok(n > 0, `the three seeds draw ${what}`);
  const seat = places(20).find((p) => p.index === 1)!;
  const dips = (bird(seat).town?.wall?.grid ?? []).map((q) => sampleBilinear(seat.w.elev, q.x, q.y) - seat.w.seaLevel);
  assert.ok(Math.min(...dips) < 0, "seed 20 index 1's wall has a vertex under the sea, so the allowance is needed");
  assert.ok(Math.min(...dips) >= -WALL_SINK, "and the allowance holds it");
});

const sq = (a: { x: number; y: number }, b: { x: number; y: number }): number => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;

const townsBeyondEachGate = (p: ReturnType<typeof places>[number]): Array<Set<number>> => {
  const plan = planTown(p.w, p.index);
  const wall = plan.wall!;
  const distinct: (typeof plan.gates)[number][] = [];
  for (const gate of plan.gates) if (!distinct.some((d) => sq(d.at, gate.at) < 0.25 * 0.25)) distinct.push(gate);
  const inside = new Set<number>();
  for (const road of p.w.roads)
    for (const q of road.points) if (insideRing(q, wall)) inside.add(q.x + q.y * p.w.elev.w);
  return distinct.map((gate) => {
    const outside = p.w.roads[gate.road]!.points.filter((q) => !insideRing(q, wall));
    const start = outside.sort((a, b) => sq(a, gate.at) - sq(b, gate.at))[0];
    return start === undefined ? new Set<number>() : firstTownsByRoad(p.w, p.index, start, inside);
  });
};

test("a gate is named for the first town its road reaches", () => {
  let entries = 0;
  for (const seed of SEEDS) {
    for (const p of places(seed)) {
      if (eraFor(p.input, p.year) !== "standing" || planTown(p.w, p.index).wall === null) continue;
      const named = bird(p).key.filter((k) => k.label.endsWith(" Gate"));
      const gated = townsBeyondEachGate(p).filter((r) => r.size > 0);
      const where = `seed ${seed} index ${p.index}`;
      assert.ok(named.length <= gated.length, `${where}: more gate entries than gates that reach a town`);
      entries += named.length;
      const labels = named.map((k, i) => ({
        label: k.label,
        towns: [...gated[i]!].map((t) => `The ${p.w.settlements[t]!.name} Gate`),
      }));
      for (const { label, towns } of labels)
        assert.ok(towns.includes(label), `${where}: ${label} is not among ${towns.join(", ")}`);
    }
  }
  assert.ok(entries >= 10, `the three seeds name at least ten gates (${entries})`);
});

const meets = (a: Box, b: Box): boolean =>
  Math.min(a.x1, b.x1) > Math.max(a.x0, b.x0) && Math.min(a.y1, b.y1) > Math.max(a.y0, b.y0);

test("the sea's name stands clear of the town, the ships, the neighbours and the key", () => {
  let named = 0;
  for (const seed of SEEDS) {
    for (const p of places(seed)) {
      if (!p.input.harbor || eraFor(p.input, p.year) !== "standing") continue;
      const { boxes } = engraveBirdseye(p.w, p.input, STYLES.antique, p.year);
      if (boxes.seaName === null) continue;
      named++;
      const where = `seed ${seed} index ${p.index}`;
      const others: ReadonlyArray<readonly [string, ReadonlyArray<Box>]> = [
        ["town", boxes.town === null ? [] : [boxes.town]],
        ["a ship", boxes.ships],
        ["a neighbour", boxes.names],
        ["the key", boxes.key],
        ["the bank", [boxes.bank]],
      ];
      for (const [what, list] of others)
        for (const b of list) assert.ok(!meets(boxes.seaName, b), `${where}: the sea's name meets ${what}`);
    }
  }
  assert.ok(named >= 10, `at least ten harbour places draw the sea's name (${named})`);
});

test("before its founding a place has no town, and a ruin keeps no church or market and fewer houses", () => {
  const an400 = places(42).find((p) => p.index === 0)!;
  const early = bird(an400, 400);
  assert.equal(early.era, "before-founding");
  assert.equal(early.town, null, "no town before the founding");
  assert.deepEqual(early.harbour.ships, [], "no ship before the founding");
  assert.ok(early.key.length > 0, "the key still names the sea and the river");
  assert.ok(
    early.key.every((k) => k.x === null),
    "and points at nothing",
  );
  const houses = (items: ReadonlyArray<TownItem> | undefined): number =>
    (items ?? []).filter((i) => i.kind === "house").length;
  let ruins = 0;
  for (const seed of SEEDS) {
    for (const p of places(seed)) {
      if (eraFor(p.input, p.year) !== "ruined") continue;
      ruins++;
      const before = p.input.ruinedYear! - 1;
      const where = `seed ${seed} index ${p.index}`;
      assert.equal(eraFor(p.input, before), "standing", `${where}: standing the year before its ruin`);
      const kept = bird(p).town?.items ?? [];
      const whole = bird(p, before).town?.items ?? [];
      assert.ok(houses(whole) > 0, `${where}: it had houses`);
      assert.ok(
        whole.some((i) => i.kind === "church" || i.kind === "market"),
        `${where}: it had a church or a market`,
      );
      assert.ok(!kept.some((i) => i.kind === "church" || i.kind === "market"), `${where}: the ruin keeps neither`);
      assert.ok(
        houses(kept) < houses(whole),
        `${where}: the ruin keeps fewer houses (${houses(kept)} of ${houses(whole)})`,
      );
    }
  }
  assert.equal(ruins, 6, "seeds 1, 7 and 42 hold six ruins");
});

test("no bird's-eye passes its limit, and the heaviest stands as many houses as fit", () => {
  const limit = BIRDSEYE_LIMIT_KB * 1024;
  const world78 = worldFor(78);
  const input78 = buildProspectInput(world78, 0);
  assert.equal(input78.kind, "capital");
  const year78 = world78.title.year;
  const whole = { ink: STYLES.ink, antique: STYLES.antique };
  for (const [dress, style] of Object.entries(whole)) {
    const full = engraveBirdseye(world78, input78, style, year78, { share: 1 });
    assert.ok(utf8Bytes(full.svg) > limit, `seed 78's capital in ${dress}, every house standing, passes the limit`);
    const p = engraveBirdseye(world78, input78, style, year78);
    assert.ok(utf8Bytes(p.svg) <= limit, `seed 78 ${dress} is held to the limit`);
    assert.ok(p.standing < p.houses, `seed 78 ${dress} stands fewer houses than it has (${p.standing} of ${p.houses})`);
    const deeper = engraveBirdseye(world78, input78, style, year78, { share: (Math.round(p.share * 20) + 1) / 20 });
    assert.ok(
      utf8Bytes(deeper.svg) > limit,
      `seed 78 ${dress} one step fuller passes the limit, so the thinning is no deeper than it must be`,
    );
  }
  const world42 = worldFor(42);
  for (const index of [0, 10]) {
    const p = engraveBirdseye(world42, buildProspectInput(world42, index), STYLES.ink, world42.title.year);
    assert.ok(utf8Bytes(p.svg) <= limit, `seed 42 index ${index} is under the limit`);
    assert.ok(
      p.houses > 0 && p.standing === p.houses,
      `seed 42 index ${index} stands every house (${p.standing} of ${p.houses})`,
    );
  }
});
