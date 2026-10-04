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
} from "../../e2e/support/lanes.ts";
import type { LaneResult } from "../../e2e/support/lanes.ts";
import {
  E2E_SUITE_ORDER,
  E2E_SUITES_VAR,
  NEEDS_PREDECESSOR,
  OPENS_ON_HOME,
  resolveSuiteSelection,
  runOutcome,
  suitesCertifiedByHealth,
} from "../../e2e/support/suites.ts";
import { E2E_PORT_VAR, E2E_DPORT_VAR, e2eOutSubdir } from "../../e2e/support/ports.ts";

const result = (over: Partial<LaneResult> & { name: string }): LaneResult => ({
  code: 0,
  ms: 1000,
  skipped: false,
  tally: null,
  ...over,
});

const everyLane = (over: Partial<LaneResult> = {}) =>
  E2E_LANES.map((lane) => result({ name: lane.name, ...over }));

const withLane = (name: string, over: Partial<LaneResult>) =>
  E2E_LANES.map((lane) => result({ name: lane.name, ...(lane.name === name ? over : {}) }));

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

test("a suite that reads its predecessor's page runs directly after it, and no suite that opens on the home page runs directly after home", () => {
  assert.ok(Object.keys(NEEDS_PREDECESSOR).length > 0 && OPENS_ON_HOME.length > 0, "an ordering roster is empty, so the sweep below checks nothing");
  for (const lane of E2E_LANES) {
    for (const [i, suite] of lane.suites.entries()) {
      const before = i === 0 ? null : lane.suites[i - 1]!;
      const needs = NEEDS_PREDECESSOR[suite];
      if (needs !== undefined) {
        assert.equal(before, needs, `lane ${lane.name} runs ${suite} after ${before ?? "nothing, on the harness's boot page"}, but it reads the page ${needs} leaves`);
      }
      if (before === "home") {
        assert.ok(!OPENS_ON_HOME.includes(suite), `lane ${lane.name} runs ${suite} directly after home, so its first navigate to / returns on home's stale document`);
      }
    }
  }
});

test("no lane is empty, since an empty lane's child is handed an empty selection and the runner reads that as the whole suite", () => {
  for (const lane of E2E_LANES) {
    const selection = resolveSuiteSelection(laneChildEnv(lane, {}));
    assert.equal(selection.tier, "custom", `lane ${lane.name} resolves to the ${selection.tier} tier, so its runner runs ${selection.names.length} suites rather than its own`);
    assert.deepEqual(selection.names, lane.suites, `lane ${lane.name}'s runner would run ${selection.names.join(", ")}, not the lane's own suites`);
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
    assert.equal(envs[i]![E2E_SUITES_VAR], lane.suites.join(","), `lane ${lane.name} runs the wrong suites`);
    assert.equal(envs[i]![E2E_PORT_VAR], String(lane.port));
    assert.equal(envs[i]![E2E_DPORT_VAR], String(lane.dport));
    assert.equal(envs[i]!["VELLUM_BROWSER"], "/usr/bin/google-chrome", "the browser choice was dropped");
    assert.equal(envs[i]!["VELLUM_REQUIRE_BROWSER"], "1", "the require-browser guard was dropped");
    assert.ok(!("UNSET" in envs[i]!), "an unset ambient var leaked in as undefined");
  }
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

test("a lane failing fails the run and the line says which lane", () => {
  const green = laneOutcome(everyLane());
  assert.equal(green.ok, true, "every lane green must pass");
  assert.match(green.line, /ALL LANES PASS/);
  for (const lane of E2E_LANES) {
    const red = laneOutcome(withLane(lane.name, { code: 1 }));
    assert.equal(red.ok, false, `lane ${lane.name} failing did not fail the run`);
    assert.match(red.line, new RegExp(`LANE ${lane.name} FAILED`), `the line does not name failing lane ${lane.name}`);
    assert.doesNotMatch(red.line, /ALL LANES PASS/);
  }
  const all = laneOutcome(everyLane({ code: 1 }));
  assert.equal(all.ok, false);
  assert.match(all.line, new RegExp(`LANE ${E2E_LANES.map((l) => l.name).join(" and ")} FAILED`), "the line does not name every failing lane");
});

test("a harness error is reported as its own category, not as a failed check", () => {
  for (const lane of E2E_LANES) {
    const crashed = laneOutcome(withLane(lane.name, { code: 2 }));
    assert.equal(crashed.ok, false, `lane ${lane.name}'s harness error did not fail the run`);
    assert.ok(crashed.line.includes(`${lane.name} HARNESS ERROR (exit 2)`), `exit 2 on lane ${lane.name} is a harness error, not a failed check, and the line does not say so: ${crashed.line}`);
    const failed = laneOutcome(withLane(lane.name, { code: 1 })).line;
    assert.ok(failed.includes(`${lane.name} failed (exit 1)`), `exit 1 on lane ${lane.name} is a failed check, and the line does not say so: ${failed}`);
    assert.doesNotMatch(failed, /HARNESS ERROR/, `exit 1 on lane ${lane.name} reads as a harness error, so a red check looks like infrastructure`);
  }
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

  const counted = laneOutcome(everyLane({ tally: { passed: 99, total: 100 } }));
  const n = E2E_LANES.length;
  assert.ok(counted.line.includes(`${99 * n}/${100 * n} checks`), `the lanes' passes and totals must each be summed onto the combined line: ${counted.line}`);
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
    join(import.meta.dirname, "..", "..", "e2e", "run.ts"),
    "utf8",
  );
  const printed = runner.match(/"(SKIP:[^"]*)"/);
  assert.ok(printed, "the runner no longer prints a SKIP: line, so the driver watches for nothing");
  assert.ok(laneLineIsSkip(printed[1]!), `the driver does not recognise the runner's own ${printed[1]}`);
  assert.ok(!laneLineIsSkip("PASS  R1 the chart draws"), "a passing check must not read as a skip");
  assert.ok(!laneLineIsSkip("  SKIP: indented"), "only the runner's own line counts, not a mention of one");
});

test("lanes that skipped for want of a browser never read as a pass", () => {
  // The single-lane runner exits 0 when it skips, so the lanes do too; only the LINE can say so.
  const skipped = laneOutcome(everyLane({ skipped: true }));
  assert.doesNotMatch(skipped.line, /ALL LANES PASS/, "a fully skipped run must not read as a pass");
  assert.match(skipped.line, new RegExp(`LANE ${E2E_LANES.map((l) => l.name).join(" and ")} SKIPPED`), "the line does not name every skipped lane");

  for (const lane of E2E_LANES) {
    const one = laneOutcome(withLane(lane.name, { skipped: true }));
    assert.doesNotMatch(one.line, /ALL LANES PASS/, `a run where lane ${lane.name} skipped must not read as a pass`);
    assert.match(one.line, new RegExp(`LANE ${lane.name} SKIPPED`), `the line does not name skipped lane ${lane.name}`);
  }

  const required = laneOutcome(withLane(E2E_LANES[1]!.name, { code: 1, skipped: true }));
  assert.equal(required.ok, false, "a lane that exited non-zero must fail even if it printed SKIP");
});
