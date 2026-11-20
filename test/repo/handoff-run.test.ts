import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readlinkSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { main } from "../../scripts/handoff/main.ts";
import { nextStep } from "../../scripts/handoff/next.ts";
import { snapshotOf, type GhReads } from "../../scripts/handoff/snapshot.ts";
import { folderOf, readState, writeState } from "../../scripts/handoff/state.ts";
import { git } from "../../test-support/sandbox-repo.ts";

const STUB = `#!/bin/sh
last=""
prev=""
for a in "$@"; do
  if [ "$prev" = "-o" ]; then last="$a"; fi
  prev="$a"
done
echo "marker=$VELLUM_HEADLESS_BUILD" > "$STUB_FACTS"
echo "cwd=$(pwd -P)" >> "$STUB_FACTS"
if [ -c /dev/stdin ]; then echo "stdin=null" >> "$STUB_FACTS"; else echo "stdin=open" >> "$STUB_FACTS"; fi
echo "token=$GH_TOKEN" >> "$STUB_FACTS"
echo "sock=$SSH_AUTH_SOCK" >> "$STUB_FACTS"
echo "count=$GIT_CONFIG_COUNT" >> "$STUB_FACTS"
echo "helper=[$GIT_CONFIG_VALUE_0]" >> "$STUB_FACTS"
echo "ghdir=$GH_CONFIG_DIR" >> "$STUB_FACTS"
echo "argv=$*" >> "$STUB_FACTS"
echo '{"type":"thread.started","thread_id":"stub-thread"}'
if [ "$(pwd -P)" = "$STUB_TREE" ]; then
  case " $* " in
    *" resume "*) git commit -q --allow-empty -m stub-fix ;;
    *) git switch -q -c feat/9-stub && git commit -q --allow-empty -m stub ;;
  esac
fi
echo "built" > "$last"
echo "OUTCOME: ready" >> "$last"
`;

const dir = realpathSync(mkdtempSync(join(tmpdir(), "handoff-run-")));
const mainRepo = join(dir, "main");
const tree = join(mainRepo, ".claude", "worktrees", "codex-9");
const bin = join(dir, "bin");
const plan = join(dir, "plan.md");
const brief = join(dir, "brief.md");
const facts = join(dir, "facts.txt");
const folder = folderOf(mainRepo, 9);
const env = {
  ...process.env,
  PATH: `${bin}:${process.env.PATH ?? ""}`,
  STUB_FACTS: facts,
  STUB_TREE: tree,
  GH_TOKEN: "fake-token",
  SSH_AUTH_SOCK: "/tmp/fake-sock",
};
let issueReads = 0;
const gh: GhReads = {
  labels: () => ["builder:codex"],
  pullRequest: () => null,
  issueJson: () => {
    issueReads += 1;
    return '{"number":9}\n';
  },
  commentsJsonl: () => '{"id":1}\n',
};

before(() => {
  mkdirSync(bin, { recursive: true });
  mkdirSync(mainRepo, { recursive: true });
  git(["init", "--bare", "-q", "-b", "main", join(dir, "origin.git")], dir);
  git(["init", "-q", "-b", "main", "."], mainRepo);
  git(["config", "user.email", "t@t"], mainRepo);
  git(["config", "user.name", "t"], mainRepo);
  git(["config", "commit.gpgsign", "false"], mainRepo);
  git(["commit", "-q", "--allow-empty", "-m", "base"], mainRepo);
  git(["remote", "add", "origin", join(dir, "origin.git")], mainRepo);
  git(["push", "-q", "origin", "main"], mainRepo);
  writeFileSync(join(bin, "codex"), STUB, { mode: 0o755 });
  writeFileSync(plan, "a plan\n");
  writeFileSync(brief, "a brief\n");
});

after(() => rmSync(dir, { recursive: true, force: true }));

const factsOf = (): Map<string, string> => {
  const found = new Map<string, string>();
  for (const line of readFileSync(facts, "utf8").split("\n")) {
    const at = line.indexOf("=");
    if (at > 0 && !found.has(line.slice(0, at))) found.set(line.slice(0, at), line.slice(at + 1));
  }
  return found;
};

