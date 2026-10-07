// The head cluster against the right-hand corner on every page (Issue #638; Issue #762 pull request B): each page is resized while loaded, at a stride and at every media edge from 1024 up, every pixel between two reads that are not a plain shift, and no box of the cluster's ink (its text line boxes and its controls) may overlap a box of the corner's. Ink, never a layout box, because a corner's layout box is wider than what it draws.
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DISCOVERY_ROUTES } from "../../scripts/generate-discovery.ts";
import { makeSettle } from "../support/settle.ts";
import { makeStep } from "../support/step.ts";
import { onFixedDay } from "../support/fixed-day.ts";
import type { Payload, SuiteContext } from "../types.ts";
import { fillBetween, mediaEdges, meetings, nearest, pageFaults, routesUnder, strideWidths, squeezes } from "./corners/geometry.ts";
import type { Control, CornerRead, Row } from "./corners/geometry.ts";
import { ea1Phone, ea4Reads, ea5Lift, eaDesk } from "./stage/stage.ts";
import { co5Yields, co6Follows, co7Band } from "./corners/top-row.ts";
import { fl1Floor, fl2Reach, fl3Relayout, fl4Read, fl5KeyboardDrawer, fl6Paper, fl7Degenerate } from "./corners/floor.ts";
import { na4Lean, ns1Soft } from "./stage/short.ts";

