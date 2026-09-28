import type { SuiteContext } from "../types.ts";
import { GOVERNING_BUDGET, stripRead, WIDE_WORST } from "./reads.ts";
import type { Room, Strip } from "./reads.ts";

export async function rr31StripStands({ evaluate, check, sleep }: SuiteContext, deskRest: Strip | null, room: Room): Promise<void> {
  await evaluate(`(()=>{window.scrollTo(0,document.documentElement.scrollHeight);return null;})()`);
  await sleep(200);
  const afterScroll = await evaluate(stripRead);
  check(
    "RR31 at 1440x900 the strip stands on the viewport's bottom edge and a chart room has no page scroll to leave it by (#463, ruling 6)",
    !!afterScroll && afterScroll.bottom === 0 && afterScroll.position === "fixed" &&
      !!room && room.page <= room.vh, // eslint-disable-line @typescript-eslint/no-unnecessary-condition
    JSON.stringify({ rest: deskRest, stuck: afterScroll, room }),
  );
}

export async function rr35GoverningBudget({ evaluate, check, sleep }: SuiteContext, deskRest: Strip | null) {
  // BOTH halves at the governing width: deskRest alone is the chronicle half's short last annal, which reads 100 at every width and cannot exceed the budget; the survey half carries the long prose and can.
  await evaluate(`(()=>{const r=document.querySelector(".rf-range");r.value=r.min;r.dispatchEvent(new Event("input",{bubbles:true}));return null;})()`);
  await sleep(150);
  const deskSurvey = await evaluate(stripRead);
  await evaluate(`(()=>{const r=document.querySelector(".rf-range");r.value=r.max;r.dispatchEvent(new Event("input",{bubbles:true}));return null;})()`);
  await sleep(150);
  const deskChron = await evaluate(stripRead);
  check(
    `RR35 at the governing 1440x900 the strip costs no more than ${GOVERNING_BUDGET}px, in EITHER half (#442, re-pinned for the bottom strip at #463)`,
    !!deskSurvey && !!deskChron &&
      deskSurvey.h > 0 && deskSurvey.h <= GOVERNING_BUDGET &&
      deskChron.h > 0 && deskChron.h <= GOVERNING_BUDGET &&
      /^day \d+$/.test(deskSurvey.gutter || "") && /^\d+$/.test(deskChron.gutter || ""),
    JSON.stringify({ survey: deskSurvey, chronicle: deskChron, budget: GOVERNING_BUDGET, rest: deskRest }),
  );
  return deskSurvey;
}

export async function rr37Envelope({ evaluate, send, check, sleep }: SuiteContext, deskSurvey: Strip | null): Promise<void> {
  // The SURVEY half carries the long prose (its day rows run to ~153 chars against an annal's ~105), so the bar is driven there first: the chronicle half's short last annal reports 100 at every width and the envelope passes vacuously.
  await evaluate(`(()=>{const r=document.querySelector(".rf-range");r.value=r.min;r.dispatchEvent(new Event("input",{bubbles:true}));return null;})()`);
  await sleep(120);
  const byWidth = [];
  for (const w of [1024, 900, 768]) {
    await send("Emulation.setDeviceMetricsOverride", { width: w, height: 900, deviceScaleFactor: 1, mobile: false });
    await sleep(250);
    const s = await evaluate(stripRead);
    byWidth.push({ w, h: s && s.h, told: s && s.toldDisplay, gutter: s && s.gutter });
  }
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await sleep(200);
  check(
    `RR37 and it stays within the ${WIDE_WORST}px envelope across the widths: the told row stands at 1024 and drops at 900 and below (#462 ruling 6, the phone rule is inclusive at 900)`,
    byWidth.length === 3 &&
      // @ts-expect-error a width whose strip was never seated reads its height as null, and null > 0 is false, so RR37 reads false and reds by name
      byWidth.every((r) => r.h > 0 &&
        // @ts-expect-error the same null reads as 0 here, which passes this bound, but the clause before it has already read false for it, so RR37 still reds by name
        r.h <= WIDE_WORST) &&
      byWidth[0]!.told === "flex" && byWidth[1]!.told === "none" && byWidth[2]!.told === "none" &&
      // The witness, same half: the survey row wrapped at 1024 must cost more than it did on one line at 1440, or the envelope bounds nothing.
      // @ts-expect-error a width whose strip was never seated reads its height as null, which the every clause above has already read false for, so RR37 reds by name before this clause runs
      byWidth[0]!.h >
        // @ts-expect-error a strip the governing width never seated leaves deskSurvey null, which RR35 has already failed; a null throws here, outside any step, and the runner reds the whole suite as stopped early
        deskSurvey.h,
    JSON.stringify({ byWidth, envelope: WIDE_WORST, budget: GOVERNING_BUDGET }),
  );
}

export function rr36ChartFills({ check }: SuiteContext, room: Room): void {
  // The chart does not shrink: pinned as the COLUMN plus the source aspect rather than a height constant, because the rect is the border box and the chart's 1px hairline puts it 2px above the ruling's 1100x849 (measured 2026-08-23 at 1440x900: 1100x851); a rule that shrank, cropped or scaled the chart moves one of these two, the hairline moves neither.
  const SOURCE_RATIO = 1158 / 1500;
  check(
    "RR36 the chart fills its fitted sheet at its source aspect and clears the folio above and the strip below by room.ts's 14px (#442; the chart room's fit since #463)",
    !!room && room.fillsSheet && room.topClear >= 14 && room.bottomClear >= 14 && // eslint-disable-line @typescript-eslint/no-unnecessary-condition
      Math.abs(room.ratio - SOURCE_RATIO) < 0.005,
    JSON.stringify({ ...room, sourceRatio: SOURCE_RATIO }),
  );
}
