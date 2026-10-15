// The desk frame (Issue #778 rulings 9 and 10): where the page boots set small to fit the screen a chart room lays out 1024 by 768 at the top of its page, the desk below it upright and the page scrolling down it sideways, every seat read in page coordinates.
import { DESK_FRAME } from "../../../src/site/shared/page-box.ts";
import { browserPinch, forgetChartTouch } from "../../support/chart-touch.ts";
import { luminance, nearRgba, sampleRow, tokenRgba } from "../../support/pixel.ts";
import { makeSettle } from "../../support/settle.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import { CHART_ROOM_FLOOR, DESK_FRAME_H, PHONE, open, rest, stageFaults } from "./stage.ts";
import type { Read } from "./stage.ts";
import { switchFaults, withStyledBoot } from "./styled-boot.ts";

const UPRIGHT = { w: 390, h: 844, laidOut: { w: 1024, h: 2217 } };
// On the desk: four pixels under the frame's foot at 768, where the deep's gradient would step, and far below it, above the upright window's foot at 2217.
const DESK_ROWS = [772, 1500];
// Points of the 844x390 screen on every room's sheet and off its slip and Press, read as screen or as layout pixels (measured 2026-10-14, Issue #778's planner probes).
const SWIPE_AT = { x: 422, y: 300 };
const PINCH_AT = { x: 422, y: 195 };
const REDUCE = [{ name: "prefers-reduced-motion", value: "reduce" }];

type Seats = {
  sy: number;
  framed: boolean;
  strip: boolean;
  sheet: number[] | null;
  slipTop: string | null;
  slipMax: string | null;
  pressFoot: string | null;
  reserve: string[] | null;
  under: boolean;
};

const SEATS: Payload<Seats> = `(() => {
  const r1 = (n) => Math.round(n * 10) / 10;
  const sy = window.scrollY;
  const s = document.getElementById("sheet").getBoundingClientRect();
  const slip = document.querySelector(".slip");
  const legend = document.querySelector(".legend");
  const frame = document.querySelector("[style*='--reserve-top']");
  return {
    sy,
    framed: document.documentElement.classList.contains(${JSON.stringify(DESK_FRAME)}),
    strip: ((e) => e !== null && e.getBoundingClientRect().height > 0)(document.querySelector(".strip")),
    sheet: s.height > 0 ? [r1(s.left), r1(s.top + sy), r1(s.width), r1(s.height)] : null,
    slipTop: slip ? slip.style.top : null,
    slipMax: slip ? slip.style.maxHeight : null,
    pressFoot: legend ? legend.style.bottom : null,
    reserve: frame ? ["--reserve-top", "--reserve-right", "--reserve-bottom"].map((p) => frame.style.getPropertyValue(p)) : null,
    under: document.body.classList.contains("stage-under"),
  };
})()`;

function seatFaults(page: string, before: Seats, after: Seats): string[] {
  const faults: string[] = [];
  const same = (name: string, a: unknown, b: unknown): void => {
    if (JSON.stringify(a) !== JSON.stringify(b))
      faults.push(`${page}: ${name} ${JSON.stringify(a)} unscrolled, ${JSON.stringify(b)} laid out again at the foot`);
  };
  same("framed", before.framed, after.framed);
  same("under", before.under, after.under);
  same("slipTop", before.slipTop, after.slipTop);
  same("slipMax", before.slipMax, after.slipMax);
  same("pressFoot", before.pressFoot, after.pressFoot);
  same("reserve", before.reserve, after.reserve);
  const off = before.sheet?.some((v, i) => Math.abs(v - (after.sheet?.[i] ?? Infinity)) > 0.5) ?? after.sheet !== null;
  if (off)
    faults.push(
      `${page}: sheet ${JSON.stringify(before.sheet)} unscrolled, ${JSON.stringify(after.sheet)} at the foot`,
    );
  return faults;
}

const medianPixel = (row: readonly [number, number, number][]): [number, number, number] =>
  [...row].sort((a, b) => luminance(a) - luminance(b))[Math.floor(row.length / 2)]!;

type Relaid = { page: string; before: Seats; after: Seats };

