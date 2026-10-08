export const escapeHtml = (text: string): string =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const escapeRe = (text: string): string => text.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

export type Anchors = ReadonlyMap<string, string>;

const INLINE = ["`([^`]+)`", "\\[([^\\]]+)\\]\\(([^)\\s]+)\\)", "\\*\\*([^*]+)\\*\\*", "\\*([^*\\s][^*]*)\\*"];

const inlinePattern = (anchors: Anchors): RegExp => {
  const names = [...anchors.keys()].sort((a, b) => b.length - a.length).map(escapeRe);
  const fileNames = names.length > 0 ? [`(?<![\\w/-])(${names.join("|")})(?![\\w/-])`] : [];
  return new RegExp([...INLINE, ...fileNames].join("|"), "g");
};

const linked = (anchors: Anchors, name: string, inner: string): string => {
  const id = anchors.get(name);
  return id ? `<a href="#${id}">${inner}</a>` : inner;
};

const renderMatch = (anchors: Anchors, m: RegExpExecArray): string => {
  const [whole, code, linkText, href, bold, italic, file] = m;
  if (code !== undefined) return linked(anchors, code, `<code>${escapeHtml(code)}</code>`);
  if (linkText !== undefined && href !== undefined) return `<a href="${escapeHtml(href)}">${escapeHtml(linkText)}</a>`;
  if (bold !== undefined) return `<strong>${escapeHtml(bold)}</strong>`;
  if (italic !== undefined) return `<em>${escapeHtml(italic)}</em>`;
  if (file !== undefined) return linked(anchors, file, escapeHtml(file));
  return escapeHtml(whole);
};

export const inline = (text: string, anchors: Anchors): string => {
  const pattern = inlinePattern(anchors);
  let html = "";
  let at = 0;
  for (const m of text.matchAll(pattern)) {
    html += escapeHtml(text.slice(at, m.index)) + renderMatch(anchors, m);
    at = m.index + m[0].length;
  }
  return html + escapeHtml(text.slice(at));
};

const FENCE = /^```/;
const HEADING = /^(#{1,6})\s+(.*)$/;
const BULLET = /^\s*[-*]\s+(.*)$/;
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/;
const TABLE_RULE = /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/;

const cells = (line: string): string[] =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());

interface Block {
  readonly html: string;
  readonly next: number;
}

const fence = (lines: readonly string[], start: number): Block => {
  let end = start + 1;
  while (end < lines.length && !FENCE.test(lines[end] ?? "")) end += 1;
  const body = lines.slice(start + 1, end).join("\n");
  return { html: `<pre><code>${escapeHtml(body)}</code></pre>`, next: end + 1 };
};

const table = (lines: readonly string[], start: number, anchors: Anchors): Block => {
  const row = (line: string, tag: string): string =>
    `<tr>${cells(line)
      .map((c) => `<${tag}>${inline(c, anchors)}</${tag}>`)
      .join("")}</tr>`;
  let end = start + 2;
  while (end < lines.length && (lines[end] ?? "").trim().startsWith("|")) end += 1;
  const body = lines.slice(start + 2, end).map((l) => row(l, "td"));
  return {
    html: `<div class="scroll"><table><thead>${row(lines[start] ?? "", "th")}</thead><tbody>${body.join("")}</tbody></table></div>`,
    next: end,
  };
};

const list = (lines: readonly string[], start: number, anchors: Anchors, pattern: RegExp, tag: string): Block => {
  const items: string[] = [];
  let end = start;
  while (end < lines.length) {
    const line = lines[end] ?? "";
    const m = pattern.exec(line);
    if (m) items.push(m[1] ?? "");
    else if (line.trim() !== "" && /^\s+/.test(line) && items.length > 0) items[items.length - 1] += ` ${line.trim()}`;
    else break;
    end += 1;
  }
  return { html: `<${tag}>${items.map((i) => `<li>${inline(i, anchors)}</li>`).join("")}</${tag}>`, next: end };
};

const startsBlock = (lines: readonly string[], at: number): boolean => {
  const line = lines[at] ?? "";
  return (
    line.trim() === "" ||
    FENCE.test(line) ||
    HEADING.test(line) ||
    BULLET.test(line) ||
    NUMBERED.test(line) ||
    (line.trim().startsWith("|") && TABLE_RULE.test(lines[at + 1] ?? ""))
  );
};

const paragraph = (lines: readonly string[], start: number, anchors: Anchors): Block => {
  let end = start + 1;
  while (end < lines.length && !startsBlock(lines, end)) end += 1;
  return { html: `<p>${inline(lines.slice(start, end).join(" "), anchors)}</p>`, next: end };
};

const block = (lines: readonly string[], at: number, anchors: Anchors): Block => {
  const line = lines[at] ?? "";
  const heading = HEADING.exec(line);
  if (FENCE.test(line)) return fence(lines, at);
  if (heading) {
    const level = Math.min((heading[1] ?? "#").length + 2, 6);
    return { html: `<h${level}>${inline(heading[2] ?? "", anchors)}</h${level}>`, next: at + 1 };
  }
  if (line.trim().startsWith("|") && TABLE_RULE.test(lines[at + 1] ?? "")) return table(lines, at, anchors);
  if (BULLET.test(line)) return list(lines, at, anchors, BULLET, "ul");
  if (NUMBERED.test(line)) return list(lines, at, anchors, NUMBERED, "ol");
  return paragraph(lines, at, anchors);
};

export const markdown = (text: string, anchors: Anchors): string => {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const html: string[] = [];
  let at = 0;
  while (at < lines.length) {
    if ((lines[at] ?? "").trim() === "") {
      at += 1;
      continue;
    }
    const next = block(lines, at, anchors);
    html.push(next.html);
    at = next.next;
  }
  return html.join("\n");
};

const LEADING_HEADING = /^\s*#{1,6}[ \t]+([^\n]*)(?:\n|$)/;

export const notesTitle = (notes: string | null): string | null => {
  const title = notes === null ? undefined : LEADING_HEADING.exec(notes)?.[1]?.replace(/[*`]/g, "").trim();
  return title ? title : null;
};

export const notesBody = (notes: string): string => notes.replace(LEADING_HEADING, "");
