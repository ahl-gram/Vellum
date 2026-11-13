import test from "node:test";
import assert from "node:assert/strict";
import { applies } from "../../src/site/shared/primer/hand-steps.ts";
import { roomOnArrival, type ArrivalRoom } from "../../src/site/primer/arrival.ts";

const ROOMS: readonly ArrivalRoom[] = [
  { id: "A", steps: [{ id: "a1" }, { id: "a2", only: "touch" }] },
  { id: "B", steps: [{ id: "b1" }] },
  { id: "C", steps: [{ id: "c1", only: "motion" }, { id: "c2" }] },
];
const DESKTOP = { touch: false, motion: true };
const TABLET = { touch: true, motion: true };
const STILL = { touch: false, motion: false };

test("PA1 a bare first visit opens the first room, at its first step (ruling 16)", () => {
  assert.equal(roomOnArrival(ROOMS, null, new Set(), DESKTOP), "A");
});

test("PA2 a room's own press opens that room whatever the seals say (N4)", () => {
  assert.equal(roomOnArrival(ROOMS, "C", new Set(["a1"]), DESKTOP), "C", "the seals alone would resume at B");
  assert.equal(roomOnArrival(ROOMS, "A", new Set(["a1", "a2", "b1"]), STILL), "A", "the seals alone would resume at C");
  assert.equal(
    roomOnArrival(ROOMS, "nowhere", new Set(["a1"]), DESKTOP),
    "B",
    "an unknown target falls through to the seal rule",
  );
});

test("PA3 a returner resumes at the first room with a step still to seal that can apply here (N4, M4)", () => {
  assert.equal(
    roomOnArrival(ROOMS, null, new Set(["a1"]), DESKTOP),
    "B",
    "a2 is a tablet step, so A has nothing left on a desktop",
  );
  assert.equal(roomOnArrival(ROOMS, null, new Set(["a1"]), TABLET), "A");
  assert.equal(roomOnArrival(ROOMS, null, new Set(["a1", "a2", "b1"]), STILL), "C", "c2 still applies with motion off");
  assert.equal(
    roomOnArrival(ROOMS, null, new Set(["a1", "a2", "b1", "c2"]), STILL),
    "A",
    "nothing left: the first room",
  );
  assert.equal(roomOnArrival([], null, new Set(), DESKTOP), null);
});

test("PA4 applies is the device's own answer for each mark", () => {
  assert.equal(applies(undefined, STILL), true);
  assert.equal(applies("touch", DESKTOP), false);
  assert.equal(applies("touch", TABLET), true);
  assert.equal(applies("motion", STILL), false);
  assert.equal(applies("motion", DESKTOP), true);
});
