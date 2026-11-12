// The chart slides with the side panel's fold (Issue #1261): from where it stood to its new fit at the slip's own pace, nothing moving after the slip arrives and the Explorer's framing held at every frame, and under reduced motion it stands at its new fit at the press.
import { makeSettle, makeStable } from "../../support/settle.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import { open, size } from "../stage/stage.ts";
import { aimAt, motionOn, mouseTo, openAt, pressSelector, SEED_42 } from "../stage/slide-kit.ts";

// 2026-11-05, Issue #1261: 0.0000 at every frame of six presses at CPU x1 and x6, the slide and the slip starting on one frame of the document timeline; the nearest mutation, the Glass read where it stood, reads 0.1963.
const PACE_GAP = 0.05;
const REST_PX = 0.5;
// 2026-11-05, Issue #1261: 0 boxes between in six presses under reduced motion with the fit's transitions held, 16 to 17 with the slide played; one box is the room a held 0.01 ms transition on a slow runner may leave.
const HELD_BOXES = 1;

type Box4 = readonly [number, number, number, number];
type Row = {
  readonly t: number;
  readonly box: Box4;
  readonly slipL: number;
  readonly legendL: number | null;
  readonly chart: Box4 | null;
};
type Run = { readonly t0: number | null; readonly rows: readonly Row[] };
type At = { readonly box: Box4; readonly chart: Box4 | null; readonly slipL: number };

const RECORD: Payload<boolean> = `(() => {
  const rows = [];
  window.__foldRows = rows;
  window.__foldT0 = null;
  const sheet = document.getElementById("sheet"), slip = document.querySelector(".slip"), legend = document.querySelector(".legend");
  if (window.__foldWatch) window.__foldWatch.disconnect();
  window.__foldWatch = new MutationObserver(() => { if (window.__foldT0 === null) window.__foldT0 = performance.now(); });
  window.__foldWatch.observe(slip, { attributes: true, attributeFilter: ["class"] });
  const tick = () => {
    if (!window.__foldRecording) return;
    const r = sheet.getBoundingClientRect(), svg = sheet.querySelector("svg[data-vellum-style]"), c = svg ? svg.getBoundingClientRect() : null;
    rows.push({ t: performance.now(), box: [r.left, r.top, r.width, r.height], slipL: slip.getBoundingClientRect().left, legendL: legend ? legend.getBoundingClientRect().left : null, chart: c ? [c.left, c.top, c.width, c.height] : null });
    requestAnimationFrame(() => setTimeout(tick, 0));
  };
  window.__foldRecording = true;
  requestAnimationFrame(() => setTimeout(tick, 0));
  return true;
})()`;
const COLLECT: Payload<Run> = `(() => { window.__foldRecording = false; return { t0: window.__foldT0, rows: window.__foldRows }; })()`;
const SHEET_AT: Payload<At> = `(() => {
  const r = document.getElementById("sheet").getBoundingClientRect(), svg = document.querySelector("#sheet svg[data-vellum-style]"), c = svg ? svg.getBoundingClientRect() : null;
  return { box: [r.left, r.top, r.width, r.height], chart: c ? [c.left, c.top, c.width, c.height] : null, slipL: document.querySelector(".slip").getBoundingClientRect().left };
})()`;
const MAP_SCALE: Payload<{ a: number }> =
  `({ a: new DOMMatrix(getComputedStyle(document.getElementById("map")).transform).a })`;

const dist = (a: readonly number[], b: readonly number[]): number => Math.max(...a.map((v, i) => Math.abs(v - b[i]!)));

type Framing = { readonly u: number; readonly v: number; readonly k: number };
const framingOf = (r: Row): Framing | null =>
  r.chart === null
    ? null
    : {
        u: (r.box[0] + r.box[2] / 2 - r.chart[0]) / r.chart[2],
        v: (r.box[1] + r.box[3] / 2 - r.chart[1]) / r.chart[3],
        k: r.chart[2] / r.box[2],
      };
