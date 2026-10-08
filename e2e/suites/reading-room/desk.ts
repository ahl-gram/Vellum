import type { SuiteContext } from "../../types.ts";
import { GOVERNING_BUDGET, stripRead, WIDE_WORST } from "./reads.ts";
import type { Room, Strip } from "./reads.ts";

export async function rr31StripStands(
  { evaluate, check, sleep }: SuiteContext,
  deskRest: Strip | null,
  room: Room,
): Promise<void> {
  await evaluate(`(()=>{window.scrollTo(0,document.documentElement.scrollHeight);return null;})()`);
  await sleep(200);
  const afterScroll = await evaluate(stripRead);
  check(
    "RR31 at 1440x900 the strip stands on the viewport's bottom edge and a chart room has no page scroll to leave it by (#463, ruling 6)",
    !!afterScroll && afterScroll.bottom === 0 && afterScroll.position === "fixed" && room.page <= room.vh,
    JSON.stringify({ rest: deskRest, stuck: afterScroll, room }),
  );
}

export async function rr35GoverningBudget({ evaluate, check, sleep }: SuiteContext, deskRest: Strip | null) {
  // BOTH halves at the governing width: deskRest alone is the chronicle half's short last annal, which reads 100 at every width and cannot exceed the budget; the survey half carries the long prose and can.
  await evaluate(
    `(()=>{const r=document.querySelector(".rf-range");r.value=r.min;r.dispatchEvent(new Event("input",{bubbles:true}));return null;})()`,
  );
  await sleep(150);
  const deskSurvey = await evaluate(stripRead);
  await evaluate(
    `(()=>{const r=document.querySelector(".rf-range");r.value=r.max;r.dispatchEvent(new Event("input",{bubbles:true}));return null;})()`,
  );
  await sleep(150);
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
  return deskSurvey;
}

export async function rr37Envelope(
  { evaluate, send, check, sleep }: SuiteContext,
  deskSurvey: Strip | null,
): Promise<void> {
  // The SURVEY half carries the long prose (its day rows run to ~153 chars against an annal's ~105), so the bar is driven there first: the chronicle half's short last annal reports 100 at every width and the envelope passes vacuously.
  await evaluate(
    `(()=>{const r=document.querySelector(".rf-range");r.value=r.min;r.dispatchEvent(new Event("input",{bubbles:true}));return null;})()`,
  );
  await sleep(120);
  const byWidth: { w: number; h: number | null; told: string | null; gutter: string | undefined | null }[] = [];
  for (const w of [1024, 900, 768]) {
    await send("Emulation.setDeviceMetricsOverride", { width: w, height: 900, deviceScaleFactor: 1, mobile: false });
    await sleep(250);
    const s = await evaluate(stripRead);
    byWidth.push({ w, h: s && s.h, told: s && s.toldDisplay, gutter: s && s.gutter });
  }
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await sleep(200);
  check(
    `RR37 and it stays within the ${WIDE_WORST}px envelope across the widths: the told row stands at 1024, and at 900 and 768 the strip is the 1024 page's, the told row standing and the height the same (#462 ruling 6; the 1024 floor, Alex, 2026-10-06, Issue #762)`,
    byWidth.length === 3 &&
      byWidth.every((r) => r.h! > 0 && r.h! <= WIDE_WORST) &&
      byWidth.every((r) => r.told === "flex" && Math.abs(r.h! - byWidth[0]!.h!) <= 0.5) &&
      // The witness, same half: the survey row wrapped at 1024 must cost more than it did on one line at 1440, or the envelope bounds nothing.
      byWidth[0]!.h! > deskSurvey!.h,
    JSON.stringify({ byWidth, envelope: WIDE_WORST, budget: GOVERNING_BUDGET }),
  );
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
