import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import ts from "typescript";
import type { Evaluate, Payload } from "../../scripts/e2e/types.ts";
import { makeSettle } from "../../scripts/e2e/settle-support.ts";
import { e2eSourcePaths } from "../../test-support/e2e-source.ts";

type Cam = { scale: number; x: number; y: number };
const readCam = "(() => null)()" as Payload<Cam | null>;

// Never called: npm run check is what reads these, and each directive reds (TS2578) the day its line stops being an error.
const typedReadFixtures = async (evaluate: Evaluate): Promise<void> => {
  const bare = await evaluate(`({ x: 1 })`);
  // @ts-expect-error an undeclared read has no fields to read
  void bare.x;
  const rect = await evaluate<{ x: number; y: number }>(`({ x: 1, y: 2 })`);
  // @ts-expect-error a declared shape rejects a field its payload does not carry, the top-for-y of Gate 2 item 9
  void rect.top;
  // @ts-expect-error a branded payload cannot be read as a different shape
  await evaluate<{ top: number }>(readCam);
  // @ts-expect-error a shape cannot arrive from where the value is used
  const n: number = await evaluate(`1`);
  void n;
};
void typedReadFixtures;

const settledReadFixtures = async (settle: ReturnType<typeof makeSettle>): Promise<void> => {
  // @ts-expect-error a settle's predicate cannot supply the shape its read never stated
  const r = await settle(`({ open: true })`, (d: { open: boolean; count: number }) => d.open, "open");
  void r;
  // @ts-expect-error nor can the previous read the predicate is handed
  const s = await settle(`({ open: true })`, (d, last: { open: boolean } | null) => last !== null && d.open === last.open, "still");
  void s;
};
void settledReadFixtures;

const reading = (reads: unknown[]) => {
  const asked: string[] = [];
  const slept: number[] = [];
  const evaluate = (expression: string): Promise<unknown> => {
    asked.push(expression);
    return Promise.resolve(reads.shift());
  };
  const sleep = (ms: number): Promise<void> => {
    slept.push(ms);
    return Promise.resolve();
  };
  return { asked, slept, settle: makeSettle({ evaluate, sleep }) };
};

test("a settle hands back the first read its predicate accepts, and polls past a null read without asking the predicate", async () => {
  const { asked, slept, settle } = reading([null, { n: 1 }, { n: 2 }, { n: 3 }]);
  const seen: number[] = [];
  const got = await settle<{ n: number } | null>("READ", (d) => (seen.push(d.n), d.n >= 2), "climb");
  assert.deepEqual(got, { n: 2 });
  assert.deepEqual(seen, [1, 2], "the predicate was asked about the null read, or asked after it had already accepted");
  assert.equal(asked.length, 3);
  assert.ok(asked.every((e) => e === "READ"), "the settle evaluated something other than the read it was given");
  assert.deepEqual(slept, [50, 50], "the poll does not sleep its 50ms between reads");
});

test("a settle hands the predicate the PREVIOUS read, so a rest with no fixed end can ask for stillness", async () => {
  const { settle } = reading([{ n: 1 }, { n: 4 }, { n: 4 }]);
  const lasts: ({ n: number } | null)[] = [];
  const got = await settle<{ n: number }>("READ", (d, last) => (lasts.push(last), last !== null && d.n === last.n), "still");
  assert.deepEqual(got, { n: 4 });
  assert.deepEqual(lasts, [null, { n: 1 }, { n: 4 }]);
});

test("a settle that runs out of tries THROWS with its label and its last read, and never hands that read back", async () => {
  const { asked, settle } = reading([{ n: 0 }, { n: 0 }, { n: 7 }]);
  await assert.rejects(
    settle<{ n: number }>("READ", (d) => d.n > 10, "never", 3),
    (err: Error) => err.message === 'settle timeout never: {"n":7}',
  );
  assert.equal(asked.length, 3, "the settle did not spend exactly the tries it was given");
});

