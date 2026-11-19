import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { format } from "prettier";
import { parse } from "smol-toml";
import { frontMatterOf } from "../../test-support/front-matter.ts";
import { trackedUnder } from "../../test-support/tracked-files.ts";

const REPO = resolve(import.meta.dirname, "..", "..");
const LOADED = /^\.claude\/(?:agents\/[^/]+\.md|skills\/[^/]+\/SKILL\.md)$/;
const CODEX_KEYS = ["name", "description", "model", "model_reasoning_effort", "developer_instructions"];

async function yamlProblem(frontMatter: string): Promise<string | null> {
  try {
    await format(frontMatter, { parser: "yaml" });
    return null;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return message.split("\n")[0] ?? message;
  }
}

const trackedLoaded = (): ReadonlyArray<string> =>
  trackedUnder(".claude/agents", ".claude/skills").filter((f) => LOADED.test(f));

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

test("every Codex agent file parses as TOML to a string under each of the five keys Codex reads and no other key, since Codex drops a role silently over a parse error or a key it does not know", () => {
  const files = trackedUnder(".codex/agents");
  assert.ok(files.length > 0, "the listing found no Codex agent: it is broken");
  const problems = files.flatMap((file) => {
    if (!file.endsWith(".toml")) return [`${file} is not a .toml file`];
    try {
      const doc = parse(readFileSync(resolve(REPO, file), "utf8"));
      const keys = Object.keys(doc);
      if (keys.join(",") !== CODEX_KEYS.join(",")) return [`${file} holds the keys ${keys.join(", ")}`];
      return keys.filter((key) => typeof doc[key] !== "string").map((key) => `${file}: ${key} is not a string`);
    } catch (error) {
      return [`${file} is not TOML: ${error instanceof Error ? error.message.split("\n")[0] : String(error)}`];
    }
  });
  assert.deepEqual(problems, []);
});

test("the check refuses an unquoted value holding a colon and a space, and passes the quoted form", async () => {
  const bare = "name: a\ndescription: It takes no design decision: where the plan is wrong\n";
  const quoted = 'name: a\ndescription: "It takes no design decision: where the plan is wrong"\n';
  assert.notEqual(await yamlProblem(bare), null);
  assert.equal(await yamlProblem(quoted), null);
});
