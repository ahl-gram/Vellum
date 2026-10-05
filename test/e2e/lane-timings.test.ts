import { test } from "node:test";
import assert from "node:assert/strict";
import { E2E_LANES } from "../../e2e/support/lanes.ts";
import { E2E_SUITE_ORDER } from "../../e2e/support/suites.ts";
import type { E2eSuiteName } from "../../e2e/support/suites.ts";

// CI seconds per suite, the median of the runner's own per-suite wall clock in the CI lane logs over main runs 37080729164 to 37168764434 (nine, 2026-10-02 to 2026-10-04; room-drawer six from 7266e12, corners one from PR #777 run 37320076997 after the minimum-size stage group, EA5 and EL2 joined it, cluster one from PR #774 run 37255002357 after the desk notice joined it), read at Issue #743 with `gh api --allow-escape-sequences repos/ahl-gram/Vellum/actions/jobs/<job>/logs` and the lines under `per-suite wall clock`; a new suite enters an estimate and is corrected from its pull request's own lane log.
const MEASURED_SECONDS: Readonly<Record<E2eSuiteName, number>> = {
  "render": 44.7,
  "motion": 3.7,
  "turn": 13.2,
  "verso": 13.6,
  "zoom": 92.4,
  "zoom-gestures": 8.4,
  "glass-ceremony": 16.6,
  "cards": 72.2,
  "health": 0.0,
  "fallback": 7.5,
  "hunt": 11.0,
  "print-room": 62.5,
  "prospect": 21.3,
  "ribbon": 9.9,
  "home": 114.1,
  "landfall": 73.0,
  "survey": 107.3,
  "broadside": 12.3,
  "reading-room": 74.0,
  "room-instrument": 42.9,
  "room-ink": 6.4,
  "room-voyage": 7.5,
  "room-voyage-route": 20.3,
  "room-address": 43.1,
  "runninghead": 13.3,
  "cluster": 16.0,
  "room-drawer": 30.2,
  "chart-drawer": 146.5,
  "document-rooms": 8.1,
  "region-detail": 44.2,
  "specimen": 9.3,
  "corners": 362.5,
};

const laneSeconds = (suites: readonly E2eSuiteName[]) =>
  suites.reduce((sum, name) => sum + MEASURED_SECONDS[name], 0);

// The slowest of four lanes at most 1.2 times an even split, which is what 0.6 meant at two (Alex, 2026-10-04, Issue #743).
const BALANCE_CAP = 0.3;
const laneHeadroom = (seconds: number, total: number) => (BALANCE_CAP * total - seconds) / (1 - BALANCE_CAP);
const balanceLine = (name: string, seconds: number, total: number): string => {
  const headroom = laneHeadroom(seconds, total);
  const room = headroom >= 0
    ? `${headroom.toFixed(1)}s of room under the ${BALANCE_CAP} cap`
    : `${(-headroom).toFixed(1)}s past the ${BALANCE_CAP} cap, so it must shed at least that`;
  return `lane ${name} is ${((seconds / total) * 100).toFixed(1)}% of measured serial cost (${seconds.toFixed(1)}s of ${total.toFixed(1)}s, ${room}), so that shard alone sets the wall clock while the others idle`;
};

test("the split is balanced against measured cost, not check counts", () => {
  const total = laneSeconds(E2E_SUITE_ORDER);
  for (const lane of E2E_LANES) {
    const seconds = laneSeconds(lane.suites);
    assert.ok(seconds / total <= BALANCE_CAP, balanceLine(lane.name, seconds, total));
  }
});

test("the balance message names the seconds a lane must shed, as a positive number that lands it exactly on the cap", () => {
  const [seconds, total] = [420, 686.4];
  assert.ok(seconds / total > BALANCE_CAP, "the fixture is under the cap, so the message's shed branch never runs");
  const shed = -laneHeadroom(seconds, total);
  assert.ok(shed > 0, `a lane over the cap reports ${shed}s of headroom instead of seconds to shed`);
  assert.ok(Math.abs((seconds - shed) / (total - shed) - BALANCE_CAP) < 1e-9, `shedding ${shed}s lands at ${(seconds - shed) / (total - shed)}, not on the cap`);
  const red = balanceLine("Q", seconds, total);
  assert.ok(red.startsWith("lane Q is "), "the red message does not name the lane");
  assert.ok(red.includes(`${shed.toFixed(1)}s past the ${BALANCE_CAP} cap`), "the red message does not name the seconds to shed");
  assert.doesNotMatch(red, /-\d/, "the red message carries a negative number, which reads as room where there is none");
  // The prover's round on f1b07c5 found `* 1000` passing with the seconds clause alone under test, and its round on 27150ab found the parenthetical's order and the lane name free.
  assert.ok(red.includes("61.2% of measured serial cost (420.0s of 686.4s, "), "the red message does not name the share, then the lane's seconds before the total");
  const [under, underTotal] = [150, 600];
  const room = laneHeadroom(under, underTotal);
  assert.ok(room > 0, "a lane under the cap reports no room");
  assert.ok(Math.abs((under + room) / (underTotal + room) - BALANCE_CAP) < 1e-9, `adding ${room}s lands at ${(under + room) / (underTotal + room)}, not on the cap`);
  const green = balanceLine("Q", under, underTotal);
  assert.ok(green.includes(`${room.toFixed(1)}s of room under the ${BALANCE_CAP} cap`), "the green-shaped message does not name the room");
  assert.ok(green.includes("25.0% of measured serial cost (150.0s of 600.0s, "), "the green-shaped message does not name the share, then the lane's seconds before the total");
});
