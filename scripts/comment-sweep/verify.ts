import type { Changed, Tree } from "../comment-judge/tree.ts";
import { isDoc } from "../docs-only.ts";
import { pageTokens } from "./page-tokens.ts";
import { lineFinder, scriptTokens, sheetTokens, type Token } from "./tokens.ts";

export type Excerpt = { readonly line: number; readonly text: string };
export type Difference = { readonly base: Excerpt | null; readonly head: Excerpt | null };
export type Finding =
  | { readonly kind: "identical" | "added" | "deleted" | "type changed" | "not read" | "prose"; readonly path: string }
  | { readonly kind: "renamed"; readonly path: string; readonly before: string }
  | { readonly kind: "differs"; readonly path: string; readonly difference: Difference };

export const readerOf = (path: string): ((text: string) => Token[]) | null => {
  if (/\.(?:[mc]?ts|tsx|[mc]?js)$/.test(path)) return (text) => scriptTokens(path, text);
  if (path.endsWith(".css")) return (text) => sheetTokens(text, lineFinder(text));
  if (path.endsWith(".astro")) return pageTokens;
  return null;
};

const excerptOf = (token: Token | undefined, at: number): Excerpt | null =>
  token === undefined
    ? null
    : {
        line: token.line + (token.text.slice(0, at).match(/\n/g)?.length ?? 0),
        text: token.text.slice(Math.max(0, at - 20), at + 40),
      };

export const firstDifference = (base: readonly Token[], head: readonly Token[]): Difference | null => {
  for (let i = 0; i < Math.max(base.length, head.length); i += 1) {
    const a = base[i];
    const b = head[i];
    if (a?.text === b?.text) continue;
    let at = 0;
    if (a !== undefined && b !== undefined) while (at < a.text.length && a.text[at] === b.text[at]) at += 1;
    return { base: excerptOf(a, at), head: excerptOf(b, at) };
  }
  return null;
};

const findingOf = (c: Changed, before: Tree, after: Tree): Finding => {
  if (isDoc(c.path) && (c.before === null || isDoc(c.before))) return { kind: "prose", path: c.path };
  if (c.before === null) return { kind: "added", path: c.path };
  if (c.before !== c.path) return { kind: "renamed", path: c.path, before: c.before };
  const read = readerOf(c.path);
  if (read === null) return { kind: "not read", path: c.path };
  const difference = firstDifference(read(before.read(c.before)), read(after.read(c.path)));
  return difference === null ? { kind: "identical", path: c.path } : { kind: "differs", path: c.path, difference };
};

export const findingsOf = (
  changed: readonly Changed[],
  deleted: readonly string[],
  typeChanged: readonly string[],
  before: Tree,
  after: Tree,
): Finding[] => [
  ...changed.map((c) => findingOf(c, before, after)),
  ...deleted.map((path): Finding => ({ kind: isDoc(path) ? "prose" : "deleted", path })),
  ...typeChanged.map((path): Finding => ({ kind: isDoc(path) ? "prose" : "type changed", path })),
];
