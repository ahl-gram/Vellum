import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { format } from "prettier";

const REPO = resolve(import.meta.dirname, "..", "..");
const GIT_TIMEOUT_MS = 30_000;
const LOADED = /^\.claude\/(?:agents\/[^/]+\.md|skills\/[^/]+\/SKILL\.md)$/;

function frontMatterOf(text: string): string | null {
  return /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(text)?.[1] ?? null;
}

async function yamlProblem(frontMatter: string): Promise<string | null> {
  try {
    await format(frontMatter, { parser: "yaml" });
    return null;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return message.split("\n")[0] ?? message;
  }
}

function trackedLoaded(): ReadonlyArray<string> {
  const listing = spawnSync("git", ["ls-files", "-z", "--", ".claude/agents", ".claude/skills"], {
    cwd: REPO,
    encoding: "utf8",
    timeout: GIT_TIMEOUT_MS,
  });
  assert.equal(listing.status, 0, `git ls-files failed: ${listing.error?.message ?? listing.stderr}`);
  return listing.stdout
    .split("\0")
    .filter(Boolean)
    .filter((f) => LOADED.test(f));
}

test("every agent and skill file opens with front matter that parses as YAML", async () => {
  const files = trackedLoaded();
  assert.ok(
    files.some((f) => f.startsWith(".claude/agents/")) && files.some((f) => f.endsWith("/SKILL.md")),
    "the listing found no agent or no skill: it is broken",
  );
  const problems: string[] = [];
  for (const file of files) {
    const frontMatter = frontMatterOf(readFileSync(resolve(REPO, file), "utf8"));
    if (frontMatter === null) {
      problems.push(`${file} has no front matter`);
      continue;
    }
    const problem = await yamlProblem(frontMatter);
    if (problem !== null) problems.push(`${file}: ${problem}`);
  }
  assert.deepEqual(
    problems,
    [],
    `${problems.length} file(s) whose front matter GitHub refuses to render. Quote the value, or reword it, since an unquoted ` +
      `value cannot hold a colon followed by a space.\n  ${problems.join("\n  ")}`,
  );
});

test("the check refuses an unquoted value holding a colon and a space, and passes the quoted form", async () => {
  const bare = "name: a\ndescription: It takes no design decision: where the plan is wrong\n";
  const quoted = 'name: a\ndescription: "It takes no design decision: where the plan is wrong"\n';
  assert.notEqual(await yamlProblem(bare), null);
  assert.equal(await yamlProblem(quoted), null);
});