async function relaid(ctx: SuiteContext, page: string): Promise<Relaid> {
  await open(ctx, page, PHONE.w, PHONE.h, PHONE.laidOut, "EA7");
  // Laid out again unscrolled and again at the foot, never against the first layout, which under reduced motion the Reading Room takes with its chart folio's seat mid-transition (Issue #868); the resize is dispatched rather than made, since a metrics change under phone emulation changes the window the read compares against.
  await ctx.evaluate('(window.dispatchEvent(new Event("resize")), true)');
  await rest(ctx, PHONE.laidOut.w, PHONE.laidOut.h, `EA7 ${page} laid out again unscrolled`);
  const before = await ctx.evaluate(SEATS);
  await ctx.send("Input.synthesizeScrollGesture", {
    x: SWIPE_AT.x,
    y: SWIPE_AT.y,
    yDistance: -500,
    gestureSourceType: "touch",
    speed: 2000,
  });
  await makeSettle(ctx)<number>(
    "scrollY",
    (y, last) => y === DESK_FRAME_H - PHONE.laidOut.h && last === y,
    `EA7 ${page} a swipe reaches the frame's foot`,
  );
  await ctx.evaluate('(window.dispatchEvent(new Event("resize")), true)');
  await rest(ctx, PHONE.laidOut.w, PHONE.laidOut.h, `EA7 ${page} relaid`);
  const after = await ctx.evaluate(SEATS);
  return { page, before, after };
}

export async function ea7Scrolled(ctx: SuiteContext): Promise<void> {
  await ctx.setMobileViewport(PHONE.w, PHONE.h);
  await ctx.evaluate(forgetChartTouch);
  const rooms: Relaid[] = [];
  for (const page of CHART_ROOM_FLOOR) rooms.push(await relaid(ctx, page));
  const faults = rooms.flatMap((r) => [
    ...(r.before.framed ? [] : [`${r.page}: not framed`]),
    ...seatFaults(r.page, r.before, r.after),
  ]);
  const slips = rooms.filter((r) => r.before.slipTop !== null).length;
  const strips = rooms.filter((r) => r.before.strip).length;
  const presses = rooms.filter((r) => r.before.pressFoot !== null && r.before.pressFoot !== "").length;
  ctx.check(
    "EA7 on a phone held sideways, a reader's swipe scrolls every chart room to the foot of its desk frame, and the room laid out again there seats its sheet, its slip and its Press exactly where the same room laid out again unscrolled seats them: every vertical read is in page coordinates (Issue #778)",
    faults.length === 0 && slips > 0 && strips > 0 && presses > 0,
    `${rooms.length} rooms; ${slips} with a slip, ${strips} with a shown strip, ${presses} with a risen Press; ${faults.length ? `${faults.length} faults: ${faults.slice(0, 6).join("; ")}` : "no faults"}`,
  );
}

async function uprightReads(ctx: SuiteContext): Promise<Read[]> {
  const reads: Read[] = [];
  for (const page of CHART_ROOM_FLOOR) {
    const s = await open(ctx, page, UPRIGHT.w, UPRIGHT.h, UPRIGHT.laidOut, "EA6");
    if (s) reads.push({ page, size: "390x844 phone", s });
  }
  return reads;
}

