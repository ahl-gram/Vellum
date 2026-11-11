import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";

export const DOC_DIRS: readonly string[] = ["handbook/", ".claude/agents/", ".claude/skills/vellum-footguns/references/"];
export const DOC_FILES: readonly string[] = [
  "AGENTS.md",
  "CLAUDE.md",
  "README.md",
  ".github/PULL_REQUEST_TEMPLATE.md",
  ".claude/skills/vellum-footguns/SKILL.md",
  ".claude/skills/vellum-footguns/hooks/README.md",
];
export const OUTPUT_KEY = "docs_only";

export type Verdict = { readonly docsOnly: boolean; readonly changed: readonly string[]; readonly reason: string };

export const isDoc = (_path: string): boolean => true;

export const docsOnly = (_event: string, changed: readonly string[] | null): boolean =>
  changed !== null && changed.every(isDoc);

export const changedPaths = (dir: string): string[] | null =>
  execFileSync("git", ["diff", "--name-only", "HEAD^1", "HEAD"], {
    cwd: dir,
    encoding: "utf8",
    timeout: 30_000,
    stdio: ["ignore", "pipe", "pipe"],
  })
    .split("\n")
    .filter((p) => p !== "");

export const verdict = (event: string, dir: string): Verdict => ({
  docsOnly: docsOnly(event, changedPaths(dir)),
  changed: changedPaths(dir) ?? [],
  reason: "stub",
});

const main = (): void => {
  const v = verdict(process.env["GITHUB_EVENT_NAME"] ?? "", process.cwd());
  for (const path of v.changed) console.log(`${isDoc(path) ? "doc " : "code"} ${path}`);
  console.log(`docs-only: ${v.docsOnly}: ${v.reason}`);
  const out = process.env["GITHUB_OUTPUT"];
  if (out) appendFileSync(out, `${OUTPUT_KEY}=${v.docsOnly}\n`);
};

if (import.meta.main) main();
