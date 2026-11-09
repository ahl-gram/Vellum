// The head cluster against the right-hand corner on the Print Room, the page whose corner comes nearest (Issue #638; Issue #762 pull request B; one room since Issue #1273 ruling 2): resized while loaded, at a stride and at every media edge from 1024 up, every pixel between two reads that are not a plain shift, and no box of the cluster's ink (its text line boxes and its controls) may overlap a box of the corner's. Ink, never a layout box, because a corner's layout box is wider than what it draws.
import { ATLAS_ROUTE } from "../../scripts/generate-discovery.ts";
import { PAGE_FLOOR as FLOOR_WIDTH } from "../../src/site/shared/page-box.ts";
import { makeSettle } from "../support/settle.ts";
import { makeStep } from "../support/step.ts";
import { withReducedMotion } from "../support/reduced-motion.ts";
import type { Payload, SuiteContext } from "../types.ts";
import { fillBetween, mediaEdges, meetings, nearest, pageFaults, strideWidths } from "./corners/geometry.ts";
import type { CornerRead, Row } from "./corners/geometry.ts";
import { fl2Reach, fl5KeyboardDrawer, fl7Degenerate } from "./corners/floor.ts";
import { fl8ChartOnPaper } from "./corners/floor-paper.ts";
import { bounce } from "../support/nav.ts";

// A page narrower than this lays out its 1024 layout (Alex, 2026-10-06, Issue #762), so the sweep reads from here up.
const ROOM_FLOOR = FLOOR_WIDTH;
const WIDE = 1280;
const STRIDE = 32;
const WIDE_H = 800;
const MAX_FRAMES = 40;

type PageResult = {
  readonly page: string;
  readonly stretches: readonly (readonly Row[])[];
  readonly media: readonly string[];
  readonly links: readonly string[];
  readonly error: string | null;
};

const LINKS: Payload<string[]> =
  `[...document.querySelectorAll("a[href]")].map((a) => new URL(a.getAttribute("href"), document.baseURI).href).filter((h) => h.startsWith(location.origin + "/")).map((h) => new URL(h).pathname)`;

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

const MEDIA: Payload<string[]> =
  `(() => { const out = []; const sheet = (s) => { if (s.media.mediaText) out.push(s.media.mediaText); try { walk(s.cssRules); } catch {} }; const walk = (rules) => { for (const r of rules) { if (r instanceof CSSMediaRule) out.push(r.media.mediaText); if (r instanceof CSSImportRule) { if (r.media.mediaText) out.push(r.media.mediaText); if (r.styleSheet) sheet(r.styleSheet); } if (r.cssRules) walk(r.cssRules); } }; for (const s of document.styleSheets) sheet(s); return out; })()`;

async function load(ctx: SuiteContext, page: string, w: number): Promise<void> {
  const { send, evaluate, sleep, PORT } = ctx;
  await ctx.setTouch(false);
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: WIDE_H, deviceScaleFactor: 1, mobile: false });
  await bounce(send, `http://127.0.0.1:${PORT}${page}`);
  let up = false;
  for (let i = 0; i < 300 && !up; i++) {
    up = await evaluate<boolean>(
      `document.readyState === "complete" && (!document.fonts || document.fonts.status === "loaded") && !!document.querySelector("header.chrome") && !!(document.querySelector(".corner.tr.folio-room") || document.querySelector(".lf-seed")) && (!document.getElementById("dateline") || document.getElementById("dateline").textContent !== "")`,
    ).catch(() => false);
    if (!up) await sleep(50);
  }
  if (!up) throw new Error(`${page} never came up at ${w}`);
  await evaluate(
    `(() => { const s = document.createElement("div"); s.id = "co-vw"; s.style.cssText = "position:fixed;left:0;top:0;width:100vw;height:0;visibility:hidden;pointer-events:none"; document.body.appendChild(s); return true; })()`,
  );
}

