import { GIT_GLOBAL_WITH_VALUE } from "./shell-text.ts";

export const HEADLESS_BUILD_VAR = "VELLUM_HEADLESS_BUILD";
export const HOOK_CHECK = "git push --dry-run origin HEAD:refs/heads/handoff-hook-check";
export const headlessBuildOf = (env: Readonly<Record<string, string | undefined>>): boolean =>
  (env[HEADLESS_BUILD_VAR] ?? "") !== "";

export const HEADLESS_REASON =
  "vellum-footguns: this is a headless Codex build, which `npm run handoff` launched with VELLUM_HEADLESS_BUILD set and no GitHub login. A headless build commits, and never pushes, opens or edits a pull request, writes to GitHub or sends a proof run, and it runs each command bare: no `gh` call at all, no shell handed a command (`bash -c`, `sh`, `zsh`), no `eval` or `source`, no `git -c`, no `git config` that writes, no `git credential` or keychain read, and no command or subcommand word in quotes or split by a backslash (Alex, 2026-11-20, Issue #1409). The Claude Code session that launched it pushes and posts once the build stops. Commit and go on: read the issue from the files your prompt names, and write anything that would be posted to the file your prompt names.";

const SHELLS = new Set(["sh", "bash", "zsh", "dash", "ksh", "fish", "csh", "tcsh"]);
const PACKAGE_RUNNERS = new Set(["npm", "npx", "pnpm", "yarn"]);
const SCRIPT_RUNNERS = new Set(["node", "npx", "tsx", "ts-node", "bun", "deno", "pnpm", "yarn"]);
const KEYCHAIN_READS = new Set(["find-internet-password", "find-generic-password", "dump-keychain", "export"]);
const CONFIG_READS = new Set(["--get", "--get-all", "--get-regexp", "--get-urlmatch", "--list", "-l", "get", "list"]);
const PUSHES = new Set(["push", "send-pack", "http-push", "receive-pack"]);
const CONFIG_SCOPES = new Set(["--global", "--local", "--system", "--worktree", "--show-origin", "-z", "--null"]);
const DISGUISED = /^[A-Za-z_](?![A-Za-z0-9_]*=)[^\s]*["\\]/;
const FIRST_WORDS = new Set(["eval", "source", "."]);
const TRIM = /^[`'"(){};]+|[`'"(){};]+$/g;

const gitRefused = (raw: readonly string[], tokens: readonly string[], at: number): boolean => {
  let i = at + 1;
  while (i < raw.length && (raw[i] ?? "").startsWith("-")) {
    const option = raw[i] ?? "";
    if (option === "-c" || option.startsWith("--config-env")) return true;
    i += GIT_GLOBAL_WITH_VALUE.has(option) ? 2 : 1;
  }
  const sub = raw[i] ?? "";
  if (/["\\]/.test(tokens[i] ?? "")) return true;
  if (PUSHES.has(sub) || sub.startsWith("credential")) return true;
  if (sub !== "config") return false;
  const verb = raw.slice(i + 1).find((w) => !CONFIG_SCOPES.has(w)) ?? "";
  return !CONFIG_READS.has(verb);
};

export const headlessRefusal = (segment: string): string | null => {
  const tokens = segment.split(" ");
  const raw = tokens.map((t) => t.replace(TRIM, ""));
  const words = raw.map((t) => t.split("/").at(-1) ?? "");
  const refused =
    segment.startsWith('""') ||
    tokens.some((t) => DISGUISED.test(t)) ||
    FIRST_WORDS.has(words[0] ?? "") ||
    words.some(
      (w, i) =>
        w === "gh" ||
        SHELLS.has(w) ||
        (w === "git" && gitRefused(raw, tokens, i)) ||
        (w === "security" && KEYCHAIN_READS.has(words[i + 1] ?? "")) ||
        (PACKAGE_RUNNERS.has(w) && words.slice(i + 1).includes("proof")) ||
        ((raw[i] ?? "").endsWith("proof-runner/main.ts") && words.slice(0, i).some((x) => SCRIPT_RUNNERS.has(x))),
    );
  return refused ? HEADLESS_REASON : null;
};
