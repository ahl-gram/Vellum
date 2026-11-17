import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { decideCodex, type CodexPayload } from "../../scripts/agent-infra/hooks/codex-adapter.ts";
import { decodePatch } from "../../scripts/agent-infra/hooks/codex-patch.ts";
import type { Decision } from "../../scripts/agent-infra/hooks/hook-io.ts";
import type { FileChange } from "../../scripts/agent-infra/hooks/request.ts";

const OWN = realpathSync(mkdtempSync(join(tmpdir(), "codex-patch-")));
const REPO = join(OWN, "repo");
const STATE = join(OWN, "state");
const SAVED_TMPDIR = process.env.TMPDIR;
const SILENT = "const R = `x.split(/\\s+/)`;";
const DOUBLED = "const R = `x.split(/\\\\s+/)`;";
const UPDATE_CHARACTERS = [
  ["U+2028", "\u2028"],
  ["U+2029", "\u2029"],
  ["mid-line CR", "\r"],
] as const;

before(() => {
  mkdirSync(STATE, { recursive: true });
  process.env.TMPDIR = STATE;
});

after(() => {
  if (SAVED_TMPDIR === undefined) delete process.env.TMPDIR;
  else process.env.TMPDIR = SAVED_TMPDIR;
  rmSync(OWN, { recursive: true, force: true });
});

const patch = (...lines: string[]): string => ["*** Begin Patch", ...lines, "*** End Patch"].join("\n");
const judge = (session: string, command: string, cwd: string | null = REPO): Promise<Decision> => {
  const payload: CodexPayload = {
    session_id: `codex-patch-${session}`,
    ...(cwd === null ? {} : { cwd }),
    tool_name: "apply_patch",
    tool_input: { command },
  };
  return decideCodex(payload, REPO);
};
const reason = (got: Decision): string => got?.hookSpecificOutput.permissionDecisionReason ?? "";
const context = (got: Decision): string => got?.hookSpecificOutput.additionalContext ?? "";
const refusedIn = (got: Decision, path: string): boolean =>
  got?.hookSpecificOutput.permissionDecision === "deny" && reason(got).includes(`inside a backtick string in ${path} `);

test("a two-file patch whose second file puts a single-escaped \\s in a template under scripts/ is refused, naming that file (Issue #1397)", async () => {
  const got = await judge(
    "witness",
    patch(
      "*** Add File: probe-1397/first.txt",
      "+a harmless first file",
      "*** Add File: scripts/probe-1397.ts",
      "+" + SILENT,
    ),
  );
  assert.ok(refusedIn(got, join(REPO, "scripts", "probe-1397.ts")), reason(got));
});

test("an update's context lines are read with its added lines, as one Edit's new text is (Issue #1397)", async () => {
  const got = await judge(
    "context",
    patch("*** Update File: scripts/x.ts", "@@", " const R = `", "+  x.split(/\\s+/)", " `;"),
  );
  assert.ok(refusedIn(got, join(REPO, "scripts", "x.ts")), reason(got));
});

test("an update's removed lines are not read, so a patch that fixes a bad escape is not refused for it (Issue #1397)", async () => {
  const added = await judge("removed-control", patch("*** Update File: scripts/x.ts", "@@", "+" + SILENT));
  assert.ok(refusedIn(added, join(REPO, "scripts", "x.ts")), reason(added));
  const got = await judge("removed", patch("*** Update File: scripts/x.ts", "@@", "-" + SILENT, "+" + DOUBLED));
  assert.equal(got, null);
});

test("the text after an update's @@ is read as context, so a template it opens is seen (Issue #1397)", async () => {
  const got = await judge(
    "anchor",
    patch("*** Update File: scripts/x.ts", "@@ const R = `", "+  x.split(/\\s+/)", " `;"),
  );
  assert.ok(refusedIn(got, join(REPO, "scripts", "x.ts")), reason(got));
});

test("a template one hunk leaves open does not hide the next hunk's escape, since each hunk is read on its own (Issue #1397)", async () => {
  const got = await judge(
    "hunks-apart",
    patch("*** Update File: scripts/x.ts", "@@", "+const a = `x", "@@", "+" + SILENT),
  );
  assert.ok(refusedIn(got, join(REPO, "scripts", "x.ts")), reason(got));
});

test("every hunk of an update is read, the first and the last (Issue #1397)", async () => {
  for (const [at, hunks] of [
    ["first", ["@@", "-old", "+" + SILENT, "@@", "-older", "+const a = 1;"]],
    ["last", ["@@", "-old", "+const a = 1;", "@@", "-older", "+" + SILENT]],
  ] as const) {
    const got = await judge(`hunks-${at}`, patch("*** Update File: scripts/x.ts", ...hunks));
    assert.ok(refusedIn(got, join(REPO, "scripts", "x.ts")), `${at}: ${reason(got)}`);
  }
});

