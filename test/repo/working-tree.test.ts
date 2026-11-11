import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { commitAll, withTempRepo, writeFiles } from "../../test-support/proof-runner-repo.ts";
import { git } from "../../test-support/sandbox-repo.ts";
import { listWorkingTree } from "../../test-support/working-tree.ts";

const FILES = { ".gitignore": "src/ignored.ts\n", "docs/z.md": "z\n", "src/a.ts": "a\n", "test/t.ts": "t\n" };

test("the working tree lists every tracked file and every untracked file git does not ignore, once each and in path order, limited to the pathspecs given (Issue #1332)", async () => {
  await withTempRepo(FILES, (dir) => {
    writeFiles(dir, { "src/0.ts": "0\n", "src/ignored.ts": "i\n" });
    assert.deepEqual(listWorkingTree(dir), [".gitignore", "docs/z.md", "src/0.ts", "src/a.ts", "test/t.ts"]);
    assert.deepEqual(listWorkingTree(dir, ["src"]), ["src/0.ts", "src/a.ts"]);
    assert.deepEqual(listWorkingTree(dir, ["docs", "test"]), ["docs/z.md", "test/t.ts"]);
    assert.deepEqual(listWorkingTree(dir, ["src/*.ts"]), ["src/0.ts", "src/a.ts"]);
  });
});

test("a file left conflicted by a merge is listed once, not once per stage (Issue #1332)", async () => {
  await withTempRepo({ "src/c.ts": "base\n" }, (dir) => {
    git(["checkout", "-q", "-b", "side"], dir);
    writeFiles(dir, { "src/c.ts": "side\n" });
    commitAll(dir, "side");
    git(["checkout", "-q", "main"], dir);
    writeFiles(dir, { "src/c.ts": "main\n" });
    commitAll(dir, "main");
    spawnSync("git", ["merge", "side"], { cwd: dir, timeout: 30_000 });
    assert.match(git(["ls-files", "-u"], dir), /src\/c\.ts/, "the merge left no conflict, so this test reads none");
    assert.deepEqual(listWorkingTree(dir), ["src/c.ts"]);
  });
});

test("a listing that runs past the time it is given throws, naming git ls-files, rather than return a partial tree (Issue #1332)", async () => {
  await withTempRepo(FILES, (dir) => {
    assert.throws(() => listWorkingTree(dir, [], 1), /git ls-files under .+ failed/);
  });
});

test("outside a git repository the listing throws, naming git ls-files, rather than return an empty tree (Issue #1332)", () => {
  const made = mkdtempSync(join(tmpdir(), "working-tree-"));
  try {
    assert.throws(() => listWorkingTree(realpathSync(made)), /git ls-files under .+ failed/);
  } finally {
    rmSync(made, { recursive: true, force: true });
  }
});
