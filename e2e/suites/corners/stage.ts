// The chart's minimum size in every chart room (Issue #762, pull request A): on a phone held sideways and on a short or narrow window the sheet keeps at least half the room it could show it in, and takes all of it when the fit would leave less; the Press never stacks down the page; no chrome ink lands on other chrome; and the chrome over a floored chart reads.
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CHROME_GAP } from "../../../src/site/shared/stage-fit.ts";
import { pressRowStacks } from "../../../src/site/shared/room-seats.ts";
import { sampleRow } from "../../support/pixel.ts";
import { makeSettle } from "../../support/settle.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import { routesUnder } from "./geometry.ts";

const REPO = resolve(fileURLToPath(new URL(".", import.meta.url)), "..", "..", "..");
const CHART_ROOM_FLOOR = ["/explorer/", "/explorer/portfolio/", "/print-room/", "/prospect/", "/reading-room/", "/ribbon/", "/seed-of-the-day/", "/specimen/"];
const PHONE = { w: 844, h: 390, laidOut: { w: 1024, h: 474 } };
const DESK = { w: 1280, h: 800 };
const WINDOWS: readonly (readonly [number, number])[] = [[1280, 720], [1024, 768], [1024, 600], [960, 800], [901, 800], [1024, 474]];
const FOLDED_WINDOWS: readonly (readonly [number, number])[] = [[1024, 600], [901, 800]];
const FLOOR_PLAIN = 4.5;
const ON_MAIN: readonly { fault: string; row: string }[] = [
  { fault: `/specimen/ at 901x800: p#sb-status.status "the status pill, as a ro" meets aside#specimen.slip`, row: "the handbook/errata/site.md row on the Specimen's status pill over its slip" },
];

type Box = { x: number; y: number; r: number; b: number };
type Ink = Box & { piece: number; t: string };
type Stage = {
  chartRoom: true; ready: boolean; drawn: boolean; innerW: number; innerH: number;
  sheet: Box; under: boolean; reserveRight: number; presses: number[]; risen: boolean;
  ink: Ink[]; pieces: string[]; contains: [number, number][]; footing: (Box & { piece: number }) | null;
};
type Read = { page: string; size: string; s: Stage };