async function readAt(ctx: SuiteContext, w: number): Promise<Row> {
  await ctx.send("Emulation.setDeviceMetricsOverride", {
    width: w,
    height: WIDE_H,
    deviceScaleFactor: 1,
    mobile: false,
  });
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
  try {
    await load(ctx, page, WIDE);
    media.push(...(await ctx.evaluate(MEDIA)));
    stretches.push(
      await readStretch(ctx, strideWidths(WIDE, ROOM_FLOOR, STRIDE, mediaEdges(media, ROOM_FLOOR - 1, WIDE))),
    );
    // Read at the END of the stretch, seconds after the load, so a link the page's script rewrites (the Print Room's road on to the Portfolio waits for the proof) is read as rewritten.
    links.push(...(await ctx.evaluate(LINKS)));
    return { page, stretches, media, links, error: null };
  } catch (err) {
    return {
      page,
      stretches,
      media,
      links,
      error: err instanceof Error ? err.message.slice(0, 400) : String(err),
    };
  }
}

const PLANTED = "@media (max-width: 900px) { .co-witness { color: red; } }";

/** A discovery route the sweep never opens (the atlas, written by the showcase generator rather than the tree): its links read once the document is complete and they stop changing. */
async function linksAtRest(
  ctx: SuiteContext,
  page: string,
): Promise<{ links: readonly string[]; media: readonly string[] }> {
  await bounce(ctx.send, `http://127.0.0.1:${ctx.PORT}${page}`);
  const read: Payload<{ ready: string; links: string[]; media: string[] }> =
    `({ ready: document.readyState, links: ${LINKS}, media: ${MEDIA} })`;
  const rest = await makeSettle(ctx)(
    read,
    (d, last) =>
      d.ready === "complete" &&
      !!last &&
      last.ready === "complete" &&
      JSON.stringify(last.links) === JSON.stringify(d.links),
    `corners-links-${page}`,
    200,
  );
  return { links: rest.links, media: rest.media };
}

// Blind spots, each erring toward a miss: a link a script writes later than the Print Room's sweep is read in its authored form, and with scripts on a link inside <noscript> is not an element at all.
const CO1_PAGE = "/print-room/";

async function co1PrintRoom(ctx: SuiteContext): Promise<PageResult> {
  const r = await sweepPage(ctx, CO1_PAGE);
  const rows = r.stretches.flat();
  const faults = pageFaults(r.media, rows, ROOM_FLOOR);
  const close = rows.reduce<{ d: number; w: number }>(
    (best, row) => {
      const d = nearest(row.read.left, row.read.right);
      return d < best.d ? { d, w: row.w } : best;
    },
    { d: Infinity, w: 0 },
  );
  const clean = pageFaults(await ctx.evaluate(MEDIA), [], ROOM_FLOOR);
  await ctx.evaluate(
    `(() => { const s = document.createElement("style"); s.id = "co-floor-control"; s.textContent = ${JSON.stringify(PLANTED)}; document.head.appendChild(s); return true; })()`,
  );
  const planted = pageFaults(await ctx.evaluate(MEDIA), [], ROOM_FLOOR);
  await ctx.evaluate(`(() => { document.getElementById("co-floor-control").remove(); return true; })()`);
  ctx.check(
    "CO1 on the Print Room, whose corner comes nearest the head cluster of any page, resized while loaded to 1280 at a 32px stride from the 1024 floor and at both sides of every width media edge its CSS carries, every pixel between two reads that are not a plain shift, no ink of the head cluster overlaps the ink of the right-hand corner by any amount, both corners carry ink, the motto stays, the band covers the cluster, and nothing lays out wider than set or scrolls sideways (Issue #638; Issue #762); and no sheet the page loads, its own media list included, carries a width condition that switches at or below the 1024 floor, which a rule planted at 900 on the same page shows the same fault list naming (Issue #763 ruling 2A; one room since Issue #1273 ruling 2)",
    r.error === null &&
      faults.length === 0 &&
      clean.length === 0 &&
      planted.some((f) => f.includes("(max-width: 900px)")),
    `${CO1_PAGE} ${rows.length} widths, nearest ${close.d.toFixed(1)} at ${close.w}${r.error ? `; ERROR ${r.error}` : ""}${faults.length ? `; ${faults.length} faults: ${faults.slice(0, 4).join("; ")}` : ""} | control: clean ${JSON.stringify(clean)}, planted ${JSON.stringify(planted)}`,
  );
  return r;
}

