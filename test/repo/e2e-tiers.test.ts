import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import vm from "node:vm";
import { E2E_SUITE_ORDER, SMOKE_SUITES, E2E_SUITES_VAR } from "../../e2e/support/suites.ts";
import type { E2eSuiteName } from "../../e2e/support/suites.ts";
import { E2E_LANES } from "../../e2e/support/lanes.ts";
import { BUNDLE_ENTRIES } from "../../scripts/build-app-bundles.ts";
import { e2eSourcePaths, e2eSuiteFamily, readE2eSource } from "../../test-support/e2e-source.ts";
import { CTX_THROWING_WAITS } from "../../scripts/lint/e2e-steps.ts";
import type { SuiteContext } from "../../e2e/types.ts";
import { r0ToR4Worker } from "../../e2e/suites/render.ts";
import { rr0Boots } from "../../e2e/suites/reading-room/arrival.ts";
import { readingRoomKit } from "../../e2e/suites/reading-room/kit.ts";
import { run as fallback } from "../../e2e/suites/fallback.ts";
import { rr14Fallback } from "../../e2e/suites/reading-room/fallback.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
const src = (p: string) => readE2eSource(join(ROOT, p));
const CI = src(".github/workflows/ci.yml");
// A ci.yml scan skips YAML's own comment leader, or a sentence about fail-fast in the workflow's prose would satisfy the guard that fail-fast is SET.
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

