// A hand-authored file outside src/ (CLAUDE.md): the house's lint rules that keep the 1024 floor's one layout (Issue #763 ruling 2A), imported by eslint.config.ts and never run by Node directly.
import type { CSSRuleDefinition } from "@eslint/css";
import { generate, parse, walk, type CssNode } from "@eslint/css-tree";
import type { Rule, Scope } from "eslint";
import type ts from "typescript";
import { PAGE_FLOOR } from "../../src/site/shared/page-box.ts";

type Op = "<" | "<=" | ">" | ">=" | "=";
const FLIP: Readonly<Record<Op, Op>> = { "<": ">", "<=": ">=", ">": "<", ">=": "<=", "=": "=" };

const sides = (op: Op, n: number): readonly [number, number] =>
  op === "<=" || op === ">" ? [Math.floor(n), Math.floor(n) + 1] : [Math.ceil(n) - 1, Math.ceil(n)];

export const narrowBreakpoint = (op: Op, n: number): boolean =>
  op === "=" ? narrowBreakpoint("<=", n) || narrowBreakpoint(">=", n) : sides(op, n)[1] <= PAGE_FLOOR;

const UNPARSED: ReadonlySet<string> = new Set(["GeneralEnclosed", "Raw"]);
const WIDTH_FEATURE = /^(min-|max-)?(device-)?width$/i;
const RANGE_FEATURE = /^(device-)?width$/i;

const pxOf = (node: CssNode | null | undefined): number | null => {
  if (node?.type === "Dimension" && node.unit.toLowerCase() === "px") return Number(node.value);
  if (node?.type === "Number" && Number(node.value) === 0) return 0;
  return null;
};

type Faults = { readonly narrow: string[]; readonly unread: string[] };

const judge = (faults: Faults, text: string, op: Op, value: CssNode | null | undefined): void => {
  const n = pxOf(value);
  if (n === null) faults.unread.push(text);
  else if (narrowBreakpoint(op, n)) faults.narrow.push(text);
};

const featureFaults = (node: CssNode, faults: Faults): void => {
  if (node.type === "Feature" && node.kind === "media") {
    const m = WIDTH_FEATURE.exec(node.name);
    if (m && node.value)
      judge(
        faults,
        generate(node),
        m[1]?.toLowerCase() === "min-" ? ">=" : m[1]?.toLowerCase() === "max-" ? "<=" : "=",
        node.value,
      );
  } else if (node.type === "FeatureRange" && node.kind === "media") {
    const text = generate(node);
    const isWidth = (n: CssNode | null): boolean => n?.type === "Identifier" && RANGE_FEATURE.test(n.name);
    if (isWidth(node.left)) judge(faults, text, node.leftComparison as Op, node.middle);
    else if (isWidth(node.middle)) {
      judge(faults, text, FLIP[node.leftComparison as Op], node.left);
      if (node.right && node.rightComparison) judge(faults, text, node.rightComparison as Op, node.right);
    }
  } else if (UNPARSED.has(node.type) && /width/i.test(generate(node))) faults.unread.push(generate(node));
};

export const mediaFaults = (prelude: CssNode): Faults => {
  const faults: Faults = { narrow: [], unread: [] };
  walk(prelude, (node) => featureFaults(node, faults));
  return faults;
};

const describe = (faults: Faults): string =>
  [
    ...faults.narrow.map(
      (t) =>
        `${t} switches the layout at a fixed window width at or below the ${PAGE_FLOOR} floor, where every page keeps its ${PAGE_FLOOR} layout and scrolls sideways (Alex, 2026-10-06, Issue #762; Issue #763 ruling 2A): a width rule starts above the floor, or goes`,
    ),
    ...faults.unread.map(
      (t) =>
        `${t} is a window width this rule cannot read: write the breakpoint in px, so the ${PAGE_FLOOR} floor can be checked (Issue #763)`,
    ),
  ].join("; ");

const MEDIA_LISTS = new Set(["media", "import", "custom-media"]);

const cssNoNarrowWidth: CSSRuleDefinition = {
  meta: { type: "problem", messages: { narrow: "{{text}}" } },
  create(context) {
    return {
      Atrule(node) {
        if (!node.prelude || !MEDIA_LISTS.has(node.name.toLowerCase())) return;
        // @eslint/css hands a rule css-tree's plain form, lists as arrays, which css-tree's own walk and generate read as they read a List.
        const faults = mediaFaults(node.prelude as unknown as CssNode);
        if (faults.narrow.length + faults.unread.length > 0)
          context.report({ loc: node.loc!, messageId: "narrow", data: { text: describe(faults) } });
      },
    };
  },
};

type Node = Rule.Node;
const GLOBAL_OBJECTS = new Set(["window", "globalThis", "self", "top", "parent", "frames", "document.defaultView"]);
const ROOT_BOXES = ["document.documentElement", "document.body", "document.scrollingElement"];
const WIDTH_READS = new Set([
  "innerWidth",
  "outerWidth",
  "visualViewport.width",
  "screen.width",
  "screen.availWidth",
  ...ROOT_BOXES.flatMap((box) => [`${box}.clientWidth`, `${box}.offsetWidth`, `${box}.getBoundingClientRect().width`]),
]);
const COMPARISONS: Readonly<Record<string, Op>> = {
  "<": "<",
  "<=": "<=",
  ">": ">",
  ">=": ">=",
  "==": "=",
  "===": "=",
  "!=": "=",
  "!==": "=",
};

