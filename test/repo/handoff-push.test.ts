import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { nextStep, type Snapshot } from "../../scripts/handoff/next.ts";
import { folderOf, treeOf } from "../../scripts/handoff/state.ts";
import { BOUND_MS, git } from "../../test-support/sandbox-repo.ts";

const dir = realpathSync(mkdtempSync(join(tmpdir(), "handoff-push-")));
const main = join(dir, "main");
const bare = join(dir, "origin.git");
const marks = join(dir, "marks");
const tree = treeOf(main, 9);

before(() => {
  git(["init", "--bare", "-q", "-b", "main", bare], dir);
  mkdirSync(main, { recursive: true });
  git(["init", "-q", "-b", "main", "."], main);
  git(["config", "user.email", "t@t"], main);
  git(["config", "user.name", "t"], main);
  git(["config", "commit.gpgsign", "false"], main);
  git(["commit", "-q", "--allow-empty", "-m", "base"], main);
  git(["remote", "add", "origin", bare], main);
  git(["push", "-q", "origin", "main"], main);
  git(["worktree", "add", "-q", "-b", "feat/9-x", tree, "HEAD"], main);
  git(["commit", "-q", "--allow-empty", "-m", "built"], tree);
  mkdirSync(marks, { recursive: true });
  for (const hook of ["pre-push", "reference-transaction", "post-commit", "pre-receive"]) {
    const file = join(main, ".git", "hooks", hook);
    writeFileSync(file, `#!/bin/sh\necho ran >> "${join(marks, hook)}"\n`);
    chmodSync(file, 0o755);
  }
});

after(() => rmSync(dir, { recursive: true, force: true }));

const snapshot = (): Snapshot => ({
  issue: 9,
  root: main,
  folder: folderOf(main, 9),
  builder: "codex",
  state: {
    issue: 9,
    plan: "/p/9-plan.md",
    tree,
    session: "s",
    model: "m",
    effort: "high",
    thread: "th",
    runs: [{ n: 1, kind: "build", started: "t", pid: 1, ended: "t2", exit: 0 }],
  },
  running: false,
  outcome: "ready",
  branch: "feat/9-x",
  treeHead: git(["rev-parse", "HEAD"], tree),
  remoteHead: null,
  proverReported: false,
  pr: null,
});

const printedPush = (): string[] => {
  const text = nextStep(snapshot()).text;
  const at = text.indexOf("Push it: ");
  assert.notEqual(at, -1, text);
  const command = text.slice(at + "Push it: ".length).split(", then run")[0] ?? "";
  const words = command.split(" ");
  assert.equal(words[0], "git", command);
  return words.slice(1);
};

test("the push next prints runs no git hook of the shared .git/hooks, whichever hook a build planted (Issue #1409)", () => {
  execFileSync("git", printedPush(), { encoding: "utf8", timeout: BOUND_MS, stdio: "pipe" });
  assert.notEqual(
    git(["ls-remote", bare, "refs/heads/feat/9-x"], dir),
    "",
    "the printed push did not reach the remote",
  );
  for (const hook of ["pre-push", "reference-transaction", "post-commit", "pre-receive"]) {
    assert.equal(existsSync(join(marks, hook)), false, `${hook} ran on the printed push`);
  }
});

test("a plain push of the same tree runs the planted hooks, so the marker is a witness (Issue #1409)", () => {
  git(["push", "-q", "origin", "HEAD:refs/heads/control"], tree);
  assert.equal(existsSync(join(marks, "pre-push")), true);
  assert.equal(existsSync(join(marks, "reference-transaction")), true);
});
