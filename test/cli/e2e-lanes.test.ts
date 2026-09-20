import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  E2E_LANES,
  LANE_FLAG,
  ambientSelectionRefusal,
  laneCheckTally,
  laneChildEnv,
  laneLineIsSkip,
  laneOutcome,
  resolveLaneSelection,
  splitLaneChunk,
} from "../../src/cli/e2e-lanes.ts";
import type { LaneResult } from "../../src/cli/e2e-lanes.ts";
import {
  E2E_SUITE_ORDER,
  E2E_SUITES_VAR,
  runOutcome,
  suitesCertifiedByHealth,
} from "../../src/cli/e2e-suites.ts";
import type { E2eSuiteName } from "../../src/cli/e2e-suites.ts";
import { E2E_PORT_VAR, E2E_DPORT_VAR, e2eOutSubdir } from "../../src/cli/e2e-ports.ts";

// Seconds per suite, from the runner's own timing table on a 16-core Mac (undated entries measured 2026-08-14); refresh from that same output when the split is revisited.
const MEASURED_SECONDS: Readonly<Record<E2eSuiteName, number>> = {
  "survey": 51.4,
  "zoom": 45.8,
  "reading-room": 27.1,
  "room-instrument": 22.0,
  "print-room": 24.8, // measured 2026-09-11, local single-suite run: PR35 and its two page-box resizes (#565) since the 2026-08-14 21.9s
  "room-address": 19.3,
  "render": 13.0,
  "room-voyage-route": 9.0,
  "glass-ceremony": 8.1,
  "prospect": 5.2, // measured 2026-08-15, local single-suite run
  "ribbon": 1.9, // measured 2026-08-20, local single-suite run
  "verso": 7.1,
  "turn": 6.5,
  "runninghead": 6.6, // measured 2026-09-11, three local single-suite runs at 4.9, 5.1 and 6.6 with RH10d and RH10e added (#565, a Letter resize and a settle on an already-open Gallery); the highest taken, a lane budget erring upward
  "cluster": 4.7, // measured 2026-08-28, local single-suite run
  "chart-drawer": 66.0, // re-measured 2026-09-19 with #634's seven checks, CD36 to CD42, for 46 total. The sweep: four runs at 45 checks read 61.4, 61.5, 61.7 and 61.4, and the 46-check shape that shipped at PR #635 read 61.6, so 66.0 is the worst case plus about 7%. The 45-check runs are named as what they are rather than attributed to the shipped shape, which an earlier version of this line did and the cold review's round 3 on PR #635 caught. It leaves lane B at 59.685% against the 0.6 this file reds at. The bound is NOT the total held fixed, which is the arithmetic that gives a wrong 1.5s and the cold review on PR #635 caught: seconds added to a lane-B suite raise the denominator too, so `share <= 0.6` on `B/(A+B)` solves to `B <= 1.5 * A`, which is 303.45 against lane B's 299.50. Three point nine five seconds of headroom, and the next addition to this lane rebalances the lanes rather than raising a number. The six runs at 58.7 to 60.3 were the 44-check suite before the cold review on PR #635 added CD41, and one run at 67.9 is excluded and named: it is the same 45 checks with CD41 leaving by the Prospect page, whose plate render bought the check nothing and cost the lane 6.5s, so it goes out by the FAQ instead. Lane B's headroom is what bounds this from above, not the sweep, and the cap is 69.95 by the `B <= 1.5 * A` solve below. A fifth run that read 88.1 is excluded and named: a 30s readiness wait timed out in it, the check has since been rewritten and the failure carries a row in the flake record. CD23's 8.45s of SAY_HOLD_MS + SAY_FADE_MS is still a floor no machine can undercut, so the PRINCIPLE bounds it from below and the sweep sets the budget above. #583 took it to 47 with CD43 and did NOT move this number, which is a measurement and not an assumption: CD43 reads its own one-shot payload, timed at 0.192ms per suite run (200 calls in 38.4ms, 2026-09-19), so it is four orders below the run-to-run spread. The shape that rode SURFACES instead was rejected on its own measurement, 62.5/61.8/62.0 before against 63.1/63.4/65.0 after, a 1.73s mean delta against a 0.7s spread, because that payload is polled by four settles here and read again by the CD13 and CD18 steps. The history: 54.0 was the 39-check suite at #631, 45.7 the 23-check one at #547, 6.9 the 11-check one at #520
  "room-drawer": 7.3, // measured 2026-08-28, local single-suite run
  "document-rooms": 6.0, // measured 2026-08-29, local run
  "broadside": 3.8,
  "hunt": 3.4,
  "room-voyage": 3.3,
  "zoom-gestures": 3.1,
  "home": 99.5, // re-measured 2026-08-25, local run: Subs 3-4a tripled the suite since the 2026-08-14 3.1s
  "landfall": 23.3, // measured 2026-08-25, local single-suite run
  "cards": 8.6, // re-measured 2026-09-20 with #633's P19 to P24 and P restore, for 52 checks: three local single-suite runs read 6.5, 6.5 and 7.9 against the 2.9 of the 44-check suite, so 8.6 is the worst case plus about 9%
  "motion": 2.4,
  "room-ink": 2.4,
  "fallback": 2.2,
  "region-detail": 15.4, // measured 2026-08-23, local run
  "specimen": 8.3, // measured 2026-09-11, local single-suite run: SB9d's scripts-off navigate and its re-boot, over the 7.2 to 7.5 three runs read that day with SB9c alone (SB8b to SB8e and SB9b were the 2026-09-10 7.3)
  "health": 0.0,
};

