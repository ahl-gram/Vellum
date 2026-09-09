/**
 * The footgun hook's fixture table. `node footgun-gate.selftest.ts` prints one line per fixture and exits with the
 * number of misses; test/repo/footgun-gate.test.ts runs it under npm test. The deployed rows run the exact command
 * string from .claude/settings.json through sh with a real, a symlinked, and a missing CLAUDE_PROJECT_DIR.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, realpathSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { decide, gateText, statePath, type Decision, type Payload } from "./footgun-gate.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..", "..", "..");
const SCRATCH = join(tmpdir(), `footgun-selftest-${process.pid}`); // named here, created in run(): FIXTURES needs the path at module scope, and a module that mints a temp dir just by being imported leaks one per import
const LINK = join(SCRATCH, "linked-root");
const SETTINGS = JSON.parse(execFileSync("cat", [join(ROOT, ".claude", "settings.json")], { encoding: "utf8" })) as {
  hooks: { PreToolUse: { hooks: { command: string }[] }[] };
};
const WIRED = SETTINGS.hooks.PreToolUse[0]?.hooks[0]?.command ?? "";

const bash = (command: string, cwd?: string): Payload => ({ tool_name: "Bash", tool_input: { command }, ...(cwd ? { cwd } : {}) });
const edit = (tool: string, path: string, text: string): Payload => ({
  tool_name: tool,
  tool_input: { file_path: path, ...(tool === "Write" ? { content: text } : { new_string: text }) },
});
const multi = (path: string, text: string): Payload => ({ tool_name: "MultiEdit", tool_input: { file_path: path, edits: [{ new_string: text }] } });

export const readDeployed = (run: () => string): Decision => {
  let out: string;
  try {
    out = run();
  } catch (err) {
    const e = err as NodeJS.ErrnoException & { status?: number | null; stdout?: string };
    if (e.code === "EPIPE" && e.status === 0 && !e.stdout) return null; // the missing-project-dir wrapper runs `exit 0` without reading stdin, so our write races its exit: a clean exit with no output IS "no hook, no decision"
    throw err;
  }
  return out.trim() ? (JSON.parse(out) as Decision) : null;
};

const deployed = (payload: Payload, projectDir: string) => async (): Promise<Decision> =>
  readDeployed(() =>
    execFileSync("sh", ["-c", WIRED], {
      input: JSON.stringify(payload),
      encoding: "utf8",
      env: { ...process.env, CLAUDE_PROJECT_DIR: projectDir },
    }),
  );

type Kind = "deny" | "context" | null;
type Fixture = [string, Payload | (() => Promise<Decision>), Kind, string];
const STASH_POP = bash("git stash pop");
const GATE6_ARMS: [string, string][] = [
  ["render", "src/render/style.ts"], ["world", "src/world/generate.ts"], ["society", "src/society/history.ts"],
  ["core", "src/core/grid.ts"], ["noise", "src/noise/simplex.ts"], ["terrain", "src/terrain/heightfield.ts"],
  ["climate", "src/climate/wind.ts"], ["hydrology", "src/hydrology/rivers.ts"],
  ["atlas/palette", "src/atlas/palette.ts"], ["cli/raster", "src/cli/raster.ts"],
  ["charts/", "public/charts/chart-42-antique.svg"], ["og.png", "public/og.png"],
  ["favicon.svg", "public/favicon.svg"], ["apple-touch-icon.png", "public/apple-touch-icon.png"],
  ["hero-charts", "scripts/hero-charts.ts"], ["regen-hero-charts", "scripts/regen-hero-charts.ts"],
  ["build-og", "scripts/build-og.ts"], ["build-icons", "scripts/build-icons.ts"],
  ["glyph-outline", "scripts/glyph-outline.ts"],
];

const FIXTURES: Fixture[] = [
  ["bare stash denied", bash("git stash"), "deny", "shared"],
  ["stash pop denied", STASH_POP, "deny", "shared"],
  ["stash clear denied", bash("git stash clear"), "deny", "shared"],
  ["stash apply without ref denied", bash("git stash apply"), "deny", "shared"],
  ["stash pop via -C denied", bash("git -C /Users/x/Vellum/.claude/worktrees/other stash pop"), "deny", "shared"],
  ["stash pop with double space denied", bash("git  stash pop"), "deny", "shared"],
  ["stash pop under env prefix denied", bash("env X=1 git stash pop"), "deny", "shared"],
  ["stash pop under command denied", bash("command git stash pop"), "deny", "shared"],
  ["stash pop under time denied", bash("time git stash pop"), "deny", "shared"],
  ["stash pop inside if denied", bash("if true; then git stash pop; fi"), "deny", "shared"],
  ["stash pop inside for denied", bash("for f in a; do git stash pop; done"), "deny", "shared"],
  ["stash apply with sha allowed", bash("git stash apply 0123abcd"), null, ""],
  ["stash drop by ref allowed", bash("git stash drop stash@{2}"), null, ""],
  ["named stash allowed", bash("git stash push -u -m 'tag' -- src/a.ts"), null, ""],
  ["stash list allowed", bash("git stash list --format='%H %gs'"), null, ""],
  ["grep for git stash allowed", bash("grep -rn 'git stash' .claude/"), null, ""],
  ["grep with paren before git stash allowed", bash('grep -rn "(git stash" .claude/'), null, ""],
  ["pr comment quoting the rule allowed", bash("gh pr comment 549 --body 'never use a bare git stash here'"), null, ""],
  ["issue comment with parenthesised stash allowed", bash('gh issue comment 1 --body "we should not run (git stash pop) in a worktree"'), null, ""],
  ["heredoc mentioning git stash allowed", bash("cat > notes.md <<'EOF'\nnever run git stash pop here\nEOF"), null, ""],
  ["perl wide char denied", bash("perl -0pi -e 's/a/−/' f.ts"), "deny", "re-encodes"],
  ["perl x-escape denied", bash("perl -pi -e 's/a/\\x{2212}/' f.ts"), "deny", "re-encodes"],
  ["perl ascii allowed", bash("perl -pi -e 's/foo/bar/' f.ts"), null, ""],
  ["grep mentioning perl -pi allowed", bash("grep -n 'perl -pi −' notes.md"), null, ""],
  ["pr body negated close denied", bash("gh pr create --body 'this PR does not close #518'"), "deny", "CLOSING"],
  ["pr body qualified negated close denied", bash("gh pr create --body 'does not close ahl-gram/Vellum#518'"), "deny", "CLOSING"],
  ["pr body em-dash denied", bash("gh pr edit 5 --body 'a — b'"), "deny", "em-dash"],
  ["issue body em-dash denied", bash("gh issue create --title t --body 'a — b'"), "deny", "em-dash"],
  ["pr comment em-dash denied", bash("gh pr comment 5 --body 'a — b'"), "deny", "em-dash"],
  ["issue comment negated close allowed", bash("gh issue comment 5 --body 'does not close #3'"), null, ""],
  ["typed -F field is not a body file", bash("gh issue comment 549 -F body=hello"), null, ""],
  ["pr body via subshell cat read", bash('gh pr create --body "$(cat body.md)"', SCRATCH), "deny", "em-dash"],
  ["relative body-file resolved against cwd", bash("gh pr create --body-file body.md", SCRATCH), "deny", "em-dash"],
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
  ["String.raw is the remedy and is allowed", edit("Write", "out/probe-x.mjs", "const P = String.raw`s.replace(/\\s+/g, ' ')`;"), "context", "## Gate 2"],
  ["odd backtick in a regex literal does not swallow code", edit("Write", "out/rewrap.mjs", "const md = /^```/;\nconst r = s.match(/\\s+/);"), "context", "## Gate 2"],
  ["escape inside a substitution template denied", edit("Write", "out/p.mjs", "const P = `a${1}b.split(/\\d/)`;"), "deny", "backtick"],
  ["e2e double-escaped gets gate 2", edit("Write", "scripts/e2e/suite-x.mjs", "const R = `(() => 'a b'.split(/\\\\s+/))()`;"), "context", "## Gate 2"],
  ["e2e regex literal outside backticks gets gate 2", edit("Write", "scripts/e2e/suite-x.mjs", "const a = s.match(/\\s+/);"), "context", "## Gate 2"],
  ["e2e .click() warns", edit("Edit", "scripts/e2e/suite-x.mjs", "el.click();"), "context", "pointer-events"],
  ["unit test file gets gate 1", edit("Edit", "test/site/thing.test.ts", "assert.ok(1);"), "context", "## Gate 1"],
  ["stylesheet gets gate 3", edit("Edit", "public/atelier.css", ".a { color: red }"), "context", "## Gate 3"],
  ["new page gets gate 4", edit("Write", "src/pages/never-exists-zz/index.astro", "---\n---"), "context", "## Gate 4"],
  // One fixture per ARM of the Gate 6 regex, because a roster is only as good as its least-swept alternative: the prover found 10 of 19 arms had no fixture, so a typo in any of them shipped silent.
  ...GATE6_ARMS.map(([arm, path]): Fixture => [`gate 6 arm: ${arm}`, edit("Edit", path, "x"), "context", "## Gate 6"]),
  ["gate 6 on the ABSOLUTE path a real tool call passes", edit("Edit", join(ROOT, "src/render/style.ts"), "x"), "context", "## Gate 6"],
  ["an earlier gate still wins a path that matches BOTH", edit("Edit", "src/render/x.css", ".a{}"), "context", "## Gate 3"],
  ["site source is not chart work", edit("Edit", "src/site/explorer/app.ts", "const x = 1;"), null, ""],
  ["the e2e CLI is not chart work", edit("Edit", "src/cli/e2e-suites.ts", "x"), null, ""],
  ["deployed: real project dir denies stash pop", deployed(STASH_POP, ROOT), "deny", "shared"],
  ["deployed: symlinked project dir denies stash pop", deployed(STASH_POP, LINK), "deny", "shared"],
  ["deployed: missing project dir exits 0 with no output", deployed(STASH_POP, "/nonexistent"), null, ""],
];

const run = async (): Promise<number> => {
  let fails = 0;
  const report = (ok: boolean, line: string): void => {
    fails += ok ? 0 : 1;
    console.log(`${ok ? "ok  " : "FAIL"} ${line}`);
  };
  mkdirSync(SCRATCH, { recursive: true });
  writeFileSync(join(SCRATCH, "body.md"), "a — b\n");
  symlinkSync(ROOT, LINK);
  for (const label of ["Gate 1", "Gate 2", "Gate 3", "Gate 4", "Gate 5", "Gate 6"]) report(gateText(label).length > 200, `${label} text found in SKILL.md`);
  for (const [name, subject, want, needle] of FIXTURES) {
    const sessionId = `selftest-${process.pid}-${name}`;
    const got = typeof subject === "function" ? await subject() : await decide({ ...subject, session_id: sessionId });
    const out = got?.hookSpecificOutput;
    const kind: Kind = out ? (out.permissionDecision === "deny" ? "deny" : "context") : null;
    const text = out?.permissionDecisionReason ?? out?.additionalContext ?? "";
    report(kind === want && text.includes(needle), `${name}: want ${want} with ${JSON.stringify(needle)}, got ${kind}`);
    try {
      unlinkSync(statePath(sessionId));
    } catch {
      /* nothing was written for a null decision */
    }
  }
  rmSync(SCRATCH, { recursive: true, force: true });
  return fails;
};

const isEntry = (): boolean => {
  try {
    return process.argv[1] !== undefined && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
};

if (isEntry()) process.exit(await run());
