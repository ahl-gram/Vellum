// The top row (Issue #762 pull request B; re-floored by pull requests C and D, where a page below 1024 lays out its 1024 layout): a wide corner gives way toward the kit's width wherever it would run under the nav, a page that widens again lays out from its sheets, Issue #741's corners are never written, a chart room's slip follows its folio, and a room's band and first row hold at the floor.
import { makeSettle } from "../../support/settle.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import { LANDED } from "../stage/stage.ts";

const KIT = 304;
const CAP = 480;
const NARROW = 640;
const H = 800;

type Row = {
  innerW: number; navLines: number;
  cornerInline: string; clusterInline: string; bandInline: string; band: number;
  corner: { left: number; width: number; height: number }; cluster: { right: number; bottom: number }; boxGap: number;
};

const ROW: Payload<Row> = `(() => {
  const root = document.documentElement, rem = parseFloat(getComputedStyle(root).fontSize);
  const cluster = document.querySelector("header.chrome"), nav = cluster.querySelector("nav.rooms");
  const corner = document.querySelector(".corner.tr.folio-room") || document.querySelector(".lf-seed");
  const doors = [...nav.querySelectorAll("a, [aria-current]")];
  const tops = new Set(doors.map((d) => Math.round(d.getBoundingClientRect().top)));
  const c = cluster.getBoundingClientRect(), k = corner.getBoundingClientRect();
  return { innerW: innerWidth, navLines: tops.size,
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
  const up: Payload<string | null> = `document.readyState === "complete" && (!document.fonts || document.fonts.status === "loaded") && !!document.querySelector("header.chrome nav.rooms") && ${LANDED} ? location.pathname : null`;
  await makeSettle(ctx)(up, (d) => d === page, `top-row-open-${page}-${w}`, 300);
  return at(ctx, w, `top-row-${page}-${w}`);
}

const oneLine = (r: Row) => r.navLines === 1 && r.clusterInline === "";
const yielded = (r: Row) => r.cornerInline !== "" && r.corner.width > KIT - 0.5 && r.corner.width < CAP;
const unwritten = (r: Row) => r.cornerInline === "" && r.clusterInline === "" && r.bandInline === "";
const fmt = (page: string, w: number, r: Row) => `${page}@${w}: lines ${r.navLines} corner ${r.corner.width.toFixed(1)}${r.cornerInline ? ` (${r.cornerInline})` : ""} cluster ${r.clusterInline || "-"} gap ${r.boxGap.toFixed(1)}${r.bandInline ? ` band ${r.bandInline}` : ""}`;

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
  let lined = true;
  for (const page of ["/", "/faq/", "/print-room/", "/prospect/", "/ribbon/"]) {
    const r = await open(ctx, page, NARROW);
    lined &&= oneLine(r) && r.boxGap >= 25.6 - 0.5;
    narrow.push(fmt(page, NARROW, r));
  }
  const widened: string[] = [];
  let lays = true;
  const was = await open(ctx, "/ribbon/", NARROW);
  const now = await at(ctx, 1280, "top-row-widened-/ribbon/");
  lays &&= was.cornerInline !== "" && unwritten(now) && now.navLines === 1;
  widened.push(`${fmt("/ribbon/", NARROW, was)} then ${fmt("/ribbon/", 1280, now)}`);
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
    "CO5 the corner gives way and the nav keeps one line: the Ribbon at 960, 1024 and 1032 keeps its nav on one line, its corner written between the kit's 19rem and its 30rem cap and standing the gap clear, under reduced motion and with motion on, and at 1280 nothing is written; at 640 home, the FAQ, the Print Room, the Prospect and the Ribbon lay out their 1024 top row on one line, the gap clear; the Ribbon loaded at 640, 960, 1024 or 1032, where its corner was written, and widened to 1280 lays out from its sheets again; Issue #741's two corners are never written; and with scripts off the Ribbon's corner stands at its cap, clear, at 1024 (Issue #762)",
    reduced.ok && moving.ok && lined && lays && untouched && scriptsOff,
    [...reduced.rows, ...moving.rows, ...narrow, ...widened, ...held, `scripts off ${fmt("/ribbon/", 1024, off)}`].join(" | "),
  );
}

type Seat = { slipTop: number; reserveTop: number; folioH: number };
const SEAT: Payload<Seat> = `(() => { const f = document.querySelector("[style*='--reserve-top']"); return { slipTop: document.querySelector(".slip").getBoundingClientRect().top, reserveTop: f ? parseFloat(f.style.getPropertyValue("--reserve-top")) : NaN, folioH: document.querySelector(".corner.tr").getBoundingClientRect().height }; })()`;

// The witness, deliberate: under the 1024 floor no window rewraps a room's folio (the Ribbon's yields from 480 at 1041 to 462.6 at the floor and keeps its 146.6 height, measured 2026-10-06), so a style narrows it to the kit's 19rem, which rewraps it taller, and only a refit on the folio's own resize carries that to the slip.
const NARROWED = ".corner.tr.folio-room { max-width: 19rem !important; }";
const WEAR = `(() => { const s = document.createElement("style"); s.id = "co6-narrowed"; s.textContent = ${JSON.stringify(NARROWED)}; document.head.appendChild(s); return true; })()`;
// At document start there is no head to wear it yet, and a module script runs after parsing, so the style goes in as parsing ends and the room's first layout already wears it.
const WEAR_FROM_THE_START = `document.addEventListener("readystatechange", () => { if (document.readyState === "interactive") ${WEAR}; })`;

export async function co6Follows(ctx: SuiteContext): Promise<void> {
  const settle = makeSettle(ctx);
  const rest = (label: string, moved?: Seat) => settle(SEAT, (d, last) => (moved === undefined || d.folioH !== moved.folioH) && last !== null && JSON.stringify(d) === JSON.stringify(last), label);
  await open(ctx, "/ribbon/", 1280);
  const wide = await rest("co6-wide");
  await ctx.evaluate(WEAR);
  const resized = await rest("co6-narrowed", wide);
  const early = await ctx.send<{ identifier: string }>("Page.addScriptToEvaluateOnNewDocument", { source: WEAR_FROM_THE_START });
  try {
    await open(ctx, "/ribbon/", 1280);
  } finally {
    await ctx.send("Page.removeScriptToEvaluateOnNewDocument", { identifier: early.identifier });
  }
  const fresh = await rest("co6-fresh");
  ctx.check(
    "CO6 a chart room's slip follows its folio: the Ribbon at 1280 whose folio a style narrows to the kit's 19rem, rewrapping it taller, seats its slip and its stage's top reserve where a fresh load wearing the same style does (Issue #762; the PR #777 slip-seat row; the style since pull request C's floor, under which no window rewraps a room's folio)",
    resized.folioH - wide.folioH > 10 && Math.abs(resized.folioH - fresh.folioH) < 0.5 && Math.abs(resized.slipTop - fresh.slipTop) < 0.5 && Math.abs(resized.reserveTop - fresh.reserveTop) < 0.5,
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
    ok &&= [wide, narrow].every((r) => r.bandInline === "" && r.firstTop >= Math.max(r.clusterBottom, r.band)) && Math.abs(narrow.band - wide.band) < 0.5 && Math.abs(narrow.clusterBottom - wide.clusterBottom) < 0.5;
    rows.push(`${page}: band ${wide.band.toFixed(1)} and ${narrow.band.toFixed(1)}, cluster foot ${wide.clusterBottom.toFixed(1)} and ${narrow.clusterBottom.toFixed(1)}, first row at ${wide.firstTop.toFixed(1)} and ${narrow.firstTop.toFixed(1)}`);
  }
  ctx.check(
    "CO7 a room's band and first row hold at the floor: on the FAQ, the Glossary and the Gallery at 1280 and at 640, which lays out the 1024 page, the band token is unwritten and the same, the cluster's foot does not move, and the page's first row starts below both the cluster and the band, so the desk layer that holds the chrome takes no room from the text (Issue #762; it holds what the unit band test held before Issue #779's check placement)",
    ok,
    rows.join(" | "),
  );
}
