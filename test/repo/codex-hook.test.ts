import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { setTimeout as pause } from "node:timers/promises";
import { decideCodex, toCodexRequest, type CodexPayload } from "../../scripts/agent-infra/hooks/codex-adapter.ts";
import { shownGates } from "../../scripts/agent-infra/hooks/gate-state.ts";
import type { Decision } from "../../scripts/agent-infra/hooks/hook-io.ts";
import { REMEMBER_BURST } from "../../test-support/footgun-gate/remember-burst.ts";
import { readDeployed } from "../../test-support/footgun-gate/selftest.ts";
import { BOUND_MS, git } from "../../test-support/sandbox-repo.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
const REGISTRATION = join(ROOT, ".codex", "hooks.json");
const FROZEN = {
  hooks: {
    PreToolUse: [
      {
        matcher: "Bash|apply_patch",
        hooks: [
          {
            type: "command",
            command:
              'F="$(git rev-parse --show-toplevel 2>/dev/null)/scripts/agent-infra/hooks/codex-launcher.ts"; if [ -f "$F" ]; then exec node "$F"; fi; exit 0',
            timeout: 10,
            additionalContextLimit: 0,
          },
        ],
      },
    ],
  },
};
const COMMAND = (JSON.parse(readFileSync(REGISTRATION, "utf8")) as typeof FROZEN).hooks.PreToolUse[0]?.hooks[0]
  ?.command;
// 2026-11-15, Issue #1396: two processes remembering 50 gates each at one signal lost gates in 20 of 20 runs while the state file was read, extended and written whole, and in none of 50 runs once each gate is appended.
const PER_PROCESS = 50;

const OWN = realpathSync(mkdtempSync(join(tmpdir(), "codex-hook-")));
const MAIN = join(OWN, "main");
const LANE = join(MAIN, ".claude", "worktrees", "lane");
const OLD = join(MAIN, ".claude", "worktrees", "old");
const DECOY = join(OWN, "decoy");
const NOWHERE = join(OWN, "nowhere");
const STATE = join(OWN, "state");
const SAVED_TMPDIR = process.env.TMPDIR;

const deep = (dir: string): string => join(dir, "deep", "er");
const checkout = (dir: string, who: string): void => {
  cpSync(join(ROOT, "scripts", "agent-infra", "hooks"), join(dir, "scripts", "agent-infra", "hooks"), {
    recursive: true,
  });
  mkdirSync(join(dir, ".claude", "skills", "vellum-footguns"), { recursive: true });
  writeFileSync(
    join(dir, ".claude", "skills", "vellum-footguns", "SKILL.md"),
    `# a skill\n\n## Gate 5: ${who}'s gate\n\n${who}'s gate text\n`,
  );
  mkdirSync(deep(dir), { recursive: true });
};

before(() => {
  mkdirSync(MAIN, { recursive: true });
  git(["init", "-q", "-b", "main", "."], MAIN);
  git(["config", "user.email", "t@t"], MAIN);
  git(["config", "user.name", "t"], MAIN);
  git(["config", "commit.gpgsign", "false"], MAIN);
  git(["commit", "-q", "--allow-empty", "-m", "base"], MAIN);
  git(["worktree", "add", "-q", "--detach", LANE, "HEAD"], MAIN);
  git(["worktree", "add", "-q", "--detach", OLD, "HEAD"], MAIN);
  checkout(MAIN, "main");
  checkout(LANE, "lane");
  checkout(DECOY, "decoy");
  for (const dir of [deep(OLD), deep(NOWHERE), STATE]) mkdirSync(dir, { recursive: true });
  process.env.TMPDIR = STATE;
});

after(() => {
  if (SAVED_TMPDIR === undefined) delete process.env.TMPDIR;
  else process.env.TMPDIR = SAVED_TMPDIR;
  rmSync(OWN, { recursive: true, force: true });
});

type Observed = CodexPayload & {
  turn_id: string;
  transcript_path: string;
  hook_event_name: string;
  model: string;
  permission_mode: string;
  tool_use_id: string;
};
const codex = (session: string, command: string, cwd: string, helper = false): Observed => ({
  session_id: session,
  turn_id: "turn",
  transcript_path: "/dev/null",
  cwd,
  hook_event_name: "PreToolUse",
  model: "gpt-6.1-sol",
  permission_mode: "default",
  tool_name: "Bash",
  tool_input: { command },
  tool_use_id: "call",
  ...(helper ? { agent_id: "child", agent_type: "vellum-implementer" } : {}),
});
const launch = (cwd: string, payload: CodexPayload, env: Readonly<Record<string, string>> = {}): Decision =>
  readDeployed(() =>
    execFileSync("sh", ["-c", COMMAND ?? "exit 3"], {
      cwd,
      input: JSON.stringify(payload),
      encoding: "utf8",
      timeout: BOUND_MS,
      env: { PATH: process.env.PATH ?? "", TMPDIR: STATE, ...env },
    }),
  );
const textOf = (got: Decision): string =>
  got?.hookSpecificOutput.permissionDecisionReason ?? got?.hookSpecificOutput.additionalContext ?? "";