const REPO = resolve(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
const PAGE_FLOOR = ["/", "/explorer/", "/explorer/portfolio/", "/faq/", "/gallery/", "/glossary/", "/print-room/", "/prospect/", "/reading-room/", "/ribbon/", "/seed-of-the-day/", "/specimen/"];
const YIELD_TOP = 1040;
const YIELD_MID = 1032;
// A page narrower than this lays out its 1024 layout (Alex, 2026-10-06, Issue #762), which FL1 holds piece for piece, so the sweeps read every page from here up.
const ROOM_FLOOR = 1024;
const WIDE = 1280;
const STRIDE = 32;
const WIDE_H = 800;
const MAX_FRAMES = 40;

type PageResult = { readonly page: string; readonly stretches: readonly (readonly Row[])[]; readonly media: readonly string[]; readonly dateline: string | null; readonly links: readonly string[]; readonly error: string | null };

const LINKS: Payload<string[]> = `[...document.querySelectorAll("a[href]")].map((a) => a.href).filter((h) => h.startsWith(location.origin + "/")).map((h) => new URL(h).pathname)`;

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
  return { innerW: innerWidth, clientW: document.documentElement.clientWidth, vw: sentinel ? r2(sentinel.getBoundingClientRect().width) : -1, scrollW: document.documentElement.scrollWidth,
    left: ink(document.querySelector("header.chrome")), right: ink(document.querySelector(".corner.tr.folio-room") || document.querySelector(".lf-seed")),
    clusterBottom: r2(document.querySelector("header.chrome").getBoundingClientRect().bottom),
    bandH: document.querySelector(".band") ? r2(parseFloat(root.getPropertyValue("--band-h")) * parseFloat(root.fontSize)) : null };
})`;

// A read is taken only once the media queries see the width set, a 100vw sentinel matches the width vw resolves against (a vw length is not recomputed until the resizing pauses: measured 2026-10-03 on home's since-removed calc(100vw - 15rem) cap, which a one-frame read never applied from 396 down to 320), and two frame reads agree.
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

const MEDIA: Payload<string[]> = `(() => { const out = []; const sheet = (s) => { if (s.media.mediaText) out.push(s.media.mediaText); try { walk(s.cssRules); } catch {} }; const walk = (rules) => { for (const r of rules) { if (r instanceof CSSMediaRule) out.push(r.media.mediaText); if (r instanceof CSSImportRule) { if (r.media.mediaText) out.push(r.media.mediaText); if (r.styleSheet) sheet(r.styleSheet); } if (r.cssRules) walk(r.cssRules); } }; for (const s of document.styleSheets) sheet(s); return out; })()`;

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

async function load(ctx: SuiteContext, page: string, w: number): Promise<string | null> {
  const { send, evaluate, sleep, PORT } = ctx;
  await ctx.setTouch(false);
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: WIDE_H, deviceScaleFactor: 1, mobile: false });
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

async function readAt(ctx: SuiteContext, w: number): Promise<Row> {
  await ctx.send("Emulation.setDeviceMetricsOverride", { width: w, height: WIDE_H, deviceScaleFactor: 1, mobile: false });
  return { w, read: await ctx.evaluate(restAt(w), true) };
}

async function readStretch(ctx: SuiteContext, widths: readonly number[]): Promise<Row[]> {
  const rows: Row[] = [];
  let prev: Row | null = null;
  for (const w of widths) {
    const row = await readAt(ctx, w);
    if (prev) for (const fill of fillBetween(prev, row)) rows.push(await readAt(ctx, fill));
    rows.push(row);
    prev = row;
  }
  return rows;
}

async function sweepPage(ctx: SuiteContext, page: string): Promise<PageResult> {
  const stretches: Row[][] = [];
  const media: string[] = [];
  const links: string[] = [];
  let dateline: string | null = null;
  try {
    dateline = await load(ctx, page, WIDE);
    media.push(...await ctx.evaluate(MEDIA));
    stretches.push(await readStretch(ctx, strideWidths(WIDE, ROOM_FLOOR, STRIDE, mediaEdges(media, ROOM_FLOOR - 1, WIDE))));
    // Read at the END of the stretch, seconds after the load, so a link the page's script rewrites (the Print Room's road on to the Portfolio waits for the proof) is read as rewritten.
    links.push(...await ctx.evaluate(LINKS));
    return { page, stretches, media, dateline, links, error: null };
  } catch (err) {
    return { page, stretches, media, dateline, links, error: err instanceof Error ? err.message.slice(0, 400) : String(err) };
  }
}

// The same-run control for the width-query half (Gate 2 item 9; the tree carries no width query to fault on): a rule planted on a loaded page must come back through MEDIA and be named by the very fault list CO1 counts.
const PLANTED = "@media (max-width: 900px) { .co-witness { color: red; } }";
async function floorControl(ctx: SuiteContext): Promise<{ clean: readonly string[]; planted: readonly string[] }> {
  await load(ctx, "/faq/", WIDE);
  const clean = pageFaults(await ctx.evaluate(MEDIA), [], ROOM_FLOOR);
  await ctx.evaluate(`(() => { const s = document.createElement("style"); s.id = "co-floor-control"; s.textContent = ${JSON.stringify(PLANTED)}; document.head.appendChild(s); return true; })()`);
  const planted = pageFaults(await ctx.evaluate(MEDIA), [], ROOM_FLOOR);
  await ctx.evaluate(`(() => { document.getElementById("co-floor-control").remove(); return true; })()`);
  return { clean, planted };
}

async function co1Sweep(ctx: SuiteContext): Promise<readonly PageResult[]> {
  const pages = routesUnder(resolve(REPO, "src/pages"));
  const missing = PAGE_FLOOR.filter((p) => !pages.includes(p));
  const results: PageResult[] = [];
  for (const page of pages) results.push(await sweepPage(ctx, page));
  const lines = results.map((r) => {
    const rows = r.stretches.flat();
    const faults = pageFaults(r.media, rows, ROOM_FLOOR);
    const close = rows.reduce<{ d: number; w: number }>((best, row) => { const d = nearest(row.read.left, row.read.right); return d < best.d ? { d, w: row.w } : best; }, { d: Infinity, w: 0 });
    return { ok: r.error === null && faults.length === 0, text: `${r.page} ${rows.length} widths, nearest ${close.d.toFixed(1)} at ${close.w}${r.dateline ? ` (dateline "${r.dateline}")` : ""}${r.error ? `; ERROR ${r.error}` : ""}${faults.length ? `; ${faults.length} faults: ${faults.slice(0, 4).join("; ")}` : ""}` };
  });
  const control = await floorControl(ctx);
  ctx.check(
    "CO1 on every page the tree builds, resized while loaded to 1280 at a 32px stride, every page from 1024, below which a page lays out its 1024 layout (FL1), and at both sides of every width media edge its CSS carries, every pixel between two reads that are not a plain shift, no ink of the head cluster overlaps the ink of the right-hand corner by any amount, both corners carry ink, every page keeps its motto, the band covers the cluster, nothing lays out wider than set or scrolls sideways, and the Seed of the Day writes its own dateline through datelineFor (Issue #638; Issue #762: re-floored at 1024, the motto kept everywhere); and no sheet any page loads, its own media list included, carries a width condition that switches at or below the 1024 floor, which a rule planted at 900 on the FAQ shows the same fault list naming (Issue #763 ruling 2A)",
    missing.length === 0 && lines.every((l) => l.ok) && control.clean.length === 0 && control.planted.some((f) => f.includes("(max-width: 900px)")),
    `${missing.length ? `pages missing from the tree: ${missing.join(", ")} | ` : ""}${lines.map((l) => l.text).join(" | ")} | control: clean ${JSON.stringify(control.clean)}, planted ${JSON.stringify(control.planted)}`,
  );
  return results;
}

/** A discovery route the sweep never opens (the atlas, written by the showcase generator rather than the tree): its links read once the document is complete and they stop changing, and its sheets' width conditions with them. */
async function linksAtRest(ctx: SuiteContext, page: string): Promise<{ links: readonly string[]; media: readonly string[] }> {
  await ctx.send("Page.navigate", { url: "about:blank" });
  await ctx.send("Page.navigate", { url: `http://127.0.0.1:${ctx.PORT}${page}` });
  const read: Payload<{ ready: string; links: string[]; media: string[] }> = `({ ready: document.readyState, links: ${LINKS}, media: ${MEDIA} })`;
  const rest = await makeSettle(ctx)(read, (d, last) => d.ready === "complete" && !!last && last.ready === "complete" && JSON.stringify(last.links) === JSON.stringify(d.links), `corners-links-${page}`, 200);
  return { links: rest.links, media: rest.media };
}

