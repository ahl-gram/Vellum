import type { Rule } from "eslint";
import { repoPath } from "./source-shape.ts";

export const ARGV_PATH_READS: Readonly<Record<string, number>> = { "test-support/source-read-guard.ts": 1 };

type Shape = {
  readonly type: string;
  readonly computed?: boolean;
  readonly name?: string;
  readonly value?: unknown;
  readonly object?: Shape;
  readonly property?: Shape;
  readonly callee?: Shape;
  readonly arguments?: readonly Shape[];
};

const isNamed = (node: Shape | undefined, name: string): boolean => node?.type === "Identifier" && node.name === name;

const isProcessArgv = (node: Shape | undefined): boolean =>
  node?.type === "MemberExpression" &&
  node.computed !== true &&
  isNamed(node.object, "process") &&
  isNamed(node.property, "argv");

const isOne = (node: Shape | undefined): boolean => node?.type === "Literal" && node.value === 1;

const readsTypedEntry = (node: Shape): boolean =>
  (node.type === "MemberExpression" && node.computed === true && isOne(node.property) && isProcessArgv(node.object)) ||
  (node.type === "CallExpression" &&
    node.callee?.type === "MemberExpression" &&
    node.callee.computed !== true &&
    isNamed(node.callee.property, "at") &&
    isProcessArgv(node.callee.object) &&
    isOne(node.arguments?.[0]));

const noArgvEntryPath: Rule.RuleModule = {
  meta: {
    type: "problem",
    messages: {
      typed:
        "process.argv[1] is the path the entry was started by, as typed, so started through a symlink it differs from the module's own path and an entry check built on it skips and exits 0 (Issue #1180): a module asks import.meta.main whether it is the entry, and a read that is no entry check is counted for its file in ARGV_PATH_READS in scripts/lint/entry-guard.ts",
      stale:
        "{{file}} is counted {{tolerated}} reads of process.argv[1] in ARGV_PATH_READS in scripts/lint/entry-guard.ts and makes {{seen}}, so the count leaves room for a read nobody ruled: lower it, or delete the entry",
    },
  },
  create(context) {
    const file = repoPath(context.filename);
    const tolerated = ARGV_PATH_READS[file] ?? 0;
    let seen = 0;
    const judge = (node: Rule.Node): void => {
      if (!readsTypedEntry(node)) return;
      seen += 1;
      if (seen > tolerated) context.report({ node, messageId: "typed" });
    };
    return {
      MemberExpression: judge,
      CallExpression: judge,
      "Program:exit"(node) {
        if (seen < tolerated)
          context.report({
            node,
            messageId: "stale",
            data: { file, tolerated: String(tolerated), seen: String(seen) },
          });
      },
    };
  },
};

export default { rules: { "no-argv-entry-path": noArgvEntryPath } };
