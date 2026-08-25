import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  E2E_LANES,
  ambientSelectionRefusal,
  laneCheckTally,
  laneChildEnv,
  laneLineIsSkip,
  laneOutcome,
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

// Seconds per suite, from the runner's own timing table on a 16-core Mac (entries carry their own
// dates; the undated bulk is 2026-08-14); refresh from that same output when the split is revisited.
const MEASURED_SECONDS: Readonly<Record<E2eSuiteName, number>> = {
  "survey": 51.4,
  "zoom": 45.8,
  "reading-room": 27.1,
  "room-instrument": 22.0,
  "print-room": 21.9,
  "room-address": 19.3,
  "render": 13.0,
  "room-voyage-route": 9.0,
  "glass-ceremony": 8.1,
  "prospect": 5.2, // measured 2026-08-15, local single-suite run (#242)
  "ribbon": 1.9, // measured 2026-08-20, local single-suite run
  "verso": 7.1,
  "turn": 6.5,
  "runninghead": 3.9,
  "broadside": 3.8,
  "hunt": 3.4,
  "room-voyage": 3.3,
  "zoom-gestures": 3.1,
  "home": 99.5, // re-measured 2026-08-25, local run (#460): Subs 3-4a tripled the suite since the 2026-08-14 3.1s
  "landfall": 23.3, // measured 2026-08-25, local single-suite run (#460)
  "cards": 2.9,
  "motion": 2.4,
  "room-ink": 2.4,
  "fallback": 2.2,
  "region-detail": 15.4, // measured 2026-08-23, local run (#400)
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

test("the lanes never share a port, a debug port, or an output directory", () => {
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
    // The rejected naive seam puts a lane at 65%, so the ceiling sits below it.
    assert.ok(
      share <= 0.6,
      `lane ${lane.name} is ${(share * 100).toFixed(1)}% of measured serial cost, so the lanes buy little`,
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
  // Telling contention flake from a real regression starts with knowing the browser never came up.
  const crashed = laneOutcome([result({ name: "A" }), result({ name: "B", code: 2 })]);
  assert.equal(crashed.ok, false);
  assert.match(crashed.line, /2/, "exit 2 must survive into the line");
  assert.match(crashed.line, /harness/i, "exit 2 is a harness error, not a failed check");
});

test("no lanes at all fails instead of reporting a vacuous pass", () => {
  assert.equal(laneOutcome([]).ok, false);
  assert.match(laneOutcome([]).line, /FAIL/);
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

  // VELLUM_REQUIRE_BROWSER turns the skip into a non-zero exit, which must still fail.
  const required = laneOutcome([result({ name: "A" }), result({ name: "B", code: 1, skipped: true })]);
  assert.equal(required.ok, false, "a lane that exited non-zero must fail even if it printed SKIP");
});
