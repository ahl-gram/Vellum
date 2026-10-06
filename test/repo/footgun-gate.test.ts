import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const SELFTEST = resolve(import.meta.dirname, "..", "..", ".claude", "skills", "vellum-footguns", "hooks", "footgun-gate.selftest.ts");
const TEMPLATE = resolve(import.meta.dirname, "..", "..", ".github", "PULL_REQUEST_TEMPLATE.md");
// The cap reaches the selftest's own three deployed rows, which pipe input to a child that drains it and so share the shape Issue #564 wedged on; a cap here bounds that whole subtree in one place. Measured 2026-09-11: the selftest runs in 0.34s, so this is about 90x.
const BOUND_MS = 30_000;

test("the footgun hook's fixture table passes, including the deployed settings.json command", () => {
  const out = execFileSync(process.execPath, [SELFTEST], { encoding: "utf8", timeout: BOUND_MS });
  assert.doesNotMatch(out, /^FAIL/m, out);
  assert.match(out, /^ok +deployed: symlinked project dir denies stash pop/m, out);
});

// The table's only other assertion is "no FAIL", which an EMPTY roster satisfies: a headingRows() that returned [] would leave npm test green with the whole PR-section guard gone (Issue #140's deletable-guard shape). The required row per section is derived from the template rather than listed here, so this cannot drift from it either.
test("every section of the PR template has its own denial row in the table", () => {
  const sections = readFileSync(TEMPLATE, "utf8").split("\n").map((l) => l.trim()).filter((l) => l.startsWith("## "));
  assert.ok(sections.length >= 2, `the template carries ${sections.length} sections, so this guard cannot bite`);
  const out = execFileSync(process.execPath, [SELFTEST], { encoding: "utf8", timeout: BOUND_MS });
  for (const section of sections) assert.ok(out.includes(`ok   pr body missing ${section} denied`), `no passing row for ${section}\n${out}`);
});

// Names, needles and limit written out on purpose: this file only spawns the selftest, and a deleted size check, an emptied probe or needle list, a loosened needle test or a raised limit all print no FAIL.
test("every gate-size probe passes at the 8,000-character limit", () => {
  const out = execFileSync(process.execPath, [SELFTEST], { encoding: "utf8", timeout: BOUND_MS });
  const probes: [string, string][] = [
    ["a test file", "## Gate 1"],
    ["a browser-harness unit test that clicks and escapes", "## Gate 1, for wiring only, double the backslash"],
    ["a new e2e suite that clicks and escapes", "## Gate 4, ## Gate 2, for wiring only, double the backslash"],
    ["a new unit test under a suite-shaped path that clicks and escapes", "## Gate 1, for wiring only, double the backslash"],
    ["a new stylesheet", "## Gate 4, ## Gate 3"],
    ["a new page", "## Gate 4, ## Gate 3"],
    ["a new site module", "## Gate 4"],
    ["the renderer", "## Gate 6"],
    ["a push", "## Gate 5"],
    ["a PR body from an unreadable file", "## Gate 5, could not read"],
    ["a shell line that writes a script, kills a browser, pushes and opens a PR", "## Gate 5, could not read, double the backslash, browser profile"],
  ];
  const named = /^ok {3}the size probes' 11 quoted paths sit under a root of 100 characters, naming test files of (\d+) and suites of (\d+) characters$/m.exec(out);
  const longest = (dir: string, suffix: string, recursive: boolean): number =>
    Math.max(...readdirSync(resolve(import.meta.dirname, "..", "..", dir), { recursive, encoding: "utf8" }).map((p) => p.split("/").pop() ?? "").filter((n) => n.endsWith(suffix)).map((n) => n.length));
  assert.deepEqual([Number(named?.[1]), Number(named?.[2])], [longest("test", ".test.ts", true), longest("e2e/suites", ".ts", false)], `the size probes do not name the longest real test file and suite\n${out}`);
  for (const [name, carries] of probes) {
    const row = out.split("\n").find((l) => l.startsWith(`ok   ${name}: the pasted note carries ${carries} in `));
    const size = /in (\d+) of 8000 characters$/.exec(row ?? "");
    assert.ok(size && Number(size[1]) <= 8000, `no passing size row carrying ${carries} within 8000 for ${name}\n${out}`);
  }
});

