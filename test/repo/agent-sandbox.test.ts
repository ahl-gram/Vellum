import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readlinkSync, realpathSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { create, createPlan, listing, readHead, resolveRoot, resolveTree, sandboxPath, sandboxes, snapshot, teardown, teardownPlan, validateName } from "../../scripts/agent-sandbox.ts";

const BOUND_MS = 30_000;
const SCRIPT = resolve(import.meta.dirname, "..", "..", "scripts", "agent-sandbox.ts");
const git = (args: string[], cwd: string): string => execFileSync("git", args, { cwd, encoding: "utf8", timeout: BOUND_MS }).trim();

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

test("teardown removes the sandbox and its registration, and leaves the dispatch tree alone", () => {
  withRepo((main, linked) => {
    const before = listing(linked);
    const wt = create("guard-teardown", undefined, linked);
    assert.ok(existsSync(wt), "the sandbox was never created, so teardown proves nothing");
    assert.match(git(["worktree", "list"], main), /guard-teardown/, "the sandbox was not registered");
    teardown("guard-teardown", linked);
    assert.equal(existsSync(wt), false, "the sandbox directory survived teardown");
    assert.doesNotMatch(git(["worktree", "list"], main), /guard-teardown/, "the registration survived teardown, which is what a leaked sandbox looks like");
    assert.deepEqual(listing(linked), before, "teardown changed the dispatch tree");
  });
});

test("listing skips the directories the residue proof must not walk, and sees the rest", () => {
  withRepo((main, linked) => {
    mkdirSync(join(linked, "node_modules"), { recursive: true });
    writeFileSync(join(linked, "node_modules", "dep.js"), "x\n");
    mkdirSync(join(linked, "sub"), { recursive: true });
    writeFileSync(join(linked, "sub", "kept.txt"), "x\n");
    const found = listing(linked);
    assert.ok(found.includes(join("sub", "kept.txt")), "listing missed a real file, so the residue proof would miss real residue");
    assert.ok(found.includes("f.txt"), "listing missed a tracked file at the root");
    assert.equal(found.some((f) => f.startsWith("node_modules")), false, "listing walked node_modules, which makes the residue diff enormous and useless");
    assert.equal(found.some((f) => f.startsWith(".git")), false, "listing walked .git, whose churn is not residue");
  });
});

test("createPlan fetches only when the commit is absent, and links node_modules three levels up", () => {
  const local = createPlan("/r/.claude/worktrees/guard-1", "abc", true);
  const remote = createPlan("/r/.claude/worktrees/guard-1", "abc", false);
  assert.deepEqual(local.git.filter((c) => c[0] === "fetch"), [], "a fetch was issued for a commit already present, which reaches the network on every guard run");
  assert.deepEqual(remote.git.filter((c) => c[0] === "fetch"), [["fetch", "origin"]], "no fetch was issued for a commit that is not local yet, so worktree add fails on a sha the skeptic just resolved");
  assert.ok(
    local.git.some((c) => c[0] === "worktree" && c[1] === "add" && c.includes("--detach") && c.includes("abc")),
    "the plan does not build a detached worktree at the requested sha",
  );
  assert.deepEqual(remote.git.map((c) => c[0]), ["fetch", "worktree"], "the fetch must come BEFORE the worktree add, or add runs against a sha that is not local yet");
  assert.equal(local.link, join("..", "..", "..", "node_modules"), "the node_modules link is missing or not the three-levels-up relative form that a sandbox at root/.claude/worktrees/<name> needs");
});

test("teardownPlan removes its own worktree and never prunes", () => {
  const plan = teardownPlan("/r/.claude/worktrees/guard-1");
  assert.ok(
    plan.git.some((c) => c[0] === "worktree" && c[1] === "remove" && c.includes("--force")),
    "teardown does not remove the worktree, so every round leaks a sandbox and its registration",
  );
  assert.equal(
    plan.git.some((c) => c.includes("prune")),
    false,
    "teardown prunes: with no --expire that deregisters every worktree whose directory is momentarily absent, another session's included, and restoring the directory does not bring it back (#575)",
  );
});

test("resolveTree is the tree you are standing in, not the main checkout", () => {
  withRepo((main, linked) => {
    assert.equal(resolveTree(linked), linked, "resolveTree returned the main checkout, so a residue snapshot taken from a worktree would list the wrong tree");
    assert.equal(resolveRoot(linked), main, "resolveRoot and resolveTree must differ from inside a linked worktree, or one of them is wrong");
  });
});

test("listing returns its rows in a stable sorted order", () => {
  withRepo((main, linked) => {
    for (const n of ["c.txt", "a.txt", "b.txt"]) writeFileSync(join(linked, n), "x\n");
    assert.deepEqual(listing(linked), ["a.txt", "b.txt", "c.txt", "f.txt"], "listing is unsorted or missed a file, so a residue diff reports spurious reorderings as residue");
  });
});

const cli = (args: string[], cwd: string): { status: number; out: string; err: string } => {
  const r = spawnSync(process.execPath, [SCRIPT, ...args], { cwd, encoding: "utf8", timeout: BOUND_MS });
  return { status: r.status ?? -1, out: r.stdout ?? "", err: r.stderr ?? "" };
};

