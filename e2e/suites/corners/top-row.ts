// The top row (Issue #762 pull request B): a wide corner gives way toward the kit's width before the nav wraps, the nav wraps between rooms, a page that widens again lays out from its sheets, Issue #741's corners are never written, a chart room's slip follows its folio, and the band grows by what the cluster grew.
import { makeSettle } from "../../support/settle.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import { FLOOR_PLAIN, GLYPHS_OVER_SHEET, NO_POOLS, grounds, rest, withStyle, worstOf } from "./stage.ts";

const KIT = 304;
const CAP = 480;
const NARROW = 640;
const H = 800;

type Row = {
  innerW: number; navLines: number; leadingDots: number; wrapped: boolean;
  cornerInline: string; clusterInline: string; bandInline: string; band: number;
  corner: { left: number; width: number; height: number }; cluster: { right: number; bottom: number }; boxGap: number;
};

const ROW: Payload<Row> = `(() => {
  const root = document.documentElement, rem = parseFloat(getComputedStyle(root).fontSize);
  const cluster = document.querySelector("header.chrome"), nav = cluster.querySelector("nav.rooms");
  const corner = document.querySelector(".corner.tr.folio-room") || document.querySelector(".lf-seed");
  const doors = [...nav.querySelectorAll("a, [aria-current]")];
  const mid = (e) => { const r = e.getBoundingClientRect(); return (r.top + r.bottom) / 2; };
  const tops = new Set(doors.map((d) => Math.round(d.getBoundingClientRect().top)));
  const c = cluster.getBoundingClientRect(), k = corner.getBoundingClientRect();
  return { innerW: innerWidth, navLines: tops.size, leadingDots: [...nav.querySelectorAll(".sep")].filter((d) => Math.abs(mid(d) - mid(d.previousElementSibling)) > parseFloat(getComputedStyle(nav).lineHeight) / 2).length, wrapped: nav.classList.contains("wrapped"),
    cornerInline: corner.style.maxWidth, clusterInline: cluster.style.maxWidth, bandInline: root.style.getPropertyValue("--band-h"),
    band: parseFloat(getComputedStyle(root).getPropertyValue("--band-h")) * rem,
    corner: { left: k.left, width: k.width, height: k.height }, cluster: { right: c.right, bottom: c.bottom }, boxGap: k.left - c.right };
})()`;

async function at(ctx: SuiteContext, w: number, label: string): Promise<Row> {
  await ctx.send("Emulation.setDeviceMetricsOverride", { width: w, height: H, deviceScaleFactor: 1, mobile: false });
  return makeSettle(ctx)(ROW, (d, last) => d.innerW === w && last !== null && JSON.stringify(d) === JSON.stringify(last), label);
}

async function open(ctx: SuiteContext, page: string, w: number): Promise<Row> {
  await ctx.setTouch(false);
  await ctx.send("Emulation.setDeviceMetricsOverride", { width: w, height: H, deviceScaleFactor: 1, mobile: false });
  await ctx.send("Page.navigate", { url: "about:blank" });
  await ctx.send("Page.navigate", { url: `http://127.0.0.1:${ctx.PORT}${page}` });
  const up: Payload<string | null> = `document.readyState === "complete" && (!document.fonts || document.fonts.status === "loaded") && !!document.querySelector("header.chrome nav.rooms") ? location.pathname : null`;
  await makeSettle(ctx)(up, (d) => d === page, `top-row-open-${page}-${w}`, 300);
  return at(ctx, w, `top-row-${page}-${w}`);
}

const oneLine = (r: Row) => r.navLines === 1 && !r.wrapped && r.clusterInline === "";
const yielded = (r: Row) => r.cornerInline !== "" && r.corner.width > KIT - 0.5 && r.corner.width < CAP;
const unwritten = (r: Row) => r.cornerInline === "" && r.clusterInline === "" && r.bandInline === "" && !r.wrapped;
const fmt = (page: string, w: number, r: Row) => `${page}@${w}: lines ${r.navLines}${r.leadingDots ? ` ${r.leadingDots} dots lead a line` : ""} corner ${r.corner.width.toFixed(1)}${r.cornerInline ? ` (${r.cornerInline})` : ""} cluster ${r.clusterInline || "-"} gap ${r.boxGap.toFixed(1)}${r.bandInline ? ` band ${r.bandInline}` : ""}`;

async function ribbonYields(ctx: SuiteContext, motion: string): Promise<{ ok: boolean; rows: string[] }> {
  await ctx.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: motion }] });
  const rows: string[] = [];
  let ok = true;
  for (const w of [960, 1024, 1032]) {
    const r = await open(ctx, "/ribbon/", w);
    ok &&= oneLine(r) && yielded(r) && r.boxGap >= 25.6 - 0.5;
    rows.push(`${motion} ${fmt("/ribbon/", w, r)}`);
  }
  const wide = await open(ctx, "/ribbon/", 1280);
  ok &&= unwritten(wide) && Math.abs(wide.corner.width - CAP) < 0.5;
  rows.push(`${motion} ${fmt("/ribbon/", 1280, wide)}`);
  return { ok, rows };
}

