import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { HARNESSES, OUTPUT_DIRS, ROLES, adapterPath, roleBodyPath } from "../../scripts/agent-infra/roles.ts";
import { trackedUnder as tracked } from "../../test-support/tracked-files.ts";

// What is retired, where it went, and what may still name it (Issue #1087, Issue #1410): a file left where it was is still loaded or read as live, so each retirement's archived copy and its one tombstone line in the rulebook are the only live places that name it. Misses, each erring toward a silent pass: handbook/plans, handbook/errata, handbook/retired and each skill's references/ folder, which are history by design; .agents/, whose skill links lead back into .claude/skills; code and its comments under src/, scripts/, test/, test-support/ and e2e/; and any spelling a retirement's pattern does not catch, which its spellings list bounds.

const REPO = resolve(import.meta.dirname, "..", "..");
const LIVE_ROOTS = [
  ".claude/agents",
  ".claude/rules",
  ".claude/skills",
  ".codex/agents",
  "handbook/agents",
  ".github",
  "handbook/specs",
  "CLAUDE.md",
  "README.md",
];
const HISTORY = /^\.claude\/skills\/[^/]+\/references\//;
const TOMBSTONE_FILE = "handbook/specs/rulebook.md";

type Retirement = {
  readonly what: string;
  readonly gone: readonly string[];
  readonly archived: readonly string[];
  readonly names: RegExp;
  readonly spellings: readonly string[];
  readonly tombstone: string;
};

const RETIREMENTS: readonly Retirement[] = [
  {
    what: "the plan skeptic",
    gone: [".claude/agents/vellum-plan-skeptic.md"],
    archived: ["handbook/retired/vellum-plan-skeptic.md"],
    names: /plan[-\s]+skeptic/gi,
    spellings: ["plan skeptic", "plan-skeptic", "Plan Skeptic", "the plan\nskeptic"],
    tombstone: "- **The plan skeptic is retired**",
  },
  {
    what: "the cloud quick-win routine",
    gone: ["handbook/specs/cloud-routine.md", "scripts/cloud-setup.sh"],
    archived: ["handbook/retired/cloud-routine.md", "handbook/retired/cloud-setup.sh"],
    names: /cloud[-\s]+routine|cloud[-\s]*quick-?win|quick-?win[-\s]+routine|cloud-setup/gi,
    spellings: [
      "cloud-routine.md",
      "the cloud routine",
      "Cloud Routine",
      "The cloud\nroutine",
      "cloud-quickwin",
      "a cloud quick-win run",
      "the quick-win routine",
      "a quickwin\nroutine",
      "scripts/cloud-setup.sh",
    ],
    tombstone: "- **The cloud quick-win routine is retired**",
  },
];
const NEAR_MISSES = ["a cloud run", "the cloud sandbox", "a quick win", "the pr-skeptic", "the skeptic", "cloud setup"];

function mentionsIn(file: string, r: Retirement): string[] {
  const raw = readFileSync(resolve(REPO, file), "utf8");
  const text =
    file === TOMBSTONE_FILE
      ? raw
          .split("\n")
          .map((line) => (line.startsWith(r.tombstone) ? "" : line))
          .join("\n")
      : raw;
  return [...text.matchAll(r.names)].map((m) => `${file}:${text.slice(0, m.index).split("\n").length}: ${r.what}`);
}

test("no retired file is still tracked where it was, so no session loads or reads it as live", () => {
  assert.deepEqual(
    RETIREMENTS.flatMap((r) => r.gone.flatMap((p) => tracked(p))),
    [],
  );
});

test("every retired file's archived copy is tracked under handbook/retired", () => {
  assert.deepEqual(
    RETIREMENTS.filter((r) => r.archived.length === 0).map((r) => r.what),
    [],
    "a retirement keeps no archive",
  );
  const archived = RETIREMENTS.flatMap((r) => r.archived);
  assert.deepEqual(
    archived.filter((p) => !p.startsWith("handbook/retired/")),
    [],
    "an archived copy outside handbook/retired",
  );
  assert.deepEqual(
    archived.filter((p) => tracked(p).length === 0),
    [],
    "an archived copy is not tracked",
  );
});

test("no live agent, rule, skill, template, spec, README or CLAUDE.md names a retired thing, bar each one's own tombstone line in the rulebook", () => {
  assert.deepEqual(
    LIVE_ROOTS.filter((root) => tracked(root).length === 0),
    [],
    "a live root lists no tracked file: the scan would read nothing there",
  );
  const files = tracked(...LIVE_ROOTS).filter((f) => !HISTORY.test(f));
  const findings = RETIREMENTS.flatMap((r) => files.flatMap((f) => mentionsIn(f, r)));
  assert.deepEqual(findings, [], `${findings.length} live mention(s) of a retired thing:\n  ${findings.join("\n  ")}`);
});

test("each retirement's pattern catches every spelling it lists, and no near miss", () => {
  const missed = RETIREMENTS.flatMap((r) =>
    r.spellings.filter((s) => [...s.matchAll(r.names)].length === 0).map((s) => `${r.what}: ${JSON.stringify(s)}`),
  );
  assert.deepEqual(missed, [], "a listed spelling is not caught");
  const caught = NEAR_MISSES.filter((s) => RETIREMENTS.some((r) => [...s.matchAll(r.names)].length > 0));
  assert.deepEqual(caught, [], "a near miss is caught");
});

test("the rulebook keeps one tombstone line per retirement, and it names where each archived file went", () => {
  const lines = readFileSync(resolve(REPO, TOMBSTONE_FILE), "utf8").split("\n");
  const found = RETIREMENTS.map((r) => lines.filter((line) => line.startsWith(r.tombstone)));
  assert.deepEqual(
    found.map((l) => l.length),
    RETIREMENTS.map(() => 1),
    "each retirement owes exactly one tombstone line",
  );
  assert.deepEqual(
    RETIREMENTS.flatMap((r, i) => r.archived.filter((p) => !found[i]![0]!.includes(p)).map((p) => `${r.what}: ${p}`)),
    [],
    "a tombstone does not say where an archived file went",
  );
});

test("every role body, adapter and generated definition lies under a live root, so a retired agent cannot come back through any of them", () => {
  const sources = [
    ...ROLES.map((role) => roleBodyPath(role.name)),
    ...HARNESSES.map(adapterPath),
    ...HARNESSES.map((harness) => `${OUTPUT_DIRS[harness]}/`),
  ];
  assert.deepEqual(
    sources.filter((source) => !LIVE_ROOTS.some((root) => source.startsWith(`${root}/`))),
    [],
  );
});
