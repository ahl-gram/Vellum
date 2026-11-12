import test from "node:test";
import assert from "node:assert/strict";
import {
  ARM_NAME,
  expectFor,
  fits,
  heldBy,
  keyOf,
  keysLost,
  onItsArm,
  pressPoint,
  routeOf,
  stateOf,
  wordsHold,
  wordsOf,
  type Facts,
} from "../../e2e/support/primer-judge.ts";
import type { Ladder, Step, Words } from "../../src/site/shared/primer/shape.ts";

const FACTS: Facts = {
  found: true,
  shown: true,
  box: { x: 10, y: 20, w: 40, h: 30 },
  clip: "none",
  held: false,
  disabled: false,
  text: "  Draw \n nearer ",
  aria: " The  loupe ",
  title: " random seed ",
  placeholder: "seed's choice",
  attr: "archipelago",
  label: " sea \n level ",
  road: [" Take to ", " The Print Room "],
  options: [
    { text: " island ", disabled: false },
    { text: "archipelago", disabled: true },
  ],
};
const w = (read: Words["read"], says: string, more: Partial<Words> = {}): Words => ({ css: "#x", says, read, ...more });
const step = (more: Partial<Step> = {}): Step => ({
  id: "explorer-x",
  act: "Press it.",
  see: "It answers.",
  at: "/explorer/#seed=42",
  words: [],
  ...more,
});

test("PJ1 wordsOf reads each of the eight read kinds from the page's facts, and nothing from a control the page lacks", () => {
  assert.deepEqual(
    [
      wordsOf(FACTS, w("text", "")),
      wordsOf(FACTS, w("aria", "")),
      wordsOf(FACTS, w("title", "")),
      wordsOf(FACTS, w("placeholder", "")),
      wordsOf(FACTS, w("attr", "", { attr: "data-vellum-map-type" })),
      wordsOf(FACTS, w("label", "")),
      wordsOf(FACTS, w("road", "")),
      wordsOf(FACTS, w("option", "island")),
      wordsOf(FACTS, w("option", "archipelago")),
      wordsOf(FACTS, w("option", "continent")),
    ],
    [
      "Draw nearer",
      "The loupe",
      "random seed",
      "seed's choice",
      "archipelago",
      "sea level",
      "Take to The Print Room",
      "island",
      "archipelago (disabled)",
      "no such option",
    ],
  );
  assert.equal(wordsOf({ ...FACTS, found: false }, w("text", "")), null);
});

test("PJ2 wordsHold matches whole words, or by their start or by what they contain where the entry says", () => {
  assert.deepEqual(
    [
      wordsHold("The Isle of Rahai · Chart № 42", w("text", "The Isle of Rahai")),
      wordsHold("The Isle of Rahai · Chart № 42", w("text", "The Isle of Rahai", { match: "starts" })),
      wordsHold("the Isle of Rahai", w("text", "Rahai", { match: "starts" })),
      wordsHold("34% land", w("text", "% land", { match: "contains" })),
      wordsHold(null, w("text", "", { match: "contains" })),
    ],
    [false, true, false, true, false],
  );
});

test("PJ3 expectFor holds a tablet step hidden but on the tablet and a motion step hidden but with motion on, takes the data's own state, and asks nothing of an outcome's reach; onItsArm does each device step only on its own arm", () => {
  const touch = step({ only: "touch" });
  const motion = step({ only: "motion" });
  assert.deepEqual(
    [
      expectFor(w("aria", "x"), step(), "desk", false),
      expectFor(w("aria", "x"), touch, "desk", false),
      expectFor(w("aria", "x"), touch, "tablet", false),
      expectFor(w("aria", "x"), touch, "motion", false),
      expectFor(w("aria", "x"), motion, "desk", false),
      expectFor(w("aria", "x"), motion, "tablet", false),
      expectFor(w("aria", "x"), motion, "motion", false),
      expectFor(w("text", "x", { state: "held" }), step(), "desk", true),
      expectFor(w("text", "x", { state: "hidden" }), step(), "desk", false),
      expectFor(w("text", "x"), step(), "desk", true),
    ],
    ["reachable", "hidden", "reachable", "hidden", "hidden", "hidden", "reachable", "held", "hidden", "any"],
  );
  assert.deepEqual(
    (["desk", "tablet", "motion"] as const).flatMap((arm) => [step(), touch, motion].map((s) => onItsArm(s, arm))),
    [true, false, false, false, true, false, false, false, true],
  );
  assert.deepEqual(
    (["desk", "tablet", "motion"] as const).map((arm) => `walk${ARM_NAME[arm]}`),
    ["walk", "walk on a tablet", "walk with motion on"],
  );
});