// Written out for the same reason as the size probes: several of these rows are the only guard of their roster arm, and deleting one prints no FAIL.
test("every row on whether a new unit test joins a roster passes", () => {
  const out = execFileSync(process.execPath, [SELFTEST], { encoding: "utf8", timeout: BOUND_MS });
  const gate1Not4 = 'want context with "## Gate 1" and without "## Gate 4", got context';
  const rows: [string, string][] = [
    ["a new unit test under test/e2e/suites gets gate 1 and no gate 4", gate1Not4],
    ["a new unit test under test/src/site gets gate 1 and no gate 4", gate1Not4],
    ["a new unit test under test/src/pages gets gate 1 and no gate 4", gate1Not4],
    ["a new unit test on the absolute path a real call passes gets gate 1 and no gate 4", gate1Not4],
    ["a new unit test beside a suite gets gate 2 and no gate 4", 'want context with "## Gate 2" and without "## Gate 4", got context'],
    ["a new part in a suite's folder gets gate 2 and no gate 4", 'want context with "## Gate 2" and without "## Gate 4", got context'],
    ["a new unit test beside a site module gets no gate at all", 'want null with "", got null'],
    ["a new unit test beside a page gets no gate at all", 'want null with "", got null'],
    ["a new suite whose name ends in test still gets gate 4", 'want context with "## Gate 4", got context'],
    ["a new site module whose name ends in test still gets gate 4", 'want context with "## Gate 4", got context'],
  ];
  for (const [row, wants] of rows) assert.ok(out.split("\n").includes(`ok   ${row}: ${wants}`), `no passing row "${row}: ${wants}"\n${out}`);
});

const CODE_ROWS: ReadonlyArray<readonly [string, "deny" | "null" | "context"]> = [
  ["an em-dash inside an inline span in a pr comment allowed", "null"],
  ["an em-dash inside a span in a whole pr body allowed", "context"],
  ["an em-dash after a single backtick inside a double-backtick span allowed", "null"],
  ["an em-dash inside a closed backtick fence allowed", "null"],
  ["an em-dash inside a closed tilde fence allowed", "null"],
  ["an em-dash inside a fence indented two spaces allowed", "null"],
  ["an em-dash inside a fence closed by a longer run allowed", "null"],
  ["an em-dash in a table cell's span with its pipe escaped allowed", "null"],
  ["an em-dash inside a span in an issue body allowed", "null"],
  ["an em-dash inside a tilde fence whose info string holds a backtick allowed", "null"],
  ["an em-dash inside a fence indented three spaces allowed", "null"],
  ["an em-dash inside an inline body's span allowed", "null"],
  ["an em-dash inside a fence of a crlf body allowed", "null"],
  ["an em-dash in a span after a doubled backslash allowed", "null"],
  ["an em-dash in a fence after an html block that a blank line ended allowed", "null"],
  ["an em-dash in prose beside a span denied", "deny"],
  ["an em-dash after an unclosed backtick denied", "deny"],
  ["an em-dash in a span opened on one line and closed on the next denied", "deny"],
  ["an em-dash after a backslash-escaped backtick denied", "deny"],
  ["an em-dash after a span closed by a backslash-preceded backtick denied", "deny"],
  ["an em-dash after an unclosed fence denied", "deny"],
  ["an em-dash inside a fence closed by the other character denied", "deny"],
  ["an em-dash inside a fence closed by a shorter run denied", "deny"],
  ["an em-dash after a backtick line whose info string holds a backtick denied", "deny"],
  ["an em-dash inside a fence indented four spaces denied", "deny"],
  ["an em-dash in an indented block with no fence denied", "deny"],
  ["an em-dash in a table cell whose bare pipe splits the span denied", "deny"],
  ["an em-dash in a cell of a table whose rows start with no pipe denied", "deny"],
  ["an em-dash in the body after a fence the command opened denied", "deny"],
  ["an em-dash in the title outside code denied", "deny"],
  ["an em-dash in a body after a backtick the title left open denied", "deny"],
  ["an em-dash in a second call's body after a backtick the first left open denied", "deny"],
  ["an em-dash on the line after a closing fence denied", "deny"],
  ["an em-dash glued after a span denied", "deny"],
  ["an em-dash glued before a span denied", "deny"],
  ["an em-dash after an opener indented four spaces denied", "deny"],
  ["an em-dash before a closer indented four spaces denied", "deny"],
  ["an em-dash in a span whose only closer is a longer run denied", "deny"],
  ["an em-dash before a fence line that carries an info string denied", "deny"],
  ["an em-dash in a second body file after a fence the first opened denied", "deny"],
  ["an em-dash after a list item's fence that its item ended denied", "deny"],
  ["an em-dash on a line that leaves the fence of a list item with a lazy line denied", "deny"],
  ["an em-dash on a line that leaves a list item's fence denied", "deny"],
  ["an em-dash inside a list item's fence allowed", "null"],
  ["an em-dash between html tags whose attributes hold backticks denied", "deny"],
  ["an em-dash in an autolink whose address holds backticks denied", "deny"],
  ["an em-dash in a fence inside an html block denied", "deny"],
  ["an em-dash between two spans that each hold a tag denied", "deny"],
  ["a long prose line is quoted at its em-dash", "deny"],
];

