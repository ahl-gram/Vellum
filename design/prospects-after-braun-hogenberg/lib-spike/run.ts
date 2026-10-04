// Renders direction E's capital plate with each candidate library applied, writes the SVGs, the contact sheet, the shot list and a sizes table. Run from the design-747 worktree: node /Users/ahl/CodeProjects/Vellum/out/747/lib-spike/run.ts
import { writeFileSync } from "node:fs";
import { sceneFor } from "/Users/ahl/CodeProjects/Vellum/.claude/worktrees/design-747/out/747/mock/data.ts";
import { ANTIQUE_COLOURED, INK } from "/Users/ahl/CodeProjects/Vellum/.claude/worktrees/design-747/out/747/mock/dress.ts";
import { plateE } from "/Users/ahl/CodeProjects/Vellum/.claude/worktrees/design-747/out/747/mock/direction-rise.ts";
import { letterPlateDefs, letterPlateInline, loadFace, type FaceSet } from "./letter.ts";
import { roughenPlate } from "./roughen.ts";

const HERE = new URL("./", import.meta.url).pathname;

const FELL: FaceSet = {
  name: "IM Fell DW Pica (1600s face, OFL, @fontsource/im-fell-dw-pica + -sc 5.3.0)",
  roman: loadFace("im-fell-dw-pica/files/im-fell-dw-pica-latin-400-normal.woff"),
  smallCaps: loadFace("im-fell-dw-pica-sc/files/im-fell-dw-pica-sc-latin-400-normal.woff"),
  italic: loadFace("im-fell-dw-pica/files/im-fell-dw-pica-latin-400-italic.woff"),
  scale: { roman: 1.06, smallCaps: 1.0, italic: 1.1 },
};

const CORMORANT: FaceSet = {
  name: "Cormorant Garamond Medium + Cormorant SC Medium (OFL, @fontsource/cormorant-garamond + cormorant-sc 5.2.x)",
  roman: loadFace("cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff"),
  smallCaps: loadFace("cormorant-sc/files/cormorant-sc-latin-500-normal.woff"),
  italic: loadFace("cormorant-garamond/files/cormorant-garamond-latin-500-italic.woff"),
  scale: { roman: 1.12, smallCaps: 1.04, italic: 1.16 },
};

const scene = sceneFor(42, 0);
const sizes: Record<string, number> = {};
const put = (name: string, svg: string): void => { writeFileSync(`${HERE}${name}`, svg); sizes[name] = Buffer.byteLength(svg); };

for (const [dk, d] of [["antique", ANTIQUE_COLOURED], ["ink", INK]] as const) {
  const today = plateE(d, scene);
  put(`e-today-${dk}.svg`, today);
  const t0 = performance.now();
  put(`e-fell-${dk}.svg`, letterPlateDefs(today, FELL, `f${dk[0]}`));
  const t1 = performance.now();
  sizes[`e-fell-${dk}.inline.bytes`] = Buffer.byteLength(letterPlateInline(today, FELL));
  put(`e-cormorant-${dk}.svg`, letterPlateDefs(today, CORMORANT, `c${dk[0]}`));
  const t2 = performance.now();
  sizes[`e-cormorant-${dk}.inline.bytes`] = Buffer.byteLength(letterPlateInline(today, CORMORANT));
  sizes[`ms.letter.fell.${dk}`] = Math.round(t1 - t0);
  sizes[`ms.letter.cormorant.${dk}`] = Math.round(t2 - t1);
  if (dk === "antique") {
    const t3 = performance.now();
    const r = roughenPlate(today, 42);
    put(`e-rough-${dk}.svg`, r.svg);
    sizes[`ms.rough.${dk}`] = Math.round(performance.now() - t3);
    sizes[`rough.paths.wobbled`] = r.count;
  }
}
const textCount = (plateE(ANTIQUE_COLOURED, scene).match(/<text /g) ?? []).length;
sizes["text.runs.in.e.antique"] = textCount;
writeFileSync(`${HERE}sizes.json`, JSON.stringify(sizes, null, 1));
console.log(JSON.stringify(sizes, null, 1));