export async function co5Yields(ctx: SuiteContext): Promise<void> {
  const reduced = await ribbonYields(ctx, "reduce");
  const moving = await ribbonYields(ctx, "no-preference").finally(() => ctx.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] }));
  const narrow: string[] = [];
  let wraps = true;
  for (const page of ["/", "/faq/", "/print-room/", "/prospect/", "/ribbon/"]) {
    const r = await open(ctx, page, NARROW);
    wraps &&= r.navLines >= 2 && r.leadingDots === 0 && r.wrapped && r.boxGap >= 25.6 - 0.5;
    narrow.push(fmt(page, NARROW, r));
  }
  const widened: string[] = [];
  let lays = true;
  for (const page of ["/faq/", "/ribbon/"]) {
    const was = await open(ctx, page, NARROW);
    const now = await at(ctx, 1280, `top-row-widened-${page}`);
    lays &&= was.wrapped && unwritten(now) && now.navLines === 1;
    widened.push(`${fmt(page, NARROW, was)} then ${fmt(page, 1280, now)}`);
  }
  for (const w of [960, 1024, 1032]) {
    const was = await open(ctx, "/ribbon/", w);
    const now = await at(ctx, 1280, `top-row-widened-ribbon-${w}`);
    lays &&= was.cornerInline !== "" && unwritten(now) && Math.abs(now.corner.width - CAP) < 0.5;
    widened.push(`${fmt("/ribbon/", w, was)} then ${fmt("/ribbon/", 1280, now)}`);
  }
  const held: string[] = [];
  let untouched = true;
  for (const [page, widths] of [["/print-room/", [1280, 1024, 1023, 960, 901]], ["/specimen/", [1023, 960, 901]]] as const) {
    for (const w of widths) {
      const r = await open(ctx, page, w);
      untouched &&= r.cornerInline === "" && r.clusterInline === "";
      held.push(fmt(page, w, r));
    }
  }
  await ctx.send("Emulation.setScriptExecutionDisabled", { value: true });
  const off = await open(ctx, "/ribbon/", 1024).finally(() => ctx.send("Emulation.setScriptExecutionDisabled", { value: false }));
  const scriptsOff = Math.abs(off.corner.width - CAP) < 0.5 && off.boxGap > 0 && off.cornerInline === "";
  ctx.check(
    "CO5 the corner gives way before the nav wraps: the Ribbon at 960, 1024 and 1032 keeps its nav on one line, its corner written between the kit's 19rem and its 30rem cap and standing the gap clear, under reduced motion and with motion on, and at 1280 nothing is written; at 640 the nav wraps between rooms on home, the FAQ, the Print Room, the Prospect and the Ribbon, every wrapped line ending on its dot; a page loaded at 640, or the Ribbon at 960, 1024 or 1032 where its corner was written, and widened to 1280 lays out from its sheets again; Issue #741's two corners are never written; and with scripts off the Ribbon's corner stands at its cap, clear, at 1024 (Issue #762)",
    reduced.ok && moving.ok && wraps && lays && untouched && scriptsOff,
    [...reduced.rows, ...moving.rows, ...narrow, ...widened, ...held, `scripts off ${fmt("/ribbon/", 1024, off)}`].join(" | "),
  );
}

type Seat = { slipTop: number; reserveTop: number; folioH: number };
const SEAT: Payload<Seat> = `(() => { const f = document.querySelector("[style*='--reserve-top']"); return { slipTop: document.querySelector(".slip").getBoundingClientRect().top, reserveTop: f ? parseFloat(f.style.getPropertyValue("--reserve-top")) : NaN, folioH: document.querySelector(".corner.tr").getBoundingClientRect().height }; })()`;

// The witness: from 1041 to 901 the Ribbon's folio yields from 480 to 339.6 and rewraps 20px taller (146.6 to 166.6, the step 6 spike on 2026-10-05), which only a refit on the folio's own resize carries to the slip.
export async function co6Follows(ctx: SuiteContext): Promise<void> {
  const settle = makeSettle(ctx);
  const rest = (label: string) => settle(SEAT, (d, last) => last !== null && JSON.stringify(d) === JSON.stringify(last), label);
  await open(ctx, "/ribbon/", 1041);
  const wide = await rest("co6-wide");
  await at(ctx, 901, "co6-resized");
  const resized = await rest("co6-resized-seat");
  await open(ctx, "/ribbon/", 901);
  const fresh = await rest("co6-fresh");
  ctx.check(
    "CO6 a chart room's slip follows its folio: the Ribbon loaded at 1041 and resized to 901, where the top row rewraps its folio taller, seats its slip and its stage's top reserve where a fresh load at 901 does (Issue #762; the PR #777 slip-seat row)",
    fresh.folioH - wide.folioH > 10 && Math.abs(resized.slipTop - fresh.slipTop) < 0.5 && Math.abs(resized.reserveTop - fresh.reserveTop) < 0.5,
    JSON.stringify({ wide, resized, fresh }),
  );
}

