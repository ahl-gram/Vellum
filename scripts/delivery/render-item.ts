import { readFileSync } from "node:fs";
import { basename, extname } from "node:path";
import { pictureDims } from "./dims.ts";
import { escapeHtml, markdown, type Anchors } from "./markdown.ts";
import { jsonTable, parseCsv, parseTsv, tableHtml, type Table } from "./tables.ts";
import { readHead, type Item } from "./walk.ts";

export const TEXT_CAP = 262144;

export const href = (rel: string): string => rel.split("/").map(encodeURIComponent).join("/");

export const sizeText = (bytes: number): string =>
  bytes < 1024
    ? `${bytes} B`
    : bytes < 1048576
      ? `${(bytes / 1024).toFixed(0)} KB`
      : `${(bytes / 1048576).toFixed(1)} MB`;

const size = (item: Item): string => `<span class="size">${sizeText(item.size)}</span>`;

const caption = (item: Item): string =>
  `<figcaption><a href="${href(item.rel)}">${escapeHtml(item.rel)}</a>${size(item)}</figcaption>`;

const readCapped = (item: Item): { readonly text: string; readonly cut: boolean } =>
  item.size > TEXT_CAP
    ? { text: readHead(item.abs, TEXT_CAP).toString("utf8"), cut: true }
    : { text: readFileSync(item.abs, "utf8"), cut: false };

const cutNote = (what: string): string => `<p class="cut">${what}; open the file for the rest.</p>`;
const textCut = (cut: boolean): string => (cut ? cutNote("Only the first 256 KB is shown") : "");

const picture = (item: Item, id: string): string => {
  const dims = pictureDims(item.abs);
  const box = dims ? ` width="${Math.round(dims.width)}" height="${Math.round(dims.height)}"` : "";
  const img = `<img src="${href(item.rel)}" alt="${escapeHtml(basename(item.rel))}" loading="lazy" decoding="async"${box}>`;
  return `<figure class="item picture" id="${id}"><a class="frame" href="${href(item.rel)}">${img}</a>${caption(item)}</figure>`;
};

const page = (item: Item, id: string): string =>
  `<figure class="item page" id="${id}">${caption(item)}<div class="well"><iframe src="${href(item.rel)}" loading="lazy" title="${escapeHtml(item.rel)}"></iframe></div></figure>`;

const folded = (item: Item, id: string, body: string, cut: boolean): string =>
  `<details class="item folded" id="${id}"><summary><span class="mono">${escapeHtml(item.rel)}</span>${size(item)}</summary><div class="panel scroll">${body}</div>${textCut(cut)}</details>`;

const open = (item: Item, id: string, kind: string, body: string, after: string): string =>
  `<figure class="item ${kind}" id="${id}">${caption(item)}<div class="panel scroll">${body}</div>${after}</figure>`;

const asTable = (item: Item, id: string, table: Table, cut: boolean): string => {
  const { html, hidden } = tableHtml(table);
  const more = cut ? textCut(cut) : hidden > 0 ? cutNote(`${hidden} more rows are in the file`) : "";
  return open(item, id, "table", html, more);
};

const prettyJson = (text: string): string => {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
};

const table = (item: Item, id: string): string => {
  const { text, cut } = readCapped(item);
  const whole = cut ? text.slice(0, text.lastIndexOf("\n") + 1) : text;
  const parsed = extname(item.rel).toLowerCase() === ".csv" ? parseCsv(whole) : parseTsv(whole);
  return asTable(item, id, parsed, cut);
};

const json = (item: Item, id: string): string => {
  const { text, cut } = readCapped(item);
  const parsed = cut ? null : jsonTable(text);
  return parsed
    ? asTable(item, id, parsed, false)
    : folded(item, id, `<pre>${escapeHtml(prettyJson(text))}</pre>`, cut);
};

const text = (item: Item, id: string, anchors: Anchors): string => {
  const { text: body, cut } = readCapped(item);
  const isMarkdown = extname(item.rel).toLowerCase() === ".md";
  const html = isMarkdown ? `<div class="md">${markdown(body, anchors)}</div>` : `<pre>${escapeHtml(body)}</pre>`;
  return open(item, id, "text", html, textCut(cut));
};

const plain = (item: Item, id: string): string => {
  const { text: body, cut } = readCapped(item);
  return folded(item, id, `<pre>${escapeHtml(body)}</pre>`, cut);
};

export const listed = (item: Item, id: string): string => {
  if (item.kind === "link")
    return `<li id="${id}"><span class="mono">${escapeHtml(item.rel)}</span> <span class="size">a link to ${escapeHtml(item.target ?? "?")}, not followed</span></li>`;
  const note = item.kind === "site" ? ` <span class="size">opens alone</span>` : size(item);
  return `<li id="${id}"><a href="${href(item.rel)}">${escapeHtml(item.rel)}</a>${note}</li>`;
};

export const renderItem = (item: Item, id: string, anchors: Anchors): string => {
  switch (item.kind) {
    case "picture":
      return picture(item, id);
    case "page":
      return page(item, id);
    case "table":
      return table(item, id);
    case "json":
      return json(item, id);
    case "text":
      return text(item, id, anchors);
    case "log":
    case "code":
      return plain(item, id);
    case "site":
    case "link":
    case "other":
      return listed(item, id);
  }
};
