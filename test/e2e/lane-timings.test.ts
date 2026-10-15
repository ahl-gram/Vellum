import { test } from "node:test";
import assert from "node:assert/strict";
import { E2E_LANES } from "../../e2e/support/lanes.ts";
import { E2E_SUITE_ORDER } from "../../e2e/support/suites.ts";
import type { E2eSuiteName } from "../../e2e/support/suites.ts";

// CI seconds per suite (Issue #763, 2026-10-06): the median of the runner's own per-suite wall clock over the slow runner tier, the lane jobs whose suite total is at least 0.95 of that lane's slowest, across every run whose head held Issue #762's pull request D (main 37526087943 to 37541080266 and nine pull request runs, 56 lane jobs, 7 to 9 a suite), since the runners come in three speeds and a plain median mixed them unevenly across lanes; read with `gh api --allow-escape-sequences repos/ahl-gram/Vellum/actions/jobs/<job>/logs` and the lines under `per-suite wall clock`; corners and stage, split from the corners suite those runs read (426.2) by Issue #763's ruling 1B, from that pull request's own slow-tier lane logs (runs 37573532752 and 37574662411: corners 211.8 and 215.3, stage 212.4; the first run's lane B drew the fast tier and is left out by the same rule); a new suite enters an estimate and is corrected from its pull request's own lane log; runninghead, cluster, document-rooms and specimen re-measured by Issue #779 part 2f (2026-10-09), each the committed value times its median over that pull request's slow-tier lane jobs (runs 38013530350 and 38013480434) over its median over main's (38006409805, and 37998664257 where its lane drew the slow tier), save specimen, whose lane drew the fast tier in both of that pull request's runs, scaled by its local ratio instead (6.5 s over 6.1 s, main 2cd57d74 against the branch, one at a time); home, landfall, cluster and specimen re-measured by Issue #779 part 2f's second pull request (2026-10-10) the same way, over its slow-tier lane jobs (runs 38045277166 and 38045247394) against main's slow-tier same-lane job (38020348372 for lanes B and D, 38018414672 for lane C); hunt, print-room, prospect, ribbon and chart-drawer re-measured by Issue #779 part 2g's first pull request (2026-10-10) the same way, over its slow-tier lane jobs (lane A in runs 38071282977 and 38071499557, lane B in 38063204452, 38071282977 and 38071499557, lane D in 38068834224 and 38071499557) against main's (lane A in 38049702205, 38048211838, 38020348372 and 38018414672, lane B in 38059105744, 38049702205, 38020348372 and 38018414672, lane D in 38059105744, 38059071865, 38049702205, 38048211838 and 38020348372); reading-room, room-instrument, room-address and chart-drawer re-measured by Issue #779 part 2g's second pull request (2026-10-10) the same way, over its slow-tier lane jobs (lane A in 38083069834 and 38095855798, lane B in 38095855798 and 38095874291, lane C in 38084836978 and 38095874291, lane D in 38095874291, after CD44 left the suite) against the same lanes on heads that hold those suites as main does (lane A in 38071282977, 38071499557 and 38073618162, lane B in 38071282977, 38071499557, 38073618162 and 38075428497, lane C in 38071499557, 38072581204 and 38073618162, lane D in 38071499557 and 38073618162); broadside, runninghead, reading-room, cards, glass-ceremony, render, zoom, specimen, home and room-instrument re-measured by Issue #779 part 2h (2026-10-13) the same way, over its slow-tier lane jobs (lane A in runs 38339227787, 38346541894, 38346692758, 38349486929 and 38350406265, lane B in 38339227787, 38346692758, 38349486929 and 38350406265, lane C in 38346692758, 38349486929 and 38350406265, every head holding all 31 of its checks) against main's (lane A in 38100572018, 38190437841, 38194585646 and 38200625316, lane B in 38100572018 and 38191378114, lane C in 38190437841, 38191378114 and 38200625316); zoom-gestures re-measured by Issue #778's first pull request (2026-10-14) the same way, 21.1 s on its slow-tier lane A job (run 38499414430, the lane at 472.7 s) against 9.1 s on main's (run 38435481618, the lane at 457.6 s, the one other lane A job within 0.95 of the slowest), so 9.4 times 21.1 over 9.1; landfall and chart-drawer not re-measured, since that run's lane D job (417.6 s) fell short of 0.95 of the slowest lane D job read (443.8 s) and each reads the same locally with and without the pull request (landfall 62.0 s against 62.1 s, chart-drawer 102.7 s against 103.3 s); stage and cluster re-measured by Issue #778's second pull request (2026-10-15) the same way, against main's lane B job in run 38659771297 (stage 212.2 s, cluster 16.2 s, the lane's eight other suites 207.2 s) over its own in run 38732601084 (stage 199.7 s, cluster 14.0 s, the eight others 165.6 s), each scaled by the eight others' ratio since one job a side cannot be sorted by tier, with EA7 and EA8 skipped under Issue #897.
const MEASURED_SECONDS: Readonly<Record<E2eSuiteName, number>> = {
  render: 45.4,
  motion: 3.6,
  turn: 13.1,
  verso: 13.4,
  zoom: 138.4,
  "zoom-gestures": 21.8,
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
  cluster: 18.1,
  "chart-drawer": 210.2,
  "document-rooms": 14.5,
  "region-detail": 44.1,
  specimen: 9.8,
  corners: 213.6,
  stage: 250.1,
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