const STAGE: Payload<Stage | { chartRoom: false; ready: boolean }> = `(() => {
  const ready = document.readyState === "complete" && (!document.fonts || document.fonts.status === "loaded");
  const sheet = document.getElementById("sheet");
  if (!document.querySelector("body.chart-room .stage") || !sheet) return { chartRoom: false, ready };
  const r1 = (n) => Math.round(n * 10) / 10;
  const box = (b) => ({ x: r1(b.left), y: r1(b.top), r: r1(b.right), b: r1(b.bottom) });
  const frame = document.querySelector("[style*='--reserve-right']");
  const legend = document.querySelector(".legend:not(.in-slip)");
  const unseen = (el) => { for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) === 0) return true; } return false; };
  const pieceEls = [];
  const pieceOf = (el) => { for (let e = el; e && e !== document.body; e = e.parentElement) { const p = getComputedStyle(e).position; if (p === "fixed" || p === "absolute" || p === "sticky") { let i = pieceEls.indexOf(e); if (i < 0) { pieceEls.push(e); i = pieceEls.length - 1; } return i; } } return -1; };
  const clipOf = (el, b) => { let c = { x: b.left, y: b.top, r: b.right, b: b.bottom }; for (let e = el.parentElement; e && e !== document.body; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.overflowX !== "visible" || cs.overflowY !== "visible") { const q = e.getBoundingClientRect(); c = { x: Math.max(c.x, q.left), y: Math.max(c.y, q.top), r: Math.min(c.r, q.right), b: Math.min(c.b, q.bottom) }; } } return c.r - c.x > 0.5 && c.b - c.y > 0.5 ? c : null; };
  const skip = "svg, noscript, script, style, .desk-notice, #map, .living-chart, .place-hit, #sheet";
  const ink = [];
  const add = (el, b, t) => { const c = clipOf(el, b); const piece = pieceOf(el); if (c && piece >= 0 && c.r > 0 && c.x < innerWidth && c.b > 0 && c.y < innerHeight) ink.push({ ...box({ left: c.x, top: c.y, right: c.r, bottom: c.b }), piece, t }); };
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    const el = n.parentElement;
    if (!n.textContent.trim() || !el || el.closest(skip) || el.closest("button, select") || unseen(el)) continue;
    const rg = new Range(); rg.selectNodeContents(n);
    for (const b of rg.getClientRects()) if (b.width > 0.5 && b.height > 0.5) add(el, b, n.textContent.trim().slice(0, 24));
  }
  for (const c of document.querySelectorAll("input:not([type=hidden]), button, select, textarea")) {
    if (c.closest(skip) || unseen(c)) continue;
    const b = c.getBoundingClientRect();
    if (b.width > 0.5 && b.height > 0.5) add(c, b, c.tagName.toLowerCase() + (c.id ? "#" + c.id : ""));
  }
  const contains = [];
  pieceEls.forEach((a, i) => pieceEls.forEach((b, j) => { if (i !== j && a.contains(b)) contains.push([i, j]); }));
  let footing = null;
  if (legend) {
    const ps = getComputedStyle(legend, "::before");
    if (ps.content !== "none" && ps.display !== "none") {
      const lb = legend.getBoundingClientRect();
      footing = { ...box({ left: lb.left + parseFloat(ps.left), top: lb.top + parseFloat(ps.top), right: lb.right - parseFloat(ps.right), bottom: lb.bottom - parseFloat(ps.bottom) }), piece: pieceOf(legend.querySelector(".legend-row") || legend) };
    }
  }
  const status = document.querySelector(".stage .status");
  return { chartRoom: true, ready, drawn: !status || !status.textContent.trim().endsWith("\u2026"), innerW: innerWidth, innerH: innerHeight,
    sheet: box(sheet.getBoundingClientRect()), under: document.body.classList.contains("stage-under"),
    reserveRight: frame ? parseFloat(frame.style.getPropertyValue("--reserve-right")) : NaN,
    presses: legend ? [...legend.querySelectorAll(".legend-row .legend-btn")].map((b) => b.getBoundingClientRect()).filter((b) => b.width > 0).map((b) => r1(b.top)) : [],
    risen: !!legend && legend.style.bottom !== "",
    ink, pieces: pieceEls.map((e) => e.tagName.toLowerCase() + (e.id ? "#" + e.id : "") + (typeof e.className === "string" && e.className ? "." + e.className.trim().split(" ").slice(0, 2).join(".") : "")), contains, footing };
})()`;

const meets = (a: Box, b: Box): boolean => Math.min(a.r, b.r) - Math.max(a.x, b.x) > 0.5 && Math.min(a.b, b.b) - Math.max(a.y, b.y) > 0.5;

export function stageFaults({ page, size, s }: Read): string[] {
  const faults: string[] = [];
  const at = `${page} at ${size}`;
  const w = s.sheet.r - s.sheet.x, h = s.sheet.b - s.sheet.y;
  if (!(w > 0 && h > 0)) return [`${at}: no sheet (${w} x ${h})`];
  const room = Math.min(s.innerW - s.reserveRight - 2 * CHROME_GAP, (s.innerH - 2 * CHROME_GAP) * (w / h));
  if (!Number.isFinite(room)) faults.push(`${at}: no reserve read`);
  if (s.under && Math.abs(w - room) > 1) faults.push(`${at}: floored at ${w.toFixed(1)}, not the whole room ${room.toFixed(1)}`);
  if (!s.under && w < room / 2 - 0.5) faults.push(`${at}: the sheet is ${w.toFixed(1)}, under half its room ${room.toFixed(1)}, and not floored`);
  if (s.under && (s.sheet.x < -0.5 || s.sheet.y < -0.5 || s.sheet.r > s.innerW + 0.5 || s.sheet.b > s.innerH + 0.5)) faults.push(`${at}: the floored sheet leaves the window (${JSON.stringify(s.sheet)})`);
  if (pressRowStacks(s.presses)) faults.push(`${at}: the Press stacks down the page (${s.presses.join(", ")})`);
  const nested = (a: number, b: number): boolean => a === b || s.contains.some(([p, q]) => (p === a && q === b) || (p === b && q === a));
  for (let i = 0; i < s.ink.length; i++) for (let j = i + 1; j < s.ink.length; j++) {
    const a = s.ink[i]!, b = s.ink[j]!;
    if (!nested(a.piece, b.piece) && meets(a, b)) faults.push(`${at}: ${s.pieces[a.piece]} "${a.t}" meets ${s.pieces[b.piece]} "${b.t}"`);
  }
  const footing = s.footing;
  if (footing) for (const b of s.ink) if (!nested(footing.piece, b.piece) && meets(footing, b)) faults.push(`${at}: the Press's footing lies over ${s.pieces[b.piece]} "${b.t}"`);
  return faults;
}