async function co4PrintRoomAndAtlas(ctx: SuiteContext, printRoom: PageResult): Promise<void> {
  const atlas = await linksAtRest(ctx, ATLAS_ROUTE);
  const read = [
    { page: printRoom.page, links: printRoom.links },
    { page: ATLAS_ROUTE, links: atlas.links },
  ];
  const floorFaults = pageFaults(atlas.media, [], ROOM_FLOOR).map((f) => `${ATLAS_ROUTE}: ${f}`);
  const from = new Map<string, string[]>();
  for (const r of read) for (const path of r.links) from.set(path, [...(from.get(path) ?? []), r.page]);
  const bare = read.filter((r) => r.links.length === 0).map((r) => r.page);
  const dead: string[] = [];
  for (const [path, pages] of from) {
    const status = (await fetch(`http://127.0.0.1:${ctx.PORT}${path}`)).status;
    if (status !== 200) dead.push(`${path} answers ${status}, linked from ${[...new Set(pages)].join(", ")}`);
  }
  ctx.check(
    "CO4 every link on the Print Room, read at the end of CO1's sweep once its script has written its road on to the Portfolio, and every link on the served atlas, outside the tree, read once the document is complete and its links stop changing, opens a page that answers: a road written as a short relative path, or rewritten by a script, breaks silently otherwise (Issue #669, ruled 2026-10-04); and no sheet the atlas loads carries a width condition that switches at or below the 1024 floor, or one CO1's reader cannot parse (Issue #763 ruling 2A)",
    bare.length === 0 && dead.length === 0 && floorFaults.length === 0,
    `${from.size} distinct paths from ${read.map((r) => `${r.page} (${r.links.length})`).join(", ")}${bare.length ? `; no links read on ${bare.join(", ")}` : ""}${dead.length ? `; ${dead.join("; ")}` : ""}${floorFaults.length ? `; ${floorFaults.join("; ")}` : ""}`,
  );
}

// A style outranks the top row's inline writes, and a synthetic resize reruns it: wiring, not a gesture. At the 1024 floor a corner pinned at its cap alone stands 8px clear, so the pin also moves it 6rem in.
const PIN_CAP = ".corner.tr.folio-room { max-width: 30rem !important; translate: -6rem 0 !important; }";
async function co2Control(ctx: SuiteContext): Promise<void> {
  const { evaluate, check } = ctx;
  const at = ROOM_FLOOR;
  await load(ctx, "/ribbon/", at);
  const before = (await readAt(ctx, at)).read;
  await evaluate(
    `(() => { const s = document.createElement("style"); s.id = "co-control"; s.textContent = ${JSON.stringify(PIN_CAP)}; document.head.appendChild(s); dispatchEvent(new Event("resize")); return true; })()`,
  );
  const pinned = await evaluate(restAt(at), true);
  await evaluate(
    `(() => { document.getElementById("co-control").remove(); dispatchEvent(new Event("resize")); return true; })()`,
  );
  const after = await evaluate(restAt(at), true);
  const [hit] = meetings(pinned.left, pinned.right);
  check(
    "CO2 the same-run control: on the Ribbon at 1024 the instrument reads the corners clear, reports the nav running under the corner by 40px or more once a style pins the corner at its 30rem cap, moved 6rem in, and reads them clear again when the style goes and the top row lays the row out again (Issue #638; Issue #762, at the floor since pull request C)",
    meetings(before.left, before.right).length === 0 &&
      !!hit &&
      hit.w >= 40 &&
      meetings(after.left, after.right).length === 0,
    `before ${meetings(before.left, before.right).length} meetings; pinned ${hit ? `"${hit.a}" over "${hit.b}" by ${hit.w.toFixed(1)} x ${hit.h.toFixed(1)}` : "none"}; after ${meetings(after.left, after.right).length} meetings`,
  );
}

export async function run(ctx: SuiteContext): Promise<void> {
  const step = makeStep(ctx);
  try {
    await withReducedMotion(ctx, async () => {
      let printRoom: PageResult | null = null;
      await step("CO1", async () => {
        printRoom = await co1PrintRoom(ctx);
      });
      await step("CO4", () => co4PrintRoomAndAtlas(ctx, printRoom!));
      await step("CO2", () => co2Control(ctx));
      await step("FL2", () => fl2Reach(ctx));
      await step("FL5", () => fl5KeyboardDrawer(ctx));
      await step("FL7", () => fl7Degenerate(ctx));
      await step("FL8", () => fl8ChartOnPaper(ctx));
    });
  } finally {
    await ctx.clearMobile().catch(() => undefined);
    await ctx
      .send("Emulation.setDeviceMetricsOverride", { width: WIDE, height: WIDE_H, deviceScaleFactor: 1, mobile: false })
      .catch(() => undefined);
  }
}
