import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { create, listing, sandboxes, snapshot, teardown } from "../../scripts/agent-sandbox.ts";
import { git, withRepo } from "../../test-support/sandbox-repo.ts";

test("listing skips the directories the residue proof must not walk, and sees the rest", () => {
  withRepo((main, linked) => {
    mkdirSync(join(linked, "node_modules"), { recursive: true });
    writeFileSync(join(linked, "node_modules", "dep.js"), "x\n");
    mkdirSync(join(linked, "sub"), { recursive: true });
    writeFileSync(join(linked, "sub", "kept.txt"), "x\n");
    const found = listing(linked);
    assert.ok(
      found.includes(join("sub", "kept.txt")),
      "listing missed a real file, so the residue proof would miss real residue",
    );
    assert.ok(found.includes("f.txt"), "listing missed a tracked file at the root");
    assert.equal(
      found.some((f) => f.startsWith("node_modules")),
      false,
      "listing walked node_modules, which makes the residue diff enormous and useless",
    );
    assert.equal(
      found.some((f) => f.startsWith(".git")),
      false,
      "listing walked .git, whose churn is not residue",
    );
  });
});

test("listing returns its rows in a stable sorted order", () => {
  withRepo((main, linked) => {
    for (const n of ["c.txt", "a.txt", "b.txt"]) writeFileSync(join(linked, n), "x\n");
    assert.deepEqual(
      listing(linked),
      ["a.txt", "b.txt", "c.txt", "f.txt"],
      "listing is unsorted or missed a file, so a residue diff reports spurious reorderings as residue",
    );
  });
});

test("listing skips the sandbox root, so a sandbox is never its own residue", () => {
  withRepo((main, linked) => {
    mkdirSync(join(linked, ".claude", "worktrees", "guard-x"), { recursive: true });
    writeFileSync(join(linked, ".claude", "worktrees", "guard-x", "f.txt"), "x\n");
    assert.equal(
      listing(linked).some((f) => f.startsWith(join(".claude", "worktrees"))),
      false,
      "listing walked the sandbox root, so an agent's own sandbox shows up as residue in its own proof",
    );
  });
});

test("snapshot lists the tree it is given, not the process cwd", () => {
  withRepo((main, linked) => {
    const out = join(main, "snap-explicit.txt");
    const rows = snapshot(out, linked);
    assert.ok(rows > 0, "snapshot listed nothing");
    assert.deepEqual(
      readFileSync(out, "utf8").trim().split("\n"),
      listing(linked),
      "snapshot wrote a listing of some other tree than the cwd it was handed",
    );
  });
});

test("sandboxes lists an orphaned sandbox directory that neither snapshot nor worktree list can see", () => {
  withRepo((main, linked) => {
    mkdirSync(join(main, ".claude", "worktrees", "guard-orphan"), { recursive: true });
    assert.doesNotMatch(
      git(["worktree", "list"], main),
      /guard-orphan/,
      "the fixture orphan is registered, so this asserts nothing about the gap",
    );
    assert.ok(
      sandboxes(linked).includes("guard-orphan"),
      "an unregistered sandbox directory is invisible to the residue proof, so a bare prune's aftermath would pass as clean",
    );
    create("guard-listed", undefined, linked);
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
    assert.ok(
      listing(linked).includes(join("src", "worktrees", "real.ts")),
      "a source directory named worktrees was skipped, so residue there would be invisible",
    );
  });
});

test("sandboxes throws outside a repository instead of reporting an empty, clean-looking list", () => {
  const made = mkdtempSync(join(tmpdir(), "agent-sandbox-notgit-"));
  try {
    assert.throws(
      () => sandboxes(made),
      "sandboxes returned a list from a directory that is not a repository, so a broken run would pass the residue proof as clean",
    );
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
