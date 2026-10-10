// The Reading Room at rest, as the frame's seats and its sheet leave it (Issue #779 part 2g): where each part stands, the stage's reserve and depth, the strip's wrapper, the journal's rows and the told row in each half's voice.
import { makeSettle } from "../../support/settle.ts";
import { nearRgba, PAGE_RGBA, SHADE, tokenRgba } from "../../support/pixel.ts";
import type { Payload, SuiteContext } from "../../types.ts";

const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);
const faults = (parts: (true | string)[]): string[] => parts.filter((f): f is string => f !== true);
const KIDS = `((e) => e ? [...e.children].map((c) => c.tagName + (c.id ? "#" + c.id : "") + "." + [...c.classList].join(".")) : null)`;

type Seats = {
  mount: boolean;
  panel: string[] | null;
  strip: boolean;
  chart: boolean;
  status: boolean;
  dock: string[] | null;
  wells: number;
  well: (string | string[] | null)[] | null;
};
const SEATS: Payload<Seats> = `(() => { const kids = ${KIDS}, well = document.querySelectorAll(".scale-well");
  return { mount: !!document.querySelector("#rr-mount > .rf"), panel: kids(document.querySelector(".rf-ages")),
    strip: !!document.querySelector(".strip > .rf-instrument-strip"), chart: !!document.querySelector("#map-viewport > .rf-chart"),
    status: !!document.querySelector(".stage > .rf-status"), dock: kids(document.querySelector("#journal .journal-dock")),
    wells: well.length, well: well[0] ? [well[0].parentNode.className, [...well[0].children].map((c) => c.className)] : null };
})()`;

const seatFaults = (s: Seats): string[] =>
  faults([
    s.mount || "the frame's root in its mount",
    same(s.panel, ["DIV.strip", "ASIDE#journal.slip", "BUTTON.slip-tab"]) ||
      "the strip, the slip and its tab each once in the panel, in that order",
    (s.strip && s.chart && s.status) || "the bar on the strip, the chart in the gesture box, the status in the stage",
    same(s.dock, ["FIGURE.rr-prospect", "DIV.rf-log"]) || "the plate and the log in the Journal's dock",
    (s.wells === 1 && same(s.well, ["rf-instrument", ["rf-range ages-range", "scale"]])) ||
      "one well on the bar, the range above the scale",
  ]);

type Stage = {
  pad: number[];
  reserve: number[];
  shadow: { colour: number[]; geometry: string } | null;
  token: string;
  own: string;
  vp: [boolean, string] | null;
  svg: string | null;
  well: string[] | null;
  scale: string[] | null;
};
const STAGE: Payload<Stage> = `(() => { const rgba = ${PAGE_RGBA}, shade = ${SHADE};
  const cs = (s) => { const e = document.querySelector(s); return e && getComputedStyle(e); }, stage = document.querySelector(".stage"), st = getComputedStyle(stage);
  const probe = document.createElement("div"); probe.style.boxShadow = "var(--stage-shadow)"; document.body.append(probe); const token = getComputedStyle(probe).boxShadow; probe.remove();
  const own = cs("#sheet").boxShadow, vp = document.getElementById("map-viewport"), well = cs(".scale-well"), scale = cs(".scale");
  return { pad: [st.paddingTop, st.paddingRight, st.paddingBottom, st.paddingLeft].map(parseFloat),
    reserve: ["--reserve-top", "--reserve-right", "--reserve-bottom"].map((p) => parseFloat(stage.style.getPropertyValue(p))),
    shadow: shade(own), token, own, vp: vp && [vp.classList.contains("zoomable"), getComputedStyle(vp).touchAction],
    svg: cs(".rf-chart svg[data-vellum-style]") && cs(".rf-chart svg[data-vellum-style]").boxShadow,
    well: well && [well.flexGrow, well.flexShrink, well.minWidth], scale: scale && [scale.marginLeft, scale.marginRight] };
})()`;

