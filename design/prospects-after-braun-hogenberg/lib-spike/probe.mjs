import opentype from "opentype.js";
const f = opentype.loadSync(new URL("./node_modules/@fontsource/im-fell-dw-pica-sc/files/im-fell-dw-pica-sc-latin-400-normal.woff", import.meta.url).pathname);
const it = opentype.loadSync(new URL("./node_modules/@fontsource/im-fell-dw-pica/files/im-fell-dw-pica-latin-400-italic.woff", import.meta.url).pathname);
console.log("sc", f.names.fullName?.en, "upem", f.unitsPerEm, "glyphs", f.numGlyphs);
for (const ch of ["№", "·", "A", "a", "é", "4"]) console.log(JSON.stringify(ch), "sc idx", f.charToGlyphIndex(ch), "it idx", it.charToGlyphIndex(ch));
const p = f.getPath("LAUKUWELUA", 0, 0, 13, { letterSpacing: 2.4 / 13 });
console.log("adv", f.getAdvanceWidth("LAUKUWELUA", 13, { letterSpacing: 2.4 / 13 }).toFixed(1), "d bytes", p.toPathData(1).length);
console.log(p.toPathData(1).slice(0, 120));