// Blind spots, each erring toward a miss: a link a script writes later than its page's sweep is read in its authored form; a button that navigates is not a link (the Chart Table's road is walked by CD18b); and with scripts on, a link inside <noscript> is not an element at all (the scaffold test's resolver and its scripts-off pin, and CD50, read the Portfolio's).
async function co4Roads(ctx: SuiteContext, swept: readonly PageResult[]): Promise<void> {
  const unswept = DISCOVERY_ROUTES.filter((route) => !swept.some((r) => r.page === route));
  const read: { page: string; links: readonly string[] }[] = [...swept];
  const floorFaults: string[] = [];
  for (const page of unswept) {
    const { links, media } = await linksAtRest(ctx, page);
    read.push({ page, links });
    floorFaults.push(...pageFaults(media, [], ROOM_FLOOR).map((f) => `${page}: ${f}`));
  }
  const from = new Map<string, string[]>();
  for (const r of read) for (const path of r.links) from.set(path, [...(from.get(path) ?? []), r.page]);
  const bare = read.filter((r) => r.links.length === 0).map((r) => r.page);
  const dead: string[] = [];
  for (const [path, pages] of from) {
    const status = (await fetch(`http://127.0.0.1:${ctx.PORT}${path}`)).status;
    if (status !== 200) dead.push(`${path} answers ${status}, linked from ${[...new Set(pages)].join(", ")}`);
  }
  ctx.check(
    "CO4 every link on every page the site serves, the tree's and every discovery route's (the atlas among them), read where it resolves once the page's scripts have run, opens a page that answers: a road written as a short relative path, or rewritten by a script, breaks silently otherwise (Issue #669, ruled 2026-10-04); and no sheet a discovery route beyond the sweep loads carries a width condition that switches at or below the 1024 floor, or one CO1's reader cannot parse (Issue #763 ruling 2A)",
    swept.length > 0 && unswept.length > 0 && bare.length === 0 && dead.length === 0 && floorFaults.length === 0,
    `${read.length} pages (${unswept.join(", ")} beyond the sweep), ${from.size} distinct paths${bare.length ? `; no links read on ${bare.join(", ")}` : ""}${dead.length ? `; ${dead.join("; ")}` : ""}${floorFaults.length ? `; ${floorFaults.join("; ")}` : ""}`,
  );
}

// Each control's own width, read by lifting its flex-shrink for one read and putting it back, its transition held off since under reduced motion the read otherwise returns the 0.01ms transition's start value: a row too narrow for its controls shrinks them, and a row that wraps leaves them whole.
const CONTROLS: Payload<Control[]> = `(() => {
  const out = [];
  const corner = document.querySelector(".corner.tr.folio-room") || document.querySelector(".lf-seed");
  if (!corner) return out;
  for (const c of corner.querySelectorAll("input, button, select, textarea")) {
    const w = c.getBoundingClientRect().width;
    if (!w) continue;
    const kept = c.style.flexShrink, held = c.style.transition;
    c.style.transition = "none";
    c.style.flexShrink = "0";
    const natural = c.getBoundingClientRect().width;
    c.style.flexShrink = kept;
    c.style.transition = held;
    out.push({ t: c.tagName.toLowerCase() + (c.id ? "#" + c.id : "." + String(c.className).split(" ")[0]), w, natural });
  }
  return out;
})()`;