const driftOf = (a: Framing, b: Framing): number =>
  Math.max(Math.abs(a.u - b.u), Math.abs(a.v - b.v), Math.abs(a.k - b.k) / b.k);

interface FoldReads {
  readonly distinctBetween: number;
  readonly worstPaceGap: number;
  readonly sheetOffAfter: number;
  readonly pressOffAfter: number;
  readonly framingEveryFrame: number | null;
  readonly framingAtRest: number | null;
  readonly tolerance: number;
  readonly travel: number;
  readonly widthChange: number;
  readonly pressRowMoved: number;
  readonly start: Framing | null;
}

function foldReads(run: Run, explorer: boolean): FoldReads {
  const { rows, t0 } = run;
  const first = rows[0]!;
  const last = rows[rows.length - 1]!;
  const [b0, b1] = [first.box, last.box];
  const between = rows.filter((r) => dist(r.box, b0) > REST_PX && dist(r.box, b1) > REST_PX);
  const distinctBetween = new Set(between.map((r) => r.box.map((v) => Math.round(v)).join(","))).size;
  const d = b1.map((v, i) => v - b0[i]!);
  const dd = d.reduce((m, v) => m + v * v, 0);
  const sheetProgress = (r: Row): number => (dd > 0 ? r.box.reduce((m, v, i) => m + (v - b0[i]!) * d[i]!, 0) / dd : 1);
  const slipProgress = (r: Row): number => (r.slipL - first.slipL) / (last.slipL - first.slipL);
  const travelling = rows.filter(
    (r) => Math.abs(r.slipL - first.slipL) > REST_PX && Math.abs(r.slipL - last.slipL) > REST_PX,
  );
  const worstPaceGap = travelling.reduce((m, r) => Math.max(m, Math.abs(sheetProgress(r) - slipProgress(r))), 0);
  const arrived = rows.filter((r) => t0 !== null && r.t > t0 && Math.abs(r.slipL - last.slipL) < 0.01);
  const sheetOffAfter = arrived.reduce((m, r) => Math.max(m, dist(r.box, b1)), 0);
  const pressOffAfter = arrived.reduce(
    (m, r) => (r.legendL === null || last.legendL === null ? m : Math.max(m, Math.abs(r.legendL - last.legendL))),
    0,
  );
  const start = explorer ? framingOf(first) : null;
  const framed = rows.flatMap((r) => (start === null ? [] : [framingOf(r)])).flatMap((f) => (f === null ? [] : [f]));
  const end = explorer ? framingOf(last) : null;
  return {
    distinctBetween,
    worstPaceGap,
    sheetOffAfter,
    pressOffAfter,
    // two half-pixel roundings of the gesture box, at the hold and at the restore, over the sheet's shorter side (camera.ts reads clientWidth and clientHeight).
    tolerance: 1 / Math.min(b0[2], b0[3], b1[2], b1[3]),
    framingEveryFrame: start === null ? null : framed.reduce((m, f) => Math.max(m, driftOf(f, start)), 0),
    framingAtRest: start === null || end === null ? null : driftOf(end, start),
    travel: dist(b0, b1),
    widthChange: Math.abs(b1[2] - b0[2]),
    pressRowMoved: first.legendL === null || last.legendL === null ? 0 : Math.abs(last.legendL - first.legendL),
    start,
  };
}

async function zoomAbout(ctx: SuiteContext, cx: number, cy: number, k: number, label: string): Promise<void> {
  await ctx.evaluate(
    `(() => { const v = document.getElementById("map-viewport"), W = v.clientWidth, H = v.clientHeight; window.__vellumZoomTo({ x: W / 2 - ${cx} * ${k} * W, y: H / 2 - ${cy} * ${k} * H, k: ${k} }); return true; })()`,
  );
  await makeStable(makeSettle(ctx))(MAP_SCALE, label, { departed: (d) => Math.abs(d.a - k) < 0.002 });
}