const REPO = resolve(import.meta.dirname, "..", "..");
const READ_NAMES = new Set(["evaluate", "settle"]);

function e2eProgram(extra: ReadonlyMap<string, string> = new Map()): ts.Program {
  const config = ts.getParsedCommandLineOfConfigFile(join(REPO, "tsconfig.json"), {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => undefined });
  assert.ok(config, "tsconfig.json did not parse");
  const host = ts.createCompilerHost(config.options);
  const read = host.getSourceFile.bind(host);
  host.getSourceFile = (name, version, ...rest) => {
    const text = extra.get(resolve(name));
    return text === undefined ? read(name, version, ...rest) : ts.createSourceFile(name, text, version, true);
  };
  const exists = host.fileExists.bind(host);
  host.fileExists = (name) => extra.has(resolve(name)) || exists(name);
  return ts.createProgram({ rootNames: [...e2eSourcePaths(REPO), ...extra.keys()], options: config.options, host });
}

function knownDeclarations(program: ts.Program): { readers: readonly ts.Node[]; senders: readonly ts.Node[] } {
  const statements = (file: string): readonly ts.Statement[] => {
    const sf = program.getSourceFile(join(REPO, "scripts", "e2e", file));
    assert.ok(sf, `scripts/e2e/${file} is not in the program`);
    return sf.statements;
  };
  const aliased = (file: string, name: string) => statements(file).find((s): s is ts.TypeAliasDeclaration => ts.isTypeAliasDeclaration(s) && s.name.text === name)?.type;
  const declared = (file: string, name: string) => statements(file).find((s): s is ts.FunctionDeclaration => ts.isFunctionDeclaration(s) && s.name?.text === name);
  const evaluateType = aliased("types.ts", "Evaluate");
  const harnessEvaluate = declared("harness.ts", "evaluate");
  const settleArrow = declared("settle-support.ts", "makeSettle")?.body?.statements.find(ts.isReturnStatement)?.expression;
  const sendType = aliased("types.ts", "Send");
  const harnessSend = declared("harness.ts", "send");
  assert.ok(evaluateType && ts.isFunctionTypeNode(evaluateType), "types.ts no longer declares Evaluate as a function type, so this scan knows no context read");
  assert.ok(harnessEvaluate, "harness.ts no longer declares its own evaluate, so this scan knows no harness read");
  assert.ok(settleArrow && ts.isArrowFunction(settleArrow), "makeSettle no longer returns an arrow, so this scan knows no settle");
  assert.ok(sendType && ts.isFunctionTypeNode(sendType) && harnessSend, "types.ts's Send or the harness's send moved, so this scan would read every send as a helper");
  return { readers: [evaluateType, harnessEvaluate, settleArrow], senders: [sendType, harnessSend] };
}

const bare = (checker: ts.TypeChecker, t: ts.Type): boolean =>
  (t.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.Never)) !== 0 ||
  ((t.flags & (ts.TypeFlags.Object | ts.TypeFlags.NonPrimitive)) !== 0 && checker.getPropertiesOfType(t).length === 0 && checker.getIndexInfosOfType(t).length === 0 && t.getCallSignatures().length === 0);
const unshaped = (checker: ts.TypeChecker, t: ts.Type | undefined): boolean =>
  t === undefined || (t.isUnion() ? t.types : [t]).some((m) => bare(checker, m));
const keptValue = (call: ts.CallExpression): ts.Expression | undefined => {
  let n: ts.Expression = call;
  while (ts.isAwaitExpression(n.parent) || ts.isParenthesizedExpression(n.parent)) n = n.parent;
  return ts.isExpressionStatement(n.parent) || ts.isVoidExpression(n.parent) ? undefined : n;
};
const calleeName = (call: ts.CallExpression): string =>
  ts.isIdentifier(call.expression) ? call.expression.text : ts.isPropertyAccessExpression(call.expression) ? call.expression.name.text : "";

