import type { Rule, SourceCode } from "eslint";
import type { CallExpression, ForStatement, Node } from "estree";

const NAMED = /^(pace|window): \S/;

type Keys = SourceCode.VisitorKeys;

const isFn = (n: Node): boolean =>
  n.type === "FunctionDeclaration" || n.type === "FunctionExpression" || n.type === "ArrowFunctionExpression";

const isLoop = (n: Node): boolean =>
  n.type === "ForStatement" ||
  n.type === "ForOfStatement" ||
  n.type === "ForInStatement" ||
  n.type === "WhileStatement" ||
  n.type === "DoWhileStatement";

function children(n: Node, keys: Keys): Node[] {
  const out: Node[] = [];
  for (const key of keys[n.type] ?? []) {
    const value = (n as unknown as Record<string, unknown>)[key];
    for (const c of Array.isArray(value) ? (value as unknown[]) : [value])
      if (typeof (c as Node | null)?.type === "string") out.push(c as Node);
  }
  return out;
}

const rootName = (e: Node): string | null =>
  e.type === "Identifier" ? e.name : e.type === "MemberExpression" ? rootName(e.object) : null;

function writes(body: Node, counter: string | null, keys: Keys): Set<string> {
  const names = new Set<string>();
  const add = (e: Node): void => {
    const name = rootName(e);
    if (name !== null) names.add(name);
  };
  const walk = (n: Node): void => {
    if (isFn(n)) return;
    if (n.type === "VariableDeclarator" && n.id.type === "Identifier") names.add(n.id.name);
    if (n.type === "AssignmentExpression") add(n.left);
    if (
      n.type === "CallExpression" &&
      n.callee.type === "MemberExpression" &&
      n.callee.property.type === "Identifier" &&
      n.callee.property.name === "push"
    )
      add(n.callee.object);
    for (const c of children(n, keys)) walk(c);
  };
  walk(body);
  if (counter !== null) names.delete(counter);
  return names;
}

const reads = (e: Node, names: ReadonlySet<string>, keys: Keys): boolean =>
  e.type === "AwaitExpression" ||
  (e.type === "Identifier" && names.has(e.name)) ||
  children(e, keys).some((c) => reads(c, names, keys));

function leavesOnARead(loop: ForStatement, names: ReadonlySet<string>, keys: Keys): boolean {
  let found = false;
  const walk = (n: Node, nested: boolean, guarded: boolean): void => {
    if (found || isFn(n)) return;
    const leaving =
      n.type === "ReturnStatement" ||
      n.type === "ThrowStatement" ||
      (n.type === "BreakStatement" && !nested && !n.label);
    if (leaving && guarded) {
      found = true;
      return;
    }
    const inner = nested || isLoop(n) || n.type === "SwitchStatement";
    const guards = guarded || n.type === "CatchClause" || (n.type === "IfStatement" && reads(n.test, names, keys));
    for (const c of children(n, keys)) walk(c, inner, guards);
  };
  for (const c of children(loop, keys)) walk(c, false, false);
  return found;
}

function isPoll(loop: ForStatement, keys: Keys): boolean {
  const first = loop.init?.type === "VariableDeclaration" ? loop.init.declarations[0]?.id : undefined;
  const names = writes(loop.body, first?.type === "Identifier" ? first.name : null, keys);
  return (loop.test != null && reads(loop.test, names, keys)) || leavesOnARead(loop, names, keys);
}

const leaves = (n: Node, keys: Keys): boolean =>
  !isFn(n) &&
  !isLoop(n) &&
  (n.type === "ReturnStatement" ||
    n.type === "ThrowStatement" ||
    n.type === "BreakStatement" ||
    children(n, keys).some((c) => leaves(c, keys)));

function insidePoll(ancestors: readonly Node[], call: Node, keys: Keys): boolean {
  let at = -1;
  for (let i = ancestors.length - 1; i >= 0 && at < 0; i--) {
    if (isFn(ancestors[i]!)) return false;
    if (isLoop(ancestors[i]!)) at = i;
  }
  const loop = ancestors[at];
  if (loop?.type !== "ForStatement" || !isPoll(loop, keys)) return false;
  const path = [...ancestors.slice(at + 1), call];
  return !path.some((p, i) => p.type === "IfStatement" && leaves(path[i + 1]!, keys));
}

const isSleep = ({ callee }: CallExpression): boolean => {
  if (callee.type === "Identifier") return callee.name === "sleep";
  if (callee.type !== "MemberExpression") return false;
  const p = callee.property;
  return callee.computed ? p.type === "Literal" && p.value === "sleep" : p.type === "Identifier" && p.name === "sleep";
};

const named = ({ arguments: args }: CallExpression): boolean => {
  const why = args[1];
  const text =
    why?.type === "Literal"
      ? why.value
      : why?.type === "TemplateLiteral" && why.expressions.length === 0
        ? why.quasis[0]?.value.cooked
        : undefined;
  return args.length === 2 && typeof text === "string" && NAMED.test(text);
};

const e2eSleepInsidePoll: Rule.RuleModule = {
  meta: {
    type: "problem",
    messages: {
      found:
        'an e2e sleep outside a poll measures the runner, not the page: wait for the state with makeSettle or makeStable (handbook/specs/settle-doctrine.md, clause 3), or, where the pause is a gesture\'s own timing or the window a check reads over, name it at the call as sleep(ms, "pace: why") or sleep(ms, "window: why") (Issue #785)',
    },
  },
  create(context) {
    const keys = context.sourceCode.visitorKeys;
    return {
      CallExpression(node) {
        if (!isSleep(node) || named(node)) return;
        if (insidePoll(context.sourceCode.getAncestors(node), node, keys)) return;
        context.report({ node, messageId: "found" });
      },
    };
  },
};

export default { rules: { "e2e-sleep-inside-poll": e2eSleepInsidePoll } };
