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
import type { Pt } from "../../src/prospect/geometry.ts";
import { SAMPLE_STEP, SY } from "../../src/prospect/birdseye/window.ts";
import { COAST_WIDTH } from "../../src/prospect/dress/birdseye-land.ts";
import { KEY_ENTRIES, planKey, withinKey, type KeyDraft } from "../../src/prospect/birdseye/names.ts";
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

const touches = (a: Pt, c: Pt, b: Box): boolean => {
  if (Math.max(a.x, c.x) < b.x0 || Math.min(a.x, c.x) > b.x1 || Math.max(a.y, c.y) < b.y0 || Math.min(a.y, c.y) > b.y1)
    return false;
  const side = (x: number, y: number): number => Math.sign((c.x - a.x) * (y - a.y) - (c.y - a.y) * (x - a.x));
  const corners = [side(b.x0, b.y0), side(b.x1, b.y0), side(b.x1, b.y1), side(b.x0, b.y1)];
  return !corners.every((s) => s > 0) && !corners.every((s) => s < 0);
};

const onLand = (b: Box, strips: ReadonlyArray<ReadonlyArray<Pt>>): boolean =>
  strips.some(
    (s) =>
      s.some((p, i) => touches(p, s[(i + 1) % s.length]!, b)) ||
      insideRing({ x: (b.x0 + b.x1) / 2, y: (b.y0 + b.y1) / 2 }, s),
  );

const onCoast = (b: Box, coast: ReadonlyArray<readonly [Pt, Pt]>): boolean => coast.some(([a, c]) => touches(a, c, b));

const inked = (b: Box, raise = 0): Box => {
  const reach = COAST_WIDTH / 2;
  return { x0: b.x0 - reach, x1: b.x1 + reach, y0: b.y0 - reach - raise, y1: b.y1 + reach - raise };
};

