import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { escapeHtml, notesTitle } from "./markdown.ts";
import { countsText, head, stamp } from "./page.ts";
import { href } from "./render-item.ts";
import { PAGE, byName, pageState, walkDelivery, type Delivery, type Item } from "./walk.ts";

interface Pageless {
  readonly name: string;
  readonly mtime: number;
  readonly handBuilt: boolean;
}

const isMissing = (error: unknown): boolean =>
  error instanceof Error && "code" in error && (error.code === "ENOENT" || error.code === "ENOTDIR");

const orSkipped = <T>(folder: string, read: () => T): T | null => {
  try {
    return read();
  } catch (error) {
    if (!isMissing(error))
      console.warn(
        `${folder} is left out of the list: ${error instanceof Error ? error.message : "an error with no message"}`,
      );
    return null;
  }
};

const folders = (out: string): string[] =>
  readdirSync(out, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith("."))
    .map((e) => e.name)
    .sort(byName);

const thumb = (d: Delivery, items: readonly Item[]): string => {
  const first = items.find((i) => i.kind === "picture");
  const inner = first
    ? `<img src="${href(`${d.name}/${first.rel}`)}" alt="" loading="lazy">`
    : `<span>${countsText(items) || "empty"}</span>`;
  return `<a class="thumb" href="${href(d.name)}/${PAGE}">${inner}</a>`;
};

const deliveryRow = (d: Delivery): string => {
  const title = notesTitle(d.notes) ?? d.name;
  const items = d.sections.flatMap((s) => s.items);
  return `<li class="delivery">${thumb(d, items)}<div><h2><a href="${href(d.name)}/${PAGE}">${escapeHtml(title)}</a></h2><p><span class="mono">${escapeHtml(d.name)}/</span> · ${stamp(d.newest)} · ${countsText(items)}</p></div></li>`;
};

const pagelessRow = (r: Pageless): string => {
  const target = r.handBuilt ? `${href(r.name)}/${PAGE}` : `${href(r.name)}/`;
  const note = r.handBuilt ? " (holds an index.html this command did not write)" : "";
  return `<li><a href="${target}">${escapeHtml(r.name)}/</a>${note} ${stamp(r.mtime)}</li>`;
};

const pagelessHtml = (rows: readonly Pageless[]): string =>
  rows.length === 0
    ? ""
    : `<details class="pageless"><summary>${rows.length} older folders with no page from this command</summary><ul>${rows.map(pagelessRow).join("")}</ul></details>`;

const readFolder = (out: string, name: string): Delivery | Pageless | null =>
  orSkipped(join(out, name), () => {
    const state = pageState(join(out, name, PAGE));
    if (state === "own") return walkDelivery(join(out, name), name);
    return { name, mtime: statSync(join(out, name)).mtimeMs, handBuilt: state === "foreign" };
  });

export const indexPage = (out: string): string => {
  const read = folders(out)
    .map((name) => readFolder(out, name))
    .filter((r) => r !== null);
  const deliveries = read.filter((r): r is Delivery => "sections" in r).sort((a, b) => b.newest - a.newest);
  const pageless = read.filter((r): r is Pageless => !("sections" in r)).sort((a, b) => b.mtime - a.mtime);
  return `${head("Deliveries")}
<body>
<header class="masthead">
<h1>Deliveries</h1>
<p class="meta">Every folder in <span class="mono">out/</span> given a page by <span class="mono">npm run delivery</span>, newest first.</p>
</header>
<ul class="deliveries">
${deliveries.map(deliveryRow).join("\n")}
</ul>
${pagelessHtml(pageless)}
<p class="foot">Written at ${stamp(Date.now())}.</p>
</body>
</html>
`;
};