const laneSeconds = (suites: readonly E2eSuiteName[]) =>
  suites.reduce((sum, name) => sum + MEASURED_SECONDS[name], 0);

const result = (over: Partial<LaneResult> & { name: string }): LaneResult => ({
  code: 0,
  ms: 1000,
  skipped: false,
  tally: null,
  ...over,
});

const everyLane = (over: Partial<LaneResult> = {}) =>
  E2E_LANES.map((lane) => result({ name: lane.name, ...over }));

test("the lanes are an exact partition of the runner's suites, so nothing is dropped or doubled", () => {
  // Counted suite by suite: a union or count check passes a swap that drops one and duplicates another.
  for (const suite of E2E_SUITE_ORDER) {
    const carrying = E2E_LANES.filter((lane) => lane.suites.includes(suite)).map((l) => l.name);
    assert.equal(carrying.length, 1, `${suite} runs in ${carrying.length} lanes (${carrying.join(", ") || "none"})`);
  }
  for (const lane of E2E_LANES) {
    assert.equal(new Set(lane.suites).size, lane.suites.length, `lane ${lane.name} names a suite twice`);
    for (const suite of lane.suites) {
      assert.ok(E2E_SUITE_ORDER.includes(suite), `lane ${lane.name} names ${suite}, which is not a runner suite`);
    }
  }
});

test("every suite that inherits the harness page shares a lane with render", () => {
  // waitSettled resolves on ANY settled page, so an inheritor without render settles on the boot auto-draw.
  const renderLane = E2E_LANES.find((lane) => lane.suites.includes("render"));
  assert.ok(renderLane, "no lane runs render at all");
  for (const inheritor of ["motion", "turn", "verso", "glass-ceremony", "cards", "fallback"] as const) {
    assert.ok(
      renderLane.suites.includes(inheritor),
      `${inheritor} inherits the harness page but runs in a lane without render`,
    );
  }
  assert.equal(renderLane.suites[0], "render", "render must lead its lane, so it consumes the boot draw first");
});

test("splitting into lanes costs no console/network certification", () => {
  // health certifies only what precedes it, so the lanes must keep that whole prefix together.
  const certifiedSerially = suitesCertifiedByHealth(E2E_SUITE_ORDER);
  const healthLane = E2E_LANES.find((lane) => lane.suites.includes("health"));
  assert.ok(healthLane, "no lane runs health, so nothing carries a console/network clean bill");
  assert.deepEqual(
    suitesCertifiedByHealth(healthLane.suites).slice(),
    certifiedSerially.slice(),
    "the lane split moved a suite out from under N1/N2, so it is no longer certified anywhere",
  );
});

