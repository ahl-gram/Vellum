import test from "node:test";
import assert from "node:assert/strict";
import { parseHTML } from "linkedom";
import { outcomeDone, watchUse, type OutcomeRead } from "../../src/site/shared/primer/hand-watch.ts";
import { stepOf } from "../../test-support/hand-steps.ts";

const read = (got: string | null, ok = true, state: OutcomeRead["state"] = "reachable"): OutcomeRead => ({
  got,
  state,
  ok,
});

test("PK9 outcomeDone seals only an outcome that holds and has changed since the hand armed", () => {
  const arrival = [read("a"), read("b")];
  assert.equal(outcomeDone(arrival, [read("a"), read("c")]), true, "all ok and one got changed");
  assert.equal(outcomeDone(arrival, [read("a"), read("b")]), false, "all ok and none changed");
  assert.equal(outcomeDone(arrival, [read("a"), read("c", false)]), false, "one not ok");
  assert.equal(
    outcomeDone([read("a", true, "no box")], [read("a", true, "reachable")]),
    true,
    "all ok and only a state changed",
  );
  assert.equal(
    outcomeDone([read("a")], [read("a"), read("b")]),
    true,
    "a read the arrival never took counts as changed",
  );
});

function armed(id: string, body: string) {
  const { document, Event } = parseHTML(`<!doctype html><html><body>${body}</body></html>`);
  let calls = 0;
  const stop = watchUse(document, stepOf(id), () => calls++);
  const fire = (css: string, type: string, init: Record<string, unknown> = {}): void => {
    const el = document.querySelector(css);
    assert.ok(el !== null, `no ${css}`);
    el.dispatchEvent(Object.assign(new Event(type, { bubbles: true }), init));
  };
  return { fire, stop, calls: () => calls, document };
}

test("PK10 watchUse seals on the reader's own use of a control the step names, and on nothing else", () => {
  const dice = armed("explorer-dice", `<button id="random">dice</button><button id="other">other</button>`);
  dice.fire("#other", "click");
  assert.equal(dice.calls(), 0, "another button");
  dice.fire("#random", "click");
  assert.equal(dice.calls(), 1, "the dice");
  const theme = armed("explorer-theme", `<select id="theme"></select><button id="other"></button>`);
  theme.fire("#other", "change");
  assert.equal(theme.calls(), 0);
  theme.fire("#theme", "change");
  assert.equal(theme.calls(), 1);
  const seed = armed("explorer-enter", `<input id="seed">`);
  seed.fire("#seed", "keydown", { key: "a" });
  assert.equal(seed.calls(), 0, "a letter");
  seed.fire("#seed", "change");
  assert.equal(seed.calls(), 0, "a change when the box loses focus is not the use");
  seed.fire("#seed", "keydown", { key: "Enter" });
  assert.equal(seed.calls(), 1, "Enter");
  const about = armed("explorer-look-about", `<div id="map-viewport"></div>`);
  about.fire("#map-viewport", "keydown", { key: "ArrowDown" });
  assert.equal(about.calls(), 1, "an arrow key on the chart");
  const doc = parseHTML("<!doctype html><html><body></body></html>");
  let reached = 0;
  const stopDoc = watchUse(doc.document, stepOf("explorer-dice"), () => reached++);
  doc.document.dispatchEvent(new doc.Event("click"));
  assert.equal(reached, 0, "an event whose target is no element reaches nothing and throws nothing");
  stopDoc();
  const labelled = armed("explorer-dice", `<label id="lab" for="random">dice</label><button id="random">dice</button>`);
  // linkedom has no label.control, so the fixture states it as a browser answers it.
  Object.assign(labelled.document.querySelector("#lab")!, { control: labelled.document.querySelector("#random") });
  labelled.fire("#lab", "click");
  assert.equal(labelled.calls(), 1, "a press on the label of the named control");
  const stopped = armed("explorer-dice", `<button id="random">dice</button>`);
  stopped.stop();
  stopped.fire("#random", "click");
  assert.equal(stopped.calls(), 0, "after stop");
  const inner = armed("explorer-dice", `<button id="random"><span id="glyph">⚄</span></button>`);
  inner.fire("#glyph", "click");
  assert.equal(inner.calls(), 1, "a press on the glyph inside the control");
});