const WRAPPERS: ReadonlySet<string> = new Set([
  "ChainExpression",
  "TSNonNullExpression",
  "TSAsExpression",
  "TSSatisfiesExpression",
  "TSTypeAssertion",
]);
const unwrap = (node: Node): Node =>
  WRAPPERS.has(node.type) ? unwrap((node as unknown as { expression: Node }).expression) : node;

const keyOf = (node: Node & { type: "MemberExpression" }): string | null => {
  const key = node.property as Node;
  if (!node.computed) return key.type === "Identifier" ? key.name : null;
  return key.type === "Literal" && typeof key.value === "string" ? key.value : null;
};

const isGlobal = (context: Rule.RuleContext, id: Node): boolean => {
  for (let scope: Scope.Scope | null = context.sourceCode.getScope(id); scope; scope = scope.upper) {
    const ref = scope.references.find((r) => r.identifier === (id as unknown));
    if (ref) return ref.resolved === null || ref.resolved.defs.length === 0;
  }
  return false;
};

const globalPath = (context: Rule.RuleContext, raw: Node): string | null => {
  const node = unwrap(raw);
  if (node.type === "Identifier") return isGlobal(context, node) ? node.name : null;
  if (node.type === "CallExpression") {
    const callee = node.arguments.length === 0 ? globalPath(context, node.callee as Node) : null;
    return callee === null ? null : `${callee}()`;
  }
  if (node.type !== "MemberExpression") return null;
  const key = keyOf(node);
  const head = key === null ? null : globalPath(context, node.object as Node);
  if (head === null || key === null) return null;
  return GLOBAL_OBJECTS.has(head) ? key : `${head}.${key}`;
};

type Services = { program: ts.Program; esTreeNodeToTSNodeMap: { get(node: unknown): ts.Node } };
const typeOf = (context: Rule.RuleContext, node: Node): ts.Type | null => {
  const services = context.sourceCode.parserServices as Partial<Services> | undefined;
  if (!services?.program || !services.esTreeNodeToTSNodeMap) return null;
  return services.program.getTypeChecker().getTypeAtLocation(services.esTreeNodeToTSNodeMap.get(node));
};

const numberOf = (context: Rule.RuleContext, node: Node): number | null => {
  if (node.type === "Literal" && typeof node.value === "number") return node.value;
  const type = typeOf(context, node);
  return type?.isNumberLiteral() ? type.value : null;
};

const stringOf = (context: Rule.RuleContext, node: Node): string | null => {
  if (node.type === "Literal" && typeof node.value === "string") return node.value;
  if (node.type === "TemplateLiteral" && node.expressions.length === 0) return node.quasis[0]?.value.cooked ?? null;
  const type = typeOf(context, node);
  return type?.isStringLiteral() ? type.value : null;
};

/** The query a call hands matchMedia, directly or through .call or .apply: undefined where the call is not to matchMedia, null where the query cannot be read. */
const mediaQueryOf = (context: Rule.RuleContext, node: Node & { type: "CallExpression" }): Node | null | undefined => {
  const callee = unwrap(node.callee as Node);
  if (globalPath(context, callee) === "matchMedia") return (node.arguments[0] as Node | undefined) ?? undefined;
  if (callee.type !== "MemberExpression" || globalPath(context, callee.object as Node) !== "matchMedia")
    return undefined;
  const how = keyOf(callee);
  if (how === "call") return (node.arguments[1] as Node | undefined) ?? null;
  return how === "apply" || how === "bind" ? null : undefined;
};

const queryFaults = (query: string): Faults => {
  try {
    return mediaFaults(parse(query, { context: "mediaQueryList" }));
  } catch {
    return { narrow: [], unread: [query] };
  }
};

const noNarrowWidth: Rule.RuleModule = {
  meta: {
    type: "problem",
    messages: {
      narrow: "{{text}}",
      unread:
        "matchMedia is asked a query this rule cannot read: write it as a string the checker knows, so the {{floor}} floor can be checked (Issue #763)",
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        const asked = mediaQueryOf(context, node);
        if (asked === undefined) return;
        const query = asked === null ? null : stringOf(context, asked);
        if (query === null) {
          context.report({ node, messageId: "unread", data: { floor: String(PAGE_FLOOR) } });
          return;
        }
        const faults = queryFaults(query);
        if (faults.narrow.length + faults.unread.length > 0)
          context.report({ node, messageId: "narrow", data: { text: describe(faults) } });
      },
      BinaryExpression(node) {
        const op = COMPARISONS[node.operator];
        if (op === undefined) return;
        const [left, right] = [node.left as Node, node.right as Node];
        const read = WIDTH_READS.has(globalPath(context, left) ?? "")
          ? { at: op, value: right }
          : WIDTH_READS.has(globalPath(context, right) ?? "")
            ? { at: FLIP[op], value: left }
            : null;
        const n = read ? numberOf(context, read.value) : null;
        if (read && n !== null && narrowBreakpoint(read.at, n))
          context.report({
            node,
            messageId: "narrow",
            data: { text: describe({ narrow: [context.sourceCode.getText(node)], unread: [] }) },
          });
      },
    };
  },
};

export default { rules: { "css-no-narrow-width": cssNoNarrowWidth, "no-narrow-width": noNarrowWidth } };
