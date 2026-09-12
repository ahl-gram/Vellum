import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { create, readHead, resolveRoot, sandboxPath, validateName } from "../../scripts/agent-sandbox.ts";

const BOUND_MS = 30_000;
const git = (args: string[], cwd: string): string => execFileSync("git", args, { cwd, encoding: "utf8", timeout: BOUND_MS }).trim();

// resolveRoot's whole point is invisible in a plain checkout, where --show-toplevel and the root of --git-common-dir are the same path; they diverge only from a linked worktree, and CI's unit lane is a plain clone. So the fixture builds the divergence rather than asserting into it.
const withRepo = (body: (main: string, linked: string) => void): void => {
  const made = mkdtempSync(join(tmpdir(), "agent-sandbox-"));
  const dir = realpathSync(made); // git reports realpaths, and on macOS tmpdir() is /var, a symlink to /private/var, so an unresolved fixture path never equals what resolveRoot returns

  try {
    git(["init", "-q", "-b", "main", "."], dir);
    git(["config", "user.email", "t@t"], dir);
    git(["config", "user.name", "t"], dir);
    writeFileSync(join(dir, "f.txt"), "one\n");
    git(["add", "-A"], dir);
    git(["commit", "-qm", "c1"], dir);
    const linked = join(dir, "linked");
    git(["worktree", "add", "-q", "--detach", linked, "HEAD"], dir);
    writeFileSync(join(linked, "f.txt"), "two\n");
    git(["add", "-A"], linked);
    git(["commit", "-qm", "c2"], linked);
    body(dir, linked);
  } finally {
    rmSync(made, { recursive: true, force: true });
  }
};

test("resolveRoot returns the main checkout from inside a linked worktree", () => {
  withRepo((main, linked) => {
    assert.notEqual(git(["rev-parse", "HEAD"], main), git(["rev-parse", "HEAD"], linked), "the fixture must diverge, or this asserts nothing");
    assert.equal(resolveRoot(linked), main, "resolveRoot returned the worktree, so a sandbox built from it lands at the wrong depth and the node_modules link breaks");
    assert.equal(resolveRoot(main), main);
  });
});

test("readHead reads the commit of the tree it is given, not the main checkout's", () => {
  withRepo((main, linked) => {
    assert.equal(readHead(linked), git(["rev-parse", "HEAD"], linked), "readHead read some other tree's HEAD, which is #575 exactly");
    assert.notEqual(readHead(linked), readHead(main));
  });
});

test("validateName accepts the two sandbox prefixes and refuses everything else", () => {
  for (const good of ["guard-575", "guard-575-r2", "skeptic-576-r1", "guard-a.b_c-1"]) {
    assert.equal(validateName(good), good, `${good} is a legitimate sandbox name`);
  }
  for (const bad of ["", "575", "other-session", "guard", "guard-", "../escape", "guard-../..", "/abs/path", "guard x", "Guard-1"]) {
    assert.throws(() => validateName(bad), `${bad} was accepted, so the script can address a worktree it did not create`);
  }
});

test("sandboxPath lands under the root's worktrees directory and nowhere else", () => {
  assert.equal(sandboxPath("/r", "guard-1"), join("/r", ".claude", "worktrees", "guard-1"));
  assert.throws(() => sandboxPath("/r", "../escape"), "a name that escapes the worktrees directory was accepted");
});

test("create requires an explicit commit for a skeptic sandbox and defaults one for a guard sandbox", () => {
  withRepo((main, linked) => {
    assert.throws(
      () => create("skeptic-1", undefined, linked),
      /sha/i,
      "a skeptic sandbox defaulted its commit: the PR head must be resolved per round, so defaulting silently reports results for a commit that was never run (#575)",
    );
    const wt = create("guard-1", undefined, linked);
    try {
      assert.equal(git(["rev-parse", "HEAD"], wt), readHead(linked), "the guard sandbox was not built at the dispatch tree's commit");
    } finally {
      git(["-C", main, "worktree", "remove", "--force", wt], main);
    }
  });
});
