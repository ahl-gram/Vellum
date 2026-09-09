#!/usr/bin/env python3
"""PreToolUse hook for the vellum-footguns skill.

Two jobs, both at the moment of typing rather than at session start:
  1. inject the gate that matches the file about to be edited, the new file about to be created, or
     the push about to happen (once per gate per session);
  2. refuse the mechanical never-list: a bare mutation of the shared stash stack, perl -i with a
     non-ASCII replacement, a single-escaped regex class inside a backtick string in a browser-driving
     script, and a PR or issue body with an em-dash or a negated closing keyword.

Refusals look at the command in COMMAND position only (the first word of each shell segment), so a
grep for "git stash" or a PR comment that quotes the rule is not refused; a PR body that quotes
"does not close #N" IS refused, because GitHub parses quoted text the same way.

Blind spots, named with their direction: a regex inside a single- or double-quoted JS string loses
its backslash the same way and is not scanned (an apostrophe in prose would open a false span, so
the scanner errs toward silence there); a body passed through a variable or a pipe is not read.

Python rather than TypeScript, stated per CLAUDE.md's one-pipeline rule: this is harness tooling, not
product code; it runs on every tool call, where /usr/bin/python3 starts in tens of milliseconds; and the
session hooks in ~/.claude/hooks are Python already.

Reads the hook JSON on stdin, writes a PreToolUse decision on stdout, always exits 0.
`--selftest` runs the fixtures at the bottom; its exit code is the number of misses.
"""
import json
import os
import re
import sys
import tempfile
from pathlib import Path

SKILL = Path(__file__).resolve().parent.parent / "SKILL.md"

EDIT_GATES = (
    ("guard", re.compile(r"(^|/)test/.*\.test\.ts$"), "Gate 1"),
    ("e2e", re.compile(r"(^|/)(scripts|out)/.*\.mjs$"), "Gate 2"),
    ("css", re.compile(r"\.(css|astro)$"), "Gate 3"),
)
ROSTER_NEW_FILE = re.compile(r"(^|/)(src/pages/|src/site/|scripts/e2e/suite-|public/[^/]+\.css$)")
BROWSER_SCRIPT = re.compile(r"(^|/)(scripts|out)/.*\.mjs$")
REDIRECT_INTO_SCRIPT = re.compile(r"(>>?|\btee\b)\s*[\"']?\S*(scripts|out)/\S*\.mjs")
TEMPLATE_SPAN = re.compile(r"`([^`]*)`", re.S)
SILENT_ESCAPE = re.compile(r"(?<!\\)\\[sSdDwWbB.]")
NOISY_ESCAPE = re.compile(r"(?<!\\)\\[()\[\]{}+*?|^/]")
SEGMENT_SPLIT = re.compile(r"\n|;|&&|\|\||\||\$\(|\(")
STASH_REF = re.compile(r"\s(stash@\{\d+\}|[0-9a-f]{7,40})(\s|$)")
PERL_INPLACE = re.compile(r"^perl\b[^|;&]*\s-[0a-zA-Z]*i\b")
GH_BODY_WRITE = re.compile(r"^gh\s+(pr|issue)\s+(create|edit|comment)\b")
GH_PR_WRITE = re.compile(r"^gh\s+pr\s+(create|edit)\b")
BODY_FILE = re.compile(r"(?:--body-file|-F)[=\s]+[\"']?([^\s\"']+)")
BODY_SUBSHELL = re.compile(r"\$\(\s*(?:cat\s+|<\s*)([^\s)\"']+)\s*\)")
NEGATED_CLOSE = re.compile(
    r"(?i)(\bnot|\bnever|n't|\bno|\bwithout)\s+(clos(e|es|ed|ing)|fix(es|ed|ing)?|resolv(e|es|ed|ing))\s+#\d+"
)
EM_DASH = "—"


def gate_text(label):
    text = SKILL.read_text(encoding="utf-8")
    for section in text.split("\n## ")[1:]:
        if section.startswith(label):
            return "## " + section.strip()
    return ""


def state_path(session_id):
    safe = re.sub(r"[^A-Za-z0-9_-]", "", session_id or "nosession")
    return Path(tempfile.gettempdir()) / f"vellum-footguns-{safe}.json"


def shown_gates(session_id):
    try:
        return set(json.loads(state_path(session_id).read_text()))
    except Exception:
        return set()


def remember_gate(session_id, gate):
    try:
        state_path(session_id).write_text(json.dumps(sorted(shown_gates(session_id) | {gate})))
    except Exception:
        pass


def deny(reason):
    return {
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": reason,
        }
    }


