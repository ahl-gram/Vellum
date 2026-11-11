import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";

export const DOC_DIRS: readonly string[] = [
  "handbook/",
  ".claude/agents/",
  ".claude/skills/vellum-footguns/references/",
];
export const DOC_FILES: readonly string[] = [
  "AGENTS.md",
  "CLAUDE.md",
  "README.md",
  ".github/PULL_REQUEST_TEMPLATE.md",
  ".claude/skills/vellum-footguns/SKILL.md",
  ".claude/skills/comment-sweep/SKILL.md",
  ".claude/skills/vellum-footguns/hooks/README.md",
];
export const OUTPUT_KEY = "docs_only";

export type Verdict = { readonly docsOnly: boolean; readonly changed: readonly string[]; readonly reason: string };

// Blind spot, with its direction: nothing reads whether the build or a browser check opens a listed file, so a list that grows past what they read lets a docs-only pull request merge with its lanes unbuilt, and main's own run, which runs every lane, is where that shows (handbook/specs/site-architecture.md).
export const isDoc = (path: string): boolean =>
  DOC_FILES.includes(path) || DOC_DIRS.some((dir) => path.startsWith(dir));

export const isUnsafePath = (path: string): boolean =>
  Array.from(path).some((ch) => {
    const c = ch.codePointAt(0) ?? 0;
    return c < 0x20 || c === 0x7f || c === 0x85 || c === 0x2028 || c === 0x2029;
  });

export const docsOnly = (event: string, changed: readonly string[] | null): boolean =>
  event === "pull_request" && changed !== null && changed.length > 0 && changed.every(isDoc);

const git = (args: string[], dir: string): string =>
  execFileSync("git", args, { cwd: dir, encoding: "utf8", timeout: 30_000, stdio: ["ignore", "pipe", "pipe"] });

export const changedPaths = (dir: string): string[] | null => {
  const shas = git(["rev-list", "--parents", "-n", "1", "HEAD"], dir).trim().split(/\s+/);
  if (shas.length !== 3) return null;
  return git(["diff", "--name-only", "--no-renames", "-z", "HEAD^1", "HEAD"], dir)
    .split("\0")
    .filter((p) => p !== "");
};

export const verdict = (event: string, dir: string): Verdict => {
  if (event !== "pull_request") {
    return { docsOnly: false, changed: [], reason: `a ${event || "run with no event name"} runs every lane` };
  }
  let changed: string[] | null;
  try {
    changed = changedPaths(dir);
  } catch (error) {
    return {
      docsOnly: false,
      changed: [],
      reason: `the changed files could not be read (${String(error).split("\n")[0]}), so every lane runs`,
    };
  }
  if (changed === null) {
    return {
      docsOnly: false,
      changed: [],
      reason: "HEAD is not a merge commit with two parents, so the changed files are unread and every lane runs",
    };
  }
  if (changed.some(isUnsafePath)) {
    return {
      docsOnly: false,
      changed: [],
      reason:
        "a changed path holds a line break or another control character, so no path is printed and every lane runs",
    };
  }
  const off = changed.filter((p) => !isDoc(p));
  const reason = docsOnly(event, changed)
    ? `every one of the ${changed.length} changed files is a doc, so this lane skips its build and browser steps`
    : changed.length === 0
      ? "the diff is empty, so every lane runs"
      : `${off.length} of the ${changed.length} changed files are not docs (the first is ${off[0]}), so every lane runs`;
  return { docsOnly: docsOnly(event, changed), changed, reason };
};

const main = (): void => {
  const v = verdict(process.env["GITHUB_EVENT_NAME"] ?? "", process.cwd());
  for (const path of v.changed) console.log(isDoc(path) ? `doc  ${path}` : `code ${path}`);
  console.log(`docs-only: ${v.docsOnly}: ${v.reason}`);
  const out = process.env["GITHUB_OUTPUT"];
  if (out) appendFileSync(out, `${OUTPUT_KEY}=${v.docsOnly}\n`);
};

if (import.meta.main) main();
