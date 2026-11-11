import { parse } from "@astrojs/compiler-rs";
import { lineFinder, sheetTokens, type Token } from "./tokens.ts";

type Node = Readonly<Record<string, unknown>>;
type Run = { readonly text: string; readonly start: number } | { readonly node: Node };

const isNode = (value: unknown): value is Node => typeof value === "object" && value !== null && !Array.isArray(value);
const startOf = (node: Node): number => (typeof node["start"] === "number" ? node["start"] : 0);
const isDropped = (node: Node): boolean =>
  node["type"] === "AstroComment" ||
  (node["type"] === "JSXExpressionContainer" &&
    isNode(node["expression"]) &&
    node["expression"]["type"] === "JSXEmptyExpression");
const isStyle = (node: Node): boolean =>
  node["type"] === "JSXElement" &&
  isNode(node["openingElement"]) &&
  isNode(node["openingElement"]["name"]) &&
  node["openingElement"]["name"]["name"] === "style";

const runsOf = (items: readonly unknown[]): Run[] => {
  const runs: Run[] = [];
  for (const item of items) {
    if (!isNode(item) || isDropped(item)) continue;
    const last = runs.at(-1);
    if (item["type"] !== "JSXText") runs.push({ node: item });
    else if (last !== undefined && "text" in last)
      runs[runs.length - 1] = { text: last.text + String(item["value"]), start: last.start };
    else runs.push({ text: String(item["value"]), start: startOf(item) });
  }
  return runs;
};

export const pageTokens = (text: string): Token[] => {
  const { ast, diagnostics } = parse(text);
  const lineOf = lineFinder(text);
  const out: Token[] = [];
  const list = (items: readonly unknown[], sheet: boolean): void => {
    const runs = runsOf(items);
    runs.forEach((run, i) => {
      if ("node" in run) visit(run.node);
      else if (sheet) out.push(...sheetTokens(run.text, (offset) => lineOf(run.start + offset)));
      else if (run.text.trim() !== "" || (i !== 0 && i !== runs.length - 1))
        out.push({ text: `text ${JSON.stringify(run.text.replace(/\s+/g, " "))}`, line: lineOf(run.start) });
    });
  };
  const visit = (node: Node): void => {
    const line = lineOf(startOf(node));
    out.push({ text: String(node["type"]), line });
    for (const [key, value] of Object.entries(node)) {
      if (key === "type" || key === "start" || key === "end") continue;
      if ((key === "comments" && node["type"] === "AstroRoot") || (key === "raw" && node["type"] === "JSXText"))
        continue;
      if (Array.isArray(value)) {
        out.push({ text: `${key}:`, line });
        const primitives = value.filter((item) => !isNode(item));
        if (primitives.length > 0) out.push({ text: JSON.stringify(primitives), line });
        list(value, key === "children" && isStyle(node));
      } else if (isNode(value)) {
        out.push({ text: `${key}:`, line });
        visit(value);
      } else out.push({ text: `${key}=${JSON.stringify(value)}`, line });
    }
  };
  visit(ast);
  for (const d of diagnostics) out.push({ text: `diagnostic ${d.severity} ${d.text}`, line: d.labels[0]?.line ?? 1 });
  return out;
};
