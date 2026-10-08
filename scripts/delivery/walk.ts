import { closeSync, existsSync, lstatSync, openSync, readdirSync, readFileSync, readlinkSync, readSync } from "node:fs";
import { extname, join } from "node:path";

export type Kind = "picture" | "page" | "site" | "table" | "json" | "text" | "log" | "code" | "link" | "other";

export interface Item {
  readonly rel: string;
  readonly abs: string;
  readonly kind: Kind;
  readonly size: number;
  readonly mtime: number;
  readonly target?: string;
}

export interface Section {
  readonly rel: string;
  readonly items: readonly Item[];
  readonly site: boolean;
}

export interface Delivery {
  readonly dir: string;
  readonly name: string;
  readonly notes: string | null;
  readonly sections: readonly Section[];
  readonly newest: number;
  readonly total: number;
}

export const NOTES = "notes.md";
export const PAGE = "index.html";
export const MARK = `<meta name="generator" content="vellum delivery page">`;

const BY_EXTENSION: Readonly<Record<string, Kind>> = {
  ".png": "picture",
  ".jpg": "picture",
  ".jpeg": "picture",
  ".gif": "picture",
  ".webp": "picture",
  ".avif": "picture",
  ".svg": "picture",
  ".html": "page",
  ".htm": "page",
  ".tsv": "table",
  ".csv": "table",
  ".json": "json",
  ".md": "text",
  ".txt": "text",
  ".log": "log",
  ".jsonl": "log",
  ".ts": "code",
  ".mts": "code",
  ".mjs": "code",
  ".js": "code",
  ".cjs": "code",
  ".sh": "code",
  ".py": "code",
  ".css": "code",
  ".scss": "code",
  ".astro": "code",
  ".yml": "code",
  ".yaml": "code",
  ".xml": "code",
  ".diff": "code",
  ".patch": "code",
};
const BINARY = new Set([
  ".pdf",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".tar",
  ".gz",
  ".zip",
  ".map",
  ".ico",
  ".mp4",
  ".webm",
]);
const SNIFF_BYTES = 8192;
const SNIFF_MAX_SIZE = 262144;

export const byName = (a: string, b: string): number => a.localeCompare(b, "en", { numeric: true });

export const readHead = (abs: string, bytes: number): Buffer => {
  const fd = openSync(abs, "r");
  try {
    const buf = Buffer.alloc(bytes);
    return buf.subarray(0, readSync(fd, buf, 0, bytes, 0));
  } finally {
    closeSync(fd);
  }
};

const looksLikeText = (abs: string, size: number): boolean =>
  size > 0 && size <= SNIFF_MAX_SIZE && !readHead(abs, SNIFF_BYTES).includes(0);

const kindOf = (abs: string, size: number): Kind => {
  const ext = extname(abs).toLowerCase();
  const known = BY_EXTENSION[ext];
  if (known) return known;
  if (BINARY.has(ext)) return "other";
  return looksLikeText(abs, size) ? "log" : "other";
};

const isFile = (abs: string): boolean => {
  try {
    return lstatSync(abs).isFile();
  } catch {
    return false;
  }
};

const isLink = (abs: string): boolean => {
  try {
    return lstatSync(abs).isSymbolicLink();
  } catch {
    return false;
  }
};

export type PageState = "none" | "own" | "foreign";

export const pageState = (abs: string): PageState => {
  if (!existsSync(abs) && !isLink(abs)) return "none";
  return isFile(abs) && readHead(abs, 1024).toString("utf8").includes(MARK) ? "own" : "foreign";
};

const itemAt = (root: string, rel: string, inSite: boolean): Item => {
  const abs = join(root, rel);
  const stat = lstatSync(abs);
  if (stat.isSymbolicLink()) return { rel, abs, kind: "link", size: 0, mtime: stat.mtimeMs, target: readlinkSync(abs) };
  const kind = kindOf(abs, stat.size);
  return { rel, abs, kind: inSite && kind === "page" ? "site" : kind, size: stat.size, mtime: stat.mtimeMs };
};

interface Entries {
  readonly files: readonly string[];
  readonly dirs: readonly string[];
}

const entriesOf = (abs: string): Entries => {
  const entries = readdirSync(abs, { withFileTypes: true }).filter(
    (e) => !e.name.startsWith(".") && e.name !== "node_modules",
  );
  return {
    files: entries
      .filter((e) => !e.isDirectory())
      .map((e) => e.name)
      .sort(byName),
    dirs: entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort(byName),
  };
};

const walkSection = (root: string, rel: string, inSite: boolean): Section[] => {
  const here = join(root, rel);
  const { files, dirs } = entriesOf(here);
  const atRoot = rel === "";
  const site = inSite || (!atRoot && files.includes(PAGE));
  const skipped = atRoot ? [PAGE, ...(isFile(join(here, NOTES)) ? [NOTES] : [])] : [];
  const items = files.filter((name) => !skipped.includes(name)).map((name) => itemAt(root, join(rel, name), site));
  const below = dirs.flatMap((name) => walkSection(root, join(rel, name), site));
  return [{ rel, items, site }, ...below];
};

export const walkDelivery = (dir: string, name: string): Delivery => {
  const sections = walkSection(dir, "", false).filter((s) => s.items.length > 0);
  const items = sections.flatMap((s) => s.items);
  const notesAt = join(dir, NOTES);
  const notes = isFile(notesAt) ? readFileSync(notesAt, "utf8") : null;
  const notesTime = notes === null ? 0 : lstatSync(notesAt).mtimeMs;
  const newest = items.reduce((max, i) => Math.max(max, i.mtime), notesTime);
  return { dir, name, notes, sections, newest, total: items.length };
};
