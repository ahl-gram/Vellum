#!/usr/bin/env python3
"""PreToolUse hook for the vellum-footguns skill.

Two jobs, both at the moment of typing rather than at session start:
  1. inject the gate that matches the file about to be edited (once per gate per session);
  2. refuse the mechanical never-list (bare git stash, perl -pi with non-ASCII, a single-escaped
     regex class inside a backtick string in scripts/e2e, a PR body with an em-dash or a negated
     closing keyword).

Python rather than TypeScript, stated per CLAUDE.md's one-pipeline rule: this is harness tooling, not
product code; it runs on every tool call, where /usr/bin/python3 starts in tens of milliseconds; and the
session hooks in ~/.claude/hooks are Python already.

Reads the hook JSON on stdin, writes a PreToolUse decision on stdout, always exits 0.
`--selftest` runs the fixtures at the bottom and exits non-zero on any miss.
"""
import json
import os
import re
import sys
import tempfile
from pathlib import Path

SKILL = Path(__file__).resolve().parent.parent / "SKILL.md"

GATES = (
    ("guard", re.compile(r"(^|/)test/.*\.test\.ts$"), "Gate 1"),
    ("e2e", re.compile(r"(^|/)scripts/e2e(/|-).*\.mjs$"), "Gate 2"),
    ("css", re.compile(r"\.(css|astro)$"), "Gate 3"),
)
E2E_PATH = re.compile(r"(^|/)scripts/e2e(/|-).*\.mjs$")
TEMPLATE_SPAN = re.compile(r"`([^`]*)`", re.S)
SILENT_ESCAPE = re.compile(r"(?<!\\)\\[sSdDwWbB.]")
NOISY_ESCAPE = re.compile(r"(?<!\\)\\[()\[\]{}+*?|^/]")
BARE_STASH = re.compile(r"\bgit\s+stash\b(?!\s+(list|show|drop|pop|apply|clear|branch)\b)")
PERL_INPLACE = re.compile(r"\bperl\b[^|;&]*\s-[0a-zA-Z]*i\b")
GH_PR_WRITE = re.compile(r"\bgh\s+pr\s+(create|edit)\b")
BODY_FILE = re.compile(r"(?:--body-file|-F)[=\s]+([^\s\"']+)")
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
    shown = shown_gates(session_id) | {gate}
    try:
        state_path(session_id).write_text(json.dumps(sorted(shown)))
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


def check_edit(payload, session_id):
    tool_input = payload.get("tool_input") or {}
    path = str(tool_input.get("file_path") or "")
    fragment = str(tool_input.get("content") or tool_input.get("new_string") or "")
    notes = []

    if E2E_PATH.search(path):
        for span in TEMPLATE_SPAN.findall(fragment):
            hit = SILENT_ESCAPE.search(span)
            if hit:
                where = span[max(0, hit.start() - 30): hit.end() + 30].replace("\n", " ")
                return deny(
                    f"vellum-footguns: `{hit.group()}` inside a backtick string in {path} reaches the "
                    f"browser with its backslash gone (`\\s` splits on the letter s, `\\.` matches any "
                    f"char) and never throws. Write `\\\\{hit.group()[1:]}` or build the payload with "
                    f"String.raw. Near: ...{where}..."
                )
            if NOISY_ESCAPE.search(span):
                notes.append(
                    "a punctuation escape inside a backtick string loses its backslash before the browser "
                    "sees it; if that span is a regex, double the backslash or use String.raw."
                )
        if ".click()" in fragment:
            notes.append(
                "`.click()` ignores pointer-events and everything painted over the target (#520, #545, #546). "
                "A gesture check drives with clickAt/touch at the element's own rect and asserts "
                "elementFromPoint; keep `.click()` for wiring only, with the reason at the check."
            )

    for gate, pattern, label in GATES:
        if pattern.search(path) and gate not in shown_gates(session_id):
            remember_gate(session_id, gate)
            notes.append(
                f"You are about to edit {path}. Run this gate before you type; the full skill is "
                f"`vellum-footguns`.\n\n{gate_text(label)}"
            )
            break

    return context("\n\n".join(notes)) if notes else None


def pr_body_from(command):
    body = command
    for match in BODY_FILE.finditer(command):
        try:
            body += "\n" + Path(os.path.expanduser(match.group(1))).read_text(encoding="utf-8")
        except Exception:
            pass
    return body


