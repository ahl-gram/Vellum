// The footgun hook's code reader (Issue #644): a body with its fenced blocks and inline spans taken out, read as GitHub renders them where that is cheap and as prose where it is not; its blind spots and their direction are in README.md.
type Fence = { readonly char: string; readonly length: number; readonly indent: number };

const FENCE_OPEN = /^( {0,3})(`{3,}|~{3,})(.*)$/;
const FENCE_CLOSE = /^ {0,3}(`{3,}|~{3,})[ \t]*$/;
const TABLE_DELIMITER = /^[\s|:-]*$/;
const CELL_PIPE = /(?<!\\)\|/;
const LIST_ITEM = /^\s*(?:[-*+]|\d{1,9}[.)])(?:\s|$)/;
const HTML_BLOCK =/^ {0,3}<\/?[A-Za-z][A-Za-z0-9-]*(?:[\s/>]|$)/;
const AUTOLINK = /<[A-Za-z][A-Za-z0-9+.-]{1,31}:[^\s<>]*>/y;
const TAG = /<\/?[A-Za-z][A-Za-z0-9-]*(?:\s[^<>]*)?\/?>/y;

const indentOf = (line: string): number => line.length - line.trimStart().length;

const opensFence = (line: string): Fence | null => {
  const m = FENCE_OPEN.exec(line);
  const run = m?.[2];
  if (!m || !run || (run.startsWith("`") && (m[3] ?? "").includes("`"))) return null;
  return { char: run.charAt(0), length: run.length, indent: (m[1] ?? "").length };
};

const closesFence = (line: string, fence: Fence): boolean => {
  const run = FENCE_CLOSE.exec(line)?.[1];
  return run !== undefined && run.startsWith(fence.char) && run.length >= fence.length;
};

const inList = (lines: readonly string[], at: number): boolean => {
  for (let j = at - 1; j >= 0; j -= 1) {
    const line = lines[j] ?? "";
    if (line.trim() !== "") return LIST_ITEM.test(line) || indentOf(line) > 0;
  }
  return false;
};

const fenceEnd = (lines: readonly string[], at: number, fence: Fence): number => {
  const nested = fence.indent > 0 && inList(lines, at);
  for (let j = at + 1; j < lines.length; j += 1) {
    const line = lines[j] ?? "";
    if (closesFence(line, fence)) return j;
    if (nested && line.trim() !== "" && indentOf(line) < fence.indent) return -1;
  }
  return -1;
};

const runLength = (text: string, at: number): number => {
  let end = at;
  while (text[end] === "`") end += 1;
  return end - at;
};

const escaped = (text: string, at: number): boolean => {
  let slashes = 0;
  while (text[at - 1 - slashes] === "\\") slashes += 1;
  return slashes % 2 === 1;
};

const closingRun = (text: string, from: number, length: number): number => {
  for (let at = text.indexOf("`", from); at !== -1; at = text.indexOf("`", at + runLength(text, at))) {
    if (runLength(text, at) === length) return at;
  }
  return -1;
};

const matchAt = (pattern: RegExp, text: string, at: number): string | null => {
  pattern.lastIndex = at;
  return pattern.exec(text)?.[0] ?? null;
};

const inlineStep = (cell: string, at: number): readonly [string, number] => {
  const live = !escaped(cell, at);
  if (cell[at] === "<" && live) {
    const link = matchAt(AUTOLINK, cell, at);
    if (link) return [link.replaceAll("`", ""), at + link.length];
    const tag = matchAt(TAG, cell, at);
    if (tag) return [" ", at + tag.length];
  }
  if (cell[at] !== "`") return [cell.charAt(at), at + 1];
  const length = runLength(cell, at);
  const close = live ? closingRun(cell, at + length, length) : -1;
  return close === -1 ? [cell.slice(at, at + length), at + length] : [" ", close + length];
};

const withoutSpans = (cell: string): string => {
  let prose = "";
  for (let at = 0; at < cell.length; ) {
    const [text, next] = inlineStep(cell, at);
    prose += text;
    at = next;
  }
  return prose;
};

const proseOfLine = (line: string, inTable: boolean): string => (inTable ? line.split(CELL_PIPE).map(withoutSpans).join("|") : withoutSpans(line));

const startsTable = (lines: readonly string[], at: number): boolean => {
  const next = lines[at + 1] ?? "";
  return CELL_PIPE.test(lines[at] ?? "") && next.includes("-") && next.includes("|") && TABLE_DELIMITER.test(next);
};

export const proseOf = (text: string): string => {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const prose: string[] = [];
  let block: "table" | "html" | null = null;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? "";
    if (line.trim() === "") block = null;
    else if (block === null && HTML_BLOCK.test(line)) block = "html";
    else if (block === null && startsTable(lines, i)) block = "table";
    const fence = block === null ? opensFence(line) : null;
    const close = fence ? fenceEnd(lines, i, fence) : -1;
    if (close !== -1) {
      i = close;
      continue;
    }
    prose.push(block === "html" ? line : proseOfLine(line, block === "table" || /^\s*\|/.test(line)));
  }
  return prose.join("\n");
};
