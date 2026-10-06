import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { ESLint } from "eslint";
import { lintTsRoots } from "../../test-support/lint-roots.ts";
import { WITNESSES } from "../../test-support/lint-witnesses.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
const eslint = new ESLint({ cwd: ROOT, flags: ["unstable_native_nodejs_ts_config"] });
const RULE = "vellum/no-error-cast";

const PLANT = [
  "import { errorText } from \"../shared/error-text.ts\";",
  "export const a = (err: unknown) => (err as Error).message;",
  "export const b = (err: unknown) => (<Error>err).message;",
  "export const c = (err: unknown) => err as Error;",
  "export const d = (err: unknown) => (err as Error | undefined)?.message;",
  "export const e = (err: unknown) => err as null | Error;",
  "export const f = (err: unknown) => (err as Error & { code?: string }).code;",
  "export const g = (err: unknown) => (err as unknown as Error).message;",
  "export const box: { error?: Error } = {}; export const h = (err: unknown) => { box.error = err as Error; };",
  "export const report = (e: Error): string => e.message;",
  "export const i = (err: unknown) => report(err as Error);",
  "export const j = (err: unknown) => (err as TypeError).message;",
  "export const k = (err: unknown) => err as RangeError;",
  "export const l = () => ({ name: \"x\", message: \"y\" }) as Error;",
  "export const m = (p: Promise<void>) => p.catch((err: unknown) => { console.error((err as Error).message); });",
  "export const n = (run: () => void) => { try { run(); } catch (err) { console.error(`FAIL: ${(err as Error).message}`); } };",
  "export const o = (err: unknown) => errorText(err);",
  "export const p = (err: unknown) => (err instanceof Error ? err.message : String(err));",
  "export const q = (err: unknown) => (err as { message?: string } | null)?.message ?? String(err);",
  "export const r = (err: unknown) => (err as NodeJS.ErrnoException).code;",
  "export class ParseError extends Error {} export const s = (err: unknown) => (err as ParseError).message;",
  "export const t = (x: unknown) => (x as Map<string, Error>).size;",
  "export const u = (x: string) => x as unknown;",
  "export type M = Error[\"message\"];",
  "export const v = () => new Error(\"x\");",
  "export const w = (err: unknown) => (err as globalThis.Error).message;",
  "export const x = (err: unknown) => (err as DOMException).name;",
  "export const y = (err: unknown) => (err as Readonly<Error>).message;",
  "export const z = (errs: unknown) => (errs as Error[]).length;",
  "type Failure = Error; export const aa = (err: unknown) => (err as Failure).message;",
  "// (err as Error).message, named in a comment",
  "export const bb = \"(err as Error).message\";",
];
const REFUSED = [2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16];
const BLIND_SPOTS = "BLIND SPOTS, declared, each erring toward passing (a handbook/errata/guards.md row): an error type named any other way, through an alias (type Failure = Error), a qualified name (globalThis.Error, or NodeJS.ErrnoException, whose two casts read a code errorText cannot give), a subclass the house defines (class ParseError extends Error), DOMException, a wrapper (Readonly<Error>) or a container (Error[], Promise<Error>); a made-up shape ({ message?: string }), which five null-safe reads use (Issue #799 ruling 5); and a rejection handler passed by name whose parameter is annotated Error (.catch(onErr)), which is no cast";

test("no value is cast to Error or one of JavaScript's own error kinds, read or not, alone, in a union or with fields attached, and errorText, instanceof and new Error are the ways round it (Issue #799)", async () => {
  const [result] = await eslint.lintText(PLANT.join("\n"), { filePath: join(ROOT, "src/site/prospect/app.ts") });
  assert.deepEqual(result!.messages.filter((m) => m.fatal).map((m) => m.message), [], "the plant does not parse, so no rule read it");
  assert.deepEqual(result!.messages.filter((m) => m.ruleId === RULE).map((m) => m.line), REFUSED, BLIND_SPOTS);
});

const resolvedRule = async (file: string): Promise<unknown> => ((await eslint.calculateConfigForFile(file)) as { rules?: Record<string, unknown> }).rules?.[RULE];

test("the rule resolves at error on every TypeScript root the lint reads, at any depth and in a room not yet written, and on no sheet (Issue #799 ruling 4)", async () => {
  const roots = lintTsRoots();
  assert.ok(roots.length > 0, "the lint reads no TypeScript root, so this sweep reads nothing");
  for (const root of roots) {
    const witness = WITNESSES[`${root}/**/*.ts`];
    assert.ok(witness !== undefined && existsSync(join(ROOT, witness)), `${root} has no existing witness in test-support/lint-witnesses.ts, so the rule's reach there is unpinned`);
    assert.equal(await eslint.isPathIgnored(witness), false, `${witness} is ignored, so ${root} reaches nothing`);
    for (const file of [witness, `${root}/nested/deeper/part.ts`]) assert.deepEqual(await resolvedRule(file), [2], `${RULE} does not resolve at error on ${file}`);
  }
  assert.deepEqual(await resolvedRule("src/site/zz-new-room/part.ts"), [2], `${RULE} does not reach a room written tomorrow`);
  assert.equal(await resolvedRule(WITNESSES["public/**/*.css"]!), undefined, `${RULE} reaches a sheet`);
});
