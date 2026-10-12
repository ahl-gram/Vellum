import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { shellRefusal, toolRefusal } from "../../.opencode/plugins/footguns/refusal.ts";

const ROOT = process.cwd();
const SILENT_ESCAPE_SOURCE = "const split = `a\\sb`;\n";

test("the OpenCode plugin refuses a shell command the Claude hook denies, and lets a harmless one through", async () => {
  assert.match((await shellRefusal({ command: "git stash pop", cwd: ROOT })) ?? "", /refs\/stash/);
  assert.equal(await shellRefusal({ command: "echo hi", cwd: ROOT }), null);
});

test("the OpenCode plugin hands the shell's own cwd to the rules, so a relative --body-file is read from where the command runs", async () => {
  const dir = mkdtempSync(join(tmpdir(), "opencode-footguns-"));
  try {
    writeFileSync(join(dir, "pr-body.md"), "A sentence — with a dash.\n");
    assert.match((await shellRefusal({ command: "gh pr create --body-file pr-body.md", cwd: dir })) ?? "", /em-dash/);
    assert.equal(await shellRefusal({ command: "gh pr create --body-file pr-body.md", cwd: ROOT }), null);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a bare cd passes under OpenCode, whose shell starts every call in the project directory (measured 2026-10-12: pwd after `cd sub` printed the start)", async () => {
  assert.equal(await shellRefusal({ command: "cd test", cwd: ROOT }), null);
});

test("the OpenCode write and edit tools map onto the Claude hook's fields, so a single-escaped regex in a browser script is refused", async () => {
  const write = { tool: "write", input: { path: "scripts/probe.ts", content: SILENT_ESCAPE_SOURCE } };
  const edit = { tool: "edit", input: { path: "scripts/probe.ts", oldString: "x", newString: SILENT_ESCAPE_SOURCE } };
  assert.match((await toolRefusal(write)) ?? "", /inside a backtick string/);
  assert.match((await toolRefusal(edit)) ?? "", /inside a backtick string/);
  assert.equal(await toolRefusal({ ...write, input: { ...write.input, path: "src/probe.ts" } }), null);
  assert.equal(await toolRefusal({ ...edit, input: { ...edit.input, path: "src/probe.ts" } }), null);
});

test("an OpenCode tool the plugin does not map is never refused, whatever fields it carries", async () => {
  for (const tool of ["read", "multiedit", "patch", "apply_patch", "bash", "shell", "glob"]) {
    const input = { path: "scripts/probe.ts", content: SILENT_ESCAPE_SOURCE, newString: SILENT_ESCAPE_SOURCE };
    assert.equal(await toolRefusal({ tool, input }), null, tool);
  }
});

test("a gate note or warning from the Claude hook is never turned into a refusal", async () => {
  assert.equal(await shellRefusal({ command: "pkill brave", cwd: ROOT }), null);
  const noisy = "const re = `a\\(b`;\n";
  assert.equal(await toolRefusal({ tool: "write", input: { path: "scripts/probe.ts", content: noisy } }), null);
  assert.equal(await toolRefusal({ tool: "edit", input: { path: "scripts/probe.ts", newString: noisy } }), null);
});

test("a call the rules cannot read fails open rather than refusing every command", async () => {
  assert.equal(await shellRefusal({ command: 5 as unknown as string, cwd: ROOT }), null);
  assert.equal(await toolRefusal({ tool: "write" }), null);
  assert.equal(await toolRefusal({ tool: "edit" }), null);
});

test("switching off the bare-cd refusal leaves every other shell refusal standing", async () => {
  const scriptWrite = `cat > scripts/probe.ts <<'EOF'\n${SILENT_ESCAPE_SOURCE}EOF`;
  assert.match((await shellRefusal({ command: scriptWrite, cwd: ROOT })) ?? "", /inside a backtick string/);
  assert.match((await shellRefusal({ command: "perl -pi -e 's/a/é/' file.txt", cwd: ROOT })) ?? "", /non-ASCII/);
  assert.match(
    (await shellRefusal({ command: "gh api repos/o/r/issues/1 -f body=x", cwd: ROOT })) ?? "",
    /switches `gh api` to POST/,
  );
});