test("each lane runs its suites in the runner's canonical order", () => {
  for (const lane of E2E_LANES) {
    const ranks = lane.suites.map((s) => E2E_SUITE_ORDER.indexOf(s));
    assert.deepEqual(ranks, ranks.slice().sort((a, b) => a - b), `lane ${lane.name} is out of runner order`);
  }
});

test("the lanes never share a name, a port, a debug port, or an output directory", () => {
  const names = E2E_LANES.map((l) => l.name);
  assert.equal(new Set(names).size, names.length, `two lanes share a name (${names.join(", ")}), so --lane picks one of them and the other runs in no job at all`);
  const ports = E2E_LANES.map((l) => l.port);
  const dports = E2E_LANES.map((l) => l.dport);
  const outs = ports.map(e2eOutSubdir);
  assert.equal(new Set(ports).size, ports.length, "two lanes bind the same server port");
  assert.equal(new Set(dports).size, dports.length, "two lanes would attach to the same browser");
  assert.equal(new Set(outs).size, outs.length, `the lanes write to the same out dir (${outs.join(", ")})`);
  for (const port of ports) {
    assert.ok(!dports.includes(port), `port ${port} is also a debug port, so a lane would collide with the other`);
  }
});

test("a lane's child env carries its own suites and ports, and inherits the rest", () => {
  const base = { VELLUM_BROWSER: "/usr/bin/google-chrome", VELLUM_REQUIRE_BROWSER: "1", UNSET: undefined };
  const envs = E2E_LANES.map((lane) => laneChildEnv(lane, base));
  for (const [i, lane] of E2E_LANES.entries()) {
    assert.equal(envs[i][E2E_SUITES_VAR], lane.suites.join(","), `lane ${lane.name} runs the wrong suites`);
    assert.equal(envs[i][E2E_PORT_VAR], String(lane.port));
    assert.equal(envs[i][E2E_DPORT_VAR], String(lane.dport));
    assert.equal(envs[i]["VELLUM_BROWSER"], "/usr/bin/google-chrome", "the browser choice was dropped");
    assert.equal(envs[i]["VELLUM_REQUIRE_BROWSER"], "1", "the require-browser guard was dropped");
    assert.ok(!("UNSET" in envs[i]), "an unset ambient var leaked in as undefined");
  }
  assert.notEqual(envs[0][E2E_PORT_VAR], envs[1][E2E_PORT_VAR], "both lanes were handed the same port");
  assert.notEqual(envs[0][E2E_DPORT_VAR], envs[1][E2E_DPORT_VAR], "both lanes were handed the same debug port");
  assert.notEqual(envs[0][E2E_SUITES_VAR], envs[1][E2E_SUITES_VAR], "both lanes were handed the same suites");
});

test("--lane names one lane and no flag names every lane", () => {
  assert.deepEqual(
    resolveLaneSelection([]).map((l) => l.name),
    E2E_LANES.map((l) => l.name),
    "a driver run with no flag no longer runs every lane",
  );
  for (const lane of E2E_LANES) {
    assert.deepEqual(resolveLaneSelection([LANE_FLAG, lane.name]).map((l) => l.name), [lane.name]);
    assert.deepEqual(resolveLaneSelection([`${LANE_FLAG}=${lane.name}`]).map((l) => l.name), [lane.name]);
  }
  const picked = resolveLaneSelection([LANE_FLAG, E2E_LANES[1]!.name])[0]!;
  assert.equal(picked, E2E_LANES[1], "the selected lane is not the roster's own entry");
});

