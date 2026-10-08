import { escapeHtml } from "./markdown.ts";

export const ROW_CAP = 500;
const CELL_CAP = 4000;
const COLUMN_CAP = 40;

type Rows = readonly (readonly string[])[];

export interface Table {
  readonly head: readonly string[] | null;
  readonly rows: Rows;
}

const lines = (text: string): string[] => {
  const all = text.replace(/\r\n?/g, "\n").split("\n");
  return all.at(-1) === "" ? all.slice(0, -1) : all;
};

export const parseTsv = (text: string): Table => ({ head: null, rows: lines(text).map((l) => l.split("\t")) });

const csvRow = (line: string): string[] => {
  const out: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (quoted && ch === '"' && line[i + 1] === '"') {
      cell += '"';
      i += 1;
    } else if (ch === '"') quoted = !quoted;
    else if (ch === "," && !quoted) {
      out.push(cell);
      cell = "";
    } else cell += ch;
  }
  return [...out, cell];
};

export const parseCsv = (text: string): Table => ({ head: null, rows: lines(text).map(csvRow) });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const cellText = (value: unknown): string =>
  typeof value === "string" ? value : value === undefined ? "" : JSON.stringify(value);

const objectsTable = (rows: readonly Record<string, unknown>[]): Table => {
  const head = [...new Set(rows.flatMap((r) => Object.keys(r)))].slice(0, COLUMN_CAP);
  return { head, rows: rows.map((r) => head.map((k) => cellText(r[k]))) };
};

export const jsonTable = (text: string): Table | null => {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return null;
  }
  if (Array.isArray(value) && value.length > 0) {
    if (value.every(isRecord)) return objectsTable(value);
    if (value.every(Array.isArray)) return { head: null, rows: value.map((r: unknown[]) => r.map(cellText)) };
    if (value.every((v) => !isRecord(v) && !Array.isArray(v)))
      return { head: null, rows: value.map((v) => [cellText(v)]) };
  }
  if (isRecord(value) && Object.values(value).every((v) => !isRecord(v) && !Array.isArray(v)))
    return { head: ["key", "value"], rows: Object.entries(value).map(([k, v]) => [k, cellText(v)]) };
  return null;
};

const cell = (text: string, tag: string): string => {
  const cut = text.length > CELL_CAP ? `${text.slice(0, CELL_CAP)} ...` : text;
  return `<${tag}>${escapeHtml(cut)}</${tag}>`;
};

export const tableHtml = (table: Table): { readonly html: string; readonly hidden: number } => {
  const shown = table.rows.slice(0, ROW_CAP);
  const head = table.head ? `<thead><tr>${table.head.map((h) => cell(h, "th")).join("")}</tr></thead>` : "";
  const body = shown
    .map(
      (r) =>
        `<tr>${r
          .slice(0, COLUMN_CAP)
          .map((c) => cell(c, "td"))
          .join("")}</tr>`,
    )
    .join("\n");
  return { html: `<table>${head}<tbody>${body}</tbody></table>`, hidden: table.rows.length - shown.length };
};
