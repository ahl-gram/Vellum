import type { Rule } from "eslint";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import type { Tree } from "../comment-judge/tree.ts";
import type { AcceptedCopy } from "../copy-hunt/accepted-copies.ts";
import { acceptedFor } from "../copy-hunt/accepted.ts";
import { functionsAt, functionsIn, MIN_TOKENS, type Fn } from "../copy-hunt/functions.ts";

type Options = { readonly roots: readonly string[]; readonly accepted: readonly AcceptedCopy[] };
type Index = {
  readonly texts: ReadonlyMap<string, string>;
  readonly byFile: ReadonlyMap<string, readonly Fn[]>;
  readonly byNorm: ReadonlyMap<string, readonly Fn[]>;
};

const GIT_MS = 30_000;
let treeReads = 0;
let textReads = 0;
export const readCounts = (): { readonly trees: number; readonly texts: number } => ({
  trees: treeReads,
  texts: textReads,
});

const workingTree = (root: string): Tree => ({
  sha: "the working tree",
  read: (path) => readFileSync(join(root, path), "utf8"),
  list: (prefix) => {
    const r = spawnSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard", "--", prefix], {
      cwd: root,
      encoding: "utf8",
      timeout: GIT_MS,
    });
    if (r.status !== 0) throw new Error(`git ls-files under ${root} failed: ${(r.stderr || String(r.error)).trim()}`);
    return r.stdout
      .split("\0")
      .filter((path) => path !== "")
      .sort();
  },
});

const indexes = new Map<string, Index>();
const keyOf = (root: string, roots: readonly string[]): string => [root, ...roots].join("\0");
const indexOf = (root: string, roots: readonly string[]): Index => {
  const known = indexes.get(keyOf(root, roots));
  if (known !== undefined) return known;
  treeReads += 1;
  const tree = workingTree(root);
  const byFile = new Map<string, Fn[]>();
  const byNorm = new Map<string, Fn[]>();
  for (const f of functionsAt(tree, roots).fns) {
    byFile.set(f.file, [...(byFile.get(f.file) ?? []), f]);
    byNorm.set(f.norm, [...(byNorm.get(f.norm) ?? []), f]);
  }
  const texts = new Map([...byFile.keys()].map((file) => [file, tree.read(file)]));
  const index = { texts, byFile, byNorm };
  indexes.set(keyOf(root, roots), index);
  return index;
};

const place = (f: Fn): string => `${f.name} at ${f.file}:${f.line}`;
const byPlace = (a: Fn, b: Fn): number => (a.file < b.file ? -1 : a.file > b.file ? 1 : a.line - b.line);

const wordForWord: Rule.RuleModule = {
  meta: {
    type: "problem",
    schema: [
      {
        type: "object",
        properties: {
          roots: { type: "array", items: { type: "string" }, minItems: 1 },
          accepted: { type: "array" },
        },
        required: ["roots", "accepted"],
        additionalProperties: false,
      },
    ],
    messages: {
      copy: "{{name}} is word for word {{copies}}: fold them into one function, or list each pair in scripts/copy-hunt/accepted-copies.ts with the ruling that keeps it (Issue #1332)",
    },
  },
  create(context) {
    const { roots, accepted } = context.options[0] as Options;
    const path = relative(context.cwd, context.filename).split(sep).join("/");
    return {
      Program() {
        const text = context.sourceCode.text;
        const read = indexes.get(keyOf(context.cwd, roots));
        const own = read?.texts.get(path) === text ? read.byFile.get(path) : undefined;
        if (own === undefined) textReads += 1;
        const here = own ?? functionsIn(path, text);
        const counted = here.filter((f) => f.tokens.length >= MIN_TOKENS);
        if (counted.length === 0) return;
        const index = indexOf(context.cwd, roots);
        for (const f of counted) {
          const elsewhere = (index.byNorm.get(f.norm) ?? []).filter((g) => g.file !== path);
          const copies = [...here.filter((g) => g !== f && g.norm === f.norm), ...elsewhere]
            .filter((g) => acceptedFor(accepted, f, g) === null)
            .sort(byPlace);
          if (copies.length > 0)
            context.report({
              loc: { start: { line: f.line, column: 0 }, end: { line: f.end, column: 0 } },
              messageId: "copy",
              data: { name: f.name, copies: copies.map(place).join(", ") },
            });
        }
      },
    };
  },
};

export default { rules: { "no-word-for-word-copy": wordForWord } };
