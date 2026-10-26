import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Issue #1087: vellum-plan-skeptic is retired. The harness loads every file in .claude/agents/, so a file left there is still dispatchable; the archived copy and the rulebook's tombstone are the only places that name it. Misses: .claude/skills, handbook/plans, handbook/errata and the scar rows, which are history by design, and any spelling that is neither "plan skeptic" nor "plan-skeptic".

const REPO = resolve(import.meta.dirname, "..", "..");
const GIT_TIMEOUT_MS = 30_000;
const LIVE_ROOTS = [".claude/agents", ".github", "handbook/specs", "CLAUDE.md"];
const RETIRED = "vellum-plan-skeptic.md";
const TOMBSTONE = "handbook/specs/rulebook.md";
const NAME = /plan[- ]skeptic/gi;

function tracked(...roots: string[]): ReadonlyArray<string> {
  const listing = spawnSync("git", ["ls-files", "-z", "--", ...roots], {
    cwd: REPO,
    encoding: "utf8",
    timeout: GIT_TIMEOUT_MS,
  });
  assert.equal(listing.status, 0, `git ls-files failed: ${listing.error?.message ?? listing.stderr}`);
  return listing.stdout.split("\0").filter(Boolean);
}

test("the retired plan skeptic's definition is archived under handbook/retired and no longer loaded as an agent", () => {
  assert.deepEqual(tracked(`.claude/agents/${RETIRED}`), [], "still loaded: it is dispatchable");
  assert.deepEqual(
    tracked(`handbook/retired/${RETIRED}`),
    [`handbook/retired/${RETIRED}`],
    "the archived copy is gone",
  );
});

test("no live agent, template, spec or CLAUDE.md names the plan skeptic, bar the rulebook's tombstone", () => {
  const files = tracked(...LIVE_ROOTS).filter((f) => f !== TOMBSTONE);
  assert.ok(files.length > 0, "the listing found no live file: it is broken");
  const findings = files.flatMap((f) => {
    const text = readFileSync(resolve(REPO, f), "utf8");
    return [...text.matchAll(NAME)].map((m) => `${f}:${text.slice(0, m.index).split("\n").length}`);
  });
  assert.deepEqual(findings, [], `${findings.length} live mention(s) of a retired agent:\n  ${findings.join("\n  ")}`);
});

test("the rulebook's tombstone names the retired agent and where it went", () => {
  const text = readFileSync(resolve(REPO, TOMBSTONE), "utf8");
  assert.match(text, /vellum-plan-skeptic/, "the tombstone is gone");
  assert.match(text, /handbook\/retired\/vellum-plan-skeptic\.md/, "the tombstone does not say where the file went");
});
