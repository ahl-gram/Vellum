import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { create, mutate, restore, status, teardown } from "../../scripts/agent-sandbox.ts";
import { cli, git, withRepo } from "../../test-support/sandbox-repo.ts";

const NAME = "guard-mutate";
const BINARY = Buffer.from([0xff, 0x00, 0xfe, 0x0a]);

type Box = { main: string; linked: string; wt: string };

const withSandbox = (body: (box: Box) => void): void => {
  withRepo((main, linked) => {
    writeFileSync(join(linked, "a.txt"), "same 1\nsame 2\nsame 3\n");
    writeFileSync(join(linked, "b.txt"), "a + a\nab\naxb a.b\nkeep\n");
    writeFileSync(join(linked, "c.txt"), "if (bad) return;\nok\n");
    writeFileSync(join(linked, "bin.dat"), BINARY);
    mkdirSync(join(linked, "d"));
    writeFileSync(join(linked, "d", "g.txt"), "inner\n");
    symlinkSync(join("..", "..", "..", "f.txt"), join(linked, "esc"));
    git(["add", "-A"], linked);
    git(["commit", "-qm", "c3"], linked);
    mkdirSync(join(main, "node_modules"));
    writeFileSync(join(main, "node_modules", "dep.js"), "dep\n");
    mkdirSync(join(main, "outside"));
    writeFileSync(join(main, "outside", "g.txt"), "outer\n");
    const wt = create(NAME, undefined, linked);
    try {
      body({ main, linked, wt });
    } finally {
      teardown(NAME, linked);
    }
  });
};

const bytes = (file: string): Buffer => readFileSync(file);

test("mutate changes the one line it names and leaves every other line byte for byte", () => {
  withSandbox(({ linked, wt }) => {
    mutate(NAME, "a.txt", 2, "same", "diff", linked);
    assert.equal(readFileSync(join(wt, "a.txt"), "utf8"), "same 1\ndiff 2\nsame 3\n", "mutate changed some other line, none, or the named line from another line's text: three lines wearing one anchor are the PR #510 shape, where a match-based edit lands on every wearer at once");
  });
});

test("mutate refuses an anchor that is not on its line exactly once, a no-op, and an empty anchor, and writes nothing", () => {
  withSandbox(({ linked, wt }) => {
    const before = bytes(join(wt, "b.txt"));
    const refusals: Array<[number, string, string, RegExp]> = [
      [1, "a", "b", /2 times/],
      [1, "zzz", "b", /0 times/],
      [4, "keep", "keep", /changes nothing/],
      [2, "", "x", /empty/],
    ];
    for (const [line, from, to, why] of refusals) {
      assert.throws(() => mutate(NAME, "b.txt", line, from, to, linked), why, `mutate accepted ${JSON.stringify(from)} on line ${line}`);
      assert.deepEqual(bytes(join(wt, "b.txt")), before, `the refused mutation of ${JSON.stringify(from)} on line ${line} still wrote the file`);
    }
  });
});

test("mutate takes the anchor and the replacement literally", () => {
  withSandbox(({ linked, wt }) => {
    mutate(NAME, "b.txt", 3, "a.b", "A.B", linked);
    mutate(NAME, "b.txt", 4, "keep", "$&$1", linked);
    assert.equal(readFileSync(join(wt, "b.txt"), "utf8"), "a + a\nab\naxb A.B\n$&$1\n", "the anchor was read as a pattern (a.b also matches axb) or the replacement's $& and $1 were expanded");
  });
});

test("mutate and restore refuse a skeptic sandbox and any path that is not a regular tracked file inside the sandbox, and write nothing", () => {
  withSandbox(({ main, linked, wt }) => {
    const sha = git(["rev-parse", "HEAD"], linked);
    const skeptic = create("skeptic-mutate", sha, linked);
    try {
      assert.throws(() => mutate("skeptic-mutate", "a.txt", 1, "same", "diff", linked), /not a guard-\* sandbox/);
      assert.throws(() => restore("skeptic-mutate", ["a.txt"], linked), /not a guard-\* sandbox/);
      assert.throws(() => status("skeptic-mutate", linked), /not a guard-\* sandbox/);
      assert.equal(readFileSync(join(skeptic, "a.txt"), "utf8"), "same 1\nsame 2\nsame 3\n", "mutate wrote into a skeptic's sandbox, which is read-only");
    } finally {
      teardown("skeptic-mutate", linked);
    }
    writeFileSync(join(wt, "loose.txt"), "loose\n");
    const untracked: Array<[string, string, string]> = [
      ["loose.txt", "loose", join(wt, "loose.txt")],
      [join(wt, "a.txt"), "same", join(wt, "a.txt")],
      ["node_modules/dep.js", "dep", join(main, "node_modules", "dep.js")],
      ["esc", "one", join(main, "f.txt")],
    ];
    for (const [path, from, target] of untracked) {
      const before = bytes(target);
      assert.throws(() => mutate(NAME, path, 1, from, "X", linked), /not a regular file tracked at/, `mutate did not refuse ${path} on the tracked-file check`);
      assert.deepEqual(bytes(target), before, `mutate of ${path} wrote ${target}`);
    }
    renameSync(join(wt, "d"), join(wt, "d-real"));
    symlinkSync(join(main, "outside"), join(wt, "d"));
    assert.throws(() => mutate(NAME, "d/g.txt", 1, "outer", "X", linked), /outside the sandbox/);
    assert.throws(() => restore(NAME, ["d/g.txt"], linked), /outside the sandbox/);
    rmSync(join(wt, "c.txt"));
    symlinkSync(join(main, "outside", "g.txt"), join(wt, "c.txt"));
    assert.throws(() => mutate(NAME, "c.txt", 1, "outer", "X", linked), /outside the sandbox/, "a tracked regular file swapped for a symlink on disk was written through");
    assert.throws(() => restore(NAME, ["c.txt"], linked), /outside the sandbox/, "restore wrote through a tracked regular file swapped for a symlink on disk");
    assert.equal(readFileSync(join(main, "outside", "g.txt"), "utf8"), "outer\n", "a write followed a symlinked directory out of the sandbox, into a tree it does not own");
  });
});

