/**
 * The footgun hook's fixture table. `node footgun-gate.selftest.ts` prints one line per fixture and exits with the
 * number of misses; test/repo/footgun-gate.test.ts runs it under npm test. The deployed rows run the exact command
 * string from .claude/settings.json through sh with a real, a symlinked, and a missing CLAUDE_PROJECT_DIR.
 */
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, realpathSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { decide, gateText, headingCheck, requiredHeadings, statePath, type Decision, type Payload } from "./footgun-gate.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..", "..", "..");
const SCRATCH = join(tmpdir(), `footgun-selftest-${process.pid}`); // named here, created in run(): FIXTURES needs the path at module scope, and a module that mints a temp dir just by being imported leaks one per import
const LINK = join(SCRATCH, "linked-root");
const TEMPLATE_PATH = join(ROOT, ".github", "PULL_REQUEST_TEMPLATE.md");
// A checkout of the hook with no .github/ beside it. TEMPLATE resolves from the hook file's own directory, so this is the only way to drive decide() down the no-template path: an env override would be a seam that exists for the test, and calling headingCheck directly skips ghRefusal, which is where the warning could be returned in the wrong tuple slot.
const ROOTLESS = join(SCRATCH, "rootless");
const ROOTLESS_HOOK = join(ROOTLESS, ".claude", "skills", "vellum-footguns", "hooks", "footgun-gate.ts");
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
// The five section names are written out HERE and derived in the hook. That asymmetry is the guard: a heading renamed in the template changes only one side, so these rows red instead of the hook silently enforcing yesterday's shape.
const SECTIONS = ["## Guards", "## Ran", "## Records", "## Rulings", "## Look for these when you use it"];
const bodyWith = (sections: string[]): string => `#577 a title\n\nwhat changed.\n\n${sections.join("\n\nprose under it\n\n")}\n\nprose under it\n`;
const WHOLE_BODY = bodyWith(SECTIONS);
const prBody = (text: string): Payload => bash(`gh pr create --body '${text}'`);
const headingRows = (): Fixture[] =>
  SECTIONS.map((heading): Fixture => [
    `pr body missing ${heading} denied`,
    prBody(bodyWith(SECTIONS.filter((s) => s !== heading))),
    "deny",
    `"${heading}"`,
  ]);
