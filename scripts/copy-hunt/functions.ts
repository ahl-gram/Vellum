import { createHash } from "node:crypto";
import ts from "typescript";
import { isTsUnderLintRoots, lintTsRoots } from "../../test-support/lint-roots.ts";
import { parseTs, withoutComments } from "../comment-judge/parse.ts";
import type { Tree } from "../comment-judge/tree.ts";

// 2026-11-10, Issue #1319: the scan's population; at f8f9c967, 1,986 of 7,722 functions have fewer than six names and 5 pass 6,000 characters.
export const MIN_TOKENS = 6;
export const MAX_CHARS = 6000;
export type Fn = {
  readonly file: string;
  readonly line: number;
  readonly end: number;
  readonly name: string;
  readonly body: string;
  readonly norm: string;
  readonly tokens: readonly string[];
  readonly hash: string;
};
export type Unread = { readonly file: string; readonly reason: string };
export const HUNT_ROOTS: readonly string[] = lintTsRoots();

const COMMON = new Set(
  "const let var function return if else for of in while do new await async true false null undefined typeof instanceof this break continue throw try catch finally switch case default import export from as type interface readonly void number string boolean test it assert equal deepEqual strictEqual deepStrictEqual ok match throws length map filter some every forEach push slice join Math".split(
    " ",
  ),
);
export const tokensOf = (body: string): string[] =>
  [...new Set((body.match(/[A-Za-z_$][\w$]*/g) ?? []).filter((t) => t.length > 1 && !COMMON.has(t)))].sort();

export const hashOf = (norm: string): string => createHash("sha256").update(norm).digest("hex").slice(0, 16);

const declaredBy = (node: ts.VariableDeclaration): ts.Node =>
  ts.isVariableDeclarationList(node.parent) &&
  node.parent.declarations.length === 1 &&
  ts.isVariableStatement(node.parent.parent)
    ? node.parent.parent
    : node;

export const functionsIn = (path: string, text: string): Fn[] => {
  const comments = parseTs(path, text).comments;
  const sf = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const out: Fn[] = [];
  const push = (name: string, node: ts.Node): void => {
    const start = node.getStart(sf);
    const body = withoutComments(text, start, node.getEnd(), comments).replace(/\n\s*\n/g, "\n");
    const norm = body.replace(/\s+/g, " ").trim();
    out.push({
      file: path,
      line: sf.getLineAndCharacterOfPosition(start).line + 1,
      end: sf.getLineAndCharacterOfPosition(node.getEnd()).line + 1,
      name,
      body,
      norm,
      tokens: tokensOf(body),
      hash: hashOf(norm),
    });
  };
  const visit = (node: ts.Node, owner: string): void => {
    if (ts.isFunctionDeclaration(node) && node.name && node.body) push(node.name.text, node);
    else if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer &&
      (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))
    )
      push(node.name.text, declaredBy(node));
    else if (ts.isMethodDeclaration(node) && node.body) push(`${owner}.${node.name.getText(sf)}`, node);
    else if (
      ts.isPropertyAssignment(node) &&
      (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))
    )
      push(`${owner}.${node.name.getText(sf)}`, node);
    else if ((ts.isGetAccessorDeclaration(node) || ts.isSetAccessorDeclaration(node)) && node.body)
      push(`${owner}.${ts.isGetAccessorDeclaration(node) ? "get" : "set"} ${node.name.getText(sf)}`, node);
    else if (ts.isConstructorDeclaration(node) && node.body) push(`${owner}.constructor`, node);
    else if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      (ts.isArrowFunction(node.right) || ts.isFunctionExpression(node.right))
    )
      push(node.left.getText(sf), ts.isExpressionStatement(node.parent) ? node.parent : node);
    const next = ts.isClassDeclaration(node) && node.name ? node.name.text : owner;
    ts.forEachChild(node, (child) => visit(child, next));
  };
  visit(sf, "");
  return out;
};

export const functionsAt = (tree: Tree): { readonly fns: readonly Fn[]; readonly unread: readonly Unread[] } => {
  const fns: Fn[] = [];
  const unread: Unread[] = [];
  for (const root of HUNT_ROOTS)
    for (const file of tree.list(root)) {
      if (!isTsUnderLintRoots(file)) continue;
      try {
        fns.push(...functionsIn(file, tree.read(file)));
      } catch (error) {
        unread.push({ file, reason: error instanceof Error ? error.message : String(error) });
      }
    }
  return { fns, unread };
};
