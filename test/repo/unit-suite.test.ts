import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { lstatSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { UNIT_SECONDS } from "../../scripts/unit-shards.ts";

const LAUNCHER = resolve(import.meta.dirname, "..", "..", "scripts", "unit-suite.ts");
const TAP = "--test-reporter=tap";
// A cap on a hang, never a budget (2026-11-01: each seeded run took about 0.2 s on a Mac).
const CHILD_LIMIT_MS = 60_000;
const TYPE_MODULE = '{"type":"module"}\n';

const suite = (name: string) => `import { test } from "node:test";\ntest(${JSON.stringify(name)}, () => {});\n`;
const suites = (...paths: string[]) => Object.fromEntries(paths.map((p) => [p, suite(p)]));

const COPY_UNDER_OUT = {
  ...suites("test/a.test.ts", "test/sub/b.test.ts", "out/copy/test/c.test.ts", "out/test-d.ts"),
  "out/copy/package.json": TYPE_MODULE,
};
const FOUR_SUITES = suites(
  "test/a.test.ts",
  "test/b.test.ts",
  "test/c.test.ts",
  "test/d.test.ts",
  "out/copy/test/e.test.ts",
);

const HEAVIEST = Object.entries(UNIT_SECONDS).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0]![0];
const WEIGHED = suites("test/a.test.ts", "test/b.test.ts", "test/c.test.ts", HEAVIEST);
const NESTED = {
  ...suites(
    "test/a.test.ts",
    "test/sub/b.test.ts",
    "test/sub/deep/c.test.ts",
    "test/d.test.ts",
    "out/copy/test/e.test.ts",
  ),
  "out/copy/package.json": TYPE_MODULE,
};

const ONE_RED = {
  "test/a.test.ts": `import { test } from "node:test";\ntest("red", () => { throw new Error("red"); });\n`,
};

const RUNNER_KILLED = { "test/a.test.ts": `process.kill(process.ppid, "SIGKILL");\n` };

const LAUNCHER_LINK = "linked/unit-suite.ts";

const PRELOAD_SEEN = {
  "test-support/source-read-guard.ts": "Object.assign(globalThis, { vellumPreload: true });\n",
  "test/a.test.ts": `import { test } from "node:test";\ntest("vellumPreload" in globalThis ? "after the preload" : "without the preload", () => {});\n`,
};

type Run = { status: number | null; ran: string[]; output: string };