test("the Codex hook registration is byte for byte the frozen definition, since any change waits on Alex's trust again (Issue #1396)", () => {
  assert.equal(readFileSync(REGISTRATION, "utf8"), `${JSON.stringify(FROZEN, null, 2)}\n`);
});

test("the registered Codex command refuses a stash pop from a folder deep in the checkout, with no CLAUDE_PROJECT_DIR (Issue #1396)", () => {
  const got = launch(deep(MAIN), codex("deep-stash", "git stash pop", deep(MAIN)));
  assert.equal(got?.hookSpecificOutput.permissionDecision, "deny");
  assert.match(textOf(got), /refs\/stash/);
});

test("a session started in a lane's worktree runs that worktree's hook and reads its gates (Issue #1396)", () => {
  const text = textOf(launch(deep(LANE), codex("lane-push", "git push", deep(LANE))));
  assert.ok(text.includes("lane's gate text"), text);
  assert.ok(!text.includes("main's gate text"), text);
});

test("a helper working in a lane's folder reads the gates of the checkout its session started in (Issue #1396)", () => {
  const text = textOf(launch(MAIN, codex("helper-push", "git push", deep(LANE), true)));
  assert.ok(text.includes("main's gate text"), text);
  assert.ok(!text.includes("lane's gate text"), text);
});

test("CLAUDE_PROJECT_DIR naming another checkout changes nothing under Codex (Issue #1396)", () => {
  const text = textOf(launch(deep(MAIN), codex("decoy-push", "git push", deep(MAIN)), { CLAUDE_PROJECT_DIR: DECOY }));
  assert.ok(text.includes("main's gate text"), text);
  assert.ok(!text.includes("decoy's gate text"), text);
});

test("a worktree cut before the Codex launcher existed, and a folder in no repository, get no answer (Issue #1396)", () => {
  assert.equal(launch(deep(OLD), codex("old-stash", "git stash pop", deep(OLD))), null);
  assert.equal(launch(deep(NOWHERE), codex("nowhere-stash", "git stash pop", deep(NOWHERE))), null);
});

test("the Codex adapter reads a shell call and a patch as Codex 0.169.0 sends them, and answers no other tool (Issue #1396, Issue #1397)", () => {
  const main = codex("mapping", "git status", "/s/nested");
  assert.deepEqual(toCodexRequest(main, "/s", "/policy"), {
    harness: "codex",
    sessionKey: "mapping",
    caller: "main",
    directoryPersists: false,
    sessionDirectory: "/s",
    operationDirectory: { path: "/s/nested", provenance: "payload" },
    policyRoot: "/policy",
    operations: [{ kind: "shell", command: "git status" }],
  });
  assert.equal(toCodexRequest(codex("mapping", "git status", "/s/nested", true), "/s", "/policy")?.caller, "subagent");
  const patch = {
    ...main,
    tool_name: "apply_patch",
    tool_input: { command: "*** Begin Patch\n*** Delete File: gone.ts\n*** End Patch" },
  };
  assert.deepEqual(toCodexRequest(patch, "/s", "/policy")?.operations, [{ kind: "delete", path: "/s/nested/gone.ts" }]);
  assert.equal(toCodexRequest({ ...main, tool_name: "request_user_input_async" }, "/s", "/policy"), null);
});

test("a gate is pasted once per Codex session, again in another session, and a refusal every time (Issue #1396)", async () => {
  const push = (session: string, helper = false): Promise<Decision> =>
    decideCodex(codex(session, "git push", ROOT, helper), ROOT);
  const pop = (session: string): Promise<Decision> => decideCodex(codex(session, "git stash pop", ROOT), ROOT);
  assert.match(textOf(await push("scope-a")), /## Gate 5/);
  assert.match(textOf(await push("scope-b")), /## Gate 5/);
  assert.equal(await push("scope-a"), null);
  assert.equal(await push("scope-a", true), null);
  assert.match(textOf(await pop("scope-a")), /refs\/stash/);
  assert.match(textOf(await pop("scope-a")), /refs\/stash/);
});

const burst = (prefix: string, ready: string, go: string): Promise<number | null> =>
  new Promise((done) => {
    spawn(process.execPath, [REMEMBER_BURST, "burst", prefix, String(PER_PROCESS), ready, go], {
      env: { ...process.env, TMPDIR: STATE },
      stdio: "ignore",
      timeout: BOUND_MS,
    }).on("exit", done);
  });

test("gates two hook processes remember at the same moment all stay remembered (Issue #1396)", async () => {
  const go = join(STATE, "burst-go");
  const ready = [join(STATE, "burst-ready-a"), join(STATE, "burst-ready-b")] as const;
  const exits = Promise.all([burst("a", ready[0], go), burst("b", ready[1], go)]);
  for (let waited = 0; !ready.every((r) => existsSync(r)); waited += 5) {
    assert.ok(waited < BOUND_MS, "the two remembering processes never started");
    await pause(5);
  }
  writeFileSync(go, "");
  assert.deepEqual(await exits, [0, 0]);
  assert.equal(shownGates("burst").size, 2 * PER_PROCESS);
});
