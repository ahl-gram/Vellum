import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import ts from "typescript";

const ROOT = resolve(import.meta.dirname, "..", "..");
const rel = (path: string): string => relative(ROOT, path);

function parse(name: string): ts.ParsedCommandLine {
  const config = ts.getParsedCommandLineOfConfigFile(join(ROOT, name), {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => undefined });
  assert.ok(config, `${name} did not parse`);
  return config;
}

const ROOT_OPTIONS = parse("tsconfig.json").options;
const withoutDom = (libs: readonly string[] | undefined): string[] => (libs ?? []).filter((lib) => !lib.startsWith("lib.dom"));

function listed(pathspecs: readonly string[]): string[] {
  const run = spawnSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard", "--deduplicate", "--", ...pathspecs], { cwd: ROOT, encoding: "utf8", timeout: 30_000 });
  assert.equal(run.status, 0, `git ls-files failed: ${run.stderr}`);
  return run.stdout.split("\0").filter(Boolean).sort();
}

function witnessReds(options: ts.CompilerOptions, roots: readonly string[], witness: string, source: string): string[] {
  const host = ts.createCompilerHost(options);
  const read = host.getSourceFile.bind(host);
  host.getSourceFile = (name, version, ...rest) => (resolve(name) === witness ? ts.createSourceFile(name, source, version, true) : read(name, version, ...rest));
  const exists = host.fileExists.bind(host);
  host.fileExists = (name) => resolve(name) === witness || exists(name);
  const program = ts.createProgram({ rootNames: [...roots, witness], options, host });
  const file = program.getSourceFile(witness);
  assert.ok(file, "the witness never reached the program, so nothing below reads it");
  return [...program.getSyntacticDiagnostics(file), ...program.getSemanticDiagnostics(file)]
    .map((d) => `${file.getLineAndCharacterOfPosition(d.start ?? 0).line + 1}: ${source.slice(d.start ?? 0, (d.start ?? 0) + (d.length ?? 0))} ${d.code}`)
    .sort();
}

const ENGINE_WITNESS = join(ROOT, "src/world/type-check-witness.virtual.ts");
const ENGINE_SOURCE = "export const w = (el: HTMLElement): number => document.body.childElementCount + window.innerWidth + el.offsetWidth;\nexport const g = (): unknown => globalThis.document;\n";

// Blind spot, erring toward passing: a browser name @types/node also declares (localStorage, sessionStorage, navigator) resolves in this pass, and so does a reach through Reflect.get(globalThis, ...) or a cast.
test("code under src/ outside src/site/ that names a browser global or type fails the tsconfig.engine.json pass of npm run check, and the same code passes the root pass", () => {
  assert.deepEqual(witnessReds(ROOT_OPTIONS, [], ENGINE_WITNESS, ENGINE_SOURCE), [], "the witness fails the root pass too, so a red below would not be the browser's absence");
  const engine = parse("tsconfig.engine.json");
  assert.deepEqual(
    witnessReds(engine.options, engine.fileNames, ENGINE_WITNESS, ENGINE_SOURCE),
    ["1: HTMLElement 2304", "1: document 2584", "1: window 2304", "2: document 7017"],
    "a browser name resolves in the engine pass: the DOM library is back in its lib, through a reference directive in one of its files, or as a declared global",
  );
  assert.deepEqual(engine.options.lib, withoutDom(ROOT_OPTIONS.lib), "the engine pass's lib is not the root's minus the DOM libraries, so the two passes read different languages");
});

const WORKER_WITNESS = join(ROOT, "src/site/explorer/type-check-witness.virtual.ts");
const WORKER_SOURCE = 'import { createHash } from "node:crypto";\nexport const w = (el: HTMLElement): unknown => [document.title, window.name, el.id, localStorage.length, sessionStorage.length, process.pid, createHash];\n';

test("code the worker loads that names anything a worker lacks fails the tsconfig.worker.json pass of npm run check, and the same code passes the root pass", () => {
  assert.deepEqual(witnessReds(ROOT_OPTIONS, [], WORKER_WITNESS, WORKER_SOURCE), [], "the witness fails the root pass too, so a red below would not be the worker's narrower runtime");
  const worker = parse("tsconfig.worker.json");
  assert.deepEqual(
    witnessReds(worker.options, worker.fileNames, WORKER_WITNESS, WORKER_SOURCE),
    ['1: "node:crypto" 2307', "2: HTMLElement 2304", "2: document 2584", "2: localStorage 2304", "2: process 2591", "2: sessionStorage 2304", "2: window 2304"],
    "a name a worker lacks resolves in the worker pass: the DOM library or Node's types are back in it, through its options, a reference directive in a file it loads, or a declared global",
  );
  assert.deepEqual(worker.options.lib, [...withoutDom(ROOT_OPTIONS.lib), "lib.webworker.d.ts"], "the worker pass's lib is not the root's minus the DOM libraries plus the worker's");
  assert.deepEqual(worker.options.types, [], "the worker pass loads ambient type packages, so Node's globals resolve in code that runs in a worker");
});

test("tsconfig.engine.json reaches every .ts under src/ outside src/site/, and nothing inside it", () => {
  const all = listed(["src/*.ts"]);
  assert.ok(all.includes("src/world/generate.ts") && all.some((path) => path.startsWith("src/site/")), "the listing holds no src/world/generate.ts or no src/site/ file, so the subtraction below proves nothing");
  assert.deepEqual(parse("tsconfig.engine.json").fileNames.map(rel).sort(), all.filter((path) => !path.startsWith("src/site/")));
});

const WORKERS = new Set(["Worker", "SharedWorker"]);

function spawnTarget(path: string, spawn: ts.NewExpression): string {
  const [url] = spawn.arguments ?? [];
  const [target, base] = url && ts.isNewExpression(url) && ts.isIdentifier(url.expression) && url.expression.text === "URL" ? (url.arguments ?? []) : [];
  assert.ok(target && ts.isStringLiteral(target) && base?.getText() === "import.meta.url", `${path} spawns a worker this reader cannot resolve (${spawn.getText()}): widen the reader rather than let the worker pass miss it`);
  return join(dirname(path), target.text);
}

function spawnedWorkers(): string[] {
  const found = new Set<string>();
  for (const path of listed(["src/*.ts"])) {
    const visit = (node: ts.Node): void => {
      if (ts.isNewExpression(node) && ts.isIdentifier(node.expression) && WORKERS.has(node.expression.text)) found.add(spawnTarget(path, node));
      ts.forEachChild(node, visit);
    };
    visit(ts.createSourceFile(path, readFileSync(join(ROOT, path), "utf8"), ts.ScriptTarget.Latest, true));
  }
  return [...found].sort();
}

test("tsconfig.worker.json is rooted at every worker the site spawns, and at nothing else", () => {
  const spawned = spawnedWorkers();
  assert.ok(spawned.length > 0, "no worker spawn was found under src/, so the comparison below is over two empty lists");
  assert.deepEqual(parse("tsconfig.worker.json").fileNames.map(rel).sort(), spawned);
});
