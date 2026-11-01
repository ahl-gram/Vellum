import { test } from "node:test";
import assert from "node:assert/strict";
import { E2E_LANES } from "../../e2e/support/lanes.ts";
import { E2E_SUITE_ORDER } from "../../e2e/support/suites.ts";
import type { E2eSuiteName } from "../../e2e/support/suites.ts";

// CI seconds per suite, read and refreshed as `handbook/specs/site-architecture.md` says under "`MEASURED_SECONDS` is read from CI's own lane logs" (each value's history: `git log -p` on this file).
const MEASURED_SECONDS: Readonly<Record<E2eSuiteName, number>> = {
  render: 39.6,
  motion: 3.5,
  turn: 11.8,
  verso: 12.1,
  zoom: 224.0,
  "zoom-gestures": 21.1,
  "glass-ceremony": 18.0,
  cards: 74.9,
  health: 0.0,
  fallback: 6.9,
  hunt: 11.0,
  "print-room": 78.6,
  prospect: 34.5,
  ribbon: 14.6,
  home: 124.1,
  landfall: 61.5,
  survey: 72.7,
  broadside: 12.7,
  "reading-room": 60.3,
  "room-instrument": 29.8,
  "room-ink": 4.7,
  "room-voyage": 6.1,
  "room-voyage-route": 14.1,
  "room-address": 36.5,
  runninghead: 26.8,
  cluster: 62.9,
  "chart-drawer": 210.8,
  "document-rooms": 16.7,
  "region-detail": 61.0,
  specimen: 15.3,
  "writing-room": 15.0,
  corners: 156.2,
  stage: 329.0,
  "slide-away": 98.4,
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
