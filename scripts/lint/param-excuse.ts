import type { Rule } from "eslint";
import ts from "typescript";

type Node = Rule.Node;
type Services = { program: ts.Program; esTreeNodeToTSNodeMap: { get(node: unknown): ts.Node } };

const FUNCTIONS = [
  "ArrowFunctionExpression",
  "FunctionDeclaration",
  "FunctionExpression",
  "TSCallSignatureDeclaration",
  "TSConstructSignatureDeclaration",
  "TSConstructorType",
  "TSDeclareFunction",
  "TSEmptyBodyFunctionExpression",
  "TSFunctionType",
  "TSMethodSignature",
];

function bindings(node: Node | null | undefined): Node[] {
  if (!node) return [];
  if (node.type === "Identifier") return [node];
  if (node.type === "AssignmentPattern") return bindings(node.left as Node);
  if (node.type === "RestElement") return bindings(node.argument as Node);
  if (node.type === "ArrayPattern") return (node.elements as Array<Node | null>).flatMap(bindings);
  if (node.type === "ObjectPattern")
    return (node.properties as Node[]).flatMap((p) =>
      bindings((p.type === "Property" ? p.value : (p as { argument?: Node }).argument) as Node),
    );
  return bindings((node as unknown as { parameter?: Node }).parameter);
}

function pageElementTest(program: ts.Program, checker: ts.TypeChecker, at: ts.Node): (t: ts.Type) => boolean {
  const inScope = checker.getSymbolsInScope(at, ts.SymbolFlags.Interface);
  const dom = (name: string): ts.Type | null => {
    const symbol = inScope.find((s) => s.name === name);
    return symbol ? checker.getDeclaredTypeOfSymbol(symbol) : null;
  };
  const [element, input] = [dom("Element"), dom("HTMLInputElement")];
  if (!element || !input) return () => false;
  const fromDom = (p: ts.Type): boolean =>
    checker.isTypeAssignableTo(p, element) &&
    (p.getSymbol()?.declarations ?? []).some((d) => program.isSourceFileDefaultLibrary(d.getSourceFile()));
  const isElement = (t: ts.Type): boolean => {
    const own = checker.getNonNullableType(t);
    return (own.isUnion() ? own.types : [own]).every(fromDom);
  };
  const readonlyMember = (m: ts.Symbol): boolean =>
    (m.declarations ?? []).length > 0 &&
    (m.declarations ?? []).every((d) => (ts.getCombinedModifierFlags(d) & ts.ModifierFlags.Readonly) !== 0);
  return (t) => {
    const own = checker.getNonNullableType(t);
    const members = own.getProperties();
    const elementShaped =
      checker.isTypeAssignableTo(input, own) && members.every((m) => input.getProperty(m.name) !== undefined);
    return (
      isElement(own) ||
      (members.length > 0 &&
        checker.getIndexInfosOfType(own).length === 0 &&
        (elementShaped || members.every((m) => readonlyMember(m) && isElement(checker.getTypeOfSymbol(m)))))
    );
  };
}

const paramExcuseHoldsElement: Rule.RuleModule = {
  meta: {
    type: "problem",
    schema: [
      {
        type: "object",
        properties: { names: { type: "array", items: { type: "string" } } },
        required: ["names"],
        additionalProperties: false,
      },
    ],
    messages: {
      found:
        "{{name}} is a name no-param-reassign excuses, so a write into it goes unseen, but it holds {{type}}, not a page element (a type the DOM library declares), an element-shaped type or a record of read-only page elements: rename it, or return a new value instead of writing (Alex, 2026-09-26, Issue #654 rulings 4 and 5)",
    },
  },
  create(context) {
    const names = new Set((context.options[0] as { names: string[] }).names);
    const services = context.sourceCode.parserServices as Partial<Services> | undefined;
    if (!services?.program || !services.esTreeNodeToTSNodeMap) return {};
    const { program, esTreeNodeToTSNodeMap: toTs } = services;
    const checker = program.getTypeChecker();
    let holds: ((t: ts.Type) => boolean) | null = null;
    const check = (fn: Node): void => {
      for (const id of (fn as unknown as { params: Node[] }).params.flatMap(bindings)) {
        if (id.type !== "Identifier" || !names.has(id.name)) continue;
        const at = toTs.get(id);
        holds ??= pageElementTest(program, checker, at.getSourceFile());
        const type = checker.getTypeAtLocation(at);
        if (!holds(type))
          context.report({ node: id, messageId: "found", data: { name: id.name, type: checker.typeToString(type) } });
      }
    };
    return Object.fromEntries(FUNCTIONS.map((kind) => [kind, check]));
  },
};

export default { rules: { "param-excuse-holds-element": paramExcuseHoldsElement } };
