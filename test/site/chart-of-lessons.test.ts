import { test } from "node:test";
import assert from "node:assert/strict";
import { PLACES, ROADS } from "../../src/layouts/atelier-chart.ts";
import { RING_FLOOR, SLOT_ARC, chartOfLessons, ringOf, seat, type Box } from "../../src/layouts/chart-of-lessons.ts";
import { primerPage } from "../../src/site/primer/page.ts";

const rooms = primerPage().rooms;
const stepsOf = (room: (typeof rooms)[number]): string[] => room.lessons.flatMap((l) => l.steps.map((s) => s.id));
const taught = (): ReturnType<typeof chartOfLessons> => chartOfLessons(rooms);

const PAD = 1.5;
const meets = (a: Box, b: Box): boolean =>
  a.x < b.x + b.w + PAD && b.x < a.x + a.w + PAD && a.y < b.y + b.h + PAD && b.y < a.y + a.h + PAD;

const lessonsOfSizes = (...sizes: number[]): { steps: { id: string }[] }[] =>
  sizes.map((n, k) => ({ steps: Array.from({ length: n }, (_, i) => ({ id: `l${k}s${i}` })) }));

test("CL1 every room the Primer teaches has a place on the chart of the atelier and wears a ring with one mark for every step, once each, in its lessons' order (Issue #1257; Issue #1155 comment 7136681098, Q2)", () => {
  assert.ok(
    rooms.some((r) => r.lessons.length > 1),
    "some room has more than one lesson, so the order across lessons is held",
  );
  const chart = taught();
  for (const room of rooms) {
    const place = chart.places.find((p) => p.route === room.route);
    assert.ok(place, `${room.route} has a place`);
    assert.equal(place.room, room.id);
    assert.deepEqual(
      place.marks.map((m) => m.step),
      stepsOf(room),
    );
  }
  const marked = chart.places.flatMap((p) => p.marks.map((m) => m.step));
  assert.equal(new Set(marked).size, marked.length, "no step is marked twice");
  assert.deepEqual([...marked].sort(), rooms.flatMap(stepsOf).sort());
});

test("CL2 a room whose route has no place on the chart of the atelier stops the build, naming the route (Issue #1257)", () => {
  assert.throws(
    () => chartOfLessons([{ id: "nowhere", route: "/nowhere/", lessons: [{ steps: [{ id: "a" }] }] }]),
    /no place on the chart of the atelier for \/nowhere\//,
  );
});

test("CL3 a ring runs clockwise from the top, parts one lesson from the next by a gap wider than the gap between two steps, and widens past its floor so every slot keeps its rim as a room grows (Issue #1155 comment 7136681098, Q2)", () => {
  const small = ringOf(lessonsOfSizes(3, 2));
  assert.equal(small.arcs.length, 5);
  for (let i = 1; i < small.arcs.length; i++) {
    assert.ok(small.arcs[i]!.from > small.arcs[i - 1]!.from, "arcs run clockwise");
  }
  assert.ok(small.arcs[0]!.from > -90 && small.arcs[0]!.from < -90 + 360 / 7, "the first arc starts at the top");
  const gaps = small.arcs
    .slice(1)
    .map((a, i) => ({ gap: a.from - small.arcs[i]!.to, across: a.lesson !== small.arcs[i]!.lesson }));
  const across = gaps.filter((g) => g.across).map((g) => g.gap);
  const within = gaps.filter((g) => !g.across).map((g) => g.gap);
  assert.equal(across.length, 1);
  assert.ok(within.length > 0);
  assert.ok(across[0]! > Math.max(...within), "a lesson is parted by a gap wider than the gap between two steps");
  assert.equal(small.r, RING_FLOOR);

  const big = ringOf(lessonsOfSizes(100));
  const rim = (big.r * 2 * Math.PI) / 101;
  // half a tenth is round1's largest cut of the radius, carried round the rim and shared among the 101 slots
  assert.ok(rim >= SLOT_ARC - (0.05 * 2 * Math.PI) / 101, `a slot keeps its rim (${rim})`);
  for (let i = 1; i < big.arcs.length; i++) assert.ok(big.arcs[i]!.from > big.arcs[i - 1]!.to, "no two arcs overlap");
});