const css = `body{margin:0;background:#2b2118;font-family:'EB Garamond','Iowan Old Style',Georgia,serif;color:#f2e8cf}
h1{font-size:22px;font-weight:400;margin:14px 20px 4px}h2{font-size:15px;font-weight:400;margin:10px 20px 4px;color:#d9c8a0}
.grid{display:grid;grid-template-columns:repeat(4,520px);gap:14px 18px;padding:6px 20px 18px}
figure{margin:0}figcaption{font-size:13px;margin:4px 0 0;color:#d9c8a0}img{display:block;width:520px;height:384px;background:#f2e8cf;box-shadow:0 6px 18px rgba(0,0,0,.5)}`;
const tile = (f: string, cap: string): string => `<figure><img src="${f}" alt=""><figcaption>${cap}</figcaption></figure>`;
writeFileSync(`${HERE}sheet.html`, `<!doctype html><meta charset="utf-8"><title>lib spike</title><style>${css}</style>
<h1>Issue #747 library spike: E's capital plate, today's lettering beside glyph outlines from two period faces, and roughjs</h1>
<h2>antique, hand-coloured</h2><div class="grid">${tile("e-today-antique.svg", "Today's E (Iowan stack as <text>, device fonts)")}${tile("e-fell-antique.svg", "E lettered in IM Fell DW Pica (opentype.js outlines)")}${tile("e-cormorant-antique.svg", "E lettered in Cormorant Garamond + SC (opentype.js outlines)")}${tile("e-rough-antique.svg", "E with roughjs wobble on every stroke (fails the guard)")}</div>
<h2>ink</h2><div class="grid">${tile("e-today-ink.svg", "Today's E")}${tile("e-fell-ink.svg", "E lettered in IM Fell DW Pica")}${tile("e-cormorant-ink.svg", "E lettered in Cormorant Garamond + SC")}</div>`);
writeFileSync(`${HERE}plate.html`, `<!doctype html><meta charset="utf-8"><title>plate</title><style>body{margin:0;background:#f2e8cf}img{display:block}</style><img id="p" alt=""><script>const q=new URLSearchParams(location.search);const i=document.getElementById('p');i.src=q.get('f');i.style.width=(q.get('w')||'1040')+'px';</script>`);

const shots: unknown[] = [{ url: "/lib-spike/sheet.html", width: 2200, height: 900, mobile: false, out: `${HERE}sheet-lib-spike.png`, full: true, waitMs: 1800 }];
for (const v of ["today", "fell", "cormorant", "rough"]) {
  for (const dk of v === "rough" ? ["antique"] : ["antique", "ink"]) {
    shots.push({ url: `/lib-spike/plate.html?f=e-${v}-${dk}.svg&w=1040`, width: 1040, height: 768, mobile: false, out: `${HERE}full-e-${v}-${dk}.png`, waitMs: 1200 });
  }
  shots.push({ url: `/lib-spike/plate.html?f=e-${v}-antique.svg&w=1040`, width: 1040, height: 768, mobile: false, out: `${HERE}crop-${v}-cartouche.png`, waitMs: 1200, clip: { x: 180, y: 40, width: 680, height: 150, scale: 2 } });
  shots.push({ url: `/lib-spike/plate.html?f=e-${v}-antique.svg&w=1040`, width: 1040, height: 768, mobile: false, out: `${HERE}crop-${v}-key.png`, waitMs: 1200, clip: { x: 560, y: 580, width: 460, height: 150, scale: 2 } });
}
shots.push({ url: "/lib-spike/plate.html?f=e-rough-antique.svg&w=1040", width: 1040, height: 768, mobile: false, out: `${HERE}crop-rough-figures.png`, waitMs: 1200, clip: { x: 140, y: 360, width: 460, height: 170, scale: 2 } });
shots.push({ url: "/lib-spike/plate.html?f=e-today-antique.svg&w=1040", width: 1040, height: 768, mobile: false, out: `${HERE}crop-today-figures.png`, waitMs: 1200, clip: { x: 140, y: 360, width: 460, height: 170, scale: 2 } });
writeFileSync(`${HERE}shots.json`, JSON.stringify(shots, null, 1));