test("the sea's name stands clear of the land, the coast, the town, the ships, the neighbours and the key, and every harbour plate's key names its sea", () => {
  const stenernfjord = places(29).find((p) => p.index === 8)!;
  assert.ok(
    stenernfjord.input.harbor && eraFor(stenernfjord.input, stenernfjord.year) === "standing",
    "seed 29 index 8 is a standing harbour place",
  );
  let named = 0;
  let keyed = 0;
  let ruins = 0;
  for (const p of [...SEEDS.flatMap((seed) => places(seed)), stenernfjord]) {
    if (!p.input.harbor) continue;
    const era = eraFor(p.input, p.year);
    const { boxes, geometry, key } = engraveBirdseye(p.w, p.input, STYLES.antique, p.year);
    const sea = plateSurroundings(p.w, p.index, p.year).seaName;
    const where = `seed ${p.input.seed} index ${p.index}`;
    assert.ok(sea !== null && key.some((k) => k.label === sea), `${where}: the key does not name the sea`);
    if (era === "ruined") ruins++;
    if (boxes.seaName === null) {
      keyed++;
      continue;
    }
    if (era !== "standing") continue;
    named++;
    assert.ok(!onLand(inked(boxes.seaName), geometry.strips), `${where}: the sea's name lies on land`);
    assert.ok(!onCoast(inked(boxes.seaName), geometry.coast), `${where}: the sea's name touches the coast`);
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
  assert.ok(named >= 10, `at least ten harbour places draw the sea's name (${named})`);
  assert.ok(keyed >= 10, `at least ten harbour places leave the sea's name to the key (${keyed})`);
  assert.ok(ruins >= 1, `the harbour places include a ruin (${ruins})`);
  const laukuwelua = places(42).find((p) => p.index === 0)!;
  const around = plateSurroundings(laukuwelua.w, 0, laukuwelua.year);
  const own = planKey(laukuwelua.w, planTown(laukuwelua.w, 0), "capital", around.seaName, around.riverName).filter(
    (d) => d.at !== null,
  );
  assert.ok(own.length >= KEY_ENTRIES, `Laukuwelua's landmarks and gates fill the key on their own (${own.length})`);
  const full = engraveBirdseye(laukuwelua.w, laukuwelua.input, STYLES.antique, laukuwelua.year);
  assert.equal(full.boxes.seaName, null, "no water holds Laukuwelua's sea's name");
  assert.deepEqual(
    full.key.map((k) => k.label),
    [
      "The Keep",
      "The Great Church",
      "The Market",
      "The Bridges",
      "The Quay",
      "The Pong Gate",
      "The Noloatatani Gate",
      "The Great Woaku",
    ],
    "Laukuwelua's last gate gives its line to the sea",
  );
  const pelo = places(1).find((p) => p.index === 18)!;
  const seat = engraveBirdseye(pelo.w, pelo.input, STYLES.antique, pelo.year);
  assert.ok(seat.boxes.seaName !== null, "seed 1 index 18 names its sea");
  assert.ok(
    onLand(inked(seat.boxes.seaName, SAMPLE_STEP * SY), seat.geometry.strips),
    "one sample row higher seed 1 index 18's name would lie on land",
  );
});

test("a key holds at most eight lines and keeps its sea wherever the sea falls", () => {
  const gates: KeyDraft[] = Array.from({ length: 12 }, (_, i) => ({
    label: `Gate ${i}`,
    at: { x: i, y: 0 },
    of: "gate",
  }));
  const sea: KeyDraft = { label: "The Sea", at: null, of: "sea" };
  const river: KeyDraft = { label: "The River", at: null, of: "world" };
  for (let before = 0; before <= gates.length; before++) {
    const drafts = [...gates.slice(0, before), sea, river];
    const kept = withinKey(drafts).map((d) => d.label);
    const where = `${before} lines before the sea`;
    assert.equal(kept.length, Math.min(drafts.length, KEY_ENTRIES), `${where}: the key's length`);
    assert.ok(kept.includes("The Sea"), `${where}: the key names the sea`);
    const same = Math.min(before, KEY_ENTRIES - 1);
    assert.deepEqual(
      kept.slice(0, same),
      drafts.slice(0, same).map((d) => d.label),
      `${where}: the lines before the last are kept in order`,
    );
  }
  const bare = gates.slice(0, 10);
  assert.deepEqual(withinKey(bare), bare.slice(0, KEY_ENTRIES), "a key with no sea takes the plain cut");
});

test("before its founding a place has no town and no key, and a ruin keeps the ruled still's houses and no church or market", () => {
  const seed42 = places(42);
  const an400 = seed42.find((p) => p.index === 0)!;
  const early = bird(an400, 400);
  assert.equal(early.era, "before-founding");
  const around = plateSurroundings(an400.w, 0, 400);
  assert.ok(
    an400.input.harbor && around.seaName !== null && around.riverName !== null,
    "the capital has a sea and a river a key could name",
  );
  assert.equal(early.town, null, "no town before the founding");
  assert.deepEqual(early.harbour.ships, [], "no ship before the founding");
  assert.deepEqual(early.key, [], "no key before the founding");
  assert.deepEqual(
    engraveBirdseye(an400.w, an400.input, STYLES.antique, 400).boxes.key,
    [],
    "and no key panel on the plate",
  );
  const lokai = seed42.find((p) => p.index === 10)!;
  const unfounded = lokai.input.founded - 1;
  assert.equal(eraFor(lokai.input, unfounded), "before-founding", "seed 42 index 10 a year before its founding");
  assert.deepEqual(bird(lokai, unfounded).key, [], "a village before its founding has no key either");
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
  const homaitani = seed42.find((p) => p.index === 22)!;
  assert.deepEqual(
    (bird(homaitani).town?.items ?? []).flatMap((i) => (i.kind === "house" ? [{ h: i.h, window: i.window }] : [])),
    [
      { h: 2.934, window: false },
      { h: 3.356, window: false },
      { h: 2.391, window: false },
      { h: 3.708, window: true },
    ],
    "Homaitani's ruin stands the four houses the ruled still draws, at its heights and windows",
  );
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