test("a --lane the roster does not carry is refused, never widened to every lane", () => {
  for (const bad of ["Q", "a", "A,B", "AB"]) {
    assert.throws(
      () => resolveLaneSelection([LANE_FLAG, bad]),
      /names a lane that does not exist/,
      `${LANE_FLAG} ${bad} was accepted, so a misspelling runs some other amount of the suite`,
    );
  }
  for (const empty of [[LANE_FLAG], [LANE_FLAG, ""], [`${LANE_FLAG}=`]]) {
    assert.throws(
      () => resolveLaneSelection(empty),
      /was given no lane name/,
      `${JSON.stringify(empty)} ran instead of refusing`,
    );
  }
  assert.throws(() => resolveLaneSelection(["--lanes", "A"]), /does not take/, "an unknown argument was ignored");
  assert.throws(
    () => resolveLaneSelection([LANE_FLAG, "A", LANE_FLAG, "B"]),
    /more than once/,
    "a repeated flag silently kept one of the two lanes",
  );
});

test("one selected lane passes on its own, and its line never reads as the whole suite", () => {
  const lane = E2E_LANES[0]!;
  const alone = laneOutcome([result({ name: lane.name, tally: { passed: 284, total: 284 } })], [lane]);
  assert.equal(alone.ok, true, "a one-lane job that passed must exit 0, or no matrix shard can ever be green");
  assert.match(alone.line, new RegExp(`LANE ${lane.name} PASS`), "the line does not say which lane passed");
  assert.match(
    alone.line,
    new RegExp(`1 of ${E2E_LANES.length} lanes`),
    "the line does not say how much of the suite this run was",
  );
  assert.doesNotMatch(alone.line, /ALL LANES PASS/, "one lane reads as every lane");
  assert.match(alone.line, /284\/284 checks/, "the lane's own tally is dropped");
});

test("the only selected lane failing still fails, and the line names that lane", () => {
  const lane = E2E_LANES[1]!;
  const red = laneOutcome([result({ name: lane.name, code: 1 })], [lane]);
  assert.equal(red.ok, false, "a failed lane must fail its own job");
  assert.match(red.line, new RegExp(`LANE ${lane.name} FAILED`), "the line does not name the failing lane");
});

test("every line a one-lane run can print says how much of the suite it was", () => {
  const lane = E2E_LANES[0]!;
  const alone = (over: Partial<LaneResult>) => laneOutcome([result({ name: lane.name, ...over })], [lane]).line;
  const both = (over: Partial<LaneResult>) => laneOutcome(everyLane(over)).line;
  const qualifier = new RegExp(`1 of ${E2E_LANES.length} lanes`);
  for (const [what, over] of [["passed", {}], ["skipped", { skipped: true }], ["failed", { code: 1 }]] as const) {
    assert.match(alone(over), qualifier, `a one-lane run that ${what} does not say it ran one lane of ${E2E_LANES.length}`);
    assert.doesNotMatch(both(over), qualifier, `a run of every lane that ${what} claims to be a single shard`);
    // Beside the count and not instead of it: the count is blind to a whole run claiming "2 of 2 lanes, not the full suite", which is the shape the prover reached by making the scope phrase unconditional (2026-09-14).
    assert.doesNotMatch(
      both(over),
      /not the full suite/,
      `a run of every lane that ${what} says it covered less than the full suite`,
    );
  }
});

test("a SELECTED lane that never reported still fails, so a driver that lost one cannot pass", () => {
  const partial = laneOutcome([result({ name: E2E_LANES[0]!.name })], E2E_LANES);
  assert.equal(partial.ok, false, "a short result set passed against its own selection");
  assert.match(partial.line, /never reported/);
  assert.match(partial.line, new RegExp(`lane .*${E2E_LANES[1]!.name}`), "the line does not name the absent lane");
});

test("an ambient suite selection is refused, since the lanes ARE the selection", () => {
  for (const raw of ["smoke", "render", "full"]) {
    const refusal = ambientSelectionRefusal({ [E2E_SUITES_VAR]: raw });
    assert.ok(refusal, `${raw} was allowed to narrow the lanes`);
    assert.match(refusal, new RegExp(E2E_SUITES_VAR));
  }
  assert.equal(ambientSelectionRefusal({}), null);
  assert.equal(ambientSelectionRefusal({ [E2E_SUITES_VAR]: "" }), null);
  assert.equal(ambientSelectionRefusal({ [E2E_SUITES_VAR]: "  " }), null);
});