function shapeScan(program: ts.Program, paths: readonly string[]): { perReader: number[]; findings: string[] } {
  const checker = program.getTypeChecker();
  const { readers, senders } = knownDeclarations(program);
  const tree = new Set([...e2eSourcePaths(REPO), ...paths].map((p) => resolve(p)));
  const perReader = readers.map(() => 0);
  const findings: string[] = [];
  const judge = (call: ts.CallExpression, where: string): void => {
    const declaration = checker.getResolvedSignature(call)?.getDeclaration();
    const which = declaration ? readers.indexOf(declaration) : -1;
    const name = calleeName(call);
    const named = READ_NAMES.has(name);
    const helper = declaration !== undefined && tree.has(resolve(declaration.getSourceFile().fileName)) && name !== "send" && !senders.includes(declaration);
    if (which === -1 && !named && !helper) return;
    if (which !== -1) perReader[which]! += 1;
    if (which === -1 && named && (declaration?.typeParameters?.length ?? 0) > 0) {
      findings.push(`${where}: ${name} takes a shape through a declaration this scan does not know`);
      return;
    }
    const kept = keptValue(call);
    if (!kept) return;
    const castAtBoundary = which === -1 && named && ts.isAsExpression(kept.parent);
    const value = castAtBoundary ? checker.getTypeAtLocation(kept.parent) : checker.getAwaitedType(checker.getTypeAtLocation(call));
    if (unshaped(checker, value)) findings.push(`${where}: ${name || "a read"} keeps ${value ? checker.typeToString(value) : "a type the checker cannot await"}`);
  };
  for (const path of paths) {
    const sf = program.getSourceFile(path);
    assert.ok(sf, `${path} is not in the program`);
    const visit = (node: ts.Node): void => {
      if (ts.isCallExpression(node)) judge(node, `${relative(REPO, path)}:${sf.getLineAndCharacterOfPosition(node.getStart()).line + 1}`);
      ts.forEachChild(node, visit);
    };
    visit(sf);
  }
  return { perReader, findings };
}

const SHAPE_FIXTURE = [
  'import type { Payload, SuiteContext } from "./types.ts";',
  'import { makeSettle } from "./settle-support.ts";',
  "declare const ctx: SuiteContext;",
  "const { evaluate } = ctx;",
  "const settle = makeSettle(ctx);",
  "const ev = evaluate;",
  "const { evaluate: renamed, send: post } = ctx;",
  'const TYPED = "1" as Payload<{ n: number }>;',
  'const PLAIN = "1";',
  "type Awaits = { then(f: (v: Awaits) => void): void };",
  "const read = <T>(p: Payload<T>) => evaluate(p);",
  "const erased = (): Promise<unknown> => evaluate<boolean>(`1`);",
  "export async function reads(): Promise<unknown[]> {",
  "  await evaluate(`x()`);",
  "  void evaluate(`x()`);",
  "  const stated = await evaluate<number>(`1`);",
  "  const named = await evaluate(TYPED);",
  "  const nothing = await evaluate<undefined>(`x()`);",
  '  const settledStated = await settle<{ n: number }>(`1`, (d) => d.n > 0, "n");',
  "  const kept = await evaluate(`1`); // flagged",
  "  const plainNamed = await evaluate(PLAIN); // flagged",
  "  const anyShape = await evaluate<any>(`1`); // flagged",
  "  const unknownShape = await evaluate<unknown>(`1`); // flagged",
  "  const emptyOrNull = await evaluate<{} | null>(`1`); // flagged",
  '  const settled = await settle(`1`, () => true, "any"); // flagged',
  "  const aliased = await ev(`1`); // flagged",
  "  const viaContext = await ctx.evaluate(`1`); // flagged",
  "  const wrapper = () => evaluate(`x()`); // flagged",
  "  const chained = evaluate(`1`).then(() => 1); // flagged",
  "  if (await evaluate(`1`)) return []; // flagged",
  "  const castInstead = await evaluate(`1`) as number; // flagged",
  "  const statedThrough = await read<number>(`1`);",
  "  const answer = await ctx.send(`Page.getLayoutMetrics`);",
  "  const laundered = await read(`1`); // flagged",
  "  const erasedKept = await erased(); // flagged",
  "  const erasedCast = await erased() as { n: number }; // flagged",
  "  const nothingAtAll = await evaluate<never>(`1`); // flagged",
  "  const selfAwaiting = await evaluate<Awaits>(`1`); // flagged",
  "  const renamedKept = await renamed(`1`); // flagged",
  "  const posted = await post(`Page.getLayoutMetrics`);",
  "  return [stated, named, nothing, settledStated, kept, plainNamed, anyShape, unknownShape, emptyOrNull, settled, aliased, viaContext, wrapper, chained, castInstead, statedThrough, answer, laundered, erasedKept, erasedCast, nothingAtAll, selfAwaiting, renamedKept, posted];",
  "}",
  "export async function relay(send: (method: string) => Promise<unknown>): Promise<unknown> {",
  "  return await send(`Page.getLayoutMetrics`);",
  "}",
  "export async function plainForm(evaluate: (expression: string) => Promise<unknown>): Promise<unknown[]> {",
  "  const cast = await evaluate(`1`) as number;",
  "  const uncast = await evaluate(`1`); // flagged",
  "  return [cast, uncast];",
  "}",
  "export async function foreign(evaluate: <T>(expression: string) => Promise<T>): Promise<void> {",
  "  await evaluate(`1`); // flagged",
  "}",
  "export function socket(): void {",
  "  const settle = (ok: boolean): void => void ok;",
  "  setTimeout(() => settle(false), 1);",
  "}",
];

