import { join } from "node:path";

export const ORIGIN_URL = "https://github.com/ahl-gram/Vellum.git";

export const slotOf = (root: string): string => join(root, ".claude", "worktrees", "codex-build");

export const handoffRefOf = (issue: number): string => `refs/handoff/${issue}`;

export const slotHolder = (_root: string, _issue: number): number | null => null;

export const makeSlot = (root: string): string => slotOf(root);

export const readSlotBranch = (_slot: string, _issue: number): string | null => null;
