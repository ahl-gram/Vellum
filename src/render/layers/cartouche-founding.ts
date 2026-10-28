export const FOUNDING_LINE_UNITS = 48;

const WIDE =
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Extended_Pictographic}\u{3000}-\u{303F}\u{FF01}-\u{FF60}\u{FFE0}-\u{FFE6}]/u;
const JOINER = /[\p{M}\p{Variation_Selector}\u{200D}]/u;
const ZWJ = "\u{200D}";

const unitOf = (cp: string): number => (JOINER.test(cp) ? 0 : WIDE.test(cp) ? 2 : 1);

export function widthUnits(text: string): number {
  let n = 0;
  for (const cp of text) n += unitOf(cp);
  return n;
}

function clusters(word: string): string[] {
  const out: string[] = [];
  let prev = "";
  for (const cp of word) {
    const last = out.length - 1;
    if (last >= 0 && (cp === ZWJ || prev === ZWJ)) out[last] += cp;
    else out.push(cp);
    prev = cp;
  }
  return out;
}

function pieces(word: string, max: number): string[] {
  const out: string[] = [];
  let cur = "";
  let units = 0;
  for (const cluster of clusters(word)) {
    const u = widthUnits(cluster);
    if (cur !== "" && units + u > max) {
      out.push(cur);
      cur = "";
      units = 0;
    }
    cur += cluster;
    units += u;
  }
  if (cur !== "") out.push(cur);
  return out;
}

export function foundingLines(text: string, max: number = FOUNDING_LINE_UNITS): string[] {
  const lines: string[] = [];
  let cur = "";
  let units = 0;
  for (const piece of text.split(" ").flatMap((word) => (word === "" ? [] : pieces(word, max)))) {
    const u = widthUnits(piece);
    if (cur === "") {
      cur = piece;
      units = u;
    } else if (units + 1 + u > max) {
      lines.push(cur);
      cur = piece;
      units = u;
    } else {
      cur = `${cur} ${piece}`;
      units += 1 + u;
    }
  }
  if (cur !== "") lines.push(cur);
  return lines;
}
