import { tokenize, tokenTypes } from "@eslint/css-tree";
import ts from "typescript";

export type Token = { readonly text: string; readonly line: number };

export const lineFinder = (text: string): ((offset: number) => number) => {
  const source = ts.createSourceMapSource("", text);
  return (offset) => source.getLineAndCharacterOfPosition(offset).line + 1;
};

export const scriptKindOf = (path: string): ts.ScriptKind =>
  path.endsWith(".tsx") ? ts.ScriptKind.TSX : /\.[mc]?js$/.test(path) ? ts.ScriptKind.JS : ts.ScriptKind.TS;

export const scriptTokens = (path: string, text: string): Token[] => {
  const file = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, scriptKindOf(path));
  const out: Token[] = [];
  const walk = (node: ts.Node): void => {
    if (node.kind >= ts.SyntaxKind.FirstJSDocNode && node.kind <= ts.SyntaxKind.LastJSDocNode) return;
    const line = file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1;
    out.push({ text: String(ts.SyntaxKind[node.kind]), line });
    const children = node.getChildren(file);
    if (children.length === 0) out.push({ text: node.getText(file), line });
    for (const child of children) walk(child);
  };
  walk(file);
  return out;
};

export const sheetTokens = (css: string, lineOf: (offset: number) => number): Token[] => {
  const out: Token[] = [];
  let spaced = false;
  tokenize(css, (type, start, end) => {
    if (type === tokenTypes["Comment"]) return;
    if (type === tokenTypes["WhiteSpace"]) {
      spaced = true;
      return;
    }
    if (spaced && out.length > 0) out.push({ text: " ", line: lineOf(start) });
    spaced = false;
    out.push({ text: css.slice(start, end), line: lineOf(start) });
  });
  return out;
};
