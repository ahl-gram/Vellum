import assert from "node:assert/strict";
import { mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { deletedFiles } from "../../scripts/comment-judge/tree.ts";
import { git } from "../../test-support/sandbox-repo.ts";

test("a deleted file is one the branch removes, and a renamed file is never also one, whatever the repository's diff.renames says", () => {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), "comment-judge-tree-")));
  try {
    git(["init", "-q", "-b", "main", "."], dir);
    git(["config", "user.email", "t@t"], dir);
    git(["config", "user.name", "t"], dir);
    git(["config", "diff.renames", "false"], dir);
    writeFileSync(join(dir, "kept.ts"), "export const kept = 1;\n");
    writeFileSync(join(dir, "gone.ts"), "export const gone = 2;\n");
    git(["add", "-A"], dir);
    git(["commit", "-qm", "base"], dir);
    const base = git(["rev-parse", "HEAD"], dir);
    git(["mv", "kept.ts", "renamed.ts"], dir);
    git(["rm", "-q", "gone.ts"], dir);
    git(["commit", "-qm", "head"], dir);
    const head = git(["rev-parse", "HEAD"], dir);
    assert.deepEqual(deletedFiles(dir, base, head), ["gone.ts"]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
