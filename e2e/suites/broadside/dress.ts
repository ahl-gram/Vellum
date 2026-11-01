// The Explorer at rest as dressed (Issue #779 part 2h): the stage's reserves, the sheet's depth, the fitted chart, the folio's written lines and the legend's seat.
import { PAGE_RGBA, SHADE } from "../../support/pixel.ts";
import { makeSettle } from "../../support/settle.ts";
import { clearMetrics } from "../print-room/kit.ts";
import { LEGEND_RESEAT, reseatKept } from "../print-room/proof.ts";
import type { Payload } from "../../types.ts";
import type { BroadsideKit } from "./kit.ts";

type Box = { l: number; t: number; r: number; b: number };
type Dress = {
  pad: number[];
  reserve: number[];
  sheetShadow: string;
  tokenShadow: string;
  shade: { colour: number[]; geometry: string } | null;
  zoomable: boolean;
  touchAction: string;
  origin: string;
  svg: number[] | null;
  map: number[];
  folioText: (string | null)[];
  want: string[];
  lines: Box[];
  legend: Box;
  moving: boolean;
};
const DRESS: Payload<Dress> = `(() => { const rgba = ${PAGE_RGBA}, shade = ${SHADE}, id = (s) => document.getElementById(s), cs = (e) => getComputedStyle(e);
  const stage = document.querySelector(".stage"), st = cs(stage), legend = document.querySelector(".legend"), range = document.createRange();
  const probe = document.createElement("div"); probe.style.boxShadow = "var(--stage-shadow)"; document.body.appendChild(probe);
  const tokenShadow = cs(probe).boxShadow; probe.remove();
  const rect = (e) => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; };
  const svg = document.querySelector("#map svg[data-vellum-style]");
  const run = window.__vellumRunInline({ kind: "draw", seed: 42, overrides: {}, render: { style: "antique", widthPx: 1500, legend: true } });
  const y = /in the year .+$/.exec(run.subtitle);
  return { pad: [st.paddingTop, st.paddingRight, st.paddingBottom, st.paddingLeft].map(parseFloat),
    reserve: ["--reserve-top", "--reserve-right", "--reserve-bottom"].map((r) => parseFloat(stage.style.getPropertyValue(r))),
    sheetShadow: cs(id("sheet")).boxShadow, tokenShadow, shade: shade(cs(id("sheet")).boxShadow),
    zoomable: id("map-viewport").classList.contains("zoomable"), touchAction: cs(id("map-viewport")).touchAction,
    origin: cs(id("map")).transformOrigin, svg: svg ? rect(svg) : null, map: rect(id("map")),
    folioText: [id("folio-title").textContent, id("folio-sub").textContent],
    want: [run.title + " · Chart № 42", y ? "surveyed " + y[0] : run.subtitle],
    lines: [...document.querySelectorAll(".corner.bl.folio > p")].filter((e) => e.textContent.trim() !== "").map((e) => { range.selectNodeContents(e); return { l: range.getBoundingClientRect().left, t: range.getBoundingClientRect().top, r: range.getBoundingClientRect().right, b: range.getBoundingClientRect().bottom }; }),
    legend: { l: legend.getBoundingClientRect().left, t: legend.getBoundingClientRect().top, r: legend.getBoundingClientRect().right, b: legend.getBoundingClientRect().bottom },
    moving: !legend.getAnimations().every((a) => a.playState === "finished") };
})()`;

const meets = (a: Box, b: Box): boolean => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
const near = (a: number[] | null, b: number[]): boolean => !!a && a.every((v, i) => Math.abs(v - b[i]!) <= 0.5);

const dressFaults = (d: Dress): string[] =>
  [
    (d.reserve.length === 3 &&
      d.reserve.every((r) => r > 0) &&
      d.reserve.every((r, i) => Math.abs(d.pad[i]! - r) < 0.5) &&
      d.pad[3] === 0) ||
      "the stage reserving the chrome as its padding",
    (d.sheetShadow === d.tokenShadow && d.sheetShadow !== "none" && !!d.shade) ||
      "the sheet at the stage depth, the token's",
    (d.zoomable && d.touchAction === "none") || "the gesture box zoomable with touch-action none",
    d.origin === "0px 0px" || "the transform target pivoting top left",
    near(d.svg, d.map) || "the chart filling its fitted box",
    JSON.stringify(d.folioText) === JSON.stringify(d.want) ||
      "the folio's title and survey lines written from the drawn world",
    (d.lines.length >= 2 && d.lines.every((l) => !meets(l, d.legend))) ||
      "the legend clear of the folio's written lines",
  ].filter((f): f is string => f !== true);

export async function br12Dress(k: BroadsideKit): Promise<void> {
  const { evaluate, check, sleep, send, goto, EXP } = k;
  await clearMetrics({ evaluate, send, sleep }, 1280, 800);
  await goto(EXP + "#seed=42&style=antique", "broadside-dress");
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 1 });
  const d = await makeSettle({ evaluate, sleep })(
    DRESS,
    (x, last) => !x.moving && !!last && JSON.stringify(x.legend) === JSON.stringify(last.legend),
    "broadside-dress-still",
  );
  const seat = await evaluate(LEGEND_RESEAT);
  const wrong = [
    ...dressFaults(d),
    ...(reseatKept(seat) ? [] : ["a fresh refit leaves a planted seat or moves the legend"]),
  ];
  check(
    "BR12 the Explorer at rest as dressed: the stage's padding equal to the reserves the fit wrote, the sheet at the stage depth (the token's), the gesture box zoomable with touch-action none, the transform target pivoting top left, the chart filling its fitted box, the folio's title and survey lines written from the drawn world, and the legend seated clear of the written folio where a fresh refit leaves it",
    wrong.length === 0,
    JSON.stringify({ wrong, d, seat }),
  );
}

// 2026-11-01: ui-design.md's floor for a field or a select the reader types into, ruled to cover the slip (Issue #1140 comment 6551936310).
const FIELD_FLOOR_PX = 16;
// 2026-11-01: the dropdown boxes were 31.03 px at 15.2 px type and are 31.06 px at 16 px (Mac, 1280 by 800); the ruling keeps them the same height, and 0.22rem of padding reads 32.0 px, so 31.5 sits between with 0.44 px of headroom (Issue #1140).
const DROPDOWN_MAX_PX = 31.5;
const NAMED = ["type", "band", "style", "theme", "place"];
type Field = { id: string; tag: string; px: number; h: number; shown: boolean };
const FIELDS: Payload<Field[]> =
  `[...document.querySelectorAll("#broadside select, #broadside input:not([type=range],[type=checkbox],[type=radio],[type=hidden])")].map((e)=>{const r=e.getBoundingClientRect();return{id:e.id,tag:e.tagName,px:parseFloat(getComputedStyle(e).fontSize),h:r.height,shown:r.width>0};})`;

export async function br21Fields({ evaluate, check }: BroadsideKit): Promise<void> {
  const fields = await evaluate(FIELDS);
  check(
    "BR21 every field the reader types into on the Broadside (the four dropdowns, the shape box and any added) is set at 16 px or more, and a dropdown's box stays within 31.5 px tall (Issue #1140)",
    NAMED.every((id) => fields.some((f) => f.id === id && f.shown)) &&
      fields.every((f) => f.px >= FIELD_FLOOR_PX && (f.tag !== "SELECT" || f.h <= DROPDOWN_MAX_PX)),
    JSON.stringify(fields),
  );
}