// At rest: the document and its fonts are in, the stage no longer reports a draw in progress (a line ending in an ellipsis), and the fit, the floor and the Press's seat read the same on STILL_READS polls running, since a plate with no draw to wait on (an empty Portfolio) gives no other signal.
const STILL_READS = 6;

async function rest(ctx: SuiteContext, w: number, h: number, label: string): Promise<Stage | null> {
  const settle = makeSettle(ctx);
  const key = (d: Stage): string => JSON.stringify([d.innerW, d.innerH, d.sheet, d.under, d.presses, d.risen, d.reserveRight, d.drawn]);
  let still = 0;
  const got = await settle(STAGE, (d, last) => {
    if (!d.ready) return false;
    if (!d.chartRoom) return true;
    still = last?.chartRoom && key(d) === key(last) ? still + 1 : 0;
    return d.innerW === w && d.innerH === h && d.drawn && still >= STILL_READS;
  }, `stage ${label}`, 300);
  return got.chartRoom ? got : null;
}

async function open(ctx: SuiteContext, page: string, w: number, h: number, laidOut: { w: number; h: number }, label: string): Promise<Stage | null> {
  await ctx.send("Page.navigate", { url: "about:blank" });
  await ctx.send("Page.navigate", { url: `http://127.0.0.1:${ctx.PORT}${page}` });
  return rest(ctx, laidOut.w, laidOut.h, `${label} ${page} ${w}x${h}`);
}

export type StageRun = { rooms: string[]; reads: Read[] };

export async function ea1Phone(ctx: SuiteContext): Promise<StageRun> {
  await ctx.setMobileViewport(PHONE.w, PHONE.h);
  const reads: Read[] = [];
  for (const page of routesUnder(resolve(REPO, "src/pages"))) {
    const s = await open(ctx, page, PHONE.w, PHONE.h, PHONE.laidOut, "EA1");
    if (s) reads.push({ page, size: `${PHONE.w}x${PHONE.h} phone`, s });
  }
  const rooms = reads.map((r) => r.page);
  const missing = CHART_ROOM_FLOOR.filter((p) => !rooms.includes(p));
  const floored = reads.filter((r) => r.s.under).map((r) => r.page);
  const faults = reads.flatMap(stageFaults);
  ctx.check(
    "EA1 on a phone held sideways (844x390, laid out 1024x474 by the fixed viewport) every chart room keeps at least half the room it could show its sheet in, a floored sheet takes all of it inside the window, the Press never stacks, and no chrome ink meets other chrome ink or the Press's footing; the Explorer and the Print Room floor (39x30 and 0x0 on screen on main) (Issue #762, rulings 4a and 4c)",
    missing.length === 0 && floored.includes("/explorer/") && floored.includes("/print-room/") && faults.length === 0,
    `${rooms.length} chart rooms${missing.length ? `, missing ${missing.join(", ")}` : ""}; floored ${floored.join(", ") || "none"}; ${faults.length ? `${faults.length} faults: ${faults.slice(0, 6).join("; ")}` : "no faults"}`,
  );
  return { rooms, reads };
}

async function fold(ctx: SuiteContext): Promise<void> {
  const at = await ctx.evaluate<{ x: number; y: number } | null>(`(() => { const b = document.querySelector(".slip-fold"); if (!b) return null; const r = b.getBoundingClientRect(); return r.width > 0 ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null; })()`);
  if (!at) throw new Error("the Broadside has no fold press to take");
  const sheetX: Payload<{ folded: boolean; x: number }> = `({ folded: document.querySelector(".slip").classList.contains("folded"), x: document.getElementById("sheet").getBoundingClientRect().left })`;
  const before = await ctx.evaluate(sheetX);
  await ctx.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: at.x, y: at.y });
  await ctx.send("Input.dispatchMouseEvent", { type: "mousePressed", x: at.x, y: at.y, button: "left", clickCount: 1 });
  await ctx.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: at.x, y: at.y, button: "left", clickCount: 1 });
  // The fold refits on a timer after its slide (FOLD_SETTLE_MS in src/site/shared/slip.ts), so the read waits for the sheet to leave where it stood, not for the class alone.
  await makeSettle(ctx)(sheetX, (d) => d.folded && Math.abs(d.x - before.x) > 1, "the Broadside folds and the sheet refits");
}

