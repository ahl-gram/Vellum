// A hand-authored file outside src/ (CLAUDE.md): the house's lint rules that keep the palette's colours, the two depth shadows and every var() by name (Issue #779 part 2d), imported by eslint.config.ts and never run by Node directly.
import type { CSSRuleDefinition } from "@eslint/css";
import { parse, toPlainObject, walk, type CssNode } from "@eslint/css-tree";
import type { Rule } from "eslint";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { SITE_PALETTE } from "../../src/atlas/palette.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");

export const SRC_CSS_FILES = ["src/cli/gallery.ts", "src/atlas/document.ts", "src/render/og-card.ts"] as const;
export type SrcCssFile = (typeof SRC_CSS_FILES)[number];
export const GENERATED_CSS: ReadonlyArray<readonly [string, SrcCssFile]> = [["public/gallery/", "src/cli/gallery.ts"]];

const repoPath = (filename: string): string => relative(ROOT, filename).split(sep).join("/");

export const sheetKey = (filename: string): string => {
  const path = repoPath(filename);
  if (path.startsWith("public/")) return path.slice("public/".length);
  return path.endsWith(".ts.css") ? path.slice(0, -".css".length) : path;
};

export const sheetsOnDisk = (root: string = ROOT): string[] =>
  readdirSync(join(root, "public"), { recursive: true, encoding: "utf8" })
    .map((entry) => `public/${entry.split(sep).join("/")}`)
    .filter((path) => path.endsWith(".css") && !GENERATED_CSS.some(([tree]) => path.startsWith(tree)))
    .sort();

export const readSheet = (path: string, root: string = ROOT): string | null => {
  try {
    return readFileSync(join(root, path), "utf8");
  } catch {
    return null;
  }
};

const plain = (text: string, context: "value" | "stylesheet"): CssNode =>
  toPlainObject(parse(text, { context, onParseError() {} })) as unknown as CssNode;

export function valueTrees(value: CssNode, depth = 0): CssNode[] {
  const trees = [value];
  if (depth > 3) return trees;
  walk(value, (node) => {
    if (node.type !== "Raw" || node.value.trim() === "") return;
    try {
      trees.push(...valueTrees(plain(node.value, "value"), depth + 1));
    } catch {
      return;
    }
  });
  return trees;
}

export const walkValue = (value: CssNode, enter: (node: CssNode) => void): void => {
  for (const tree of valueTrees(value)) walk(tree, (node) => enter(node));
};

export const childrenOf = (node: CssNode): CssNode[] => {
  const kids = (node as { children?: unknown }).children;
  return Array.isArray(kids) ? (kids as CssNode[]) : [];
};

type Located = { loc?: { start: { offset: number }; end: { offset: number } } | null };
export const sourceOf = (text: string, node: Located): string =>
  node.loc ? text.slice(node.loc.start.offset, node.loc.end.offset) : "";
export const collapse = (text: string): string =>
  text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .trim();

export type Arm = { readonly node: CssNode; readonly text: string };
export const armsOf = (source: string, prelude: CssNode): Arm[] =>
  prelude.type === "SelectorList"
    ? childrenOf(prelude).map((node) => ({ node, text: collapse(sourceOf(source, node as never)) }))
    : [];
export const subjectOf = (arm: CssNode): CssNode[] => {
  const kids = childrenOf(arm);
  return kids.slice(kids.findLastIndex((kid) => kid.type === "Combinator") + 1);
};
export type RuleNode = { prelude: CssNode; block: { children: CssNode[] }; loc?: unknown };
export const declarationsOf = (rule: RuleNode): Array<CssNode & { type: "Declaration" }> =>
  rule.block.children.filter((d): d is CssNode & { type: "Declaration" } => d.type === "Declaration");

const TOKEN_HOMES: ReadonlySet<string> = new Set(["shell.css", "src/atlas/document.ts"]);
const TOKENS = Object.entries(SITE_PALETTE).map(([name, hex]) => ({
  name,
  hex: hex.slice(1).toLowerCase(),
  rgb: [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)),
}));

const sixOf = (hash: string): string | null => {
  const h = hash.toLowerCase();
  if (!/^[0-9a-f]+$/.test(h)) return null;
  if (h.length === 3 || h.length === 4) return h.slice(0, 3).replace(/./g, "$&$&");
  return h.length === 6 || h.length === 8 ? h.slice(0, 6) : null;
};

const channelsOf = (fn: CssNode): number[] | null => {
  const numbers: number[] = [];
  for (const kid of childrenOf(fn)) {
    if (kid.type === "Operator" && kid.value === "/") break;
    if (kid.type === "Operator" && kid.value === ",") continue;
    if (kid.type !== "Number") return null;
    numbers.push(Number(kid.value));
  }
  return numbers.length >= 3 ? numbers.slice(0, 3) : null;
};

export const tokenOfColour = (node: CssNode): { token: string; colour: string } | null => {
  if (node.type === "Hash") {
    const six = sixOf(node.value);
    const token = TOKENS.find((t) => t.hex === six);
    return token ? { token: token.name, colour: `#${node.value}` } : null;
  }
  if (node.type !== "Function" || !/^rgba?$/i.test(node.name)) return null;
  const rgb = channelsOf(node);
  const token = rgb && TOKENS.find((t) => t.rgb.every((c, i) => c === rgb[i]));
  return token ? { token: token.name, colour: `${node.name}(${rgb.join(" ")})` } : null;
};

