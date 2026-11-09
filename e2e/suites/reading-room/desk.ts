import type { Payload, SuiteContext } from "../../types.ts";
import { GOVERNING_BUDGET, stripRead } from "./reads.ts";
import type { Room, Strip } from "./reads.ts";

export async function rr31StripStands(
  { evaluate, check }: SuiteContext,
  deskRest: Strip | null,
  room: Room,
): Promise<void> {
  await evaluate(`(()=>{window.scrollTo(0,document.documentElement.scrollHeight);return null;})()`);
  const afterScroll = await evaluate(stripRead);
  check(
    "RR31 at 1440x900 the strip stands on the viewport's bottom edge and a chart room has no page scroll to leave it by (#463, ruling 6)",
    !!afterScroll && afterScroll.bottom === 0 && afterScroll.position === "fixed" && room.page <= room.vh,
    JSON.stringify({ rest: deskRest, stuck: afterScroll, room }),
  );
}

export async function rr35GoverningBudget({ evaluate, check }: SuiteContext, deskRest: Strip | null): Promise<void> {
  // BOTH halves at the governing width: deskRest alone is the chronicle half's short last annal, which reads 100 at every width and cannot exceed the budget; the survey half carries the long prose and can.
  await evaluate(
    `(()=>{const r=document.querySelector(".rf-range");r.value=r.min;r.dispatchEvent(new Event("input",{bubbles:true}));return null;})()`,
  );
  const deskSurvey = await evaluate(stripRead);
  await evaluate(
    `(()=>{const r=document.querySelector(".rf-range");r.value=r.max;r.dispatchEvent(new Event("input",{bubbles:true}));return null;})()`,
  );
  const deskChron = await evaluate(stripRead);
  check(
    `RR35 at the governing 1440x900 the strip costs no more than ${GOVERNING_BUDGET}px, in EITHER half (#442, re-pinned for the bottom strip at #463)`,
    !!deskSurvey &&
      !!deskChron &&
      deskSurvey.h > 0 &&
      deskSurvey.h <= GOVERNING_BUDGET &&
      deskChron.h > 0 &&
      deskChron.h <= GOVERNING_BUDGET &&
      /^day \d+$/.test(deskSurvey.gutter || "") &&
      /^\d+$/.test(deskChron.gutter || ""),
    JSON.stringify({ survey: deskSurvey, chronicle: deskChron, budget: GOVERNING_BUDGET, rest: deskRest }),
  );
}

const ROOM: Payload<Room> = `(() => { const box = (s) => { const e = document.querySelector(s); return e ? e.getBoundingClientRect() : { width: 0, height: 0, top: 0, bottom: 0 }; };
  const r = box(".rf-chart svg[data-vellum-style]"), b = box("#sheet"), strip = box(".strip"), tr = box(".corner.tr");
  return { page: document.documentElement.scrollHeight, vh: window.innerHeight, chartW: Math.round(r.width), chartH: Math.round(r.height), ratio: r.width ? r.height / r.width : 0,
    fillsSheet: Math.abs(r.width - b.width) < 1 && Math.abs(r.height - b.height) < 1, topClear: Math.round(r.top - tr.bottom), bottomClear: Math.round(strip.top - r.bottom) }; })()`;

// The governing 1440x900 viewport's reads, in one step: a part the room never seated fails these by name rather than stopping the suite.
export async function rrDeskReads(ctx: SuiteContext): Promise<void> {
  const deskRest = await ctx.evaluate(stripRead);
  const room = await ctx.evaluate(ROOM);
  await rr31StripStands(ctx, deskRest, room);
  await rr35GoverningBudget(ctx, deskRest);
  // Wiring, not a claim: the bar is left on the survey half, where the desk's later reads (RR39, RR41, RR29) were measured.
  await ctx.evaluate<null>(
    `(()=>{const r=document.querySelector(".rf-range");r.value=r.min;r.dispatchEvent(new Event("input",{bubbles:true}));return null;})()`,
  );
  rr36ChartFills(ctx, room);
}

export function rr36ChartFills({ check }: SuiteContext, room: Room): void {
  // The chart does not shrink: pinned as the COLUMN plus the source aspect rather than a height constant, because the rect is the border box and the chart's 1px hairline puts it 2px above the ruling's 1100x849 (measured 2026-08-23 at 1440x900: 1100x851); a rule that shrank, cropped or scaled the chart moves one of these two, the hairline moves neither.
  const SOURCE_RATIO = 1158 / 1500;
  check(
    "RR36 the chart fills its fitted sheet at its source aspect and clears the folio above and the strip below by room.ts's 14px (#442; the chart room's fit since #463)",
    room.fillsSheet && room.topClear >= 14 && room.bottomClear >= 14 && Math.abs(room.ratio - SOURCE_RATIO) < 0.005,
    JSON.stringify({ ...room, sourceRatio: SOURCE_RATIO }),
  );
}