async function co3Wraps(ctx: SuiteContext): Promise<void> {
  const rows: string[] = [];
  const faults: string[] = [];
  let read = 0;
  for (const page of routesUnder(resolve(REPO, "src/pages"))) {
    await load(ctx, page, page === "/" ? ROOM_FLOOR : YIELD_TOP);
    const yields = await ctx.evaluate<boolean>(`getComputedStyle(document.documentElement).getPropertyValue("--folio-cap").trim() !== ""`);
    const widths = [...(yields ? [YIELD_TOP, YIELD_MID] : []), ...(page === "/" ? [ROOM_FLOOR] : [])];
    for (const w of widths) {
      await readAt(ctx, w);
      const controls = await ctx.evaluate(CONTROLS);
      read += controls.length;
      faults.push(...squeezes(w, controls).map((f) => `${page} ${f}`));
    }
    if (widths.length) rows.push(page);
  }
  ctx.check(
    "CO3 no control in a right-hand corner is squeezed below its own width, the row wrapping onto another line instead: on home at 1024, and on a page whose corner carries its own cap and so gives way toward the kit's width, at 1032 and 1040 (Issue #762; Alex's 2026-10-03 ruling 4 on Issue #638); a page below 1024 lays out its 1024 layout (FL1), and the Print Room's and the Specimen's corners from 1024 up are Issue #741's (Alex, 2026-10-06, on Issue #762) (Issue #638)",
    faults.length === 0 && read > 0,
    `${rows.length} pages, ${read} control reads; ${faults.length ? `${faults.length} squeezed: ${faults.slice(0, 6).join("; ")}` : "none squeezed"}`,
  );
}

// A style outranks the top row's inline writes, and a synthetic resize reruns it: wiring, not a gesture. At the 1024 floor a corner pinned at its cap alone stands 8px clear, so the pin also moves it 6rem in.
const PIN_CAP = ".corner.tr.folio-room { max-width: 30rem !important; translate: -6rem 0 !important; }";
async function co2Control(ctx: SuiteContext): Promise<void> {
  const { evaluate, check } = ctx;
  const at = ROOM_FLOOR;
  await load(ctx, "/ribbon/", at);
  const before = (await readAt(ctx, at)).read;
  await evaluate(`(() => { const s = document.createElement("style"); s.id = "co-control"; s.textContent = ${JSON.stringify(PIN_CAP)}; document.head.appendChild(s); dispatchEvent(new Event("resize")); return true; })()`);
  const pinned = await evaluate(restAt(at), true);
  await evaluate(`(() => { document.getElementById("co-control").remove(); dispatchEvent(new Event("resize")); return true; })()`);
  const after = await evaluate(restAt(at), true);
  const [hit] = meetings(pinned.left, pinned.right);
  check(
    "CO2 the same-run control: on the Ribbon at 1024 the instrument reads the corners clear, reports the nav running under the corner by 40px or more once a style pins the corner at its 30rem cap, moved 6rem in, and reads them clear again when the style goes and the top row lays the row out again (Issue #638; Issue #762, at the floor since pull request C)",
    meetings(before.left, before.right).length === 0 && !!hit && hit.w >= 40 && meetings(after.left, after.right).length === 0,
    `before ${meetings(before.left, before.right).length} meetings; pinned ${hit ? `"${hit.a}" over "${hit.b}" by ${hit.w.toFixed(1)} x ${hit.h.toFixed(1)}` : "none"}; after ${meetings(after.left, after.right).length} meetings`,
  );
}

export async function run(ctx: SuiteContext): Promise<void> {
  const step = makeStep(ctx);
  try {
    await onFixedDay(ctx, async () => {
      let swept: readonly PageResult[] = [];
      await step("CO1", async () => { swept = await co1Sweep(ctx); });
      await step("CO4", () => co4Roads(ctx, swept));
      await step("CO2", () => co2Control(ctx));
      await step("CO3", () => co3Wraps(ctx));
      await step("CO5", () => co5Yields(ctx));
      await step("CO6", () => co6Follows(ctx));
      await step("CO7", () => co7Band(ctx));
      await step("FL1", () => fl1Floor(ctx));
      await step("FL2", () => fl2Reach(ctx));
      await step("FL3", () => fl3Relayout(ctx));
      await step("FL4", () => fl4Read(ctx));
      await step("FL5", () => fl5KeyboardDrawer(ctx));
      await step("FL6", () => fl6Paper(ctx));
      await step("FL7", () => fl7Degenerate(ctx));
      await step("NS1", () => ns1Soft(ctx));
      await step("NA4", () => na4Lean(ctx));
      await step("EA1", async () => { await ea1Phone(ctx); });
      await ctx.clearMobile();
      await step("EA2, EA3, EL1, EL2", () => eaDesk(ctx));
      await step("EA4", () => ea4Reads(ctx));
      await step("EA5", () => ea5Lift(ctx));
    });
  } finally {
    await ctx.clearMobile().catch(() => undefined);
    await ctx.send("Emulation.setDeviceMetricsOverride", { width: WIDE, height: WIDE_H, deviceScaleFactor: 1, mobile: false }).catch(() => undefined);
  }
}
