import type { Rule } from "eslint";
import { dirname, relative, resolve, sep } from "node:path";
import { CANCELLATION_PREFIXES } from "../../e2e/support/console.ts";

type Node = Rule.Node;

const ROOT = resolve(import.meta.dirname, "..", "..");
const repoPath = (file: string): string => relative(ROOT, file).split(sep).join("/");
const problem = (message: string): Rule.RuleMetaData => ({ type: "problem", messages: { found: message } });

const ID_LOOKUP = "getElementById";
const wholeString = (node: Node): string | null =>
  node.type === "Literal" && typeof node.value === "string" ? node.value : node.type === "TemplateLiteral" && node.expressions.length === 0 ? (node.quasis[0]?.value.cooked ?? null) : null;

const engineNoIdLookup: Rule.RuleModule = {
  meta: problem("the living-chart engine looks up no element by id: ids are the host's namespace, and the host passes elements in (handbook/specs/explorer-doctrine.md)"),
  create(context) {
    const found = (node: Node): void => context.report({ node, messageId: "found" });
    return {
      MemberExpression(node) {
        if (!node.computed && node.property.type === "Identifier" && node.property.name === ID_LOOKUP) found(node);
      },
      Property(node) {
        if (node.parent.type === "ObjectPattern" && !node.computed && node.key.type === "Identifier" && node.key.name === ID_LOOKUP) found(node);
      },
      Literal(node) {
        if (wholeString(node) === ID_LOOKUP) found(node);
      },
      TemplateLiteral(node) {
        if (wholeString(node) === ID_LOOKUP) found(node);
      },
    };
  },
};

