import { readdirSync, rmSync } from "node:fs";
import { basename, join } from "node:path";
import { decide, type Payload } from "../../scripts/agent-infra/hooks/claude-adapter.ts";
import { decideCodex } from "../../scripts/agent-infra/hooks/codex-adapter.ts";
import { statePath } from "../../scripts/agent-infra/hooks/gate-state.ts";
import { bash, edit, ROOT } from "./kit.ts";

// Claude Code 2.1.322, measured 2026-11-11 with a project hook in a non-interactive session, an interactive one and an agent dispatched from each: added text of 9,900 characters arrived whole and 10,100 became a 2,000-character preview in the interactive session and the agents (the non-interactive session itself was read at 9,499, whole, and 10,499, a preview), and the 8,000-character cut the program carries reached none of them (the cloud routine unmeasured), so the limit sits 1,000 under that switch (Issue #1338).
const HOOK_CONTEXT_LIMIT = 9_000;
// Issue #1396's live check, row A9: a note of 58,980 characters reached Codex whole under `additionalContextLimit: 0`, the longest seen whole; Codex's own cap is unmeasured.
const CODEX_WHOLE_NOTE = 58_980;
// Every lead quotes the edited path, and the longest root a session edits under is an EnterWorktree directory named for its branch: the longest branch among the closed PRs read 2026-10-02 was 47 characters, and a shorter root here under-measures every probe.
const LONG_ROOT = `/Users/someone/CodeProjects/Vellum/.claude/worktrees/${"b".repeat(47)}`;
const NOISY_AND_CLICK = "const R = `a\\(b`; el.click();";
const EVERY_SHELL_NOTE =
  "cat > scripts/a-probe.ts <<'EOF'\nconst R = `a\\(b`;\nEOF\npkill -f brave; git push; gh pr create --body-file a-missing-body-file.md";
const longestName = (dir: string, suffix: string, recursive: boolean): string =>
  readdirSync(join(ROOT, dir), { recursive, encoding: "utf8" })
    .map((p) => basename(p))
    .filter((n) => n.endsWith(suffix))
    .reduce((a, b) => (b.length > a.length ? b : a), "");

export const sizeProbes = (test: string, suite: string): [string, Payload, string[], Payload?][] => {
  return [
    ["a test file", edit("Edit", `${LONG_ROOT}/test/a-directory/${test}`, "x"), ["## Gate 1"]],
    [
      "a test that reads the repo, once gate 1 is spent",
      edit("Edit", `${LONG_ROOT}/test/repo/${test}`, "x"),
      ["## Gate 7"],
      edit("Edit", `${LONG_ROOT}/test/render/${test}`, "x"),
    ],
    [
      "a browser-harness unit test that clicks and escapes",
      edit("Edit", `${LONG_ROOT}/test/e2e/${test}`, NOISY_AND_CLICK),
      ["## Gate 1", "for wiring only", "double the backslash"],
    ],
    [
      "a new e2e suite that clicks and escapes",
      edit("Write", `${LONG_ROOT}/e2e/suites/never-exists-${suite}`, NOISY_AND_CLICK),
      ["## Gate 4", "## Gate 2", "for wiring only", "double the backslash"],
    ],
    [
      "a new unit test under a suite-shaped path that clicks and escapes",
      edit("Write", `${LONG_ROOT}/test/e2e/suites/${test}`, NOISY_AND_CLICK),
      ["## Gate 1", "for wiring only", "double the backslash"],
    ],
    [
      "a new stylesheet",
      edit("Write", `${LONG_ROOT}/src/styles/a-new-sheet-name.css`, "x"),
      ["## Gate 4", "## Gate 3"],
    ],
    [
      "a new page",
      edit("Write", `${LONG_ROOT}/src/pages/a-new-room-name/index.astro`, "x"),
      ["## Gate 4", "## Gate 3"],
    ],
    ["a new site module", edit("Write", `${LONG_ROOT}/src/site/a-room-name/a-new-module-name.ts`, "x"), ["## Gate 4"]],
    ["the renderer", edit("Edit", `${LONG_ROOT}/src/render/layers/a-layer-name.ts`, "x"), ["## Gate 6"]],
    ["a push", bash("git push -u origin a-long-branch-name", LONG_ROOT), ["## Gate 5"]],
    [
      "a PR body from an unreadable file",
      bash("gh pr create --body-file a-missing-body-file.md", LONG_ROOT),
      ["## Gate 5", "could not read"],
    ],
    [
      "a shell line that writes a script, kills a browser, pushes and opens a PR",
      bash(EVERY_SHELL_NOTE, LONG_ROOT),
      ["## Gate 5", "could not read", "double the backslash", "browser profile"],
    ],
  ];
};

