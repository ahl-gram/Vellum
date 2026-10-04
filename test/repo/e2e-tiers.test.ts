import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { E2E_SUITE_ORDER, SMOKE_SUITES, E2E_SUITES_VAR } from "../../e2e/support/suites.ts";
import type { E2eSuiteName } from "../../e2e/support/suites.ts";
import { E2E_LANES } from "../../e2e/support/lanes.ts";
import { BUNDLE_ENTRIES } from "../../scripts/build-app-bundles.ts";
import { e2eSuiteFamily, e2eSuitePath, readE2eSource } from "../../test-support/e2e-source.ts";
import { containment, CTX_THROWING_WAITS } from "../../test-support/e2e-containment.ts";

// The runner starts a browser the moment it is imported and ci.yml is YAML, so both are read as source.

const ROOT = resolve(import.meta.dirname, "..", "..");
const src = (p: string) => readE2eSource(join(ROOT, p));
const RUNNER = src("e2e/run.ts");
const CI = src(".github/workflows/ci.yml");
// A source scan reads the CODE, not the file: commenting a line out in place leaves its literal behind, and a raw match cannot tell the two apart. Blind spots, both of which cost a false red rather than a miss: a `//` inside a string literal reads as a comment, and a /* */ block is not seen at all.
const uncommented = (source: string) => source.split("\n").filter((line) => !line.trim().startsWith("//")).join("\n");
const RUNNER_CODE = uncommented(RUNNER);

// YAML's own comment leader, for the same reason: this pass rewrote ci.yml's prose, and a sentence about fail-fast would otherwise satisfy the guard that fail-fast is SET.
const ciUncommented = (lines: readonly string[]) => lines.filter((l) => !l.trim().startsWith("#")).join("\n");
// A ci.yml job block is a two-space key under `jobs:`, read to the next one. Blind spot, named because a scanner cannot enumerate its own: a workflow indented any other way yields NO blocks, which the job-count anchor below turns into a red rather than a silent pass.
// Second blind spot, same direction: the continue-on-error refusal reads the literal `true` alone, so `${{ }}`, `True` and `yes` slip past it, which costs a miss and never a false red, and the job-count anchor still forces a reader through this sweep whenever a job is added.
const ciJobBlocks = (): ReadonlyArray<{ id: string; lines: readonly string[] }> => {
  const lines = CI.split("\n");
  const at = lines.indexOf("jobs:");
  assert.notEqual(at, -1, "ci.yml has no top-level `jobs:` key, so this reader is looking at the wrong shape");
  const heads: Array<{ id: string; from: number }> = [];
  for (let i = at + 1; i < lines.length; i++) {
    const head = lines[i]!.match(/^ {2}([A-Za-z0-9_-]+):\s*$/);
    if (head) heads.push({ id: head[1]!, from: i });
  }
  return heads.map((h, n) => ({ id: h.id, lines: lines.slice(h.from, heads[n + 1]?.from ?? lines.length) }));
};

const runnerSuiteKeys = (): string[] => {
  const block = RUNNER_CODE.match(/const SUITES = \{([\s\S]*?)\n\};/);
  assert.ok(block, "the runner's SUITES map was not found; this guard is reading the wrong shape");
  return [...block[1]!.matchAll(/^\s*"([\w-]+)":/gm)].map((m) => m[1]!);
};

test("E2E_SUITE_ORDER is exactly the runner's SUITES map, in the same order", () => {
  assert.deepEqual(runnerSuiteKeys(), E2E_SUITE_ORDER.slice());
});

test("each suite name maps to the run function imported from its own file", () => {
  const aliasFor = new Map(
    [...RUNNER_CODE.matchAll(/import \{ run as (\w+) \} from "\.\/suites\/([\w-]+)\.ts"/g)].map((m) => [m[2], m[1]]),
  );
  const block = RUNNER_CODE.match(/const SUITES = \{([\s\S]*?)\n\};/);
  if (!block) throw new Error("the runner's SUITES map was not found");
  const body = block[1]!;
  for (const name of E2E_SUITE_ORDER) {
    const wired = body.match(new RegExp(`"${name}":\\s*(\\w+)`));
    if (!wired) throw new Error(`${name} has no SUITES entry`);
    assert.equal(wired[1], aliasFor.get(name), `${name} is wired to the wrong run function`);
  }
});

