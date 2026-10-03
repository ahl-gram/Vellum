// The head cluster against the right-hand corner on every page (Issue #638): each page is resized while loaded, a pixel at a time across the phone band and at every media edge and a stride above it, and no box of the cluster's ink (its text line boxes and its controls) may overlap a box of the corner's. Ink, never a layout box, because a corner's layout box is wider than what it draws.
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { makeStep } from "../support/step.ts";
import type { Payload, SuiteContext } from "../types.ts";
import { fillBetween, mediaEdges, meetings, nearest, routesUnder, strideWidths, unreadWidthConditions, verdict, wrapVerdict } from "./corners/geometry.ts";
import type { Control, CornerRead, Row } from "./corners/geometry.ts";

const REPO = resolve(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
const PAGE_FLOOR = ["/", "/explorer/", "/faq/", "/gallery/", "/glossary/", "/print-room/", "/print-room/portfolio/", "/prospect/", "/reading-room/", "/ribbon/", "/seed-of-the-day/", "/specimen/"];
const FOLD = 900;
const BELOW_WIDE = 1023;
const SQUEEZED_ALREADY: Readonly<Record<string, string>> = { "/specimen/": "Issue #741" };
const PHONE_LO = 320;
const EVERY_PIXEL_TO = 480;
const WIDE = 1280;
const STRIDE = 32;
const PHONE_H = 844;
const WIDE_H = 800;
const GALLERY_FORCED_BELOW = 346;
const MAX_FRAMES = 40;

type PageResult = { readonly page: string; readonly stretches: readonly (readonly Row[])[]; readonly unread: readonly string[]; readonly dateline: string | null; readonly error: string | null };

const READ = `(() => {
  const r2 = (n) => Math.round(n * 100) / 100;
  const unseen = (el) => { if (getComputedStyle(el).visibility !== "visible") return true; for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === "none" || parseFloat(cs.opacity) === 0) return true; } return false; };
  const ink = (root) => {
    const out = [];
    if (!root) return out;
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      if (!n.textContent.trim() || n.parentElement.closest("option, select, button") || unseen(n.parentElement)) continue;
      const rg = new Range(); rg.selectNodeContents(n);
      for (const b of rg.getClientRects()) if (b.width > 0 && b.height > 0) out.push({ x: r2(b.left), y: r2(b.top), r: r2(b.right), b: r2(b.bottom), t: n.textContent.trim().slice(0, 32) });
    }
    for (const c of root.querySelectorAll("input, button, select, textarea")) {
      if (unseen(c)) continue;
      const b = c.getBoundingClientRect();
      if (b.width > 0 && b.height > 0) out.push({ x: r2(b.left), y: r2(b.top), r: r2(b.right), b: r2(b.bottom), t: c.tagName.toLowerCase() + (c.id ? "#" + c.id : "." + String(c.className).split(" ")[0]) });
    }
    return out;
  };
  const root = getComputedStyle(document.documentElement);
  const sentinel = document.getElementById("co-vw");
  return { innerW: innerWidth, clientW: document.documentElement.clientWidth, vw: sentinel ? r2(sentinel.getBoundingClientRect().width) : -1,
    left: ink(document.querySelector("header.chrome")), right: ink(document.querySelector(".corner.tr.folio-room") || document.querySelector(".lf-seed")),
    clusterBottom: r2(document.querySelector("header.chrome").getBoundingClientRect().bottom),
    bandH: document.querySelector(".band") ? r2(parseFloat(root.getPropertyValue("--band-h")) * parseFloat(root.fontSize)) : null };
})`;

// A read is taken only once the media queries see the width set, a 100vw sentinel matches the width vw resolves against (a vw length is not recomputed until the resizing pauses: measured 2026-10-03 on home's calc(100vw - 15rem) cap, which a one-frame read never applied from 396 down to 320), and two frame reads agree.
const restAt = (w: number): Payload<CornerRead> => `new Promise((resolve, reject) => {
  const read = ${READ};
  let last = null, frames = 0;
  const tick = () => {
    const r = read();
    const key = JSON.stringify(r);
    const ready = matchMedia("(width: ${w}px)").matches && r.vw === r.clientW;
    if (ready && key === last) { resolve(r); return; }
    last = ready ? key : null;
    if (++frames > ${MAX_FRAMES}) { reject(new Error("no rest at ${w}: " + key)); return; }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})`;

const MEDIA: Payload<string[]> = `(() => { const out = []; const walk = (rules) => { for (const r of rules) { if (r instanceof CSSMediaRule) out.push(r.media.mediaText); if (r.cssRules) walk(r.cssRules); } }; for (const s of document.styleSheets) { try { walk(s.cssRules); } catch {} } return out; })()`;

// The page's own dateline must be datelineFor's for today (or yesterday, across a UTC midnight) before the sweep swaps in the widest one.
const WIDEST_DATELINE: Payload<string> = `(async () => {
  const { datelineFor } = await import("/explorer/engine/world/seed-of-the-day.js");
  const el = document.getElementById("dateline");
  const booted = el.textContent, now = Date.now();
  if (booted !== datelineFor(new Date(now)) && booted !== datelineFor(new Date(now - 86400000))) throw new Error("the page wrote its own dateline: " + JSON.stringify(booted));
  let best = "", widest = -1;
  for (let t = Date.UTC(2026, 0, 1); t < Date.UTC(2126, 0, 1); t += 86400000) {
    el.textContent = datelineFor(new Date(t));
    const rg = new Range(); rg.selectNodeContents(el);
    for (const b of rg.getClientRects()) if (b.width > widest) { widest = b.width; best = el.textContent; }
  }
  el.textContent = best;
  return best;
})()`;

async function load(ctx: SuiteContext, page: string, w: number, mobile: boolean): Promise<string | null> {
  const { send, evaluate, sleep, PORT } = ctx;
  if (mobile) await ctx.setMobileViewport(w, PHONE_H);
  else {
    await ctx.setTouch(false);
    await send("Emulation.setDeviceMetricsOverride", { width: w, height: WIDE_H, deviceScaleFactor: 1, mobile: false });
  }
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}${page}` });
  let up = false;
  for (let i = 0; i < 300 && !up; i++) {
    up = await evaluate<boolean>(`document.readyState === "complete" && (!document.fonts || document.fonts.status === "loaded") && !!document.querySelector("header.chrome") && !!(document.querySelector(".corner.tr.folio-room") || document.querySelector(".lf-seed")) && (!document.getElementById("dateline") || document.getElementById("dateline").textContent !== "")`).catch(() => false);
    if (!up) await sleep(50);
  }
  if (!up) throw new Error(`${page} never came up at ${w}`);
  await evaluate(`(() => { const s = document.createElement("div"); s.id = "co-vw"; s.style.cssText = "position:fixed;left:0;top:0;width:100vw;height:0;visibility:hidden;pointer-events:none"; document.body.appendChild(s); return true; })()`);
  return page === "/seed-of-the-day/" ? evaluate(WIDEST_DATELINE, true) : null;
}

async function readAt(ctx: SuiteContext, w: number, mobile: boolean): Promise<Row> {
  await ctx.send("Emulation.setDeviceMetricsOverride", { width: w, height: mobile ? PHONE_H : WIDE_H, deviceScaleFactor: 1, mobile });
  return { w, read: await ctx.evaluate(restAt(w), true) };
}

async function readStretch(ctx: SuiteContext, widths: readonly number[], mobile: boolean): Promise<Row[]> {
  const rows: Row[] = [];
  let prev: Row | null = null;
  for (const w of widths) {
    const row = await readAt(ctx, w, mobile);
    if (prev) for (const fill of fillBetween(prev, row)) rows.push(await readAt(ctx, fill, mobile));
    rows.push(row);
    prev = row;
  }
  return rows;
}

async function sweepPage(ctx: SuiteContext, page: string): Promise<PageResult> {
  const stretches: Row[][] = [];
  const unread: string[] = [];
  let dateline: string | null = null;
  try {
    dateline = await load(ctx, page, FOLD, true);
    const narrowMedia = await ctx.evaluate(MEDIA);
    unread.push(...unreadWidthConditions(narrowMedia));
    const pixels = Array.from({ length: EVERY_PIXEL_TO - PHONE_LO + 1 }, (_, i) => EVERY_PIXEL_TO - i);
    stretches.push(await readStretch(ctx, [...strideWidths(FOLD, EVERY_PIXEL_TO + 1, STRIDE, mediaEdges(narrowMedia, EVERY_PIXEL_TO, FOLD)), ...pixels], true));
    const wideDateline = await load(ctx, page, WIDE, false);
    if (wideDateline) dateline = `${dateline ?? ""}; above the fold ${wideDateline}`;
    const wideMedia = await ctx.evaluate(MEDIA);
    unread.push(...unreadWidthConditions(wideMedia));
    stretches.push(await readStretch(ctx, strideWidths(WIDE, FOLD + 1, STRIDE, mediaEdges(wideMedia, FOLD, WIDE)), false));
    return { page, stretches, unread, dateline, error: null };
  } catch (err) {
    return { page, stretches, unread, dateline, error: err instanceof Error ? err.message.slice(0, 400) : String(err) };
  }
}

async function co1Sweep(ctx: SuiteContext): Promise<void> {
  const pages = routesUnder(resolve(REPO, "src/pages"));
  const missing = PAGE_FLOOR.filter((p) => !pages.includes(p));
  const results: PageResult[] = [];
  for (const page of pages) results.push(await sweepPage(ctx, page));
  const lines = results.map((r) => {
    const rules = { forcedBelow: r.page === "/gallery/" ? GALLERY_FORCED_BELOW : null, keepsMotto: r.page === "/" };
    const rows = r.stretches.flat();
    const faults = [
      ...[...new Set(r.unread)].map((text) => `a width condition the edge reader cannot parse: ${text}`),
      ...rows.map((row) => verdict(row, rules)).filter((v): v is string => v !== null),
    ];
    const measured = rows.filter((row) => rules.forcedBelow === null || row.w >= rules.forcedBelow);
    const close = measured.reduce<{ d: number; w: number }>((best, row) => { const d = nearest(row.read.left, row.read.right); return d < best.d ? { d, w: row.w } : best; }, { d: Infinity, w: 0 });
    return { ok: r.error === null && faults.length === 0, text: `${r.page} ${rows.length} widths, nearest ${close.d.toFixed(1)} at ${close.w}${r.dateline ? ` (dateline "${r.dateline}")` : ""}${r.error ? `; ERROR ${r.error}` : ""}${faults.length ? `; ${faults.length} faults: ${faults.slice(0, 4).join("; ")}` : ""}` };
  });
  ctx.check(
    "CO1 on every page the tree builds, resized while loaded from 320 to 480 a pixel at a time and at both sides of every width media edge its CSS carries and a 32px stride up to 1280, no ink of the head cluster overlaps the ink of the right-hand corner by any amount, both corners carry ink, home keeps its motto, the band covers the cluster, the Seed of the Day writes its own dateline through datelineFor, and the Gallery's too-wide layout below 346 is the only width that lays out wider than set (Issue #638; Alex's 2026-09-22 and 2026-10-03 rulings; Issue #672)",
    missing.length === 0 && lines.every((l) => l.ok),
    `${missing.length ? `pages missing from the tree: ${missing.join(", ")} | ` : ""}${lines.map((l) => l.text).join(" | ")}`,
  );
}

// Each control's own width, read by lifting its flex-shrink for one read and putting it back: a row too narrow for its controls shrinks them, and a row that wraps leaves them whole.
const CONTROLS: Payload<Control[]> = `(() => {
  const out = [];
  const corner = document.querySelector(".corner.tr.folio-room");
  if (!corner) return out;
  for (const c of corner.querySelectorAll("input, button, select, textarea")) {
    const w = c.getBoundingClientRect().width;
    if (!w) continue;
    const kept = c.style.flexShrink;
    c.style.flexShrink = "0";
    const natural = c.getBoundingClientRect().width;
    c.style.flexShrink = kept;
    out.push({ t: c.tagName.toLowerCase() + (c.id ? "#" + c.id : "." + String(c.className).split(" ")[0]), w, natural });
  }
  return out;
})()`;

async function co3Wraps(ctx: SuiteContext): Promise<void> {
  const rows: string[] = [];
  const faults: string[] = [];
  let read = 0;
  for (const page of routesUnder(resolve(REPO, "src/pages"))) {
    await load(ctx, page, BELOW_WIDE, false);
    for (const w of [BELOW_WIDE, 960, FOLD + 1]) {
      await readAt(ctx, w, false);
      const controls = await ctx.evaluate(CONTROLS);
      read += controls.length;
      faults.push(...wrapVerdict(page, w, controls, SQUEEZED_ALREADY));
    }
    rows.push(page);
  }
  ctx.check(
    "CO3 from the fold to 1023, where a wide room's corner takes the kit's standard width (Alex's 2026-10-03 ruling 4), no control in any room's corner is squeezed below its own width: the row wraps onto another line instead; the Specimen Book, which squeezes at every width above the fold on main too, is exempt until Issue #741 lands and fails here the day it stops (Issue #638)",
    faults.length === 0 && read > 0,
    `${rows.length} pages, ${read} control reads; ${faults.length ? faults.slice(0, 6).join("; ") : "none squeezed"}`,
  );
}

async function co2Control(ctx: SuiteContext): Promise<void> {
  const { evaluate, check } = ctx;
  await load(ctx, "/explorer/", PHONE_LO, true);
  const before = (await readAt(ctx, PHONE_LO, true)).read;
  await evaluate(`(() => { const s = document.createElement("style"); s.id = "co-control"; s.textContent = "body.room header.chrome .tagline { visibility: visible !important; display: block !important; max-width: none !important; }"; document.head.appendChild(s); return true; })()`);
  const restored = await evaluate(restAt(PHONE_LO), true);
  await evaluate(`document.getElementById("co-control").remove()`);
  const after = await evaluate(restAt(PHONE_LO), true);
  const [hit] = meetings(restored.left, restored.right);
  check(
    "CO2 the same-run control: on the Explorer at 320 the instrument reads the corners clear, reports the motto running under the seed box by 40px or more once a style puts the motto back, and reads them clear again when the style goes (Issue #638)",
    meetings(before.left, before.right).length === 0 && !!hit && hit.w >= 40 && meetings(after.left, after.right).length === 0,
    `before ${meetings(before.left, before.right).length} meetings; restored ${hit ? `"${hit.a}" over "${hit.b}" by ${hit.w.toFixed(1)} x ${hit.h.toFixed(1)}` : "none"}; after ${meetings(after.left, after.right).length} meetings`,
  );
}

export async function run(ctx: SuiteContext): Promise<void> {
  const step = makeStep(ctx);
  const { send } = ctx;
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  try {
    await step("CO1", () => co1Sweep(ctx));
    await step("CO2", () => co2Control(ctx));
    await step("CO3", () => co3Wraps(ctx));
  } finally {
    await send("Emulation.setEmulatedMedia", { media: "", features: [] }).catch(() => undefined);
    await ctx.clearMobile().catch(() => undefined);
    await send("Emulation.setDeviceMetricsOverride", { width: WIDE, height: WIDE_H, deviceScaleFactor: 1, mobile: false }).catch(() => undefined);
  }
}
