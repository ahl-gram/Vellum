import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
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
import { slotOf } from "../../scripts/handoff/slot.ts";
import { folderOf, readState, treeOf, writeState, type HandoffState } from "../../scripts/handoff/state.ts";
import { git } from "../../test-support/sandbox-repo.ts";

const STUB = `#!/bin/sh
IDENT="-c user.name=t -c user.email=t@t -c commit.gpgsign=false"
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
if [ "$(pwd -P)" = "$STUB_SLOT" ]; then
  case " $* " in
    *" resume "*) git $IDENT commit -q --allow-empty -m stub-fix ;;
    *) git switch -q -c feat/9-stub && git $IDENT commit -q --allow-empty -m stub ;;
  esac
fi
echo "built" > "$last"
echo "OUTCOME: ready" >> "$last"
`;

const dir = realpathSync(mkdtempSync(join(tmpdir(), "handoff-run-")));
const mainRepo = join(dir, "main");
const slot = slotOf(mainRepo);
const tree = treeOf(mainRepo, 9);
const bin = join(dir, "bin");
const plan = join(dir, "plan.md");
const brief = join(dir, "brief.md");
const facts = join(dir, "facts.txt");
const folder = folderOf(mainRepo, 9);
const env = {
  ...process.env,
  PATH: `${bin}:${process.env.PATH ?? ""}`,
  STUB_FACTS: facts,
  STUB_SLOT: slot,
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
  mkdirSync(join(mainRepo, "node_modules"), { recursive: true });
  writeFileSync(join(mainRepo, "node_modules", "marker"), "m\n");
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

test("a build makes its clone from origin/main, runs codex there headless, collects its branch into the review tree, and records the thread and the exit (Issue #1418)", async () => {
  assert.equal(await main(["build", "9", "--plan", plan, "--session", "https://s"], mainRepo, env, gh), 0);
  assert.equal(git(["rev-parse", "HEAD~1"], slot), git(["rev-parse", "origin/main"], mainRepo));
  assert.equal(readlinkSync(join(slot, "node_modules")), "../../../node_modules");
  assert.equal(readlinkSync(join(tree, "node_modules")), "../../../node_modules");
  assert.equal(git(["rev-parse", "HEAD"], tree), git(["rev-parse", "HEAD"], slot));
  const seen = factsOf();
  assert.equal(seen.get("marker"), "9");
  assert.equal(seen.get("cwd"), slot);
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
    seen.get("argv")?.startsWith(`-s danger-full-access -a on-request exec --json -C ${slot} -m `),
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
  assert.equal(seen.get("cwd"), slot);
  assert.equal(git(["rev-parse", "HEAD"], tree), git(["rev-parse", "HEAD"], slot));
  assert.equal(git(["rev-list", "--count", "origin/main..HEAD"], tree), "2");
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
    ...[{ n: 7 }, { kind: "x" }, { exit: "1" }, { ended: "yesterday" }, { pid: 1 }, { pid: 0 }].map((run) => ({
      ...state,
      runs: state.runs.map((r, at) => (at === 1 ? { ...r, ...run } : r)),
    })),
  ];
  for (const bad of planted) {
    writeState(folder, bad as HandoffState);
    assert.equal(await main(["resume", "9", "--brief", brief], mainRepo, env, gh), 2);
    assert.equal(readState(folder)?.runs.length, 2);
  }
  writeState(folder, state);
});

test("a run whose recorded process is alive reads as running, and resume refuses it (Issue #1409)", async () => {
  const state = readState(folder);
  assert.ok(state);
  const child = spawn("sleep", ["30"], { stdio: "ignore" });
  const messages: string[] = [];
  const saved = console.error;
  console.error = (line: string): void => void messages.push(line);
  try {
    assert.ok(child.pid !== undefined && child.pid > 1);
    const live = {
      ...state,
      runs: state.runs.map((run, at) => (at === 1 ? { ...run, pid: child.pid ?? 0, ended: null } : run)),
    };
    writeState(folder, live);
    assert.equal(snapshotOf(9, mainRepo, gh).running, true);
    assert.equal(nextStep(snapshotOf(9, mainRepo, gh)).id, "running");
    assert.equal(await main(["resume", "9", "--brief", brief], mainRepo, env, gh), 2);
    assert.ok(
      messages.some((line) => line.includes("still running")),
      messages.join("\n"),
    );
    assert.equal(readState(folder)?.runs.length, 2);
  } finally {
    console.error = saved;
    child.kill();
    writeState(folder, state);
  }
  assert.equal(snapshotOf(9, mainRepo, gh).running, false);
});

test("a build of another issue is refused while this issue's record holds the clone (Issue #1418)", async () => {
  const before = readFileSync(facts, "utf8");
  assert.equal(await main(["build", "10", "--plan", plan, "--session", "https://s"], mainRepo, env, gh), 2);
  assert.equal(readFileSync(facts, "utf8"), before);
  assert.equal(readState(folderOf(mainRepo, 10)), null);
});

test("a resume is refused while another issue's record holds the clone (Issue #1418)", async () => {
  const before = readFileSync(facts, "utf8");
  const other = folderOf(mainRepo, 10);
  mkdirSync(other, { recursive: true });
  writeFileSync(join(other, "state.json"), "{}\n");
  try {
    assert.equal(await main(["resume", "9", "--brief", brief], mainRepo, env, gh), 2);
  } finally {
    rmSync(other, { recursive: true, force: true });
  }
  assert.equal(readFileSync(facts, "utf8"), before);
  assert.equal(readState(folder)?.runs.length, 2);
});

test("a build whose clone cannot be made leaves no record that would hold the clone (Issue #1418)", async () => {
  const bare = join(dir, "no-origin");
  mkdirSync(bare, { recursive: true });
  git(["init", "-q", "-b", "main", "."], bare);
  const messages: string[] = [];
  const saved = console.error;
  console.error = (line: string): void => void messages.push(line);
  try {
    assert.equal(await main(["build", "12", "--plan", plan, "--session", "https://s"], bare, env, gh), 1);
  } finally {
    console.error = saved;
  }
  assert.equal(readState(folderOf(bare, 12)), null);
  assert.equal(existsSync(folderOf(bare, 12)), false);
  assert.ok(messages.length > 0);
});

test("a build refuses a plan path that next would later refuse, and builds nothing (Issue #1409)", async () => {
  const odd = join(dir, "a plan with spaces.md");
  writeFileSync(odd, "a plan\n");
  assert.equal(await main(["build", "10", "--plan", odd, "--session", "https://s"], mainRepo, env, gh), 2);
  assert.equal(readState(folderOf(mainRepo, 10)), null);
});

test("a second build of the same issue is refused while its record stands (Issue #1409)", async () => {
  assert.equal(await main(["build", "9", "--plan", plan, "--session", "https://s"], mainRepo, env, gh), 2);
  assert.equal(readState(folder)?.runs.length, 2);
});
