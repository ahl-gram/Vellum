import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import ts from "typescript";

const REPO = resolve(import.meta.dirname, "..", "..");
const NOTE = /^\s*\/\/ @ts-expect-error \S/;
const SUPPRESSION = /@ts-(expect-error|ignore|nocheck)\b/;
// A name or a member the checker cannot find: the codes a misspelling produces. On a value typed `{}` (an `unknown` a truthiness guard has narrowed; a bare `unknown` reports TS18046 instead) there is no member to misspell, so there the code is the note's own objection.
const MISSING = new Set([2304, 2339, 2551, 2552, 2724]);
const ON_EMPTY_OBJECT = /on type '\{\}'/;

type Source = { readonly path: string; readonly text: string };
type Covered = { readonly column: number; readonly code: number; readonly text: string };
type Finding = { readonly at: string; readonly diagnostics: readonly string[] };

const e2eSources = (): Source[] => {
  const dir = join(REPO, "scripts", "e2e");
  const paths = [
    ...readdirSync(dir).filter((f) => f.endsWith(".ts")).map((f) => join(dir, f)),
    ...readdirSync(join(REPO, "scripts")).filter((f) => /^e2e-[\w-]+\.ts$/.test(f)).map((f) => join(REPO, "scripts", f)),
  ];
  return paths.map((path) => ({ path, text: readFileSync(path, "utf8") }));
};

// One uncertain expression per note: whatever the line reports starts at one column (a chain like `a.b.c` whose `a` and `a.b` may both be null reports twice there), and none of it is a name or member the checker cannot find.
const offends = (covered: readonly Covered[]): boolean =>
  covered.length === 0 ||
  new Set(covered.map((c) => c.column)).size !== 1 ||
  covered.some((c) => MISSING.has(c.code) && !ON_EMPTY_OBJECT.test(c.text));

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

// Each note's directive is blanked in place, so every line keeps its number and a note at line n owns what the checker then reports at n + 1.
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
      byLine.set(line, [...(byLine.get(line) ?? []), { column: character, code: d.code, text: ts.flattenDiagnosticMessageText(d.messageText, " ") }]);
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

test("the note scanner passes one uncertain expression per note and reports a second one, a misspelled member, and a stray suppression", () => {
  const path = join(REPO, "scripts", "e2e", "__note-fixture__.ts");
  assert.equal(existsSync(path), false, "the fixture's name is a real file, so the scan below would read the disk instead");
  const text = [
    "declare const r: { a: number; box: { x: number } | null } | null;",
    "declare let e: unknown;",
    "declare const s: { box: { x: number } | null };",
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
  ].join("\n");
  const { notes, findings } = noteFindings([{ path, text }]);
  assert.equal(notes, 7);
  assert.deepEqual(findings.map((f) => f.at).sort(), [`${path}:14`, `${path}:16`, `${path}:18`, `${path}:6`, `${path}:8`]);
});

test("every ruled note in the e2e tree covers one uncertain expression and no misspelled name, so a typo beside or in place of a nullable read cannot hide under it (Alex's ruling of 2026-09-23 on Issue #653)", () => {
  const { notes, findings } = noteFindings(e2eSources());
  assert.ok(notes > 0, "the scan read no note at all, so it is looking at the wrong tree");
  assert.deepEqual(
    findings.map((f) => `${f.at}: ${f.diagnostics.join(" | ")}`),
    [],
    "a note must cover one uncertain expression: break the line so each has its own noted line and the rest of the expression is checked",
  );
});