test("a build makes its tree from origin/main, runs codex there headless, and records the thread and the exit (Issue #1409)", async () => {
  assert.equal(await main(["build", "9", "--plan", plan, "--session", "https://s"], mainRepo, env, gh), 0);
  assert.equal(git(["rev-parse", "HEAD~1"], tree), git(["rev-parse", "origin/main"], mainRepo));
  assert.equal(readlinkSync(join(tree, "node_modules")), "../../../node_modules");
  const seen = factsOf();
  assert.equal(seen.get("marker"), "9");
  assert.equal(seen.get("cwd"), tree);
  assert.equal(seen.get("stdin"), "null");
  assert.equal(seen.get("token"), "");
  assert.equal(seen.get("sock"), "");
  assert.equal(seen.get("count"), "1");
  assert.equal(seen.get("helper"), "[]");
  assert.equal(seen.get("ghdir"), join(folder, "gh-empty"));
  assert.ok(existsSync(join(folder, "gh-empty")));
  assert.equal(readFileSync(join(folder, "issue.json"), "utf8"), '{"number":9}\n');
  assert.equal(readFileSync(join(folder, "comments.jsonl"), "utf8"), '{"id":1}\n');
  assert.equal(issueReads, 1);
  assert.ok(
    seen.get("argv")?.startsWith(`-s danger-full-access -a on-request exec --json -C ${tree} -m `),
    seen.get("argv"),
  );
  const state = readState(folder);
  assert.equal(state?.thread, "stub-thread");
  assert.deepEqual(
    state.runs.map(({ n, kind, exit }) => [n, kind, exit]),
    [[1, "build", 0]],
  );
  assert.ok(state.runs.every((run) => run.ended !== null));
});

test("next reads that build as ready and unpushed, and then as pushed with no prover report (Issue #1409)", () => {
  assert.equal(nextStep(snapshotOf(9, mainRepo, gh)).id, "push");
  git(["push", "-q", "-u", "origin", "feat/9-stub"], tree);
  assert.equal(nextStep(snapshotOf(9, mainRepo, gh)).id, "prove");
});

test("a resume restates the sandbox, names the thread and records a second run (Issue #1409)", async () => {
  assert.equal(await main(["resume", "9", "--brief", brief], mainRepo, env, gh), 0);
  const seen = factsOf();
  assert.equal(seen.get("marker"), "9");
  assert.equal(seen.get("stdin"), "null");
  assert.equal(seen.get("token"), "");
  assert.equal(seen.get("count"), "1");
  assert.equal(issueReads, 2);
  assert.ok(
    seen.get("argv")?.startsWith("-s danger-full-access -a on-request exec resume --json -m "),
    seen.get("argv"),
  );
  assert.ok(seen.get("argv")?.includes(" stub-thread "), seen.get("argv"));
  const state = readState(folder);
  assert.deepEqual(
    state?.runs.map(({ n, kind, exit }) => [n, kind, exit]),
    [
      [1, "build", 0],
      [2, "resume", 0],
    ],
  );
});

test("a resume refuses a record whose tree, thread, effort or model was planted, and runs nothing (Issue #1409)", async () => {
  const state = readState(folder);
  assert.ok(state);
  const planted = [
    { ...state, tree: dir },
    { ...state, thread: "-x --dangerously-bypass-approvals-and-sandbox" },
    { ...state, effort: "silly" as never },
    { ...state, model: "planted-model" },
  ];
  for (const bad of planted) {
    writeState(folder, bad);
    assert.equal(await main(["resume", "9", "--brief", brief], mainRepo, env, gh), 2);
    assert.equal(readState(folder)?.runs.length, 2);
  }
  writeState(folder, state);
});

test("a second build of the same issue is refused while its record stands (Issue #1409)", async () => {
  assert.equal(await main(["build", "9", "--plan", plan, "--session", "https://s"], mainRepo, env, gh), 2);
  assert.equal(readState(folder)?.runs.length, 2);
});
