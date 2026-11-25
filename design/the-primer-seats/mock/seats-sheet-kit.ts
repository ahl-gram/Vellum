// Issue #1248 round: the contact sheets' shared parts. A sheet is served from the main checkout's root so it reaches the stills and the house faces in `design/kit/fonts.css`; every figure in a caption that is a measurement is read from a table in measure/ by `cell`, never typed.
import { readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { OUT } from "./seats-paths.ts";

export const MAIN = join(OUT, "..", "..");
export const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/`/g, "");
export const url = (rel: string): string => "/" + relative(MAIN, join(OUT, rel));

export const fig = (rel: string, width: number, caption: string): string =>
  `<figure style="width:${width}px"><img src="${url(rel)}" style="width:${width}px" alt=""><figcaption>${caption} <code>${esc(rel)}</code></figcaption></figure>`;
export const row = (...figs: string[]): string => `<div class="row">${figs.join("")}</div>`;

export function rows(file: string): string[][] {
  return readFileSync(join(OUT, "measure", file), "utf8")
    .split("\n")
    .filter((l) => l.startsWith("| ") && !l.startsWith("|---"))
    .map((l) => l.split("|").slice(1, -1).map((c) => c.trim()));
}
export function cell(file: string, match: (cells: string[]) => boolean, col: number): string {
  const r = rows(file).find(match);
  if (!r) throw new Error(`${file}: no row matches`);
  const v = r[col];
  if (v === undefined) throw new Error(`${file}: no column ${col}`);
  return v.replace(/\*\*/g, "").replace(/`/g, "");
}

export const page = (title: string, intro: string, body: string, width: number): string => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=${width}">
<link rel="stylesheet" href="/design/kit/fonts.css"><title>${esc(title)}</title><style>
body{margin:0;padding:28px 32px 40px;background:#2b2118;color:#efe6cf;font-family:"EB Garamond",Georgia,serif;width:${width - 64}px}
h1{font-family:"IM Fell English SC",Georgia,serif;font-weight:400;font-size:32px;letter-spacing:.06em;margin:0 0 6px}
h2{font-family:"IM Fell English SC",Georgia,serif;font-weight:400;font-size:22px;letter-spacing:.06em;margin:26px 0 10px;border-bottom:1px solid #6b5a40;padding-bottom:4px}
p.intro{font-family:"IM Fell English",Georgia,serif;font-style:italic;font-size:19px;margin:0 0 20px;max-width:${width - 120}px;line-height:1.4}
p.note{font-size:17px;line-height:1.45;margin:0 0 14px;max-width:${width - 120}px}
.row{display:flex;flex-wrap:wrap;gap:26px;align-items:flex-start;margin-bottom:22px}
figure{margin:0}img{display:block;border:1px solid #6b5a40}
figcaption{font-size:16px;line-height:1.38;margin-top:7px;color:#efe6cf}figcaption b{font-weight:600;color:#fff7e4}figcaption code,code{font-size:12.5px;color:#cdbd97}
table{border-collapse:collapse;font-size:16px;margin:0 0 18px}td,th{border:1px solid #6b5a40;padding:4px 9px;text-align:left;vertical-align:top}th{font-family:"IM Fell English SC",Georgia,serif;font-weight:400;letter-spacing:.05em}
</style></head><body><h1>${esc(title)}</h1><p class="intro">${intro}</p>${body}</body></html>`;
