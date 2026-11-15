import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const skillPath = (policyRoot: string): string =>
  join(policyRoot, ".claude", "skills", "vellum-footguns", "SKILL.md");
export const templatePath = (policyRoot: string): string => join(policyRoot, ".github", "PULL_REQUEST_TEMPLATE.md");

export const gateText = (policyRoot: string, label: string): string => {
  const section = readFileSync(skillPath(policyRoot), "utf8")
    .split("\n## ")
    .slice(1)
    .find((s) => s.startsWith(label));
  return section ? "## " + section.trim() : "";
};

export const statePath = (sessionId: string): string =>
  join(tmpdir(), `vellum-footguns-${(sessionId || "nosession").replace(/[^A-Za-z0-9_-]/g, "")}.json`);

export const shownGates = (sessionId: string): Set<string> => {
  try {
    return new Set(JSON.parse(readFileSync(statePath(sessionId), "utf8")) as string[]);
  } catch {
    return new Set();
  }
};

export const rememberGate = (sessionId: string, gate: string): void => {
  try {
    writeFileSync(statePath(sessionId), JSON.stringify([...shownGates(sessionId), gate].sort()));
  } catch {
    /* state is a convenience; a missing tmpdir only repeats a gate */
  }
};
