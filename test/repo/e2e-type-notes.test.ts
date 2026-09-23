import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import ts from "typescript";
import { e2eSourcePaths } from "../../test-support/e2e-source.ts";

const REPO = resolve(import.meta.dirname, "..", "..");
const NOTE = /^\s*\/\/ @ts-expect-error \S/;
const SUPPRESSION = /@ts-(expect-error|ignore|nocheck)\b/;
const NULLISH = new Set([18046, 18047, 18048, 18049, 2531, 2532, 2533]);
const ASSIGNS = new Set([2322, 2345]);
// A bare `unknown` reports TS18046; only one a truthiness guard has narrowed to `{}` reports a member read as TS2339.
const ON_EMPTY_OBJECT = /on type '\{\}'/;

const ARITHMETIC = new Set([2362, 2363]);
const MATCH_ARRAYS = new Set(["RegExpMatchArray", "RegExpExecArray"]);

type Source = { readonly path: string; readonly text: string };
type Covered = { readonly column: number; readonly code: number; readonly text: string; readonly matchGroup: boolean };
type Finding = { readonly at: string; readonly diagnostics: readonly string[] };

const e2eSources = (): Source[] => e2eSourcePaths(REPO).map((path) => ({ path, text: readFileSync(path, "utf8") }));

const nullish = (c: Covered): boolean =>
  NULLISH.has(c.code) || (ASSIGNS.has(c.code) && /\b(null|undefined)\b/.test(c.text)) || (c.code === 2339 && ON_EMPTY_OBJECT.test(c.text));
const coerced = (covered: readonly Covered[]): boolean => covered.length === 1 && ARITHMETIC.has(covered[0]!.code) && covered[0]!.matchGroup;
const offends = (covered: readonly Covered[]): boolean =>
  new Set(covered.map((c) => c.column)).size !== 1 || !(covered.every(nullish) || coerced(covered));

const operandIsMatchGroup = (checker: ts.TypeChecker, sf: ts.SourceFile, start: number, length: number): boolean => {
  let found: ts.Node | undefined;
  const visit = (node: ts.Node): void => {
    if (node.getStart(sf) === start && node.getEnd() === start + length) found = node;
    if (node.getStart(sf) <= start && node.getEnd() >= start + length) ts.forEachChild(node, visit);
  };
  visit(sf);
  return found !== undefined && ts.isElementAccessExpression(found) && MATCH_ARRAYS.has(checker.getTypeAtLocation(found.expression).getSymbol()?.name ?? "");
};

function compile(sources: readonly Source[]): ts.Program {
  const blanked = new Map(sources.map(({ path, text }) => [path, text.split("\n").map((line) => (NOTE.test(line) ? line.replace("@ts-expect-error", "@note") : line)).join("\n")]));
  const config = ts.getParsedCommandLineOfConfigFile(join(REPO, "tsconfig.json"), {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => undefined });
  assert.ok(config, "tsconfig.json did not parse");
  const host = ts.createCompilerHost(config.options);
  const read = host.getSourceFile.bind(host);
  host.getSourceFile = (name, version, ...rest) => {
    const text = blanked.get(resolve(name));
    return text === undefined ? read(name, version, ...rest) : ts.createSourceFile(name, text, version, true);
  };
  const exists = host.fileExists.bind(host);
  host.fileExists = (name) => blanked.has(resolve(name)) || exists(name);
  return ts.createProgram({ rootNames: [...blanked.keys()], options: config.options, host });
}

function noteFindings(sources: readonly Source[]): { notes: number; findings: Finding[] } {
  const program = compile(sources);
  const findings: Finding[] = [];
  let notes = 0;
  for (const { path, text } of sources) {
    const lines = text.split("\n");
    const sf = program.getSourceFile(path);
    assert.ok(sf, `${path} is not in the program`);
    const byLine = new Map<number, Covered[]>();
    for (const d of [...program.getSyntacticDiagnostics(sf), ...program.getSemanticDiagnostics(sf)]) {
      if (d.start === undefined) continue;
      const { line, character } = sf.getLineAndCharacterOfPosition(d.start);
      const matchGroup = ARITHMETIC.has(d.code) && operandIsMatchGroup(program.getTypeChecker(), sf, d.start, d.length ?? 0);
      byLine.set(line, [...(byLine.get(line) ?? []), { column: character, code: d.code, text: ts.flattenDiagnosticMessageText(d.messageText, " "), matchGroup }]);
    }
    lines.forEach((line, i) => {
      if (!NOTE.test(line)) {
        if (SUPPRESSION.test(line)) findings.push({ at: `${path}:${i + 1}`, diagnostics: ["a suppression that is not a line-leading @ts-expect-error note"] });
        return;
      }
      notes += 1;
      const covered = byLine.get(i + 1) ?? [];
      if (offends(covered)) findings.push({ at: `${path}:${i + 1}`, diagnostics: covered.map((c) => `TS${c.code}@${c.column} ${c.text}`) });
    });
  }
  return { notes, findings };
}

