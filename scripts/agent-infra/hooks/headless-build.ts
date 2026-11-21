import { GIT_GLOBAL_WITH_VALUE } from "./shell-text.ts";

export const HEADLESS_BUILD_VAR = "VELLUM_HEADLESS_BUILD";
export const HOOK_CHECK = "git push --dry-run origin HEAD:refs/heads/handoff-hook-check";
export const headlessBuildOf = (env: Readonly<Record<string, string | undefined>>): boolean =>
  (env[HEADLESS_BUILD_VAR] ?? "") !== "";

export const HEADLESS_REASON =
  "vellum-footguns: this is a headless Codex build, which `npm run handoff` launched with VELLUM_HEADLESS_BUILD set and no GitHub login. A headless build commits, and never pushes, opens or edits a pull request, writes to GitHub or sends a proof run, and it runs each command bare: no `gh` call at all, no shell handed a command (`bash -c`, `sh`, `zsh`), no `eval` or `source`, no `git -c`, no `git config` that writes, no `git credential` or keychain read, and no command or subcommand word in quotes, split by a backslash or built by a variable or a substitution, and no command that names a GIT_, GH_ or GITHUB_ variable (Alex, 2026-11-20, Issue #1409). The Claude Code session that launched it pushes and posts once the build stops. Commit and go on: read the issue from the files your prompt names, and write anything that would be posted to the file your prompt names.";

