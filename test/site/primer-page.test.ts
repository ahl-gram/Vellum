import test from "node:test";
import assert from "node:assert/strict";
import type { RouteTree } from "../../src/site/shared/primer/ladders.ts";
import { option, road, text, type Ladder, type Step } from "../../src/site/shared/primer/shape.ts";
import { AFTERWARD, primerPage, segmentsOf, tryItHref } from "../../src/site/primer/page.ts";
import { datelineOf } from "../../src/site/primer/words.ts";

const step = (id: string, at: string, over: Partial<Step> = {}): Step => ({
  id,
  act: "Look about.",
  see: "You see it.",
  at,
  words: [],
  ...over,
});

test("PP1 Try it is the step's own address, relative, with its step key after a question mark (N9)", () => {
  assert.equal(tryItHref(step("x", "/explorer/#seed=42")), "../explorer/?step=x#seed=42");
  assert.equal(tryItHref(step("x", "/explorer/")), "../explorer/?step=x");
  assert.equal(tryItHref(step("x", "/a/?b=1#c")), "../a/?b=1&step=x#c");
  assert.throws(() => tryItHref(step("x", "explorer/")), /not root-absolute/);
});

test("PP2 a sentence's braced words become the controls they name", () => {
  const s = step("w", "/a/", {
    act: "Press {Take to The Print Room}, {Turn The Sheet} or {Read the journal in The Reading Room}, choose {Fast}, tap {⚄}, fill {Seed} and press {Draw nearer}.",
    words: [
      road("a.go", "Take to The Print Room"),
      road("a.turn", "Turn The Sheet"),
      road("a.read", "Read the journal in The Reading Room"),
      option("select", "Fast"),
      text("button.dice", "⚄"),
      text("label[for=seed]", "Seed"),
      text("button.draw", "Draw nearer"),
    ],
  });
  assert.deepEqual(segmentsOf(s), [
    { text: "Press " },
    { chip: "road", text: "Take to The Print Room", verb: "Take to", place: "The Print Room" },
    { text: ", " },
    { chip: "road", text: "Turn The Sheet", verb: "Turn", place: "The Sheet" },
    { text: " or " },
    {
      chip: "road",
      text: "Read the journal in The Reading Room",
      verb: "Read the journal in",
      place: "The Reading Room",
    },
    { text: ", choose " },
    { chip: "opt", text: "Fast" },
    { text: ", tap " },
    { chip: "glyph", text: "⚄" },
    { text: ", fill " },
    { chip: "word", text: "Seed" },
    { text: " and press " },
    { chip: "btn", text: "Draw nearer" },
    { text: "." },
  ]);
});

const ladder = (route: string, lessons: Ladder["lessons"], entered?: string): Ladder => ({
  route,
  what: `what ${route} is`,
  ...(entered === undefined ? {} : { entered }),
  lessons,
});
const lesson = (id: string, steps: Step[]): Ladder["lessons"][number] => ({
  id,
  title: `T ${id}`,
  gloss: `g ${id}`,
  steps,
});

const tree: RouteTree = {
  routes: ["/a/", "/a/sub/", "/b/"],
  seat: (r) => (r === "/a/sub/" ? "/a/" : null),
  names: { "/a/": "The Alpha Room", "/a/sub/": "The Sub Room", "/b/": "Beta" },
};

test("PP3 the page counts and links what the data holds", () => {
  const ladders: Ladder[] = [
    ladder(
      "/a/",
      [
        lesson("one", [step("a1", "/a/"), step("a2", "/a/sub/", { only: "touch" })]),
        lesson("two", [step("a3", "/b/", { kind: "play" })]),
      ],
      "by the road",
    ),
    ladder("/a/sub/", [lesson("one", [step("s1", "/a/", { kind: "commission" })])]),
    ladder("/b/", [lesson("one", [step("b1", "/b/")])]),
  ];
  const page = primerPage(ladders, tree);
  assert.deepEqual(
    page.rooms.map((r) => [r.id, r.of, r.entered, r.next?.id]),
    [
      ["a", undefined, "You come to it by the road.", "a-sub"],
      ["a-sub", "a room of the Alpha Room", undefined, "b"],
      ["b", undefined, undefined, undefined],
    ],
  );
  assert.deepEqual(page.rooms[0]!.next, { id: "a-sub", name: "The Sub Room" });
  assert.deepEqual(
    page.rooms.map((r) => r.lessons.flatMap((l) => l.steps.map((s) => s.n))),
    [[1, 2, 3], [1], [1]],
    "steps run on across a room's lessons and start again in the next room",
  );
  assert.deepEqual(
    page.rooms[0]!.lessons.map((l) => [l.id, l.numeral]),
    [
      ["a-one", "i"],
      ["a-two", "ii"],
    ],
  );
  assert.deepEqual(
    page.rooms[0]!.lessons[0]!.steps.map((s) => s.opens),
    ["opens the Alpha Room at this step", "opens the Sub Room at this step"],
  );
  assert.equal(page.rooms[0]!.lessons[1]!.steps[0]!.opens, "opens Beta at this step");
  assert.deepEqual(page.rooms[0]!.lessons[0]!.steps[1]!.marks, [{ text: "on a tablet", comm: false }]);
  assert.deepEqual(page.rooms[0]!.lessons[1]!.steps[0]!.marks, [{ text: "play: no wrong answer", comm: false }]);
  assert.deepEqual(page.rooms[1]!.lessons[0]!.steps[0]!.marks, [{ text: "a commission", comm: true }]);
  assert.deepEqual(
    page.index.map((s) => [s.id, s.title, s.count, s.tone, s.entries.map((e) => `${e.id} ${e.text}`)]),
    [
      ["a", "The Alpha Room", 3, undefined, ["a-one i · T one", "a-two ii · T two"]],
      ["a-sub", "The Sub Room", 1, "sub", ["a-sub-one i · T one"]],
      ["b", "Beta", 1, undefined, ["b-one i · T one"]],
      [AFTERWARD, "When the steps are done", null, "lean", []],
    ],
  );
  assert.equal(page.dateline, datelineOf(5, 3));
  const alone = primerPage([ladder("/b/", [lesson("one", [step("b1", "/b/")])])], tree).dateline;
  assert.equal(alone, datelineOf(1, 1));
  assert.match(alone, / in 1 room$/);
});
