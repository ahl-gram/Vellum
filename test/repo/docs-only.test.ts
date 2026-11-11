import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { DOC_DIRS, DOC_FILES, OUTPUT_KEY, changedPaths, docsOnly, isDoc, verdict } from "../../scripts/docs-only.ts";
import { ciJob } from "../../test-support/ci-job.ts";
import { commitAll, withTempRepo, writeFiles } from "../../test-support/proof-runner-repo.ts";
import { git } from "../../test-support/sandbox-repo.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");

const moveMerge = (dir: string): void => {
  git(["checkout", "-q", "-b", "feature"], dir);
  git(["mv", "src/a.ts", "handbook/a.md"], dir);
  commitAll(dir, "move");
  git(["checkout", "-q", "main"], dir);
  writeFiles(dir, { "src/b.ts": "b\n" });
  commitAll(dir, "main moves");
  git(["merge", "-q", "--no-ff", "-m", "merge", "feature"], dir);
};

const docsMerge = (dir: string): void => {
  git(["checkout", "-q", "-b", "feature"], dir);
  writeFiles(dir, { "handbook/b.md": "b\n" });
  commitAll(dir, "doc");
  git(["checkout", "-q", "main"], dir);
  writeFiles(dir, { "src/c.ts": "c\n" });
  commitAll(dir, "main moves");
  git(["merge", "-q", "--no-ff", "-m", "merge", "feature"], dir);
};

test("a path is a doc only when DOC_FILES names it or it lies under a DOC_DIRS folder, and every entry names a path the tree holds", () => {
  const docs = [
    "handbook/specs/rulebook.md",
    "handbook/plans/700/779/779-part2h-support/779-2h-rows-kit.json",
    ".claude/agents/vellum-planner.md",
    ".claude/skills/vellum-footguns/references/scars.md",
    ...DOC_FILES,
  ];
  for (const p of docs) assert.ok(isDoc(p), `${p} is a doc`);
  const code = [
    "src/pages/index.astro",
    "design/kit/README.md",
    "design/kit/outlines/README.md",
    "e2e/suites/zoom/notes.md",
    ".github/workflows/ci.yml",
    ".claude/settings.json",
    ".claude/skills/vellum-footguns/hooks/footgun-gate.ts",
    "scripts/docs-only.ts",
    "package.json",
    "test/repo/docs-only.test.ts",
    "handbookx/a.md",
    "handbook",
    "docs/CLAUDE.md",
    "src/README.md",
  ];
  for (const p of code) assert.ok(!isDoc(p), `${p} is not a doc`);
  for (const p of [...DOC_FILES, ...DOC_DIRS]) assert.ok(existsSync(join(ROOT, p)), `${p} names no path in the tree`);
});

test("only a pull request whose changed files are all docs is docs-only, and a push, a run by hand, an empty diff and an unread diff each run every lane", () => {
  assert.equal(docsOnly("pull_request", ["handbook/a.md", "CLAUDE.md"]), true);
  assert.equal(docsOnly("pull_request", ["handbook/a.md", "src/a.ts"]), false);
  assert.equal(docsOnly("push", ["handbook/a.md"]), false);
  assert.equal(docsOnly("workflow_dispatch", ["handbook/a.md"]), false);
  assert.equal(docsOnly("", ["handbook/a.md"]), false);
  assert.equal(docsOnly("pull_request", []), false);
  assert.equal(docsOnly("pull_request", null), false);
});

test("the changed files are read off a merge commit's first parent with a move listed at both ends, and nothing is read off a commit that is not a merge", async () => {
  await withTempRepo({ "src/a.ts": "a\n", "src/keep.ts": "k\n", "handbook/x.md": "x\n" }, (dir) => {
    moveMerge(dir);
    assert.deepEqual([...(changedPaths(dir) ?? [])].sort(), ["handbook/a.md", "src/a.ts"]);
    git(["checkout", "-q", "feature"], dir);
    assert.equal(changedPaths(dir), null);
    git(["checkout", "-q", "main"], dir);
    for (const branch of ["one", "two"]) {
      git(["checkout", "-q", "-b", branch, "main"], dir);
      writeFiles(dir, { [`src/${branch}.ts`]: `${branch}\n` });
      commitAll(dir, branch);
      git(["checkout", "-q", "main"], dir);
    }
    git(["merge", "-q", "--no-ff", "-m", "octopus", "one", "two"], dir);
    assert.equal(
      git(["rev-list", "--parents", "-n", "1", "HEAD"], dir).split(" ").length,
      4,
      "the fixture is a three-parent merge",
    );
    assert.equal(changedPaths(dir), null);
  });
});

