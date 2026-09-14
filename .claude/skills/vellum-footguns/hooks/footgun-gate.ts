/**
 * PreToolUse hook for the vellum-footguns skill: injects the matching gate once per session and refuses the
 * mechanical never-list. What it refuses, warns on, and cannot see is in README.md; the fixtures are in
 * footgun-gate.selftest.ts. TypeScript run natively by Node the way scripts/*.ts run; harness tooling under
 * .claude/, typed by npm run check through the tsconfig include.
 */
import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type * as TS from "typescript";

export type ToolInput = {
  file_path?: string;
  content?: string;
  new_string?: string;
  command?: string;
  edits?: { new_string?: string }[];
};
export type Payload = { tool_name?: string; session_id?: string; cwd?: string; tool_input?: ToolInput };
type Output = { hookEventName: "PreToolUse"; permissionDecision?: "deny"; permissionDecisionReason?: string; additionalContext?: string };
export type Decision = { hookSpecificOutput: Output } | null;

const HERE = dirname(fileURLToPath(import.meta.url));
const SKILL = resolve(HERE, "..", "SKILL.md");
const TEMPLATE = resolve(HERE, "..", "..", "..", "..", ".github", "PULL_REQUEST_TEMPLATE.md");

const EDIT_GATES: [string, RegExp, string][] = [
  ["guard", /(^|\/)test\/.*\.test\.ts$/, "Gate 1"],
  ["e2e", /(^|\/)(scripts|out)\/.*\.mjs$/, "Gate 2"],
  ["css", /\.(css|astro)$/, "Gate 3"],
  ["render", /(^|\/)(src\/(render|world|society|core|noise|terrain|climate|hydrology)\/|src\/(atlas\/palette|cli\/raster)\.ts$|public\/(charts\/|og\.png$|favicon\.svg$|apple-touch-icon\.png$)|scripts\/(hero-charts|regen-hero-charts|build-og|build-icons|glyph-outline)\.ts$)/, "Gate 6"], // derived by walking imports, not guessed: src/render, generateWorld's seven-dir closure, the committed artifacts, and every module their writers reach
];
const ROSTER_NEW_FILE = /(^|\/)(src\/pages\/|src\/site\/|scripts\/e2e\/suite-|public\/[^/]+\.css$)/;
const BROWSER_SCRIPT = /(^|\/)(scripts|out)\/.*\.mjs$/;
const REDIRECT_INTO_SCRIPT = /(>>?|\btee\b)\s*["']?\S*(scripts|out)\/\S*\.mjs/;
const SILENT_ESCAPE = /(?<!\\)\\[sSdDwWbB.]/;
const NOISY_ESCAPE = /(?<!\\)\\[()[\]{}+*?|^/]/;
const QUOTED = /'[^']*'|"(?:[^"\\]|\\.)*"/g;
const HEREDOC = /<<-?\s*['"]?(\w+)['"]?\n([\s\S]*?)\n\1(?=\n|$)/g;
const SEPARATORS = /\n|;|&&|\|\||\||\$\(|\(|\{\s|\s\}|\bthen\b|\bdo\b|\belse\b|\belif\b/;
const PREFIX = /^(?:(?:env|command|time|exec|sudo|nohup|nice|builtin)\s+|[A-Za-z_][A-Za-z0-9_]*=\S*\s+)+/;
const GIT_GLOBAL_WITH_VALUE = new Set(["-C", "-c", "--git-dir", "--work-tree", "--namespace", "--exec-path"]);
const PERL_INPLACE = /^perl\b.*\s-[0a-zA-Z]*i\b/;
const PERL_PIPE_PATTERN = /\bs\|[^|]*\\\|/;
const GH_BODY_WRITE = /^gh (pr|issue) (create|edit|comment)\b/;
const GH_API_CALL = /^gh api\b/;
const GH_API_BARE_ITEM = /(?:^|\s)(?:https:\/\/[^\s/]+\/)?\/?repos\/[^\s/]+\/[^\s/]+\/(?:issues|pulls)\/\d+\/?(?=\s|$)/;
// `gh api` has no short flag other than -f and -F starting with either letter, so those take no trailing boundary and catch the glued `-fbody=x`, while the long names keep `\b` so a longer flag cannot match one of them as a prefix.
const GH_API_FIELD = /(?:^|\s)(?:-[fF]|--(?:raw-field|field|input)\b)/;
const GH_API_METHOD = /(?:^|\s)(?:-X|--method)[=\s]*(\w+)/;
const GH_PR_WRITE = /^gh pr (create|edit)\b/;
const BODY_FILE = /(?:--body-file|-F)[=\s]+["']?([^\s"'=]+)(?=[\s"']|$)/g;
const BODY_SUBSHELL = /\$\(\s*(?:cat\s+|<\s*)([^\s)"']+)\s*\)/g;
const NEGATED_CLOSE = /(\bnot|\bnever|n't|\bno|\bwithout)\s+(clos(e|es|ed|ing)|fix(es|ed|ing)?|resolv(e|es|ed|ing))\s+(?:[\w.-]+\/[\w.-]+)?#\d+/i;
const EM_DASH = "—";
const INLINE_BODY = /(^|\s)(--body|-b)(=|\s)/;
const UNRESOLVED_EXPANSION = /\$(?!\(\s*(?:cat\s|<))/;
const SINGLE_QUOTED = /'[^']*'/g;

export const gateText = (label: string): string => {
  const section = readFileSync(SKILL, "utf8").split("\n## ").slice(1).find((s) => s.startsWith(label));
  return section ? "## " + section.trim() : "";
};

export const statePath = (sessionId: string): string =>
  join(tmpdir(), `vellum-footguns-${(sessionId || "nosession").replace(/[^A-Za-z0-9_-]/g, "")}.json`);

const shownGates = (sessionId: string): Set<string> => {
  try {
    return new Set(JSON.parse(readFileSync(statePath(sessionId), "utf8")) as string[]);
  } catch {
    return new Set();
  }
};

const rememberGate = (sessionId: string, gate: string): void => {
  try {
    writeFileSync(statePath(sessionId), JSON.stringify([...shownGates(sessionId), gate].sort()));
  } catch {
    /* state is a convenience; a missing tmpdir only repeats a gate */
  }
};

const deny = (reason: string): Decision => ({
  hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: reason },
});
const context = (text: string): Decision => ({ hookSpecificOutput: { hookEventName: "PreToolUse", additionalContext: text } });

const gateNote = (sessionId: string, gate: string, label: string, lead: string): string | null => {
  if (shownGates(sessionId).has(gate)) return null;
  const body = gateText(label);
  if (!body) return null;
  rememberGate(sessionId, gate);
  return `${lead} Run this gate before you type; the full skill is \`vellum-footguns\`.\n\n${body}`;
};

const heredocBodies = (command: string): string[] => [...command.matchAll(HEREDOC)].map((m) => m[2] ?? "");

const commandSegments = (command: string): string[] =>
  command
    .replace(HEREDOC, "")
    .replace(QUOTED, '""')
    .split(SEPARATORS)
    .map((s) => s.replace(PREFIX, "").trim().replace(/\s+/g, " "))
    .filter(Boolean);

const gitCall = (segment: string): { sub: string; rest: string } | null => {
  const t = segment.split(" ");
  if (t[0] !== "git") return null;
  let i = 1;
  while (i < t.length && (t[i] ?? "").startsWith("-")) i += GIT_GLOBAL_WITH_VALUE.has(t[i] ?? "") ? 2 : 1;
  const sub = t[i];
  return sub ? { sub, rest: t.slice(i + 1).join(" ") } : null;
};

const editFragment = (input: ToolInput): string =>
  [input.content ?? "", input.new_string ?? "", ...(input.edits ?? []).map((e) => e?.new_string ?? "")].filter(Boolean).join("\n");

const templateRawTexts = async (text: string): Promise<string[] | null> => {
  let ts: typeof TS;
  try {
    const mod: unknown = await import("typescript");
    ts = ((mod as { default?: typeof TS }).default ?? mod) as typeof TS;
  } catch {
    return null;
  }
  const tagOf = (n: TS.Node): string => {
    const p = n.parent;
    if (p && ts.isTaggedTemplateExpression(p)) return p.tag.getText();
    const g = p?.parent;
    return p && ts.isTemplateExpression(p) && g && ts.isTaggedTemplateExpression(g) ? g.tag.getText() : "";
  };
  const raws: string[] = [];
  const walk = (n: TS.Node): void => {
    const literal = ts.isNoSubstitutionTemplateLiteral(n) || ts.isTemplateHead(n) || ts.isTemplateMiddle(n) || ts.isTemplateTail(n);
    if (literal && tagOf(n) !== "String.raw") raws.push(n.rawText ?? "");
    ts.forEachChild(n, walk);
  };
  walk(ts.createSourceFile("fragment.mjs", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS));
  return raws;
};

const SCAN_SKIPPED = "vellum-footguns: the typescript package could not be loaded, so the backtick escape scan was skipped; check any regex inside a template literal by hand.";
const NOISY_WARNING = "a punctuation escape inside a backtick string loses its backslash before the browser sees it; if that span is a regex, double the backslash or use String.raw.";

const escapeScan = async (text: string, where: string): Promise<{ refusal: Decision; note: string | null }> => {
  const raws = await templateRawTexts(text);
  if (raws === null) return { refusal: null, note: SCAN_SKIPPED };
  for (const raw of raws) {
    const hit = SILENT_ESCAPE.exec(raw);
    if (!hit) continue;
    const near = raw.slice(Math.max(0, hit.index - 30), hit.index + hit[0].length + 30).replace(/\n/g, " ");
    return {
      refusal: deny(
        `vellum-footguns: \`${hit[0]}\` inside a backtick string in ${where} reaches the browser with its backslash gone ` +
          `(\`\\s\` splits on the letter s, \`\\.\` matches any char) and never throws. Write \`\\\\${hit[0].slice(1)}\` or build ` +
          `the payload with String.raw. Near: ...${near}...`,
      ),
      note: null,
    };
  }
  return { refusal: null, note: raws.some((r) => NOISY_ESCAPE.test(r)) ? NOISY_WARNING : null };
};

const CLICK_WARNING =
  "`.click()` ignores pointer-events and everything painted over the target (#520, #545, #546). A gesture check drives with " +
  "clickAt/touch at the element's own rect and asserts elementFromPoint; keep `.click()` for wiring only, with the reason at the check.";

const checkEdit = async (payload: Payload, sessionId: string): Promise<Decision> => {
  const input = payload.tool_input ?? {};
  const path = input.file_path ?? "";
  const fragment = editFragment(input);
  const notes: (string | null)[] = [];

  if (BROWSER_SCRIPT.test(path)) {
    const { refusal, note } = await escapeScan(fragment, path);
    if (refusal) return refusal;
    notes.push(note);
    if (fragment.includes(".click()")) notes.push(CLICK_WARNING);
  }
  if (payload.tool_name === "Write" && ROSTER_NEW_FILE.test(path) && !existsSync(path)) {
    notes.push(gateNote(sessionId, "roster", "Gate 4", `You are about to create ${path}.`));
  }
  const gate = EDIT_GATES.find(([, pattern]) => pattern.test(path));
  if (gate) notes.push(gateNote(sessionId, gate[0], gate[2], `You are about to edit ${path}.`));

  const kept = notes.filter((n): n is string => Boolean(n));
  return kept.length ? context(kept.join("\n\n")) : null;
};

const STASH_REASON =
  "vellum-footguns: refs/stash is shared across every worktree in this repo, so any bare mutation of it (stash, push without -m, " +
  "pop, apply or drop without an explicit ref, clear) can take or destroy another session's work. Use `git stash push -m <why> -- " +
  "<paths>`, restore with `git stash apply <sha>`, drop by that ref, or set work aside with a WIP commit.";

const stashRefusal = (segment: string): Decision => {
  const call = gitCall(segment);
  if (!call || call.sub !== "stash") return null;
  const verb = call.rest.split(" ")[0] ?? "";
  if (["list", "show", "branch", "create", "store"].includes(verb)) return null;
  if (verb === "push" && /(^|\s)(-m|--message)(\s|=|$)/.test(call.rest)) return null;
  if (["apply", "drop"].includes(verb) && /\s(stash@\{\d+\}|[0-9a-f]{7,40})(\s|$)/.test(" " + call.rest)) return null;
  return deny(STASH_REASON);
};

const PERL_REASON =
  "vellum-footguns: `perl -i` with a non-ASCII replacement re-encodes every existing non-ASCII byte in the file (· becomes " +
  "Â·) and only an unrelated test notices. Do the edit with a node script or a heredoc, then grep the file for Â.";

const PERL_PIPE_REASON =
  "vellum-footguns: a `|`-delimited `s|...|...|` whose PATTERN carries `\\|` reads it as an escaped DELIMITER, so the pattern " +
  "unescapes to an alternation with an EMPTY BRANCH, matches at offset zero of every input, and the replacement lands at the head " +
  "of the file with the target untouched, exit 0. Measured 2026-09-14: the same shape under `+`, `!` and `#` delimiters leaves the " +
  "input unchanged, so the pipe is the one delimiter that does this. Use another delimiter, or a node script or a heredoc.";

const perlRefusal = (segment: string, command: string): Decision => {
  if (!PERL_INPLACE.test(segment)) return null;
  if (/[^\x00-\x7f]/.test(command) || command.includes("\\x{")) return deny(PERL_REASON);
  return PERL_PIPE_PATTERN.test(command) ? deny(PERL_PIPE_REASON) : null;
};

const GH_API_WRITE_REASON =
  "vellum-footguns: a data field (`-f`, `-F`, `--raw-field`, `--field`, `--input`) switches `gh api` to POST, and a POST to the " +
  "bare issue or pull-request endpoint UPDATES that item rather than commenting on it: the fields you send overwrite what is " +
  "there, nothing is created, and it exits 0 (#193, PR #550). Put `/comments` on the path, use `gh issue comment N --body-file " +
  "<file>`, or say `-X PATCH` when editing the item IS the intent. The tell afterwards is a response `html_url` ending " +
  "`/issues/N` instead of `#issuecomment-<id>`.";

const ghApiWriteRefusal = (segment: string): Decision => {
  if (!GH_API_CALL.test(segment) || !GH_API_BARE_ITEM.test(segment) || !GH_API_FIELD.test(segment)) return null;
  const method = GH_API_METHOD.exec(segment)?.[1] ?? "";
  return method === "" || method.toUpperCase() === "POST" ? deny(GH_API_WRITE_REASON) : null;
};

const readRelative = (name: string, cwd: string): string => {
  const expanded = name.startsWith("~/") ? join(process.env.HOME ?? "", name.slice(2)) : name;
  return readFileSync(isAbsolute(expanded) ? expanded : join(cwd || ".", expanded), "utf8");
};

const bodyText = (command: string, cwd: string): { body: string; unread: string[]; fromBodyFlag: string[] } => {
  let body = command;
  const unread: string[] = [];
  const fromBodyFlag: string[] = [];
  for (const pattern of [BODY_FILE, BODY_SUBSHELL]) {
    for (const match of command.matchAll(pattern)) {
      const name = match[1] ?? "";
      try {
        body += "\n" + readRelative(name, cwd);
        if (pattern === BODY_FILE) fromBodyFlag.push(name);
      } catch {
        unread.push(name);
      }
    }
  }
  return { body, unread, fromBodyFlag };
};

export const requiredHeadings = (file: string = TEMPLATE): string[] | null => {
  let text: string;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    return null;
  }
  const headings = text.split("\n").map((line) => line.trim()).filter((line) => line.startsWith("## "));
  return headings.length ? headings : null;
};

const NO_TEMPLATE = (file: string, why: string): string =>
  `vellum-footguns: ${why} (${file}), so the PR body's section check did NOT run on this call; the em-dash and closing-keyword checks still did. ` +
  `Nothing is blocked, but nothing checked the body's shape either: restore the template, or read the sections off \`vellum-footguns\` Gate 5 yourself.`;

export const headingCheck = (body: string, file: string = TEMPLATE): { deny: string | null; warn: string | null } => {
  const need = requiredHeadings(file);
  if (!need) {
    return { deny: null, warn: NO_TEMPLATE(file, existsSync(file) ? "the PR template carries no `## ` heading" : "there is no PR template") };
  }
  const lines = new Set(body.split("\n").map((line) => line.trim()));
  const missing = need.filter((heading) => !lines.has(heading));
  if (!missing.length) return { deny: null, warn: null };
  return {
    deny:
      `vellum-footguns: the PR body skips ${missing.map((h) => `"${h}"`).join(", ")}. The shape in ${file} is the house record of what a PR claims, ` +
      `and a section that is absent is a claim never made rather than made and wrong. Presence is the whole check: ` +
      `"## Guards" followed by "None. This PR carries no test." is a valid section.`,
    warn: null,
  };
};

const ghRefusal = (segment: string, command: string, cwd: string): [Decision, string | null] => {
  if (!GH_BODY_WRITE.test(segment)) return [null, null];
  const { body, unread, fromBodyFlag } = bodyText(command, cwd);
  if (body.includes(EM_DASH)) {
    return [deny("vellum-footguns: the body carries an em-dash; the house forbids them in issue and PR bodies."), null];
  }
  const hit = GH_PR_WRITE.test(segment) ? NEGATED_CLOSE.exec(body) : null;
  if (hit) {
    return [
      deny(
        `vellum-footguns: GitHub reads "${hit[0]}" as a CLOSING reference (the keyword beside the number wins, the negation is ` +
          `ignored; #486 and #524 both closed an issue this way). Say it without the keyword, e.g. "#N stays open".`,
      ),
      null,
    ];
  }
  const warnings: string[] = [];
  if (unread.length) {
    warnings.push(
      `vellum-footguns could not read the body file(s) ${unread.join(", ")} from ${cwd || "the cwd"}, so the em-dash, ` +
        `closing-keyword and PR section checks did not run on them. Grep them yourself.`,
    );
  }
  const inline = INLINE_BODY.test(segment);
  // `$(cat f)` is read from ANY flag, which is right for the em-dash scan and wrong here: without the body-flag narrowing, `gh pr edit N --add-label "$(cat notes.md)"` reads as a PR body and is refused for skipping sections it was never meant to carry.
  const supplied = inline || fromBodyFlag.length > 0;
  const readable = !unread.length && !(inline && UNRESOLVED_EXPANSION.test(command.replace(SINGLE_QUOTED, "''")));
  if (GH_PR_WRITE.test(segment) && supplied && readable) {
    const { deny: missing, warn } = headingCheck(body);
    if (missing) return [deny(missing), null];
    if (warn) warnings.push(warn);
  }
  return [null, warnings.length ? warnings.join("\n\n") : null];
};

const PKILL_WARNING =
  "vellum-footguns: every killed e2e run leaves a browser profile under tmpdir (446 of them, 20GB, on 2026-09-08). Let the run " +
  "finish, or sweep `/var/folders/*/*/T/vellum-e2e-*` after.";

const checkBash = async (payload: Payload, sessionId: string): Promise<Decision> => {
  const command = payload.tool_input?.command ?? "";
  const cwd = payload.cwd ?? "";
  const notes: (string | null)[] = [];
  const parts = commandSegments(command);

  for (const segment of parts) {
    const refusal = stashRefusal(segment) ?? perlRefusal(segment, command) ?? ghApiWriteRefusal(segment);
    if (refusal) return refusal;
    const [ghDeny, warning] = ghRefusal(segment, command, cwd);
    if (ghDeny) return ghDeny;
    notes.push(warning);
  }
  if (REDIRECT_INTO_SCRIPT.test(command)) {
    const bodies = heredocBodies(command);
    const { refusal, note } = await escapeScan(bodies.length ? bodies.join("\n") : command, "a script written from the shell");
    if (refusal) return refusal;
    notes.push(note);
  }
  if (parts.some((s) => GH_PR_WRITE.test(s) || gitCall(s)?.sub === "push")) {
    notes.push(gateNote(sessionId, "push", "Gate 5", "You are about to push or write a PR body."));
  }
  if (parts.some((s) => /^pkill\b.*(brave|chrom)/i.test(s))) notes.push(PKILL_WARNING);

  const kept = notes.filter((n): n is string => Boolean(n));
  return kept.length ? context(kept.join("\n\n")) : null;
};

export const decide = async (payload: Payload): Promise<Decision> => {
  const sessionId = payload.session_id ?? "";
  if (["Edit", "Write", "MultiEdit"].includes(payload.tool_name ?? "")) return checkEdit(payload, sessionId);
  if (payload.tool_name === "Bash") return checkBash(payload, sessionId);
  return null;
};

const main = async (): Promise<void> => {
  try {
    const result = await decide(JSON.parse(readFileSync(0, "utf8")) as Payload);
    if (result) process.stdout.write(JSON.stringify(result));
  } catch {
    /* a malformed payload or a missing SKILL.md fails open */
  }
  process.exit(0);
};

const isEntry = (): boolean => {
  try {
    return process.argv[1] !== undefined && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
};

if (isEntry()) void main();