export async function eaDesk(ctx: SuiteContext): Promise<void> {
  await ctx.setTouch(false);
  const reads: Read[] = [];
  for (const page of routesUnder(resolve(REPO, "src/pages"))) {
    await ctx.send("Emulation.setDeviceMetricsOverride", { width: DESK.w, height: DESK.h, deviceScaleFactor: 1, mobile: false });
    const first = await open(ctx, page, DESK.w, DESK.h, DESK, "EA");
    if (!first) continue;
    reads.push({ page, size: `${DESK.w}x${DESK.h}`, s: first });
    for (const [w, h] of WINDOWS) {
      await ctx.send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: false });
      const s = await rest(ctx, w, h, `EA ${page} ${w}x${h}`);
      if (s) reads.push({ page, size: `${w}x${h}`, s });
    }
    if (page === "/explorer/") {
      await ctx.send("Emulation.setDeviceMetricsOverride", { width: DESK.w, height: DESK.h, deviceScaleFactor: 1, mobile: false });
      await rest(ctx, DESK.w, DESK.h, "EA the Explorer back at 1280");
      await fold(ctx);
      for (const [w, h] of FOLDED_WINDOWS) {
        await ctx.send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: false });
        const s = await rest(ctx, w, h, `EA folded ${w}x${h}`);
        if (s) reads.push({ page, size: `${w}x${h} folded`, s });
      }
    }
  }
  const rooms = [...new Set(reads.map((r) => r.page))];
  const missing = CHART_ROOM_FLOOR.filter((p) => !rooms.includes(p));
  const pick = (page: string, size: string): Stage | undefined => reads.find((r) => r.page === page && r.size === size)?.s;
  const all = reads.flatMap(stageFaults);
  const faults = [...all.filter((f) => !ON_MAIN.some((m) => f.startsWith(m.fault))), ...ON_MAIN.filter((m) => !all.some((f) => f.startsWith(m.fault))).map((m) => `${m.fault} no longer, so ${m.row} is fixed and its exemption goes`)];
  const control = reads.filter((r) => r.size === "1280x800" || r.size === "1280x720");
  const controlFaults = control.filter((r) => r.s.under || r.s.risen).map((r) => `${r.page} at ${r.size}: ${r.s.under ? "floored" : "risen"}`);
  ctx.check(
    "EA2 on a short laptop window (1024x600) the Print Room floors to the whole room and the Explorer keeps more than half its own, the Press standing above the chart folio (210.5 wide on main), and at 1024x474 the Explorer and the Print Room floor (Issue #762, ruling 4a)",
    pick("/print-room/", "1024x600")?.under === true && pick("/explorer/", "1024x600")?.under === false && pick("/explorer/", "1024x600")?.risen === true && pick("/explorer/", "1024x474")?.under === true && pick("/print-room/", "1024x474")?.under === true,
    `print-room 1024x600 ${JSON.stringify(pick("/print-room/", "1024x600")?.sheet)} under ${pick("/print-room/", "1024x600")?.under}; explorer 1024x600 ${JSON.stringify(pick("/explorer/", "1024x600")?.sheet)} under ${pick("/explorer/", "1024x600")?.under} risen ${pick("/explorer/", "1024x600")?.risen}`,
  );
  ctx.check(
    "EA3 the control: at 1280x800 and 1280x720 no chart room floors its sheet or raises its Press, so a healthy window keeps the layout main ships (Issue #762)",
    missing.length === 0 && control.length >= 2 * CHART_ROOM_FLOOR.length && controlFaults.length === 0,
    `${control.length} control reads over ${rooms.length} rooms${missing.length ? `, missing ${missing.join(", ")}` : ""}; ${controlFaults.join("; ") || "none floored or risen"}`,
  );
  ctx.check(
    "EL1 in every chart room, resized while loaded from 1280x800 through 1280x720, 1024x768, 1024x600, 960x800, 901x800 and 1024x474, and on the Explorer with the Broadside folded at 1024x600 and 901x800, the sheet keeps at least half its room (all of it when floored, inside the window), the Press never stacks down the page, and no chrome ink meets other chrome ink or the Press's footing (Issue #762)",
    missing.length === 0 && reads.length >= CHART_ROOM_FLOOR.length * (WINDOWS.length + 1) && faults.length === 0,
    `${reads.length} reads over ${rooms.length} rooms; ${faults.length ? `${faults.length} faults: ${faults.slice(0, 6).join("; ")}` : "no faults"}`,
  );
}

