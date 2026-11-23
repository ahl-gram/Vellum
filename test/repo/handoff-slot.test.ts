import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import {
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readlinkSync,
  realpathSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { makeSlot, ORIGIN_URL, readSlotBranch, slotHolder, slotOf } from "../../scripts/handoff/slot.ts";
import { git } from "../../test-support/sandbox-repo.ts";

const dir = realpathSync(mkdtempSync(join(tmpdir(), "handoff-slot-")));
const main = join(dir, "main");
const bare = join(dir, "origin.git");

before(() => {
  git(["init", "--bare", "-q", "-b", "main", bare], dir);
  mkdirSync(join(main, "node_modules"), { recursive: true });
  writeFileSync(join(main, "node_modules", "marker"), "m\n");
  git(["init", "-q", "-b", "main", "."], main);
  git(["config", "user.email", "t@t"], main);
  git(["config", "user.name", "t"], main);
  git(["config", "commit.gpgsign", "false"], main);
  writeFileSync(join(main, "f.txt"), "one\n");
  git(["add", "f.txt"], main);
  git(["commit", "-q", "-m", "base"], main);
  git(["remote", "add", "origin", bare], main);
  git(["push", "-q", "origin", "main"], main);
});

after(() => rmSync(dir, { recursive: true, force: true }));

const filesUnder = (folder: string): string[] =>
  readdirSync(folder, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name));

test("the build's clone is made from origin/main with its own git folder, node_modules linked and no object file shared (Issue #1418)", () => {
  const slot = makeSlot(main);
  assert.equal(slot, slotOf(main));
  assert.equal(git(["rev-parse", "HEAD"], slot), git(["rev-parse", "origin/main"], main));
  assert.ok(lstatSync(join(slot, ".git")).isDirectory());
  assert.equal(readlinkSync(join(slot, "node_modules")), "../../../node_modules");
  assert.equal(git(["config", "--get", "remote.origin.url"], slot), ORIGIN_URL);
  assert.equal(git(["config", "--get", "remote.origin.url"], main), bare);
  const remoteKeys = git(["config", "--name-only", "--get-regexp", "^remote\\."], main).split("\n");
  assert.deepEqual(
    remoteKeys.filter((key) => !key.startsWith("remote.origin.")),
    [],
  );
  const theirs = new Set(filesUnder(join(main, ".git", "objects")).map((file) => statSync(file).ino));
  const ours = filesUnder(join(slot, ".git", "objects"));
  assert.ok(theirs.size > 0 && ours.length > 0, "no object files to compare");
  assert.deepEqual(
    ours.filter((file) => theirs.has(statSync(file).ino)),
    [],
  );
});

const TEXT = "ref: refs/heads/chore/9-x\n";
const PREFIX = "ref: refs/heads/chore/9-";
const clone = (name: string): string => {
  const folder = join(dir, name);
  mkdirSync(join(folder, ".git"), { recursive: true });
  return folder;
};
const head = (folder: string, text: string): void => writeFileSync(join(folder, ".git", "HEAD"), text);

test("the build's branch is read from a regular HEAD file in a .git folder only, and only a branch named for the issue (Issue #1418)", () => {
  const plain = clone("plain");
  head(plain, TEXT);
  assert.equal(readSlotBranch(plain, 9), "chore/9-x");
  assert.equal(readSlotBranch(plain, 10), null);

  const linked = clone("linked");
  writeFileSync(join(dir, "elsewhere"), TEXT);
  symlinkSync(join(dir, "elsewhere"), join(linked, ".git", "HEAD"));
  assert.equal(readSlotBranch(linked, 9), null);

  const gitfile = join(dir, "gitfile");
  mkdirSync(join(dir, "gitfile-target"), { recursive: true });
  writeFileSync(join(dir, "gitfile-target", "HEAD"), TEXT);
  mkdirSync(gitfile, { recursive: true });
  writeFileSync(join(gitfile, ".git"), `gitdir: ${join(dir, "gitfile-target")}\n`);
  assert.equal(readSlotBranch(gitfile, 9), null);

  const linkedGit = join(dir, "linked-git");
  mkdirSync(join(dir, "linked-git-target"), { recursive: true });
  writeFileSync(join(dir, "linked-git-target", "HEAD"), TEXT);
  mkdirSync(linkedGit, { recursive: true });
  symlinkSync(join(dir, "linked-git-target"), join(linkedGit, ".git"));
  assert.equal(readSlotBranch(linkedGit, 9), null);

  const fitting = clone("fitting");
  head(fitting, PREFIX + "x".repeat(4096 - PREFIX.length));
  assert.equal(readSlotBranch(fitting, 9), "chore/9-" + "x".repeat(4096 - PREFIX.length));
  const oversize = clone("oversize");
  head(oversize, PREFIX + "x".repeat(4097 - PREFIX.length));
  assert.equal(readSlotBranch(oversize, 9), null);

  const trunk = clone("trunk");
  head(trunk, "ref: refs/heads/main\n");
  assert.equal(readSlotBranch(trunk, 9), null);
  const detached = clone("detached");
  head(detached, "0123456789abcdef0123456789abcdef01234567\n");
  assert.equal(readSlotBranch(detached, 9), null);
});

test("a build waits while another issue's live record holds the clone (Issue #1418)", () => {
  const root = join(dir, "holder");
  const record = (name: string): void => {
    mkdirSync(join(root, "out", name), { recursive: true });
    writeFileSync(join(root, "out", name, "state.json"), "{}\n");
  };
  mkdirSync(join(root, "out"), { recursive: true });
  assert.equal(slotHolder(root, 9), null);
  record("7-handoff-1500");
  record("9-handoff");
  assert.equal(slotHolder(root, 9), null);
  record("7-handoff");
  assert.equal(slotHolder(root, 9), 7);
  assert.equal(slotHolder(root, 7), 9);
});