def context(text):
    return {"hookSpecificOutput": {"hookEventName": "PreToolUse", "additionalContext": text}}


def gate_note(session_id, gate, label, lead):
    if gate in shown_gates(session_id):
        return None
    body = gate_text(label)
    if not body:
        return None
    remember_gate(session_id, gate)
    return f"{lead} Run this gate before you type; the full skill is `vellum-footguns`.\n\n{body}"


def segments(command):
    return [s.strip() for s in SEGMENT_SPLIT.split(command) if s.strip()]


def edit_fragment(tool_input):
    parts = [str(tool_input.get("content") or ""), str(tool_input.get("new_string") or "")]
    for edit in tool_input.get("edits") or []:
        if isinstance(edit, dict):
            parts.append(str(edit.get("new_string") or ""))
    return "\n".join(p for p in parts if p)


def escape_refusal(text, where):
    for span in TEMPLATE_SPAN.findall(text):
        hit = SILENT_ESCAPE.search(span)
        if hit:
            near = span[max(0, hit.start() - 30): hit.end() + 30].replace("\n", " ")
            return deny(
                f"vellum-footguns: `{hit.group()}` inside a backtick string in {where} reaches the browser "
                f"with its backslash gone (`\\s` splits on the letter s, `\\.` matches any char) and never "
                f"throws. Write `\\\\{hit.group()[1:]}` or build the payload with String.raw. Near: ...{near}..."
            )
    return None


def escape_warning(text):
    if any(NOISY_ESCAPE.search(span) for span in TEMPLATE_SPAN.findall(text)):
        return ("a punctuation escape inside a backtick string loses its backslash before the browser sees "
                "it; if that span is a regex, double the backslash or use String.raw.")
    return None


def check_edit(payload, session_id):
    tool_input = payload.get("tool_input") or {}
    path = str(tool_input.get("file_path") or "")
    fragment = edit_fragment(tool_input)
    notes = []

    if BROWSER_SCRIPT.search(path):
        refusal = escape_refusal(fragment, path)
        if refusal:
            return refusal
        notes.append(escape_warning(fragment))
        if ".click()" in fragment:
            notes.append(
                "`.click()` ignores pointer-events and everything painted over the target (#520, #545, #546). "
                "A gesture check drives with clickAt/touch at the element's own rect and asserts "
                "elementFromPoint; keep `.click()` for wiring only, with the reason at the check."
            )

    if payload.get("tool_name") == "Write" and ROSTER_NEW_FILE.search(path) and not os.path.exists(path):
        notes.append(gate_note(session_id, "roster", "Gate 4", f"You are about to create {path}."))
    for gate, pattern, label in EDIT_GATES:
        if pattern.search(path):
            notes.append(gate_note(session_id, gate, label, f"You are about to edit {path}."))
            break

    notes = [n for n in notes if n]
    return context("\n\n".join(notes)) if notes else None


def stash_refusal(segment):
    if not segment.startswith("git stash"):
        return None
    rest = segment[len("git stash"):].strip()
    verb = rest.split(" ", 1)[0] if rest else ""
    if verb in ("list", "show", "branch", "create", "store"):
        return None
    if verb == "push" and re.search(r"\s(-m|--message)\b", rest):
        return None
    if verb in ("apply", "drop") and STASH_REF.search(" " + rest):
        return None
    return deny(
        "vellum-footguns: refs/stash is shared across every worktree in this repo, so any bare mutation of "
        "it (stash, push without -m, pop, apply or drop without an explicit ref, clear) can take or destroy "
        "another session's work. Use `git stash push -m <why> -- <paths>`, restore with `git stash apply "
        "<sha>`, drop by that ref, or set work aside with a WIP commit."
    )


def read_relative(name, cwd):
    candidate = Path(os.path.expanduser(name))
    if not candidate.is_absolute():
        candidate = Path(cwd or ".") / candidate
    return candidate.read_text(encoding="utf-8")


def body_text(command, cwd):
    body, unread = command, []
    for pattern in (BODY_FILE, BODY_SUBSHELL):
        for match in pattern.finditer(command):
            try:
                body += "\n" + read_relative(match.group(1), cwd)
            except Exception:
                unread.append(match.group(1))
    return body, unread