export const sizeChecks = async (report: (ok: boolean, line: string) => void): Promise<void> => {
  const test = longestName("test", ".test.ts", true);
  const suite = longestName(join("e2e", "suites"), ".ts", false);
  const probes = sizeProbes(test, suite);
  const quoted = probes.map(([, payload]) => payload.tool_input?.file_path ?? payload.cwd ?? "");
  report(
    LONG_ROOT.length === 100 && quoted.every((p) => p === LONG_ROOT || p.startsWith(`${LONG_ROOT}/`)),
    `the size probes' ${quoted.length} quoted paths sit under a root of ${LONG_ROOT.length} characters, naming test files of ${test.length} and suites of ${suite.length} characters`,
  );
  for (const [name, payload, needles, before] of probes) {
    const sessionId = `selftest-size-${process.pid}-${name}`;
    if (before) await decide({ ...before, session_id: sessionId });
    const text = (await decide({ ...payload, session_id: sessionId }))?.hookSpecificOutput.additionalContext ?? "";
    rmSync(statePath(sessionId), { force: true });
    const found = needles.filter((n) => text.includes(n));
    report(
      found.length === needles.length && text.length <= HOOK_CONTEXT_LIMIT,
      `${name}: the pasted note carries ${found.join(", ")} in ${text.length} of ${HOOK_CONTEXT_LIMIT} characters`,
    );
  }
};

const ORDER_PROBES: [string, Payload, string[]][] = [
  [
    "the notes of a new e2e suite that clicks and escapes keep their order",
    edit("Write", `${LONG_ROOT}/e2e/suites/never-exists-order.ts`, NOISY_AND_CLICK),
    ["double the backslash", "for wiring only", "## Gate 4", "## Gate 2"],
  ],
  [
    "the notes of a shell line that writes a script, kills a browser, pushes and opens a PR keep their order",
    bash(EVERY_SHELL_NOTE, LONG_ROOT),
    ["could not read", "double the backslash", "## Gate 5", "browser profile"],
  ],
];

export const orderChecks = async (report: (ok: boolean, line: string) => void): Promise<void> => {
  for (const [name, payload, needles] of ORDER_PROBES) {
    const sessionId = `selftest-order-${process.pid}-${name}`;
    const text = (await decide({ ...payload, session_id: sessionId }))?.hookSpecificOutput.additionalContext ?? "";
    rmSync(statePath(sessionId), { force: true });
    const at = needles.map((needle) => text.indexOf(needle));
    report(
      at.every((i, k) => i !== -1 && (k === 0 || i > (at[k - 1] ?? -1))),
      `${name}: ${needles.join(", ")}`,
    );
  }
};

const EVERY_EDIT_GATE = [
  "## Gate 1",
  "## Gate 7",
  "## Gate 4",
  "## Gate 2",
  "## Gate 3",
  "## Gate 6",
  "for wiring only",
  "double the backslash",
];

export const patchSizeCheck = async (report: (ok: boolean, line: string) => void): Promise<void> => {
  const test = longestName("test", ".test.ts", true);
  const suite = longestName(join("e2e", "suites"), ".ts", false);
  const command = [
    "*** Begin Patch",
    `*** Update File: test/repo/${test}`,
    "@@",
    "+x",
    `*** Update File: test/site/${test}`,
    "@@",
    "+x",
    `*** Add File: e2e/suites/never-exists-${suite}`,
    `+${NOISY_AND_CLICK}`,
    "*** Add File: src/styles/a-new-sheet-name.css",
    "+x",
    "*** Update File: src/render/layers/a-layer-name.ts",
    "@@",
    "+x",
    "*** End Patch",
  ].join("\n");
  const session = `selftest-size-${process.pid}-patch`;
  const got = await decideCodex(
    { session_id: session, cwd: LONG_ROOT, tool_name: "apply_patch", tool_input: { command } },
    LONG_ROOT,
  );
  rmSync(statePath(session), { force: true });
  const text = got?.hookSpecificOutput.additionalContext ?? "";
  const found = EVERY_EDIT_GATE.filter((n) => text.includes(n));
  report(
    found.length === EVERY_EDIT_GATE.length && text.length <= CODEX_WHOLE_NOTE,
    `codex: patch: a patch owing every gate an edit can owe: the pasted note carries ${found.join(", ")} in ${text.length} of ${CODEX_WHOLE_NOTE} characters`,
  );
};