test("every named suite has a suite file the runner imports", () => {
  for (const name of E2E_SUITE_ORDER) {
    const file = e2eSuitePath(name);
    assert.ok(existsSync(join(ROOT, file)), `${name} has no ${file}`);
    assert.match(RUNNER_CODE, new RegExp(`from "\\./suites/${name}\\.ts"`), `${name} is not imported`);
  }
});

test("the smoke tier covers every page that ships its own bundle", () => {
  const covers: Readonly<Record<string, readonly E2eSuiteName[]>> = {
    "explorer": ["render"],
    "print-room": ["print-room"],
    "print-room/portfolio": ["chart-drawer"],
    "seed-of-the-day": ["hunt"],
    "reading-room": ["reading-room"],
    "prospect": ["prospect"],
    "ribbon": ["ribbon"],
    "home": ["home"],
    "specimen": ["specimen"],
  };
  for (const { twin } of BUNDLE_ENTRIES) {
    // The home twin sits at the public root (Issue #455), so its surface has no directory prefix.
    const surface = twin === "app.bundle.js" ? "home" : twin.replace(/\/app\.bundle\.js$/, "");
    const suites = covers[surface];
    assert.ok(suites, `bundle ${surface} has no smoke suite mapped, so it ships uncovered`);
    assert.ok(
      suites.some((s) => SMOKE_SUITES.includes(s)),
      `the smoke tier no longer boots ${surface} (wanted one of ${suites.join(", ")})`,
    );
  }
});

test("the two worker-bearing surfaces assert the worker is live AND that it degrades", () => {
  // One worker/fallback check per surface; room-address cannot stand in here, it only checks the worker hook EXISTS.
  for (const suite of ["render", "fallback", "reading-room"] as const) {
    assert.ok(SMOKE_SUITES.includes(suite), `smoke must keep ${suite} for worker/fallback coverage`);
  }
  const family = (name: string) => e2eSuiteFamily(ROOT, name).map(src).join("\n");
  const assertsWorkerLive = (name: string) => /__vellum\w*UsesWorker(\(\))?\s*===?\s*true/.test(family(name));
  assert.ok(assertsWorkerLive("render"), "render no longer asserts the worker is live");
  assert.ok(assertsWorkerLive("reading-room"), "reading-room no longer asserts the worker is live");
  for (const name of ["fallback", "reading-room"]) {
    assert.match(family(name), /serverState\.blockWorker = true/, `suites/${name}.ts no longer exercises the 404 fallback`);
  }
});

test("the smoke tier stays materially cheaper than the full suite", () => {
  // Count is a weak proxy: cost is uneven, so the timing-heavy suites are pinned out by name too.
  assert.ok(
    SMOKE_SUITES.length * 2 < E2E_SUITE_ORDER.length,
    `smoke is ${SMOKE_SUITES.length}/${E2E_SUITE_ORDER.length} suites, no longer a tier worth the risk`,
  );
  for (const slow of ["motion", "turn", "survey", "zoom", "zoom-gestures"] as const) {
    assert.ok(!SMOKE_SUITES.includes(slow), `${slow} is timing-heavy and belongs outside the smoke tier`);
  }
});

test("ci.yml runs the lane driver, and never sets a suite selection under it", () => {
  assert.match(CI, /run: npm run test:e2e:lanes/, "ci.yml no longer runs the lane driver");
  // Presence of the driver is not enough: a VELLUM_E2E_SUITES line beside it still narrows coverage.
  assert.doesNotMatch(
    CI,
    new RegExp(`${E2E_SUITES_VAR}\\s*:`),
    `ci.yml sets ${E2E_SUITES_VAR} again; the lanes ARE the selection, so any value there narrows coverage`,
  );
  assert.doesNotMatch(CI, /run: npm run test:e2e\s*$/m, "ci.yml still runs the serial single-lane e2e too");
});

