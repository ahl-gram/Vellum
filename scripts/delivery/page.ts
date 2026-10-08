import { basename } from "node:path";
import { escapeHtml, markdown, notesTitle, type Anchors } from "./markdown.ts";
import { listed, renderItem, TEXT_CAP } from "./render-item.ts";
import { STYLE } from "./style.ts";
import { MARK, NOTES, type Delivery, type Item, type Kind, type Section } from "./walk.ts";

interface Placed {
  readonly item: Item;
  readonly id: string;
  readonly full: boolean;
}

const ORDER: readonly Kind[] = ["picture", "page", "table", "json", "text", "log", "code", "site", "link", "other"];
const NOUNS: Readonly<Record<Kind, readonly [string, string]>> = {
  picture: ["picture", "pictures"],
  page: ["page", "pages"],
  table: ["table", "tables"],
  json: ["JSON file", "JSON files"],
  text: ["text", "texts"],
  log: ["log", "logs"],
  code: ["script", "scripts"],
  site: ["folder with its own page", "folders with their own pages"],
  link: ["symbolic link", "symbolic links"],
  other: ["other file", "other files"],
};
const INLINED: ReadonlySet<Kind> = new Set(["table", "json", "text", "log", "code"]);
const ALWAYS_LISTED: ReadonlySet<Kind> = new Set(["site", "link", "other"]);
const SHOWN: ReadonlySet<Kind> = new Set(["picture", "page", "table", "json", "text", "log", "code"]);
const INLINE_BUDGET = 4 * 1048576;
const FRAME_CAP = 12;
const CONTENTS_OPEN = 24;

const two = (n: number): string => String(n).padStart(2, "0");
export const stamp = (ms: number): string => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())} ${two(d.getHours())}:${two(d.getMinutes())}`;
};

export const head = (title: string): string => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
${MARK}
<meta http-equiv="Content-Security-Policy" content="script-src 'none'">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>${STYLE}</style>
</head>`;

const ordered = (section: Section): Item[] =>
  [...section.items].sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind));

const place = (sections: readonly Section[]): Placed[][] => {
  let n = 0;
  let spent = 0;
  let frames = 0;
  return sections.map((s) =>
    ordered(s).map((item) => {
      n += 1;
      const inlined = INLINED.has(item.kind);
      const isFrame = item.kind === "page";
      const full =
        !ALWAYS_LISTED.has(item.kind) && (!inlined || spent < INLINE_BUDGET) && (!isFrame || frames < FRAME_CAP);
      if (full && inlined) spent += Math.min(item.size, TEXT_CAP);
      if (full && isFrame) frames += 1;
      return { item, id: `f${n}`, full };
    }),
  );
};

const anchorsOf = (placed: readonly Placed[]): Anchors => {
  const seen = new Map<string, number>();
  for (const p of placed) seen.set(basename(p.item.rel), (seen.get(basename(p.item.rel)) ?? 0) + 1);
  return new Map(
    placed.flatMap((p): [string, string][] =>
      seen.get(basename(p.item.rel)) === 1
        ? [
            [p.item.rel, p.id],
            [basename(p.item.rel), p.id],
          ]
        : [[p.item.rel, p.id]],
    ),
  );
};

export const countsText = (items: readonly Item[]): string =>
  ORDER.map((kind) => {
    const n = items.filter((i) => i.kind === kind).length;
    return n === 0 ? "" : `${n} ${NOUNS[kind][n === 1 ? 0 : 1]}`;
  })
    .filter((s) => s !== "")
    .join(", ");

const sectionHtml = (section: Section, placed: readonly Placed[], anchors: Anchors, root: string): string => {
  const full = placed.filter((p) => p.full);
  const shown = (kinds: readonly Kind[]): string =>
    full
      .filter((p) => kinds.includes(p.item.kind))
      .map((p) => renderItem(p.item, p.id, anchors))
      .join("\n");
  const pictures = shown(["picture"]);
  const links = placed.filter((p) => !p.full).map((p) => listed(p.item, p.id));
  const heading = section.rel === "" ? root : `${section.rel}/`;
  return [
    `<section class="folder"><h2><span class="mono">${escapeHtml(heading)}</span></h2>`,
    pictures ? `<div class="pictures">${pictures}</div>` : "",
    shown(["page", "table", "json", "text", "log", "code"]),
    links.length > 0 ? `<ul class="others">${links.join("")}</ul>` : "",
    `</section>`,
  ].join("\n");
};

const notesHtml = (notes: string | null, anchors: Anchors): string => {
  if (notes === null)
    return `<div class="panel notes missing">No ${NOTES} in this folder. Whoever delivers writes one: what to look at, and which menu option each file belongs to.</div>`;
  return `<div class="panel notes">${markdown(notes.replace(/^\s*#\s+[^\n]*\n/, ""), anchors)}</div>`;
};

const contentsHtml = (placed: readonly Placed[]): string => {
  const rows = placed.map((p) => `<li><a href="#${p.id}">${escapeHtml(p.item.rel)}</a></li>`).join("");
  const open = placed.length <= CONTENTS_OPEN ? " open" : "";
  return `<nav class="contents"><details${open}><summary>Contents: ${placed.length} files</summary><ol>${rows}</ol></details></nav>`;
};

const limitNote = (placed: readonly Placed[]): string => {
  const demoted = placed.filter((p) => !p.full && SHOWN.has(p.item.kind)).length;
  return demoted > 0
    ? `<p class="cut">${demoted} of these ${placed.length} files are listed by name in their folders rather than shown in full: past ${FRAME_CAP} frames, or past ${INLINE_BUDGET / 1048576} MB of text, tables and scripts, a page grows slow to open.</p>`
    : "";
};

export const deliveryPage = (delivery: Delivery): string => {
  const placed = place(delivery.sections);
  const flat = placed.flat();
  const anchors = anchorsOf(flat);
  const title = notesTitle(delivery.notes) ?? delivery.name;
  const sections = delivery.sections.map((s, i) => sectionHtml(s, placed[i] ?? [], anchors, `${delivery.name}/`));
  return `${head(title)}
<body>
<header class="masthead">
<a class="up" href="../index.html">All deliveries</a>
<h1>${escapeHtml(title)}</h1>
<p class="meta"><span class="mono">${escapeHtml(delivery.name)}/</span> · delivered ${stamp(delivery.newest)} · ${delivery.total} files: ${countsText(flat.map((p) => p.item))}</p>
</header>
${notesHtml(delivery.notes, anchors)}
${contentsHtml(flat)}
${limitNote(flat)}
<main>
${sections.join("\n")}
</main>
<p class="foot">Written by <span class="mono">npm run delivery</span> at ${stamp(Date.now())}. Run it again whenever the folder changes.</p>
</body>
</html>
`;
};