const VALUE_WRAPPERS = new Set(["TSAsExpression", "TSNonNullExpression", "TSSatisfiesExpression", "TSTypeAssertion"]);
const WORKERS = new Set(["Worker", "SharedWorker"]);
const STATIC_TARGET = /^\.\/[\w-]+\.ts$/;
const SPAWN_TEXT = /^new\s+(?:Worker|SharedWorker)\s*\(\s*new\s+URL\s*\(\s*(["'])\.\/[\w-]+\.ts\1\s*,\s*import\.meta\.url\s*(?:,\s*)?\)/;
const isName = (node: Node | undefined, name: string): boolean => node?.type === "Identifier" && node.name === name;
const isImportMetaUrl = (node: Node | undefined): boolean =>
  node?.type === "MemberExpression" && !node.computed && isName(node.property as Node, "url") && node.object.type === "MetaProperty" && node.object.meta.name === "import" && node.object.property.name === "meta";
const isStaticUrl = (node: Node | undefined): boolean => {
  if (node?.type !== "NewExpression" || !isName(node.callee as Node, "URL") || node.arguments.length !== 2) return false;
  const [target, base] = node.arguments as Node[];
  return target?.type === "Literal" && typeof target.value === "string" && STATIC_TARGET.test(target.value) && isImportMetaUrl(base);
};
const isModuleOptions = (node: Node | undefined): boolean => {
  if (node?.type !== "ObjectExpression" || node.properties.length !== 1) return false;
  const [only] = node.properties;
  return only?.type === "Property" && !only.computed && isName(only.key as Node, "type") && only.value.type === "Literal" && only.value.value === "module";
};

const inTypePosition = (parent: Node): boolean => parent.type.startsWith("TS") && !VALUE_WRAPPERS.has(parent.type);

const constructsOrTests = (id: Node, parent: Node): boolean =>
  (parent.type === "NewExpression" && parent.callee === id) ||
  (parent.type === "UnaryExpression" && parent.operator === "typeof") ||
  (parent.type === "BinaryExpression" && parent.operator === "instanceof" && parent.right === id) ||
  (parent.type === "Property" && parent.key === id && !parent.computed && parent.parent.type === "ObjectExpression") ||
  inTypePosition(parent);

const isWorkerString = (node: Node): boolean => node.parent !== null && !inTypePosition(node.parent) && WORKERS.has(wholeString(node) ?? "");

const workerSpawnStatic: Rule.RuleModule = {
  meta: problem("a worker is spawned as a bare new Worker(new URL(\"./<name>.ts\", import.meta.url), { type: \"module\" }), or new SharedWorker in the same form, written out in full: the bundler rewrites only that form, never a constructor reached through a member, a variable, an alias or a string naming it (handbook/specs/site-architecture.md)"),
  create(context) {
    return {
      NewExpression(node) {
        if (node.callee.type !== "Identifier" || !WORKERS.has(node.callee.name)) return;
        const [target, options, ...rest] = node.arguments as Node[];
        const spelled = SPAWN_TEXT.test(context.sourceCode.getText(node));
        if (rest.length > 0 || !isStaticUrl(target) || !isModuleOptions(options) || !spelled) context.report({ node, messageId: "found" });
      },
      Identifier(node) {
        if (WORKERS.has(node.name) && !constructsOrTests(node, node.parent)) context.report({ node, messageId: "found" });
      },
      Literal(node) {
        if (isWorkerString(node)) context.report({ node, messageId: "found" });
      },
      TemplateLiteral(node) {
        if (isWorkerString(node)) context.report({ node, messageId: "found" });
      },
    };
  },
};

const SILENT_ESCAPE = /(?<!\\)(?:\\\\)*\\[sSdDwWbB.]/;
const isStringRaw = (tag: Node): boolean => tag.type === "MemberExpression" && !tag.computed && isName(tag.object as Node, "String") && isName(tag.property as Node, "raw");

const templateSilentEscape: Rule.RuleModule = {
  meta: problem("a single-escaped \\s, \\d, \\w, \\b or \\. in a backtick string loses its backslash before a browser or a RegExp reads it, and never throws: double the backslash or build the string with String.raw"),
  create(context) {
    return {
      TemplateElement(node) {
        const literal = node.parent;
        const outer = literal.parent;
        if (outer?.type === "TaggedTemplateExpression" && outer.quasi === literal && isStringRaw(outer.tag as Node)) return;
        if (SILENT_ESCAPE.test(node.value.raw)) context.report({ node, messageId: "found" });
      },
    };
  },
};

const CONSOLE_MODULE = "e2e/support/console.ts";
const DROP = "dropExpectedCancellations";
const carriesOpening = (text: string): boolean => CANCELLATION_PREFIXES.some((prefix) => text.includes(prefix));

const importedDrop = (context: Rule.RuleContext, callee: Node): boolean => {
  for (let scope: ReturnType<typeof context.sourceCode.getScope> | null = context.sourceCode.getScope(callee); scope; scope = scope.upper) {
    const variable = scope.set.get(DROP);
    if (!variable) continue;
    const def = variable.defs[0];
    if (def?.type !== "ImportBinding" || typeof def.parent.source.value !== "string") return false;
    const imported = def.node.type === "ImportSpecifier" && def.node.imported.type === "Identifier" ? def.node.imported.name : null;
    return imported === DROP && repoPath(resolve(dirname(context.filename), def.parent.source.value)) === CONSOLE_MODULE;
  }
  return false;
};

const e2eCancellationRoster: Rule.RuleModule = {
  meta: problem("a cancellation opening is spelled once, in CANCELLATION_PREFIXES in e2e/support/console.ts, and dropped only through the dropExpectedCancellations that module exports (Issue #613)"),
  create(context) {
    if (repoPath(context.filename) === CONSOLE_MODULE) return {};
    const found = (node: Node): void => context.report({ node, messageId: "found" });
    return {
      Literal(node) {
        const text = typeof node.value === "string" ? node.value : "regex" in node ? node.regex.pattern : "";
        if (carriesOpening(text)) found(node);
      },
      TemplateElement(node) {
        if (carriesOpening(node.value.cooked ?? node.value.raw)) found(node);
      },
      CallExpression(node) {
        const callee = node.callee as Node;
        const throughMember = callee.type === "MemberExpression" && !callee.computed && isName(callee.property as Node, DROP);
        if (throughMember || (isName(callee, DROP) && !importedDrop(context, callee))) found(node);
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
  if (parent.type === "Property") return parent.parent.type === "ObjectExpression" && (parent.value === id || (parent.computed && parent.key === id)) ? id : null;
  if ((parent.type === "VariableDeclarator" && parent.id === id) || (parent.type === "AssignmentPattern" && parent.left === id)) return null;
  return FUNCTIONS.has(kind) && (parent as unknown as { params: readonly unknown[] }).params.includes(id) ? null : id;
};

const unwrapped = (node: Node): Node => (node.parent !== null && VALUE_WRAPPERS.has(node.parent.type) ? unwrapped(node.parent) : node);

const isBaseCapture = (read: Node): boolean => {
  if (read.type !== "Identifier") return false;
  const outer = unwrapped(read);
  const member = outer.parent;
  if (member?.type !== "MemberExpression" || member.object !== outer || member.computed || !isName(member.property as Node, "length")) return false;
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
    if (call.type === "CallExpression" && isName(call.callee as Node, DROP) && (call.arguments as unknown[]).includes(node)) return true;
  }
  return false;
};

const e2eConsoleReadThroughDrop: Rule.RuleModule = {
  meta: problem("a check reads the console accumulator only through dropExpectedCancellations from e2e/support/console.ts, or as a .length base, so no call site can quietly stop filtering (Issue #613)"),
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
    "engine-no-id-lookup": engineNoIdLookup,
    "worker-spawn-static": workerSpawnStatic,
    "template-silent-escape": templateSilentEscape,
    "e2e-cancellation-roster": e2eCancellationRoster,
    "e2e-console-read-through-drop": e2eConsoleReadThroughDrop,
  },
};