// Each job's worst run in minutes, the larger of this workflow's own runs and a slow-runner prediction from the main runs' slowest per-suite readings, so three fast runners cannot set it low (Issue #743, 2026-10-04: shards 4m08s measured against 3m54s predicted, lanes 7m07s against 6m47s, over the six runs 37181981868 to 37183552447).
const WORST_JOB_MINUTES: Readonly<Record<string, number>> = { "check-and-test": 4.2, "build-and-e2e": 7.2 };
const CAP_HEADROOM = 1.5;

test("every ci.yml job is bounded, so no hung job can hold a runner for hours", () => {
  const jobs = ciJobBlocks();
  assert.deepEqual(jobs.map((j) => j.id), Object.keys(WORST_JOB_MINUTES), "this sweep read other job blocks than the ones with a measured worst, so it is covering the wrong part of the file; a job added here joins the sweep with its own worst");
  for (const job of jobs) {
    const body = ciUncommented(job.lines);
    const bound = body.match(/^ {4}timeout-minutes: (\d+)$/m);
    assert.ok(bound, `ci.yml's ${job.id} job has no timeout-minutes, so a hang there runs to GitHub's 6-hour default`);
    const minutes = Number(bound[1]);
    const floor = CAP_HEADROOM * WORST_JOB_MINUTES[job.id]!;
    assert.ok(minutes >= floor, `${job.id}'s timeout-minutes is ${minutes}, under ${floor.toFixed(2)}, ${CAP_HEADROOM} times its worst run, so a slow runner's real run is killed as a hang`);
    assert.ok(minutes <= 60, `${job.id}'s timeout-minutes is ${minutes}, long enough that a hang still costs an hour`);
    assert.doesNotMatch(
      body,
      /continue-on-error:\s*true/,
      `ci.yml's ${job.id} job swallows its own failure, so a red there reports green and the merge gate stops meaning anything`,
    );
  }
});

test("ci.yml runs one job per lane, and its matrix is exactly E2E_LANES", () => {
  const lane = ciJobBlocks().find((j) => j.id === "build-and-e2e");
  assert.ok(lane, "ci.yml has no build-and-e2e job at all, so every assertion below would read an empty block");
  const body = ciUncommented(lane.lines);
  const matrix = body.match(/^ {8}lane: \[([^\]]*)\]$/m);
  assert.ok(matrix, "the lane matrix was not found in ci.yml's e2e job, so the roster comparison below would read nothing");
  const named = matrix[1]!.split(",").map((s) => s.trim().replace(/^"|"$/g, "")).filter((s) => s !== "");
  assert.deepEqual(
    named,
    E2E_LANES.map((l) => l.name),
    "ci.yml's lane matrix and E2E_LANES name different lanes, so a lane either runs nowhere or runs a job with no lane",
  );
  assert.match(
    body,
    /run: npm run test:e2e:lanes -- --lane \$\{\{ matrix\.lane \}\}/,
    "the e2e step does not pass its matrix lane to the driver, so each job runs every lane",
  );
  assert.match(
    body,
    /^ {4}name: build & e2e lane \$\{\{ matrix\.lane \}\}$/m,
    "the e2e job's name no longer carries its lane, so the two jobs report one check name and main's required checks no longer match",
  );
  assert.match(
    body,
    /fail-fast: false/,
    "fail-fast is back on, so a red lane cancels the other one and takes its verdict with it",
  );
  const parallel = body.match(/^ {6}max-parallel: (\d+)$/m);
  assert.ok(
    parallel === null || Number(parallel[1]) >= E2E_LANES.length,
    `ci.yml caps the lane matrix at ${parallel?.[1]} concurrent jobs against ${E2E_LANES.length} lanes, so the lanes queue behind each other and the wall clock goes back to their sum`,
  );
  assert.match(
    body,
    /find dist -type f -exec sha256sum \{\} \+ \| LC_ALL=C sort \| sha256sum/,
    "the lane job no longer hashes its own dist/, so two shards building different trees is silent (ruled 2026-09-14 on #623)",
  );
});

