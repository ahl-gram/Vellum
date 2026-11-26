import { test } from "node:test";
import assert from "node:assert/strict";
import { parseHTML } from "linkedom";
import type { ArrivalRoom } from "../../src/site/primer/arrival.ts";
import { landing, stepAfter, stepBefore } from "../../src/site/primer/walk.ts";
import { buildDone, buildRow } from "../../src/site/primer/walk-row.ts";

const A: ArrivalRoom = { id: "A", steps: [{ id: "a1" }, { id: "a2", only: "touch" }, { id: "a3" }] };
const B: ArrivalRoom = { id: "B", steps: [{ id: "b1" }, { id: "b2" }] };
const C: ArrivalRoom = { id: "C", steps: [{ id: "c1", only: "motion" }] };
const rooms = [A, B, C];
const desktop = { touch: false, motion: true };
const tablet = { touch: true, motion: true };
const none = { kind: "none" } as const;
const set = (...ids: string[]): ReadonlySet<string> => new Set(ids);

test("PW1 with no address a first visit lands on the first room's first step, a returner on the first step still to seal on this device, and once every such step is sealed, on the end (Issue #1392 C6)", () => {
  assert.deepEqual(landing(rooms, none, set(), desktop), { room: "A", step: "a1", done: null, end: false });
  assert.deepEqual(landing(rooms, none, set("a1", "a3"), desktop), { room: "B", step: "b1", done: null, end: false });
  assert.deepEqual(landing(rooms, none, set("a1", "a3", "b1", "b2"), desktop), {
    room: "C",
    step: "c1",
    done: null,
    end: false,
  });
  assert.deepEqual(landing(rooms, none, set("a1", "a3", "b1", "b2", "c1"), desktop), {
    room: "A",
    step: null,
    done: null,
    end: true,
  });
});

test("PW2 a room's address lands on its first step still to seal on this device, and on its first step once none is (Issue #1392 C6)", () => {
  assert.equal(landing(rooms, { kind: "room", room: "B" }, set("b1"), desktop)?.step, "b2");
  assert.equal(landing(rooms, { kind: "room", room: "B" }, set("b1", "b2"), desktop)?.step, "b1");
});

test("PW3 a lesson's address lands on its first step whatever its seals (Issue #1392 C6)", () => {
  assert.equal(landing(rooms, { kind: "lesson", room: "A", first: "a1" }, set("a1"), desktop)?.step, "a1");
});

test("PW4 a step's address lands on that step while unsealed; sealed, on the next step after it still to seal on this device with the step as done, or on the room's end (Issue #1392 C6)", () => {
  const at = { kind: "step", room: "A", step: "a1" } as const;
  assert.deepEqual(landing(rooms, at, set(), desktop), { room: "A", step: "a1", done: null, end: false });
  assert.deepEqual(landing(rooms, at, set("a1"), desktop), { room: "A", step: "a3", done: "a1", end: false });
  assert.deepEqual(landing(rooms, at, set("a1"), tablet), { room: "A", step: "a2", done: "a1", end: false });
  assert.deepEqual(landing(rooms, at, set("a1", "a3"), desktop), { room: "A", step: null, done: "a1", end: false });
});

test("PW5 Skip and Back walk every step of a room in order, sealed or not, and stop at its ends (Issue #1392 D1)", () => {
  assert.equal(stepAfter(A, "a1"), "a2");
  assert.equal(stepAfter(A, "a3"), null);
  assert.equal(stepBefore(A, "a2"), "a1");
  assert.equal(stepBefore(A, "a1"), null);
  assert.equal(stepAfter(A, "zz"), null);
});

const row = (first: boolean): HTMLElement => {
  const { document } = parseHTML("<!doctype html><html><body></body></html>");
  return buildRow(document, "The Land", ["x1", "x2", "x3"], "x2", set("x1"), first);
};

test("PW6 the row counts the step in the hand's own words, dots its lesson as the slip does, and carries Back on every step but a room's first, where Skip stands alone (Issue #1392 C5, comment 7199849912)", () => {
  const mid = row(false);
  assert.equal(mid.querySelector(".walk-of")?.textContent, "The Land, step 2 of 3");
  assert.deepEqual(
    [...mid.querySelectorAll(".dots i")].map((i) => i.getAttribute("class") ?? ""),
    ["on", "now", ""],
  );
  assert.notEqual(mid.querySelector(".walk-back"), null);
  assert.equal(mid.querySelector(".walk-back")?.hasAttribute("disabled"), false);
  const first = row(true);
  assert.equal(first.querySelector(".walk-back") === null, true, "no Back at the room's first step");
  assert.equal(first.firstElementChild?.className, "walk-of");
  assert.notEqual(first.querySelector(".walk-skip"), null);
});

test("PW7 the Done line carries the step's seal and its act (Issue #1392 D5)", () => {
  const { document } = parseHTML("<!doctype html><html><body></body></html>");
  const line = buildDone(document, "5", "A new row has come.");
  assert.equal(line.querySelector(".primer-seal")?.textContent, "5");
  assert.equal(line.textContent, "5Done: A new row has come.");
});