const stageFaults = (s: Stage): string[] =>
  faults([
    (s.reserve.every((r) => r > 0) && s.reserve.every((r, i) => Math.abs(s.pad[i]! - r) < 0.5) && s.pad[3] === 0) ||
      "the stage reserves the chrome",
    (!!s.shadow && s.own === s.token) || "the sheet at the stage depth, the token's",
    (s.vp?.[0] === true && s.vp[1] === "none") || "the gesture box zoomable, touch-action none",
    s.svg === "none" || "the frame leaves the sheet's depth to the host",
    same(s.well, ["1", "1", "0px"]) || "the well grows and may shrink below the bar's width",
    same(s.scale, ["8px", "8px"]) || "the scale runs the thumb's travel",
  ]);

type Frame = {
  wrap: string[] | null;
  arrival: string[] | null;
  play: string[] | null;
  range: string | null;
  log: string[];
  annal: (string | number[])[] | null;
  day: (string | number[])[] | null;
};
const FRAME: Payload<Frame> = `(() => { const rgba = ${PAGE_RGBA}, q = (s) => document.querySelector(s), cs = (s) => q(s) && getComputedStyle(q(s));
  const wrap = cs(".rf-instrument-strip"), root = q(".rf"), had = !!root && root.classList.contains("rf-arrival");
  let arrival = null;
  if (root) { root.classList.add("rf-arrival"); arrival = [cs(".rf-instrument-strip").animationName, cs(".rf-instrument").animationName]; if (!had) root.classList.remove("rf-arrival"); }
  const annal = ".rf-log-strip li:not(.prologue):not(.annals-head)", day = ".rf-log-strip li.prologue";
  const a = cs(annal), ay = cs(annal + " .cr-year"), at = cs(annal + " .cr-text"), d = cs(day), dy = cs(day + " .cr-year"), dt = cs(day + " .cr-text");
  return { wrap: wrap && [wrap.position, wrap.transform, wrap.animationName], arrival,
    play: cs(".rf-play") && [cs(".rf-play").flexGrow, cs(".rf-play").flexShrink], range: cs(".rf-range") && cs(".rf-range").minWidth,
    log: [".rf-log", ".rf-log-strip"].flatMap((s) => (cs(s) ? [cs(s).overflowY, cs(s).maxHeight] : ["absent"])),
    annal: a && ay && at && [a.transitionProperty, ay.flexBasis, ay.textAlign, ay.fontWeight, ay.fontVariantNumeric, rgba(ay.color), rgba(at.color)],
    day: d && dy && dt && [d.borderLeftWidth, d.borderLeftStyle, rgba(d.borderLeftColor), d.paddingLeft, dt.fontStyle, rgba(dt.color), dy.fontStyle, dy.fontWeight, rgba(dy.color)] };
})()`;

const frameFaults = (f: Frame): string[] =>
  faults([
    same(f.wrap, ["static", "none", "none"]) ||
      "the strip's wrapper stands where the host seats it, untransformed, unanimated",
    same(f.arrival, ["none", "paperUnfurl"]) || "the arrival unfurls the bar, never its wrapper",
    same(f.play, ["0", "0"]) || "Play keeps its own width",
    f.range === "0px" || "the bar may shrink below its own width",
    same(f.log, ["visible", "none", "visible", "none"]) || "the log never scrolls on its own",
    (f.annal?.[0] === "opacity, transform" &&
      same(f.annal.slice(1, 5), ["57.6px", "right", "600", "tabular-nums"]) &&
      nearRgba(f.annal[5] as number[], tokenRgba("--ink-faded")) &&
      nearRgba(f.annal[6] as number[], tokenRgba("--ink-annals"))) ||
      "an annal row brightens by opacity, in the shared gutter and the annals ink",
    (same(f.day?.slice(0, 2), ["3px", "solid"]) &&
      nearRgba(f.day![2] as number[], tokenRgba("--line-tan")) &&
      f.day![3] === "11.2px" &&
      f.day![4] === "italic" &&
      nearRgba(f.day![5] as number[], tokenRgba("--ink-surveyor")) &&
      same(f.day!.slice(6, 8), ["italic", "400"]) &&
      nearRgba(f.day![8] as number[], tokenRgba("--ink-surveyor-faded"))) ||
      "a day row in the surveyor's italic, ruled at its left",
  ]);