const SHELLS = new Set(["sh", "bash", "zsh", "dash", "ksh", "fish", "csh", "tcsh"]);
const PACKAGE_RUNNERS = new Set(["npm", "npx", "pnpm", "yarn"]);
const SCRIPT_RUNNERS = new Set(["node", "npx", "tsx", "ts-node", "bun", "deno", "pnpm", "yarn"]);
const KEYCHAIN_READS = new Set(["find-internet-password", "find-generic-password", "dump-keychain", "export"]);
const CONFIG_READS = new Set(["--get", "--get-all", "--get-regexp", "--get-urlmatch", "--list", "-l", "get", "list"]);
const PUSHES = new Set(["push", "send-pack", "http-push", "receive-pack"]);
const CONFIG_SCOPES = new Set(["--global", "--local", "--system", "--worktree", "--show-origin", "-z", "--null"]);
const PLAIN = /^~?[A-Za-z0-9._/-]+$/;
const LEADERS = new Set(["!", "{", "(", "time", "if", "while", "until", "case", "then", "do", "elif", "else"]);
const DISGUISED = /^""[A-Za-z]|^[A-Za-z_](?![A-Za-z0-9_]*=)[^\s]*["\\]/;
const ASSIGNMENT = /^[A-Za-z_][A-Za-z0-9_]*=/;
const TEST_BRACKETS = new Set(["[", "[["]);
const SUBCOMMAND = /^[a-z0-9-]+$/;
const GIT_HELPER = /^git-[a-z0-9-]+$/;
const GIT_FLAGS = new Set([
  "--no-pager",
  "-p",
  "--paginate",
  "-P",
  "--bare",
  "--no-replace-objects",
  "--literal-pathspecs",
  "--glob-pathspecs",
  "--noglob-pathspecs",
  "--icase-pathspecs",
  "--no-optional-locks",
  "--no-lazy-fetch",
  "--version",
  "--help",
  "-h",
]);
const GIT_VALUED = new Set([...[...GIT_GLOBAL_WITH_VALUE].filter((name) => name !== "--exec-path"), "--attr-source"]);
const WRAPPERS = new Set(["command", "exec", "env", "nohup", "nice", "timeout", "stdbuf", "sudo", "xargs", "parallel"]);
const FEEDERS = new Set(["xargs", "parallel"]);
const NUMBER = /^\d+[smhd]?$/;
const LOGIN_ENV = /(?:GIT|GH|GITHUB)_/;
const SETTERS = new Set([
  "export",
  "declare",
  "typeset",
  "readonly",
  "local",
  "read",
  "unset",
  "let",
  "getopts",
  "mapfile",
  "readarray",
]);
const OPTION_CLUSTER = /^-?[A-Za-z]*$/;
const PLAIN_ASSIGNMENT = /^[A-Za-z_][A-Za-z0-9_]*(=[A-Za-z0-9_./:@%+,-]*)?$/;
const EVALUATORS = new Set(["eval", "source", "trap"]);
const PACKAGE_VERBS = new Set(["run", "run-script", "rum", "urn", "exec", "x", "dlx"]);
const TRIM = /^[`'"(){};]+|[`'"(){};]+$/g;

const gitRefused = (raw: readonly string[], tokens: readonly string[], at: number): boolean => {
  let i = at + 1;
  while (i < raw.length && (raw[i] ?? "").startsWith("-")) {
    const option = raw[i] ?? "";
    const name = option.split("=")[0] ?? "";
    if (name === "-c" || name === "--config-env") return true;
    if (!GIT_FLAGS.has(name) && !GIT_VALUED.has(name)) return true;
    i += GIT_VALUED.has(option) ? 2 : 1;
  }
  const sub = raw[i] ?? "";
  const written = tokens[i] ?? "";
  if (!SUBCOMMAND.test(sub) || /["'\\$`]/.test(written)) return true;
  if (raw.slice(i).some((w) => PUSHES.has(w) || w.startsWith("credential"))) return true;
  if (sub !== "config") return false;
  const verb = raw.slice(i + 1).find((w) => !CONFIG_SCOPES.has(w)) ?? "";
  return !CONFIG_READS.has(verb);
};

const wrappedWordIsPlain = (tokens: readonly string[]): boolean =>
  tokens.every((token, at) => {
    if (!WRAPPERS.has((token.split("/").at(-1) ?? "").toLowerCase())) return true;
    const word = tokens.slice(at + 1).find((t) => !t.startsWith("-") && !NUMBER.test(t) && !ASSIGNMENT.test(t));
    return word === undefined || PLAIN.test(word);
  });

export const headlessEnvRefusal = (command: string): string | null =>
  LOGIN_ENV.test(command) ? HEADLESS_REASON : null;

const commandWordOf = (tokens: readonly string[]): string =>
  (tokens.find((t) => !LEADERS.has(t) && !t.startsWith("-") && !NUMBER.test(t)) ?? "").replace(/^\(+|[)};]+$/g, "");

const quotedProofName = (words: readonly string[], tokens: readonly string[], at: number): boolean => {
  const word = words[at] ?? "";
  if (SCRIPT_RUNNERS.has(word) && tokens[at + 1] === '""') return true;
  if (!PACKAGE_RUNNERS.has(word)) return false;
  return tokens.slice(at + 1).find((t) => !t.startsWith("-") && !PACKAGE_VERBS.has(t)) === '""';
};

const commandWordIsPlain = (tokens: readonly string[]): boolean => {
  const word = commandWordOf(tokens);
  return word === "" || PLAIN.test(word) || ASSIGNMENT.test(word) || TEST_BRACKETS.has(word);
};

const settersWithEscapes = (tokens: readonly string[]): boolean => {
  const at = tokens.findIndex((t) => !LEADERS.has(t) && !t.startsWith("-") && !NUMBER.test(t));
  const word = tokens[at] ?? "";
  const args = tokens.slice(at + 1);
  const sets =
    SETTERS.has(word) ||
    (word === "set" && args.some((t) => /^[-+][A-Za-z]*[aA]/.test(t) || t === "-o" || t === "+o")) ||
    (word === "printf" && args.includes("-v"));
  return sets && !args.every((t) => OPTION_CLUSTER.test(t) || PLAIN_ASSIGNMENT.test(t));
};

const LONE_AMPERSAND = /(?<![&>|])&(?![&>])/;

const segmentRefused = (segment: string): boolean => {
  const tokens = segment.split(" ");
  const raw = tokens.map((t) => t.replace(TRIM, ""));
  const words = raw.map((t) => (t.split("/").at(-1) ?? "").toLowerCase());
  return (
    tokens.some((t) => DISGUISED.test(t)) ||
    !commandWordIsPlain(tokens) ||
    !wrappedWordIsPlain(tokens) ||
    settersWithEscapes(tokens) ||
    (words.some((w) => FEEDERS.has(w)) && words.includes("git")) ||
    words.some((w) => GIT_HELPER.test(w)) ||
    commandWordOf(tokens) === "." ||
    words.some((w, i) => EVALUATORS.has(w) || quotedProofName(words, tokens, i)) ||
    words.some(
      (w, i) =>
        w === "gh" ||
        SHELLS.has(w) ||
        (w === "git" && gitRefused(raw, tokens, i)) ||
        (w === "security" && words.slice(i + 1).some((x) => KEYCHAIN_READS.has(x))) ||
        (PACKAGE_RUNNERS.has(w) && words.slice(i + 1).includes("proof")) ||
        ((raw[i] ?? "").toLowerCase().endsWith("proof-runner/main.ts") &&
          words.slice(0, i).some((x) => SCRIPT_RUNNERS.has(x))),
    )
  );
};

export const headlessRefusal = (segment: string): string | null =>
  segment.split(LONE_AMPERSAND).some((part) => segmentRefused(part.trim())) ? HEADLESS_REASON : null;
