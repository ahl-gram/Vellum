// How big a committed glyph table would be if the outlines were converted at build time and no library shipped: printable ASCII plus the middle dot, in font units, for the three Cormorant faces and the three Fell faces.
import opentype from "opentype.js";
const F = (p) => opentype.loadSync(new URL("./node_modules/@fontsource/" + p, import.meta.url).pathname);
const sets = {
  cormorant: ["cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff", "cormorant-sc/files/cormorant-sc-latin-500-normal.woff", "cormorant-garamond/files/cormorant-garamond-latin-500-italic.woff"],
  fell: ["im-fell-dw-pica/files/im-fell-dw-pica-latin-400-normal.woff", "im-fell-dw-pica-sc/files/im-fell-dw-pica-sc-latin-400-normal.woff", "im-fell-dw-pica/files/im-fell-dw-pica-latin-400-italic.woff"],
};
const chars = [...Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)), "·"];
for (const [name, files] of Object.entries(sets)) {
  let bytes = 0, glyphs = 0, kernPairs = 0;
  for (const f of files.map(F)) {
    for (const ch of chars) {
      const g = f.charToGlyph(ch);
      if (g.index === 0) continue;
      glyphs++;
      bytes += JSON.stringify({ a: g.advanceWidth, d: g.getPath(0, 0, f.unitsPerEm).toPathData(0) }).length + 6;
    }
    for (const a of chars) for (const b of chars) { const k = f.getKerningValue(f.charToGlyph(a), f.charToGlyph(b)); if (k !== 0) kernPairs++; }
  }
  console.log(name, "glyphs", glyphs, "table bytes", bytes, "(" + (bytes / 1024).toFixed(0) + " KB)", "kern pairs", kernPairs);
}
