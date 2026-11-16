import { appendFileSync, readFileSync } from "node:fs";
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
  join(tmpdir(), `vellum-footguns-${(sessionId || "nosession").replace(/[^A-Za-z0-9_-]/g, "")}.txt`);

export const shownGates = (sessionId: string): Set<string> => {
  try {
    return new Set(
      readFileSync(statePath(sessionId), "utf8")
        .split("\n")
        .filter((key) => key !== ""),
    );
  } catch {
    return new Set();
  }
};

export const rememberGate = (sessionId: string, gate: string): void => {
  try {
    appendFileSync(statePath(sessionId), `${gate}\n`);
  } catch {
    /* state is a convenience; a missing tmpdir only repeats a gate */
  }
};