test("the split is balanced against measured cost, not check counts", () => {
  const total = laneSeconds(E2E_SUITE_ORDER);
  for (const lane of E2E_LANES) {
    const share = laneSeconds(lane.suites) / total;
    // Since #623 put one job on each runner the wall clock IS max(A, B), so an unbalanced pair wastes the parallelism it was split for and balance matters more here than it did inside one job, not less (Alex, 2026-09-14).
    assert.ok(
      share <= 0.6,
      `lane ${lane.name} is ${(share * 100).toFixed(1)}% of measured serial cost, so that shard alone sets the wall clock while the other idles`,
    );
  }
});

test("a lane failing fails the run and the line says which lane", () => {
  const green = laneOutcome([result({ name: "A" }), result({ name: "B" })]);
  assert.equal(green.ok, true, "two green lanes must pass");
  assert.match(green.line, /ALL LANES PASS/);

  const bFailed = laneOutcome([result({ name: "A" }), result({ name: "B", code: 1 })]);
  assert.equal(bFailed.ok, false, "a failed lane must fail the run");
  assert.match(bFailed.line, /LANE B/, "the line does not name the failing lane");
  assert.doesNotMatch(bFailed.line, /ALL LANES PASS/);

  const aFailed = laneOutcome([result({ name: "A", code: 1 }), result({ name: "B" })]);
  assert.equal(aFailed.ok, false);
  assert.match(aFailed.line, /LANE A/, "the line does not name the failing lane");

  const both = laneOutcome([result({ name: "A", code: 1 }), result({ name: "B", code: 1 })]);
  assert.equal(both.ok, false);
  assert.match(both.line, /A/);
  assert.match(both.line, /B/);
});

test("a harness error is reported as its own category, not as a failed check", () => {
  const crashed = laneOutcome([result({ name: "A" }), result({ name: "B", code: 2 })]);
  assert.equal(crashed.ok, false);
  assert.match(crashed.line, /2/, "exit 2 must survive into the line");
  assert.match(crashed.line, /harness/i, "exit 2 is a harness error, not a failed check");
});

test("no lanes at all fails instead of reporting a vacuous pass", () => {
  assert.equal(laneOutcome([]).ok, false);
  assert.match(laneOutcome([]).line, /FAIL/);
});

test("a selection of no lanes fails, and a lane nobody selected cannot report into the run", () => {
  const nothingAsked = laneOutcome([result({ name: E2E_LANES[0]!.name })], []);
  assert.equal(nothingAsked.ok, false, "a run asked for no lanes at all reported a pass");
  // Its own message, not just ok false: every result is a stray when nothing was selected, so the stray refusal below would catch this case too and a test reading only the verdict cannot tell which fired.
  assert.match(nothingAsked.line, /no lanes were selected/, "an empty selection is reported as something other than an empty selection");
  assert.doesNotMatch(nothingAsked.line, /0 of/, "the line offers a count where it should refuse the run");

  const stray = laneOutcome(everyLane(), [E2E_LANES[1]!]);
  assert.equal(stray.ok, false, "a lane outside the selection reported into the run and it passed anyway");
  assert.match(stray.line, /never selected/, "the line does not say the run is not the one that was asked for");
  assert.match(stray.line, new RegExp(E2E_LANES[0]!.name), "the line does not name the lane that was not asked for");
});

test("a lane that never reported fails the run, so half the suite cannot pass as all of it", () => {
  for (const lane of E2E_LANES) {
    const partial = laneOutcome([result({ name: lane.name })]);
    assert.equal(partial.ok, false, `a run of lane ${lane.name} alone reported a pass`);
    assert.match(partial.line, /never reported/, "the line must say a lane is missing, not just fail");
    for (const absent of E2E_LANES.filter((l) => l.name !== lane.name)) {
      assert.match(partial.line, new RegExp(`lane .*${absent.name}`), `the line does not name absent lane ${absent.name}`);
    }
  }
  assert.equal(laneOutcome(everyLane()).ok, true, "every lane reporting green must still pass");
});