test("restore writes back the bytes at the sandbox's own commit, not the dispatch tree's, newline and all", () => {
  withRepo((main, linked) => {
    const c1 = git(["rev-parse", "HEAD"], main);
    const wt = create("guard-restore", c1, linked);
    try {
      const before = bytes(join(wt, "f.txt"));
      assert.equal(before.toString(), "one\n", "the fixture sandbox is not at c1, so this asserts nothing about which commit restore reads");
      mutate("guard-restore", "f.txt", 1, "one", "uno", linked);
      assert.notDeepEqual(bytes(join(wt, "f.txt")), before, "mutate did not change the file, so the restore below proves nothing");
      assert.deepEqual(restore("guard-restore", ["f.txt"], linked), ["f.txt"]);
      assert.deepEqual(bytes(join(wt, "f.txt")), before, "restore did not bring back the sandbox commit's bytes: the dispatch tree's commit holds two, and a trimming read drops the newline");
    } finally {
      teardown("guard-restore", linked);
    }
  });
});

test("restore puts back every path it is handed, binary bytes included", () => {
  withSandbox(({ linked, wt }) => {
    const a = bytes(join(wt, "a.txt"));
    const b = bytes(join(wt, "b.txt"));
    mutate(NAME, "a.txt", 1, "same", "diff", linked);
    mutate(NAME, "b.txt", 4, "keep", "lose", linked);
    writeFileSync(join(wt, "bin.dat"), "text now\n");
    assert.notDeepEqual(bytes(join(wt, "a.txt")), a, "the first mutation did not land");
    assert.notDeepEqual(bytes(join(wt, "b.txt")), b, "the second mutation did not land");
    assert.deepEqual(restore(NAME, ["a.txt", "b.txt", "bin.dat"], linked), ["a.txt", "b.txt", "bin.dat"]);
    assert.deepEqual(bytes(join(wt, "a.txt")), a, "the first path was not put back");
    assert.deepEqual(bytes(join(wt, "b.txt")), b, "a later path was not put back");
    assert.deepEqual(bytes(join(wt, "bin.dat")), BINARY, "a binary file came back re-encoded as text");
  });
});

test("status lists every tracked file whose bytes differ from the commit, however it changed, and nothing once restored", () => {
  withSandbox(({ linked, wt }) => {
    assert.deepEqual(status(NAME, linked), [], "a fresh sandbox reads as changed, so status cannot tell a restored tree from a mutated one");
    mutate(NAME, "a.txt", 3, "same", "diff", linked);
    assert.deepEqual(status(NAME, linked), ["a.txt"], "status did not show the mutation that just landed");
    writeFileSync(join(wt, "c.txt"), "if (bad) return;\nok");
    rmSync(join(wt, "d", "g.txt"));
    assert.deepEqual(status(NAME, linked), ["a.txt", "c.txt", "d/g.txt"], "status missed a change mutate never made: a dropped final newline, or a deleted file");
    restore(NAME, ["a.txt", "c.txt", "d/g.txt"], linked);
    assert.deepEqual(status(NAME, linked), [], "status still reads a restored tree as changed");
  });
});

test("the CLI runs mutate, status and restore, deletes with an empty replacement, and refuses a malformed call", () => {
  withSandbox(({ linked, wt }) => {
    const changed = cli(["mutate", NAME, "c.txt", "1", "if (bad) return;", ""], linked);
    assert.equal(changed.status, 0, `mutate exited ${changed.status}: ${changed.err}`);
    assert.match(changed.out, /c\.txt:1/, "mutate did not print the line it changed");
    assert.equal(readFileSync(join(wt, "c.txt"), "utf8"), "\nok\n", "an empty replacement did not delete the anchor, which is how a guard clause is removed");
    const dirty = cli(["status", NAME], linked);
    assert.equal(dirty.status, 1, "status exited 0 with a changed file, so a caller reading the exit code sees a clean tree");
    assert.equal(dirty.out, "c.txt\n");
    const back = cli(["restore", NAME, "c.txt"], linked);
    assert.equal(back.status, 0, `restore exited ${back.status}: ${back.err}`);
    assert.equal(back.out, "c.txt\n");
    const clean = cli(["status", NAME], linked);
    assert.equal(clean.status, 0);
    assert.equal(clean.out, "");
    for (const args of [["mutate", NAME, "a.txt", "2", "same"], ["restore", NAME]]) {
      const r = cli(args, linked);
      assert.equal(r.status, 1, `${args.join(" ")} exited 0`);
      assert.match(r.err, /usage/, `${args.join(" ")} printed no usage`);
    }
    for (const line of ["0", "x", "2.5"]) {
      const r = cli(["mutate", NAME, "a.txt", line, "same", "diff"], linked);
      assert.equal(r.status, 1, `a line of ${line} exited 0`);
      assert.match(r.err, /line/, `a line of ${line} was refused without saying why`);
    }
    assert.equal(readFileSync(join(wt, "a.txt"), "utf8"), "same 1\nsame 2\nsame 3\n", "a refused call wrote the file");
  });
});
