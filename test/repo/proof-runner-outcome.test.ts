import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { format } from "node:util";
import { ESLint } from "eslint";
import { runnerHooks } from "../../e2e/support/runner.ts";
import { makeStep } from "../../e2e/support/step.ts";
import { e2eOutcome, lintOutcome, unitOutcome } from "../../scripts/proof-runner/outcome.ts";

const REPORTER = resolve(import.meta.dirname, "..", "..", "scripts", "proof-runner", "reporter.ts");
// The line `check` in e2e/harness.ts prints; only this framing is restated here, and every check NAME below comes from the real code that makes it.
const harnessLine = (name: string, ok: boolean, detail = "") =>
  `${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  ${String.fromCharCode(0x2014)} ${detail}` : ""}`;

const realRun = async () => {
  const out: string[] = [];
  const err: string[] = [];
  const check = (name: string, ok: unknown, detail = "") => out.push(harnessLine(name, !!ok, detail));
  const saved = console.error;
  console.error = (...parts: unknown[]) => err.push(format(...parts));
  try {
    check("IX9 the survey sheet frames the page", false, "border 0px");
    check("IX10 the index stands beside the broadside", true);
    await makeStep({ check })("L13", () => Promise.reject(new Error('settle timeout l13-marks: {"n":0}')));
    const accumulators = { results: [], consoleErrors: [], http4xx: [], skippedGroups: [] };
    const ctx = { check, alive: () => Promise.resolve(true), clearMobile: () => Promise.resolve() };
    const hooks = runnerHooks(ctx, accumulators, (...parts) => err.push(format(...parts)), 50);
    assert.ok(
      hooks.onSuiteError,
      "the runner no longer reports a suite's stop, so the suite-stop half of this test reads nothing",
    );
    await hooks.onSuiteError("landfall", new TypeError("Cannot read properties of null (reading 'right')"));
  } finally {
    console.error = saved;
  }
  return { stdout: out.join("\n"), stderr: err.join("\n") };
};

test("a browser run's reds, its stops and each stop's whole stderr stanza are read apart, from the lines the real step and runner code print", async () => {
  const { stdout, stderr } = await realRun();
  const got = e2eOutcome(stdout, stderr, 1);
  assert.deepEqual(
    got.reds,
    ["IX9"],
    "a stop was read as a red, which is the first-token reading the local driver used",
  );
  assert.deepEqual(
    got.stops.map((s) => [s.id, s.kind]),
    [
      ["L13", "step"],
      ["landfall", "suite"],
    ],
  );
  assert.match(got.stops[0]!.detail, /settle timeout l13-marks/);
  assert.match(got.stops[0]!.stanza, /^ {2}L13 never reached its assertion: Error: settle timeout/);
  assert.match(
    got.stops[0]!.stanza,
    /\n {4}at /,
    "the stop's stack was dropped, so its reader cannot tell whose read threw",
  );
  assert.match(got.stops[1]!.stanza, /landfall stopped early: TypeError: Cannot read properties of null/);
  assert.equal(got.broken, null);
});

test("a red's id is its first token with trailing punctuation stripped", () => {
  const stdout = [
    harnessLine("CD22, CD43 the band holds", false),
    harnessLine("SB health: no console errors", false),
  ].join("\n");
  assert.deepEqual(e2eOutcome(stdout, "", 1).reds, ["CD22", "SB"]);
});

test("a harness error, a run with no checks and a failing exit with no FAIL line are each a run that cannot be judged", () => {
  assert.match(e2eOutcome("", "HARNESS ERROR: Error: browser went away", 2).broken ?? "", /harness error/);
  assert.match(e2eOutcome("FAIL: no checks ran, so this run proves nothing.", "", 1).broken ?? "", /no checks ran/);
  assert.match(
    e2eOutcome("PASS  A1 fine", "FAIL: VELLUM_E2E_SUITES names a suite that does not exist: specimn", 1).broken ?? "",
    /exited 1/,
  );
  assert.match(e2eOutcome("PASS  A1 fine", "", null).broken ?? "", /exited null/);
  assert.equal(e2eOutcome("PASS  A1 fine\n\nALL PASS  (1/1)", "", 0).broken, null);
});

const spawnReporter = (dir: string, files: string[]) => {
  const dest = join(dir, "out.jsonl");
  const env = { ...process.env };
  delete env["NODE_TEST_CONTEXT"]; // set by the outer node --test, it makes the inner run report to its parent and ignore its own reporter
  const r = spawnSync(
    process.execPath,
    ["--test", `--test-reporter=${REPORTER}`, `--test-reporter-destination=${dest}`, ...files],
    {
      cwd: dir,
      encoding: "utf8",
      env,
      timeout: 60_000,
    },
  );
  return { jsonl: readFileSync(dest, "utf8"), status: r.status };
};

test("the reporter's lines name a failing test exactly, hash and newline kept, and a file that fails at import is told apart by the path it was passed", () => {
  const made = mkdtempSync(join(tmpdir(), "proof-runner-reporter-"));
  try {
    const dir = realpathSync(made);
    mkdirSync(join(dir, "sub"));
    writeFileSync(join(dir, "package.json"), '{ "type": "module" }\n');
    writeFileSync(
      join(dir, "sub", "a.test.ts"),
      'import { test } from "node:test";\ntest("passes (Issue #1)", () => {});\ntest("fails # with\\nnewline", () => { throw new Error("x"); });\n',
    );
    writeFileSync(join(dir, "sub", "b.test.ts"), 'import "./missing.ts";\n');
    writeFileSync(join(dir, "sub", "c.test.ts"), 'throw new Error("at import");\n');
    const files = ["sub/a.test.ts", "sub/b.test.ts", "sub/c.test.ts"];
    const { jsonl, status } = spawnReporter(dir, files);
    const got = unitOutcome(jsonl, files, dir, status);
    assert.deepEqual(got.reds, [{ name: "fails # with\nnewline", file: "sub/a.test.ts" }]);
    assert.deepEqual(got.loadFailures, ["sub/b.test.ts", "sub/c.test.ts"]);
    assert.equal(got.broken, null);
  } finally {
    rmSync(made, { recursive: true, force: true });
  }
});

test("a unit run that exits failing with no failure to show for it cannot be judged", () => {
  assert.match(unitOutcome("", ["test/a.test.ts"], "/tree", 1).broken ?? "", /exited 1/);
  assert.equal(unitOutcome("", ["test/a.test.ts"], "/tree", 0).broken, null);
});

test("a lint run's reds are its rule ids with their files, and a file it could not parse is told apart", async () => {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: { rules: { "no-var": "error", "no-debugger": "warn" } },
    cwd: "/tree",
  });
  const results = [
    ...(await eslint.lintText("var a = 1;\ndebugger;\n", { filePath: "/tree/src/a.js" })),
    ...(await eslint.lintText("let = ;\n", { filePath: "/tree/src/b.js" })),
  ];
  const json = await (await eslint.loadFormatter("json")).format(results);
  const got = lintOutcome(json, "/tree", 1);
  assert.deepEqual(got.reds, [
    { name: "no-var", file: "src/a.js" },
    { name: "no-debugger", file: "src/a.js" },
  ]);
  assert.deepEqual(got.loadFailures, ["src/b.js"]);
  assert.equal(got.broken, null);
  assert.match(lintOutcome("Oops! Something went wrong!", "/tree", 2).broken ?? "", /lint could not run/);
});
