import type { Rule, Scope } from "eslint";
import { isBuiltin } from "node:module";
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
        if (rest.length > 0 || !isStaticUrl(target) || !isModuleOptions(options)) context.report({ node, messageId: "found" });
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

const frameNoIdLookup: Rule.RuleModule = {
  meta: problem("the reading frame looks up no element by id: it builds what it holds, and ids are the host's namespace, so a second frame on one page would collide (Issue #191, Issue #219)"),
  create: (context) => engineNoIdLookup.create(context),
};

const DECLARES_SOURCE = new Set(["ImportDeclaration", "ExportNamedDeclaration", "ExportAllDeclaration"]);

const isCreateRequireCall = (node: Node | null | undefined): boolean => node?.type === "CallExpression" && isName(node.callee as Node, "createRequire");

const boundToCreateRequire = (context: Rule.RuleContext, callee: Node): boolean => {
  if (callee.type !== "Identifier") return false;
  for (let scope: ReturnType<typeof context.sourceCode.getScope> | null = context.sourceCode.getScope(callee); scope; scope = scope.upper) {
    const def = scope.set.get(callee.name)?.defs[0];
    if (def) return def.type === "Variable" && isCreateRequireCall(def.node.init as Node | null | undefined);
  }
  return false;
};

const isLoader = (context: Rule.RuleContext, callee: Node): boolean => isName(callee, "require") || isCreateRequireCall(callee) || boundToCreateRequire(context, callee);

const isModuleSource = (context: Rule.RuleContext, node: Node): boolean => {
  for (let child: Node = node, parent = node.parent; parent !== null; child = parent, parent = parent.parent) {
    if (DECLARES_SOURCE.has(parent.type)) return (parent as unknown as { source: unknown }).source === child;
    if (parent.type === "ImportExpression" && parent.source === child) return true;
    if (parent.type === "CallExpression" && (parent.arguments as Node[]).includes(child) && isLoader(context, parent.callee as Node)) return true;
    if (parent.type === "NewExpression" && isName(parent.callee as Node, "URL") && parent.arguments[0] === child && isImportMetaUrl(parent.arguments[1] as Node | undefined)) return true;
  }
  return false;
};

const stringText = (node: Node): string | null =>
  node.type === "Literal" && typeof node.value === "string" ? node.value : node.type === "TemplateElement" ? (node.value.cooked ?? node.value.raw) : null;

const never = (): boolean => false;

const stringJudge = (context: Rule.RuleContext, asSource: (text: string) => boolean, anywhere: (text: string) => boolean): Rule.RuleListener => {
  const judge = (node: Node): void => {
    const text = stringText(node);
    const at = node.type === "TemplateElement" ? node.parent : node;
    if (text === null || inTypePosition(at.parent ?? at)) return;
    if ((asSource(text) && isModuleSource(context, at)) || anywhere(text)) context.report({ node, messageId: "found" });
  };
  return { Literal: judge, TemplateElement: judge };
};

const sourceBan = (message: string, asSource: (text: string) => boolean, anywhere: (text: string) => boolean = never): Rule.RuleModule => ({
  meta: problem(message),
  create: (context) => stringJudge(context, asSource, anywhere),
});

const frameNoExplorerImport = sourceBan("the reading frame imports nothing from the Explorer, so a page that is not the Explorer can mount it (Issue #219)", (text) => text.includes("explorer/"));