test("the smoke tier covers every page that ships its own bundle", () => {
  const covers: Readonly<Record<string, readonly E2eSuiteName[]>> = {
    explorer: ["render"],
    "print-room": ["print-room"],
    "explorer/portfolio": ["chart-drawer"],
    "seed-of-the-day": ["hunt"],
    "reading-room": ["reading-room"],
    prospect: ["prospect"],
    ribbon: ["ribbon"],
    home: ["home"],
    specimen: ["specimen"],
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

test("smoke keeps the three suites that cover the worker and its fallback", () => {
  for (const suite of ["render", "fallback", "reading-room"] as const) {
    assert.ok(SMOKE_SUITES.includes(suite), `smoke must keep ${suite} for worker/fallback coverage`);
  }
});

function standIn(hook: string, live: boolean) {
  const seen = new Map<string, boolean>();
  const log: Array<boolean | "navigate"> = [];
  const window = { [hook]: () => live };
  const ctx = {
    evaluate: async (payload: string): Promise<unknown> => {
      try {
        return await (vm.runInNewContext(payload, { window }) as Promise<unknown>);
      } catch {
        return {};
      }
    },
    check: (name: string, ok: boolean) => {
      const id = name.split(" ")[0]!;
      if (!seen.has(id)) seen.set(id, ok);
    },
    send: (method: string) => {
      if (method === "Page.reload" || method === "Page.navigate") log.push("navigate");
      return Promise.resolve({});
    },
    sleep: () => Promise.resolve(),
    waitReady: () => Promise.resolve(true),
    waitSettled: () => Promise.resolve(),
    alive: () => Promise.resolve(true),
    skippedGroups: [],
    consoleErrors: [],
    http4xx: [],
    PORT: 0,
    serverState: {
      get blockWorker(): boolean {
        return log.findLast((entry) => entry !== "navigate") ?? false;
      },
      set blockWorker(v: boolean) {
        log.push(v);
      },
    },
  };
  return { ctx: ctx as unknown as SuiteContext, seen, log };
}
const ranOver = async (run: () => Promise<void>): Promise<void> => {
  try {
    await run();
  } catch {}
};

test("R1 and RR1 pass a page whose worker is live and fail one whose worker is dead, read as the page reads them (census row 1, run over a stand-in page)", async () => {
  for (const live of [true, false]) {
    const explorer = standIn("__vellumUsesWorker", live);
    await ranOver(() => r0ToR4Worker(explorer.ctx));
    assert.equal(explorer.seen.get("R1"), live, `R1 with the worker ${live ? "live" : "dead"}`);
    const room = standIn("__vellumReadingRoomUsesWorker", live);
    await ranOver(() => rr0Boots(readingRoomKit(room.ctx)));
    assert.equal(room.seen.get("RR1"), live, `RR1 with the worker ${live ? "live" : "dead"}`);
  }
});

test("both fallback checks tell the server to refuse the worker before they read the page (census row 1, run over a stand-in page)", async () => {
  const refusedFirst = (log: ReadonlyArray<boolean | "navigate">): boolean =>
    log.includes(true) && log.indexOf(true) < log.indexOf("navigate");
  const explorer = standIn("__vellumUsesWorker", false);
  await ranOver(() => fallback(explorer.ctx));
  assert.ok(refusedFirst(explorer.log), "the Explorer's fallback does not refuse the worker before it loads the page");
  const room = standIn("__vellumReadingRoomUsesWorker", false);
  await ranOver(() => rr14Fallback(room.ctx));
  assert.ok(
    refusedFirst(room.log),
    "the Reading Room's fallback does not refuse the worker before it loads the page, read as before its first navigation, so a refusal moved to between about:blank and the room reds too (a false red, the safe direction)",
  );
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

// Each job's worst run in minutes, the larger of this workflow's own runs and a slow-runner prediction from the main runs' slowest per-suite readings, so three fast runners cannot set it low (Issue #763, 2026-10-06, over the fourteen runs whose head held Issue #762's pull request D, main 37526087943 to 37541080266 and nine pull request runs: shards 4m46s, lanes 9m18s, lane C before this issue's re-fit, against a slowest re-fitted lane predicted at about 7.5 minutes).
const WORST_JOB_MINUTES: Readonly<Record<string, number>> = { "check-and-test": 4.8, "build-and-e2e": 9.3 };
const CAP_HEADROOM = 1.5;

test("every ci.yml job is bounded, so no hung job can hold a runner for hours", () => {
  const jobs = ciJobBlocks();
  assert.deepEqual(
    jobs.map((j) => j.id),
    Object.keys(WORST_JOB_MINUTES),
    "this sweep read other job blocks than the ones with a measured worst, so it is covering the wrong part of the file; a job added here joins the sweep with its own worst",
  );
  for (const job of jobs) {
    const body = ciUncommented(job.lines);
    const bound = body.match(/^ {4}timeout-minutes: (\d+)$/m);
    assert.ok(bound, `ci.yml's ${job.id} job has no timeout-minutes, so a hang there runs to GitHub's 6-hour default`);
    const minutes = Number(bound[1]);
    const floor = CAP_HEADROOM * WORST_JOB_MINUTES[job.id]!;
    assert.ok(
      minutes >= floor,
      `${job.id}'s timeout-minutes is ${minutes}, under ${floor.toFixed(2)}, ${CAP_HEADROOM} times its worst run, so a slow runner's real run is killed as a hang`,
    );
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
  assert.ok(
    matrix,
    "the lane matrix was not found in ci.yml's e2e job, so the roster comparison below would read nothing",
  );
  const named = matrix[1]!
    .split(",")
    .map((s) => s.trim().replace(/^"|"$/g, ""))
    .filter((s) => s !== "");
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
  assert.equal(
    keys.length,
    1,
    `the unit matrix carries ${keys.length} keys, so legs multiply and the shard denominator stops matching the slices`,
  );
  const shards = keys[0]!.match(/^ {8}shard: \[([^\]]*)\]$/);
  assert.ok(shards, `the unit matrix's one key is not a shard list: ${keys[0]}`);
  const named = shards[1]!.split(",").map((s) => Number(s.trim()));
  assert.ok(
    named.length >= 2,
    `the unit matrix has ${named.length} leg, so the suite is not split across runners at all (Issue #743)`,
  );
  assert.deepEqual(
    named,
    named.map((_, i) => i + 1),
    `the shards are ${named.join(", ")}, not 1 to ${named.length}, so node --test drops the slices no leg names`,
  );
  assert.match(
    body,
    /^ {6}- name: Test\n {8}run: npm test -- --test-shard=\$\{\{ matrix\.shard \}\}\/\$\{\{ strategy\.job-total \}\}\n(?= {6}- |\n|$)/m,
    "the unit job has no Test step of exactly `- name: Test` / `run: npm test -- --test-shard=${{ matrix.shard }}/${{ strategy.job-total }}` at the step indent, so a leg runs every file, a slice against the wrong total, or a conditional that skips one",
  );
  const pkg = JSON.parse(src("package.json")) as { scripts: Record<string, string> };
  assert.equal(
    pkg.scripts["test"],
    "node --test",
    "npm test is no longer node --test alone, so the shard flag ci.yml appends lands on some other command and every leg runs every file",
  );
  assert.match(
    body,
    /fail-fast: false/,
    "fail-fast is on, so a red shard cancels the others and their verdicts go with it",
  );
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

test("the harness hands out exactly the two throwing waits vellum/e2e-throw-inside-step seeds from, so a third one cannot arrive unread", () => {
  const harness = src("e2e/harness.ts").split("\n");
  const found = harness
    .map((line, i) => ({ line, i }))
    .filter(({ line }) => /^(?:async function wait\w+\(|(?:export )?const wait\w+ = async)/.test(line))
    .filter(({ i }) => harness.slice(i, i + 12).some((l) => /throw new Error\("wait/.test(l)))
    .map(({ line }) => line.replace(/^(?:async function |(?:export )?const )(wait\w+)\W.*$/, "$1"));
  assert.deepEqual(
    found,
    CTX_THROWING_WAITS.filter((w) => w !== "settle"),
    "the harness's throwing waits are not the two CTX_THROWING_WAITS seeds vellum/e2e-throw-inside-step starts from",
  );
});

test("npm runs the e2e runner and the lane driver themselves, so neither script can drift off the file it names", () => {
  const pkg = JSON.parse(src("package.json")) as { scripts: Record<string, string> };
  assert.equal(pkg.scripts["test:e2e:lanes"], "node e2e/lanes.ts");
  assert.equal(
    pkg.scripts["test:e2e"],
    "node e2e/run.ts",
    "npm run test:e2e no longer runs the runner, and nothing else notices until someone runs it",
  );
});

test("the e2e source list reads every TypeScript file under e2e/ at any depth, and nothing else", () => {
  const root = mkdtempSync(join(tmpdir(), "vellum-e2e-notes-"));
  try {
    const plant = (rel: string): void => {
      mkdirSync(dirname(join(root, rel)), { recursive: true });
      writeFileSync(join(root, rel), "");
    };
    [
      "e2e/top.ts",
      "e2e/suites/split/nested.ts",
      "e2e/left.mjs",
      "scripts/other.ts",
      "scripts/e2e-beside.ts",
      "test/e2e/x.test.ts",
    ].forEach(plant);
    assert.deepEqual(
      e2eSourcePaths(root)
        .map((f) => relative(root, f))
        .sort(),
      ["e2e/top.ts", "e2e/suites/split/nested.ts"].sort(),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("no e2e source is an .mts, .cts or .tsx: the lint reads only e2e/**/*.ts and the skip collector only .ts, so such a file escapes both and the step rule", () => {
  const listing = readdirSync(join(ROOT, "e2e"), { recursive: true, encoding: "utf8" });
  assert.ok(
    listing.includes(join("suites", "specimen", "desktop.ts")),
    "the listing missed a suite's part file, so it reads the wrong tree",
  );
  assert.deepEqual(
    listing.filter((f) => /\.(?:mts|cts|tsx)$/.test(f)),
    [],
    "an e2e source the lint and the skip collector do not read; the checker follows an imported .mts, .cts or .tsx and honors its directives",
  );
});

test("a suite's family is its suite file and every TypeScript file in its own folder at any depth, and never a sibling whose name it prefixes", () => {
  const root = mkdtempSync(join(tmpdir(), "vellum-e2e-family-"));
  try {
    const plant = (rel: string): void => {
      mkdirSync(dirname(join(root, rel)), { recursive: true });
      writeFileSync(join(root, rel), "");
    };
    [
      "e2e/suites/zoom.ts",
      "e2e/suites/zoom/reads.ts",
      "e2e/suites/zoom/deep/checks.ts",
      "e2e/suites/zoom/notes.md",
      "e2e/suites/zoom-gestures.ts",
      "e2e/suites/zoom-gestures/checks.ts",
      "e2e/support/zoom.ts",
      "e2e/zoom.ts",
      "e2e/suites/health.ts",
    ].forEach(plant);
    assert.deepEqual(e2eSuiteFamily(root, "zoom"), [
      "e2e/suites/zoom.ts",
      "e2e/suites/zoom/deep/checks.ts",
      "e2e/suites/zoom/reads.ts",
    ]);
    assert.deepEqual(e2eSuiteFamily(root, "zoom-gestures"), [
      "e2e/suites/zoom-gestures.ts",
      "e2e/suites/zoom-gestures/checks.ts",
    ]);
    assert.deepEqual(
      e2eSuiteFamily(root, "health"),
      ["e2e/suites/health.ts"],
      "a suite with no folder is its file alone",
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
