import { test } from "node:test";
import assert from "node:assert/strict";
import { E2E_LANES } from "../../e2e/support/lanes.ts";
import { E2E_SUITE_ORDER } from "../../e2e/support/suites.ts";
import type { E2eSuiteName } from "../../e2e/support/suites.ts";

// CI seconds per suite, read and refreshed as `handbook/specs/site-architecture.md` says under "`MEASURED_SECONDS` is read from CI's own lane logs" (each value's history: `git log -p` on this file).
const MEASURED_SECONDS: Readonly<Record<E2eSuiteName, number>> = {
  render: 45.4,
  motion: 3.6,
  turn: 13.1,
  verso: 13.4,
  zoom: 211.8,
  "zoom-gestures": 23.4,
  "glass-ceremony": 16.4,
  cards: 76.0,
  health: 0.0,
  fallback: 7.7,
  hunt: 12.8,
  "print-room": 76.1,
  prospect: 37.2,
  ribbon: 15.9,
  home: 125.3,
  landfall: 69.4,
  survey: 111.8,
  broadside: 15.1,
  "reading-room": 82.7,
  "room-instrument": 45.3,
  "room-ink": 6.6,
  "room-voyage": 7.9,
  "room-voyage-route": 20.8,
  "room-address": 51.9,
  runninghead: 22.7,
  cluster: 88.2,
  "chart-drawer": 210.2,
  "document-rooms": 14.5,
  "region-detail": 44.1,
  specimen: 9.8,
  corners: 213.6,
  stage: 312.7,
};

const laneSeconds = (suites: readonly E2eSuiteName[]) => suites.reduce((sum, name) => sum + MEASURED_SECONDS[name], 0);

// The slowest of four lanes at most 1.2 times an even split, which is what 0.6 meant at two (Alex, 2026-10-04, Issue #743).
const BALANCE_CAP = 0.3;
const laneHeadroom = (seconds: number, total: number) => (BALANCE_CAP * total - seconds) / (1 - BALANCE_CAP);
const balanceLine = (name: string, seconds: number, total: number): string => {
  const headroom = laneHeadroom(seconds, total);
  const room =
    headroom >= 0
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
  assert.ok(
    Math.abs((seconds - shed) / (total - shed) - BALANCE_CAP) < 1e-9,
    `shedding ${shed}s lands at ${(seconds - shed) / (total - shed)}, not on the cap`,
  );
  const red = balanceLine("Q", seconds, total);
  assert.ok(red.startsWith("lane Q is "), "the red message does not name the lane");
  assert.ok(
    red.includes(`${shed.toFixed(1)}s past the ${BALANCE_CAP} cap`),
    "the red message does not name the seconds to shed",
  );
  assert.doesNotMatch(red, /-\d/, "the red message carries a negative number, which reads as room where there is none");
  // The prover's round on f1b07c5 found `* 1000` passing with the seconds clause alone under test, and its round on 27150ab found the parenthetical's order and the lane name free.
  assert.ok(
    red.includes("61.2% of measured serial cost (420.0s of 686.4s, "),
    "the red message does not name the share, then the lane's seconds before the total",
  );
  const [under, underTotal] = [150, 600];
  const room = laneHeadroom(under, underTotal);
  assert.ok(room > 0, "a lane under the cap reports no room");
  assert.ok(
    Math.abs((under + room) / (underTotal + room) - BALANCE_CAP) < 1e-9,
    `adding ${room}s lands at ${(under + room) / (underTotal + room)}, not on the cap`,
  );
  const green = balanceLine("Q", under, underTotal);
  assert.ok(
    green.includes(`${room.toFixed(1)}s of room under the ${BALANCE_CAP} cap`),
    "the green-shaped message does not name the room",
  );
  assert.ok(
    green.includes("25.0% of measured serial cost (150.0s of 600.0s, "),
    "the green-shaped message does not name the share, then the lane's seconds before the total",
  );
});