async function pressRecorded(ctx: SuiteContext, selector: string, label: string): Promise<Run> {
  const before = await ctx.evaluate(SHEET_AT);
  const aim = await ctx.evaluate(aimAt(selector));
  if (!aim.hit) throw new Error(`${label}: ${selector} is covered at its centre`);
  await mouseTo(ctx, aim.x, aim.y);
  await ctx.sleep(300, "pace: the hover's own transitions land before the sampler starts");
  await ctx.evaluate(RECORD);
  await ctx.sleep(120, "window: frames before the press, so the first sample is the sheet where it stood");
  await pressSelector(ctx, selector);
  await makeStable(makeSettle(ctx))(SHEET_AT, label, {
    departed: (d) => dist(d.box, before.box) > REST_PX && Math.abs(d.slipL - before.slipL) > REST_PX,
  });
  await ctx.sleep(300, "window: the frames after rest in which a late layout would move the sheet");
  const run = await ctx.evaluate(COLLECT);
  if (run.t0 === null || run.rows.length < 2) throw new Error(`${label}: the sampler caught no press`);
  return run;
}

type Instance = {
  readonly id: string;
  readonly explorer: boolean;
  readonly width: number;
  readonly reads: ReadonlyArray<{ readonly press: string; readonly r: FoldReads }>;
};

async function pressBoth(ctx: SuiteContext, id: string, explorer: boolean, width: number): Promise<Instance> {
  const fold = foldReads(await pressRecorded(ctx, ".slip-fold", `${id} fold`), explorer);
  const tab = foldReads(await pressRecorded(ctx, ".slip-tab", `${id} tab`), explorer);
  return {
    id,
    explorer,
    width,
    reads: [
      { press: "fold", r: fold },
      { press: "tab", r: tab },
    ],
  };
}

const num = (v: number | null): string => (v === null ? "n/a" : v.toFixed(5));
const show = (i: Instance): string =>
  i.reads
    .map(
      ({ press, r }) =>
        `${i.id} ${press}: travel ${r.travel.toFixed(2)}, width ${r.widthChange.toFixed(2)}, press row moved ${r.pressRowMoved.toFixed(2)}, between ${r.distinctBetween}, pace ${r.worstPaceGap.toFixed(4)}, sheet off ${r.sheetOffAfter.toFixed(2)}, press row off ${r.pressOffAfter.toFixed(2)}, framing ${num(r.framingEveryFrame)} at rest ${num(r.framingAtRest)} (tolerance ${r.tolerance.toFixed(5)})`,
    )
    .join("; ");

// 2026-11-12: at 1024x768 the side panel's fold and tab move the sheet 338.47, change its width 233.84 and move the Press row 500.02 px on the Seed of the Day, and 188.31, 188.31 and 384.52 px in the Explorer, on the Mac harness browser, and 338.47, 233.84, 500.10, 188.31, 188.31 and 383.46 px on the CI runner (run 43180780683, lane C), each the least of its room's reads across the fold, the tab and, in the Explorer, both motion arms; the least of all, 188.31 px, against the half pixel REST_PX.
function witnesses(i: Instance, zoomed: number | null): string[] {
  const faults: string[] = [];
  for (const { press, r } of i.reads) {
    const at = `${i.id} ${press}`;
    if (!(r.travel > REST_PX)) faults.push(`${at}: the press moved the sheet ${r.travel.toFixed(2)} px (the witness)`);
    if (i.width === 1024 && !(r.widthChange > REST_PX))
      faults.push(`${at}: the fold left the sheet's width alone at 1024x768 (the witness)`);
    if (i.width === 1024 && !(r.pressRowMoved > REST_PX))
      faults.push(`${at}: the Press row did not change seat at 1024x768 (the witness)`);
    if (
      zoomed !== null &&
      (r.start === null || Math.abs(r.start.k - zoomed) > 0.01 || Math.abs(r.start.u - 0.5) <= 0.1)
    )
      faults.push(`${at}: the framing was not read zoomed and off centre: ${JSON.stringify(r.start)} (the witness)`);
  }
  return faults;
}

