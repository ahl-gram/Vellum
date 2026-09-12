import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const AGENTS = resolve(import.meta.dirname, "..", "..", ".claude", "agents");

// Code blocks only, never prose: the rule forbidding a bare prune has to be able to quote it (vellum-pr-skeptic.md), and a scanner that read prose would red on the prohibition itself. The cost is a defect written as prose rather than as a recipe, which this cannot see.
const FENCE = /^```[^\n]*\n([\s\S]*?)^```/gm;
const ABSOLUTE_HOME = /\/Users\/[A-Za-z0-9._-]+\//;
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
    .map((name) => ({ name, blocks: [...readFileSync(join(AGENTS, name), "utf8").matchAll(FENCE)].map((m) => m[1] ?? "") }));

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

test("no agent recipe hardcodes an absolute home path", () => {
  for (const { name, blocks } of agents()) {
    blocks.forEach((block, i) => {
      const hit = ABSOLUTE_HOME.exec(block);
      assert.equal(
        hit,
        null,
        `${name} block ${i + 1} hardcodes ${hit?.[0]}: dispatched from a worktree the recipe then anchors to the wrong checkout and proves the wrong commit (#575). Derive the root with git rev-parse --path-format=absolute --git-common-dir.`,
      );
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
