import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { deliver, evaluate } from "../../scripts/agent-infra/hooks/engine.ts";
import type { CallerKind, HookRequest, Operation } from "../../scripts/agent-infra/hooks/request.ts";

const OWN = mkdtempSync(join(tmpdir(), "hook-engine-"));
const LAUNCH = join(OWN, "launch");
const OPERATION = join(OWN, "operation");
const ELSEWHERE = join(OWN, "elsewhere");
const STATE = join(OWN, "state");
const SAVED_TMPDIR = process.env.TMPDIR;

before(() => {
  for (const [root, text] of [
    [LAUNCH, "launch text"],
    [OPERATION, "operation text"],
  ] as const) {
    const skill = join(root, ".claude", "skills", "vellum-footguns");
    mkdirSync(skill, { recursive: true });
    writeFileSync(
      join(skill, "SKILL.md"),
      `# a skill\n\n## Gate 1: the ${root === LAUNCH ? "launch" : "operation"} checkout's gate\n\n${text}\n`,
    );
  }
  for (const dir of [join(OPERATION, "a"), ELSEWHERE, STATE]) mkdirSync(dir, { recursive: true });
  process.env.TMPDIR = STATE;
});

after(() => {
  if (SAVED_TMPDIR === undefined) delete process.env.TMPDIR;
  else process.env.TMPDIR = SAVED_TMPDIR;
  rmSync(OWN, { recursive: true, force: true });
});

const request = (operations: readonly Operation[], sessionKey: string, caller: CallerKind = "main"): HookRequest => ({
  harness: "claude-code",
  sessionKey,
  caller,
  directoryPersists: "unknown",
  sessionDirectory: OPERATION,
  operationDirectory: { path: OPERATION, provenance: "payload" },
  policyRoot: LAUNCH,
  operations,
});
const change: Operation = { kind: "update", path: join(OPERATION, "test", "x.test.ts"), text: "x" };

test("the gate text comes from the request's policy root, not from the checkout the edit lands in (Issue #1395)", async () => {
  const r = request([change], "policy-root");
  const delivery = deliver(r, await evaluate(r));
  assert.equal(delivery?.kind, "context");
  assert.ok(delivery.text.includes("the launch checkout's gate"), delivery.text);
  assert.ok(!delivery.text.includes("the operation checkout's gate"), delivery.text);
});

test("the session directory comes from the request, never from CLAUDE_PROJECT_DIR (Issue #1395)", async () => {
  const saved = process.env.CLAUDE_PROJECT_DIR;
  process.env.CLAUDE_PROJECT_DIR = ELSEWHERE;
  try {
    const verdict = await evaluate(request([{ kind: "shell", command: "cd a" }], "session-directory"));
    assert.match(verdict.denial ?? "", /inside the project/);
  } finally {
    if (saved === undefined) delete process.env.CLAUDE_PROJECT_DIR;
    else process.env.CLAUDE_PROJECT_DIR = saved;
  }
});

test("a later operation's denial wins, and the gate an earlier one owed is not marked shown (Issue #1395)", async () => {
  const r = request([change, { kind: "shell", command: "git stash pop" }], "denial-wins");
  const verdict = await evaluate(r);
  assert.match(verdict.denial ?? "", /refs\/stash/);
  assert.deepEqual(verdict.notes, []);
  assert.equal(deliver(r, verdict)?.kind, "deny");
  const r2 = request([change], "denial-wins");
  const delivery = deliver(r2, await evaluate(r2));
  assert.ok(delivery?.kind === "context", "the gate was spent by the refused call");
  assert.ok(delivery.text.includes("the launch checkout's gate"), delivery.text);
});

test("operations are read in order, so the first denial is the one shown (Issue #1395)", async () => {
  const verdict = await evaluate(
    request(
      [
        { kind: "shell", command: "perl -pi -e 's/a/−/' f.ts" },
        { kind: "shell", command: "git stash pop" },
      ],
      "first-denial",
    ),
  );
  assert.match(verdict.denial ?? "", /re-encodes/);
});

test("a caller the harness cannot name is refused a bare cd as the main session is (Issue #1395)", async () => {
  const cd: Operation = { kind: "shell", command: "cd a" };
  const unknown = await evaluate(request([cd], "unknown-caller", "unknown"));
  assert.match(unknown.denial ?? "", /inside the project/);
  const subagent = await evaluate(request([cd], "unknown-caller", "subagent"));
  assert.equal(subagent.denial, null);
});