type Ground = { band: number; bandInline: string; clusterBottom: number; firstTop: number };
const GROUND: Payload<Ground> = `(() => { const root = document.documentElement, rem = parseFloat(getComputedStyle(root).fontSize); const first = document.querySelector(".sheet, .grid figure"); return { band: parseFloat(getComputedStyle(root).getPropertyValue("--band-h")) * rem, bandInline: root.style.getPropertyValue("--band-h"), clusterBottom: document.querySelector("header.chrome").getBoundingClientRect().bottom, firstTop: first ? first.getBoundingClientRect().top + scrollY : NaN }; })()`;

export async function co7Band(ctx: SuiteContext): Promise<void> {
  const settle = makeSettle(ctx);
  const rows: string[] = [];
  let ok = true;
  for (const page of ["/faq/", "/glossary/", "/gallery/"]) {
    await open(ctx, page, 1280);
    const wide = await settle(GROUND, (d, last) => last !== null && JSON.stringify(d) === JSON.stringify(last), `co7-${page}-1280`);
    await open(ctx, page, NARROW);
    const narrow = await settle(GROUND, (d, last) => last !== null && JSON.stringify(d) === JSON.stringify(last), `co7-${page}-640`);
    const growth = narrow.clusterBottom - wide.clusterBottom;
    ok &&= wide.bandInline === "" && growth > 10 && Math.abs(narrow.band - (wide.band + growth)) < 0.5 && narrow.firstTop >= Math.max(narrow.clusterBottom, narrow.band);
    rows.push(`${page}: band ${wide.band.toFixed(1)} to ${narrow.band.toFixed(1)} (${narrow.bandInline}), cluster foot ${wide.clusterBottom.toFixed(1)} to ${narrow.clusterBottom.toFixed(1)}, first row at ${narrow.firstTop.toFixed(1)}`);
  }
  ctx.check(
    "CO7 the band grows by exactly what the cluster grew: on the FAQ, the Glossary and the Gallery at 640, where the nav wraps, the band token is its 1280 value plus the cluster's growth and the page's first row starts below both the cluster and the token, so its padding follows the token; at 1280 nothing is written (Issue #762; it holds what the unit band test held before Issue #779's check placement)",
    ok,
    rows.join(" | "),
  );
}

const FLOORED_ROOMS = ["/explorer/", "/print-room/", "/prospect/", "/reading-room/", "/ribbon/", "/seed-of-the-day/", "/specimen/"];
const FLOORED_WINDOWS: readonly (readonly [number, number])[] = [[640, 400], [720, 800], [800, 800]];
// Where the step 11 plate read found the nav and the motto under 4.5:1 with no backing (Alex's ruling of 2026-10-05 on PR #784): each must run under the chrome there.
const RULED = ["/explorer/ 640x400", "/print-room/ 640x400", "/prospect/ 640x400", "/reading-room/ 640x400", "/ribbon/ 640x400", "/seed-of-the-day/ 640x400", "/specimen/ 640x400", "/explorer/ 800x800", "/reading-room/ 800x800", "/specimen/ 800x800", "/reading-room/ 720x800"];

export async function co8Floored(ctx: SuiteContext): Promise<void> {
  await ctx.setTouch(false);
  const rows: string[] = [];
  const faults: string[] = [];
  let bareCluster = Infinity;
  for (const [w, h] of FLOORED_WINDOWS) {
    await ctx.send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: false });
    for (const page of FLOORED_ROOMS) {
      const at = `${page} ${w}x${h}`;
      await ctx.send("Page.navigate", { url: "about:blank" });
      await ctx.send("Page.navigate", { url: `http://127.0.0.1:${ctx.PORT}${page}` });
      const s = await rest(ctx, w, h, `CO8 ${at}`);
      const glyphs = await ctx.evaluate(GLYPHS_OVER_SHEET);
      const read = await grounds(ctx, glyphs);
      if (at === RULED[0]) bareCluster = worstOf(await withStyle(ctx, "co8-bare", NO_POOLS, () => grounds(ctx, glyphs)), "cluster");
      if (RULED.includes(at) && s?.under !== true) faults.push(`${at} is not marked as running under the chrome`);
      faults.push(...read.filter((g) => g.ratio < FLOOR_PLAIN).map((g) => `${at}: ${g.piece} "${g.t}" reads ${g.ratio.toFixed(2)}`));
      rows.push(`${at}${s?.under ? " under" : ""}: ${read.length} lines, worst ${worstOf(read).toFixed(2)}`);
    }
  }
  ctx.check(
    "CO8 where the narrow layout's width floor runs a chart under the head cluster, the chrome stands on its dark backing and every chrome line over the sheet reads at 4.5:1 or better, in seven chart rooms at 640x400, 720x800 and 800x800 (Alex's ruling of 2026-10-05 on PR #784, ruling 4b extended; the plate read found the nav at 1.03 there without it), and with the backings taken away the Explorer's cluster reads under 4.5 at 640x400, the witness that the backing is what holds it",
    faults.length === 0 && bareCluster < FLOOR_PLAIN,
    `${rows.join(" | ")}; the Explorer's cluster bare at 640x400 ${bareCluster.toFixed(2)}${faults.length ? `; ${faults.length} faults: ${faults.slice(0, 6).join("; ")}` : ""}`,
  );
}
