import type { Rule } from "eslint";
import { readFileSync } from "node:fs";
import { isBuiltin } from "node:module";
import { resolve } from "node:path";
import { literalText } from "./import-bounds.ts";

type Manifest = { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
type Seat = { source?: Rule.Node | null; importKind?: string; exportKind?: string };

const MANIFEST = JSON.parse(readFileSync(resolve(import.meta.dirname, "..", "..", "package.json"), "utf8")) as Manifest;
const DECLARED: ReadonlySet<string> = new Set([
  ...Object.keys(MANIFEST.dependencies ?? {}),
  ...Object.keys(MANIFEST.devDependencies ?? {}),
]);

const packageName = (specifier: string): string | null => {
  if (/^[./#]/.test(specifier) || /^[a-z][a-z0-9+.-]*:/i.test(specifier) || isBuiltin(specifier)) return null;
  const parts = specifier.split("/");
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]!;
};
const declared = (name: string, typeOnly: boolean): boolean =>
  DECLARED.has(name) || (typeOnly && DECLARED.has(`@types/${name}`));

const packageImportDeclared: Rule.RuleModule = {
  meta: {
    type: "problem",
    schema: [],
    messages: {
      undeclared:
        "{{name}} is imported here, but package.json declares it in neither dependencies nor devDependencies (an import type may declare its @types twin instead): it resolves only while another package pulls it in, and breaks the day that package drops it (Issue #826)",
    },
  },
  create(context) {
    const judge = (source: Rule.Node | null | undefined, typeOnly: boolean): void => {
      const text = literalText(source);
      const name = text === null ? null : packageName(text);
      if (source && name !== null && !declared(name, typeOnly))
        context.report({ node: source, messageId: "undeclared", data: { name } });
    };
    const seat = (node: Rule.Node): Seat => node as unknown as Seat;
    return {
      ImportDeclaration: (node) => judge(seat(node).source, seat(node).importKind === "type"),
      ExportNamedDeclaration: (node) => judge(seat(node).source, seat(node).exportKind === "type"),
      ExportAllDeclaration: (node) => judge(seat(node).source, seat(node).exportKind === "type"),
      ImportExpression: (node) => judge(seat(node).source, false),
      TSImportType: (node: Rule.Node) => judge(seat(node).source, true),
    };
  },
};

export default { rules: { "package-import-declared": packageImportDeclared } };
