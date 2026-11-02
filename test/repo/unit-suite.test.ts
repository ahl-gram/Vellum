import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

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

const ONE_RED = {
  "test/a.test.ts": `import { test } from "node:test";\ntest("red", () => { throw new Error("red"); });\n`,
};

const PRELOAD_SEEN = {
  "test-support/source-read-guard.ts": "Object.assign(globalThis, { vellumPreload: true });\n",
  "test/a.test.ts": `import { test } from "node:test";\ntest("vellumPreload" in globalThis ? "after the preload" : "without the preload", () => {});\n`,
};

type Run = { status: number | null; ran: string[]; output: string };

const runIn = (files: Readonly<Record<string, string>>, argv: readonly string[]): Run => {
  const dir = mkdtempSync(join(tmpdir(), "vellum-unit-suite-"));
  try {
    const seeded = { "package.json": TYPE_MODULE, "test-support/source-read-guard.ts": "export {};\n", ...files };
    for (const [rel, body] of Object.entries(seeded)) {
      mkdirSync(join(dir, dirname(rel)), { recursive: true });
      writeFileSync(join(dir, rel), body);
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
