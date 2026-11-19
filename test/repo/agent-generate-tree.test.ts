import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, statSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { GenerationError } from "../../scripts/agent-infra/errors.ts";
import { checkGeneratedFiles, writeGeneratedFiles } from "../../scripts/agent-infra/generate.ts";
import { HARNESSES, POLICY_FILE, ROLES, adapterPath, roleBodyPath } from "../../scripts/agent-infra/roles.ts";
import { commitAll, withTempRepo } from "../../test-support/proof-runner-repo.ts";

const REPO = resolve(import.meta.dirname, "..", "..");
const MAIN = join(REPO, "scripts", "agent-infra", "main.ts");
// 2026-11-18: a check or a generate over the seven roles runs in under a second on a Mac; thirty seconds is a cap on a hang, not a budget.
const CHILD_TIMEOUT_MS = 30_000;
const DIFFERS = "differs from what npm run agents:generate writes from handbook/agents/ and .agents/model-policy.json";

const inputs = (): Record<string, string> =>
  Object.fromEntries(
    [...ROLES.map((role) => roleBodyPath(role.name)), ...HARNESSES.map(adapterPath), POLICY_FILE].map((path) => [
      path,
      readFileSync(join(REPO, path), "utf8"),
    ]),
  );

function snapshot(dir: string): ReadonlyMap<string, string> {
  const files = new Map<string, string>();
  const walk = (rel: string): void => {
    for (const name of readdirSync(join(dir, rel))) {
      const path = rel === "" ? name : `${rel}/${name}`;
      if (path === ".git") continue;
      if (statSync(join(dir, path)).isDirectory()) walk(path);
      else files.set(path, readFileSync(join(dir, path), "utf8"));
    }
  };
  walk("");
  return files;
}

const generated = async (body: (dir: string) => void): Promise<void> =>
  withTempRepo(inputs(), (dir) => {
    assert.equal(writeGeneratedFiles(dir).length, ROLES.length * HARNESSES.length);
    commitAll(dir, "generated");
    body(dir);
  });

const cli = (dir: string, ...args: string[]) =>
  spawnSync(process.execPath, [MAIN, ...args], { cwd: dir, encoding: "utf8", timeout: CHILD_TIMEOUT_MS });

test("the check names an edited definition and a deleted one, writes nothing, and reports a tracked definition no role generates but not an untracked one", async () => {
  await generated((dir) => {
    assert.deepEqual(checkGeneratedFiles(dir), []);
    writeFileSync(join(dir, ".claude/agents/vellum-planner.md"), "edited by hand\n");
    unlinkSync(join(dir, ".codex/agents/vellum-spec-recon.toml"));
    writeFileSync(join(dir, ".claude/agents/vellum-retired.md"), "---\nname: vellum-retired\n---\n");
    commitAll(dir, "a stray is tracked");
    writeFileSync(join(dir, ".claude/agents/private.md"), "a private agent\n");
    const before = snapshot(dir);
    assert.deepEqual(checkGeneratedFiles(dir), [
      { path: ".claude/agents/vellum-planner.md", problem: DIFFERS },
      {
        path: ".claude/agents/vellum-retired.md",
        problem: "is tracked, but no role in scripts/agent-infra/roles.ts generates it",
      },
      { path: ".codex/agents/vellum-spec-recon.toml", problem: "is missing: run npm run agents:generate" },
    ]);
    assert.deepEqual(snapshot(dir), before);
  });
});

test("generating writes only the definitions that differ, and leaves an unmanaged agent of either harness and the settings file as they were", async () => {
  await generated((dir) => {
    writeFileSync(join(dir, ".claude/agents/private.md"), "mine\n");
    writeFileSync(join(dir, ".codex/agents/private.toml"), 'name = "private"\n');
    writeFileSync(join(dir, ".claude/settings.json"), '{ "keep": true }\n');
    unlinkSync(join(dir, ".codex/agents/vellum-planner.toml"));
    const before = snapshot(dir);
    assert.deepEqual(writeGeneratedFiles(dir), [".codex/agents/vellum-planner.toml"]);
    const after = snapshot(dir);
    assert.deepEqual(
      [...after.keys()].filter((path) => after.get(path) !== before.get(path)),
      [".codex/agents/vellum-planner.toml"],
    );
    assert.deepEqual(checkGeneratedFiles(dir), []);
  });
});

test("generating refuses, writing nothing, when a definition's path is a link or a folder", async () => {
  await withTempRepo({ ...inputs(), "outside.txt": "untouched\n" }, (dir) => {
    mkdirSync(join(dir, ".codex/agents"), { recursive: true });
    symlinkSync("../../outside.txt", join(dir, ".codex/agents/vellum-planner.toml"));
    mkdirSync(join(dir, ".claude/agents/vellum-designer.md"), { recursive: true });
    const before = snapshot(dir);
    assert.throws(
      () => writeGeneratedFiles(dir),
      (e) =>
        e instanceof GenerationError &&
        /^nothing written: \.claude\/agents\/vellum-designer\.md, \.codex\/agents\/vellum-planner\.toml is not a regular file/.test(
          e.message,
        ),
    );
    assert.deepEqual(snapshot(dir), before);
  });
});

test("the command line checks with exit 0 or 1, generates with exit 0, and answers a mode it does not know with its usage and exit 2", async () => {
  await generated((dir) => {
    const clean = cli(dir, "check");
    assert.equal(clean.status, 0, clean.stderr);
    assert.match(clean.stdout, /every generated agent definition is current/);
    writeFileSync(join(dir, ".codex/agents/vellum-designer.toml"), "edited\n");
    const drifted = cli(dir, "check");
    assert.equal(drifted.status, 1);
    assert.match(drifted.stderr, /^\.codex\/agents\/vellum-designer\.toml: differs from what/m);
    const fixed = cli(dir, "generate");
    assert.equal(fixed.status, 0, fixed.stderr);
    assert.match(fixed.stdout, /^wrote \.codex\/agents\/vellum-designer\.toml$/m);
    assert.equal(cli(dir, "check").status, 0);
    const unknown = cli(dir);
    assert.equal(unknown.status, 2);
    assert.match(unknown.stderr, /^usage: node scripts\/agent-infra\/main\.ts generate \| check/);
  });
});