export async function ea6Upright(ctx: SuiteContext): Promise<void> {
  await ctx.setMobileViewport(UPRIGHT.w, UPRIGHT.h);
  const reads = await withStyledBoot(ctx, () => uprightReads(ctx));
  const switched = switchFaults(reads, DESK_FRAME_H);
  const missing = CHART_ROOM_FLOOR.filter((p) => !reads.some((r) => r.page === p));
  const faults = [
    ...reads.flatMap(stageFaults),
    ...reads
      .filter((r) => !r.s.framed || r.s.pageH !== DESK_FRAME_H || r.s.docH !== UPRIGHT.laidOut.h || r.s.under)
      .map((r) => `${r.page}: framed ${r.s.framed}, ${r.s.pageH} tall, document ${r.s.docH}, floored ${r.s.under}`),
  ];
  const last = reads.at(-1)?.s;
  const desk: [number, number, number][] = [];
  for (const y of DESK_ROWS) desk.push(medianPixel(await sampleRow(ctx.send, 0, y, UPRIGHT.laidOut.w)));
  const ink = tokenRgba("--chart-ink");
  const control = last
    ? medianPixel(await sampleRow(ctx.send, 0, Math.round((last.sheet.y + last.sheet.b) / 2), UPRIGHT.laidOut.w))
    : null;
  const onInk = desk.every((p) => nearRgba([...p, 255], ink));
  ctx.check(
    "EA6 on a phone held upright (390x844, laid out 1024x2217) every chart room keeps the desk frame: it lays out 1024 by 768 at the top of a page no taller than the window, its body at 768 the moment the frame switches on, under reduced motion and with the page's style resolved before the room binds, no sheet floors, the Press never stacks, no chrome ink meets other chrome ink, and the desk below the frame reads chart ink where a row through a sheet does not (Issue #778 ruling 9)",
    missing.length === 0 &&
      switched.length === 0 &&
      faults.length === 0 &&
      onInk &&
      control !== null &&
      !nearRgba([...control, 255], ink),
    `${reads.length} chart rooms${missing.length ? `, missing ${missing.join(", ")}` : ""}; desk rows ${DESK_ROWS.map((y, i) => `${y}: ${desk[i]?.join(",")}`).join("; ")}, a row through the sheet ${control?.join(",")}; the switch ${switched.join("; ") || "768 at once in every room"}; ${faults.length ? `${faults.length} faults: ${faults.slice(0, 6).join("; ")}` : "no faults"}`,
  );
}

export async function ea8Pinched(ctx: SuiteContext): Promise<void> {
  await ctx.setMobileViewport(PHONE.w, PHONE.h);
  await ctx.evaluate(forgetChartTouch);
  await open(ctx, "/explorer/", PHONE.w, PHONE.h, PHONE.laidOut, "EA8");
  const before = await ctx.evaluate(SEATS);
  await browserPinch(ctx, PINCH_AT, "EA8");
  await makeSettle(ctx)<number>(
    "visualViewport.scale",
    (s, last) => s >= 1 && last === s,
    "EA8 the pinch takes the page past full size",
  );
  await ctx.evaluate('(window.dispatchEvent(new Event("resize")), true)');
  await rest(ctx, PHONE.laidOut.w, PHONE.laidOut.h, "EA8 relaid");
  const after = await ctx.evaluate(SEATS);
  await ctx.send("Page.navigate", { url: "about:blank" });
  const faults = seatFaults("/explorer/", before, after);
  ctx.check(
    "EA8 a pinch that zooms the page past full size, and the room laid out again after it, leave the desk frame standing: whether the page was set small is read once, as the room binds (Issue #778)",
    after.framed && !after.under && faults.length === 0,
    `framed ${after.framed}, floored ${after.under}; ${faults.length ? faults.join("; ") : "seats unmoved"}`,
  );
}

type Paper = { framed: boolean; overflowY: string; bodyH: string };

const PAPER: Payload<Paper> = `({
  framed: document.documentElement.classList.contains(${JSON.stringify(DESK_FRAME)}),
  overflowY: getComputedStyle(document.documentElement).overflowY,
  bodyH: getComputedStyle(document.body).height,
})`;

export async function ea9Paper(ctx: SuiteContext): Promise<void> {
  await ctx.setMobileViewport(PHONE.w, PHONE.h);
  await open(ctx, "/explorer/", PHONE.w, PHONE.h, PHONE.laidOut, "EA9");
  const screen = await ctx.evaluate(PAPER);
  await ctx.send("Emulation.setEmulatedMedia", { media: "print", features: REDUCE });
  let paper: Paper;
  try {
    paper = await ctx.evaluate(PAPER);
  } finally {
    await ctx.send("Emulation.setEmulatedMedia", { media: "", features: REDUCE });
  }
  ctx.check(
    "EA9 on paper the desk frame stands down: a framed room's root scrolls on screen and lets its overflow show on paper, and its body is 768 tall on screen and its own height on paper, the frame's rules being screen rules (Issue #778)",
    screen.framed &&
      screen.overflowY === "auto" &&
      screen.bodyH === `${DESK_FRAME_H}px` &&
      paper.overflowY === "visible" &&
      paper.bodyH !== `${DESK_FRAME_H}px`,
    `on screen ${JSON.stringify(screen)}; on paper ${JSON.stringify(paper)}`,
  );
}
