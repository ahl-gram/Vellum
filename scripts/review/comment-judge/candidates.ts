import type { ImportDeclaration, ModuleDeclaration, Statement } from "estree";
import { dirname, join, normalize } from "node:path/posix";
import { parseTs, withoutComments, type TsParse } from "./parse.ts";
import type { Tree } from "./tree.ts";
import type { Candidate, CommentRun } from "./types.ts";

type Top = Statement | ModuleDeclaration;
type TestCall = { readonly name: string; readonly start: number; readonly end: number; readonly body: string };
type Parsed = { readonly parse: TsParse; readonly tests: readonly TestCall[] };
type Kinded = { readonly importKind?: string };
type Declaring = {
  readonly id?: { readonly name?: unknown };
  readonly declarations?: readonly { readonly id: { readonly type: string; readonly name?: unknown } }[];
};

export const isUnitTestFile = (path: string): boolean => path.startsWith("test/") && path.endsWith(".test.ts");

const testsOf = (parse: TsParse): TestCall[] =>
  parse.program.body.flatMap((stmt): TestCall[] => {
    if (stmt.type !== "ExpressionStatement" || stmt.expression.type !== "CallExpression") return [];
    const { callee, arguments: args } = stmt.expression;
    const first = args[0];
    if (callee.type !== "Identifier" || callee.name !== "test" || !first) return [];
    const [start, end] = stmt.range!;
    const body = withoutComments(parse.text, start, end, parse.comments);
    if (first.type === "Literal" && typeof first.value === "string") return [{ name: first.value, start, end, body }];
    if (first.type === "TemplateLiteral")
      return [{ name: parse.text.slice(first.range![0] + 1, first.range![1] - 1), start, end, body }];
    return [];
  });

const declaredBy = (stmt: Top): string[] => {
  const inner: unknown =
    stmt.type === "ExportNamedDeclaration" || stmt.type === "ExportDefaultDeclaration" ? stmt.declaration : stmt;
  if (typeof inner !== "object" || inner === null) return [];
  const declaring = inner as Declaring;
  if (declaring.declarations)
    return declaring.declarations.flatMap((d) =>
      d.id.type === "Identifier" && typeof d.id.name === "string" ? [d.id.name] : [],
    );
  return typeof declaring.id?.name === "string" ? [declaring.id.name] : [];
};

const names = (body: string, name: string): boolean =>
  new RegExp(`(?<![\\w$])${name.replaceAll("$", "\\$")}(?![\\w$])`).test(body);

const importedBy = (parse: TsParse, path: string, target: string): string[] =>
  parse.program.body.flatMap((stmt): string[] => {
    if (stmt.type !== "ImportDeclaration") return [];
    const declaration: ImportDeclaration & Kinded = stmt;
    const source = declaration.source.value;
    if (declaration.importKind === "type" || typeof source !== "string" || !source.startsWith(".")) return [];
    if (normalize(join(dirname(path), source)) !== target) return [];
    return declaration.specifiers.flatMap((s) => ((s as Kinded).importKind === "type" ? [] : [s.local.name]));
  });

export const candidateFinder = (tree: Tree): ((run: CommentRun) => Candidate[]) => {
  const cache = new Map<string, Parsed>();
  const parsed = (path: string): Parsed => {
    const known = cache.get(path);
    if (known) return known;
    const parse = parseTs(path, tree.read(path));
    const made = { parse, tests: testsOf(parse) };
    cache.set(path, made);
    return made;
  };
  const candidate = (file: string, test: TestCall): Candidate => ({ file, name: test.name, body: test.body });
  const naming = (file: string, bindings: readonly string[]): Candidate[] =>
    parsed(file)
      .tests.filter((t) => bindings.some((b) => names(t.body, b)))
      .map((t) => candidate(file, t));

  return (run) => {
    if (isUnitTestFile(run.file)) {
      const { parse, tests } = parsed(run.file);
      const inside = tests.find((t) => t.start <= run.start && run.end <= t.end);
      if (inside) return [candidate(run.file, inside)];
      const next = parse.program.body.find((stmt) => stmt.range![1] > run.start);
      return next ? naming(run.file, declaredBy(next)) : [];
    }
    return tree
      .list("test")
      .filter(isUnitTestFile)
      .flatMap((file) => naming(file, importedBy(parsed(file).parse, file, run.file)));
  };
};