test("ci.yml shards the unit suite across a matrix of 1 to N, and every leg runs its own slice, so no test file is dropped", () => {
  const unit = ciJobBlocks().find((j) => j.id === "check-and-test");
  assert.ok(unit, "ci.yml has no check-and-test job at all, so every assertion below would read an empty block");
  const body = ciUncommented(unit.lines);
  const lines = body.split("\n");
  const at = lines.findIndex((l) => /^ {6}matrix:$/.test(l));
  assert.notEqual(at, -1, "the unit job has no matrix, so the assertions below would read nothing");
  const after = lines.slice(at + 1);
  const end = after.findIndex((l) => !/^ {8}/.test(l));
  const keys = (end === -1 ? after : after.slice(0, end)).filter((l) => /^ {8}\S/.test(l));
  assert.equal(keys.length, 1, `the unit matrix carries ${keys.length} keys, so legs multiply and the shard denominator stops matching the slices`);
  const shards = keys[0]!.match(/^ {8}shard: \[([^\]]*)\]$/);
  assert.ok(shards, `the unit matrix's one key is not a shard list: ${keys[0]}`);
  const named = shards[1]!.split(",").map((s) => Number(s.trim()));
  assert.ok(named.length >= 2, `the unit matrix has ${named.length} leg, so the suite is not split across runners at all (Issue #743)`);
  assert.deepEqual(named, named.map((_, i) => i + 1), `the shards are ${named.join(", ")}, not 1 to ${named.length}, so node --test drops the slices no leg names`);
  assert.match(
    body,
    /^ {6}- name: Test\n {8}run: npm test -- --test-shard=\$\{\{ matrix\.shard \}\}\/\$\{\{ strategy\.job-total \}\}\n(?= {6}- |\n|$)/m,
    "the unit job has no Test step of exactly `- name: Test` / `run: npm test -- --test-shard=${{ matrix.shard }}/${{ strategy.job-total }}` at the step indent, so a leg runs every file, a slice against the wrong total, or a conditional that skips one",
  );
  const pkg = JSON.parse(src("package.json")) as { scripts: Record<string, string> };
  assert.equal(pkg.scripts["test"], "node --test", "npm test is no longer node --test alone, so the shard flag ci.yml appends lands on some other command and every leg runs every file");
  assert.match(body, /fail-fast: false/, "fail-fast is on, so a red shard cancels the others and their verdicts go with it");
  const parallel = body.match(/^ {6}max-parallel: (\d+)$/m);
  assert.ok(
    parallel === null || Number(parallel[1]) >= named.length,
    `ci.yml caps the unit matrix at ${parallel?.[1]} concurrent jobs against ${named.length} shards, so the shards queue and the wall clock goes back to their sum`,
  );
  assert.match(
    body,
    /^ {4}name: check & test \$\{\{ matrix\.shard \}\} of \$\{\{ strategy\.job-total \}\}$/m,
    "the unit job's name no longer carries its shard, so the legs report one check name and main's required checks no longer match",
  );
});

test("every CI trigger gets the same full coverage, so nothing is conditional on the event", () => {
  const at = CI.indexOf("test:e2e:lanes");
  // slice(-1) is the file's LAST CHARACTER, not the whole file, so a missing anchor would leave both assertions below passing against nothing.
  assert.notEqual(at, -1, "the e2e step is gone, so this guard would be reading an empty slice");
  const step = CI.slice(at);
  assert.doesNotMatch(step, /github\.event_name/, "the e2e step is conditional on the event again");
  assert.doesNotMatch(step, /full-e2e/, "the full-e2e label is wired back in, so PRs differ from main again");
});

