import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const AGENTS = resolve(import.meta.dirname, "..", "..", ".claude", "agents");

// Code blocks only, never prose: the rule forbidding a bare prune has to be able to quote it (vellum-pr-skeptic.md), and a scanner that read prose would red on the prohibition itself. The cost is a defect written as prose rather than as a recipe, which this cannot see.
// Indent-tolerant and tilde-tolerant because markdown renders both as real code blocks: vellum-guard-prover.md is almost all bulleted prose, so a recipe fragment in a nested fence is the likely place for this defect to reappear. The indent is uncapped rather than capped at 3, because a fence's indent is measured from its enclosing list item and not from column 0, so a nested bullet puts a real fence past any absolute cap (confirmed against a CommonMark parse, 2026-09-12). The closing marker is a backreference because an opener paired with a different closer desynchronizes every later match and swallows prose into a block, which red the prune scan on the sentence forbidding it.
const FENCE = /^[ \t]*(`{3,}|~{3,})[^\n]*\n([\s\S]*?)^[ \t]*\1/gm;
const ANCHORS = [
  [/\/Users\/[A-Za-z0-9._-]+/, "an absolute home path"],
  [/\bcd\s+~\//, "a cd to a home-anchored path"], // same defect in a different spelling: it pins the recipe to one checkout. Scoped to cd so a legitimate read of ~/.claude/... does not red.
] as const;
const BARE_PRUNE = /\bworktree\s+prune\b(?!\s+--expire)/;

const ROSTER = [
  "vellum-guard-prover.md",
  "vellum-plan-skeptic.md",
  "vellum-plate-reader.md",
  "vellum-pr-skeptic.md",
  "vellum-spec-recon.md",
];

// vellum-plate-reader carries no fenced block; the other four do. Pinning the set proves the extractor found something, so the two scans below cannot pass by matching nothing.
const CARRY_RECIPES = ["vellum-guard-prover.md", "vellum-plan-skeptic.md", "vellum-pr-skeptic.md", "vellum-spec-recon.md"];

const agents = (): { name: string; blocks: string[] }[] =>
  readdirSync(AGENTS)
    .filter((n) => n.endsWith(".md"))
    .sort()
    .map((name) => ({ name, blocks: [...readFileSync(join(AGENTS, name), "utf8").matchAll(FENCE)].map((m) => m[2] ?? "") }));

test("the scanner reads every agent file, so neither scan below can pass vacuously", () => {
  const found = agents();
  assert.deepEqual(
    found.map((a) => a.name),
    ROSTER,
    "a new agent file joins this roster deliberately, the way every roster in this repo is joined",
  );
  assert.deepEqual(
    found.filter((a) => a.blocks.length > 0).map((a) => a.name),
    CARRY_RECIPES,
    "the fence extractor found no blocks where it should have, so the scans below are reading nothing",
  );
});

test("the fence extractor reads the block shapes markdown actually renders", () => {
  const shapes: [string, string][] = [
    ["column-zero backtick", "```bash\nPAYLOAD\n```\n"],
    ["indented under a bullet", "- a bullet\n\n  ```bash\n  PAYLOAD\n  ```\n"],
    ["tilde fence", "~~~bash\nPAYLOAD\n~~~\n"],
    ["fence at column four, nested two bullets deep", "- outer\n  - inner\n\n    ```bash\n    PAYLOAD\n    ```\n"],
  ];
  for (const [shape, md] of shapes) {
    const blocks = [...md.matchAll(FENCE)].map((m) => m[2] ?? "");
    assert.equal(blocks.length, 1, `${shape}: extractor found ${blocks.length} blocks, so a defect in this shape would be invisible to both scans below`);
    assert.match(blocks[0] ?? "", /PAYLOAD/, `${shape}: block captured but its body was not`);
  }
});

test("a closing marker of the wrong kind does not desynchronize the extractor", () => {
  const md = "```bash\nstray\n~~~\nmore\n```\n\nprose naming `git worktree prune` as forbidden\n\n```bash\nPAYLOAD\n```\n";
  const blocks = [...md.matchAll(FENCE)].map((m) => m[2] ?? "");
  assert.ok(
    blocks.some((b) => b.includes("PAYLOAD")),
    "the real block after a mismatched marker was never captured, so a defect there would be invisible",
  );
  assert.ok(
    !blocks.some((b) => /\bworktree\s+prune\b/.test(b)),
    "prose was swallowed into a captured block, which reds the prune scan on the very sentence that forbids a bare prune",
  );
});

test("no agent recipe hardcodes an absolute home path", () => {
  for (const { name, blocks } of agents()) {
    blocks.forEach((block, i) => {
      for (const [pattern, label] of ANCHORS) {
        const hit = pattern.exec(block);
        assert.equal(
          hit,
          null,
          `${name} block ${i + 1} hardcodes ${label} (${hit?.[0]}): dispatched from a worktree the recipe then anchors to the wrong checkout and proves the wrong commit (#575). Derive the root with git rev-parse --path-format=absolute --git-common-dir.`,
        );
      }
    });
  }
});

test("no agent recipe runs a bare git worktree prune", () => {
  for (const { name, blocks } of agents()) {
    blocks.forEach((block, i) => {
      assert.equal(
        BARE_PRUNE.test(block),
        false,
        `${name} block ${i + 1} runs a bare worktree prune, which deregisters every worktree whose directory is momentarily absent, another session's included, and restoring the directory does not bring it back (#575). remove deregisters its own tree; use --expire if a prune is genuinely wanted.`,
      );
    });
  }
});