const asContext = (text: string): Decision => ({ hookSpecificOutput: { hookEventName: "PreToolUse", additionalContext: text } });
// The unlink is what lets the two rows share a session id: the gate is once per session, so without it the second row would see no Gate 5 and read as the warning having swallowed it. The FIXTURES loop's own unlink does not reach a function subject.
const inRootlessCheckout = (payload: Payload) => async (): Promise<Decision> => {
  const session = `rootless-${process.pid}`;
  try {
    return readDeployed(() => execFileSync(process.execPath, [ROOTLESS_HOOK], { input: JSON.stringify({ ...payload, session_id: session }), encoding: "utf8" }));
  } finally {
    try {
      unlinkSync(statePath(session));
    } catch {
      /* nothing was written when no gate fired */
    }
  }
};
// Returns a deny when the check denied, so a row wanting context reds on the channel itself rather than on the text: warn and deny are different slots and only one of them stops the call.
const templateCheck = (file: string) => async (): Promise<Decision> => {
  const { deny: reason, warn } = headingCheck(WHOLE_BODY, file);
  return reason
    ? { hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: reason } }
    : asContext(warn ?? "");
};
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
  ["perl pipe delimiter escaped in the pattern denied", bash("perl -0pi -e 's|world\\||PLANET|' f.ts"), "deny", "EMPTY BRANCH"],
  ["perl pipe delimiter under double quotes denied", bash('perl -pi -e "s|a\\|b|c|" f.ts'), "deny", "EMPTY BRANCH"],
  ["perl escaped pipe in the REPLACEMENT allowed", bash("perl -pi -e 's|a|b\\|c|' f.ts"), null, ""],
  ["perl pipe delimiter with nothing escaped allowed", bash("perl -pi -e 's|/usr/local|/opt|' f.ts"), null, ""],
  ["perl pipe substitution without -i allowed", bash("perl -pe 's|a\\|b|c|' f.ts"), null, ""],
  ["grep quoting a pipe-delimited substitution allowed", bash("grep -n 's|a\\|b|c|' notes.md"), null, ""],
  // The documented over-reach, pinned rather than left to drift: the pipe branch scans the RAW command because the segmenter blanks the payload, so a safe perl -i beside an unrelated quoted pipe substitution is refused. README names it as refusal-not-silence; the non-ASCII branch beside it has the same shape.
  ["perl -i beside an unrelated pipe substitution is refused, by design", bash("perl -pi -e 's/a/b/' f.ts && echo 's|x\\|y|z|'"), "deny", "EMPTY BRANCH"],
  ["pr body negated close denied", bash("gh pr create --body 'this PR does not close #518'"), "deny", "CLOSING"],
  ["pr body qualified negated close denied", bash("gh pr create --body 'does not close ahl-gram/Vellum#518'"), "deny", "CLOSING"],
  ["pr body em-dash denied", bash("gh pr edit 5 --body 'a — b'"), "deny", "em-dash"],
  ["issue body em-dash denied", bash("gh issue create --title t --body 'a — b'"), "deny", "em-dash"],
  ["pr comment em-dash denied", bash("gh pr comment 5 --body 'a — b'"), "deny", "em-dash"],
  ["issue comment negated close allowed", bash("gh issue comment 5 --body 'does not close #3'"), null, ""],
  ["typed -F field is not a body file", bash("gh issue comment 549 -F body=hello"), null, ""],
  // One row per ARM of the gh api refusal, on the Gate 6 precedent that a roster is only as strong as its least-swept alternative.
  ["gh api issue body overwrite denied", bash("gh api repos/o/r/issues/193 -f body='new text'"), "deny", "bare issue or pull-request endpoint"],
  ["gh api quoted body assignment denied", bash('gh api repos/o/r/issues/193 -f "body=new text"'), "deny", "bare issue or pull-request endpoint"],
  ["gh api glued short field denied", bash("gh api repos/o/r/issues/193 -fbody=x"), "deny", "bare issue or pull-request endpoint"],
  ["gh api typed field denied", bash("gh api repos/o/r/issues/193 -F body=@body.md"), "deny", "bare issue or pull-request endpoint"],
  ["gh api --field denied", bash("gh api repos/o/r/issues/193 --field body=x"), "deny", "bare issue or pull-request endpoint"],
  ["gh api --raw-field denied", bash("gh api repos/o/r/issues/193 --raw-field body=x"), "deny", "bare issue or pull-request endpoint"],
  ["gh api --input denied", bash("gh api repos/o/r/issues/193 --input body.json"), "deny", "bare issue or pull-request endpoint"],
  ["gh api owner placeholders denied", bash("gh api repos/{owner}/{repo}/issues/193 -f body=x"), "deny", "bare issue or pull-request endpoint"],
  ["gh api leading-slash path denied", bash("gh api /repos/o/r/issues/193 -f body=x"), "deny", "bare issue or pull-request endpoint"],
  ["gh api absolute url denied", bash("gh api https://api.github.com/repos/o/r/issues/193 -f body=x"), "deny", "bare issue or pull-request endpoint"],
  ["gh api trailing-slash path denied", bash("gh api repos/o/r/issues/193/ -f body=x"), "deny", "bare issue or pull-request endpoint"],
  ["gh api explicit POST denied", bash("gh api repos/o/r/issues/193 -X POST -f body=x"), "deny", "bare issue or pull-request endpoint"],
  ["gh api non-body field denied too", bash("gh api repos/o/r/issues/193 -f state=closed"), "deny", "bare issue or pull-request endpoint"],
  ["gh api bare pull-request path denied", bash("gh api repos/o/r/pulls/550 -f body=x"), "deny", "bare issue or pull-request endpoint"],
  ["gh api comments endpoint allowed", bash("gh api repos/o/r/issues/193/comments -f body='x'"), null, ""],
  ["gh api comments with placeholders allowed", bash("gh api repos/{owner}/{repo}/issues/123/comments -f body='Hi from CLI'"), null, ""],
  ["gh api issue sub-resource allowed", bash("gh api repos/o/r/issues/193/labels -f labels[]=chore"), null, ""],
  ["gh api pull-request sub-resource allowed", bash("gh api repos/o/r/pulls/550/reviews -f body=x"), null, ""],
  ["gh api -X PATCH allowed", bash("gh api repos/o/r/issues/193 -X PATCH -f body=x"), null, ""],
  ["gh api -X PATCH before the path allowed", bash("gh api -X PATCH repos/o/r/issues/193 -f body=x"), null, ""],
  ["gh api --method PATCH allowed", bash("gh api repos/o/r/issues/193 --method PATCH -f body=x"), null, ""],
  ["gh api --method=PATCH allowed", bash("gh api repos/o/r/issues/193 --method=PATCH -f body=x"), null, ""],
  ["gh api glued -XPATCH allowed", bash("gh api repos/o/r/issues/193 -XPATCH -f body=x"), null, ""],
  ["gh api -X GET on an issue allowed", bash("gh api -X GET repos/o/r/issues/193 -f q=foo"), null, ""],
  ["gh api -X GET with query params allowed", bash("gh api -X GET search/issues -f q=foo"), null, ""],
  ["gh api issue create allowed", bash("gh api repos/o/r/issues -f title=t -f body=b"), null, ""],
  ["gh api pull-request create allowed", bash("gh api repos/o/r/pulls -f title=t"), null, ""],
  // The prover's one escape: with the number quantifier relaxed to \d*, every mutation-visible row still passed, so the digits were dead precision. This row is what makes them load-bearing, and it is an over-refusal that is being pinned out, not a footgun being let in.
  ["gh api issue create with a trailing slash allowed", bash("gh api repos/o/r/issues/ -f title=t"), null, ""],
  ["gh api an item path inside a field VALUE is not the endpoint", bash("gh api repos/o/r/issues -f body=see-repos/o/r/issues/193"), null, ""],
  ["gh api bare read allowed", bash("gh api repos/o/r/issues/193"), null, ""],
  ["gh api read with jq allowed", bash("gh api repos/o/r/issues/193 --jq .body"), null, ""],
  // The shape a raw-command scan would have false-refused: the first segment is a bare issue path while the whole command carries -f body=.
  ["gh api read then comment in one call allowed", bash("gh api repos/o/r/issues/193 --jq .title; gh api repos/o/r/issues/193/comments -f body='x'"), null, ""],
  ["pr body via subshell cat read", bash('gh pr create --body "$(cat body.md)"', SCRATCH), "deny", "em-dash"],
  ["relative body-file resolved against cwd", bash("gh pr create --body-file body.md", SCRATCH), "deny", "em-dash"],
  ["unreadable body-file warns", bash("gh pr create --body-file nope.md", "/"), "context", "could not read"],
  ["pr body clean and whole gets gate 5 once", prBody(`Closes #519. #518 stays open.\n\n${WHOLE_BODY}`), "context", "## Gate 5"],
  ...headingRows(),
  ["a section named mid-line does not count as the section", prBody(bodyWith(["see the ## Guards section above", ...SECTIONS.slice(1)])), "deny", "## Guards"],
  ["short -b body carrying every section allowed", bash(`gh pr create -b '${WHOLE_BODY}'`), "context", "## Gate 5"],
  ["pr edit with no body at all is not held to the shape", bash("gh pr edit 5 --add-label chore"), "context", "## Gate 5"],
  ["--fill builds the body inside gh and is not checked", bash("gh pr create --fill"), "context", "## Gate 5"],
  ["an inline body in a shell variable is not checked", bash('gh pr create --body "$BODY"'), "context", "## Gate 5"],
  ["an inline body from an unreadable file is not checked", bash('gh pr create --body "$(cat nope.md)"', "/"), "context", "could not read"],
  ["pr comment is not held to the PR body shape", bash("gh pr comment 5 --body 'a note'"), null, ""],
  ["issue create is not held to the PR body shape", bash("gh issue create --title t --body 'a note'"), null, ""],
  ["a missing template warns and never denies", templateCheck("/nonexistent/PULL_REQUEST_TEMPLATE.md"), "context", "there is no PR template"],
  ["a readable --body-file missing a section is denied", bash("gh pr create --body-file no-ran.md", SCRATCH), "deny", '"## Ran"'],
  ["a readable --body-file carrying every section is allowed", bash("gh pr create --body-file whole.md", SCRATCH), "context", "## Gate 5"],
  ["a $(cat file) on a non-body flag is not a PR body", bash("gh pr edit 5 --add-label \"$(cat no-ran.md)\"", SCRATCH), "context", "## Gate 5"],
  ["a literal $ in a single-quoted body does not disarm the check", prBody(`${bodyWith(SECTIONS.filter((x) => x !== "## Ran"))}\nit cost $5\n`), "deny", '"## Ran"'],
  // decide() down the real no-template path, not headingCheck in isolation: these two are the only rows that can see a warning returned through ghRefusal's DECISION slot, which short-circuits checkBash before the Gate 5 note is pushed.
  ["a checkout with no template warns through the deployed path", inRootlessCheckout(bash(`gh pr create --body '${WHOLE_BODY}'`)), "context", "there is no PR template"],
  ["a checkout with no template still shows gate 5", inRootlessCheckout(bash(`gh pr create --body '${WHOLE_BODY}'`)), "context", "## Gate 5"],
  ["a headingless template says so rather than missing", templateCheck(join(SCRATCH, "headingless.md")), "context", "carries no `## ` heading"],
  // The same payload as the row above it, with the other needle: a warning returned in ghRefusal's DECISION slot short-circuits checkBash before the Gate 5 note is pushed, and every row that asserts only the warning's own text passes while the gate is gone.
  ["a warning does not swallow the gate 5 note", bash("gh pr create --body-file nope.md", "/"), "context", "## Gate 5"],
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
  writeFileSync(join(SCRATCH, "headingless.md"), "# a template with no sections\n\nprose only.\n");
  writeFileSync(join(SCRATCH, "no-ran.md"), bodyWith(SECTIONS.filter((x) => x !== "## Ran")));
  writeFileSync(join(SCRATCH, "whole.md"), WHOLE_BODY);
  mkdirSync(dirname(ROOTLESS_HOOK), { recursive: true });
  cpSync(join(HERE, "footgun-gate.ts"), ROOTLESS_HOOK);
  cpSync(join(HERE, "..", "SKILL.md"), join(ROOTLESS, ".claude", "skills", "vellum-footguns", "SKILL.md"));
  symlinkSync(ROOT, LINK);
  for (const label of ["Gate 1", "Gate 2", "Gate 3", "Gate 4", "Gate 5", "Gate 6"]) report(gateText(label).length > 200, `${label} text found in SKILL.md`);
  report(requiredHeadings() !== null, "section names found in .github/PULL_REQUEST_TEMPLATE.md");
  report(!readFileSync(TEMPLATE_PATH, "utf8").includes("—"), "the PR template carries no em-dash to prefill a body with");
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
