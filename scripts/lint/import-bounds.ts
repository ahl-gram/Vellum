import type { Rule, Scope } from "eslint";
import { dirname, resolve } from "node:path";
import { inTypePosition, isModuleSource, repoPath, sourceBan, stringText } from "./source-shape.ts";

type Node = Rule.Node;

const WRAPPERS = new Set([
  "ChainExpression",
  "TSAsExpression",
  "TSNonNullExpression",
  "TSSatisfiesExpression",
  "TSTypeAssertion",
]);
export const bare = (node: Node): Node =>
  WRAPPERS.has(node.type) ? bare((node as unknown as { expression: Node }).expression) : node;
export const literalText = (node: Node | null | undefined): string | null =>
  node?.type === "Literal" && typeof node.value === "string"
    ? node.value
    : node?.type === "TemplateLiteral" && node.expressions.length === 0
      ? (node.quasis[0]?.value.cooked ?? null)
      : null;
export const memberName = (node: Node): string | null => {
  if (node.type !== "MemberExpression") return null;
  if (node.computed) return literalText(node.property as Node);
  return node.property.type === "Identifier" ? node.property.name : null;
};
export const keyName = (p: { key: unknown; computed: boolean }): string | null =>
  !p.computed && (p.key as Node).type === "Identifier" ? (p.key as { name: string }).name : literalText(p.key as Node);

const sourcesJudged = (context: Rule.RuleContext, refused: (source: string) => boolean): Rule.RuleListener => {
  const judge = (node: Node): void => {
    const text = stringText(node);
    const at = node.type === "TemplateElement" ? node.parent : node;
    if (text === null || inTypePosition(at.parent ?? at)) return;
    if (refused(text) && isModuleSource(context, at)) context.report({ node, messageId: "found" });
  };
  return { Literal: judge, TemplateElement: judge };
};

const isGlass = (file: string): boolean => /^src\/society\/philology[\w-]*\.ts$/.test(repoPath(file));
const philologyBan = sourceBan(
  "world generation never reaches for the philologist's glass, so a lexicon edit cannot re-roll a world (Issue #124)",
  (text) => text.includes("philology"),
);
const worldNoPhilology: Rule.RuleModule = {
  meta: philologyBan.meta,
  create: (context) => (isGlass(context.filename) ? {} : philologyBan.create(context)),
};

const isMath = (node: Node): boolean => {
  const object = bare(node);
  return (object.type === "Identifier" && object.name === "Math") || memberName(object) === "Math";
};
const philologyNoEntropy: Rule.RuleModule = {
  meta: {
    type: "problem",
    messages: {
      found:
        "the philologist's glass reads no source of randomness, no rng by any name or path and no Math.random, so the same name always reads the same way (Issue #124)",
    },
  },
  create(context) {
    const found = (node: Node): void => context.report({ node, messageId: "found" });
    return {
      ...sourcesJudged(context, (text) => /\brng\b/.test(text)),
      Identifier(node) {
        if (node.name === "rng" && !inTypePosition(node.parent)) found(node);
      },
      MemberExpression(node) {
        if (memberName(node) === "random" && isMath(node.object as Node)) found(node);
      },
      VariableDeclarator(node) {
        const keys = node.id.type === "ObjectPattern" ? node.id.properties : [];
        if (
          node.init &&
          isMath(node.init as Node) &&
          keys.some((p) => p.type === "Property" && keyName(p) === "random")
        )
          found(node);
      },
    };
  },
};

const BUILD_TIME = new Set(["src/site/home/stage-data.ts", "src/site/home/stations.ts"]);
const homeClientNoEngine: Rule.RuleModule = {
  meta: {
    type: "problem",
    messages: {
      found:
        "a client module of home imports nothing build-time: stage-data.ts and stations.ts run at build only, and the world and render engines would ride into the bundle with them (Issue #456)",
    },
  },
  create(context) {
    if (BUILD_TIME.has(repoPath(context.filename))) return {};
    const engine = (text: string): boolean => {
      if (!text.startsWith(".")) return false;
      const target = repoPath(resolve(dirname(context.filename), text));
      return BUILD_TIME.has(target) || target.startsWith("src/world/") || target.startsWith("src/render/");
    };
    return sourcesJudged(context, engine);
  },
};

const FINER = /lod|region|worker/i;
const CONSTRUCTORS = new Set(["URL", "Worker", "SharedWorker"]);
const HOOKS = new Set(["onSettle", "onApply"]);
const FACTORY = "createZoomController";
const isZoom = (text: unknown): boolean => typeof text === "string" && /zoom-controller/.test(text);

const literals = (args: readonly Node[]): string[] => {
  const [first] = args;
  if (first?.type === "ArrayExpression")
    return (first.elements as Array<Node | null>).flatMap((e) => (literalText(e) === null ? [] : [literalText(e)!]));
  const text = literalText(first);
  return text === null ? [] : [text];
};
const ctorName = (callee: Node): string => {
  const c = bare(callee);
  return c.type === "Identifier" ? c.name : (memberName(c) ?? "");
};
const isImportMeta = (node: Node): boolean =>
  node.type === "MetaProperty" && node.meta.name === "import" && node.property.name === "meta";

