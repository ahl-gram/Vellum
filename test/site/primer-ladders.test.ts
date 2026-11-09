import test from "node:test";
import assert from "node:assert/strict";
import { NAV_ITEMS, ROUTE_CHILDREN } from "../../src/layouts/nav.ts";
import { EXPLORER } from "../../src/site/shared/primer/explorer.ts";
import {
  LADDERS,
  LEANED_ON,
  LEFT_UNTAUGHT,
  ROUTE_TREE,
  seated,
  untaught,
  type RouteTree,
  type Seated,
} from "../../src/site/shared/primer/ladders.ts";
import { phrasesOf, type Ladder, type Step } from "../../src/site/shared/primer/shape.ts";

const stepsOf = (ladders: readonly Ladder[]): readonly Step[] =>
  ladders.flatMap((l) => l.lessons.flatMap((lesson) => lesson.steps));

const NEW = "/explorer/sounding-room/";
const grown: RouteTree = {
  routes: [...ROUTE_TREE.routes, NEW],
  seat: (r) => (r === NEW ? "/explorer/" : ROUTE_TREE.seat(r)),
  names: { ...ROUTE_TREE.names, [NEW]: "The Sounding Room" },
};

const standIn = (route: string): Ladder => ({
  route,
  what: "a stand-in",
  lessons: [{ id: "first", title: "first", gloss: "a stand-in", steps: [] }],
});

const wordFaults = (step: Step): readonly string[] => {
  const phrases = new Set(phrasesOf(step.act));
  const faults: string[] = [];
  for (const p of phrases) {
    const n = step.words.filter((w) => w.says === p).length;
    if (n !== 1) faults.push(`{${p}} has ${n} words entries`);
  }
  for (const w of step.words) if (!phrases.has(w.says)) faults.push(`words "${w.says}" is not braced`);
  for (const r of step.relies ?? []) if (phrases.has(r.says)) faults.push(`relies "${r.says}" is braced`);
  if (/[{}]/.test(step.act.replace(/\{[^{}]+\}/g, ""))) faults.push("a brace is not closed");
  return faults;
};

const seats = (list: readonly Seated[]): unknown =>
  list.map((s) => [s.ladder.route, s.name, s.under.map((u) => [u.ladder.route, u.name])]);

test("every route in the route tree has a ladder, is leaned on, or is left untaught by name", () => {
  for (const item of NAV_ITEMS) assert.ok(ROUTE_TREE.routes.includes(item.href), `${item.href} is in the tree`);
  for (const child of Object.values(ROUTE_CHILDREN).flat()) {
    assert.ok(ROUTE_TREE.routes.includes(child), `${child} is in the tree`);
  }
  assert.deepEqual(untaught(), []);
});

test("a route with no ladder is named until its ladder lands, as the round's four cases ran", () => {
  assert.deepEqual(untaught(LADDERS.filter((l) => l.route !== "/explorer/")), ["/explorer/"]);
  assert.deepEqual(untaught(LADDERS, grown), [NEW]);
  assert.deepEqual(untaught([...LADDERS, standIn(NEW)], grown), []);
});

test("the leaned-on and untaught lists name only routes in the tree, and no route is named twice", () => {
  const named = [...LADDERS.map((l) => l.route), ...LEANED_ON, ...Object.keys(LEFT_UNTAUGHT)];
  const outside = named.filter((r) => !ROUTE_TREE.routes.includes(r));
  assert.deepEqual(outside, [], "every named route is in the tree");
  const twice = named.filter((r, i) => named.indexOf(r) !== i);
  assert.deepEqual(twice, [], "no route is named twice");
});

test("a subroom's ladder is seated under the room the route tree seats it in, never under an alias", () => {
  const name = (r: string): string => ROUTE_TREE.names[r] ?? "";
  assert.deepEqual(seats(seated([EXPLORER, standIn("/ribbon/"), standIn("/reading-room/"), standIn("/prospect/")])), [
    [
      "/explorer/",
      name("/explorer/"),
      [
        ["/ribbon/", name("/ribbon/")],
        ["/prospect/", name("/prospect/")],
      ],
    ],
    ["/reading-room/", name("/reading-room/"), []],
  ]);
  assert.deepEqual(seats(seated([EXPLORER, standIn(NEW)], grown)), [
    ["/explorer/", name("/explorer/"), [[NEW, "The Sounding Room"]]],
  ]);
  const shown = seated().flatMap((s) => [s.ladder.route, ...s.under.map((u) => u.ladder.route)]);
  assert.deepEqual([...shown].sort(), LADDERS.map((l) => l.route).sort(), "every ladder is seated exactly once");
});

test("phrasesOf reads every braced phrase of a sentence, in order", () => {
  assert.deepEqual(phrasesOf("Press {⚄}, then {Draw nearer}, then {⚄}."), ["⚄", "Draw nearer", "⚄"]);
  assert.deepEqual(phrasesOf("Drag the chart to look about it."), []);
});

test("every braced phrase in a step's sentence has exactly one words entry, and every words entry is braced", () => {
  const steps = stepsOf(LADDERS);
  assert.ok(steps.length > 0, "the guide has steps");
  assert.ok(
    steps.some((s) => phrasesOf(s.act).length > 0),
    "some sentence marks a word",
  );
  assert.deepEqual(
    steps.flatMap((s) => wordFaults(s).map((f) => `${s.id}: ${f}`)),
    [],
  );
});

test("every step id is unique across the guide", () => {
  const ids = stepsOf(LADDERS).map((s) => s.id);
  assert.ok(ids.length > 0, "the guide has steps");
  assert.deepEqual(
    ids.filter((id, i) => ids.indexOf(id) !== i),
    [],
  );
});

test("the guide opens on the Explorer, at the dice (Issue #1155 ruling 16)", () => {
  assert.equal(LADDERS[0]?.route, "/explorer/");
  assert.equal(LADDERS[0]?.lessons[0]?.steps[0]?.id, "explorer-dice");
});
