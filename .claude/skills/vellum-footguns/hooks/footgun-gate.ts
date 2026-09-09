/**
 * PreToolUse hook for the vellum-footguns skill. Node runs it natively (`node footgun-gate.ts`); it is
 * harness tooling under .claude/, typed by `npm run check` through the tsconfig include, not product code.
 *
 * Two jobs, both at the moment of typing rather than at session start: inject the gate that matches the
 * file about to be edited, the new file about to be created, or the push about to happen (once per gate
 * per session); and refuse the mechanical never-list (a bare mutation of the shared stash stack, perl -i
 * with a non-ASCII replacement, a single-escaped regex class inside a backtick string in a browser-driving
 * script, and a PR or issue body with an em-dash or a negated closing keyword).
 *
 * Refusals read the command in COMMAND position only (the first word of each shell segment), so a grep
 * for "git stash" or a PR comment that quotes the rule passes; a PR body that quotes "does not close #N"
 * IS refused, because GitHub parses quoted text the same way.
 *
 * Blind spots, named with their direction: a regex inside a single- or double-quoted JS string loses its
 * backslash the same way and is not scanned (an apostrophe in prose would open a false span, so the
 * scanner errs toward silence there); a body passed through a variable or a pipe is not read.
 *
 * Reads the hook JSON on stdin, writes a PreToolUse decision on stdout, always exits 0.
 * `--selftest` runs the fixtures at the bottom; its exit code is the number of misses.
 */
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type ToolInput = {
  file_path?: string;
  content?: string;
  new_string?: string;
  command?: string;
  edits?: { new_string?: string }[];
};
type Payload = { tool_name?: string; session_id?: string; cwd?: string; tool_input?: ToolInput };
type Output = { hookEventName: "PreToolUse"; permissionDecision?: "deny"; permissionDecisionReason?: string; additionalContext?: string };
type Decision = { hookSpecificOutput: Output } | null;

const HERE = dirname(fileURLToPath(import.meta.url));
const SKILL = resolve(HERE, "..", "SKILL.md");

const EDIT_GATES: [string, RegExp, string][] = [
  ["guard", /(^|\/)test\/.*\.test\.ts$/, "Gate 1"],
  ["e2e", /(^|\/)(scripts|out)\/.*\.mjs$/, "Gate 2"],
  ["css", /\.(css|astro)$/, "Gate 3"],
];
const ROSTER_NEW_FILE = /(^|\/)(src\/pages\/|src\/site\/|scripts\/e2e\/suite-|public\/[^/]+\.css$)/;
const BROWSER_SCRIPT = /(^|\/)(scripts|out)\/.*\.mjs$/;
const REDIRECT_INTO_SCRIPT = /(>>?|\btee\b)\s*["']?\S*(scripts|out)\/\S*\.mjs/;
const TEMPLATE_SPAN = /`([^`]*)`/gs;
const SILENT_ESCAPE = /(?<!\\)\\[sSdDwWbB.]/;
const NOISY_ESCAPE = /(?<!\\)\\[()[\]{}+*?|^/]/;
const SEGMENT_SPLIT = /\n|;|&&|\|\||\||\$\(|\(/;
const STASH_REF = /\s(stash@\{\d+\}|[0-9a-f]{7,40})(\s|$)/;
const PERL_INPLACE = /^perl\b[^|;&]*\s-[0a-zA-Z]*i\b/;
const GH_BODY_WRITE = /^gh\s+(pr|issue)\s+(create|edit|comment)\b/;
const GH_PR_WRITE = /^gh\s+pr\s+(create|edit)\b/;
const BODY_FILE = /(?:--body-file|-F)[=\s]+["']?([^\s"']+)/g;
const BODY_SUBSHELL = /\$\(\s*(?:cat\s+|<\s*)([^\s)"']+)\s*\)/g;
const NEGATED_CLOSE = /(\bnot|\bnever|n't|\bno|\bwithout)\s+(clos(e|es|ed|ing)|fix(es|ed|ing)?|resolv(e|es|ed|ing))\s+#\d+/i;
const EM_DASH = "—";

const gateText = (label: string): string => {
  const section = readFileSync(SKILL, "utf8").split("\n## ").slice(1).find((s) => s.startsWith(label));
  return section ? "## " + section.trim() : "";
};

const statePath = (sessionId: string): string =>
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

const segments = (command: string): string[] => command.split(SEGMENT_SPLIT).map((s) => s.trim()).filter(Boolean);

const editFragment = (input: ToolInput): string =>
  [input.content ?? "", input.new_string ?? "", ...(input.edits ?? []).map((e) => e?.new_string ?? "")].filter(Boolean).join("\n");

const spans = (text: string): string[] => [...text.matchAll(TEMPLATE_SPAN)].map((m) => m[1] ?? "");

const escapeRefusal = (text: string, where: string): Decision => {
  for (const span of spans(text)) {
    const hit = SILENT_ESCAPE.exec(span);
    if (!hit) continue;
    const near = span.slice(Math.max(0, hit.index - 30), hit.index + hit[0].length + 30).replace(/\n/g, " ");
    return deny(
      `vellum-footguns: \`${hit[0]}\` inside a backtick string in ${where} reaches the browser with its backslash gone ` +
        `(\`\\s\` splits on the letter s, \`\\.\` matches any char) and never throws. Write \`\\\\${hit[0].slice(1)}\` or build ` +
        `the payload with String.raw. Near: ...${near}...`,
    );
  }
  return null;
};

