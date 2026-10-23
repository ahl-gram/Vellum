import { test } from "node:test";
import assert from "node:assert/strict";
import { join, resolve } from "node:path";
import { ESLint } from "eslint";

const ROOT = resolve(import.meta.dirname, "..", "..");
const eslint = new ESLint({ cwd: ROOT, flags: ["unstable_native_nodejs_ts_config"] });
const RULE = "vellum/no-em-dash-in-string";
const D = String.fromCharCode(0x2014);
const ESCAPE = "\\" + "u2014";

const refusals = async (code: string, file: string): Promise<number> => {
  const [result] = await eslint.lintText(code, { filePath: join(ROOT, file) });
  assert.deepEqual(
    result!.messages.filter((m) => m.fatal).map((m) => m.message),
    [],
    "the plant does not parse, so no rule read it",
  );
  return result!.messages.filter((m) => m.ruleId === RULE).length;
};

test("a string or template literal holding the character is refused in shipped code (Issue #981)", async () => {
  assert.equal(await refusals(`export const a = "x ${D} y";`, "src/atlas/document.ts"), 1);
  assert.equal(await refusals(`export const a = \`x ${D} y\`;`, "src/atlas/document.ts"), 1);
  assert.equal(await refusals(`export const a = (n: number) => \`\${n} ${D} y\`;`, "scripts/agent-sandbox.ts"), 1);
  assert.equal(await refusals(`export const a = "x";\nexport const b = "${D}";`, "e2e/lanes.ts"), 1);
});

test("the escape, a comment and the out-of-scope roots pass (Issue #981)", async () => {
  assert.equal(await refusals(`export const a = "x ${ESCAPE} y";`, "src/atlas/document.ts"), 0);
  assert.equal(await refusals(`// ${D}\nexport const a = 1; /* ${D} */`, "src/atlas/document.ts"), 0);
  assert.equal(await refusals(`export const a = "${D}";`, "test/repo/error-cast.test.ts"), 0);
  assert.equal(await refusals(`export const a = "${D}";`, ".claude/skills/vellum-footguns/hooks/bare-cd.ts"), 0);
});

test("the allow count tolerates that many literals in its file and refuses the next (Issue #981)", async () => {
  assert.equal(await refusals(`export const a = "${D}";`, "e2e/harness.ts"), 0);
  assert.equal(await refusals(`export const a = "${D}";\nexport const b = "${D}";`, "e2e/harness.ts"), 1);
  assert.equal(await refusals(`export const a = "${D}";`, "src/atlas/compose.ts"), 1);
  assert.equal(await refusals(`export const a = "${D}";`, "src/atlas/palette.ts"), 1);
});
