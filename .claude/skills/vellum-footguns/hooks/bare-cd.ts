// The footgun hook's bare `cd` reader (Issue #781): a `cd`, `chdir`, `pushd` or `popd` the main session's own shell would run, and whether it moves the session to another directory inside the project; what it reads and where it errs are in README.md.
import { realpathSync } from "node:fs";
import { homedir } from "node:os";
import { resolve, sep } from "node:path";

const LEX = /\\\n|\\[\s\S]|\$'(?:[^'\\]|\\[\s\S])*'|'[^']*'|"(?:[^"\\]|\\[\s\S])*"|`(?:[^`\\]|\\[\s\S])*`|\$\(\((?:[^()]|\([^()]*\))*\)\)|(?<=^|[\s;&|)])#[^\n]*|(?<!<)<<(-?)[ \t]*(?:'([^'\n]*)'|"([^"\n]*)"|\\?([A-Za-z_][\w-]*))|\n/g;
const BOUNDARY = /\n|;|&&|\|\||\||(?<![<>])&(?!>)|\(|\)|\{(?=\s)|(?<=\s)\}|(?<![\w-])(?:if|then|do|else|elif|while|until|!)(?!\w)/g;
const WORD_PART = /'[^']*'|"(?:[^"\\]|\\[\s\S])*"|\\[\s\S]|[^'"\\]+/g;
const ASSIGNMENT = /^[A-Za-z_][A-Za-z0-9_]*=/;
const CD_OPTION = /^-[LPeqs@]+$/;
const SKIPPED = new Set(["builtin", "command", "time", "noglob", "nocorrect"]);
const VERBS = new Set(["cd", "chdir", "pushd", "popd"]);

type Pending = { delim: string; dash: boolean };

const blankHeredocs = (raw: string, at: number, pending: Pending[]): string => {
  let body = "";
  for (const { delim, dash } of pending) {
    const lines = raw.slice(at + body.length).split("\n");
    const stop = lines.findIndex((line) => (dash ? line.replace(/^\t+/, "") : line) === delim);
    body += (stop === -1 ? lines : lines.slice(0, stop + 1)).join("\n");
  }
  return body;
};

const mask = (raw: string): string => {
  let out = "";
  let at = 0;
  let pending: Pending[] = [];
  const lex = new RegExp(LEX);
  for (let m = lex.exec(raw); m; m = lex.exec(raw)) {
    out += raw.slice(at, m.index);
    at = m.index + m[0].length;
    if (m[0] === "\n") {
      const body = blankHeredocs(raw, at, pending);
      out += "\n" + body.replace(/[^\n]/g, " ");
      at += body.length;
      lex.lastIndex = at;
      pending = [];
    } else if (m[1] !== undefined) {
      pending.push({ delim: m[2] ?? m[3] ?? m[4] ?? "", dash: m[1] === "-" });
      out += m[0];
    } else out += (m[0] === "\\\n" || m[0].startsWith("#") ? " " : "_").repeat(m[0].length);
  }
  return out + raw.slice(at);
};

const topLevel = (masked: string): [number, number][] => {
  const spans: [number, number][] = [];
  let depth = 0;
  let start = 0;
  const close = (end: number, ender: string): void => {
    if (depth === 0 && ender !== "|" && ender !== "&") spans.push([start, end]);
  };
  for (const m of masked.matchAll(BOUNDARY)) {
    close(m.index, m[0]);
    if (m[0] === "(") depth += 1;
    else if (m[0] === ")") depth = Math.max(0, depth - 1);
    start = m.index + m[0].length;
  }
  close(masked.length, "");
  return spans;
};

const literal = (raw: string): string | null => {
  let out = "";
  let seen = 0;
  for (const [part] of raw.matchAll(WORD_PART)) {
    seen += part.length;
    if (part.startsWith("'")) out += part.slice(1, -1);
    else if (part.startsWith('"')) {
      if (/[$`\\]/.test(part)) return null;
      out += part.slice(1, -1);
    } else if (part.startsWith("\\")) out += part.slice(1);
    else if (/[$`*?[{]/.test(part)) return null;
    else out += part;
  }
  return seen === raw.length ? out : null;
};

const pathOf = (raw: string): string | null => {
  if (raw === "~" || raw.startsWith("~/")) {
    const rest = literal(raw.slice(1));
    return rest === null ? null : homedir() + rest;
  }
  return raw.startsWith("~") ? null : literal(raw);
};

const destination = (verb: string, args: string[]): string | null => {
  if (verb === "popd") return null;
  let rest = args;
  if (verb !== "pushd") {
    while (rest[0] !== undefined && CD_OPTION.test(rest[0])) rest = rest.slice(1);
    if (rest[0] === "--") rest = rest.slice(1);
    if (!rest.length) return homedir();
  }
  const only = rest[0];
  return rest.length !== 1 || only === undefined || /^[-+]/.test(only) ? null : pathOf(only);
};

const real = (path: string): string | null => {
  try {
    return realpathSync(path);
  } catch {
    return null;
  }
};

const within = (path: string, dir: string): boolean => path === dir || path.startsWith(dir + sep);

const outsideProject = (path: string, project: string): boolean => {
  const roots = [resolve(project), real(project)].filter((root): root is string => root !== null);
  return !roots.some((root) => within(path, root));
};

const verdict = (dest: string | null, cwd: string, project: string | undefined): string | null => {
  const here = cwd ? real(cwd) : null;
  if (dest === null || here === null) return "could move the main session to a directory the hook cannot work out";
  const lexical = resolve(cwd, dest);
  const there = real(lexical) ?? lexical;
  if (there === here) return null;
  if (!project) return `could move the main session to ${there}, and the hook cannot work out where the project is`;
  return outsideProject(there, project) ? null : `would move the main session to ${there}, inside the project`;
};

const commandWord = (words: string[]): number => {
  let afterPrecommand = false;
  for (let i = 0; i < words.length; i += 1) {
    const raw = words[i] ?? "";
    const word = literal(raw);
    if (word !== null && SKIPPED.has(word)) afterPrecommand = true;
    else if (!ASSIGNMENT.test(raw) && !(afterPrecommand && raw.startsWith("-"))) return i;
  }
  return words.length;
};

const REASON = (said: string, cwd: string, move: string): string =>
  `vellum-footguns: \`${said}\` ${move}, from ${cwd || "a directory the hook was not told"}, ` +
  "and every later relative path, `git` call and dispatched agent would then run there (Issue #781). Run it in a subshell with the path " +
  "spelled out, `( cd <path> && ... )`, or use `git -C <path>` or an absolute path. A `cd` to where you stand, or out of the project, " +
  "passes, and a subagent is never refused. If the session has already moved, ask Alex to type `/cd <path>` to bring it back.";

export const bareCdReason = (command: string, cwd: string, project: string | undefined): string | null => {
  const masked = mask(command);
  for (const [start, end] of topLevel(masked)) {
    const words = [...masked.slice(start, end).matchAll(/\S+/g)].map((w) => command.slice(start + w.index, start + w.index + w[0].length));
    const i = commandWord(words);
    const verb = literal(words[i] ?? "");
    if (verb === null || !VERBS.has(verb)) continue;
    const move = verdict(destination(verb, words.slice(i + 1)), cwd, project);
    if (move !== null) return REASON(words.slice(i).join(" "), cwd, move);
  }
  return null;
};