test("the runner actually uses the selection, the timings and the outcome rule it imports", () => {
  // The runner needs a browser, so behavior is tested in test/e2e/suites.test.ts and only the CALL sites are pinned here, against the CODE and never the raw file: a line commented out in place leaves its literal behind and satisfies a raw match, which beat this test's .catch assertion and its formatSuiteTimings one when the prover tried it (2026-09-10).
  assert.match(RUNNER_CODE, /runSelected\(SELECTED, SUITES, ctx, \{/, "the runner does not run the SELECTED suites");
  // The hooks are optional in runSelected, since a caller without them keeps the old rethrow; a runner without them is the Issue #534 defect back, and no unit test of runSelected can see that.
  const hooks = RUNNER_CODE.match(/runSelected\(SELECTED, SUITES, ctx, \{([\s\S]*?)\n {2}\}\);/);
  assert.ok(hooks, "the runSelected call's argument block was not found, so the two assertions below would read an empty string");
  assert.match(hooks[1]!, /onSuiteError:/, "the runner passes no per-suite handler, so one suite giving up kills the whole lane again (#534)");
  assert.match(hooks[1]!, /alive: ctx\.alive/, "the runner passes no liveness probe, so a browser that died mid-lane is reported as a lane full of product failures (#534)");
  assert.match(hooks[1]!, /skippedGroups: \(\) => skippedGroups/, "the runner reads no skipped-group sink, so a suite that skipped a check group is indistinguishable from a whole one (#560)");
  assert.match(RUNNER_CODE, /suitesCertifiedByHealth\(SELECTED, incomplete\)/, "the runner certifies suites that stopped early, a clean bill the run never earned (#534)");
  // Both halves, or the rename narrows this to "some second argument is passed": the list has to be the one that counts a skipped group too.
  assert.match(RUNNER_CODE, /const incomplete = suitesNotWhole\(timings\)/, "the runner builds its own incomplete list, so a suite that skipped a check group is still certified (#560)");
  assert.match(RUNNER_CODE, /t\.skipped\.join\("; "\)/, "the runner records which groups were skipped and never prints them, so the reader cannot tell what the run did not do (#560)");
  // The call site alone is not the behavior: computing `certified` and never printing it passes every assertion above.
  assert.match(RUNNER_CODE, /certified\.length > 0/, "the runner computes the certified list and never reads it, so no suite is reported as certified at all (#534)");
  // The breaker's own exit is a HARNESS ERROR, so the door it leaves by must print the score, or it does the thing it exists to prevent.
  const onError = RUNNER_CODE.match(/\.catch\(\(e\) => \{([\s\S]*?)\n {2}\}\);/);
  assert.ok(onError, "the runner's error path was not found, so the assertion below would read an empty string");
  assert.match(onError[1]!, /runOutcome\(results\)/, "the harness-error path prints no tally, so a run that dies mid-lane reports none of the checks that did run (#534)");
  assert.match(RUNNER_CODE, /runOutcome\(results\)/, "the runner does not use the outcome rule, so 0/0 can pass again");
  assert.match(RUNNER_CODE, /join\(REPO, "out", e2eOutSubdir\(PORT\)\)/, "the runner's out dir no longer follows the port");
  assert.match(
    RUNNER_CODE,
    /formatSuiteTimings\(timings\)/,
    "the runner measures per-suite time and then drops it, so no future split can be measured",
  );
});

// The helper is proved in isolation by test/repo/step-support.test.ts; what no test could see is a suite quietly going back to a bare await, which is the Issue #534 defect returning one suite at a time.
// The GROUPS by name, never "at least one step": an import plus a single `await step(` left five of room-drawer's six groups unwrappable with this sweep still green (skeptic, 2026-09-10), which is a guard shaped like one instance of the class it claims to cover.
const STEPPED_GROUPS: Readonly<Record<string, readonly string[]>> = {
  "render": ["R8", "R11a", "R11b", "R11c", "R12a", "R12b", "R15a", "R15b", "R13a", "R13b", "R13c", "R13e", "R restore"],
  "motion": ["D1, D2", "D3"],
  "turn": ["T1, T1b", "T2", "T3, T4", "T5", "T6", "T6b"],
  "verso": ["V setup", "V0", "V2", "V3", "V4b", "V5, V5b", "V restore"],
  "zoom-gestures": ["ZG2, ZG3, ZG4", "ZG restore"],
  "glass-ceremony": ["G setup", "G restore"],
  "cards": ["P setup", "P19, P19b", "P20 to P27", "P24", "P restore"],
  "fallback": ["B3"],
  "region-detail": ["RD setup", "RD3, RD4", "RD5", "RD restore"],
  "ribbon": ["RB1 to RB5e", "RB7", "RB8", "RB8b", "RB8c"],
  "prospect": ["PB2 to PB5", "PB6", "PB7 to PB7d", "PB7e", "PB8", "PB9"],
  "broadside": ["BR1 to BR1c", "BR2", "BR6b to BR6d setup", "BR7"],
  "zoom": ["Z setup", "Z11", "Z12", "Z14a", "Z14b", "Z7", "Z13", "Z20d", "Z20g", "Z restore"],
  "survey": [
    "SV1", "SV2 to SV2c", "SV2d", "SV2e", "SV2g", "SV2h", "SV2i", "SV2j", "SV2p", "SV2m", "SV2o",
    "SV3", "SV4", "SV5c", "SV5d", "SV6", "SV9", "SV10", "SV2n",
  ],
  "cluster": ["CL4", "CL5", "CL8", "CL7"],
  "room-drawer": ["DR2, DR3", "DR4", "DR5", "DR6", "DR7", "DR8", "DR11", "DR12", "DR13", "DR14", "DR15", "DR16", "DR17"],
  "chart-drawer": [
    "CD1", "CD2, CD2b, CD2c", "CD23", "CD3", "CD44", "CD45", "CD46", "CD4", "CD5", "CD7, CD7b, CD7c", "CD47", "CD8",
    "CD9, CD11, CD12, CD22, CD43", "CD13", "CD18", "CD6, CD48", "CD15, CD17",
    "CD25, CD26, CD30", "CD27", "CD28, CD29, CD34, CD35, CD31", "CD32", "CD33",
    "CD36", "CD37", "CD38", "CD39", "CD40", "CD41, CD42",
  ],
  "document-rooms": ["IX3"],
  "specimen": ["SB4"],
  "corners": ["CO1", "CO2", "CO3"],
};

const SUITE_FILES = E2E_SUITE_ORDER.map((name) => [name, e2eSuitePath(name)] as const);
const familyOf = (name: string) => e2eSuiteFamily(ROOT, name).map((path) => ({ path, text: readFileSync(join(ROOT, path), "utf8") }));

test("the harness hands out exactly the two throwing waits the scan below seeds from, so a third one cannot arrive unread", () => {
  const harness = src("e2e/harness.ts").split("\n");
  const found = harness
    .map((line, i) => ({ line, i }))
    .filter(({ line }) => /^async function wait\w+\(/.test(line))
    .filter(({ i }) => harness.slice(i, i + 12).some((l) => /throw new Error\("wait/.test(l)))
    .map(({ line }) => line.replace(/^async function (wait\w+)\(.*$/, "$1"));
  assert.deepEqual(found, CTX_THROWING_WAITS.filter((w) => w !== "settle"), "the harness's throwing waits are not the two CTX_THROWING_WAITS seeds this file's scan starts from");
});

test("every suite with a wait that THROWS is named in the step roster, and every rostered suite has one (#560)", () => {
  const unstepped: string[] = [];
  const idle: string[] = [];
  for (const name of E2E_SUITE_ORDER) {
    const throwing = containment(familyOf(name)).throwingCalls > 0;
    if (throwing && !(name in STEPPED_GROUPS)) unstepped.push(name);
    if (!throwing && name in STEPPED_GROUPS) idle.push(name);
  }
  assert.deepEqual(unstepped, [], "these suites call a wait that throws and step nothing, so a wait that gives up there records the SUITE as red, loses every check after it, and three such suites in a row trip the streak breaker into a HARNESS ERROR (#560)");
  assert.deepEqual(idle, [], "these suites are in the roster but the scan found no throwing call in their family at all, so it proves nothing there");
});

test("a suite that builds a step is named in the roster, so adopting one without joining cannot pass unread", () => {
  const adopters = SUITE_FILES.filter(([, file]) => /from "\.\.\/support\/step\.ts"/.test(src(file))).map(([name]) => name);
  assert.ok(adopters.length > 0, "no suite imports support/step.ts at all, so the assertion below would read an empty list");
  assert.deepEqual(
    adopters.filter((name) => !(name in STEPPED_GROUPS)),
    [],
    "a suite adopted step and never joined STEPPED_GROUPS, so its groups are unpinned and one can be unwrapped silently",
  );
});

// The guard the roster cannot be: STEPPED_GROUPS pins the step NAMES, and a wait moved out of its step keeps every one of them.
test("every call of a wait that throws is INSIDE a step, across each suite's file and folder (#560)", () => {
  for (const name of E2E_SUITE_ORDER) {
    const got = containment(familyOf(name));
    const groups = STEPPED_GROUPS[name] ?? [];
    assert.equal(got.steps.length, groups.length, `suites/${name}.ts: the scan read ${got.steps.length} step calls against ${groups.length} in the roster, so it is reading the wrong files`);
    assert.deepEqual(got.breaches, [], `suites/${name}.ts calls a thrower or throws outside every step, so a timeout there fails the SUITE rather than the numbered check, and the checks after it never run (#560)`);
  }
});

test("every check group that waits is still inside its own step, by name (#534)", () => {
  for (const [suite, groups] of Object.entries(STEPPED_GROUPS)) {
    const file = src(e2eSuitePath(suite));
    assert.match(file, /from "\.\.\/support\/step\.ts"/, `suites/${suite}.ts no longer imports support/step.ts`);
    assert.match(file, /const step = makeStep\(ctx\)/, `suites/${suite}.ts no longer builds a step, so a wait that gives up there takes the suite with it again`);
    const stepped = [...file.matchAll(/await step\("([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(
      stepped,
      groups.slice(),
      `suites/${suite}.ts's stepped groups are not the ones this roster names: one was unwrapped, renamed, reordered or added without joining the roster`,
    );
  }
});

test("the lane driver spawns the runner itself and refuses an ambient selection", () => {
  const DRIVER = uncommented(src("e2e/lanes.ts"));
  assert.match(DRIVER, /spawn\(process\.execPath, \[RUNNER\]/, "a lane must spawn the runner directly, so its exit code survives");
  assert.match(DRIVER, /ambientSelectionRefusal\(process\.env\)/, "the driver no longer refuses a narrowing selection");
  assert.match(DRIVER, /laneOutcome\(results, SELECTED\)/, "the driver does not aggregate the lanes it was asked to run, so one could fail unnoticed");
  assert.match(DRIVER, /process\.exit\(outcome\.ok \? 0 : 1\)/, "the driver's exit code is not the lanes' outcome");
  // All three, or the lock moves rather than holding: laneOutcome refuses a result set short of SELECTED at runtime, which is worth nothing if SELECTED is not what ran or is not what the argv asked for.
  assert.match(DRIVER, /SELECTED = resolveLaneSelection\(process\.argv\.slice\(2\)\)/, "the driver's lane selection no longer comes from its own argv");
  assert.match(DRIVER, /SELECTED\.map\(runLane\)/, "the driver runs some other set of lanes than the one it selected");
  const resolveAt = DRIVER.indexOf("resolveLaneSelection(process.argv");
  const probeAt = DRIVER.indexOf("findBrowser()");
  assert.notEqual(probeAt, -1, "the driver no longer probes for a browser, so the ordering assertion below would compare against -1");
  assert.ok(
    resolveAt < probeAt,
    "the driver resolves its lane AFTER probing for a browser, so on a machine with none a misspelled lane prints SKIP and exits 0 instead of being refused",
  );
  assert.match(DRIVER, /browserlessAction\(process\.env, Boolean\(process\.stdout\.isTTY\)\)/, "the driver no longer decides the browserless policy against its own TTY");
  const pkg = JSON.parse(src("package.json")) as { scripts: Record<string, string> };
  assert.equal(pkg.scripts["test:e2e:lanes"], "node e2e/lanes.ts");
  assert.equal(pkg.scripts["test:e2e"], "node e2e/run.ts", "npm run test:e2e no longer runs the runner, and nothing else notices until someone runs it");
});