const NOTE_FIXTURE = [
  "declare const r: { a: number; box: { x: number } | null } | null;",
  "declare let e: unknown;",
  "declare const s: { box: { x: number } | null };",
  "declare const q: { n: number; label: string; word: string | null } | null;",
  "declare const w: { label: string };",
  "declare function takesNum(n: number): number;",
  "declare function takesText(t: string): string;",
  "// @ts-expect-error one null read",
  "export const one = r.a;",
  "// @ts-expect-error a null read and a misspelled field beside it",
  "export const two = r.a + r.b;",
  "// @ts-expect-error a misspelled member where the null read was",
  "export const three = r.bx;",
  "// @ts-expect-error a chain whose two links may be null, reported twice at one start",
  "export const four = r.box.x;",
  "// @ts-expect-error a member read off a value typed unknown and narrowed to {}",
  "export const five = e && e.message;",
  "// @ts-ignore a suppression that never reds",
  "export const six = r.a;",
  "// @ts-expect-error two null reads at two columns, and no misspelling",
  "export const seven = r.a + r.a;",
  "// @ts-expect-error a misspelled member on a value that is never null, so the misspelling is all the line reports",
  "export const eight = s.bx.x;",
  "// @ts-expect-error a null read whose sibling field has the wrong type, reported at the same start",
  "export const nine = q.n > w.label;",
  "// @ts-expect-error a wrong-typed argument that happens to start with the null read",
  "export const ten = takesNum(q.label);",
  "// @ts-expect-error a null string handed to a string parameter, whose only objection is the null",
  "export const eleven = takesText(q.word);",
  "// @ts-expect-error a note whose next line is a comment, so the directive walks past it to the code below",
  "// an ordinary comment",
  "export const twelve = q.n + q.n;",
  "declare const group: RegExpMatchArray;",
  "declare const flag: boolean;",
  "// @ts-expect-error a match group is a string, which the multiplication coerces to a number, as it does at run time",
  "export const thirteen = group[1] * 255;",
  "// @ts-expect-error a boolean operand is not the string a match group is",
  "export const fourteen = flag * 255;",
  "// @ts-expect-error a string operand with a misspelled member beside it",
  "export const fifteen = group[1] * w.labl;",
  "// @ts-expect-error a null read and a string multiplied at the one start, two objections under one note",
  "export const sixteen = q.label * 255;",
  "// @ts-expect-error a coerced operand entangled with a second diagnostic at the same start",
  "export const seventeen = takesText(group[1] * 255);",
  "// @ts-expect-error a match group on the right of the operator, reported as TS2363",
  "export const eighteen = 255 * group[1];",
  "// @ts-expect-error a string field of a stated shape multiplied, which is not the match group the arm admits",
  "export const nineteen = w.label * 255;",
  "declare const list: string[];",
  "// @ts-expect-error an element of a plain string array, which is not a match array",
  "export const twenty = list[0] * 255;",
];

test("the note scanner passes one null objection per note and reports a second uncertain value, a misspelling beside or in place of the null read, a wrong type that shares its start, a note with nothing under it, and a stray suppression, while a regex match group coerced by arithmetic passes only as the one objection under its note, and a string field so coerced reds", () => {
  const path = join(REPO, "scripts", "e2e", "__note-fixture__.ts");
  assert.equal(existsSync(path), false, "the fixture's name is a real file, so the scan below would read the disk instead");
  const text = NOTE_FIXTURE.join("\n");
  const { notes, findings } = noteFindings([{ path, text }]);
  assert.equal(notes, 19);
  assert.deepEqual(findings.map((f) => f.at).sort(), [10, 12, 18, 20, 22, 24, 26, 30, 37, 39, 41, 43, 47, 50].map((n) => `${path}:${n}`).sort());
});

test("the scan reads every TypeScript file under scripts/e2e at any depth and the e2e scripts beside it, and nothing else", () => {
  const root = mkdtempSync(join(tmpdir(), "vellum-e2e-notes-"));
  try {
    const plant = (rel: string): void => {
      mkdirSync(dirname(join(root, rel)), { recursive: true });
      writeFileSync(join(root, rel), "");
    };
    ["scripts/e2e/top.ts", "scripts/e2e/split/nested.ts", "scripts/e2e-beside.ts", "scripts/e2e/left.mjs", "scripts/other.ts"].forEach(plant);
    assert.deepEqual(
      e2eSourcePaths(root).map((p) => relative(root, p)).sort(),
      ["scripts/e2e/top.ts", "scripts/e2e/split/nested.ts", "scripts/e2e-beside.ts"].sort(),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("every ruled note in the e2e tree covers one uncertain expression and nothing but its null objection or a coerced regex match group, so a typo or a wrong type beside or in place of it cannot hide under the note (Alex's ruling of 2026-09-23 on Issue #653)", () => {
  const { notes, findings } = noteFindings(e2eSources());
  assert.ok(notes > 0, "the scan read no note at all, so it is looking at the wrong tree");
  assert.deepEqual(
    findings.map((f) => `${f.at}: ${f.diagnostics.join(" | ")}`),
    [],
    "a note must cover one uncertain expression and nothing but its null objection, or a regex match group that arithmetic coerces, alone: break the line so each has its own noted line and the rest of the expression is checked. BLIND SPOTS, declared, all three erring toward passing: a member read off a value typed {} (a caught unknown narrowed by a truthiness guard), where a misspelled member and a real one report alike; and an assignability error whose message names null or undefined anywhere, so a wrong type that also mentions an optional field passes as a null objection; and a regex match group under any arithmetic or bitwise operator, on either side or in a compound assignment, which passes whether or not its text is a number",
  );
});
