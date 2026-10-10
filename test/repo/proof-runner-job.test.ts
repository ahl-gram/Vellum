import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { runBudgeted, runJob, type Runner } from "../../scripts/proof-runner/job.ts";
import type { Job } from "../../scripts/proof-runner/list.ts";
import { withTempRepo } from "../../test-support/proof-runner-repo.ts";
import { git } from "../../test-support/sandbox-repo.ts";

const REPORTER = resolve(import.meta.dirname, "..", "..", "scripts", "proof-runner", "reporter.ts");
const patchOf = (from: string, to: string) =>
  `diff --git a/src/x.ts b/src/x.ts\n--- a/src/x.ts\n+++ b/src/x.ts\n@@ -1 +1 @@\n-${from}\n+${to}\n`;
const FILES = {
  "package.json": '{ "type": "module" }\n',
  "src/x.ts": "export const x = 1;\n",
  "test/x.test.ts":
    'import { test } from "node:test";\nimport assert from "node:assert/strict";\nimport { x } from "../src/x.ts";\ntest("x is one", () => assert.equal(x, 1));\n',
};
const ok = { status: 0, stdout: "", stderr: "", budget: false, seconds: 0 };

const withTmp = async <T>(body: (tmp: string) => Promise<T>): Promise<T> => {
  const made = mkdtempSync(join(tmpdir(), "proof-runner-job-"));
  try {
    return await body(realpathSync(made));
  } finally {
    rmSync(made, { recursive: true, force: true });
  }
};

const fakes =
  (calls: string[], overrides: Record<string, Awaited<ReturnType<Runner>>> = {}): Runner =>
  async (cmd, args, options) => {
    const line = [cmd, ...args].join(" ");
    const key = Object.keys(overrides).find((k) => line.includes(k));
    if (key !== undefined) {
      calls.push(key);
      return overrides[key]!;
    }
    if (line.includes("npm run build") || line.includes("e2e/run.ts") || line.includes("eslint")) {
      calls.push(line.includes("build") ? "build" : line.includes("eslint") ? "lint" : "e2e");
      return line.includes("eslint") ? { ...ok, stdout: "[]" } : ok;
    }
    if (line.includes("--test")) calls.push("unit");
    return runBudgeted(cmd, args, options);
  };

const job = (more: Partial<Job> = {}): Job => ({
  id: "j",
  patch: patchOf("export const x = 1;", "export const x = 2;"),
  unit: { files: ["test/x.test.ts"], expect: ["x is one"] },
  ...more,
});

test("a patch that applies leaves the file with the patch's text, and the unit run then reads its red", async () => {
  await withTempRepo(FILES, (dir, sha) =>
    withTmp(async (tmp) => {
      const got = await runJob(0, job(), sha, dir, { run: fakes([]), reporter: REPORTER, tmp });
      assert.equal(got.applied, true);
      assert.equal(readFileSync(join(dir, "src/x.ts"), "utf8"), "export const x = 2;\n");
      assert.deepEqual(got.checks[0]?.reds, [{ name: "x is one", file: "test/x.test.ts" }]);
    }),
  );
});

test("a patch that no longer applies is reported with git's own message, and the tree is left exactly as it was", async () => {
  await withTempRepo(FILES, (dir, sha) =>
    withTmp(async (tmp) => {
      const calls: string[] = [];
      const got = await runJob(0, job({ patch: patchOf("export const x = 9;", "export const x = 2;") }), sha, dir, {
        run: fakes(calls),
        reporter: REPORTER,
        tmp,
      });
      assert.equal(got.applied, false);
      assert.match(got.applyError, /patch does not apply/);
      assert.deepEqual(calls, [], "a check ran on a tree its patch never reached");
      assert.equal(readFileSync(join(dir, "src/x.ts"), "utf8"), FILES["src/x.ts"]);
    }),
  );
});

test("unit runs first, then lint, and the build only when there is a browser check, which runs after it", async () => {
  await withTempRepo(FILES, (dir, sha) =>
    withTmp(async (tmp) => {
      const calls: string[] = [];
      const both = job({ lint: { files: ["src/x.ts"], expect: ["r"] }, e2e: { suites: "specimen", expect: ["SB1"] } });
      await runJob(0, both, sha, dir, { run: fakes(calls), reporter: REPORTER, tmp });
      assert.deepEqual(calls, ["unit", "lint", "build", "e2e"]);
      calls.length = 0;
      git(["checkout", "--", "."], dir);
      await runJob(1, job({ patch: undefined, unit: { files: ["test/x.test.ts"], expect: [] } }), sha, dir, {
        run: fakes(calls),
        reporter: REPORTER,
        tmp,
      });
      assert.deepEqual(calls, ["unit"], "a job with no browser check built the site anyway");
    }),
  );
});

test("a budget kills the command's whole process group, so a chain's grandchild does not outlive it", async () => {
  await withTmp(async (tmp) => {
    const pidFile = join(tmp, "pid");
    const started = Date.now();
    const got = await runBudgeted("sh", ["-c", `sleep 60 & echo $! > ${pidFile}; wait`], { cwd: tmp, budgetMs: 1000 });
    assert.equal(got.budget, true);
    assert.ok(Date.now() - started < 20_000, "the budget did not end the run, so close waited on the grandchild");
    const pid = Number(readFileSync(pidFile, "utf8"));
    try {
      await new Promise((settle) => setTimeout(settle, 200));
      assert.throws(
        () => process.kill(pid, 0),
        "the chain's grandchild outlived the budget, which is what a spawnSync timeout leaves behind",
      );
    } finally {
      try {
        process.kill(pid, "SIGKILL");
      } catch {}
    }
  });
});

test("a tree that is not clean when the job starts is reported before anything is applied", async () => {
  await withTempRepo(FILES, (dir, sha) =>
    withTmp(async (tmp) => {
      writeFileSync(join(dir, "stray.txt"), "left over\n");
      const calls: string[] = [];
      const got = await runJob(0, job(), sha, dir, { run: fakes(calls), reporter: REPORTER, tmp });
      assert.match(got.error ?? "", /not clean/);
      assert.equal(got.applied, null);
      assert.deepEqual(calls, []);
      assert.equal(readFileSync(join(dir, "src/x.ts"), "utf8"), FILES["src/x.ts"]);
    }),
  );
});

test("a build that runs past its budget still writes the result, the unit half kept and the browser check marked", async () => {
  await withTempRepo(FILES, (dir, sha) =>
    withTmp(async (tmp) => {
      const run = fakes([], { "npm run build": { ...ok, status: null, budget: true } });
      const got = await runJob(0, job({ e2e: { suites: "specimen", expect: ["SB1"] } }), sha, dir, {
        run,
        reporter: REPORTER,
        tmp,
      });
      assert.deepEqual(
        got.checks.map((c) => c.kind),
        ["unit", "e2e"],
      );
      assert.deepEqual(
        got.checks[0]?.reds.map((r) => r.name),
        ["x is one"],
      );
      assert.equal(got.checks[1]?.budget, true);
      assert.equal(existsSync(join(dir, "dist")), false);
    }),
  );
});
