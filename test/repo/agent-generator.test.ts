import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { parse } from "smol-toml";
import { fillSlots, parseAdapter, slotsUsedIn } from "../../scripts/agent-infra/adapters.ts";
import { GenerationError } from "../../scripts/agent-infra/errors.ts";
import { planGeneratedFiles } from "../../scripts/agent-infra/generate.ts";
import { parseModelPolicy, resolveModel } from "../../scripts/agent-infra/model-policy.ts";
import {
  renderClaudeAgent,
  renderCodexAgent,
  tomlBasicString,
  tomlMultilineLiteral,
} from "../../scripts/agent-infra/render.ts";
import type { RoleDefinition } from "../../scripts/agent-infra/roles.ts";

const ROLE: RoleDefinition = {
  name: "vellum-fixture",
  description: 'A fixture\'s "quoted" description with a back\\slash and a\ttab',
  tools: "Bash, Read",
  isolation: "worktree",
  color: "teal",
};
const BARE: RoleDefinition = { ...ROLE, tools: null, isolation: null };
const PICK = { model: "m-1", effort: "high" } as const;
const TRICKY =
  "First line: a back\\slash, `ticks`, \"\"\" and it's ''.\n\nMiddle line.\n'\nLast line ends in two quotes ''";

const policyFor = (roles: Readonly<Record<string, unknown>>): Record<string, unknown> => ({
  "claude-code": { models: { "c-1": ["medium", "high"] }, roles },
  "codex-local": {
    models: { "x-1": ["high", "ultra"] },
    roles: { "vellum-fixture": { model: "x-1", effort: "ultra" } },
  },
});
const valid = (): Record<string, unknown> => policyFor({ "vellum-fixture": { model: "c-1", effort: "high" } });

test("the Claude renderer writes name, description, tools, model, effort, isolation and color in that order, leaving out an absent tools or isolation line", () => {
  assert.equal(
    renderClaudeAgent(ROLE, PICK, "Body.\n", ""),
    `---\nname: vellum-fixture\ndescription: ${ROLE.description}\ntools: Bash, Read\nmodel: m-1\neffort: high\nisolation: worktree\ncolor: teal\n---\n\nBody.\n`,
  );
  assert.equal(
    renderClaudeAgent(BARE, PICK, "Body.\n", "\n## Tail\n"),
    `---\nname: vellum-fixture\ndescription: ${ROLE.description}\nmodel: m-1\neffort: high\ncolor: teal\n---\n\nBody.\n\n## Tail\n`,
  );
});

test("a Codex definition parses back to exactly the five values it was given, backslashes, backticks, quotes, a tab and trailing quotes included", () => {
  const doc = { ...parse(renderCodexAgent(ROLE, PICK, TRICKY, "")) };
  assert.deepEqual(doc, {
    name: "vellum-fixture",
    description: ROLE.description,
    model: "m-1",
    model_reasoning_effort: "high",
    developer_instructions: TRICKY,
  });
  assert.equal(parse(`v = ${tomlMultilineLiteral("\nstarts on a blank line\n")}`)["v"], "\nstarts on a blank line\n");
});