export async function fs2FoldSlides(ctx: SuiteContext): Promise<void> {
  const zoomed = { k: 2.744, cx: 0.35, cy: 0.62 };
  const moving = await motionOn(ctx, async () => {
    await size(ctx, 1024, 768);
    await open(ctx, "/seed-of-the-day/", 1024, 768, { w: 1024, h: 768 }, "FS b");
    await zoomAbout(ctx, 0.4, 0.55, 2, "FS b zoom");
    const b = await pressBoth(ctx, "the Seed of the Day at 1024x768 zoomed to 2", false, 1024);
    await openAt(ctx, SEED_42, 1024, 768, "FS c");
    await zoomAbout(ctx, zoomed.cx, zoomed.cy, zoomed.k, "FS c zoom");
    const c = await pressBoth(ctx, "the Explorer at 1024x768 zoomed to 2.744", true, 1024);
    return [b, c] as const;
  });
  const heldNow = await pressBoth(ctx, "the Explorer at 1024x768 zoomed to 2.744, reduced motion", true, 1024);
  const [seed, e1024] = moving;
  const slideFaults = [...witnesses(seed, null), ...witnesses(e1024, zoomed.k)];
  const each = (pick: (r: FoldReads) => boolean): string[] =>
    moving.flatMap((i) => i.reads.filter(({ r }) => pick(r)).map(({ press }) => `${i.id} ${press}`));
  const paced = each((r) => r.worstPaceGap > PACE_GAP || r.sheetOffAfter > REST_PX || r.pressOffAfter > REST_PX);
  const framed = e1024.reads
    .filter(({ r }) => (r.framingEveryFrame ?? Infinity) > r.tolerance)
    .map(({ press }) => `${e1024.id} ${press}`);
  const stood = heldNow.reads
    .filter(({ r }) => r.distinctBetween > HELD_BOXES)
    .map(({ press }) => `${heldNow.id} ${press}`);
  const landed = heldNow.reads
    .filter(({ r }) => (r.framingAtRest ?? Infinity) > r.tolerance)
    .map(({ press }) => `${heldNow.id} ${press}`);
  const heldFaults = witnesses(heldNow, zoomed.k);
  ctx.check(
    "FS2 in the Explorer at 1024x768 zoomed to 2.744 and on the Seed of the Day at 1024x768 zoomed to 2, at a press on the side panel's fold and on its tab the sheet keeps the slip's own pace at every painted frame of the slip's travel, its progress toward its rest box within 0.05 of the slip's toward its own, so the chart shares the fold's duration and curve (`--fold` and `--ease-fold`); from the frame the slip stands at rest the sheet and the Press row stand at theirs, so nothing moves after the fold; and in the zoomed Explorer the chart under the sheet's centre and its depth hold at every frame within the gesture box's whole-pixel rounding, where main snapped the sheet to its new fit in one frame 340 ms after the press (Alex, 2026-11-05, Issue #1261: \"the chart slides just the same as the rest\")",
    paced.length === 0 && framed.length === 0 && slideFaults.length === 0,
    `${[...paced.map((p) => `${p} off the slip's pace or not at rest`), ...framed.map((f) => `${f} framing drifted`), ...slideFaults].join("; ") || "at the slip's pace, at rest with it, framing held"}: ${moving.map(show).join(" | ")}`,
  );
  ctx.check(
    "FS3 under reduced motion, in the Explorer at 1024x768 zoomed to 2.744 about (0.35, 0.62), a fold and an unfold stand the sheet at its new fit with at most one box between where it stood and where it rests, where a played slide paints many more, and the chart's framing lands where it stood (Issue #1261; `handbook/specs/ui-design.md`, reduced motion is the control)",
    stood.length === 0 && landed.length === 0 && heldFaults.length === 0,
    `${[...stood.map((s) => `${s} slid`), ...landed.map((l) => `${l} lost its framing`), ...heldFaults].join("; ") || "stood at its fit, framing held"}: ${show(heldNow)}`,
  );
}
