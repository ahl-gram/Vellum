import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { lstatSync, mkdirSync, mkdtempSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";

const REPO = resolve(import.meta.dirname, "..", "..");
// Errs toward a red where one folder holds both names, which Codex never loads together; misses a fallback name a user's own config adds, and any untracked file.
const INSTRUCTION_NAMES: readonly string[] = ["agents.md", "agents.override.md"];
// 2026-11-19: codex-cli 0.170.0 reads at most 32,768 bytes of AGENTS.md text, counted in bytes and summed over every AGENTS.md from the project root down to the launch folder, a user's own AGENTS.md not counted (codex debug prompt-input renders, Issue #1400).
const CODEX_LIMIT_BYTES = 32_768;
// 2026-11-19: Alex ruled that the house's AGENTS.md text may use 31,744 of the 32,768 bytes Codex reads, keeping 1 KB spare (Issue #1400 comment 7017948819).
const BUDGET_BYTES = 31_744;
// 2026-11-19: this git ls-files answers in under 5 ms on a Mac; thirty seconds is a cap on a hang, not a budget.
const GIT_TIMEOUT_MS = 30_000;

const isInstructionFile = (path: string): boolean => basename(path) === "AGENTS.md";

function trackedInstructionFiles(root: string): readonly string[] {
  const listing = spawnSync("git", ["ls-files", "-z"], { cwd: root, encoding: "utf8", timeout: GIT_TIMEOUT_MS });
  assert.equal(listing.status, 0, `git ls-files failed: ${listing.error?.message ?? listing.stderr}`);
  return listing.stdout.split("\0").filter((path) => path !== "" && isInstructionFile(path));
}

const folderOf = (file: string): string => (dirname(file) === "." ? "" : dirname(file));

function pathBytes(root: string, files: readonly string[]): ReadonlyMap<string, number> {
  return new Map(files.map((file) => [folderOf(file), lstatSync(join(root, file)).size]));
}

function overBudget(root: string, files: readonly string[], budget: number): readonly string[] {
  return [...pathBytes(root, files)]
    .filter(([, bytes]) => bytes > budget)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([folder, bytes]) => `${folder === "" ? "the root" : folder}: ${bytes} bytes of AGENTS.md text from the root down, over the ${budget}-byte budget (Codex reads at most ${CODEX_LIMIT_BYTES})`);
}

function inTree(files: Readonly<Record<string, number | { readonly link: string }>>, run: (root: string) => void): void {
  const root = mkdtempSync(join(tmpdir(), "instruction-budget-"));
  try {
    for (const [file, contents] of Object.entries(files)) {
      const path = join(root, file);
      mkdirSync(dirname(path), { recursive: true });
      if (typeof contents === "number") writeFileSync(path, "x".repeat(contents));
      else symlinkSync(contents.link, path);
    }
    run(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test("the root AGENTS.md is read through its link at the bytes of CLAUDE.md, and no folder Codex can start in holds more AGENTS.md text than the budget", () => {
  const files = trackedInstructionFiles(REPO);
  assert.ok(files.includes("AGENTS.md"), "git lists no root AGENTS.md, so this test would measure nothing");
  assert.equal(pathBytes(REPO, files).get(""), statSync(join(REPO, "CLAUDE.md")).size, "the root AGENTS.md was not read through its link to CLAUDE.md");
  assert.deepEqual(overBudget(REPO, files, BUDGET_BYTES), [], "CLAUDE.md, which Codex reads as AGENTS.md, has outgrown its budget: move a step only Claude Code can take to .claude/rules/claude-code.md, or cut (handbook/specs/conventions.md, Where a rule lives)");
});

test("the budget check passes a linked target of exactly 31,744 bytes and refuses one of 31,745", () => {
  inTree({ "CLAUDE.md": 31_744, "AGENTS.md": { link: "CLAUDE.md" } }, (root) => assert.deepEqual(overBudget(root, ["AGENTS.md"], BUDGET_BYTES), []));
  inTree({ "CLAUDE.md": 31_745, "AGENTS.md": { link: "CLAUDE.md" } }, (root) => assert.deepEqual(overBudget(root, ["AGENTS.md"], BUDGET_BYTES), ["the root: 31745 bytes of AGENTS.md text from the root down, over the 31744-byte budget (Codex reads at most 32768)"]));
});

test("the budget check sums each nested AGENTS.md with every one above it, folder by folder", () => {
  inTree({ "CLAUDE.md": 20_000, "AGENTS.md": { link: "CLAUDE.md" }, "a/AGENTS.md": 13_000, "b/AGENTS.md": 1_000 }, (root) => assert.deepEqual(overBudget(root, ["AGENTS.md", "a/AGENTS.md", "b/AGENTS.md"], BUDGET_BYTES), ["a: 33000 bytes of AGENTS.md text from the root down, over the 31744-byte budget (Codex reads at most 32768)"]));
});

test("a tracked file is Codex's instructions when it is named AGENTS.md or AGENTS.override.md, in any folder and in any case", () => {
  for (const path of ["AGENTS.md", "handbook/AGENTS.md", "AGENTS.override.md", "a/b/AGENTS.override.md", "a/agents.md"]) assert.ok(isInstructionFile(path), path);
  for (const path of ["CLAUDE.md", "AGENTS.md.orig", "a/XAGENTS.md", "AGENTS"]) assert.ok(!isInstructionFile(path), path);
});