test("a deleted file owes no gate and no check, where an edit to it would owe one (Issue #1397)", async () => {
  const edited = await judge("delete-control", patch("*** Update File: test/repo/never-exists-zz.test.ts", "@@", "+x"));
  assert.ok(context(edited).includes("## Gate 1"), context(edited));
  const got = await judge(
    "delete",
    patch(
      "*** Delete File: test/repo/never-exists-zz.test.ts",
      "*** Delete File: e2e/suites/never-exists-zz.ts",
      "*** Delete File: src/render/never-exists-zz.ts",
    ),
  );
  assert.equal(got, null);
});

test("a move is judged where its file lands: it joins a roster there and its hunks are read under that path (Issue #1397)", async () => {
  const joins = context(
    await judge(
      "move-roster",
      patch(
        "*** Update File: notes/never-exists-a.txt",
        "*** Move to: e2e/suites/never-exists-zz.ts",
        "@@",
        "+export const x = 1;",
      ),
    ),
  );
  const lead = `You are about to move ${join(REPO, "notes", "never-exists-a.txt")} to ${join(REPO, "e2e", "suites", "never-exists-zz.ts")}.`;
  assert.ok(joins.includes(`${lead} Run this gate`), joins);
  assert.ok(joins.includes("## Gate 4") && joins.includes("## Gate 2"), joins);
  const into = await judge(
    "move-into",
    patch("*** Update File: notes/never-exists-a.txt", "*** Move to: scripts/never-exists-zz.ts", "@@", "+" + SILENT),
  );
  assert.ok(refusedIn(into, join(REPO, "scripts", "never-exists-zz.ts")), reason(into));
  const away = await judge(
    "move-away",
    patch("*** Update File: scripts/never-exists-zz.ts", "*** Move to: notes/never-exists-a.txt", "@@", "+" + SILENT),
  );
  assert.equal(away, null);
});

test("a path with spaces is read whole (Issue #1397)", async () => {
  const got = await judge("spaced", patch("*** Add File: scripts/a dir/b c.ts", "+" + SILENT));
  assert.ok(refusedIn(got, join(REPO, "scripts", "a dir", "b c.ts")), reason(got));
});

test("a relative path is read against the call's own folder, never the session's or the hook's checkout (Issue #1397)", async () => {
  const got = await judge("nested", patch("*** Add File: b.ts", "+" + SILENT), join(REPO, "scripts"));
  assert.ok(refusedIn(got, join(REPO, "scripts", "b.ts")), reason(got));
});

test("a path that leaves the folder is checked where it lands, never dropped or moved inside (Issue #1397)", async () => {
  const got = await judge("leaving", patch("*** Add File: ../elsewhere/scripts/x.ts", "+" + SILENT));
  assert.ok(refusedIn(got, join(OWN, "elsewhere", "scripts", "x.ts")), reason(got));
});

test("a patch the reader cannot read is refused, asking for the form the tool's grammar gives (Issue #1397)", async () => {
  for (const [name, command] of [
    ["no closing line", ["*** Begin Patch", "*** Add File: a.txt", "+a"].join("\n")],
    ["a line an update cannot carry", patch("*** Update File: a.txt", "@@", "plain words")],
    ["an unknown header", patch("*** Rename File: a.txt")],
    ["another environment", patch("*** Environment ID: remote", "*** Add File: a.txt", "+a")],
    ["no file", patch()],
  ] as const) {
    const got = await judge(`unreadable-${name}`, command);
    assert.equal(got?.hookSpecificOutput.permissionDecision, "deny", name);
    assert.match(reason(got), /could not be read[\s\S]*Send it again[\s\S]*\*\*\* End Patch/, name);
  }
});

test("U+0085 in any file-header or move path makes the patch unreadable (Issue #1397)", async () => {
  for (const [name, command] of [
    ["add", patch("*** Add File: scripts/x.ts\u0085", "+" + SILENT)],
    ["update", patch("*** Update File: scripts/x.ts\u0085", "@@", "+" + SILENT)],
    ["delete", patch("*** Delete File: scripts/x.ts\u0085")],
    ["move", patch("*** Update File: notes/x.txt", "*** Move to: scripts/x.ts\u0085", "@@", "+" + SILENT)],
    ["header interior", patch("*** Add File: scripts/x\u0085.ts", "+" + SILENT)],
    ["move interior", patch("*** Update File: notes/x.txt", "*** Move to: scripts/x\u0085.ts", "@@", "+" + SILENT)],
  ] as const) {
    assert.ok("error" in decodePatch(command), name);
    const got = await judge(`nel-${name}`, command);
    assert.equal(got?.hookSpecificOutput.permissionDecision, "deny", name);
    assert.match(reason(got), /could not be read[\s\S]*U\+0085[\s\S]*Send it again/, name);
  }
});

