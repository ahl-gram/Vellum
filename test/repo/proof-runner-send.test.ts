import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { E2E_SUITE_ORDER, NEEDS_PREDECESSOR, OPENS_ON_HOME } from "../../e2e/support/suites.ts";
import type { List } from "../../scripts/proof-runner/list.ts";
import {
  appliesAt,
  applyEdits,
  buildList,
  diffFor,
  orderProblems,
  readAt,
  sendList,
  type Gh,
  type Mutation,
} from "../../scripts/proof-runner/send.ts";
import { git } from "../../test-support/sandbox-repo.ts";
import { withTempRepo } from "../../test-support/proof-runner-repo.ts";

const FILES = {
  "src/a.css": "a {\n  color: red;\n  border: 1px solid;\n}\n",
  "src/b.ts": "export const b = 1;\nexport const c = 1;\n",
};
const RULES = { order: E2E_SUITE_ORDER, predecessor: NEEDS_PREDECESSOR, opensOnHome: OPENS_ON_HOME };
const reader = (files: Readonly<Record<string, string>>) => (file: string) => {
  const text = files[file];
  if (text === undefined) throw new Error(`${file} is not in the fixture`);
  return text;
};

test("each edit form compiles to a patch that applies at the commit and leaves the intended text", async () => {
  await withTempRepo(FILES, (dir, sha) => {
    const after = applyEdits(reader(FILES), [
      { file: "src/a.css", find: "  border: 1px solid;\n", replace: "" },
      { file: "src/b.ts", line: 2, from: "c = 1", to: "c = 2" },
      { file: "src/b.ts", append: "export const d = 1;\n" },
    ]);
    assert.equal(after.get("src/a.css"), "a {\n  color: red;\n}\n");
    assert.equal(after.get("src/b.ts"), "export const b = 1;\nexport const c = 2;\nexport const d = 1;\n");
    const patch = diffFor(new Map(Object.entries(FILES)), after);
    assert.match(patch, /^diff --git a\/src\/a\.css b\/src\/a\.css$/m);
    assert.equal(appliesAt(dir, sha, patch), null);
    const file = join(dir, "..", `${basename(dir)}.patch`);
    writeFileSync(file, patch);
    try {
      git(["apply", file], dir);
    } finally {
      rmSync(file, { force: true });
    }
    for (const [path, text] of after) assert.equal(readFileSync(join(dir, path), "utf8"), text);
  });
});

test("a find that is not there once, a line out of range and an anchor missing from its line are each refused", () => {
  const read = reader(FILES);
  assert.throws(() => applyEdits(read, [{ file: "src/b.ts", find: "= 1", replace: "= 2" }]), /found 2 times/);
  assert.throws(() => applyEdits(read, [{ file: "src/b.ts", find: "= 9", replace: "= 2" }]), /found 0 times/);
  assert.throws(() => applyEdits(read, [{ file: "src/b.ts", line: 9, from: "x", to: "y" }]), /line 9/);
  assert.throws(() => applyEdits(read, [{ file: "src/b.ts", line: 1, from: "c = 1", to: "c = 2" }]), /src\/b\.ts:1/);
});

test("a stale patch is named with git's own message, and the check leaves the repo's index, head and tree as they were", async () => {
  await withTempRepo(FILES, (dir, sha) => {
    const index = readFileSync(join(dir, ".git", "index"));
    const stale = diffFor(
      new Map([["src/b.ts", "export const b = 9;\n"]]),
      new Map([["src/b.ts", "export const b = 2;\n"]]),
    );
    assert.match(appliesAt(dir, sha, stale) ?? "", /patch does not apply/);
    assert.deepEqual(readFileSync(join(dir, ".git", "index")), index, "the check wrote the repo's own index");
    assert.equal(git(["status", "--porcelain"], dir), "");
    assert.equal(git(["rev-parse", "HEAD"], dir), sha);
  });
});