const explorerNoGlassKeys = sourceBan(
  "the Explorer and home bind their own zoom presses by id: neither imports glass-keys.ts nor queries [data-zoom], a document-wide binding that would double every press (handbook/specs/explorer-doctrine.md)",
  (text) => text.includes("glass-keys"),
  (text) => /\[\s*data-zoom/i.test(text) || /(?:^|\/)glass-keys\b/.test(text),
);

const CONTENTS_ROW_BUILDER = "src/site/shared/contents-row.ts";

const contentsRowBuilderOnly: Rule.RuleModule = {
  meta: problem("the contents row's cr-num class is written only by its shared builder, src/site/shared/contents-row.ts, so no room builds the row by hand"),
  create: (context) => (repoPath(context.filename) === CONTENTS_ROW_BUILDER ? {} : stringJudge(context, never, (text) => text.includes("cr-num"))),
};

const testNoTestImport = sourceBan("nothing imports a .test.ts: node --test would run that file's tests a second time; share through test-support/ instead", (text) => /\.test\.ts(?:[?#]|$)/.test(text));

const PINS = "the prospect plates are byte-pinned on every platform (handbook/specs/rulebook.md, Prospect byte pins)";
const EXACT_MATH = new Set(["E", "LN10", "LN2", "LOG10E", "LOG2E", "PI", "SQRT1_2", "SQRT2", "abs", "ceil", "clz32", "floor", "fround", "imul", "max", "min", "round", "sign", "sqrt", "trunc"]);
const PROSPECT_GLOBALS = new Set(["Array", "Boolean", "Error", "Infinity", "JSON", "Map", "Math", "NaN", "Number", "Object", "RangeError", "Set", "String", "TypeError", "parseInt", "undefined"]);
const LOCALE_MEMBERS = new Set(["localeCompare", "toLocaleDateString", "toLocaleLowerCase", "toLocaleString", "toLocaleTimeString", "toLocaleUpperCase"]);
const AMBIENT = ["ClassDeclaration", "TSDeclareFunction", "TSEnumDeclaration", "TSModuleDeclaration", "VariableDeclaration"];

const namedKey = (key: Node, computed: boolean, names: ReadonlySet<string>): boolean => !computed && key.type === "Identifier" && names.has(key.name);
const exactMath = (id: Node): boolean => {
  const member = id.parent;
  return member?.type === "MemberExpression" && namedKey(member.property as Node, member.computed, EXACT_MATH);
};
const typeQueried = (node: Node | null): boolean => {
  if (node === null) return false;
  const kind = node.type as string;
  return kind === "TSTypeQuery" || (kind === "TSQualifiedName" && typeQueried(node.parent));
};
const typeOnly = (def: Scope.Definition): boolean =>
  def.type === "ImportBinding" && [def.parent, def.node].some((n) => (n as { importKind?: string }).importKind === "type");
const scopesUnder = (scope: Scope.Scope): Scope.Scope[] => [scope, ...scope.childScopes.flatMap(scopesUnder)];
const globalReads = (scope: Scope.Scope): Scope.Reference[] =>
  [
    ...scope.through,
    ...scope.variables.filter((v) => v.defs.length === 0).flatMap((v) => v.references),
    ...scopesUnder(scope).flatMap((s) => s.variables).filter((v) => v.defs.length > 0 && v.defs.every(typeOnly)).flatMap((v) => v.references),
  ].filter((ref) => (ref as { isValueReference?: boolean }).isValueReference !== false);
const hostModule = (source: Node): boolean => {
  const text = wholeString(source);
  return text === null || isBuiltin(text);
};

const prospectLibmClockFree: Rule.RuleModule = {
  meta: {
    type: "problem",
    messages: {
      power: `the prospect layer squares by multiplying: ** and **= are a library power whose last bits differ between platforms, and ${PINS}`,
      libm: `the prospect layer reads Math only as an exact member written out, one of EXACT_MATH in scripts/lint/source-shape.ts: the rest are libm or entropy, and an alias or a computed key hides which member is read, and ${PINS}`,
      host: `the prospect layer reads no global but a built-in PROSPECT_GLOBALS in scripts/lint/source-shape.ts approves, no locale member and no import.meta: anything else is a clock, entropy or the host, and ${PINS}; a built-in joins that list with its reason`,
      module: `the prospect layer imports no Node built-in module and no import() source computed at run time: Node's modules are the host's clock, entropy and files, and ${PINS}`,
      ambient: `the prospect layer declares no ambient binding: a declare line hides a global from this rule while the erased code still reads it, and ${PINS}`,
    },
  },
  create(context) {
    const report = (node: Node, messageId: string): void => context.report({ node, messageId });
    const source = (node: Node | null | undefined): void => {
      if (node && hostModule(node)) report(node, "module");
    };
    const ambient = (node: Node): void => {
      if ((node as { declare?: boolean }).declare === true) report(node, "ambient");
    };
    const localeString = (node: Node): void => {
      if (LOCALE_MEMBERS.has(wholeString(node) ?? "") && !inTypePosition(node.parent as Node)) report(node, "host");
    };
    return {
      ...Object.fromEntries(AMBIENT.map((kind) => [kind, ambient])),
      BinaryExpression: (node) => (node.operator === "**" ? report(node, "power") : undefined),
      AssignmentExpression: (node) => (node.operator === "**=" ? report(node, "power") : undefined),
      MemberExpression: (node) => (namedKey(node.property as Node, node.computed, LOCALE_MEMBERS) ? report(node, "host") : undefined),
      Property: (node) => (node.parent.type === "ObjectPattern" && namedKey(node.key as Node, node.computed, LOCALE_MEMBERS) ? report(node, "host") : undefined),
      Literal: localeString,
      TemplateLiteral: localeString,
      MetaProperty: (node) => (node.meta.name === "import" ? report(node, "host") : undefined),
      ImportDeclaration: (node) => source(node.source as Node),
      ExportAllDeclaration: (node) => source(node.source as Node),
      ExportNamedDeclaration: (node) => source(node.source as Node | null | undefined),
      ImportExpression: (node) => source(node.source as Node),
      "Program:exit"(program) {
        for (const ref of globalReads(context.sourceCode.getScope(program))) {
          const id = ref.identifier as Node;
          if (typeQueried(id.parent)) continue;
          if (!PROSPECT_GLOBALS.has(ref.identifier.name)) report(id, "host");
          else if (ref.identifier.name === "Math" && !exactMath(id)) report(id, "libm");
        }
      },
    };
  },
};

export default {
  rules: {
    "frame-no-id-lookup": frameNoIdLookup,
    "frame-no-explorer-import": frameNoExplorerImport,
    "explorer-no-glass-keys": explorerNoGlassKeys,
    "contents-row-builder-only": contentsRowBuilderOnly,
    "test-no-test-import": testNoTestImport,
    "engine-no-id-lookup": engineNoIdLookup,
    "worker-spawn-static": workerSpawnStatic,
    "template-silent-escape": templateSilentEscape,
    "e2e-cancellation-roster": e2eCancellationRoster,
    "e2e-console-read-through-drop": e2eConsoleReadThroughDrop,
    "prospect-libm-clock-free": prospectLibmClockFree,
  },
};