test("the CLI prints the sandbox path alone on stdout, so WT=$(...) captures a usable path", () => {
  withRepo((main, linked) => {
    const made = cli(["create", "guard-cli"], linked);
    try {
      assert.equal(made.status, 0, `create exited ${made.status}: ${made.err}`);
      const printed = made.out.trim();
      assert.equal(printed.split("\n").length, 1, `stdout carried ${made.out.split("\n").length} lines, so WT=$(...) captures something that is not a path`);
      assert.ok(existsSync(printed), `the printed path ${printed} does not exist`);
      assert.equal(printed, join(main, ".claude", "worktrees", "guard-cli"));
    } finally {
      cli(["teardown", "guard-cli"], linked);
    }
    assert.equal(existsSync(join(main, ".claude", "worktrees", "guard-cli")), false, "the CLI teardown left the sandbox behind");
  });
});

test("the CLI reports a refused name and a missing argument as a failure, not silently", () => {
  withRepo((main, linked) => {
    const bad = cli(["create", "other-session"], linked);
    assert.equal(bad.status, 1, "a refused sandbox name exited 0, so a caller would read failure as success");
    assert.match(bad.err, /namespace/, "the refusal reached stdout or was swallowed instead of being explained on stderr");
    const none = cli([], linked);
    assert.equal(none.status, 1, "no arguments exited 0");
    assert.match(none.err, /usage/, "no usage line was printed");
  });
});

test("the CLI snapshot lists the dispatch tree even when run from a subdirectory", () => {
  withRepo((main, linked) => {
    mkdirSync(join(linked, "deep", "er"), { recursive: true });
    writeFileSync(join(linked, "deep", "er", "kept.txt"), "x\n");
    const out = join(linked, "snap.txt");
    const r = cli(["snapshot", out], join(linked, "deep", "er"));
    assert.equal(r.status, 0, `snapshot exited ${r.status}: ${r.err}`);
    const rows = readFileSync(out, "utf8").trim().split("\n");
    assert.ok(rows.includes("f.txt"), "the snapshot did not reach the dispatch tree root, so it listed the subdirectory it was run from");
    assert.ok(rows.includes(join("deep", "er", "kept.txt")), "the snapshot missed a nested file");
  });
});

test("teardown leaves a worktree it does not own registered, even one whose directory is absent", () => {
  withRepo((main, linked) => {
    const bystander = join(main, "bystander");
    git(["worktree", "add", "-q", "--detach", bystander, "HEAD"], main);
    renameSync(bystander, `${bystander}-moved`);
    try {
      create("guard-teardown-decoy", undefined, linked);
      teardown("guard-teardown-decoy", linked);
      const registered = git(["worktree", "list", "--porcelain"], main)
        .split("\n")
        .filter((l) => l.startsWith("worktree "))
        .map((l) => l.slice("worktree ".length));
      assert.ok(
        registered.includes(bystander),
        `teardown deregistered a worktree it does not own. A prune with no --expire takes every worktree whose directory is momentarily absent, another session's included, and restoring the directory does not bring it back (#575). Registered after teardown: ${registered.join(", ")}`,
      );
    } finally {
      renameSync(`${bystander}-moved`, bystander);
    }
  });
});

test("create leaves a node_modules symlink that actually resolves", () => {
  withRepo((main, linked) => {
    mkdirSync(join(main, "node_modules"), { recursive: true });
    writeFileSync(join(main, "node_modules", "dep.js"), "x\n");
    const wt = create("guard-link", undefined, linked);
    try {
      assert.equal(readlinkSync(join(wt, "node_modules")), join("..", "..", "..", "node_modules"), "the symlink is missing or not the relative form");
      assert.ok(statSync(join(wt, "node_modules", "dep.js")).isFile(), "the symlink does not resolve to the root's node_modules, so every suite run in the sandbox fails on missing dependencies");
    } finally {
      teardown("guard-link", linked);
    }
    assert.ok(statSync(join(main, "node_modules", "dep.js")).isFile(), "teardown followed the symlink and removed the root's real node_modules, which is the hazard the old rm -f line existed for");
  });
});

test("listing skips the sandbox root, so a sandbox is never its own residue", () => {
  withRepo((main, linked) => {
    mkdirSync(join(linked, ".claude", "worktrees", "guard-x"), { recursive: true });
    writeFileSync(join(linked, ".claude", "worktrees", "guard-x", "f.txt"), "x\n");
    assert.equal(listing(linked).some((f) => f.startsWith(join(".claude", "worktrees"))), false, "listing walked the sandbox root, so an agent's own sandbox shows up as residue in its own proof");
  });
});

test("create refuses a bad name before it touches git at all", () => {
  assert.throws(
    () => create("other-session", undefined, "/nonexistent-path-for-this-test"),
    /namespace/,
    "the failure came from git or the filesystem rather than the name check, so create ran before validating and its own validateName call is doing nothing",
  );
});

