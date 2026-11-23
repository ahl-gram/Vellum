import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { nextStep, type Snapshot } from "../../scripts/handoff/next.ts";
import { collect, handoffRefOf, makeSlot } from "../../scripts/handoff/slot.ts";
import { folderOf, treeOf } from "../../scripts/handoff/state.ts";
import { BOUND_MS, git } from "../../test-support/sandbox-repo.ts";

const HOOKS = [
  "applypatch-msg",
  "pre-applypatch",
  "post-applypatch",
  "pre-commit",
  "pre-merge-commit",
  "prepare-commit-msg",
  "commit-msg",
  "post-commit",
  "pre-rebase",
  "post-checkout",
  "post-merge",
  "pre-push",
  "pre-receive",
  "update",
  "proc-receive",
  "post-receive",
  "post-update",
  "reference-transaction",
  "push-to-checkout",
  "pre-auto-gc",
  "post-rewrite",
  "sendemail-validate",
  "fsmonitor-watchman",
  "p4-changelist",
  "p4-prepare-changelist",
  "p4-post-changelist",
  "p4-pre-submit",
  "post-index-change",
];

const dir = realpathSync(mkdtempSync(join(tmpdir(), "handoff-collect-")));
const main = join(dir, "main");
const bare = join(dir, "origin.git");
const marks = join(dir, "marks");
const tree = treeOf(main, 9);
let slot = "";

const script = (file: string, mark: string): void => {
  writeFileSync(file, `#!/bin/sh\necho ran >> "${join(marks, mark)}"\n`);
  chmodSync(file, 0o755);
};

const marked = (): string[] => readdirSync(marks).sort();

const plant = (): void => {
  const pathFolder = join(dir, "hookspath");
  mkdirSync(pathFolder, { recursive: true });
  for (const hook of HOOKS) {
    script(join(slot, ".git", "hooks", hook), hook);
    script(join(pathFolder, hook), `path-${hook}`);
  }
  git(["config", "core.hooksPath", pathFolder], slot);
  script(join(dir, "fsmonitor"), "fsmonitor");
  writeFileSync(join(dir, "included.cfg"), `[core]\n\tfsmonitor = ${join(dir, "fsmonitor")}\n`);
  git(["config", "include.path", join(dir, "included.cfg")], slot);
  git(["config", "credential.helper", `!echo ran >> ${join(marks, "credential")}; true`], slot);
  script(join(dir, "pack-objects-hook"), "pack-objects-hook");
  git(["config", "uploadpack.packObjectsHook", join(dir, "pack-objects-hook")], slot);
  git(["config", "protocol.ext.allow", "always"], slot);
  script(join(dir, "ext-command"), "ext");
  git(["config", "remote.origin.url", `ext::${join(dir, "ext-command")}`], slot);
};

before(() => {
  mkdirSync(marks, { recursive: true });
  git(["init", "--bare", "-q", "-b", "main", bare], dir);
  mkdirSync(join(main, "node_modules"), { recursive: true });
  git(["init", "-q", "-b", "main", "."], main);
  git(["config", "user.email", "t@t"], main);
  git(["config", "user.name", "t"], main);
  git(["config", "commit.gpgsign", "false"], main);
  git(["commit", "-q", "--allow-empty", "-m", "base"], main);
  git(["remote", "add", "origin", bare], main);
  git(["push", "-q", "origin", "main"], main);
  slot = makeSlot(main);
  git(["config", "user.email", "t@t"], slot);
  git(["config", "user.name", "t"], slot);
  git(["config", "commit.gpgsign", "false"], slot);
  git(["switch", "-q", "-c", "feat/9-x"], slot);
  git(["commit", "-q", "--allow-empty", "-m", "built"], slot);
});

after(() => rmSync(dir, { recursive: true, force: true }));