test("every row on reading an em-dash inside code passes, with the decision it was written for", () => {
  const out = execFileSync(process.execPath, [SELFTEST], { encoding: "utf8", timeout: BOUND_MS });
  const lines = out.split("\n");
  for (const [row, want] of CODE_ROWS) assert.ok(lines.some((l) => l.startsWith(`ok   ${row}: want ${want} with `)), `no passing row "${row}" wanting ${want}\n${out}`);
});

const CD_ROWS: ReadonlyArray<readonly [string, "deny" | "null"]> = [
  ["a bare cd into another directory inside the project denied", "deny"],
  ["a bare cd into a worktree denied, the incident's shape", "deny"],
  ["a bare cd into a directory under out denied, the incident's shape", "deny"],
  ["a cd to the cwd spelled absolute allowed", "null"],
  ["cd . allowed", "null"],
  ["a relative target resolves against the payload's cwd", "deny"],
  ["a link to the cwd allowed", "null"],
  ["cd -P through the link allowed", "null"],
  ["zsh's cd -q through the link allowed", "null"],
  ["a link from outside the project into it denied", "deny"],
  ["a double-quoted path with a space that stays allowed", "null"],
  ["a single-quoted path with a space that stays allowed", "null"],
  ["a backslash-escaped space that stays allowed", "null"],
  ["a round trip denied at its first leg", "deny"],
  ["a cd that stays, then one that moves, denied at the second", "deny"],
  ["a cd into a directory the same call creates denied", "deny"],
  ["a bare cd goes home, outside the project, and is allowed", "null"],
  ["cd ~ goes home and is allowed", "null"],
  ["the session-end backup step outside the project allowed", "null"],
  ["a cd out of the project from its root allowed", "null"],
  ["a cd back to the project root from inside it denied", "deny"],
  ["a directory whose name only begins with the project's is outside it", "null"],
  ["with no project directory known every move is denied", "deny"],
  ["a project spelled through a link still holds its own directories", "deny"],
  ["a path spelled through the project's link is inside it", "deny"],
  ["a bare cd to a home that is the project root denied", "deny"],
  ["a cd to a shell variable denied", "deny"],
  ["a quoted variable path that climbs back denied", "deny"],
  ["an unquoted variable path that climbs back denied", "deny"],
  ["a variable after a tilde denied", "deny"],
  ["a glob star that climbs back denied", "deny"],
  ["a glob question mark that climbs back denied", "deny"],
  ["a glob class that climbs back denied", "deny"],
  ["a brace expansion that climbs back denied", "deny"],
  ["a brace expansion naming two directories denied", "deny"],
  ["a backtick inside double quotes denied", "deny"],
  ["a backslash inside double quotes denied", "deny"],
  ["an unclosed quote denied", "deny"],
  ["a cd to a command substitution in backticks denied", "deny"],
  ["a cd to the top level in backticks denied", "deny"],
  ["cd - denied", "deny"],
  ["cd - denied from outside the project", "deny"],
  ["cd +1 denied from outside the project", "deny"],
  ["another user's home denied from outside the project", "deny"],
  ["cd with a second argument denied", "deny"],
  ["a cd in a loop body denied", "deny"],
  ["pushd with no directory denied", "deny"],
  ["popd denied", "deny"],
  ["no cwd in the payload denied", "deny"],
  ["a cwd that does not exist denied", "deny"],
  ["a cwd that does not exist denies a target outside the project too", "deny"],
  ["a cd the reader cannot place leaves the stash refusal standing", "deny"],
  ["cd -- . allowed", "null"],
  ["cd -L . allowed", "null"],
  ["cd -e . allowed", "null"],
  ["cd -s . allowed", "null"],
  ["cd -@ . allowed", "null"],
  ["cd -LP . allowed", "null"],
  ["chdir denied", "deny"],
  ["builtin cd denied", "deny"],
  ["a backslash-escaped builtin cd denied", "deny"],
  ["command cd denied", "deny"],
  ["command -p cd denied", "deny"],
  ["time cd denied", "deny"],
  ["time -p cd denied", "deny"],
  ["noglob cd denied", "deny"],
  ["nocorrect cd denied", "deny"],
  ["an assignment before cd denied", "deny"],
  ["an assignment whose name holds a digit before cd denied", "deny"],
  ["a backslash-escaped cd denied", "deny"],
  ["env cd allowed, since it runs an external cd", "null"],
  ["pushd elsewhere denied", "deny"],
  ["pushd . allowed", "null"],
  ["a word that starts with cd is not a cd", "null"],
  ["a cd as an argument is not a cd", "null"],
  ["a keyword glued to a word is not a keyword", "null"],
  ["a keyword at a word's end is not a keyword", "null"],
  ["a keyword after a dash is not a keyword", "null"],
  ["a subshell cd allowed", "null"],
  ["a subshell cd with no spaces allowed", "null"],
  ["a nested subshell's close leaves the outer one open", "null"],
  ["a cd after the subshell closes denied", "deny"],
  ["a cd after a case statement denied", "deny"],
  ["a cd in a command substitution allowed", "null"],
  ["a cd in a process substitution allowed", "null"],
  ["a cd in backticks allowed", "null"],
  ["a cd after a separator in backticks allowed", "null"],
  ["a cd after a closed backtick span denied", "deny"],
  ["a cd on its own line denied", "deny"],
  ["a cd before an or denied", "deny"],
  ["a cd in a braced group denied", "deny"],
  ["a cd that stays in a braced group allowed", "null"],
  ["a cd as an if condition denied", "deny"],
  ["a cd after then denied", "deny"],
  ["a cd after else denied", "deny"],
  ["a cd after elif denied", "deny"],
  ["a cd as a while condition denied", "deny"],
  ["a cd as an until condition denied", "deny"],
  ["a negated cd denied", "deny"],
  ["a cd at a pipeline's end denied, since zsh runs it in the session", "deny"],
  ["a cd at a pipeline's start allowed", "null"],
  ["a cd piped with its stderr allowed", "null"],
  ["a cd after a pipe with stderr denied", "deny"],
  ["a background cd allowed", "null"],
  ["a cd after a background job denied", "deny"],
  ["a cd whose stderr is redirected is not a background job", "deny"],
  ["a cd whose output is redirected is not a background job", "deny"],
  ["a cd whose input is redirected is not a background job", "deny"],
  ["a cd across a line continuation denied", "deny"],
  ["a cd across two line continuations denied", "deny"],
  ["a cd in quotes is not a cd", "null"],
  ["a cd after an escaped quote inside double quotes is not a cd", "null"],
  ["a cd in an inline body is not a cd", "null"],
  ["a cd in a trailing comment is not a cd", "null"],
  ["a cd in a comment that opens the command is not a cd", "null"],
  ["a comment glued after a semicolon is a comment", "null"],
  ["a comment glued after an ampersand is a comment", "null"],
  ["a comment glued after a pipe is a comment", "null"],
  ["a comment glued after a paren is a comment", "null"],
  ["a hash inside a word is not a comment", "deny"],
  ["a cd in a heredoc body is not a cd", "null"],
  ["a cd in a heredoc body whose operator is not last on its line is not a cd", "null"],
  ["a cd in a heredoc whose delimiter follows a space is not a cd", "null"],
  ["a cd in a heredoc with a double-quoted delimiter is not a cd", "null"],
  ["a cd in a heredoc with no terminator is not a cd", "null"],
  ["a tab-indented terminator does not end a plain heredoc", "null"],
  ["a cd after a tab-indented heredoc denied", "deny"],
  ["a cd inside a tab-indented heredoc is not a cd", "null"],
  ["a cd in the second of two heredocs is not a cd", "null"],
  ["a cd after two heredocs denied", "deny"],
  ["a cd after a heredoc and another line denied", "deny"],
  ["a cd after a heredoc whose body opens a quote and a paren denied", "deny"],
  ["a here-string is not a heredoc", "deny"],
  ["an arithmetic shift is not a heredoc", "deny"],
  ["a subagent's bare cd allowed", "null"],
  ["a main session started with --agent is still the main session", "deny"],
  ["the review agents' sandbox recipe allowed in a subagent", "null"],
  ["the same recipe denied in the main session", "deny"],
];

