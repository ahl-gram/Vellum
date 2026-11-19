import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { parse } from "smol-toml";
import { parseAdapter } from "../../scripts/agent-infra/adapters.ts";
import { checkGeneratedFiles, planGeneratedFiles } from "../../scripts/agent-infra/generate.ts";
import { loadModelPolicy, resolveModel } from "../../scripts/agent-infra/model-policy.ts";
import {
  HARNESSES,
  ROLES,
  adapterPath,
  outputPath,
  roleBodyPath,
  type HarnessId,
} from "../../scripts/agent-infra/roles.ts";

const REPO = resolve(import.meta.dirname, "..", "..");
const CODEX_KEYS = ["name", "description", "model", "model_reasoning_effort", "developer_instructions"];
// Claude's column is each definition's front matter as it stood before the generator; Codex's is Alex's D8 ruling on Issue #1399.
const RULED: Readonly<Record<HarnessId, Readonly<Record<string, readonly [string, string]>>>> = {
  "claude-code": {
    "vellum-designer": ["opus[1m]", "xhigh"],
    "vellum-guard-prover": ["sonnet[1m]", "medium"],
    "vellum-implementer": ["sonnet[1m]", "high"],
    "vellum-planner": ["opus[1m]", "xhigh"],
    "vellum-plate-reader": ["sonnet[1m]", "medium"],
    "vellum-pr-skeptic": ["opus[1m]", "high"],
    "vellum-spec-recon": ["sonnet[1m]", "medium"],
  },
  "codex-local": {
    "vellum-designer": ["gpt-6.2-sol", "xhigh"],
    "vellum-guard-prover": ["gpt-6.2-sol", "medium"],
    "vellum-implementer": ["gpt-6.2-sol", "high"],
    "vellum-planner": ["gpt-6.2-astra", "xhigh"],
    "vellum-plate-reader": ["gpt-6.2-sol", "medium"],
    "vellum-pr-skeptic": ["gpt-6.2-sol", "high"],
    "vellum-spec-recon": ["gpt-6.2-sol", "medium"],
  },
};
const CLAUDE_ONLY = [
  "AskUserQuestion",
  "EnterWorktree",
  "CLAUDE_EFFORT",
  "Edit tool",
  "Write tool",
  "Edit and Write",
  "no Edit",
  "harness worktree",
  "Harness worktree",
  "isolation through the harness",
  "baseRef",
];

const planned = (): ReadonlyMap<string, string> => new Map(planGeneratedFiles(REPO).map((f) => [f.path, f.text]));
const plannedText = (files: ReadonlyMap<string, string>, path: string): string => {
  const text = files.get(path);
  assert.ok(text !== undefined, `the generator plans no ${path}`);
  return text;
};

test("every generated agent definition is what npm run agents:generate writes, and no tracked definition lacks a role", () => {
  assert.deepEqual(checkGeneratedFiles(REPO), []);
});

test("the manifest holds the seven roles, and each resolves under each harness to the model and effort Alex ruled", () => {
  assert.deepEqual(
    ROLES.map((role) => role.name),
    Object.keys(RULED["claude-code"]),
  );
  const policy = loadModelPolicy(REPO, ROLES);
  for (const harness of HARNESSES)
    for (const role of ROLES) {
      const ruled = RULED[harness][role.name];
      assert.ok(ruled !== undefined, `no ruling for ${role.name} under ${harness}`);
      assert.deepEqual(resolveModel(policy, harness, role.name), { model: ruled[0], effort: ruled[1] });
    }
});

test("each Codex definition parses as TOML to its five keys alone: its file's name, its role's description, the ruled model and effort, and its body's every unslotted line in order before the Codex appendix", () => {
  const files = planned();
  const appendixEnd = readFileSync(resolve(REPO, adapterPath("codex-local")), "utf8")
    .trimEnd()
    .split("\n")
    .at(-1);
  assert.ok(
    appendixEnd?.startsWith("- **A decision for Alex**"),
    "the Codex adapter no longer ends with its menu rule",
  );
  for (const role of ROLES) {
    const path = outputPath("codex-local", role.name);
    const doc = parse(plannedText(files, path));
    assert.deepEqual(Object.keys(doc), CODEX_KEYS, path);
    const ruled = RULED["codex-local"][role.name];
    assert.deepEqual(
      [doc["name"], doc["description"], doc["model"], doc["model_reasoning_effort"]],
      [basename(path, ".toml"), role.description, ruled?.[0], ruled?.[1]],
      path,
    );
    const instructions = doc["developer_instructions"];
    assert.ok(typeof instructions === "string", `${path}: developer_instructions is not a string`);
    assert.ok(instructions.endsWith(`\n${appendixEnd}\n`), `${path} does not end with the Codex appendix`);
    let from = 0;
    for (const line of readFileSync(resolve(REPO, roleBodyPath(role.name)), "utf8").split("\n")) {
      if (line.includes("{{harness:")) continue;
      const at = instructions.indexOf(`${line}\n`, from);
      assert.notEqual(at, -1, `${path} lost or reordered the body line ${JSON.stringify(line.slice(0, 80))}`);
      from = at + line.length + 1;
    }
  }
});

test("no Codex definition carries a step only Claude Code can take, and every such step is still in a Claude definition", () => {
  const files = planned();
  const path = adapterPath("claude-code");
  const slots = [...parseAdapter(readFileSync(resolve(REPO, path), "utf8"), path).slots];
  assert.ok(slots.length > 0, "the Claude adapter defines no harness steps");
  const claude = ROLES.map((role) => plannedText(files, outputPath("claude-code", role.name))).join("\n");
  for (const phrase of CLAUDE_ONLY) assert.ok(claude.includes(phrase), `no Claude definition says ${phrase} any more`);
  for (const [name, text] of slots) assert.ok(claude.includes(text), `no Claude definition retains the ${name} step`);
  const phraseLeaks = ROLES.flatMap((role) => {
    const text = plannedText(files, outputPath("codex-local", role.name));
    return CLAUDE_ONLY.filter((phrase) => text.includes(phrase)).map((phrase) => `${role.name}: ${phrase}`);
  });
  assert.deepEqual(phraseLeaks, []);
  const leaks = ROLES.flatMap((role) => {
    const text = plannedText(files, outputPath("codex-local", role.name));
    return slots.filter(([, step]) => text.includes(step)).map(([name]) => `${role.name}: ${name}`);
  });
  assert.deepEqual(leaks, []);
});

test("npm run agents:generate and npm run agents:check run the generator's two modes", () => {
  const scripts: unknown = (JSON.parse(readFileSync(resolve(REPO, "package.json"), "utf8")) as { scripts?: unknown })
    .scripts;
  assert.ok(typeof scripts === "object" && scripts !== null, "package.json has no scripts");
  assert.equal((scripts as Record<string, unknown>)["agents:generate"], "node scripts/agent-infra/main.ts generate");
  assert.equal((scripts as Record<string, unknown>)["agents:check"], "node scripts/agent-infra/main.ts check");
});
