import { test } from "node:test";
import assert from "node:assert/strict";
import { HOOK_CHECK } from "../../scripts/agent-infra/hooks/headless-build.ts";
import { buildArgv, buildEnv, outcomeOf, resumeArgv, threadOf } from "../../scripts/handoff/launch.ts";
import { buildPrompt, OUTCOME_HANDBACK, OUTCOME_READY, resumePrompt } from "../../scripts/handoff/prompt.ts";

const D2 = ["-s", "danger-full-access", "-a", "on-request"];
const EFFORT = 'model_reasoning_effort="high"';

test("a build starts codex exec with D2's flags before the subcommand, the role's model and effort, its stream and its last message (Issue #1409)", () => {
  assert.deepEqual(buildArgv({ tree: "/t", model: "m", effort: "high", last: "/f/run-1-last.md", prompt: "p" }), [
    ...D2,
    "exec",
    "--json",
    "-C",
    "/t",
    "-m",
    "m",
    "-c",
    EFFORT,
    "-o",
    "/f/run-1-last.md",
    "p",
  ]);
});

test("a resume restates the sandbox and the effort and names the thread (Issue #1409)", () => {
  assert.deepEqual(resumeArgv({ thread: "th", model: "m", effort: "high", last: "/f/run-2-last.md", prompt: "p" }), [
    ...D2,
    "exec",
    "resume",
    "--json",
    "-m",
    "m",
    "-c",
    EFFORT,
    "-o",
    "/f/run-2-last.md",
    "th",
    "p",
  ]);
});

test("the build's environment carries the issue in VELLUM_HEADLESS_BUILD and no GitHub or push login, and leaves its base alone (Issue #1409)", () => {
  const base = {
    PATH: "/bin",
    GH_TOKEN: "t",
    GITHUB_TOKEN: "t",
    GH_ENTERPRISE_TOKEN: "t",
    GITHUB_ENTERPRISE_TOKEN: "t",
    GIT_ASKPASS: "a",
    SSH_ASKPASS: "a",
    SSH_AUTH_SOCK: "s",
    GIT_CONFIG_PARAMETERS: "'credential.helper=osxkeychain'",
    GIT_CONFIG_COUNT: "2",
    GIT_CONFIG_KEY_1: "credential.helper",
    GIT_CONFIG_VALUE_1: "osxkeychain",
  };
  const before = { ...base };
  assert.deepEqual(buildEnv(base, 1409, "/o/gh-empty"), {
    PATH: "/bin",
    VELLUM_HEADLESS_BUILD: "1409",
    GIT_CONFIG_COUNT: "1",
    GIT_CONFIG_KEY_0: "credential.helper",
    GIT_CONFIG_VALUE_0: "",
    GIT_TERMINAL_PROMPT: "0",
    GH_CONFIG_DIR: "/o/gh-empty",
  });
  assert.deepEqual(base, before);
});

test("a run's thread is the first thread.started event of its stream (Issue #1409)", () => {
  const opening =
    '{"type":"thread.started","thread_id":"01a1f964-1dfe-7b23-a6b8-571a3707b281"}\n{"type":"turn.started"}\n';
  assert.equal(threadOf(opening), "01a1f964-1dfe-7b23-a6b8-571a3707b281");
  assert.equal(threadOf('{not json\n{"type":"thread.started","thread_id":"x"}\n'), "x");
  assert.equal(threadOf('{"type":"turn.started"}\n'), null);
  assert.equal(threadOf(""), null);
});

test("a run's outcome is its last message's last non-empty line, exactly (Issue #1409)", () => {
  assert.equal(outcomeOf("built\nOUTCOME: ready\n"), "ready");
  assert.equal(outcomeOf("OUTCOME: handback\n\n"), "handback");
  assert.equal(outcomeOf("OUTCOME: ready\nmore"), null);
  assert.equal(outcomeOf("outcome: ready"), null);
  assert.equal(outcomeOf(""), null);
});

test("the build's prompt names its plan, tree, session, record files, hook check and outcome lines (Issue #1409)", () => {
  const build = buildPrompt({
    issue: 7,
    plan: "/p/7-plan.md",
    tree: "/t",
    folder: "/o/7-handoff",
    session: "https://s",
  });
  for (const part of [
    "/p/7-plan.md",
    "/t",
    "https://s",
    "/o/7-handoff/record.md",
    "/o/7-handoff/pr-body.md",
    "/o/7-handoff/guards.md",
    "/o/7-handoff/issue.json",
    "/o/7-handoff/comments.jsonl",
    HOOK_CHECK,
    OUTCOME_READY,
    OUTCOME_HANDBACK,
    ".codex/agents/vellum-implementer.toml",
  ])
    assert.ok(build.includes(part), part);
  const resume = resumePrompt({ issue: 7, brief: "/b.md", folder: "/o/7-handoff" });
  for (const part of [
    "/b.md",
    "/o/7-handoff/issue.json",
    "/o/7-handoff/comments.jsonl",
    HOOK_CHECK,
    OUTCOME_READY,
    OUTCOME_HANDBACK,
  ])
    assert.ok(resume.includes(part), part);
});