// Written out for the same reason as the code rows: each is the only guard of its arm of the cd reader (Issue #781), and deleting one from the fixture table prints no FAIL.
test("every row on a bare cd in the main session passes, with the decision it was written for", () => {
  const out = execFileSync(process.execPath, [SELFTEST], { encoding: "utf8", timeout: BOUND_MS });
  const lines = out.split("\n");
  for (const [row, want] of CD_ROWS) assert.ok(lines.some((l) => l.startsWith(`ok   ${row}: want ${want} with `)), `no passing row "${row}" wanting ${want}\n${out}`);
});

// This guard lives here, not beside the readDeployed tests, because it has to survive the defect it guards: footgun-deployed-run.test.ts imports the selftest statically, so an entry guard that stops working exits that whole file at import time and the runner reports it green with every assertion silently absent (measured: 7 gone, "pass 2 fail 0"). This file only ever spawns the selftest, so it still runs.
test("a bare import of the fixture table runs nothing and mints nothing", () => {
  const own = mkdtempSync(join(tmpdir(), "footgun-import-probe-"));
  try {
    const out = execFileSync(process.execPath, ["-e", `import(${JSON.stringify(pathToFileURL(SELFTEST).href)})`], {
      encoding: "utf8",
      env: { ...process.env, TMPDIR: own },
    });
    assert.equal(out, "", `run() executed on import and printed ${out.length} bytes`);
    assert.deepEqual(readdirSync(own), []);
  } finally {
    rmSync(own, { recursive: true, force: true });
  }
});