const escapeWarning = (text: string): string | null =>
  spans(text).some((s) => NOISY_ESCAPE.test(s))
    ? "a punctuation escape inside a backtick string loses its backslash before the browser sees it; if that span is a regex, double the backslash or use String.raw."
    : null;

const CLICK_WARNING =
  "`.click()` ignores pointer-events and everything painted over the target (#520, #545, #546). A gesture check drives with " +
  "clickAt/touch at the element's own rect and asserts elementFromPoint; keep `.click()` for wiring only, with the reason at the check.";

const checkEdit = (payload: Payload, sessionId: string): Decision => {
  const input = payload.tool_input ?? {};
  const path = input.file_path ?? "";
  const fragment = editFragment(input);
  const notes: (string | null)[] = [];

  if (BROWSER_SCRIPT.test(path)) {
    const refusal = escapeRefusal(fragment, path);
    if (refusal) return refusal;
    notes.push(escapeWarning(fragment));
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
  if (!segment.startsWith("git stash")) return null;
  const rest = segment.slice("git stash".length).trim();
  const verb = rest.split(" ", 1)[0] ?? "";
  if (["list", "show", "branch", "create", "store"].includes(verb)) return null;
  if (verb === "push" && /\s(-m|--message)\b/.test(rest)) return null;
  if (["apply", "drop"].includes(verb) && STASH_REF.test(" " + rest)) return null;
  return deny(STASH_REASON);
};

const PERL_REASON =
  "vellum-footguns: `perl -i` with a non-ASCII replacement re-encodes every existing non-ASCII byte in the file (· becomes " +
  "Â·) and only an unrelated test notices. Do the edit with a node script or a heredoc, then grep the file for Â.";

const perlRefusal = (segment: string): Decision =>
  PERL_INPLACE.test(segment) && (/[^\x00-\x7f]/.test(segment) || segment.includes("\\x{")) ? deny(PERL_REASON) : null;

const readRelative = (name: string, cwd: string): string => {
  const expanded = name.startsWith("~/") ? join(process.env.HOME ?? "", name.slice(2)) : name;
  return readFileSync(isAbsolute(expanded) ? expanded : join(cwd || ".", expanded), "utf8");
};

const bodyText = (command: string, cwd: string): { body: string; unread: string[] } => {
  let body = command;
  const unread: string[] = [];
  for (const pattern of [BODY_FILE, BODY_SUBSHELL]) {
    for (const match of command.matchAll(pattern)) {
      const name = match[1] ?? "";
      try {
        body += "\n" + readRelative(name, cwd);
      } catch {
        unread.push(name);
      }
    }
  }
  return { body, unread };
};

const ghRefusal = (segment: string, command: string, cwd: string): [Decision, string | null] => {
  if (!GH_BODY_WRITE.test(segment)) return [null, null];
  const { body, unread } = bodyText(command, cwd);
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
  const warning = unread.length
    ? `vellum-footguns could not read the body file(s) ${unread.join(", ")} from ${cwd || "the cwd"}, so the em-dash and ` +
      `closing-keyword checks did not run on them. Grep them yourself.`
    : null;
  return [null, warning];
};

const PKILL_WARNING =
  "vellum-footguns: every killed e2e run leaves a browser profile under tmpdir (446 of them, 20GB, on 2026-09-08). Let the run " +
  "finish, or sweep `/var/folders/*/*/T/vellum-e2e-*` after.";

const checkBash = (payload: Payload, sessionId: string): Decision => {
  const command = payload.tool_input?.command ?? "";
  const cwd = payload.cwd ?? "";
  const notes: (string | null)[] = [];
  const parts = segments(command);

  for (const segment of parts) {
    const refusal = stashRefusal(segment) ?? perlRefusal(segment);
    if (refusal) return refusal;
    const [ghDeny, warning] = ghRefusal(segment, command, cwd);
    if (ghDeny) return ghDeny;
    notes.push(warning);
  }
  if (REDIRECT_INTO_SCRIPT.test(command)) {
    const refusal = escapeRefusal(command, "a script written from the shell");
    if (refusal) return refusal;
  }
  if (parts.some((s) => GH_PR_WRITE.test(s) || s.startsWith("git push"))) {
    notes.push(gateNote(sessionId, "push", "Gate 5", "You are about to push or write a PR body."));
  }
  if (/^pkill\b.*(brave|chrom)/im.test(command)) notes.push(PKILL_WARNING);

  const kept = notes.filter((n): n is string => Boolean(n));
  return kept.length ? context(kept.join("\n\n")) : null;
};

export const decide = (payload: Payload): Decision => {
  const sessionId = payload.session_id ?? "";
  if (["Edit", "Write", "MultiEdit"].includes(payload.tool_name ?? "")) return checkEdit(payload, sessionId);
  if (payload.tool_name === "Bash") return checkBash(payload, sessionId);
  return null;
};

const main = (): void => {
  try {
    const result = decide(JSON.parse(readFileSync(0, "utf8")) as Payload);
    if (result) process.stdout.write(JSON.stringify(result));
  } catch {
    /* a malformed payload or a missing SKILL.md fails open */
  }
  process.exit(0);
};

const bash = (command: string, cwd?: string): Payload => ({ tool_name: "Bash", tool_input: { command }, ...(cwd ? { cwd } : {}) });
const edit = (tool: string, path: string, text: string): Payload => ({
  tool_name: tool,
  tool_input: { file_path: path, ...(tool === "Write" ? { content: text } : { new_string: text }) },
});
const multi = (path: string, text: string): Payload => ({ tool_name: "MultiEdit", tool_input: { file_path: path, edits: [{ new_string: text }] } });

type Fixture = [string, Payload, "deny" | "context" | null, string];
const FIXTURES: Fixture[] = [
  ["bare stash denied", bash("git stash"), "deny", "shared"],
  ["stash pop denied", bash("git stash pop"), "deny", "shared"],
  ["stash clear denied", bash("git stash clear"), "deny", "shared"],
  ["stash apply without ref denied", bash("git stash apply"), "deny", "shared"],
  ["stash apply with sha allowed", bash("git stash apply 0123abcd"), null, ""],
  ["stash drop by ref allowed", bash("git stash drop stash@{2}"), null, ""],
  ["named stash allowed", bash("git stash push -u -m 'tag' -- src/a.ts"), null, ""],
  ["stash list allowed", bash("git stash list --format='%H %gs'"), null, ""],
  ["grep for git stash allowed", bash("grep -rn 'git stash' .claude/"), null, ""],
  ["pr comment quoting the rule allowed", bash("gh pr comment 549 --body 'never use a bare git stash here'"), null, ""],
  ["perl wide char denied", bash("perl -0pi -e 's/a/−/' f.ts"), "deny", "re-encodes"],
  ["perl x-escape denied", bash("perl -pi -e 's/a/\\x{2212}/' f.ts"), "deny", "re-encodes"],
  ["perl ascii allowed", bash("perl -pi -e 's/foo/bar/' f.ts"), null, ""],
  ["grep mentioning perl -pi allowed", bash("grep -n 'perl -pi −' notes.md"), null, ""],
  ["pr body negated close denied", bash("gh pr create --body 'this PR does not close #518'"), "deny", "CLOSING"],
  ["pr body em-dash denied", bash("gh pr edit 5 --body 'a — b'"), "deny", "em-dash"],
  ["issue body em-dash denied", bash("gh issue create --title t --body 'a — b'"), "deny", "em-dash"],
  ["pr comment em-dash denied", bash("gh pr comment 5 --body 'a — b'"), "deny", "em-dash"],
  ["issue comment negated close allowed", bash("gh issue comment 5 --body 'does not close #3'"), null, ""],
  ["pr body via subshell cat read", bash('gh pr create --body "$(cat body.md)"', HERE), "deny", "em-dash"],
  ["relative body-file resolved against cwd", bash("gh pr create --body-file body.md", HERE), "deny", "em-dash"],
  ["unreadable body-file warns", bash("gh pr create --body-file nope.md", "/"), "context", "could not read"],
  ["pr body clean gets gate 5 once", bash("gh pr create --body 'Closes #519. #518 stays open.'"), "context", "## Gate 5"],
  ["git push gets gate 5 once", bash("git push -u origin footguns-skill"), "context", "## Gate 5"],
  ["git status gets nothing", bash("git status"), null, ""],
  ["heredoc into e2e denied", bash("cat > scripts/e2e/suite-x.mjs <<'EOF'\nconst R = `x.split(/\\s+/)`;\nEOF"), "deny", "backtick"],
  ["heredoc into out probe denied", bash("cat > out/probe.mjs <<'EOF'\nawait evaluate(`a.match(/b\\.c/)`)\nEOF"), "deny", "backtick"],
  ["e2e single-escaped class denied", edit("Write", "scripts/e2e/suite-x.mjs", "const R = `(() => 'a b'.split(/\\s+/))()`;"), "deny", "backtick"],
  ["e2e single-escaped dot denied", edit("Edit", "scripts/e2e/suite-x.mjs", "await evaluate(`x.match(/a\\.b/)`)"), "deny", "backtick"],
  ["multiedit edits[] denied", multi("scripts/e2e/suite-x.mjs", "`split(/\\s/)`"), "deny", "backtick"],
  ["out probe single-escaped denied", edit("Write", "out/probe-x.mjs", "const P = `s.replace(/\\s+/g, ' ')`;"), "deny", "backtick"],
  ["e2e double-escaped gets gate 2", edit("Write", "scripts/e2e/suite-x.mjs", "const R = `(() => 'a b'.split(/\\\\s+/))()`;"), "context", "## Gate 2"],
  ["e2e regex literal outside backticks gets gate 2", edit("Write", "scripts/e2e/suite-x.mjs", "const a = s.match(/\\s+/);"), "context", "## Gate 2"],
  ["e2e .click() warns", edit("Edit", "scripts/e2e/suite-x.mjs", "el.click();"), "context", "pointer-events"],
  ["unit test file gets gate 1", edit("Edit", "test/site/thing.test.ts", "assert.ok(1);"), "context", "## Gate 1"],
  ["stylesheet gets gate 3", edit("Edit", "public/atelier.css", ".a { color: red }"), "context", "## Gate 3"],
  ["new page gets gate 4", edit("Write", "src/pages/never-exists-zz/index.astro", "---\n---"), "context", "## Gate 4"],
  ["engine source gets nothing", edit("Edit", "src/world/generate.ts", "x"), null, ""],
];

const selftest = (): void => {
  let fails = 0;
  const report = (ok: boolean, line: string): void => {
    fails += ok ? 0 : 1;
    console.log(`${ok ? "ok  " : "FAIL"} ${line}`);
  };
  writeFileSync(join(HERE, "body.md"), "a — b\n");
  for (const label of ["Gate 1", "Gate 2", "Gate 3", "Gate 4", "Gate 5"]) report(gateText(label).length > 200, `${label} text found in SKILL.md`);
  for (const [name, payload, want, needle] of FIXTURES) {
    const sessionId = `selftest-${process.pid}-${name}`;
    const got = decide({ ...payload, session_id: sessionId });
    const out = got?.hookSpecificOutput;
    const kind = out ? (out.permissionDecision === "deny" ? "deny" : "context") : null;
    const text = out?.permissionDecisionReason ?? out?.additionalContext ?? "";
    report(kind === want && text.includes(needle), `${name}: want ${want} with ${JSON.stringify(needle)}, got ${kind}`);
    try {
      unlinkSync(statePath(sessionId));
    } catch {
      /* nothing was written for a null decision */
    }
  }
  unlinkSync(join(HERE, "body.md"));
  process.exit(fails);
};

if (process.argv.includes("--selftest")) selftest();
else if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