function finerSources(node: Node): string[] {
  if (node.type === "ImportDeclaration" || node.type === "ExportAllDeclaration") return literals([node.source as Node]);
  if (node.type === "ExportNamedDeclaration") return node.source ? literals([node.source as Node]) : [];
  if (node.type === "ImportExpression") return literals([node.source as Node]);
  if (node.type === "NewExpression" && CONSTRUCTORS.has(ctorName(node.callee as Node)))
    return literals(node.arguments as Node[]);
  if (
    node.type === "CallExpression" &&
    node.callee.type === "MemberExpression" &&
    memberName(node.callee as Node) === "glob" &&
    isImportMeta(node.callee.object as Node)
  )
    return literals(node.arguments as Node[]);
  return [];
}

const climb = (node: Node): Node => (node.parent && WRAPPERS.has(node.parent.type) ? climb(node.parent) : node);

type Use = { kind: "call"; options: Node | undefined } | { kind: "alias"; declarator: Node } | { kind: "refused" };
function useOf(ref: Node): Use {
  const top = climb(ref);
  const p = top.parent as Node;
  if (p.type === "CallExpression" && p.callee === top) return { kind: "call", options: p.arguments[0] as Node };
  if (p.type === "VariableDeclarator" && p.init === top && p.id.type === "Identifier")
    return { kind: "alias", declarator: p };
  const call = p.parent;
  const viaCall = p.type === "MemberExpression" && p.object === top && memberName(p) === "call";
  if (viaCall && call?.type === "CallExpression" && call.callee === p)
    return { kind: "call", options: call.arguments[1] as Node };
  return { kind: "refused" };
}

function optionsRefused(options: Node | undefined): Node[] {
  if (options?.type !== "ObjectExpression") return options ? [options] : [];
  return (options.properties as Node[]).filter((p) => {
    if (p.type !== "Property") return true;
    const key = keyName(p);
    return key === null || HOOKS.has(key);
  });
}

const valueReads = (variable: Scope.Variable): Scope.Reference[] =>
  variable.references.filter((r) => !r.isWrite() && (r as { isValueReference?: boolean }).isValueReference !== false);

function controllerRefusals(context: Rule.RuleContext, program: Node): Node[] {
  const refused: Node[] = [];
  const factories: Scope.Variable[] = [];
  const spaces: Scope.Variable[] = [];
  for (const st of (program as unknown as { body: Node[] }).body) {
    const exported = st.type === "ExportNamedDeclaration" || st.type === "ExportAllDeclaration";
    if (exported && isZoom((st.source as { value?: unknown } | null)?.value)) refused.push(st);
    if (st.type !== "ImportDeclaration" || !isZoom(st.source.value)) continue;
    for (const spec of st.specifiers as Node[]) {
      const declared = context.sourceCode.getDeclaredVariables(spec);
      if (spec.type === "ImportDefaultSpecifier") refused.push(spec);
      if (spec.type === "ImportNamespaceSpecifier") spaces.push(...declared);
      if (spec.type === "ImportSpecifier" && keyName({ key: spec.imported, computed: false }) === FACTORY)
        factories.push(...declared);
    }
  }
  const read = (ref: Node): void => {
    const use = useOf(ref);
    if (use.kind === "call") refused.push(...optionsRefused(use.options), ...(use.options ? [] : [ref]));
    else if (use.kind === "alias") factories.push(...context.sourceCode.getDeclaredVariables(use.declarator));
    else refused.push(ref);
  };
  for (let i = 0; i < factories.length; i++) for (const r of valueReads(factories[i]!)) read(r.identifier as Node);
  for (const space of spaces)
    for (const r of valueReads(space)) {
      const id = r.identifier as Node;
      const member = id.parent as Node;
      if (member.type !== "MemberExpression" || member.object !== id) refused.push(id);
      else if (memberName(member) === FACTORY) read(member);
    }
  return refused;
}

const huntFixedWorld: Rule.RuleModule = {
  meta: {
    type: "problem",
    messages: {
      finer:
        "the Hunt stays a fixed world: no module of it names a finer survey, a region or a worker as a module source (Issue #161)",
      hook: "the Hunt's zoom controller is geometric only: it is built with an options literal written out, carrying no onSettle or onApply, and reached only as a call this rule can read (Issue #161)",
    },
  },
  create(context) {
    const finer = (node: Node): void => {
      if (finerSources(node).some((text) => FINER.test(text))) context.report({ node, messageId: "finer" });
    };
    return {
      ImportDeclaration: finer,
      ExportAllDeclaration: finer,
      ExportNamedDeclaration: finer,
      ImportExpression: (node) => {
        finer(node);
        if (isZoom(literalText(node.source as Node))) context.report({ node, messageId: "hook" });
      },
      NewExpression: finer,
      CallExpression: finer,
      "Program:exit"(program) {
        for (const node of controllerRefusals(context, program as Node)) context.report({ node, messageId: "hook" });
      },
    };
  },
};

export default {
  rules: {
    "world-no-philology": worldNoPhilology,
    "philology-no-entropy": philologyNoEntropy,
    "home-client-no-engine": homeClientNoEngine,
    "hunt-fixed-world": huntFixedWorld,
  },
};
