import test from "node:test";
import assert from "node:assert/strict";
import { LADDERS } from "../../src/site/shared/primer/ladders.ts";
import {
  handStepFor,
  sealWhen,
  stepAddress,
  stepIdOf,
  useWatches,
  withoutStep,
} from "../../src/site/shared/primer/hand-steps.ts";
import { headOf, onward } from "../../src/site/shared/primer/hand-words.ts";
import { STEPS, stepOf } from "../../test-support/hand-steps.ts";

const DESK = { touch: false, motion: true };

test("PK1 stepIdOf reads the step key from a search string and refuses one the store could not hold", () => {
  assert.equal(stepIdOf("?step=explorer-islands"), "explorer-islands");
  assert.equal(stepIdOf("?seed=1&step=a-b"), "a-b");
  for (const search of ["", "?step=", "?step=Bad_Id", "?step=a%20b"]) assert.equal(stepIdOf(search), null, search);
});

test("PK2 handStepFor finds the step addressed to this room, and refuses an id no ladder has and one addressed to another room", () => {
  assert.equal(handStepFor(STEPS, "explorer-islands", "/explorer/")?.id, "explorer-islands");
  assert.equal(handStepFor(STEPS, "prospect-enter", "/explorer/")?.id, "prospect-enter");
  assert.equal(handStepFor(STEPS, "no-such-step", "/explorer/"), null);
  assert.equal(handStepFor(STEPS, "prospect-year", "/explorer/"), null);
});

test("PK3 stepAddress writes the root-absolute Try it address, the key before the hash", () => {
  assert.equal(
    stepAddress("explorer-islands", "/explorer/#seed=42&type=archipelago"),
    "/explorer/?step=explorer-islands#seed=42&type=archipelago",
  );
  assert.equal(stepAddress("a", "/x/?k=1#h"), "/x/?k=1&step=a#h");
  assert.equal(stepAddress("a", "/x/"), "/x/?step=a");
  assert.throws(() => stepAddress("a", "x/"), /a's address is not root-absolute: x\//);
});

test("PK4 withoutStep drops the key alone and keeps every other key and the hash", () => {
  assert.equal(withoutStep("/explorer/", "?step=a", "#seed=42"), "/explorer/#seed=42");
  assert.equal(withoutStep("/x/", "?a=1&step=b&c=2", "#h"), "/x/?a=1&c=2#h");
  assert.equal(withoutStep("/x/", "", ""), "/x/");
  assert.equal(
    withoutStep("/x/", "?stepper=1&step=a&steps=2", ""),
    "/x/?stepper=1&steps=2",
    "a key that only starts with step stays",
  );
});

test("PK5 handSteps places every step once in ladder order, with its lesson, its place, its lesson's steps and the next step, and survives JSON unchanged", () => {
  const ids = LADDERS.flatMap((l) => l.lessons.flatMap((lesson) => lesson.steps.map((s) => s.id)));
  assert.deepEqual(
    STEPS.map((s) => s.id),
    ids,
  );
  const islands = stepOf("explorer-islands");
  assert.equal(islands.lesson, "The Land");
  assert.equal(islands.n, 2);
  assert.equal(islands.of, 6);
  assert.equal(islands.siblings.length, 6);
  assert.equal(islands.siblings[1], "explorer-islands");
  assert.deepEqual(islands.next, {
    id: "explorer-sizes",
    at: "/explorer/#seed=42&type=archipelago&islands=20",
    word: "sizes",
  });
  assert.deepEqual(stepOf("explorer-held").next, {
    id: "explorer-sea-level",
    at: stepOf("explorer-sea-level").at,
    word: "sea level",
  });
  const explorer = LADDERS[0]!.lessons.flatMap((l) => l.steps);
  assert.equal(stepOf(explorer.at(-1)!.id).next, null);
  assert.deepEqual(JSON.parse(JSON.stringify(STEPS)), STEPS);
});

test("PK6 sealWhen: a device step that cannot apply never, a step with nothing to see on arrival, a play step, a commission and a step with an act and no outcome on use, any other step on its outcome", () => {
  const hand = stepOf("explorer-in-hand");
  assert.equal(sealWhen(hand, { touch: false, motion: true }), "never");
  assert.equal(sealWhen(hand, { touch: true, motion: true }), "arrival");
  const pace = stepOf("reading-room-pace");
  assert.equal(sealWhen(pace, { touch: true, motion: false }), "never", "a motion step with motion off");
  assert.equal(sealWhen(pace, { touch: false, motion: true }), "arrival", "a motion step with motion on");
  assert.equal(
    sealWhen(hand, { touch: true, motion: false }),
    "arrival",
    "a touch step on a touch device with motion off",
  );
  assert.equal(sealWhen(stepOf("explorer-to-print"), DESK), "arrival");
  for (const id of ["explorer-dice", "explorer-enter", "explorer-theme", "explorer-commission"])
    assert.equal(sealWhen(stepOf(id), DESK), "use", id);
  for (const id of ["explorer-islands", "explorer-sea-level"]) assert.equal(sealWhen(stepOf(id), DESK), "outcome", id);
});

test("PK7 useWatches maps each act to the event a reader's use sends", () => {
  assert.deepEqual(useWatches(stepOf("explorer-dice")), [{ event: "click", css: "#random" }]);
  assert.deepEqual(useWatches(stepOf("explorer-theme")), [{ event: "change", css: "#theme" }]);
  assert.deepEqual(useWatches(stepOf("explorer-enter")), [{ event: "keydown", css: "#seed", key: "Enter" }]);
  assert.deepEqual(useWatches(stepOf("explorer-look-about")), [
    { event: "click", css: "#zoom-in" },
    { event: "keydown", css: "#map-viewport", key: "ArrowLeft" },
    { event: "keydown", css: "#map-viewport", key: "ArrowRight" },
    { event: "keydown", css: "#map-viewport", key: "ArrowUp" },
    { event: "keydown", css: "#map-viewport", key: "ArrowDown" },
  ]);
  const dice = stepOf("explorer-dice");
  assert.deepEqual(
    useWatches({
      ...dice,
      do: [
        { kind: "set", css: "#a", value: "1" },
        { kind: "key", css: "#b", key: "Enter" },
      ],
    }),
    [
      { event: "change", css: "#a" },
      { event: "keydown", css: "#b", key: "Enter" },
    ],
  );
  assert.deepEqual(
    useWatches({
      ...dice,
      do: [
        { kind: "click", css: "#a" },
        { kind: "key", css: "#a", key: "Enter" },
      ],
    }),
    [
      { event: "click", css: "#a" },
      { event: "keydown", css: "#a", key: "Enter" },
    ],
  );
  assert.deepEqual(useWatches(stepOf("explorer-survey")), [{ event: "click", css: "#ages" }]);
  assert.deepEqual(useWatches(stepOf("explorer-commission")), [
    { event: "change", css: "#type" },
    { event: "change", css: "#band" },
    { event: "change", css: "#style" },
  ]);
});

test("PK8 the note's words: the lesson and the place, and the press onward", () => {
  assert.equal(headOf("The Land", 2, 6), "The Land, step 2 of 6");
  assert.equal(onward("sizes"), "Next, sizes ›");
  assert.equal(onward(null), "Next step ›");
});
