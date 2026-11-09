import { test } from "node:test";
import assert from "node:assert/strict";
import { createDrift, IDLE_DELAY_MS } from "../../src/site/home/drift.ts";

const CAM = { x: 10, y: 20, s: 1.5 };

function fakeTimers() {
  let now = 0;
  let next = 1;
  const due = new Map<number, { at: number; run: () => void }>();
  return {
    setTimer: (run: () => void, ms: number): number => {
      const id = next++;
      due.set(id, { at: now + ms, run });
      return id;
    },
    clearTimer: (id: number | undefined): void => {
      if (id !== undefined) due.delete(id);
    },
    advance: (ms: number): void => {
      now += ms;
      for (const [id, t] of [...due]) {
        if (t.at > now) continue;
        due.delete(id);
        t.run();
      }
    },
    pending: (): number => due.size,
  };
}

function rig(reduced: boolean) {
  const clock = fakeTimers();
  const seen = { breaths: 0, kills: 0 };
  const drift = createDrift({
    reduced: () => reduced,
    setTimer: clock.setTimer,
    clearTimer: clock.clearTimer,
    camera: () => CAM,
    breathe: () => {
      seen.breaths++;
      return { kill: () => void seen.kills++ };
    },
  });
  return { clock, seen, drift };
}

test("a stop re-arms the drift's idle timer: once the idle delay has run again, the sheet breathes again (#458; from e2e H15c)", () => {
  const { clock, seen, drift } = rig(false);
  drift.arm();
  clock.advance(IDLE_DELAY_MS);
  assert.equal(seen.breaths, 1, "the first breath begins once the sheet has stood still for the idle delay");
  drift.stop();
  clock.advance(IDLE_DELAY_MS - 1);
  assert.equal(seen.breaths, 1, "no breath before the idle delay has run again");
  clock.advance(1);
  assert.equal(seen.breaths, 2, "the stop re-armed the idle timer, so the sheet breathes again");
});

test("a stop halts a running drift at once: its breath is killed and none begins again before the idle delay (#458; from e2e H15d, whose station flight reaches the stop through the page's own wiring)", () => {
  const { clock, seen, drift } = rig(false);
  drift.arm();
  clock.advance(IDLE_DELAY_MS);
  drift.stop();
  assert.equal(seen.kills, 1, "the running breath is killed");
  clock.advance(IDLE_DELAY_MS - 1);
  assert.equal(seen.breaths, 1, "and no new one begins within the idle delay");
});

test("under reduced motion the drift never arms: no timer stands and no breath begins, however long the sheet stands still (#458; from e2e H16)", () => {
  const { clock, seen, drift } = rig(true);
  drift.arm();
  drift.stop();
  clock.advance(10 * IDLE_DELAY_MS);
  assert.equal(clock.pending(), 0, "no idle timer stands");
  assert.equal(seen.breaths, 0, "no breath begins");
});
