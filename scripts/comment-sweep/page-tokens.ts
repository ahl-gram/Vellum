import { parse } from "@astrojs/compiler-rs";
import { isRecord } from "../is-record.ts";
import { isInstruction } from "./instructions.ts";
import { lineFinder, sheetTokens, type Token } from "./tokens.ts";

type Node = Readonly<Record<string, unknown>>;
type Run = { readonly text: string; readonly start: number } | { readonly node: Node } | { readonly value: unknown };

const startOf = (node: Node): number => (typeof node["start"] === "number" ? node["start"] : 0);
const isDropped = (node: Node): boolean =>
  (node["type"] === "AstroComment" && !isInstruction(`<!--${String(node["value"])}-->`)) ||
  (node["type"] === "JSXExpressionContainer" &&
    isRecord(node["expression"]) &&
    node["expression"]["type"] === "JSXEmptyExpression");
const isStyle = (node: Node): boolean =>
  node["type"] === "JSXElement" &&
  isRecord(node["openingElement"]) &&
  isRecord(node["openingElement"]["name"]) &&
  node["openingElement"]["name"]["name"] === "style";
const commentText = (comment: Node, text: string): string =>
  text.slice(startOf(comment), typeof comment["end"] === "number" ? comment["end"] : startOf(comment));

const runsOf = (items: readonly unknown[]): Run[] => {
  const runs: Run[] = [];
  for (const item of items) {
    if (isRecord(item) && isDropped(item)) continue;
    const last = runs.at(-1);
    if (!isRecord(item)) runs.push({ value: item });
    else if (item["type"] !== "JSXText") runs.push({ node: item });
    else if (last !== undefined && "text" in last)
      runs[runs.length - 1] = { text: last.text + String(item["value"]), start: last.start };
    else runs.push({ text: String(item["value"]), start: startOf(item) });
  }
  return runs;
};

export const pageTokens = (text: string): Token[] => {
  const { ast, diagnostics } = parse(text);
  const root: Node = ast;
  const lineOf = lineFinder(text);
  const out: Token[] = [];
  const instructions = (Array.isArray(root["comments"]) ? root["comments"] : [])
    .filter(isRecord)
    .map((comment) => ({ start: startOf(comment), text: commentText(comment, text) }))
    .filter((comment) => isInstruction(comment.text));
  let next = 0;
  const flush = (before: number): void => {
    for (; next < instructions.length && instructions[next]!.start < before; next += 1)
      out.push({ text: instructions[next]!.text, line: lineOf(instructions[next]!.start) });
  };
  const list = (items: readonly unknown[], sheet: boolean, line: number): void => {
    const runs = runsOf(items);
    runs.forEach((run, i) => {
      if ("node" in run) visit(run.node);
      else if ("value" in run) out.push({ text: JSON.stringify(run.value), line });
      else if (sheet) out.push(...sheetTokens(run.text, (offset) => lineOf(run.start + offset)));
      else if (run.text.trim() !== "" || (i !== 0 && i !== runs.length - 1))
        out.push({ text: `text ${JSON.stringify(run.text.replace(/\s+/g, " "))}`, line: lineOf(run.start) });
    });
  };
  const visit = (node: Node): void => {
    flush(startOf(node));
    const line = lineOf(startOf(node));
    out.push({ text: String(node["type"]), line });
    for (const [key, value] of Object.entries(node)) {
      if (key === "type" || key === "start" || key === "end") continue;
      if ((key === "comments" && node["type"] === "AstroRoot") || (key === "raw" && node["type"] === "JSXText"))
        continue;
      if (Array.isArray(value)) {
        out.push({ text: `${key}:`, line });
        list(value, key === "children" && isStyle(node), line);
      } else if (isRecord(value)) {
        out.push({ text: `${key}:`, line });
        visit(value);
      } else out.push({ text: `${key}=${JSON.stringify(value)}`, line });
    }
  };
  visit(root);
  flush(Infinity);
  for (const d of diagnostics) out.push({ text: `diagnostic ${d.severity} ${d.text}`, line: d.labels[0]?.line ?? 1 });
  return out;
};