test("the TOML strings refuse what they cannot hold: ''' and every control character but tab and line feed in the instructions, and any line break in a one-line value", () => {
  const refuses = (write: () => string, what: RegExp): void =>
    assert.throws(write, (e) => e instanceof GenerationError && what.test(e.message));
  refuses(() => tomlMultilineLiteral("before ''' after"), /cannot hold '''/);
  refuses(() => tomlMultilineLiteral("a\u0001b"), /U\+0001/);
  refuses(() => tomlMultilineLiteral("a\u007fb"), /U\+007F/);
  refuses(() => tomlMultilineLiteral("a\r\nb"), /U\+000D/);
  refuses(() => tomlBasicString("two\nlines"), /U\+000A/);
  refuses(() => tomlBasicString("a\u001fb"), /U\+001F/);
  assert.equal(tomlMultilineLiteral("tab\tand\nline"), "'''\ntab\tand\nline'''");
  assert.equal(tomlBasicString('say "hi" \\ there\t'), '"say \\"hi\\" \\\\ there\t"');
});

test("an adapter's slots are one line each under their comment lines, its appendix is what follows the appendix line, and its own preamble is never emitted", () => {
  const adapter = parseAdapter(
    "# Preamble that names {{harness:x}}\n\n<!-- slot: one -->\n\nOne line.\n\n<!-- slot: two-words -->\nTwo `words`.\n<!-- appendix -->\n\n## Tail\n\n- last\n\n",
    "fixture.md",
  );
  assert.deepEqual(
    [...adapter.slots],
    [
      ["one", "One line."],
      ["two-words", "Two `words`."],
    ],
  );
  assert.equal(adapter.appendix, "\n## Tail\n\n- last\n");
  assert.equal(parseAdapter("<!-- slot: a -->\nA.\n", "x").appendix, "");
});

test("an adapter is refused for a slot given twice, a slot of two lines or none, and an appendix that is not its last section", () => {
  const refuses = (text: string, what: RegExp): void =>
    assert.throws(
      () => parseAdapter(text, "fixture.md"),
      (e) => e instanceof GenerationError && what.test(e.message),
    );
  refuses("<!-- slot: a -->\nA.\n<!-- slot: a -->\nB.\n", /defines the slot a twice/);
  refuses("<!-- slot: a -->\nA.\nAnd more.\n", /slot a must be one line of text, and is 2/);
  refuses("<!-- slot: a -->\n\n", /slot a must be one line of text, and is 0/);
  refuses("<!-- appendix -->\nTail.\n<!-- slot: a -->\nA.\n", /appendix must be its last section/);
});

test("a body's slots are filled in place, inline or as a whole line, and a slot the adapter lacks or a marker of another shape is refused", () => {
  const adapter = parseAdapter("<!-- slot: a -->\nAlpha\n<!-- slot: b-c -->\nBeta, gamma.\n", "fixture.md");
  const body = "Lead {{harness:a}} tail.\n{{harness:b-c}}\n";
  assert.deepEqual(slotsUsedIn(body), ["a", "b-c"]);
  assert.equal(fillSlots(body, adapter, "body.md", "fixture.md"), "Lead Alpha tail.\nBeta, gamma.\n");
  const refuses = (text: string, what: RegExp): void =>
    assert.throws(
      () => fillSlots(text, adapter, "body.md", "fixture.md"),
      (e) => e instanceof GenerationError && what.test(e.message),
    );
  refuses("{{harness:zed}}\n", /body\.md uses the slot zed, which fixture\.md does not define/);
  refuses("{{harness:Bad Name}}\n", /no \{\{harness:<name>\}\} slot/);
  refuses("{{other}}\n", /no \{\{harness:<name>\}\} slot/);
});

test("a model policy is read only whole: both harnesses, approved models with distinct known efforts, and every role with an approved model and an effort that model allows", () => {
  const policy = parseModelPolicy(valid(), [ROLE]);
  assert.deepEqual(resolveModel(policy, "claude-code", "vellum-fixture"), { model: "c-1", effort: "high" });
  assert.deepEqual(resolveModel(policy, "codex-local", "vellum-fixture"), { model: "x-1", effort: "ultra" });
  const refuses = (raw: unknown, what: RegExp): void =>
    assert.throws(
      () => parseModelPolicy(raw, [ROLE]),
      (e) => e instanceof GenerationError && what.test(e.message),
    );
  refuses({ "claude-code": valid()["claude-code"] }, /has no codex-local/);
  refuses({ ...valid(), cursor: {} }, /holds a key it may not: cursor/);
  refuses([], /is not an object/);
  refuses({ ...valid(), "claude-code": { models: {}, roles: {} } }, /claude-code models approves no model/);
  refuses(
    { ...valid(), "claude-code": { models: { "c-1": ["high", "high"] }, roles: {} } },
    /c-1 is not a list of distinct efforts/,
  );
  refuses(
    { ...valid(), "claude-code": { models: { "c-1": ["extreme"] }, roles: {} } },
    /c-1 is not a list of distinct efforts/,
  );
  refuses(policyFor({}), /claude-code roles has no vellum-fixture/);
  refuses(
    policyFor({ "vellum-fixture": { model: "c-1", effort: "high" }, "vellum-extra": {} }),
    /holds a key it may not: vellum-extra/,
  );
  refuses(
    policyFor({ "vellum-fixture": { model: "c-2", effort: "high" } }),
    /names a model the policy does not approve: "c-2"/,
  );
  refuses(
    policyFor({ "vellum-fixture": { model: "c-1", effort: "ultra" } }),
    /asks c-1 for an effort the policy does not approve for it: "ultra"/,
  );
  refuses(policyFor({ "vellum-fixture": { model: "c-1" } }), /vellum-fixture has no effort/);
  assert.throws(
    () => resolveModel(policy, "codex-local", "vellum-unlisted"),
    (e) =>
      e instanceof GenerationError &&
      /gives vellum-unlisted no model under codex-local, and a role never inherits one/.test(e.message),
  );
});

test("a role's first, middle and last lines and its escaped text reach both definitions in order, with each harness's slot text in place and the Codex appendix last", () => {
  const root = mkdtempSync(join(tmpdir(), "agent-generator-"));
  try {
    const put = (path: string, text: string): void => {
      mkdirSync(dirname(join(root, path)), { recursive: true });
      writeFileSync(join(root, path), text);
    };
    put(
      "handbook/agents/roles/vellum-fixture.md",
      `FIRST line.\n\n${TRICKY}\nMIDDLE {{harness:step}} line.\n\nLAST line.\n`,
    );
    put("handbook/agents/adapters/claude-code.md", "# Claude\n\n<!-- slot: step -->\nuse the claude tool\n");
    put(
      "handbook/agents/adapters/codex-local.md",
      "# Codex\n\n<!-- slot: step -->\nuse the codex tool\n<!-- appendix -->\n## Codex tail\n",
    );
    put(".agents/model-policy.json", JSON.stringify(valid()));
    const files = new Map(planGeneratedFiles(root, [ROLE]).map((f) => [f.path, f.text]));
    assert.deepEqual([...files.keys()], [".claude/agents/vellum-fixture.md", ".codex/agents/vellum-fixture.toml"]);
    const body = `FIRST line.\n\n${TRICKY}\nMIDDLE use the claude tool line.\n\nLAST line.\n`;
    assert.equal(
      files.get(".claude/agents/vellum-fixture.md"),
      `---\nname: vellum-fixture\ndescription: ${ROLE.description}\ntools: Bash, Read\nmodel: c-1\neffort: high\nisolation: worktree\ncolor: teal\n---\n\n${body}`,
    );
    const codex = parse(files.get(".codex/agents/vellum-fixture.toml") ?? "");
    assert.equal(
      codex["developer_instructions"],
      `FIRST line.\n\n${TRICKY}\nMIDDLE use the codex tool line.\n\nLAST line.\n\n## Codex tail\n`,
    );
    put(
      "handbook/agents/adapters/claude-code.md",
      "# Claude\n\n<!-- slot: step -->\nuse the claude tool\n<!-- slot: spare -->\nunused\n",
    );
    assert.throws(
      () => planGeneratedFiles(root, [ROLE]),
      (e) => e instanceof GenerationError && /claude-code\.md defines slots no role body uses: spare/.test(e.message),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