const channel = (v: number): number => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const relative = ([r, g, b]: readonly [number, number, number]): number => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
const ratio = (a: number, b: number): number => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
const median = (xs: number[]): number => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]!; };

type Glyph = { piece: string; t: string; ink: [number, number, number]; row: number; x: number; w: number };
type Ground = { piece: string; t: string; ratio: number };
const PIECES = "header.chrome, .corner, .strip, .legend:not(.in-slip)";

// Every text node of the chrome whose box centre stands on the sheet, by piece; decor hidden from assistive technology (the nav's separator dots) is left out, and the ink is the computed colour, so a translucent ancestor reads darker ink than it paints and errs toward passing.
const GLYPHS_OVER_SHEET: Payload<Glyph[]> = `(() => {
  const sheet = document.getElementById("sheet").getBoundingClientRect();
  const unseen = (el) => { for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) === 0) return true; } return false; };
  const name = (root) => root.matches("header.chrome") ? "cluster" : root.matches(".corner.tr") ? "room folio" : root.matches(".corner.bl") ? "chart folio" : root.matches(".corner.br") ? "Glass" : root.matches(".strip") ? "strip" : root.matches(".legend") ? "Press" : "corner";
  const out = [];
  for (const root of document.querySelectorAll(${JSON.stringify(PIECES)})) {
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      const el = n.parentElement;
      if (!n.textContent.trim() || !el || el.closest("[aria-hidden='true'], option, select, script, style") || unseen(el)) continue;
      const rg = new Range(); rg.selectNodeContents(n);
      const b = rg.getBoundingClientRect();
      if (!(b.width > 0)) continue;
      const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
      if (cx < sheet.left || cx > sheet.right || cy < sheet.top || cy > sheet.bottom) continue;
      const m = getComputedStyle(el).color.match(/[0-9.]+/g).map(Number);
      out.push({ piece: name(root), t: (el.classList.contains("fn") ? "the section mark " : "") + n.textContent.trim().slice(0, 24), ink: [m[0], m[1], m[2]], row: Math.round(cy), x: Math.max(0, Math.floor(b.left)), w: Math.max(1, Math.floor(b.width)) });
    }
    for (const input of root.querySelectorAll("input[type=number], input[type=text], input[type=search], input:not([type])")) {
      if (!input.value || unseen(input)) continue;
      const b = input.getBoundingClientRect(), cs = getComputedStyle(input);
      const x = b.left + parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth), w = b.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth);
      const cx = x + w / 2, cy = b.top + b.height / 2;
      if (!(w > 0) || cx < sheet.left || cx > sheet.right || cy < sheet.top || cy > sheet.bottom) continue;
      const m = cs.color.match(/[0-9.]+/g).map(Number);
      out.push({ piece: name(root), t: "the field " + (input.id || input.name || input.type), ink: [m[0], m[1], m[2]], row: Math.round(cy), x: Math.max(0, Math.floor(x)), w: Math.max(1, Math.floor(w)) });
    }
  }
  return out;
})()`;

const HIDE_TEXT = `header.chrome *, .legend *, .corner *, .strip * { color: transparent !important; text-decoration-color: transparent !important; }`;
const NO_POOLS = `body.stage-under :is(header.chrome, .legend, .corner, .strip)::before { content: none !important; }`;

async function withStyle<T>(ctx: SuiteContext, id: string, css: string, body: () => Promise<T>): Promise<T> {
  await ctx.evaluate(`(() => { const s = document.createElement("style"); s.id = ${JSON.stringify(id)}; s.textContent = ${JSON.stringify(css)}; document.head.appendChild(s); return true; })()`);
  try {
    return await body();
  } finally {
    await ctx.evaluate(`document.getElementById(${JSON.stringify(id)}).remove()`);
  }
}