// Both guards below read the TEMPLATE, so neither can red when a PR body ships with no closing reference: the hook that reads a body off disk checks the sections and denies a negated keyword but never requires one, and a body written by hand rather than seeded from this file carries whatever its author typed, so Issue #597's own defect, a merged PR leaving its issue open, is not guardable from a test here and the template line is a prompt rather than a mechanism. The number scan errs toward a false positive, since a number deliberately written as an example would red it, and never toward a miss.
test("the PR template prompts for a closing reference above its first section, with a note beside it", () => {
  const lines = readFileSync(TEMPLATE, "utf8").split("\n");
  const firstSection = lines.findIndex((l) => l.trim().startsWith("## "));
  assert.notEqual(firstSection, -1, "the template carries no `## ` section, so this guard cannot bite");
  const closing = lines.findIndex((l) => l.trim().startsWith("Closes #"));
  assert.notEqual(closing, -1, "the template carries no `Closes #` line, so nothing prompts the author for the closing reference");
  assert.ok(closing < firstSection, `the closing line is at ${closing}, at or past the first \`## \` section at ${firstSection}, where the hook would enforce whatever heading precedes it`);
  const note = lines.slice(closing + 1, firstSection).filter((l) => l.trim().startsWith("<!--")).join("\n");
  assert.notEqual(note, "", "the closing line carries no note between it and the first section");
  assert.match(note, /No issue:/, "the note beside the closing line does not say what a PR with no issue writes in its place, which is the half of the prompt an author without an issue needs");
  assert.match(note, /stays open/, "the note beside the closing line does not say what a PR that HAS an issue and deliberately leaves it open writes in its place, which is the third form: the first of a pair of PRs on one issue has an issue number to name and no closing keyword to name it with");
  // Presence only: a note keeping every phrase below and adding guidance that contradicts them stays green, which costs a miss on self-contradiction and never a false red on a rewording, the direction a prompt the hook does not enforce should err in.
  assert.match(note, /no closing keyword/, "the third form does not say to keep every closing keyword away from the number, which is the whole of it: GitHub reads a keyword beside a number as closing it however the sentence is worded");
  assert.match(note, /closingIssuesReferences` is then empty by intent/, "the third form does not say how to tell a deliberately open issue from a dropped closing line, which is the only check that distinguishes them");
  assert.match(note, /Issue: #N/, "the third form names no worked shape, so an author following it can write `Closes #N, stays open because ...`, which reads as the rule and closes the issue on merge");
});

test("the PR template names no literal issue number", () => {
  const hits = readFileSync(TEMPLATE, "utf8").match(/#\d+|issues\/\d+/g);
  assert.equal(hits, null, `the template names ${hits?.join(", ")}, and a body opened from it carries that text: a number beside a negated close keyword is denied by the hook, and any reference at all cross-references that issue from every PR opened from the template afterwards`);
});
