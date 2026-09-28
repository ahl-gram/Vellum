// Reading Room e2e (RR0-RR34; #221 plus #318 colophon dice, #418 pre-arm window, #402 prospect stage and #442 the sticky strip): self-contained (navigates itself, scoped no-4xx and console-error delta); there is deliberately NO Explorer entry point (decision 3 on #221), so checks navigate with constructed hashes, and arrival is AT REST on every path.
import type { SuiteContext } from "./types.ts";
import { readingRoomKit } from "./reading-room/kit.ts";
import { stripRead } from "./reading-room/reads.ts";
import { rr0Boots, rr4AtRest, rr26BareVisit, rr29Play } from "./reading-room/arrival.ts";
import { rr31StripStands, rr35GoverningBudget, rr37Envelope, rr36ChartFills } from "./reading-room/desk.ts";
import { rr6Survey, rr7Year, rr9Today, rr10CrossLinks } from "./reading-room/addresses.ts";
import { rr16Colophon, rr17CounterRead, rr18Park, rr20Superseded, rr21Dice, rr22MidPlay } from "./reading-room/colophon.ts";
import { rr23Usurped, rr24BeforeArm, rr25TearDown } from "./reading-room/arm.ts";
import { rr34bPhone, rr11bScrubHandles } from "./reading-room/phone.ts";
import { rr12Clean, rr14Fallback } from "./reading-room/fallback.ts";

export async function run(ctx: SuiteContext): Promise<void> {
  const { evaluate, send, shoot, sleep, consoleErrors, http4xx, PORT } = ctx;
  const k = readingRoomKit(ctx);
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/reading-room/#seed=42&style=antique&legend=1` });
  const rrErrBase = consoleErrors.length;
  const rrHttpBase = http4xx.length;
  await rr0Boots(k);
  await rr4AtRest(ctx);
  // Seed 42's beats, measured 2026-08-22: foundings 451/552/597 (i=0/4/6), twin ruins 1039 (i=19/22; the LAST told holds the stage), present 1059. This hash carries no live key, so it is a PLAIN visit and opens with no plate (#442 reversing #402); RR29 shows Play bringing one.
  await rr26BareVisit(k);
  // The harness window is 1280x2400, where this page has only a few hundred px of scroll and the strip could never reach the top, so this reading pins #442's governing 1440x900 viewport; mobile:false because mobile:true changes layout semantics as well as size.
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await sleep(200);
  const deskRest = await evaluate(stripRead);
  const room = await evaluate<{ page: number; vh: number; chartW: number; chartH: number; ratio: number; fillsSheet: boolean; topClear: number; bottomClear: number }>(`(()=>{const s=document.querySelector(".rf-chart svg[data-vellum-style]");const r=s?s.getBoundingClientRect():{width:0,height:0,top:0,bottom:0};const b=document.getElementById("sheet").getBoundingClientRect();const strip=document.querySelector(".strip").getBoundingClientRect();const tr=document.querySelector(".corner.tr").getBoundingClientRect();return{page:document.documentElement.scrollHeight,vh:window.innerHeight,chartW:Math.round(r.width),chartH:Math.round(r.height),ratio:r.width?r.height/r.width:0,fillsSheet:Math.abs(r.width-b.width)<1&&Math.abs(r.height-b.height)<1,topClear:Math.round(r.top-tr.bottom),bottomClear:Math.round(strip.top-r.bottom)};})()`);
  await rr31StripStands(ctx, deskRest, room);
  const deskSurvey = await rr35GoverningBudget(ctx, deskRest);
  await rr37Envelope(ctx, deskSurvey);
  rr36ChartFills(ctx, room);
  await evaluate(`(()=>{window.scrollTo(0,0);return null;})()`);
  await send("Emulation.clearDeviceMetricsOverride");
  await sleep(200);
  await rr29Play(k);
  await rr6Survey(k);
  await rr7Year(k);
  await shoot("reading-room.png");
  await rr9Today(k);
  await rr16Colophon(ctx);
  await rr17CounterRead(k);
  await rr18Park(ctx);
  await rr20Superseded(ctx);
  await rr21Dice(ctx);
  await rr22MidPlay(ctx);
  await rr23Usurped(k);
  await rr24BeforeArm(k);
  await rr25TearDown(k);
  await rr10CrossLinks(ctx);
  await rr34bPhone(k, ctx);
  await rr11bScrubHandles(ctx);
  rr12Clean(ctx, rrErrBase, rrHttpBase);
  await rr14Fallback(ctx);
}