test("Unicode separators and a mid-line CR in added, context and @@ lines are accepted and scanned (Issue #1397)", async () => {
  for (const [name, character] of UPDATE_CHARACTERS) {
    for (const prefix of ["+", " ", "@@ "]) {
      const change = (text: string): string =>
        patch("*** Update File: scripts/x.ts", prefix + text.replace("x.", "x" + character + "."), "+const after = 1;");
      assert.equal(await judge(`characters-safe-${name}-${prefix}`, change(DOUBLED)), null, name + prefix);
      const got = await judge(`characters-scanned-${name}-${prefix}`, change(SILENT));
      assert.ok(refusedIn(got, join(REPO, "scripts", "x.ts")), name + prefix + ": " + reason(got));
    }
  }
});

test("a patch with no absolute folder to read its paths against is refused (Issue #1397)", async () => {
  assert.equal(await judge("placed", patch("*** Add File: a.txt", "+a")), null);
  for (const cwd of [null, "repo"]) {
    const got = await judge(`unplaced-${String(cwd)}`, patch("*** Add File: a.txt", "+a"), cwd);
    assert.match(reason(got), /no absolute folder/, String(cwd));
  }
});

test("one patch's note carries each of its files' gates in their order, Gate 1 for the first test and Gate 7 for the second (Issue #1397)", async () => {
  const text = context(
    await judge(
      "two-tests",
      patch(
        "*** Update File: test/repo/never-exists-a.test.ts",
        "@@",
        "+x",
        "*** Update File: test/repo/never-exists-b.test.ts",
        "@@",
        "+y",
      ),
    ),
  );
  const one = text.indexOf("## Gate 1");
  assert.notEqual(one, -1, text);
  assert.ok(text.indexOf("## Gate 7") > one, text);
});

