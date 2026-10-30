// Issue #1104 round: the contact sheets' HTML. Every sheet links the house faces from design/kit/fonts.css, served from the main checkout's root by the shared camera.
export const SHEET_W = 1500;

export type Anchor = { readonly x: number; readonly y: number };

export function page(title: string, intro: string, body: string): string {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${title}</title>
<link rel="stylesheet" href="/design/kit/fonts.css">
<style>
body{margin:0;padding:28px 32px 40px;background:#2a2119;color:#efe3c8;font-family:'EB Garamond',serif;font-size:15px;line-height:1.35}
h1{font-family:'IM Fell English SC',serif;font-weight:400;font-size:30px;margin:0 0 6px;letter-spacing:.5px}
h2{font-family:'IM Fell English SC',serif;font-weight:400;font-size:21px;margin:26px 0 8px}
p.intro{font-family:'IM Fell English',serif;font-style:italic;max-width:1500px;margin:0 0 14px;color:#e4d3ad}
.row{display:flex;gap:18px;align-items:flex-start;margin:0 0 22px}
figure{margin:0}
figcaption{font-size:14px;max-width:760px;margin-top:5px;color:#efe3c8}
figcaption b{font-family:'IM Fell English SC',serif;font-weight:400;font-size:16px}
.crop{position:relative;overflow:hidden;background:#f3ead2;outline:1px solid #6b5a43}
.crop img{position:absolute;max-width:none}
.full{display:block;outline:1px solid #6b5a43}
.tag{font-size:12px;color:#c9b48a}
table{border-collapse:collapse;font-size:14px}
td,th{border:1px solid #6b5a43;padding:3px 8px;text-align:right}
th{font-weight:400;font-family:'IM Fell English SC',serif}
</style></head><body><h1>${title}</h1><p class="intro">${intro}</p>${body}</body></html>`;
}

export function full(src: string, displayW: number, aspect: number): string {
  return `<img class="full" src="${src}" width="${displayW.toFixed(0)}" height="${(displayW * aspect).toFixed(0)}" alt="">`;
}

export function crop(src: string, displayW: number, a: Anchor, boxW: number, boxH: number, zoom: number): string {
  const s = (displayW / SHEET_W) * zoom;
  const left = boxW / 2 - a.x * s;
  const top = boxH / 2 - a.y * s;
  return `<div class="crop" style="width:${boxW}px;height:${boxH}px"><img src="${src}" style="left:${left.toFixed(2)}px;top:${top.toFixed(2)}px;width:${(displayW * zoom).toFixed(2)}px" alt=""></div>`;
}

export const fig = (inner: string, caption: string): string => `<figure>${inner}<figcaption>${caption}</figcaption></figure>`;

export const row = (...cells: string[]): string => `<div class="row">${cells.join("")}</div>`;
