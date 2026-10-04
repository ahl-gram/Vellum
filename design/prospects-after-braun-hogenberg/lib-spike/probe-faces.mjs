import opentype from "opentype.js";
const F = (p) => opentype.loadSync(new URL("./node_modules/@fontsource/" + p, import.meta.url).pathname);
const faces = {
  "fell-sc": F("im-fell-dw-pica-sc/files/im-fell-dw-pica-sc-latin-400-normal.woff"),
  "fell-italic": F("im-fell-dw-pica/files/im-fell-dw-pica-latin-400-italic.woff"),
  "cormorant-sc": F("cormorant-sc/files/cormorant-sc-latin-500-normal.woff"),
  "cormorant-italic": F("cormorant-garamond/files/cormorant-garamond-latin-500-italic.woff"),
  "cinzel": F("cinzel/files/cinzel-latin-400-normal.woff"),
};
const sample = "The road to Nanawotani, founded An. 451";
for (const [k, f] of Object.entries(faces)) {
  const d1 = f.getPath(sample, 0, 0, 8, {}).toPathData(1);
  const d2 = f.getPath("LAUKUWELUA", 0, 0, 13, { letterSpacing: 2.4 / 13 }).toPathData(1);
  let pts = 0; for (const g of ["A","a","e","n","4"]) pts += f.charToGlyph(g).path.commands.length;
  console.log(k.padEnd(18), f.names.fullName?.en, "| key line 8px:", d1.length, "B | title 13px:", d2.length, "B | cmds for A a e n 4:", pts, "| № idx", f.charToGlyphIndex("№"), "· idx", f.charToGlyphIndex("·"));
}