test("the CLI refuses a skeptic sandbox with no sha and says why", () => {
  withRepo((main, linked) => {
    const r = cli(["create", "skeptic-1"], linked);
    assert.equal(r.status, 1, "a skeptic sandbox with no sha exited 0, so a whole report would be attributed to a commit never run (#575)");
    assert.match(r.err, /sha/, "the refusal did not explain that the sha is required");
  });
});

test("snapshot lists the tree it is given, not the process cwd", () => {
  withRepo((main, linked) => {
    const out = join(main, "snap-explicit.txt");
    const rows = snapshot(out, linked);
    assert.ok(rows > 0, "snapshot listed nothing");
    assert.deepEqual(readFileSync(out, "utf8").trim().split("\n"), listing(linked), "snapshot wrote a listing of some other tree than the cwd it was handed");
  });
});

const withRemote = (body: (clone: string, sha: string) => void): void => {
  const made = mkdtempSync(join(tmpdir(), "agent-sandbox-remote-"));
  const dir = realpathSync(made);
  try {
    const origin = join(dir, "origin");
    mkdirSync(origin);
    git(["init", "-q", "-b", "main", "."], origin);
    git(["config", "user.email", "t@t"], origin);
    git(["config", "user.name", "t"], origin);
    writeFileSync(join(origin, "f.txt"), "one\n");
    git(["add", "-A"], origin);
    git(["commit", "-qm", "c1"], origin);
    const clone = join(dir, "clone");
    git(["clone", "-q", origin, clone], dir);
    writeFileSync(join(origin, "f.txt"), "two\n");
    git(["add", "-A"], origin);
    git(["commit", "-qm", "c2"], origin);
    body(clone, git(["rev-parse", "HEAD"], origin));
  } finally {
    rmSync(made, { recursive: true, force: true });
  }
};

const hasCommit = (cwd: string, sha: string): boolean => {
  try {
    git(["cat-file", "-e", `${sha}^{commit}`], cwd);
    return true;
  } catch {
    return false;
  }
};

test("create fetches a commit that is not local yet, then builds the sandbox at it", () => {
  withRemote((clone, sha) => {
    assert.equal(hasCommit(clone, sha), false, "the fixture already has the commit, so this asserts nothing about fetching");
    const wt = create("skeptic-fetch", sha, clone);
    try {
      assert.equal(git(["rev-parse", "HEAD"], wt), sha, "the sandbox was not built at the requested commit, so a runner that drops the fetch would leave the skeptic reviewing whatever it could reach");
    } finally {
      teardown("skeptic-fetch", clone);
    }
  });
});

test("sandboxes lists an orphaned sandbox directory that neither snapshot nor worktree list can see", () => {
  withRepo((main, linked) => {
    mkdirSync(join(main, ".claude", "worktrees", "guard-orphan"), { recursive: true });
    assert.doesNotMatch(git(["worktree", "list"], main), /guard-orphan/, "the fixture orphan is registered, so this asserts nothing about the gap");
    assert.ok(sandboxes(linked).includes("guard-orphan"), "an unregistered sandbox directory is invisible to the residue proof, so a bare prune's aftermath would pass as clean");
    const wt = create("guard-listed", undefined, linked);
    try {
      assert.ok(sandboxes(linked).includes("guard-listed"));
    } finally {
      teardown("guard-listed", linked);
    }
    assert.equal(sandboxes(linked).includes("guard-listed"), false, "a torn-down sandbox is still listed");
  });
});

test("listing skips only the sandbox root, not any directory that happens to be named worktrees", () => {
  withRepo((main, linked) => {
    mkdirSync(join(linked, "src", "worktrees"), { recursive: true });
    writeFileSync(join(linked, "src", "worktrees", "real.ts"), "x\n");
    assert.ok(listing(linked).includes(join("src", "worktrees", "real.ts")), "a source directory named worktrees was skipped, so residue there would be invisible");
  });
});

test("sandboxes throws outside a repository instead of reporting an empty, clean-looking list", () => {
  const made = mkdtempSync(join(tmpdir(), "agent-sandbox-notgit-"));
  try {
    assert.throws(() => sandboxes(made), "sandboxes returned a list from a directory that is not a repository, so a broken run would pass the residue proof as clean");
  } finally {
    rmSync(made, { recursive: true, force: true });
  }
});

test("sandboxes reports an empty list when the sandbox root simply does not exist yet", () => {
  withRepo((main, linked) => {
    rmSync(join(main, ".claude"), { recursive: true, force: true });
    assert.deepEqual(sandboxes(linked), []);
  });
});

test("the CLI does not print a fatal line on the success path when the sha must be fetched first", () => {
  withRemote((clone, sha) => {
    const r = cli(["create", "skeptic-quiet", sha], clone);
    try {
      assert.equal(r.status, 0, `create exited ${r.status}: ${r.err}`);
      assert.doesNotMatch(r.err, /fatal/, "git's fatal: from the missing-commit probe reached stderr on a run that then succeeded, which trains an agent to read fatal lines as noise");
    } finally {
      cli(["teardown", "skeptic-quiet"], clone);
    }
  });
});
