// The Explorer at rest as dressed (Issue #779 part 2h): the stage's reserves, the sheet's depth, the fitted chart, the folio's written lines and the legend's seat.
import { nearRgba, PAGE_RGBA, SHADE, tokenRgba, type Rgb } from "../../support/pixel.ts";
import { makeSettle } from "../../support/settle.ts";
import { clearMetrics } from "../print-room/kit.ts";
import { LEGEND_RESEAT, reseatKept } from "../print-room/proof.ts";
import type { Payload } from "../../types.ts";
import type { BroadsideKit } from "./kit.ts";
import { sendKey } from "../../support/home.ts";
import { contrast } from "../cluster/trail.ts";
import { FLOOR_PLAIN } from "../stage/stage.ts";
import { FONTS_LOADED, inkBrief, inkFaults, slipInk, type InkPiece } from "../specimen/slip-ink.ts";

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
  imprint: string | null;
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
    moving: !legend.getAnimations().every((a) => a.playState === "finished"), imprint: (id("imprint-no") || {}).textContent ?? null };
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
    d.imprint === "42" || "the printer's line naming the drawn chart",
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
    "BR12 the Explorer at rest as dressed: the stage's padding equal to the reserves the fit wrote, the sheet at the stage depth (the token's), the gesture box zoomable with touch-action none, the transform target pivoting top left, the chart filling its fitted box, the folio's title and survey lines written from the drawn world, and the legend seated clear of the written folio where a fresh refit leaves it, the printer's line naming the drawn chart's number",
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

// The bill's arms on the classes every slip wears, each read compared with the Broadside's own in the same run; an arm's other declarations leaking alone pass, and the Portfolio's slip stands for every room's, since only a shared sheet reaches them (Issue #1159).
const HEAD_ARMS: readonly (readonly [arm: string, selector: string, pseudo: string | null, property: string])[] = [
  ["head text-align", ".slip-head", null, "text-align"],
  ["head padding-top", ".slip-head", null, "padding-top"],
  ["verb display", ".slip-head .card-verb", null, "display"],
  ["verb ::before", ".slip-head .card-verb", "::before", "content"],
  ["verb ::after", ".slip-head .card-verb", "::after", "content"],
  ["title display", ".slip-head .card-title", null, "display"],
  ["title white-space", ".slip-head .card-title", null, "white-space"],
  ["where display", ".slip-head .card-where", null, "display"],
  ["where border-bottom-width", ".slip-head .card-where", null, "border-bottom-width"],
  ["where ::before", ".slip-head .card-where", "::before", "content"],
  ["where ::after", ".slip-head .card-where", "::after", "content"],
  ["fold top", ".slip-head .slip-fold", null, "top"],
  ["fold right", ".slip-head .slip-fold", null, "right"],
];

type Bill = {
  width: string;
  style: string;
  colour: number[];
  before: string;
  after: string;
  tacksInert: boolean;
  head: (string | null)[];
};
const BILL: Payload<Bill | null> = `(() => { const rgba = ${PAGE_RGBA}, s = document.querySelector("#BILLID"); if (!s) return null;
  const c = getComputedStyle(s); return { width: c.borderTopWidth, style: c.borderTopStyle, colour: rgba(c.borderTopColor), before: getComputedStyle(s, "::before").content, after: getComputedStyle(s, "::after").content, tacksInert: ["::before", "::after"].every((p) => getComputedStyle(s, p).pointerEvents === "none"), head: ${JSON.stringify(HEAD_ARMS)}.map(([, sel, pseudo, prop]) => { const e = s.querySelector(sel); return e ? getComputedStyle(e, pseudo).getPropertyValue(prop) : null; }) }; })()`;
const billOf = (id: string): Payload<Bill | null> => BILL.replace("BILLID", id);
const inkBorder = (b: Bill | null): boolean => !!b && b.width === "2px" && nearRgba(b.colour, tokenRgba("--chart-ink"));

export async function br22Bill(k: BroadsideKit): Promise<void> {
  const { evaluate, check, goto, gotoPlain, EXP, PORT } = k;
  await goto(EXP + "#seed=42&style=antique", "broadside-bill");
  const broadside = await evaluate(billOf("broadside"));
  await gotoPlain(`http://127.0.0.1:${PORT}/explorer/portfolio/`, "broadside-bill-portfolio");
  const portfolio = await evaluate(billOf("portfolio"));
  const worn = HEAD_ARMS.filter((_, i) => {
    const b = broadside?.head[i];
    const p = portfolio?.head[i];
    return !b || !p || b === p;
  }).map(([arm]) => arm);
  check(
    "BR22 the posted bill is the Broadside's alone: the Explorer's slip wears its printed border, its two tacks and every arm of its proclamation head, and the Portfolio's slip, a room under the Explorer whose slip stands for every room's, wears none of them (Issue #1159)",
    inkBorder(broadside) &&
      broadside?.style === "solid" &&
      broadside.before === '""' &&
      broadside.after === '""' &&
      broadside.tacksInert &&
      portfolio?.before === "none" &&
      portfolio.after === "none" &&
      !inkBorder(portfolio) &&
      worn.length === 0,
    JSON.stringify({ worn, broadside, portfolio }),
  );
}