def gh_refusal(segment, command, cwd):
    if not GH_BODY_WRITE.search(segment):
        return None, None
    body, unread = body_text(command, cwd)
    if EM_DASH in body:
        return deny("vellum-footguns: the body carries an em-dash; the house forbids them in issue and PR bodies."), None
    if GH_PR_WRITE.search(segment):
        hit = NEGATED_CLOSE.search(body)
        if hit:
            return deny(
                f"vellum-footguns: GitHub reads \"{hit.group()}\" as a CLOSING reference (the keyword beside "
                f"the number wins, the negation is ignored; #486 and #524 both closed an issue this way). "
                f"Say it without the keyword, e.g. \"#N stays open\"."
            ), None
    warning = None
    if unread:
        warning = (f"vellum-footguns could not read the body file(s) {', '.join(unread)} from {cwd or 'the cwd'}, "
                   f"so the em-dash and closing-keyword checks did not run on them. Grep them yourself.")
    return None, warning


def check_bash(payload, session_id):
    command = str((payload.get("tool_input") or {}).get("command") or "")
    cwd = str(payload.get("cwd") or "")
    notes = []

    for segment in segments(command):
        refusal = stash_refusal(segment)
        if refusal:
            return refusal
        if PERL_INPLACE.search(segment) and (any(ord(c) > 127 for c in segment) or "\\x{" in segment):
            return deny(
                "vellum-footguns: `perl -i` with a non-ASCII replacement re-encodes every existing non-ASCII "
                "byte in the file (· becomes Â·) and only an unrelated test notices. Do the edit "
                "with a node script or a heredoc, then grep the file for Â."
            )
        refusal, warning = gh_refusal(segment, command, cwd)
        if refusal:
            return refusal
        notes.append(warning)

    if REDIRECT_INTO_SCRIPT.search(command):
        refusal = escape_refusal(command, "a script written from the shell")
        if refusal:
            return refusal

    if any(GH_PR_WRITE.search(s) or s.startswith("git push") for s in segments(command)):
        notes.append(gate_note(session_id, "push", "Gate 5", "You are about to push or write a PR body."))
    if re.search(r"^pkill\b.*(brave|chrom)", command, re.I | re.M):
        notes.append(
            "vellum-footguns: every killed e2e run leaves a browser profile under tmpdir (446 of them, "
            "20GB, on 2026-09-08). Let the run finish, or sweep `/var/folders/*/*/T/vellum-e2e-*` after."
        )
    notes = [n for n in notes if n]
    return context("\n\n".join(notes)) if notes else None


def decide(payload):
    tool = payload.get("tool_name")
    session_id = str(payload.get("session_id") or "")
    if tool in ("Edit", "Write", "MultiEdit"):
        return check_edit(payload, session_id)
    if tool == "Bash":
        return check_bash(payload, session_id)
    return None


def main():
    try:
        result = decide(json.load(sys.stdin))
        if result:
            print(json.dumps(result))
    except Exception:
        pass
    sys.exit(0)


def bash(command, cwd=None):
    payload = {"tool_name": "Bash", "tool_input": {"command": command}}
    if cwd:
        payload["cwd"] = cwd
    return payload


def edit(tool, path, text, **extra):
    key = "content" if tool == "Write" else "new_string"
    return {"tool_name": tool, "tool_input": {"file_path": path, key: text, **extra}}


