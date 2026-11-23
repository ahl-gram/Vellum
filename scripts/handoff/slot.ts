import { existsSync, lstatSync, readdirSync, readFileSync, rmSync, symlinkSync } from "node:fs";
import { join } from "node:path";
import { git } from "../agent-sandbox.ts";
import { FILES, isIssueBranch } from "./state.ts";

export const ORIGIN_URL = "https://github.com/ahl-gram/Vellum.git";
const MAX_HEAD_BYTES = 4096;
const HEAD_TEXT = /^ref: refs\/heads\/(\S+)\n?$/;
const RECORD_FOLDER = /^(\d+)-handoff$/;

export const slotOf = (root: string): string => join(root, ".claude", "worktrees", "codex-build");

export const handoffRefOf = (issue: number): string => `refs/handoff/${issue}`;

export const slotHolder = (root: string, issue: number): number | null => {
  const out = join(root, "out");
  if (!existsSync(out)) return null;
  const holders = readdirSync(out)
    .map((name) => RECORD_FOLDER.exec(name)?.[1])
    .filter((digits): digits is string => digits !== undefined)
    .map(Number)
    .filter((n) => n !== issue && existsSync(join(out, `${n}-handoff`, FILES.state)))
    .sort((a, b) => a - b);
  return holders[0] ?? null;
};

export const makeSlotPlan = (
  root: string,
  sha: string,
): { readonly inRoot: string[][]; readonly inSlot: string[][] } => ({
  inRoot: [["clone", "-q", "--no-hardlinks", "--no-checkout", root, slotOf(root)]],
  inSlot: [
    ["remote", "set-url", "origin", ORIGIN_URL],
    ["update-ref", "refs/remotes/origin/main", sha],
    ["checkout", "-q", "--detach", sha],
  ],
});

export const makeSlot = (root: string): string => {
  git(["fetch", "origin"], root);
  const sha = git(["rev-parse", "origin/main"], root);
  const slot = slotOf(root);
  rmSync(slot, { recursive: true, force: true });
  const plan = makeSlotPlan(root, sha);
  for (const args of plan.inRoot) git(args, root);
  for (const args of plan.inSlot) git(args, slot);
  symlinkSync(join("..", "..", "..", "node_modules"), join(slot, "node_modules"));
  return slot;
};

export const readSlotBranch = (slot: string, issue: number): string | null => {
  try {
    if (!lstatSync(join(slot, ".git")).isDirectory()) return null;
    const head = join(slot, ".git", "HEAD");
    const info = lstatSync(head);
    if (!info.isFile() || info.size > MAX_HEAD_BYTES) return null;
    const branch = HEAD_TEXT.exec(readFileSync(head, "utf8"))?.[1];
    return branch !== undefined && isIssueBranch(branch, issue) ? branch : null;
  } catch {
    return null;
  }
};

export type Collected = { readonly branch: string | null; readonly problems: readonly string[] };

export const collect = (_root: string, _issue: number): Collected => ({ branch: null, problems: [] });
