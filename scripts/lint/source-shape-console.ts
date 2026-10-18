import type { Rule } from "eslint";
import { dirname, resolve } from "node:path";
import { CANCELLATION_PREFIXES } from "../../e2e/support/console.ts";
import { VALUE_WRAPPERS, inTypePosition, isName, problem, repoPath, wholeString } from "./source-shape.ts";

type Node = Rule.Node;

const CONSOLE_MODULE = "e2e/support/console.ts";
const DROP = "dropExpectedCancellations";
const carriesOpening = (text: string): boolean => CANCELLATION_PREFIXES.some((prefix) => text.includes(prefix));

const importedDrop = (context: Rule.RuleContext, callee: Node): boolean => {
  for (
    let scope: ReturnType<typeof context.sourceCode.getScope> | null = context.sourceCode.getScope(callee);
    scope;
    scope = scope.upper
  ) {
    const variable = scope.set.get(DROP);
    if (!variable) continue;
    const def = variable.defs[0];
    if (def?.type !== "ImportBinding" || typeof def.parent.source.value !== "string") return false;
    const imported =
      def.node.type === "ImportSpecifier" && def.node.imported.type === "Identifier" ? def.node.imported.name : null;
    return (
      imported === DROP && repoPath(resolve(dirname(context.filename), def.parent.source.value)) === CONSOLE_MODULE
    );
  }
  return false;
};

const e2eCancellationRoster: Rule.RuleModule = {
  meta: problem(
    "a cancellation opening is spelled once, in CANCELLATION_PREFIXES in e2e/support/console.ts, and dropped only through the dropExpectedCancellations that module exports (Issue #613)",
  ),
  create(context) {
    if (repoPath(context.filename) === CONSOLE_MODULE) return {};
    const found = (node: Node): void => context.report({ node, messageId: "found" });
    return {
      Literal(node) {
        const text = typeof node.value === "string" ? node.value : "regex" in node ? node.regex.pattern : "";
        if (carriesOpening(text) || (text === DROP && !inTypePosition(node.parent))) found(node);
      },
      TemplateElement(node) {
        if (carriesOpening(node.value.cooked ?? node.value.raw)) found(node);
      },
      CallExpression(node) {
        if (isName(node.callee as Node, DROP) && !importedDrop(context, node.callee as Node)) found(node);
      },
      MemberExpression(node) {
        if (!node.computed && isName(node.property as Node, DROP)) found(node);
      },
      Property(node) {
        if (node.parent.type === "ObjectPattern" && !node.computed && isName(node.key as Node, DROP)) found(node);
      },
      TemplateLiteral(node) {
        if (wholeString(node) === DROP) found(node);
      },
    };
  },
};

const ACCUMULATOR = "consoleErrors";
const OWNERS = new Set(["e2e/run.ts", "e2e/harness.ts"]);
const FUNCTIONS = new Set(["ArrowFunctionExpression", "FunctionDeclaration", "FunctionExpression"]);
const BINDINGS = new Set(["ImportSpecifier", "ExportSpecifier"]);

const readOf = (id: Node): Node | null => {
  const parent = id.parent;
  if (parent === null) return null;
  const kind = parent.type as string;
  if (VALUE_WRAPPERS.has(kind)) return id;
  if (kind.startsWith("TS") || BINDINGS.has(kind)) return null;
  if (parent.type === "MemberExpression") return parent.property === id && !parent.computed ? parent : id;
  if (parent.type === "Property")
    return parent.parent.type === "ObjectExpression" && (parent.value === id || (parent.computed && parent.key === id))
      ? id
      : null;
  if (
    (parent.type === "VariableDeclarator" && parent.id === id) ||
    (parent.type === "AssignmentPattern" && parent.left === id)
  )
    return null;
  return FUNCTIONS.has(kind) && (parent as unknown as { params: readonly unknown[] }).params.includes(id) ? null : id;
};

const unwrapped = (node: Node): Node =>
  node.parent !== null && VALUE_WRAPPERS.has(node.parent.type) ? unwrapped(node.parent) : node;

const isBaseCapture = (read: Node): boolean => {
  if (read.type !== "Identifier") return false;
  const outer = unwrapped(read);
  const member = outer.parent;
  if (
    member?.type !== "MemberExpression" ||
    member.object !== outer ||
    member.computed ||
    !isName(member.property as Node, "length")
  )
    return false;
  return member.parent.type === "VariableDeclarator" && member.parent.init === member;
};

const accumulatorString = (node: Node): Node | null => {
  if (wholeString(node) !== ACCUMULATOR || node.parent === null || inTypePosition(node.parent)) return null;
  const outer = unwrapped(node);
  const member = outer.parent;
  return member?.type === "MemberExpression" && member.computed && member.property === outer ? member : node;
};

const throughDrop = (read: Node): boolean => {
  if (isBaseCapture(read)) return true;
  for (let node: Node = read; node.parent !== null; node = node.parent) {
    const call = node.parent;
    if (
      call.type === "CallExpression" &&
      isName(call.callee as Node, DROP) &&
      (call.arguments as unknown[]).includes(node)
    )
      return true;
  }
  return false;
};

const e2eConsoleReadThroughDrop: Rule.RuleModule = {
  meta: problem(
    "a check reads the console accumulator only through dropExpectedCancellations from e2e/support/console.ts, or as a .length base, so no call site can quietly stop filtering (Issue #613)",
  ),
  create(context) {
    if (OWNERS.has(repoPath(context.filename))) return {};
    const judged = new WeakSet<Node>();
    const judge = (read: Node | null): void => {
      if (read === null || judged.has(read)) return;
      judged.add(read);
      if (!throughDrop(read)) context.report({ node: read, messageId: "found" });
    };
    return {
      Identifier(node) {
        if (node.name === ACCUMULATOR) judge(readOf(node));
      },
      Literal(node) {
        judge(accumulatorString(node));
      },
      TemplateLiteral(node) {
        judge(accumulatorString(node));
      },
    };
  },
};

export default {
  rules: {
    "e2e-cancellation-roster": e2eCancellationRoster,
    "e2e-console-read-through-drop": e2eConsoleReadThroughDrop,
  },
};
