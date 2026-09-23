import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import ts from "typescript";

const REPO = resolve(import.meta.dirname, "..", "..");
const NOTE = /^\s*\/\/ @ts-expect-error \S/;
const SUPPRESSION = /@ts-(expect-error|ignore|nocheck)\b/;

type Source = { readonly path: string; readonly text: string };
type Finding = { readonly at: string; readonly diagnostics: readonly string[] };

const e2eSources = (): Source[] => {
  const dir = join(REPO, "scripts", "e2e");
  const paths = [
    ...readdirSync(dir).filter((f) => f.endsWith(".ts")).map((f) => join(dir, f)),
    ...readdirSync(join(REPO, "scripts")).filter((f) => /^e2e-[\w-]+\.ts$/.test(f)).map((f) => join(REPO, "scripts", f)),
  ];
  return paths.map((path) => ({ path, text: readFileSync(path, "utf8") }));
};

// Each note's directive is blanked in place, so every line keeps its number and a note at line n owns what the checker then reports at n + 1.
function noteFindings(sources: readonly Source[]): { notes: number; findings: Finding[] } {
  const blanked = new Map<string, string>();
  const findings: Finding[] = [];
  const noteLines = new Map<string, number[]>();
  for (const { path, text } of sources) {
    const lines = text.split("\n");
    const at: number[] = [];
    lines.forEach((line, i) => {
      if (NOTE.test(line)) at.push(i);
      else if (SUPPRESSION.test(line)) findings.push({ at: `${path}:${i + 1}`, diagnostics: ["a suppression that is not a line-leading @ts-expect-error note"] });
    });
    noteLines.set(path, at);
    blanked.set(path, lines.map((line, i) => (at.includes(i) ? line.replace(/@ts-expect-error/, "@note") : line)).join("\n"));
  }
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
  const program = ts.createProgram({ rootNames: [...blanked.keys()], options: config.options, host });
  let notes = 0;
  for (const [path, at] of noteLines) {
    const sf = program.getSourceFile(path);
    assert.ok(sf, `${path} is not in the program`);
    const byLine = new Map<number, string[]>();
    for (const d of [...program.getSyntacticDiagnostics(sf), ...program.getSemanticDiagnostics(sf)]) {
      if (d.start === undefined) continue;
      const line = sf.getLineAndCharacterOfPosition(d.start).line;
      byLine.set(line, [...(byLine.get(line) ?? []), `TS${d.code} ${ts.flattenDiagnosticMessageText(d.messageText, " ")}`]);
    }
    for (const i of at) {
      notes += 1;
      const covered = byLine.get(i + 1) ?? [];
      if (covered.length !== 1) findings.push({ at: `${path}:${i + 1}`, diagnostics: covered });
    }
  }
  return { notes, findings };
}

test("the note scanner reports a note over two diagnostics and a stray suppression, and passes a note over exactly one", () => {
  const path = join(REPO, "scripts", "e2e", "__note-fixture__.ts");
  assert.equal(existsSync(path), false, "the fixture's name is a real file, so the scan below would read the disk instead");
  const text = [
    "declare const r: { a: number } | null;",
    "// @ts-expect-error one null read",
    "export const one = r.a;",
    "// @ts-expect-error a null read and a misspelled field beside it",
    "export const two = r.a + r.b;",
    "// @ts-ignore a suppression that never reds",
    "export const three = r.a;",
  ].join("\n");
  const { notes, findings } = noteFindings([{ path, text }]);
  assert.equal(notes, 2);
  assert.deepEqual(findings.map((f) => f.at).sort(), [`${path}:4`, `${path}:6`]);
  const two = findings.find((f) => f.at === `${path}:4`);
  assert.ok(two && two.diagnostics.length > 1, JSON.stringify(two));
});

test("every ruled note in the e2e tree covers exactly one diagnostic, so a misspelled field beside a nullable read cannot hide under it (Alex's ruling of 2026-09-23 on Issue #653)", () => {
  const { notes, findings } = noteFindings(e2eSources());
  assert.ok(notes > 0, "the scan read no note at all, so it is looking at the wrong tree");
  assert.deepEqual(
    findings.map((f) => `${f.at} covers ${f.diagnostics.length}: ${f.diagnostics.join(" | ")}`),
    [],
    "a note must cover exactly one diagnostic: break the line so each uncertain value has its own noted line and the rest of the expression is checked",
  );
});