HERE = str(Path(__file__).resolve().parent)
FIXTURES = [
    ("bare stash denied", bash("git stash"), "deny", "shared"),
    ("stash pop denied", bash("git stash pop"), "deny", "shared"),
    ("stash clear denied", bash("git stash clear"), "deny", "shared"),
    ("stash apply without ref denied", bash("git stash apply"), "deny", "shared"),
    ("stash apply with sha allowed", bash("git stash apply 0123abcd"), None, ""),
    ("stash drop by ref allowed", bash("git stash drop stash@{2}"), None, ""),
    ("named stash allowed", bash("git stash push -u -m 'tag' -- src/a.ts"), None, ""),
    ("stash list allowed", bash("git stash list --format='%H %gs'"), None, ""),
    ("grep for git stash allowed", bash("grep -rn 'git stash' .claude/"), None, ""),
    ("pr comment quoting the rule allowed", bash("gh pr comment 549 --body 'never use a bare git stash here'"), None, ""),
    ("perl wide char denied", bash("perl -0pi -e 's/a/−/' f.ts"), "deny", "re-encodes"),
    ("perl x-escape denied", bash("perl -pi -e 's/a/\\x{2212}/' f.ts"), "deny", "re-encodes"),
    ("perl ascii allowed", bash("perl -pi -e 's/foo/bar/' f.ts"), None, ""),
    ("grep mentioning perl -pi allowed", bash("grep -n 'perl -pi −' notes.md"), None, ""),
    ("pr body negated close denied", bash("gh pr create --body 'this PR does not close #518'"), "deny", "CLOSING"),
    ("pr body em-dash denied", bash("gh pr edit 5 --body 'a — b'"), "deny", "em-dash"),
    ("issue body em-dash denied", bash("gh issue create --title t --body 'a — b'"), "deny", "em-dash"),
    ("pr comment em-dash denied", bash("gh pr comment 5 --body 'a — b'"), "deny", "em-dash"),
    ("issue comment negated close allowed", bash("gh issue comment 5 --body 'does not close #3'"), None, ""),
    ("pr body via subshell cat read", bash("gh pr create --body \"$(cat body.md)\"", HERE), "deny", "em-dash"),
    ("relative body-file resolved against cwd", bash("gh pr create --body-file body.md", HERE), "deny", "em-dash"),
    ("unreadable body-file warns", bash("gh pr create --body-file nope.md", "/"), "context", "could not read"),
    ("pr body clean gets gate 5 once", bash("gh pr create --body 'Closes #519. #518 stays open.'"), "context", "## Gate 5"),
    ("git push gets gate 5 once", bash("git push -u origin footguns-skill"), "context", "## Gate 5"),
    ("git status gets nothing", bash("git status"), None, ""),
    ("heredoc into e2e denied", bash("cat > scripts/e2e/suite-x.mjs <<'EOF'\nconst R = `x.split(/\\s+/)`;\nEOF"), "deny", "backtick"),
    ("heredoc into out probe denied", bash("cat > out/probe.mjs <<'EOF'\nawait evaluate(`a.match(/b\\.c/)`)\nEOF"), "deny", "backtick"),
    ("e2e single-escaped class denied", edit("Write", "scripts/e2e/suite-x.mjs", "const R = `(() => 'a b'.split(/\\s+/))()`;"), "deny", "backtick"),
    ("e2e single-escaped dot denied", edit("Edit", "scripts/e2e/suite-x.mjs", "await evaluate(`x.match(/a\\.b/)`)"), "deny", "backtick"),
    ("multiedit edits[] denied", {"tool_name": "MultiEdit", "tool_input": {"file_path": "scripts/e2e/suite-x.mjs", "edits": [{"old_string": "a", "new_string": "`split(/\\s/)`"}]}}, "deny", "backtick"),
    ("out probe single-escaped denied", edit("Write", "out/probe-x.mjs", "const P = `s.replace(/\\s+/g, ' ')`;"), "deny", "backtick"),
    ("e2e double-escaped gets gate 2", edit("Write", "scripts/e2e/suite-x.mjs", "const R = `(() => 'a b'.split(/\\\\s+/))()`;"), "context", "## Gate 2"),
    ("e2e regex literal outside backticks gets gate 2", edit("Write", "scripts/e2e/suite-x.mjs", "const a = s.match(/\\s+/);"), "context", "## Gate 2"),
    ("e2e .click() warns", edit("Edit", "scripts/e2e/suite-x.mjs", "el.click();"), "context", "pointer-events"),
    ("unit test file gets gate 1", edit("Edit", "test/site/thing.test.ts", "assert.ok(1);"), "context", "## Gate 1"),
    ("stylesheet gets gate 3", edit("Edit", "public/atelier.css", ".a { color: red }"), "context", "## Gate 3"),
    ("new page gets gate 4", edit("Write", "src/pages/never-exists-zz/index.astro", "---\n---"), "context", "## Gate 4"),
    ("engine source gets nothing", edit("Edit", "src/world/generate.ts", "x"), None, ""),
]


def selftest():
    fails = 0
    (Path(HERE) / "body.md").write_text("a — b\n", encoding="utf-8")
    for label in ("Gate 1", "Gate 2", "Gate 3", "Gate 4", "Gate 5"):
        ok = len(gate_text(label)) > 200
        fails += not ok
        print(f"{'ok  ' if ok else 'FAIL'} {label} text found in SKILL.md")
    for name, payload, want, needle in FIXTURES:
        payload = {**payload, "session_id": f"selftest-{os.getpid()}-{name}"}
        got = decide(payload)
        kind, text = None, ""
        if got:
            out = got["hookSpecificOutput"]
            kind = "deny" if out.get("permissionDecision") == "deny" else "context"
            text = out.get("permissionDecisionReason") or out.get("additionalContext") or ""
        ok = kind == want and (needle in text)
        fails += not ok
        print(f"{'ok  ' if ok else 'FAIL'} {name}: want {want} with {needle!r}, got {kind}")
        try:
            state_path(payload["session_id"]).unlink()
        except Exception:
            pass
    (Path(HERE) / "body.md").unlink()
    sys.exit(fails)


if __name__ == "__main__":
    selftest() if "--selftest" in sys.argv else main()