test("CL4 the road from home to each room is the site's own, walked leg by leg from home to the room's place, and a room no road reaches inks none (Issue #1155 comment 7136681098, Q3)", () => {
  const chart = taught();
  const touches = (route: string): boolean => ROADS.some((pair) => pair.includes(route));
  for (const route of ["/seed-of-the-day/", "/gallery/"]) {
    assert.ok(
      rooms.some((r) => r.route === route),
      `${route} is taught`,
    );
    assert.equal(touches(route), false, `no road reaches ${route}`);
  }
  for (const room of rooms) {
    const legs = chart.roads.filter((r) => r.rooms.includes(room.id)).map((r) => r.pair);
    if (!touches(room.route)) {
      assert.deepEqual(legs, [], `${room.route} inks no road`);
      continue;
    }
    const unused = [...legs];
    let here = "/";
    while (unused.length > 0) {
      const at = unused.filter((pair) => pair.includes(here));
      assert.equal(at.length, 1, `exactly one unused leg leaves ${here}`);
      const [leg] = at;
      unused.splice(unused.indexOf(leg!), 1);
      here = leg![0] === here ? leg![1] : leg![0];
    }
    assert.equal(here, room.route, `the walk ends at ${room.route}`);
    assert.ok(legs.length > 0);
  }
  const untaught = Object.keys(PLACES).filter((r) => r !== "/" && !rooms.some((room) => room.route === r));
  assert.ok(untaught.length > 0);
  const toUntaught = chart.roads.filter((road) => road.pair.some((end) => untaught.includes(end)));
  assert.ok(toUntaught.length > 0);
  for (const road of toUntaught) assert.deepEqual(road.rooms, [], `the road ${road.pair.join(" to ")} carries no room`);
});

test("CL5 every place's name finds a seat on today's chart that meets no other name and no place's ring or pip (Issue #1155 comment 7136681098, Q6)", () => {
  const chart = taught();
  assert.ok(
    chart.places.some((p) => p.label.side !== "above"),
    "some name takes a seat other than above, so the search is exercised",
  );
  const obstacle = (p: (typeof chart.places)[number]): Box => {
    const c = p.ring === null ? p.pip : p.ring + 2;
    return { x: p.x - c, y: p.y - c, w: 2 * c, h: 2 * c };
  };
  for (const [i, p] of chart.places.entries()) {
    assert.equal(p.label.forced, false, `${p.route}'s name is not forced`);
    for (const q of chart.places)
      assert.equal(meets(p.label.box, obstacle(q)), false, `${p.route}'s name meets ${q.route}`);
    for (const q of chart.places.slice(i + 1))
      assert.equal(meets(p.label.box, q.label.box), false, `${p.route}'s name meets ${q.route}'s`);
  }
});

test("CL6 a name whose seat above meets a name already placed takes its next seat that meets none, so a room the chart takes on later never lays its name over another's (Issue #1257; Issue #1155 comment 7136681098, Q6)", () => {
  const a = { route: "/a/", x: 100, y: 100, ext: 9 };
  const b = { route: "/b/", x: 128, y: 100, ext: 9 };
  const places: Box[] = [
    { x: 91, y: 91, w: 18, h: 18 },
    { x: 119, y: 91, w: 18, h: 18 },
  ];
  const first = seat(a, "Aaaa", 12, places, []);
  assert.equal(first.side, "above");
  const alone = seat(b, "Bbbb", 12, places, []);
  assert.equal(alone.side, "above", "with no name placed, the second name sits above its place, free of every place");
  assert.equal(meets(alone.box, first.box), true, "and there it meets the first name");
  const moved = seat(b, "Bbbb", 12, places, [first]);
  assert.equal(moved.side, "right");
  assert.equal(moved.forced, false);
  assert.equal(meets(moved.box, first.box), false);
});