const runIn = (
  files: Readonly<Record<string, string>>,
  argv: readonly string[],
  links: Readonly<Record<string, string>> = {},
): Run => {
  const dir = mkdtempSync(join(tmpdir(), "vellum-unit-suite-"));
  try {
    const seeded = { "package.json": TYPE_MODULE, "test-support/source-read-guard.ts": "export {};\n", ...files };
    for (const [rel, body] of Object.entries(seeded)) {
      mkdirSync(join(dir, dirname(rel)), { recursive: true });
      writeFileSync(join(dir, rel), body);
    }
    for (const [rel, target] of Object.entries(links)) {
      mkdirSync(join(dir, dirname(rel)), { recursive: true });
      symlinkSync(target, join(dir, rel));
      assert.ok(
        lstatSync(join(dir, rel)).isSymbolicLink(),
        `${rel} is not a symbolic link, so the fixture starts the launcher by its own path and carries no hazard`,
      );
    }
    const env = { ...process.env };
    delete env["NODE_TEST_CONTEXT"];
    const run = spawnSync(process.execPath, argv, { cwd: dir, encoding: "utf8", timeout: CHILD_LIMIT_MS, env });
    assert.doesNotMatch(
      String(run.error),
      /ETIMEDOUT/,
      `the child hung until the ${CHILD_LIMIT_MS} ms limit killed it`,
    );
    const ran = [...run.stdout.matchAll(/^(?:not )?ok \d+ - (.+)$/gm)].map((m) => m[1] ?? "").sort();
    return { status: run.status, ran, output: `${run.stdout}${run.stderr}` };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

test("npm test runs the suites under test/ and none of a copied tree under out/, which node's own default collects", () => {
  const control = runIn(COPY_UNDER_OUT, ["--test", TAP]);
  assert.deepEqual(
    control.ran,
    ["out/copy/test/c.test.ts", "out/test-d.ts", "test/a.test.ts", "test/sub/b.test.ts"],
    `node's own default no longer collects the copy under out/, so the fixture carries no hazard:\n${control.output}`,
  );
  const run = runIn(COPY_UNDER_OUT, [LAUNCHER, TAP]);
  assert.equal(run.status, 0, run.output);
  assert.deepEqual(
    run.ran,
    ["test/a.test.ts", "test/sub/b.test.ts"],
    `npm test ran ${run.ran.join(", ")}: a copy of the tree under out/ runs as suites of its own on every local run`,
  );
});

test("the shard flag ci.yml appends after npm test -- slices the suites under test/, one part per leg", () => {
  const first = runIn(FOUR_SUITES, [LAUNCHER, TAP, "--test-shard=1/2"]);
  const second = runIn(FOUR_SUITES, [LAUNCHER, TAP, "--test-shard=2/2"]);
  assert.deepEqual(
    [first.ran, second.ran],
    [
      ["test/a.test.ts", "test/c.test.ts"],
      ["test/b.test.ts", "test/d.test.ts"],
    ],
    `a flag after the suite's pattern is read as a pattern and ignored, so every leg runs every file, or the slices count a file outside test/:\n${first.output}\n${second.output}`,
  );
});

test("a path after npm test -- runs that path alone, as node's own patterns do", () => {
  const run = runIn(COPY_UNDER_OUT, [LAUNCHER, TAP, "test/sub/b.test.ts"]);
  assert.deepEqual(
    run.ran,
    ["test/sub/b.test.ts"],
    `a named path no longer narrows the run, which ran ${run.ran.join(", ")}. BLIND SPOT, declared, erring toward running more: a flag's value written as its own word (--test-reporter tap) reads as a path, so the run falls back to node's own collection, out/ included`,
  );
});

test("a red suite reds npm test, since the launcher hands back the runner's exit status", () => {
  const run = runIn(ONE_RED, [LAUNCHER, TAP]);
  assert.deepEqual(run.ran, ["red"], `the red suite never ran:\n${run.output}`);
  assert.equal(run.status, 1, `npm test exited ${run.status} over a red suite, so CI reads a red run as green`);
});

test("a red suite reds the launcher started through a symlink, since it asks import.meta.main whether it is the entry rather than comparing the path it was typed as (Issue #1180)", () => {
  const run = runIn(ONE_RED, [LAUNCHER_LINK, TAP], { [LAUNCHER_LINK]: LAUNCHER });
  assert.equal(
    run.status,
    1,
    `the launcher started through a symlink exited ${run.status} over a red suite, having run ${run.ran.length} tests: its entry check skipped, so a symlinked checkout reads a red run as green`,
  );
  assert.deepEqual(run.ran, ["red"], `the red suite never ran through the symlinked launcher:\n${run.output}`);
});

test("a runner killed by a signal reds npm test, since the launcher reads no exit status as a failure", () => {
  const run = runIn(RUNNER_KILLED, [LAUNCHER, TAP]);
  assert.equal(
    run.status,
    1,
    `npm test exited ${run.status} after its runner was killed, so CI reads a dead leg as green`,
  );
});

test("every suite npm test runs, the whole suite or a named path, loads test-support/source-read-guard.ts first, which a bare node --test never does", () => {
  const control = runIn(PRELOAD_SEEN, ["--test", TAP]);
  assert.deepEqual(
    control.ran,
    ["without the preload"],
    `a bare node --test already loads the seeded preload (an --import reaching it from the environment), so this fixture cannot tell a launcher that drops it:\n${control.output}`,
  );
  const whole = runIn(PRELOAD_SEEN, [LAUNCHER, TAP]);
  const named = runIn(PRELOAD_SEEN, [LAUNCHER, TAP, "test/a.test.ts"]);
  assert.deepEqual(
    [whole.ran, named.ran],
    [["after the preload"], ["after the preload"]],
    `npm test ran a suite without test-support/source-read-guard.ts loaded first, so the source-read guard watches no read in it:\n${whole.output}\n${named.output}`,
  );
});

test("the shard flag splits the suites under test/ by UNIT_SECONDS, not by count: the file the table weighs heaviest takes a leg of its own", () => {
  const control = runIn(WEIGHED, ["--test", TAP, "--test-shard=1/2", "test/**/*.test.ts"]);
  assert.equal(
    control.ran.length,
    2,
    `node's own split already gives this leg something other than two files, so the fixture cannot tell a split by seconds from node's:\n${control.output}`,
  );
  const first = runIn(WEIGHED, [LAUNCHER, TAP, "--test-shard=1/2"]);
  const second = runIn(WEIGHED, [LAUNCHER, TAP, "--test-shard=2/2"]);
  assert.deepEqual(
    [first.ran, second.ran],
    [[HEAVIEST], ["test/a.test.ts", "test/b.test.ts", "test/c.test.ts"]],
    `npm test hands the shard flag to node, which splits by position:\n${first.output}\n${second.output}`,
  );
});

test("a sharded run of the whole suite prints each file's seconds under a per-file wall clock head", () => {
  const run = runIn(FOUR_SUITES, [LAUNCHER, "--test-shard=1/1"]);
  assert.equal(run.status, 0, run.output);
  const lines = run.output.split("\n");
  const head = lines.findIndex((l) => l.startsWith("per-file wall clock (4 files, "));
  assert.notEqual(head, -1, `a sharded run prints no per-file wall clock head:\n${run.output}`);
  assert.deepEqual(
    lines
      .slice(head + 1, head + 5)
      .map((l) => l.trim().split(" ")[0])
      .sort(),
    ["test/a.test.ts", "test/b.test.ts", "test/c.test.ts", "test/d.test.ts"],
    `the clock does not list each file under test/ once:\n${run.output}`,
  );
});

test("the legs of a sharded run together run each suite under test/ exactly once, nested folders included, and none under out/", () => {
  const legs = [1, 2, 3].map((k) => runIn(NESTED, [LAUNCHER, TAP, `--test-shard=${k}/3`]));
  assert.deepEqual(
    legs.map((l) => l.status),
    [0, 0, 0],
    legs.map((l) => l.output).join("\n"),
  );
  assert.deepEqual(
    legs.flatMap((l) => l.ran).sort(),
    ["test/a.test.ts", "test/d.test.ts", "test/sub/b.test.ts", "test/sub/deep/c.test.ts"],
    "the legs drop a suite, run one twice, or run the copy under out/",
  );
});