test("the verdict runs every lane on any doubt: an event that is not a pull request, a directory git cannot read, a HEAD that is not a merge", async () => {
  await withTempRepo({ "src/a.ts": "a\n" }, (dir) => {
    docsMerge(dir);
    assert.equal(verdict("pull_request", dir).docsOnly, true);
    assert.equal(verdict("push", dir).docsOnly, false);
    git(["checkout", "-q", "feature"], dir);
    assert.equal(verdict("pull_request", dir).docsOnly, false);
  });
  const bare = realpathSync(mkdtempSync(join(tmpdir(), "docs-only-bare-")));
  try {
    assert.throws(() => git(["rev-parse", "--git-dir"], bare));
    assert.doesNotThrow(() => verdict("pull_request", bare));
    assert.equal(verdict("pull_request", bare).docsOnly, false);
  } finally {
    rmSync(bare, { recursive: true, force: true });
  }
});

test("the script writes docs_only=true to GITHUB_OUTPUT on a docs-only pull request and docs_only=false on a push", async () => {
  const outDir = realpathSync(mkdtempSync(join(tmpdir(), "docs-only-out-")));
  try {
    await withTempRepo({ "src/a.ts": "a\n" }, (dir) => {
      docsMerge(dir);
      const run = (event: string, out: string): void => {
        execFileSync(process.execPath, [join(ROOT, "scripts", "docs-only.ts")], {
          cwd: dir,
          env: { ...process.env, GITHUB_EVENT_NAME: event, GITHUB_OUTPUT: out },
          encoding: "utf8",
          timeout: 30_000,
          stdio: ["ignore", "pipe", "pipe"],
        });
      };
      const first = join(outDir, "pull-request");
      run("pull_request", first);
      assert.ok(existsSync(first), "the script wrote no GITHUB_OUTPUT file");
      assert.equal(readFileSync(first, "utf8"), `${OUTPUT_KEY}=true\n`);
      const second = join(outDir, "push");
      run("push", second);
      assert.equal(readFileSync(second, "utf8"), `${OUTPUT_KEY}=false\n`);
    });
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
});

const SCOPE_STEP = "      - name: Docs-only diff\n        id: scope\n        run: node scripts/docs-only.ts";
const SKIP_UNLESS_DOCS = `        if: steps.scope.outputs.${OUTPUT_KEY} != 'true'`;

test("each e2e lane runs every step after the docs-only verdict unless the verdict is true, and only checkout and an uncached setup-node before it", () => {
  const job = ciJob("build-and-e2e");
  const lines = job.split("\n");
  const head = lines.findIndex((l) => /^ {4}steps:\s*$/.test(l));
  assert.notEqual(head, -1, "the build-and-e2e job has no steps: key at four-space indent");
  const steps = lines
    .slice(head + 1)
    .join("\n")
    .split(/\n(?= {6}- )/)
    .map((s) => s.trimEnd());
  const at = steps.indexOf(SCOPE_STEP);
  assert.notEqual(at, -1, "the build-and-e2e job has no Docs-only diff step of the shape the plan gives");
  assert.deepEqual(steps.slice(0, at), [
    "      - uses: actions/checkout@v4\n        with:\n          fetch-depth: 2",
    "      - uses: actions/setup-node@v4\n        with:\n          node-version: '26'",
  ]);
  const after = steps.slice(at + 1);
  for (const s of after) {
    assert.deepEqual(
      s.match(/^ {8}if: .*$/gm),
      [SKIP_UNLESS_DOCS],
      `this step is not skipped on a docs-only verdict alone:\n${s}`,
    );
  }
  const firstValue = (s: string): string | undefined => {
    const m = /^ {6}- (?:uses|run): (.*)$|^ {8}(?:uses|run): (.*)$/m.exec(s);
    return m?.[1] ?? m?.[2];
  };
  assert.deepEqual(after.map(firstValue), [
    "actions/setup-node@v4",
    "npm ci",
    "npm run build",
    "|",
    "npm run test:e2e:lanes -- --lane ${{ matrix.lane }}",
  ]);
  assert.equal(job.match(/^\s+cache: npm$/gm)?.length, 1);
  assert.match(after[0] ?? "", /^ {10}cache: npm$/m);
  assert.doesNotMatch(job, /^ {4}if:/m);
});

test("the unit jobs run every step on every diff, and ci.yml's triggers carry no path filter, so all eight required checks report on every pull request", () => {
  assert.doesNotMatch(ciJob("check-and-test"), /^\s+if:/m);
  const lines = readFileSync(join(ROOT, ".github", "workflows", "ci.yml"), "utf8").split("\n");
  const from = lines.findIndex((l) => l === "on:");
  assert.notEqual(from, -1, "ci.yml has no top-level on: key");
  const rest = lines.slice(from + 1);
  const next = rest.findIndex((l) => /^\S/.test(l));
  const block = ["on:", ...rest.slice(0, next === -1 ? rest.length : next)].filter(
    (l) => l.trim() !== "" && !l.trim().startsWith("#"),
  );
  assert.deepEqual(block, ["on:", "  push:", "    branches: [main]", "  pull_request:", "  workflow_dispatch:"]);
});