test("every bad mutation in a list is named at once, and nothing is built from a list with one", async () => {
  await withTempRepo(FILES, (dir, sha) => {
    const bad: Mutation[] = [
      {
        id: "zero",
        edits: [{ file: "src/b.ts", find: "= 9", replace: "= 2" }],
        unit: { files: ["t.test.ts"], expect: ["t"] },
      },
      {
        id: "twice",
        edits: [{ file: "src/b.ts", find: "= 1", replace: "= 2" }],
        unit: { files: ["t.test.ts"], expect: ["t"] },
      },
    ];
    const built = buildList(bad, sha, { repo: dir, read: reader(FILES), rules: RULES });
    assert.equal(built.list, null);
    assert.equal(built.errors.length, 2);
    assert.match(built.errors.join("\n"), /zero[\s\S]*twice/);
  });
});

test("a file read at the commit keeps its last newline, so an appended edit compiles to a patch that applies there", async () => {
  await withTempRepo(FILES, (dir, sha) => {
    const read = readAt(dir, sha);
    assert.equal(read("src/b.ts"), FILES["src/b.ts"]);
    assert.throws(() => read("src/missing.ts"), /src\/missing\.ts/);
    const appended: Mutation = {
      id: "tail",
      edits: [{ file: "src/b.ts", append: "// x\n" }],
      lint: { files: ["src/b.ts"], expect: ["r"] },
    };
    assert.deepEqual(buildList([appended], sha, { repo: dir, read, rules: RULES }).errors, []);
  });
});

test("a selection without its predecessor, or with a suite that opens on home straight after home, is refused; one that keeps the rules passes", () => {
  assert.match(orderProblems("print-room", RULES).join(), /print-room needs hunt/);
  assert.match(orderProblems("home,landfall", RULES).join(), /landfall .* straight after home/);
  assert.match(orderProblems("specimn", RULES).join(), /no suite named specimn/);
  assert.deepEqual(orderProblems("hunt,print-room", RULES), []);
  assert.deepEqual(orderProblems("landfall", RULES), []);
});

test("the throwaway branch is the runner's tree plus the list alone, a commit whose one parent is the runner, dispatched under proof/", () => {
  const list: List = {
    version: 1,
    sha: "c".repeat(40),
    entries: [{ id: "one", unit: { files: ["t.test.ts"], expect: [] } }],
  };
  const asked: string[] = [];
  const posts: [string, Record<string, unknown>][] = [];
  const dispatched: string[] = [];
  const gh: Gh = {
    commitSha: (ref) => (asked.push(ref), ref === "main" ? "RUNNER" : ref),
    treeOf: (sha) => (sha === "RUNNER" ? "RUNNER-TREE" : "WRONG-TREE"),
    post: (endpoint, body) => (posts.push([endpoint, body as Record<string, unknown>]), `${endpoint}-sha`),
    dispatch: (branch) => (dispatched.push(branch), "https://github.com/x/y/actions/runs/7"),
  };
  const sent = sendList(gh, list, "main", "838-a");
  assert.deepEqual(asked, [list.sha, "main"], "the commit under test was not looked up on the remote before sending");
  assert.deepEqual(
    posts.map(([e]) => e),
    ["git/blobs", "git/trees", "git/commits", "git/refs"],
  );
  assert.deepEqual(JSON.parse(String(posts[0]![1]["content"])), list);
  assert.deepEqual(posts[1]![1], {
    base_tree: "RUNNER-TREE",
    tree: [{ path: "proof.json", mode: "100644", type: "blob", sha: "git/blobs-sha" }],
  });
  assert.deepEqual(
    posts[2]![1]["parents"],
    ["RUNNER"],
    "the list's commit sits on the code under test, so the run would take its workflow from there",
  );
  assert.deepEqual(posts[3]![1], { ref: "refs/heads/proof/838-a", sha: "git/commits-sha" });
  assert.deepEqual(dispatched, ["proof/838-a"]);
  assert.deepEqual(sent, { branch: "proof/838-a", runner: "RUNNER", printed: "https://github.com/x/y/actions/runs/7" });
});

test("an edit's replacement is taken literally, never as a replacement pattern", () => {
  const read = reader({ "src/c.ts": "const a = 1;\nconst b = 2;\n" });
  const after = applyEdits(read, [
    { file: "src/c.ts", find: "a = 1", replace: "a = '$&$'" },
    { file: "src/c.ts", line: 2, from: "b = 2", to: "b = '$`$&'" },
  ]);
  assert.equal(after.get("src/c.ts"), "const a = '$&$';\nconst b = '$`$&';\n");
});