const tokenByName: CSSRuleDefinition = {
  meta: {
    type: "problem",
    messages: {
      raw: "{{colour}} is {{token}}'s colour written raw: write var({{token}}), or rgb(from var({{token}}) r g b / a) for alpha, so the quotation stays attached to its name; only the token's own declaration, in public/shell.css or the atlas document, writes it (Issue #263, Issue #324)",
    },
  },
  create(context) {
    const home = TOKEN_HOMES.has(sheetKey(context.filename));
    return {
      Declaration(node) {
        const value = node.value as unknown as CssNode;
        const own = TOKENS.find((t) => t.name === node.property);
        if (home && own && value.type === "Raw" && collapse(value.value).toLowerCase() === `#${own.hex}`) return;
        walkValue(value, (inner) => {
          const found = tokenOfColour(inner);
          if (found) context.report({ loc: node.loc!, messageId: "raw", data: found });
        });
      },
    };
  },
};

const SHADOWS = [
  { token: "--sheet-shadow", geometry: [0, 12, 34] },
  { token: "--stage-shadow", geometry: [0, 18, 60] },
] as const;

const lengthOf = (node: CssNode): number | null => {
  if (node.type === "Number") return Number(node.value) === 0 ? 0 : null;
  if (node.type !== "Dimension") return null;
  const n = Number(node.value);
  return n === 0 || node.unit.toLowerCase() === "px" ? n : null;
};

export const shadowsIn = (value: CssNode): string[] => {
  const found: string[] = [];
  walkValue(value, (node) => {
    const lengths = childrenOf(node).map(lengthOf);
    for (let i = 0; i + 2 < lengths.length; i++)
      for (const { token, geometry } of SHADOWS) if (geometry.every((g, j) => lengths[i + j] === g)) found.push(token);
  });
  return found;
};

const shadowByToken: CSSRuleDefinition = {
  meta: {
    type: "problem",
    messages: {
      longhand:
        "this writes {{token}}'s geometry longhand: consume var({{token}}), the depth's one home, declared in public/shell.css and the atlas document (Issue #367, Issue #463)",
    },
  },
  create(context) {
    const home = TOKEN_HOMES.has(sheetKey(context.filename));
    return {
      Declaration(node) {
        for (const token of shadowsIn(node.value as unknown as CssNode))
          if (!(home && token === node.property))
            context.report({ loc: node.loc!, messageId: "longhand", data: { token } });
      },
    };
  },
};

export const declaredIn = (texts: readonly string[]): Set<string> => {
  const names = new Set<string>();
  for (const text of texts)
    walk(plain(text, "stylesheet"), (node) => {
      if (node.type === "Declaration" && node.property.startsWith("--")) names.add(node.property);
    });
  return names;
};

export const consumedIn = (value: CssNode): string[] => {
  const names: string[] = [];
  walkValue(value, (node) => {
    if (node.type !== "Function" || node.name.toLowerCase() !== "var") return;
    const [first, ...rest] = childrenOf(node);
    if (first?.type === "Identifier" && !rest.some((kid) => kid.type === "Operator" && kid.value === ","))
      names.push(first.name);
  });
  return names;
};

const varDeclared: CSSRuleDefinition = {
  meta: {
    type: "problem",
    messages: {
      undeclared:
        "var({{name}}) has no fallback and nothing declares {{name}}: no other sheet under public/ and not this file, so the page falls back to the property's initial value (Issue #263)",
    },
  },
  create(context) {
    const own = repoPath(context.filename);
    const others = sheetsOnDisk()
      .filter((path) => path !== own)
      .flatMap((path) => readSheet(path) ?? []);
    const declared = declaredIn([...others, context.sourceCode.text]);
    return {
      Declaration(node) {
        for (const name of consumedIn(node.value as unknown as CssNode))
          if (!declared.has(name)) context.report({ loc: node.loc!, messageId: "undeclared", data: { name } });
      },
    };
  },
};

const RGB_PATTERNS = TOKENS.map(({ name, rgb: [r, g, b] }) => ({
  name,
  pattern: new RegExp(
    "rgba?\\(\\s*" + String(r) + "\\s*(?:,\\s*|\\s+)" + String(g) + "\\s*(?:,\\s*|\\s+)" + String(b) + "(?![\\d.])",
    "i",
  ),
}));

const builderTokenByName: Rule.RuleModule = {
  meta: {
    type: "problem",
    messages: {
      raw: 'this string carries {{token}}\'s value as a raw rgb(): use rgb(from var({{token}}) r g b / a) where the CSS declares the token, or read SITE_PALETTE["{{token}}"] where it does not (Issue #324, Issue #709 ruling 3)',
    },
  },
  create(context) {
    const check = (node: Rule.Node, text: string): void => {
      for (const { name, pattern } of RGB_PATTERNS)
        if (pattern.test(text)) context.report({ node, messageId: "raw", data: { token: name } });
    };
    return {
      Literal(node) {
        if (typeof node.value === "string") check(node, node.value);
      },
      TemplateElement(node) {
        check(node, node.value.cooked ?? node.value.raw);
      },
    };
  },
};

export default {
  rules: {
    "css-token-by-name": tokenByName,
    "css-shadow-by-token": shadowByToken,
    "css-var-declared": varDeclared,
    "css-builder-token-by-name": builderTokenByName,
  },
};