// Each row is what codex-cli 0.169.0's own patch tool did with that patch, run as `codex --codex-run-as-apply-patch` on 2026-11-16 (Issue #1397); a row's text is the new text a Claude Edit would carry.
const READ: ReadonlyArray<readonly [name: string, text: string, files: readonly FileChange[]]> = [
  ...UPDATE_CHARACTERS.map(
    ([name, character]) =>
      [
        name + " in an update line",
        patch("*** Update File: u.ts", "@@", "-old", "+new" + character + "line"),
        [{ kind: "update", path: "u.ts", texts: ["new" + character + "line"] }],
      ] as const,
  ),
  [
    "a plain add",
    patch("*** Add File: a.ts", "+const a = 1;"),
    [{ kind: "add", path: "a.ts", texts: ["const a = 1;"] }],
  ],
  ["a spaced path", patch("*** Add File: a dir/b c.ts", "+x"), [{ kind: "add", path: "a dir/b c.ts", texts: ["x"] }]],
  [
    "a header path's trailing spaces",
    patch("*** Add File: t.ts   ", "+x"),
    [{ kind: "add", path: "t.ts", texts: ["x"] }],
  ],
  [
    "a second space after the marker",
    patch("*** Add File:  lead.ts", "+x"),
    [{ kind: "add", path: " lead.ts", texts: ["x"] }],
  ],
  ["an add with no lines", patch("*** Add File: empty.ts"), [{ kind: "add", path: "empty.ts", texts: [""] }]],
  [
    "a path leaving the folder",
    patch("*** Add File: ../up.ts", "+x"),
    [{ kind: "add", path: "../up.ts", texts: ["x"] }],
  ],
  [
    "padded markers and header",
    ["  *** Begin Patch  ", "   *** Add File: padh.ts", "+x", "  *** End Patch  "].join("\n"),
    [{ kind: "add", path: "padh.ts", texts: ["x"] }],
  ],
  [
    "CRLF line ends",
    ["*** Begin Patch", "*** Add File: crlf.ts", "+x", "*** End Patch"].join("\r\n"),
    [{ kind: "add", path: "crlf.ts", texts: ["x"] }],
  ],
  [
    "a newline after the closing line",
    `${patch("*** Add File: tn.ts", "+x")}\n`,
    [{ kind: "add", path: "tn.ts", texts: ["x"] }],
  ],
  ["a delete", patch("*** Delete File: d.ts"), [{ kind: "delete", path: "d.ts" }]],
  [
    "a delete, then a padded header",
    patch("*** Delete File: d.ts", "   *** Add File: after.ts", "+x"),
    [
      { kind: "delete", path: "d.ts" },
      { kind: "add", path: "after.ts", texts: ["x"] },
    ],
  ],
  [
    "an update under an anchor",
    patch("*** Update File: u.ts", "@@ three", " four", "-five", "+FIVE", " six"),
    [{ kind: "update", path: "u.ts", texts: ["three\nfour\nFIVE\nsix"] }],
  ],
  [
    "a first hunk with no @@",
    patch("*** Update File: u.ts", " four", "-five", "+FIVE"),
    [{ kind: "update", path: "u.ts", texts: ["four\nFIVE"] }],
  ],
  [
    "two hunks",
    patch("*** Update File: u.ts", "@@", "-two", "+TWO", "@@", "-six", "+SIX"),
    [{ kind: "update", path: "u.ts", texts: ["TWO", "SIX"] }],
  ],
  [
    "a blank line inside a hunk",
    patch("*** Update File: b.ts", "@@", " one", "", "-three", "+THREE"),
    [{ kind: "update", path: "b.ts", texts: ["one\n\nTHREE"] }],
  ],
  [
    "an end-of-file line",
    patch("*** Update File: u.ts", "@@", " seven", "-eight", "+EIGHT", "*** End of File"),
    [{ kind: "update", path: "u.ts", texts: ["seven\nEIGHT"] }],
  ],
  [
    "an end-of-file line with trailing spaces",
    patch("*** Update File: m.ts", "@@", "-four", "+FOUR", "*** End of File   "),
    [{ kind: "update", path: "m.ts", texts: ["FOUR"] }],
  ],
  [
    "a padded end-of-file line is context",
    patch("*** Update File: m.ts", "@@", " two", "   *** End of File", "-four", "+FOUR"),
    [{ kind: "update", path: "m.ts", texts: ["two\n  *** End of File\nFOUR"] }],
  ],
  [
    "a padded header inside an update is context",
    patch("*** Update File: m.ts", "@@", " one", "   *** Add File: z.ts"),
    [{ kind: "update", path: "m.ts", texts: ["one\n  *** Add File: z.ts"] }],
  ],
  [
    "two updates of one file",
    patch("*** Update File: u.ts", "@@", "-two", "+TWO", "*** Update File: u.ts", "@@", "-six", "+SIX"),
    [
      { kind: "update", path: "u.ts", texts: ["TWO"] },
      { kind: "update", path: "u.ts", texts: ["SIX"] },
    ],
  ],
  [
    "a move",
    patch("*** Update File: m.ts", "*** Move to: moved/m2.ts", "@@", "-two", "+TWO"),
    [{ kind: "move", from: "m.ts", path: "moved/m2.ts", texts: ["TWO"] }],
  ],
  [
    "a move path's padding",
    patch("*** Update File: m.ts", "*** Move to:  padded.ts ", "@@", "-two", "+TWO"),
    [{ kind: "move", from: "m.ts", path: " padded.ts", texts: ["TWO"] }],
  ],
  [
    "a padded move line is context",
    patch("*** Update File: m.ts", "   *** Move to: lead-pad.ts", "@@", "-two", "+TWO"),
    [{ kind: "update", path: "m.ts", texts: ["  *** Move to: lead-pad.ts", "TWO"] }],
  ],
];

test("the patch reader reads each path and line as Codex 0.169.0's own patch tool does (Issue #1397)", () => {
  for (const [name, text, files] of READ) assert.deepEqual(decodePatch(text), { files }, name);
});

const REFUSED: ReadonlyArray<readonly [name: string, text: string]> = [
  ["no opening line", ["*** Add File: nb.ts", "+x", "*** End Patch"].join("\n")],
  ["words before the opening line", ["here is a patch", patch("*** Add File: tb.ts", "+x")].join("\n")],
  ["no closing line", ["*** Begin Patch", "*** Add File: ne.ts", "+x"].join("\n")],
  ["words after the closing line", [patch("*** Add File: ta.ts", "+x"), "trailing words"].join("\n")],
  ["a lowercase header", patch("*** add file: lc.ts", "+x")],
  ["a line after an add that is not +", patch("*** Add File: n.ts", "+a", "b")],
  ["a line after a delete", patch("*** Delete File: d.ts", "-x")],
  ["@@ with no space before its text", patch("*** Update File: u.ts", "@@three", " four", "-five", "+FIVE")],
  ["only the opening and closing lines", patch()],
  ["a heredoc wrapper", ["<<'EOF'", patch("*** Add File: hd.ts", "+x"), "EOF"].join("\n")],
  ["another environment", patch("*** Environment ID: local", "*** Add File: env.ts", "+x")],
];

test("a patch whose form Codex 0.169.0's patch tool refuses is refused by the reader, and so are a heredoc wrapper and another environment's patch (Issue #1397)", () => {
  for (const [name, text] of REFUSED) assert.ok("error" in decodePatch(text), name);
});
