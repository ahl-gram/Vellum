// The footgun hook's code reader (Issue #644): a body with its fenced blocks and inline spans taken out, read as GitHub renders them where that is cheap and as prose where it is not; its blind spots and their direction are in README.md.
type Fence = { readonly char: string; readonly length: number };

const FENCE_OPEN = /^ {0,3}(`{3,}|~{3,})(.*)$/;
const FENCE_CLOSE = /^ {0,3}(`{3,}|~{3,})[ \t\r]*$/;
const TABLE_ROW = /^\s*\|/;
const CELL_PIPE = /(?<!\\)\|/;

const opensFence = (line: string): Fence | null => {
  const m = FENCE_OPEN.exec(line);
  const run = m?.[1];
  if (!m || !run || (run.startsWith("`") && (m[2] ?? "").includes("`"))) return null;
  return { char: run.charAt(0), length: run.length };
};

const closesFence = (line: string, fence: Fence): boolean => {
  const run = FENCE_CLOSE.exec(line)?.[1];
  return run !== undefined && run.startsWith(fence.char) && run.length >= fence.length;
};

const runLength = (text: string, at: number): number => {
  let end = at;
  while (text[end] === "`") end += 1;
  return end - at;
};

const closingRun = (text: string, from: number, length: number): number => {
  for (let at = text.indexOf("`", from); at !== -1; at = text.indexOf("`", at + runLength(text, at))) {
    if (runLength(text, at) === length) return at;
  }
  return -1;
};

const withoutSpans = (cell: string): string => {
  let prose = "";
  let at = 0;
  for (let open = cell.indexOf("`"); open !== -1; open = cell.indexOf("`", at)) {
    const length = runLength(cell, open);
    const close = cell[open - 1] === "\\" ? -1 : closingRun(cell, open + length, length);
    prose += close === -1 ? cell.slice(at, open + length) : cell.slice(at, open) + " ";
    at = close === -1 ? open + length : close + length;
  }
  return prose + cell.slice(at);
};

const proseOfLine = (line: string): string => (TABLE_ROW.test(line) ? line.split(CELL_PIPE).map(withoutSpans).join("|") : withoutSpans(line));

export const proseOf = (text: string): string => {
  const lines = text.split("\n");
  const prose: string[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    const fence = opensFence(lines[i] ?? "");
    const close = fence ? lines.findIndex((line, j) => j > i && closesFence(line, fence)) : -1;
    if (close !== -1) {
      i = close;
      continue;
    }
    prose.push(proseOfLine(lines[i] ?? ""));
  }
  return prose.join("\n");
};