type Told = {
  prologue: boolean;
  hidden: boolean;
  box: string[];
  text: (string | number[])[];
  year: (string | number[])[];
  gone: string;
};
const TOLD: Payload<Told | null> = `(() => { const rgba = ${PAGE_RGBA}, t = document.querySelector(".rf-told"); if (!t) return null;
  const c = getComputedStyle(t), x = getComputedStyle(t.querySelector(".cr-text")), y = getComputedStyle(t.querySelector(".cr-year"));
  const read = { prologue: t.classList.contains("prologue"), hidden: t.hidden, box: [c.display, c.position, c.maxHeight, c.overflowX, c.overflowY],
    text: [x.fontStyle, rgba(x.color)], year: [y.flexBasis, y.textAlign, y.fontWeight, rgba(y.color)] };
  const was = t.hidden; t.hidden = true; const gone = getComputedStyle(t).display; t.hidden = was;
  return { ...read, gone };
})()`;

// Wiring, not the claim: the bar is driven by its input event to reach each half's told row.
const scrubTo = (edge: "min" | "max"): string =>
  `(() => { const r = document.querySelector(".rf-range"); r.value = r.${edge}; r.dispatchEvent(new Event("input", { bubbles: true })); return true; })()`;

async function toldAt({ evaluate, sleep }: SuiteContext, edge: "min" | "max"): Promise<Told> {
  const settle = makeSettle({ evaluate, sleep });
  await evaluate<boolean>(scrubTo(edge));
  return settle(TOLD, (d) => d.prologue === (edge === "min") && !d.hidden, `reading-room-told-${edge}`);
}

const toldFaults = (day: Told, annal: Told): string[] =>
  faults([
    (day.text[0] === "italic" && nearRgba(day.text[1] as number[], tokenRgba("--parchment"))) ||
      "a day row's mirror in the surveyor's italic",
    same(annal.box, ["flex", "static", "none", "visible", "visible"]) || "the told row one row, never a scroller",
    (annal.text[0] === "normal" && nearRgba(annal.text[1] as number[], tokenRgba("--parchment-bright"))) ||
      "an annal's mirror roman, in the strip's ink",
    (same(annal.year.slice(0, 3), ["57.6px", "right", "600"]) &&
      nearRgba(annal.year[3] as number[], tokenRgba("--line-tan"))) ||
      "the told row's gutter",
    annal.gone === "none" || "a hidden told row gone",
  ]);

export async function rr39AtRest(ctx: SuiteContext): Promise<void> {
  const { evaluate, check } = ctx;
  try {
    const seats = await evaluate(SEATS);
    const stage = await evaluate(STAGE);
    const frame = await evaluate(FRAME);
    const day = await toldAt(ctx, "min");
    const annal = await toldAt(ctx, "max");
    const wrong = [...seatFaults(seats), ...stageFaults(stage), ...frameFaults(frame), ...toldFaults(day, annal)];
    check(
      "RR39 the room at rest as its seats and sheets leave it: the frame's parts each once where the room seats them, the stage reserving the chrome, the sheet at the stage depth by its token and the chart unshadowed, the gesture box zoomable, the well and the scale on the thumb's travel, the strip's wrapper unmoved and unanimated while the bar unfurls, Play and the bar sized to share the row, the log unscrolled, the journal's annal and day rows in their voices, and the told row one plain row in either half's voice, gone when hidden",
      wrong.length === 0,
      JSON.stringify({ wrong, seats, stage, frame, day, annal }),
    );
  } finally {
    await evaluate<boolean>(scrubTo("min"));
  }
}
