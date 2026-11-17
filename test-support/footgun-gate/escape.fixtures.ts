import { bash, edit, multi, type Fixture } from "./kit.ts";

export const ESCAPE_ROWS: Fixture[] = [
  [
    "heredoc into e2e denied",
    bash("cat > e2e/suites/x.ts <<'EOF'\nconst R = `x.split(/\\s+/)`;\nEOF"),
    "deny",
    "backtick",
  ],
  [
    "heredoc into out probe denied",
    bash("cat > out/probe.mjs <<'EOF'\nawait evaluate(`a.match(/b\\.c/)`)\nEOF"),
    "deny",
    "backtick",
  ],
  [
    "e2e single-escaped class denied",
    edit("Write", "e2e/suites/x.ts", "const R = `(() => 'a b'.split(/\\s+/))()`;"),
    "deny",
    "backtick",
  ],
  [
    "e2e single-escaped dot denied",
    edit("Edit", "e2e/suites/x/part.ts", "await evaluate(`x.match(/a\\.b/)`)"),
    "deny",
    "backtick",
  ],
  ["multiedit edits[] denied", multi("e2e/support/x.ts", "`split(/\\s/)`"), "deny", "backtick"],
  [
    "a multiedit's second edit is read on its own after a first that leaves a template open",
    {
      tool_name: "MultiEdit",
      tool_input: {
        file_path: "e2e/support/x.ts",
        edits: [{ new_string: "const a = `x" }, { new_string: "const R = `y.split(/\\s+/)`;" }],
      },
    },
    "deny",
    "backtick",
  ],
  [
    "out probe single-escaped denied",
    edit("Write", "out/probe-x.mjs", "const P = `s.replace(/\\s+/g, ' ')`;"),
    "deny",
    "backtick",
  ],
  [
    "String.raw is the remedy and is allowed",
    edit("Write", "out/probe-x.mjs", "const P = String.raw`s.replace(/\\s+/g, ' ')`;"),
    "context",
    "## Gate 2",
  ],
  [
    "odd backtick in a regex literal does not swallow code",
    edit("Write", "out/rewrap.mjs", "const md = /^```/;\nconst r = s.match(/\\s+/);"),
    "context",
    "## Gate 2",
  ],
  [
    "escape inside a substitution template denied",
    edit("Write", "out/p.mjs", "const P = `a${1}b.split(/\\d/)`;"),
    "deny",
    "backtick",
  ],
  [
    "e2e double-escaped gets gate 2",
    edit("Write", "e2e/suites/x.ts", "const R = `(() => 'a b'.split(/\\\\s+/))()`;"),
    "context",
    "## Gate 2",
  ],
  [
    "e2e regex literal outside backticks gets gate 2",
    edit("Write", "e2e/suites/x.ts", "const a = s.match(/\\s+/);"),
    "context",
    "## Gate 2",
  ],
  ["e2e .click() warns", edit("Edit", "e2e/suites/x/part.ts", "el.click();"), "context", "pointer-events"],
  [
    "e2e .ts single-escaped class denied",
    edit("Write", "e2e/harness.ts", "const R = `(() => 'a b'.split(/\\s+/))()`;"),
    "deny",
    "backtick",
  ],
  [
    "a template after a generic arrow in a .ts file denied",
    edit("Write", "e2e/suites/x.ts", "const id = <T>(x: T): T => x;\nconst R = `(() => 'a b'.split(/\\s+/))()`;"),
    "deny",
    "backtick",
  ],
  [
    "a template after an angle-bracket assertion denied",
    edit("Write", "out/probe-x.ts", "const P = <string>`s.split(/\\s+/)`;"),
    "deny",
    "backtick",
  ],
  [
    "a single escape in a non-e2e scripts .ts denied",
    edit("Write", "scripts/lint/x.ts", "const P = `s.split(/\\d/)`;"),
    "deny",
    "backtick",
  ],
  [
    "heredoc into an e2e .ts denied",
    bash("cat > e2e/support/x.ts <<'EOF'\nconst R = `x.split(/\\s+/)`;\nEOF"),
    "deny",
    "backtick",
  ],
  [
    "String.raw in a .ts is allowed",
    edit("Write", "e2e/suites/x.ts", "const P = String.raw`s.replace(/\\s+/g, ' ')`;"),
    "context",
    "## Gate 2",
  ],
  [
    "a single escape in a unit test under test/e2e is denied too",
    edit("Write", "test/e2e/x.test.ts", "const P = `s.split(/\\d/)`;"),
    "deny",
    "backtick",
  ],
];
