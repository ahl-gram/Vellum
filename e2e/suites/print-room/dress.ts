// The Print Room's dress at rest, bound (Issue #779 part 2g): the slip's contents in the kit's row, the page face and its measure box, the stage's reserve and depth, the gesture box's wiring.
import { nearRgba, PAGE_RGBA, SHADE, tokenRgba } from "../../support/pixel.ts";
import type { Payload, SuiteContext } from "../../types.ts";

type Slip = {
  bound: boolean;
  intro: string | null;
  boundLine: [string, number] | null;
  list: string[] | null;
  row: string | null;
  num: (string | number[])[] | null;
  text: (string | number[])[] | null;
  wash: number[][];
  onNum: number[] | null;
  plates: [string, number] | null;
};
// The wash runs "to right", which GRADIENT_STOPS refuses, so its stops are read here.
const SLIP: Payload<Slip> = `(() => { const rgba = ${PAGE_RGBA};
  const cs = (s) => { const e = document.querySelector(s); return e && getComputedStyle(e); };
  const list = cs("#pr-contents"), row = cs("#pr-contents li:not(.on)"), num = cs("#pr-contents li:not(.on) .cr-num"), text = cs("#pr-contents li:not(.on) .cr-text");
  const on = cs("#pr-contents li.on"), onNum = cs("#pr-contents li.on .cr-num"), plates = cs("#pr-contents .plates"), line = document.querySelector(".slip .bound-line");
  return { bound: document.body.classList.contains("has-atlas"), intro: cs(".slip .intro") && cs(".slip .intro").display,
    boundLine: line && [getComputedStyle(line).display, line.textContent.trim().length],
    list: list && [list.listStyleType, list.paddingLeft, list.marginTop], row: row && row.display,
    num: num && [num.fontVariantCaps, num.textAlign, num.flexBasis, rgba(num.color)],
    text: text && [text.flexGrow, text.minWidth, rgba(text.color)],
    wash: on && /^linear-gradient\\(to right, /.test(on.backgroundImage) ? (on.backgroundImage.match(/(color|rgba?|oklab)\\([^)]*\\)/g) || []).map(rgba) : [],
    onNum: onNum && rgba(onNum.color), plates: plates && [plates.display, plates.gridTemplateColumns.split(" ").length] };
})()`;

const slipFaults = (s: Slip): string[] =>
  [
    s.bound || "bound",
    s.intro === "none" || "bound, the slip's intro gone",
    (s.boundLine?.[0] !== "none" && (s.boundLine?.[1] ?? 0) > 0) || "the bound line shown",
    JSON.stringify(s.list) === JSON.stringify(["none", "0px", "9.6px"]) || "the contents a plain list",
    s.row === "flex" || "a row a flex row",
    (s.num?.[0] === "small-caps" &&
      s.num[1] === "right" &&
      s.num[2] === "38.4px" &&
      nearRgba(s.num[3] as number[], tokenRgba("--ink-brown"))) ||
      "the numeral's dress",
    (s.text?.[0] === "1" && s.text[1] === "0px" && nearRgba(s.text[2] as number[], tokenRgba("--ink-annals"))) ||
      "the entry's dress",
    (s.wash.length === 2 && nearRgba(s.wash[0], tokenRgba("--control-gold")) && s.wash[1]![3] === 0) ||
      "the turned row's gold wash",
    nearRgba(s.onNum, tokenRgba("--ink-dark")) || "the turned row's numeral dark",
    (s.plates?.[0] === "grid" && s.plates[1] === 2) || "the thumbnails two to a row",
  ].filter((f): f is string => f !== true);

type Stage = {
  page: string[] | null;
  measure: (string | number)[] | null;
  pad: number[];
  reserve: number[];
  shadow: { colour: number[]; geometry: string } | null;
  vp: [boolean, string] | null;
  origin: string | null;
};
const STAGE: Payload<Stage> = `(() => { const rgba = ${PAGE_RGBA}, shade = ${SHADE};
  const el = (id) => document.getElementById(id), cs = (e) => e && getComputedStyle(e), stage = document.querySelector(".stage"), st = cs(stage);
  const page = cs(el("pr-page")), m = el("pr-page-measure"), mc = cs(m), b = m && m.getBoundingClientRect(), vp = el("map-viewport");
  return { page: page && [page.display, page.overflowX, page.overflowY], measure: mc && [mc.visibility, mc.display, mc.position, b.left + b.width],
    pad: [st.paddingTop, st.paddingRight, st.paddingBottom, st.paddingLeft].map(parseFloat),
    reserve: ["--reserve-top", "--reserve-right", "--reserve-bottom"].map((p) => parseFloat(stage.style.getPropertyValue(p))),
    shadow: shade(cs(el("sheet")).boxShadow), vp: vp && [vp.classList.contains("zoomable"), cs(vp).touchAction], origin: el("map") && cs(el("map")).transformOrigin };
})()`;

const stageFaults = (s: Stage): string[] =>
  [
    JSON.stringify(s.page) === JSON.stringify(["none", "hidden", "hidden"]) || "the hidden page face gone, and clipped",
    (s.measure?.[0] === "hidden" &&
      s.measure[1] === "block" &&
      s.measure[2] === "absolute" &&
      (s.measure[3] as number) <= 0) ||
      "the measure box laid out, invisible, out of flow and off screen",
    (s.reserve.every((r) => r > 0) && s.reserve.every((r, i) => Math.abs(s.pad[i]! - r) < 0.5) && s.pad[3] === 0) ||
      "the stage reserves the chrome",
    (!!s.shadow &&
      s.shadow.geometry === "0px 18px 60px 0px" &&
      nearRgba(s.shadow.colour, tokenRgba("--chart-ink", 0.55))) ||
      "the sheet at the stage depth",
    (s.vp?.[0] === true && s.vp[1] === "none") || "the gesture box zoomable, touch-action none",
    s.origin === "0px 0px" || "the transform target pivots top left",
  ].filter((f): f is string => f !== true);

export async function pr38BoundDress({ evaluate, check }: SuiteContext): Promise<void> {
  const slip = await evaluate(SLIP);
  const stage = await evaluate(STAGE);
  const wrong = [...slipFaults(slip), ...stageFaults(stage)];
  check(
    "PR38 bound, the room at rest as dressed: the intro gone and the bound line shown, the contents in the kit's row (plain list, small-caps numerals right in their 2.4rem in ink-brown, the entries in annals ink), the turned row gold with its numeral dark, the thumbnails two to a row, the page face gone and clipped, the measure box laid out but invisible, out of flow and off screen, the stage reserving the chrome, the sheet at the stage depth, the gesture box zoomable with touch-action none, its target pivoting top left",
    wrong.length === 0,
    JSON.stringify({ wrong, slip, stage }),
  );
}
