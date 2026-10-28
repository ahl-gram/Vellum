import { el, type SvgNode } from "../svg.ts";
import type { MapStyle } from "../style.ts";
import type { World } from "../../world/types.ts";

export const FOUNDING_LINE_UNITS = 48;
const FONT = 11.5;
const PITCH = 16;
const GAP = 22;
const CAPITAL_SCALE = 1.7;
const CAPITAL_RISE = 6;
const OPEN_QUOTE = "\u{201C}";
const CLOSE_QUOTE = "\u{201D}";

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

export function engravedLines(world: World): ReadonlyArray<string> {
  const text = world.recipe.foundingText;
  if (text === undefined || text.trim() === "" || world.region !== undefined) return [];
  return foundingLines(`${OPEN_QUOTE}${text}${CLOSE_QUOTE}`);
}

export function foundingRise(lineCount: number): number {
  if (lineCount === 0) return 0;
  return GAP + CAPITAL_RISE + (lineCount - 1) * PITCH;
}

function openingCapital(style: MapStyle, line: string, k: number): ReadonlyArray<SvgNode | string> {
  const [quote = "", capital = "", ...rest] = clusters(line);
  const size = (FONT * CAPITAL_SCALE * k).toFixed(1);
  return [
    el("tspan", { "font-family": style.fontFamilyTitle, "font-size": size }, [`${quote}${capital.toUpperCase()}`]),
    rest.join(""),
  ];
}

export function foundingNodes(
  style: MapStyle,
  lines: ReadonlyArray<string>,
  cx: number,
  subtitleBase: number,
  k: number,
): SvgNode[] {
  if (lines.length === 0) return [];
  const first = subtitleBase + (GAP + CAPITAL_RISE) * k;
  return [
    el(
      "g",
      { id: "cartouche-founding" },
      lines.map((line, i) =>
        el(
          "text",
          {
            x: cx,
            y: first + i * PITCH * k,
            "text-anchor": "middle",
            "font-family": style.fontFamily,
            "font-size": (FONT * k).toFixed(1),
            fill: style.ink,
          },
          i === 0 ? openingCapital(style, line, k) : [line],
        ),
      ),
    ),
  ];
}