async function grounds(ctx: SuiteContext, glyphs: readonly Glyph[]): Promise<Ground[]> {
  return withStyle(ctx, "ea4-hide", HIDE_TEXT, async () => {
    const out: Ground[] = [];
    for (const g of glyphs) {
      const row = await sampleRow(ctx.send, g.x, g.row, g.w);
      out.push({ piece: g.piece, t: g.t, ratio: ratio(relative(g.ink), median(row.map(relative))) });
    }
    return out;
  });
}

type Reading = { fixture: string; under: boolean; read: Ground[]; bare: Ground[]; needs: string; witnesses: readonly string[] };
const worstOf = (gs: readonly Ground[], piece?: string): number => gs.filter((g) => piece === undefined || g.piece === piece).reduce((m, g) => Math.min(m, g.ratio), Infinity);

async function readFixture(ctx: SuiteContext, fixture: string, page: string, folded: boolean, needs: string, witnesses: readonly string[]): Promise<Reading> {
  const { w, h } = PHONE.laidOut;
  const s = await open(ctx, page, w, h, PHONE.laidOut, `EA4 ${fixture}`);
  let under = s?.under === true;
  if (folded) {
    await fold(ctx);
    under = (await rest(ctx, w, h, `EA4 ${fixture} folded`))?.under === true;
  }
  const glyphs = await ctx.evaluate(GLYPHS_OVER_SHEET);
  const read = await grounds(ctx, glyphs);
  const bare = await withStyle(ctx, "ea4-bare", NO_POOLS, () => grounds(ctx, glyphs));
  return { fixture, under, read, bare, needs, witnesses };
}

// The room folio's and the strip's lines stand on their own fields and panel, which read 7.86 and 9.10 with every pool taken away (measured 2026-10-05), so their pool arms are the ruled dress and not a contrast need, and only the cluster's, the chart folio's and the Press's pools are witnessed here.
export async function ea4Reads(ctx: SuiteContext): Promise<void> {
  await ctx.setTouch(false);
  await ctx.send("Emulation.setDeviceMetricsOverride", { width: PHONE.laidOut.w, height: PHONE.laidOut.h, deviceScaleFactor: 1, mobile: false });
  const readings = [
    await readFixture(ctx, "the Explorer", "/explorer/", false, "Press", ["cluster", "chart folio", "Press"]),
    await readFixture(ctx, "the Print Room, its slip folded", "/print-room/", true, "room folio", []),
    await readFixture(ctx, "the Reading Room", "/reading-room/", false, "strip", []),
  ];
  const faults = readings.flatMap((r) => [
    ...(r.under ? [] : [`${r.fixture} is not floored`]),
    ...(r.read.some((g) => g.piece === r.needs) ? [] : [`${r.fixture} has no ${r.needs} line on the sheet`]),
    ...r.read.filter((g) => g.ratio < FLOOR_PLAIN).map((g) => `${r.fixture}: ${g.piece} "${g.t}" reads ${g.ratio.toFixed(2)}`),
    ...r.witnesses.filter((p) => !(worstOf(r.bare, p) < FLOOR_PLAIN)).map((p) => `${r.fixture}: the ${p} reads ${worstOf(r.bare, p).toFixed(2)} with the pools taken away, so the read cannot see its pool fail`),
  ]);
  const mark = readings[0]!.read.find((g) => g.t.startsWith("the section mark"));
  ctx.check(
    "EA4 over a floored chart at 1024x474 every chrome line whose glyphs stand on the sheet, a field's value among them, reads at 4.5:1 or better against the ground under it: on the Explorer (the section mark beside the Press among them), on the Print Room with its slip folded (the room folio over the sheet) and in the Reading Room (its strip over the sheet); on the Explorer the cluster, the chart folio and the Press each read under 4.5:1 in the same run with the pools taken away, so the read can see each of their pools fail (Issue #762, ruling 4b; the mark read 3.44 at the second plate sitting)",
    !!mark && faults.length === 0,
    readings.map((r) => `${r.fixture}: ${r.read.length} lines, worst ${worstOf(r.read).toFixed(2)}${r.witnesses.map((p) => `, ${p} bare ${worstOf(r.bare, p).toFixed(2)}`).join("")}`).join("; ") + (mark ? `; the section mark ${mark.ratio.toFixed(2)}` : "; no section mark read") + (faults.length ? `; ${faults.slice(0, 6).join("; ")}` : ""),
  );
}