def check_bash(payload, session_id):
    command = str((payload.get("tool_input") or {}).get("command") or "")

    if BARE_STASH.search(command) and not re.search(r"\s(-m|--message)\b", command):
        return deny(
            "vellum-footguns: refs/stash is shared across every worktree in this repo, so a bare "
            "`git stash` lands in a stack another session pops from. Use `git stash push -m <why> -- "
            "<paths>` or a WIP commit on the branch."
        )

    if PERL_INPLACE.search(command) and (any(ord(c) > 127 for c in command) or "\\x{" in command):
        return deny(
            "vellum-footguns: `perl -i` with a non-ASCII replacement re-encodes every existing non-ASCII "
            "byte in the file (· becomes Â·) and only an unrelated test notices. Do the edit with a node "
            "script or a heredoc, then `grep -n 'Â' <file>`."
        )

    if GH_PR_WRITE.search(command):
        body = pr_body_from(command)
        if EM_DASH in body:
            return deny("vellum-footguns: the PR body carries an em-dash; the house forbids them in PR bodies.")
        hit = NEGATED_CLOSE.search(body)
        if hit:
            return deny(
                f"vellum-footguns: GitHub reads \"{hit.group()}\" as a CLOSING reference (the keyword beside "
                f"the number wins, the negation is ignored; #486 and #524 both closed an issue this way). "
                f"Say it without the keyword, e.g. \"#N stays open\"."
            )

    if (GH_PR_WRITE.search(command) or re.search(r"\bgit\s+push\b", command)) and "push" not in shown_gates(session_id):
        remember_gate(session_id, "push")
        return context(
            "You are about to push or write a PR body. Run this gate first; the full skill is "
            f"`vellum-footguns`.\n\n{gate_text('Gate 5')}"
        )

    if re.search(r"\bpkill\b.*(brave|chrom)", command, re.I):
        return context(
            "vellum-footguns: every killed e2e run leaves a browser profile under tmpdir (446 of them, "
            "20GB, on 2026-09-08). Let the run finish, or sweep `/var/folders/*/*/T/vellum-e2e-*` after."
        )
    return None


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
        payload = json.load(sys.stdin)
        result = decide(payload)
        if result:
            print(json.dumps(result))
    except Exception:
        pass
    sys.exit(0)


FIXTURES = [
    ("bare stash denied", {"tool_name": "Bash", "tool_input": {"command": "git stash"}}, "deny"),
    ("named stash allowed", {"tool_name": "Bash", "tool_input": {"command": "git stash push -m wip -- src/a.ts"}}, None),
    ("stash list allowed", {"tool_name": "Bash", "tool_input": {"command": "git stash list"}}, None),
    ("perl wide char denied", {"tool_name": "Bash", "tool_input": {"command": "perl -0pi -e 's/a/−/' f.ts"}}, "deny"),
    ("perl x-escape denied", {"tool_name": "Bash", "tool_input": {"command": "perl -pi -e 's/a/\\x{2212}/' f.ts"}}, "deny"),
    ("perl ascii allowed", {"tool_name": "Bash", "tool_input": {"command": "perl -pi -e 's/foo/bar/' f.ts"}}, None),
    ("pr body negated close denied", {"tool_name": "Bash", "tool_input": {"command": "gh pr create --body 'this PR does not close #518'"}}, "deny"),
    ("pr body em-dash denied", {"tool_name": "Bash", "tool_input": {"command": "gh pr edit 5 --body 'a — b'"}}, "deny"),
    ("pr body clean gets gate 5 once", {"tool_name": "Bash", "tool_input": {"command": "gh pr create --body 'Closes #519. #518 stays open.'"}}, "context"),
    ("git push gets gate 5 once", {"tool_name": "Bash", "tool_input": {"command": "git push -u origin footguns-skill"}}, "context"),
    ("git status gets nothing", {"tool_name": "Bash", "tool_input": {"command": "git status"}}, None),
    ("e2e single-escaped class denied", {"tool_name": "Write", "tool_input": {"file_path": "scripts/e2e/suite-x.mjs", "content": "const R = `(() => 'a b'.split(/\\s+/))()`;"}}, "deny"),
    ("e2e single-escaped dot denied", {"tool_name": "Edit", "tool_input": {"file_path": "scripts/e2e/suite-x.mjs", "new_string": "await evaluate(`x.match(/a\\.b/)`)"}}, "deny"),
    ("e2e double-escaped allowed", {"tool_name": "Write", "tool_input": {"file_path": "scripts/e2e/suite-x.mjs", "content": "const R = `(() => 'a b'.split(/\\\\s+/))()`;"}}, "context"),
    ("e2e regex literal outside backticks allowed", {"tool_name": "Write", "tool_input": {"file_path": "scripts/e2e/suite-x.mjs", "content": "const a = s.match(/\\s+/);"}}, "context"),
    ("unit test file gets gate 1", {"tool_name": "Edit", "tool_input": {"file_path": "test/site/thing.test.ts", "new_string": "assert.ok(1);"}}, "context"),
    ("engine source gets nothing", {"tool_name": "Edit", "tool_input": {"file_path": "src/world/generate.ts", "new_string": "x"}}, None),
]


def selftest():
    fails = 0
    for name, payload, want in FIXTURES:
        payload = {**payload, "session_id": f"selftest-{os.getpid()}-{name}"}
        got = decide(payload)
        kind = None
        if got:
            kind = "deny" if got["hookSpecificOutput"].get("permissionDecision") == "deny" else "context"
        mark = "ok  " if kind == want else "FAIL"
        fails += kind != want
        print(f"{mark} {name}: want {want}, got {kind}")
        try:
            state_path(payload["session_id"]).unlink()
        except Exception:
            pass
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    selftest() if "--selftest" in sys.argv else main()