test("PJ4 stateOf names each way a control can fail to be reached, and fits takes what each expectation allows", () => {
  assert.deepEqual(
    [
      stateOf({ ...FACTS, found: false }, "self"),
      stateOf({ ...FACTS, shown: false }, "self"),
      stateOf({ ...FACTS, box: { x: 0, y: 0, w: 0, h: 9 } }, "self"),
      stateOf({ ...FACTS, box: { x: 0, y: 0, w: 9, h: 0 } }, "self"),
      stateOf({ ...FACTS, held: true }, "self"),
      stateOf({ ...FACTS, disabled: true }, "self"),
      stateOf(FACTS, "off screen"),
      stateOf(FACTS, "place-hit"),
      stateOf(FACTS, "label"),
      stateOf(FACTS, "self"),
    ],
    [
      "absent",
      "hidden",
      "no box",
      "no box",
      "held",
      "disabled",
      "off screen",
      "covered by place-hit",
      "reachable",
      "reachable",
    ],
  );
  assert.deepEqual(
    [
      fits("hidden", "hidden"),
      fits("no box", "hidden"),
      fits("reachable", "hidden"),
      fits("held", "held"),
      fits("covered by stage", "reachable"),
      fits("covered by stage", "any"),
      fits("absent", "any"),
    ],
    [true, true, false, true, false, true, false],
  );
});

test("PJ5 pressPoint presses a box at its centre, a clipped control inside its own shape, and the act's own point where it names one", () => {
  const box = { x: 414, y: 188, w: 54, h: 54 };
  assert.deepEqual(pressPoint(box, "none"), { x: 441, y: 215 });
  assert.deepEqual(pressPoint(box, "polygon(100% 0px, 0px 0px, 100% 100%)"), { x: 450, y: 206 });
  assert.deepEqual(pressPoint(box, "polygon(100% 0px, 0px 0px, 100% 100%)", { x: 0.12, y: 0.15 }), {
    x: 420.48,
    y: 196.1,
  });
});

test("PJ6 keysLost names each key of the step's address the page no longer carries, and none whose value the page rewrote", () => {
  assert.deepEqual(keysLost("/explorer/#seed=42&cx=0.5000&cy=0.5000&k=1.9600", "#seed=42"), ["cx", "cy", "k"]);
  assert.deepEqual(keysLost("/explorer/#seed=42&k=1.9600", "#seed=42&k=1.96&table=x"), []);
  assert.deepEqual(keysLost("/explorer/", "#seed=7"), []);
});

test("PJ7 a named key carries its key, code and text, Enter the carriage return that presses, and a key the driver has none for is refused", () => {
  assert.deepEqual(
    ["Enter", "Escape", "ArrowRight", "Home"].map((k) => keyOf(k)),
    [
      { key: "Enter", code: "Enter", vk: 13, text: "\r" },
      { key: "Escape", code: "Escape", vk: 27, text: "" },
      { key: "ArrowRight", code: "ArrowRight", vk: 39, text: "" },
      { key: "Home", code: "Home", vk: 36, text: "" },
    ],
  );
  assert.throws(() => keyOf("F13"), /no key named "F13"/);
});

test("PJ8 routeOf names the room an address opens, the path before its query or its hash (Issue #1252)", () => {
  assert.deepEqual(
    ["/explorer/#seed=42", "/prospect/#seed=42&i=0", "/print-room/", "/explorer/portfolio/?step=x#table=y"].map(
      routeOf,
    ),
    ["/explorer/", "/prospect/", "/print-room/", "/explorer/portfolio/"],
  );
});

test("PJ9 heldBy names the earlier step whose reads are the same in every field, and none where any one field differs (Issue #1252)", () => {
  const lad = (route: string, steps: readonly Step[]): Ladder => ({
    route,
    what: "",
    lessons: [{ id: "l", title: "", gloss: "", steps }],
  });
  const a = step({ id: "explorer-a", first: [{ kind: "click", css: "#c" }], words: [w("text", "Go")] });
  const twin: Step = { ...a, id: "prospect-a", act: "Say it otherwise.", see: "Otherwise." };
  const ladders = [lad("/explorer/", [a]), lad("/prospect/", [twin])];
  assert.deepEqual([heldBy(a, ladders), heldBy(twin, ladders)], [null, "explorer-a"]);
  const second: Step = { ...twin, id: "prospect-b" };
  const three = [lad("/explorer/", [a]), lad("/prospect/", [second, twin])];
  assert.deepEqual([heldBy(second, three), heldBy(twin, three)], ["explorer-a", "explorer-a"]);
  const differing: readonly Partial<Step>[] = [
    { at: "/explorer/#seed=7" },
    { first: [] },
    { words: [w("text", "Stop")] },
    { relies: [w("aria", "x")] },
    { do: [{ kind: "click", css: "#c" }] },
    { then: [w("text", "x")] },
    { only: "touch" },
  ];
  assert.deepEqual(
    differing.map((d) => {
      const other: Step = { ...twin, ...d };
      return heldBy(other, [lad("/explorer/", [a]), lad("/prospect/", [other])]);
    }),
    differing.map(() => null),
  );
});