type Printed = { folio: string | null; imprint: string | null; status: string | null };
const PRINTED: Payload<Printed> = `(() => { const t = (id) => (document.getElementById(id) || {}).textContent ?? null; return { folio: t("folio-title"), imprint: t("imprint-no"), status: t("status") }; })()`;
const SECOND = "7";

export async function br23Imprint(k: BroadsideKit): Promise<void> {
  const { evaluate, send, sleep, check, goto, EXP } = k;
  await goto(EXP + "#seed=42&style=antique", "broadside-imprint");
  const before = await evaluate(PRINTED);
  await evaluate(
    `(()=>{const i=document.getElementById("seed");i.value=${JSON.stringify(SECOND)};i.focus();return true;})()`,
  );
  await sendKey(send, "Enter", "Enter", 13);
  const after = await makeSettle({ evaluate, sleep })(
    PRINTED,
    (d) => !!d.folio && d.folio.endsWith(`Chart № ${SECOND}`) && d.status === "",
    "broadside-imprint-redrawn",
  );
  check(
    "BR23 the printer's line follows the chart on screen: drawn anew in place, from seed 42 to the seed 7 set in the seed field and entered, it reads 7 as the folio's title does (Issue #1159)",
    before.imprint === "42" && !!before.folio && before.folio.endsWith("Chart № 42") && after.imprint === SECOND,
    JSON.stringify({ before, after }),
  );
}

const BR24_PIECES: readonly InkPiece[] = [
  ["head", "#note-broadside .fn-head"],
  ["fold", "#broadside .slip-fold"],
];
type Head = { id: string; ink: Rgb; ground: Rgb };
const HEADS: Payload<Head[]> =
  `[...document.querySelectorAll(".fn-note")].map((n) => { const c = getComputedStyle(n.querySelector(".fn-head")).color.match(/[0-9.]+/g).map(Number), b = getComputedStyle(n).backgroundColor.match(/[0-9.]+/g).map(Number); return { id: n.id, ink: [c[0], c[1], c[2]], ground: [b[0], b[1], b[2]] }; })`;
const OPEN_NOTE: Payload<boolean> = `(() => { document.querySelector('a.fn[data-note="note-broadside"]').focus(); const n = document.getElementById("note-broadside"); return n.matches(":popover-open") && n.getClientRects().length > 0; })()`;
const SHUT_NOTE: Payload<boolean> = `(() => { document.activeElement.blur(); return !document.getElementById("note-broadside").matches(":popover-open"); })()`;

export async function br24Ink(k: BroadsideKit): Promise<void> {
  const { evaluate, send, sleep, check, goto, EXP } = k;
  await goto(EXP + "#seed=42&style=antique", "broadside-ink");
  await makeSettle({ evaluate, sleep })(FONTS_LOADED, (d) => d === "loaded", "BR24 fonts");
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 1 });
  const opened = await evaluate(OPEN_NOTE);
  const reads = await slipInk(k, BR24_PIECES, "br24-hide");
  const heads = await evaluate(HEADS);
  const shut = await evaluate(SHUT_NOTE);
  const under = reads.find((r) => r.piece === "head")?.ground ?? null;
  const faults = [
    ...(opened ? [] : ["the note of the broadside did not open on its mark's focus"]),
    ...(shut ? [] : ["the note of the broadside stayed open after its mark's blur"]),
    ...inkFaults(reads),
    ...(reads.some((r) => r.piece === "head") ? [] : ["no footnote head read"]),
    ...(reads.some((r) => r.piece === "fold") ? [] : ["no fold mark read"]),
    ...(heads.length > 0 ? [] : ["no footnote on the page"]),
    ...heads.flatMap((h) => [
      ...(nearRgba([...h.ground, 255], tokenRgba("--parchment-panel"))
        ? []
        : [`${h.id} stands on ${h.ground.join(",")}, not the panel`]),
      ...(under !== null && contrast(h.ink, under) >= FLOOR_PLAIN
        ? []
        : [`${h.id}'s head reads ${under === null ? "against no ground" : contrast(h.ink, under).toFixed(2)}`]),
    ]),
  ];
  check(
    "BR24 every footnote head on the Broadside, and the bill's fold mark, read at 4.5:1 or better against the panel: the note of the broadside opened by its mark's focus, its head and the fold mark read against the ground painted under them, and every note's head against that ground, every note standing on the panel (Issue #1160)",
    faults.length === 0,
    JSON.stringify({
      faults,
      reads: inkBrief(reads),
      heads: heads.map((h) => `${h.id} ${under === null ? "-" : contrast(h.ink, under).toFixed(2)}`),
    }),
  );
}
