// The Ribbon's dress at rest on seed 42's scroll (Issue #779 part 2g): the stage, the scroll seated as the sheet's face, the journey row, the itinerary's rows in the text's own dress, and the legend seated beside the written folio.
import { nearRgba, PAGE_RGBA, SHADE, tokenRgba } from "../../support/pixel.ts";
import { makeSettle } from "../../support/settle.ts";
import type { Payload } from "../../types.ts";
import type { RibbonKit } from "./kit.ts";

type Box = { l: number; t: number; r: number; b: number };
type Dress = {
  pad: number[];
  reserve: number[];
  shadow: { colour: number[]; geometry: string } | null;
  plate: number[];
  sheet: number[];
  ratio: number[];
  vp: [boolean, string];
  origin: string;
  row: string[];
  lean: (string | number[])[] | null;
  marks: string[];
  selects: string[][];
  option: number[][] | null;
  lines: Box[];
  legend: Box;
  moving: boolean;
};
const DRESS: Payload<Dress> = `(() => { const rgba = ${PAGE_RGBA}, shade = ${SHADE}, id = (s) => document.getElementById(s), cs = (e) => getComputedStyle(e), stage = document.querySelector(".stage"), st = cs(stage);
  const box = (r) => ({ l: r.left, t: r.top, r: r.right, b: r.bottom }), rect = (e) => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; }, p = id("rb-plate"), s = id("sheet").getBoundingClientRect();
  const lean = document.querySelector("#rb-itinerary .lean"), num = document.querySelector("#rb-itinerary .cr-num"), o = id("rb-from").options[0], range = document.createRange();
  const li = document.createElement("li"), span = document.createElement("span"), em = document.createElement("em"); li.className = "summit"; span.className = "cr-text"; em.textContent = "x";
  span.append(em); li.append(span); id("rb-itinerary").append(li); const summit = getComputedStyle(em, "::before").content; li.remove();
  const legend = document.querySelector(".legend");
  return { pad: [st.paddingTop, st.paddingRight, st.paddingBottom, st.paddingLeft].map(parseFloat), reserve: ["--reserve-top", "--reserve-right", "--reserve-bottom"].map((r) => parseFloat(stage.style.getPropertyValue(r))),
    shadow: shade(cs(id("sheet")).boxShadow), plate: rect(p), sheet: rect(id("sheet")), ratio: [s.width / s.height, p.naturalWidth / p.naturalHeight],
    vp: [id("map-viewport").classList.contains("zoomable"), cs(id("map-viewport")).touchAction], origin: cs(id("map")).transformOrigin,
    row: [cs(document.querySelector(".folio-controls")).flexWrap, cs(id("rb-journey")).display],
    lean: lean && [cs(lean).appearance, cs(lean).backgroundImage, rgba(cs(lean).backgroundColor), cs(lean).borderTopWidth], marks: [getComputedStyle(num, "::after").content, summit],
    selects: ["rb-from", "rb-to"].map((s) => [cs(id(s)).appearance, cs(id(s)).width]), option: o && [rgba(cs(o).color), rgba(cs(o).backgroundColor)],
    lines: [...document.querySelectorAll(".corner.bl.folio > p")].filter((e) => e.textContent.trim() !== "").map((e) => { range.selectNodeContents(e); return box(range.getBoundingClientRect()); }),
    legend: box(legend.getBoundingClientRect()), moving: !legend.getAnimations().every((a) => a.playState === "finished") };
})()`;
const meets = (a: Box, b: Box): boolean => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
const near = (a: number[], b: number[]) => a.every((v, i) => Math.abs(v - b[i]!) <= 0.5);

const dressFaults = (d: Dress, rem: number): string[] =>
  [
    (d.reserve.every((r) => r > 0) && d.reserve.every((r, i) => Math.abs(d.pad[i]! - r) < 0.5) && d.pad[3] === 0) ||
      "the stage reserves the chrome",
    (!!d.shadow &&
      d.shadow.geometry === "0px 18px 60px 0px" &&
      nearRgba(d.shadow.colour, tokenRgba("--chart-ink", 0.55))) ||
      "the sheet at the stage depth",
    (near(d.plate, d.sheet) && Math.abs(d.ratio[0]! / d.ratio[1]! - 1) < 0.005) ||
      "the scroll filling the sheet at its own proportion",
    (d.vp[0] && d.vp[1] === "none" && d.origin === "0px 0px") ||
      "the gesture box zoomable, touch-action none, its target pivoting top left",
    JSON.stringify(d.row) === JSON.stringify(["wrap", "contents"]) ||
      "the journey row wraps, the journey its selects' own row",
    (!!d.lean &&
      d.lean[0] === "none" &&
      d.lean[1] === "none" &&
      (d.lean[2] as number[])[3] === 0 &&
      d.lean[3] === "0px") ||
      "a row's lean in the text's own dress",
    JSON.stringify(d.marks) === JSON.stringify(['" lg"', '"△ "']) || "the league mark and the summit's triangle",
    d.selects.every(([a, w]) => a === "none" && Math.abs(parseFloat(w!) - 9.2 * rem) < 0.5) ||
      "the selects in the kit's dress at the Ribbon's 9.2rem",
    (!!d.option &&
      nearRgba(d.option[0], tokenRgba("--ink-dark")) &&
      nearRgba(d.option[1], tokenRgba("--parchment-panel"))) ||
      "the options ink-dark on the panel",
    (d.lines.length >= 2 && d.lines.every((l) => !meets(l, d.legend))) ||
      "the legend clear of the folio's written lines",
  ].filter((f): f is string => f !== true);

export async function rb12Dress(k: RibbonKit): Promise<void> {
  const { evaluate, check, sleep, opened, send } = k;
  await opened("seed 42, for its dress");
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 1 });
  const d = await makeSettle({ evaluate, sleep })(
    DRESS,
    (x, last) => !x.moving && !!last && JSON.stringify(x.legend) === JSON.stringify(last.legend),
    "ribbon-dress-still",
  );
  const rem = await evaluate<number>(`parseFloat(getComputedStyle(document.documentElement).fontSize)`);
  // A refit recomputes the seat from the folio as it stands, so a seat taken before the folio was written moves here.
  const seat = await evaluate<string[]>(
    `(() => { const l = document.querySelector(".legend"), before = l.style.left; window.dispatchEvent(new Event("resize")); return [before, l.style.left]; })()`,
  );
  const wrong = [...dressFaults(d, rem), ...(seat[0] === seat[1] ? [] : ["a fresh refit moves the legend"])];
  check(
    "RB12 the Ribbon at rest as dressed: the stage reserving the chrome, the sheet at the stage depth, the scroll filling it at its own proportion, the gesture box zoomable with touch-action none, the journey row wrapping with the journey its selects' own row, the rows' leans in the text's dress with their league marks and summit triangles, the selects in the kit's dress at 9.2rem with their options ink-dark on the panel, and the legend seated clear of the written folio",
    wrong.length === 0,
    JSON.stringify({ wrong, d, seat }),
  );
}