test("the shape scan passes a read that states its shape or discards its value, and reports every kept read whose shape is unknown, any or empty, whether reached by name, alias, context, wrapper, chain or condition, a cast in place of a type argument, a helper that launders or erases the shape, or a shape of never or of a type that awaits itself", () => {
  const path = join(REPO, "scripts", "e2e", "__shape-fixture__.ts");
  assert.equal(existsSync(path), false, "the fixture's name is a real file, so the scan below would read the disk instead");
  const { findings } = shapeScan(e2eProgram(new Map([[path, SHAPE_FIXTURE.join("\n")]])), [path]);
  const flagged = SHAPE_FIXTURE.flatMap((line, i) => (line.endsWith("// flagged") ? [`${relative(REPO, path)}:${i + 1}`] : []));
  assert.equal(flagged.length, 20);
  assert.deepEqual(findings.map((f) => f.slice(0, f.indexOf(": "))), flagged, findings.join("\n"));
});

test("every evaluate and settle in the e2e tree whose value is kept states its shape, through a type argument or a typed Payload, and so does every helper declared in the tree that hands one on (Alex's ruling of 2026-09-23 on Issue #653)", () => {
  const { perReader, findings } = shapeScan(e2eProgram(), e2eSourcePaths(REPO));
  assert.ok(perReader.every((n) => n > 0), `the scan reached the context's Evaluate, the harness's evaluate and the settle ${perReader.join(", ")} times, so one of them is not the declaration the tree calls`);
  assert.deepEqual(
    findings,
    [],
    "a read that keeps its value states the shape its payload returns, <undefined> for one that returns nothing. BLIND SPOTS, declared, all erring toward passing: a stated shape is never checked against its payload (the checker cannot read the page's JavaScript); a shape is judged at its top level only, so a field, element or index typed unknown or any passes; send is not a read (the ruling names evaluate and settle); and a reader handed on as a value (.call, .apply, .bind, or passed to a function declared outside the e2e tree) is not read where it is finally called. Two choices err toward failing: a value counts as discarded only as a statement or the operand of void, and a kept unknown from any helper declared in the tree fails, a send wrapper's included. A callee named evaluate or settle that takes no type argument may state its shape by a cast at the boundary (settle-support's plain evaluate, whose T its settle's caller states)",
  );
});