test("a second run's commits move the review tree forward by fast-forward (Issue #1418)", () => {
  assert.deepEqual(collect(main, 9), { branch: "feat/9-x", problems: [] });
  git(["commit", "-q", "--allow-empty", "-m", "fixed"], slot);
  assert.deepEqual(collect(main, 9), { branch: "feat/9-x", problems: [] });
  assert.equal(git(["rev-parse", "HEAD"], tree), git(["rev-parse", "HEAD"], slot));
  assert.equal(git(["rev-parse", handoffRefOf(9)], main), git(["rev-parse", "HEAD"], slot));
  assert.equal(git(["rev-list", "--count", "origin/main..HEAD"], tree), "2");
  rmSync(join(tree, "node_modules"));
  git(["worktree", "remove", "--force", tree], main);
  git(["branch", "-q", "-D", "feat/9-x"], main);
  git(["update-ref", "-d", handoffRefOf(9)], main);
});

test("collecting a run fetches the build's branch and runs nothing the build planted in its clone (Issue #1418)", () => {
  plant();
  const head = git(["rev-parse", "HEAD"], slot);
  assert.deepEqual(collect(main, 9), { branch: "feat/9-x", problems: [] });
  assert.deepEqual(marked(), []);
  assert.equal(git(["rev-parse", handoffRefOf(9)], main), head);
  assert.equal(git(["rev-parse", "HEAD"], tree), head);
  assert.equal(git(["branch", "--show-current"], tree), "feat/9-x");
});

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
    runs: [
      {
        n: 1,
        kind: "build",
        started: "2026-11-20T10:00:00.000Z",
        pid: 4242,
        ended: "2026-11-20T10:05:00.000Z",
        exit: 0,
      },
    ],
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

test("the push next prints from the review tree reaches the remote and runs nothing the build planted (Issue #1418)", () => {
  execFileSync("git", printedPush(), { encoding: "utf8", timeout: BOUND_MS, stdio: "pipe" });
  assert.notEqual(
    git(["ls-remote", bare, "refs/heads/feat/9-x"], dir),
    "",
    "the printed push did not reach the remote",
  );
  assert.deepEqual(marked(), []);
});

test("a clone on no branch named for the issue collects nothing and says so (Issue #1418)", () => {
  writeFileSync(join(slot, ".git", "HEAD"), "ref: refs/heads/main\n");
  const got = collect(main, 10);
  assert.equal(got.branch, null);
  assert.equal(got.problems.length, 1);
  assert.ok(got.problems[0]?.includes("Issue #10"), got.problems.join("\n"));
  assert.equal(existsSync(treeOf(main, 10)), false);
  writeFileSync(join(slot, ".git", "HEAD"), "ref: refs/heads/feat/9-x\n");
});

test("a collect whose branch already exists in the main repository says so and leaves no review tree (Issue #1418)", () => {
  const head = git(["rev-parse", "HEAD"], slot);
  mkdirSync(join(slot, ".git", "refs", "heads", "feat"), { recursive: true });
  writeFileSync(join(slot, ".git", "refs", "heads", "feat", "11-z"), `${head}\n`);
  writeFileSync(join(slot, ".git", "HEAD"), "ref: refs/heads/feat/11-z\n");
  git(["branch", "feat/11-z", head], main);
  const got = collect(main, 11);
  assert.equal(got.branch, "feat/11-z");
  assert.equal(got.problems.length, 1);
  assert.ok(got.problems[0]?.includes("already exists"), got.problems.join("\n"));
  assert.equal(existsSync(treeOf(main, 11)), false);
  assert.equal(git(["worktree", "list"], main).includes("codex-11"), false);
  writeFileSync(join(slot, ".git", "HEAD"), "ref: refs/heads/feat/9-x\n");
});

test("git run inside the build's clone runs what it planted, so the marks are witnesses (Issue #1418)", () => {
  git(["status"], slot);
  assert.throws(() => git(["ls-remote", "origin"], slot));
  const seen = marked();
  assert.ok(seen.includes("fsmonitor"), seen.join(","));
  assert.ok(seen.includes("ext"), seen.join(","));
});