test("the combined line states the check total the acceptance criterion names", () => {
  // Built from runOutcome, not a hand-written format: a reworded tally would silently report no counts.
  assert.deepEqual(laneCheckTally(runOutcome([{ ok: true }, { ok: true }]).line), { passed: 2, total: 2 });
  assert.deepEqual(laneCheckTally(runOutcome([{ ok: true }, { ok: false }]).line), { passed: 1, total: 2 });
  assert.equal(laneCheckTally("shot -> out/e2e/explorer.png (1584px tall)"), null, "only the outcome line carries a tally");
  assert.equal(laneCheckTally("PASS  R1 the chart draws"), null);

  const counted = laneOutcome(everyLane({ tally: { passed: 100, total: 100 } }));
  assert.match(counted.line, /200\/200 checks/, "the lanes' tallies must be summed onto the combined line");
  assert.match(laneOutcome(everyLane()).line, /ALL LANES PASS/, "a run with no tally read must still report");
  assert.doesNotMatch(laneOutcome(everyLane()).line, /checks/, "no tally read means no invented count");
});

test("a lane's output is split into whole lines, across chunk boundaries and at the end", () => {
  const first = splitLaneChunk("", "PASS one\nPASS tw");
  assert.deepEqual(first.lines, ["PASS one"]);
  assert.equal(first.rest, "PASS tw", "a partial line must be held, not emitted");
  const second = splitLaneChunk(first.rest, "o\nPASS three");
  assert.deepEqual(second.lines, ["PASS two"], "the held remainder must rejoin its own line");
  assert.equal(second.rest, "PASS three", "the unterminated tail is what `end` flushes");
  assert.deepEqual(splitLaneChunk("", "a\nb\nc\n"), { lines: ["a", "b", "c"], rest: "" });
  assert.deepEqual(splitLaneChunk("", ""), { lines: [], rest: "" });
  assert.deepEqual(splitLaneChunk("", "\n\n"), { lines: ["", ""], rest: "" }, "blank lines are lines");
});

test("the skip line the driver watches for is the one the runner actually prints", () => {
  // Read as source: a machine with a browser never takes this path, and a reworded SKIP would silently turn an empty run green.
  const runner = readFileSync(
    join(import.meta.dirname, "..", "..", "scripts", "e2e-explorer.mjs"),
    "utf8",
  );
  const printed = runner.match(/"(SKIP:[^"]*)"/);
  assert.ok(printed, "the runner no longer prints a SKIP: line, so the driver watches for nothing");
  assert.ok(laneLineIsSkip(printed[1]), `the driver does not recognise the runner's own ${printed[1]}`);
  assert.ok(!laneLineIsSkip("PASS  R1 the chart draws"), "a passing check must not read as a skip");
  assert.ok(!laneLineIsSkip("  SKIP: indented"), "only the runner's own line counts, not a mention of one");
});

test("lanes that skipped for want of a browser never read as a pass", () => {
  // The single-lane runner exits 0 when it skips, so the lanes do too; only the LINE can say so.
  const skipped = laneOutcome([
    result({ name: "A", skipped: true }),
    result({ name: "B", skipped: true }),
  ]);
  assert.doesNotMatch(skipped.line, /ALL LANES PASS/, "a fully skipped run must not read as a pass");
  assert.match(skipped.line, /SKIP/i);

  const half = laneOutcome([result({ name: "A" }), result({ name: "B", skipped: true })]);
  assert.doesNotMatch(half.line, /ALL LANES PASS/, "a half-skipped run must not read as a pass");
  assert.match(half.line, /SKIP/i);

  const required = laneOutcome([result({ name: "A" }), result({ name: "B", code: 1, skipped: true })]);
  assert.equal(required.ok, false, "a lane that exited non-zero must fail even if it printed SKIP");
});
