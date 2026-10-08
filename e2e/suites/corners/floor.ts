// The 1024 floor (Issue #762 pull request C; Alex, 2026-10-06, issuecomment-6010814718): a window narrower than 1024 keeps every page's 1024 layout at full size and scrolls sideways, the scroll reaches every piece, a layout fired while scrolled keeps every piece where it stood, and a room that scrolls down keeps its chrome in view.
import { ATLAS_ROUTE } from "../../../scripts/generate-discovery.ts";
import { PAGE_FLOOR } from "../../../src/site/shared/page-box.ts";
import { makeSettle } from "../../support/settle.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import { CHART_ROOM_FLOOR, LANDED, rest } from "../stage/stage.ts";

const SCROLLING_ROOMS = ["/faq/", "/glossary/", "/gallery/"];
const ROOMS = [...CHART_ROOM_FLOOR, ...SCROLLING_ROOMS];
const HOME = "/";
const SCROLLS_DOWN = [...SCROLLING_ROOMS, HOME];
export const FLOOR_PAGES = [...ROOMS, HOME, ATLAS_ROUTE];
const FLOOR = PAGE_FLOOR;
const ATLAS_PIECES = [
  "body.atlas-sheet > header",
  "body.atlas-sheet > figure",
  ".atlas-sheet .styles",
  ".atlas-sheet .themes",
  "body.atlas-sheet > footer",
];
const TOLERANCE = 0.5;

type Box = [number, number, number, number];
type Pieces = {
  innerW: number;
  innerH: number;
  sx: number;
  over: number;
  cw: number;
  pieces: Record<string, Box>;
  navLines: number;
  ready: boolean;
};

// Page coordinates: the viewport rect plus the root's sideways scroll, so a read taken scrolled compares with one taken at rest.
const PIECES: Payload<Pieces> = `(() => {
  if (!document.documentElement || !document.body) return { ready: false, pieces: {} };
  const sx = scrollX, r1 = (n) => Math.round(n * 10) / 10;
  const box = (e) => { const r = e.getBoundingClientRect(); return r.width === 0 && r.height === 0 ? null : [r1(r.left + sx), r1(r.top), r1(r.width), r1(r.height)]; };
  const pieces = {};
  for (const s of ["header.chrome", "main", ".corner.tr", ".corner.bl", ".corner.br", ".slip", ".slip-tab", ".legend", ".chart-drawer-tab", "#sheet", ".strip", ".sheet h2", "#lf-stage", "#lf-sheet", ".lf-seed", ".lf-legend", "#lf-controls", ".lf-coords", ".notice-stamp", ".lf-shelf", ...${JSON.stringify(ATLAS_PIECES)}]) {
    const e = document.querySelector(s);
    const b = e && getComputedStyle(e).visibility !== "hidden" ? box(e) : null;
    if (b) pieces[s] = b;
  }
  const root = document.documentElement, nav = document.querySelector("header.chrome nav.rooms");
  const navLines = nav ? new Set([...nav.querySelectorAll("a, [aria-current]")].map((d) => Math.round(d.getBoundingClientRect().top))).size : 0;
  const st = document.querySelector("#lf-stage.cam"), cam = st && st.querySelector("#lf-sheet");
  // On a fresh load home's sheet can report its stage-sized box after the camera is written and the page is complete (main's build too, and on CI longer, measured 2026-10-06), so the camera counts as laid out only once the sheet's box is the one the page wrote.
  const wrote = cam && cam.style.transform ? new DOMMatrixReadOnly(cam.style.transform) : null, cr = cam ? cam.getBoundingClientRect() : null, sr = st ? st.getBoundingClientRect() : null;
  const camera = !document.getElementById("lf-stage") || (!!wrote && Math.abs(cr.width - cam.offsetWidth * wrote.a) < 1 && Math.abs(cr.left - sr.left - wrote.e) < 1 && Math.abs(cr.top - sr.top - wrote.f) < 1);
  return { innerW: innerWidth, innerH: innerHeight, sx, over: root.scrollWidth - root.clientWidth, cw: root.clientWidth, pieces, navLines, ready: document.readyState === "complete" && (!document.fonts || document.fonts.status === "loaded") && camera && ${LANDED} };
})()`;

const size = (ctx: SuiteContext, w: number, h: number): Promise<unknown> =>
  ctx.send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: false });

async function still(ctx: SuiteContext, page: string, w: number, h: number, label: string): Promise<Pieces> {
  if (!SCROLLING_ROOMS.includes(page)) await rest(ctx, w, h, label);
  return makeSettle(ctx)(
    PIECES,
    (d, last) =>
      d.ready && d.innerW === w && d.innerH === h && last !== null && JSON.stringify(d) === JSON.stringify(last),
    label,
    300,
  );
}

// A read that lands between documents is taken again (lane C on PR #795 caught one with no document element).
async function load(ctx: SuiteContext, page: string, w: number, h: number): Promise<void> {
  await size(ctx, w, h);
  await ctx.send("Page.navigate", { url: "about:blank" });
  await ctx.send("Page.navigate", { url: `http://127.0.0.1:${ctx.PORT}${page}` });
  const committed = `location.pathname === ${JSON.stringify(page.split("#")[0])} && document.readyState === "complete" && !!document.querySelector("main, body.atlas-sheet")`;
  for (let i = 0; i < 300; i++) {
    if (await ctx.evaluate<boolean>(committed).catch(() => false)) return;
    await ctx.sleep(50);
  }
  throw new Error(`floor: ${page} never came up`);
}

async function open(ctx: SuiteContext, page: string, w: number, h: number): Promise<Pieces> {
  await load(ctx, page, w, h);
  return still(ctx, page, w, h, `floor ${page} ${w}x${h}`);
}

async function resized(ctx: SuiteContext, page: string, w: number, h: number): Promise<Pieces> {
  await size(ctx, w, h);
  return still(ctx, page, w, h, `floor ${page} resized to ${w}x${h}`);
}

export function differences(at: string, got: Pieces, want: Pieces): string[] {
  const out: string[] = [];
  for (const s of new Set([...Object.keys(want.pieces), ...Object.keys(got.pieces)])) {
    const a = got.pieces[s],
      b = want.pieces[s];
    if (!a || !b) out.push(`${at}: ${s} ${a ? "appears" : "is gone"} against the 1024 read`);
    else if (a.some((n, i) => Math.abs(n - b[i]!) > TOLERANCE))
      out.push(`${at}: ${s} at ${JSON.stringify(a)} against ${JSON.stringify(b)} at 1024`);
  }
  return out;
}

const overhang = (at: string, p: Pieces): string[] =>
  Math.abs(p.over - (Math.max(p.cw, FLOOR) - p.cw)) > TOLERANCE
    ? [`${at}: the page overhangs the window by ${p.over}, not ${FLOOR - p.cw}`]
    : [];

export async function fl1Floor(ctx: SuiteContext): Promise<void> {
  await ctx.setTouch(false);
  const faults: string[] = [];
  const rows: string[] = [];
  for (const page of FLOOR_PAGES) {
    const fresh = await open(ctx, page, FLOOR, 800);
    if (Object.keys(fresh.pieces).length === 0)
      faults.push(`${page} 1024x800: no piece read, so every comparison below is empty`);
    if (page === ATLAS_ROUTE)
      faults.push(
        ...ATLAS_PIECES.filter((s) => !(s in fresh.pieces)).map(
          (s) => `${page} 1024x800: the atlas piece ${s} was not read`,
        ),
      );
    const wide = await resized(ctx, page, 1100, 800);
    const at800 = await resized(ctx, page, FLOOR, 800);
    const at400 = await resized(ctx, page, FLOOR, 400);
    for (const [at, p] of [
      [`${page} 1024x800`, fresh],
      [`${page} 1024x400`, at400],
      [`${page} 1100x800`, wide],
    ] as const)
      if (p.over > TOLERANCE) faults.push(`${at}: scrolls sideways by ${p.over} at or above the floor`);
    const narrow = await open(ctx, page, 640, 800);
    faults.push(...overhang(`${page} 640x800`, narrow), ...differences(`${page} 640x800`, narrow, fresh));
    const n900 = await resized(ctx, page, 900, 800);
    faults.push(...overhang(`${page} 900x800`, n900), ...differences(`${page} 900x800`, n900, at800));
    if (SCROLLS_DOWN.includes(page)) {
      const slim = await resized(ctx, page, 400, 800);
      faults.push(...overhang(`${page} 400x800`, slim), ...differences(`${page} 400x800`, slim, at800));
      if (slim.navLines !== 1) faults.push(`${page} 400x800: the nav runs to ${slim.navLines} lines`);
    }
    const short = await resized(ctx, page, 640, 400);
    faults.push(...overhang(`${page} 640x400`, short), ...differences(`${page} 640x400`, short, at400));
    rows.push(`${page} ${Object.keys(at800.pieces).length} pieces, overhang ${narrow.over} at 640`);
  }
  ctx.check(
    "FL1 a window narrower than 1024 lays out every page's 1024 layout at full size and scrolls sideways by exactly the page's overhang: every piece of chrome, the sheet and the main column (on home its stage, its camera's sheet, its seed panel, legend, Glass, bearing line, stamp and shelf) stand where they stand at 1024 of the same height, and on the served atlas, outside the tree, its head, hero plate, two plate grids and foot (Issue #763 ruling 3B), freshly loaded at 640x800 and resized to 900x800 and 640x400, the pages that scroll down at 400x800 too with their nav on one line; and no page scrolls sideways at 1024 or 1100 (Alex, 2026-10-06, on Issue #762)",
    faults.length === 0,
    `${rows.join(" | ")}${faults.length ? `; ${faults.length} faults: ${faults.slice(0, 8).join("; ")}` : ""}`,
  );
}

type View = {
  sx: number;
  zoomed: boolean;
  target: { x: number; y: number } | null;
  inView: string[];
  outOfView: string[];
};
const VIEW: Payload<View> = `(() => {
  const t = document.getElementById("sheet") || document.querySelector(".sheet") || document.querySelector("main");
  const r = t.getBoundingClientRect();
  const x = Math.min(Math.max(r.left + r.width / 2, 20), innerWidth - 20), y = Math.min(Math.max(r.top + r.height / 2, 20), innerHeight - 20);
  const inView = [], outOfView = [];
  for (const s of [".corner.tr", ".slip", ".corner.br", ".chart-drawer-tab"]) {
    const e = document.querySelector(s);
    if (!e) continue;
    const b = e.getBoundingClientRect();
    if (b.width === 0) continue;
    (b.left >= -0.5 && b.right <= innerWidth + 0.5 ? inView : outOfView).push(s);
  }
  return { sx: scrollX, zoomed: !!document.querySelector("#map-viewport.zoomed"), target: { x, y }, inView, outOfView };
})()`;

async function wheel(ctx: SuiteContext, x: number, y: number, dx: number, dy: number): Promise<void> {
  await ctx.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
  await ctx.send("Input.dispatchMouseEvent", { type: "mouseWheel", x, y, deltaX: dx, deltaY: dy });
}

export async function fl2Reach(ctx: SuiteContext): Promise<void> {
  await ctx.setTouch(false);
  const settle = makeSettle(ctx);
  const faults: string[] = [];
  const rows: string[] = [];
  let control = false;
  for (const page of ROOMS) {
    const rested = await open(ctx, page, 640, 800);
    const start = await ctx.evaluate<View>(VIEW);
    for (let i = 0; i < 6; i++) await wheel(ctx, start.target!.x, start.target!.y, 120, 6);
    const moved = await settle(
      VIEW,
      (d, last) => d.sx > 0 && last !== null && d.sx === last.sx,
      `FL2 ${page} the sideways wheel`,
    );
    if (moved.zoomed) faults.push(`${page}: a sideways wheel zoomed the chart`);
    await ctx.evaluate(`window.scrollTo(100000, 0)`);
    const end = await settle(VIEW, (d, last) => last !== null && d.sx === last.sx, `FL2 ${page} at the end`);
    const scrolled = await still(ctx, page, 640, 800, `FL2 ${page} scrolled`);
    faults.push(
      ...end.outOfView.map((s) => `${page}: ${s} still out of view at the end of the scroll`),
      ...differences(`${page} scrolled`, scrolled, rested),
    );
    if (page === "/explorer/") {
      const v = await ctx.evaluate<View>(VIEW);
      await wheel(ctx, v.target!.x, v.target!.y, 0, -240);
      control = (await settle(VIEW, (d) => d.zoomed, `FL2 the control: a vertical wheel zooms`)).zoomed;
    }
    rows.push(`${page} scrolled ${end.sx}, ${end.inView.length} right-hand pieces in view`);
  }
  ctx.check(
    "FL2 at a 640 window a real sideways wheel over the sheet (or the text) scrolls the page and does not zoom the chart, where a vertical wheel at the same place in the same run does zoom it (the control), and at the end of the scroll every right-hand piece (the room folio, the slip, the Glass, the drawer's tab) stands wholly in the window, each moved by exactly the scroll (Issue #762)",
    faults.length === 0 && control,
    `${rows.join(" | ")}; the control zoomed ${control}${faults.length ? `; ${faults.length} faults: ${faults.slice(0, 8).join("; ")}` : ""}`,
  );
}

// Every read compared is taken after the same number of layout passes, since the Reading Room's and the Print Room's fits move on the second pass on main's build too (the handbook/errata/site.md rows). The witness (measured 2026-10-06 on the step 6 probe): with the page scrolled 384 at 640x800, a resize laid the Explorer's Press out at page x -358 against 26, its viewport x written back as a page one.
export async function fl3Relayout(ctx: SuiteContext): Promise<void> {
  await ctx.setTouch(false);
  const faults: string[] = [];
  for (const page of CHART_ROOM_FLOOR) {
    await open(ctx, page, 640, 800);
    await resized(ctx, page, 641, 800);
    const rested = await resized(ctx, page, 640, 800);
    await ctx.evaluate(`window.scrollTo(100000, 0)`);
    await resized(ctx, page, 641, 800);
    const back = await resized(ctx, page, 640, 800);
    if (back.sx === 0) faults.push(`${page}: the scroll did not hold through the resize, so nothing was read scrolled`);
    faults.push(...differences(`${page} laid out again while scrolled`, back, rested));
  }
  ctx.check(
    "FL3 a layout fired while the page is scrolled sideways (a resize and back, at 640x800 scrolled fully right) leaves every piece of chrome and the sheet where the unscrolled page has them, in every chart room: the scripts place pieces in page coordinates, never the window's (Issue #762)",
    faults.length === 0,
    faults.length
      ? `${faults.length} faults: ${faults.slice(0, 8).join("; ")}`
      : `${CHART_ROOM_FLOOR.length} rooms held`,
  );
}

type Held = { sx: number; sy: number; ys: Record<string, number>; focus: { inView: boolean; hit: boolean } | null };
const HELD: Payload<Held> = `(() => {
  const ys = {};
  for (const s of ["header.chrome", ".corner.tr", ".slip"]) { const e = document.querySelector(s); if (e) ys[s] = Math.round(e.getBoundingClientRect().top * 10) / 10; }
  const a = document.activeElement;
  let focus = null;
  if (a && a.matches(".index .sec")) { const b = a.getBoundingClientRect(); const e = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); focus = { inView: b.left >= 0 && b.right <= innerWidth && b.top >= 0 && b.bottom <= innerHeight, hit: e === a || a.contains(e) }; }
  return { sx: scrollX, sy: scrollY, ys, focus };
})()`;

const heldFaults = (where: string, top: Held, reads: readonly (readonly [string, Held])[]): string[] =>
  reads.flatMap(([at, read]) => [
    ...Object.entries(top.ys)
      .filter(([s, y]) => Math.abs((read.ys[s] ?? NaN) - y) > TOLERANCE)
      .map(([s, y]) => `${where}: ${s} moved from ${y} to ${read.ys[s]} ${at}`),
    ...(read.sx !== 0 ? [`${where}: the window swung ${read.sx}px sideways ${at}, which only the reader may do`] : []),
  ]);

export async function fl4Read(ctx: SuiteContext): Promise<void> {
  await ctx.setTouch(false);
  const settle = makeSettle(ctx);
  const faults: string[] = [];
  for (const page of ["/faq/", "/glossary/"]) {
    for (const w of [640, 1280]) {
      await open(ctx, page, w, 800);
      const top = await ctx.evaluate<Held>(HELD);
      await ctx.evaluate(`window.scrollTo(0, 900)`);
      const down = await settle(
        HELD,
        (d, last) => d.sy >= 899 && last !== null && JSON.stringify(d) === JSON.stringify(last),
        `FL4 ${page} ${w} scrolled down`,
      );
      await ctx.evaluate(`window.scrollTo(0, document.documentElement.scrollHeight)`);
      const end = await settle(
        HELD,
        (d, last) => d.sy > down.sy && last !== null && JSON.stringify(d) === JSON.stringify(last),
        `FL4 ${page} ${w} at the end`,
      );
      faults.push(
        ...heldFaults(`${page} at ${w}`, top, [
          ["scrolled down", down],
          ["at the document's end", end],
        ]),
      );
      if (w === 640) {
        await ctx.evaluate(`window.scrollTo(0, 0)`);
        await ctx.evaluate(`document.querySelector(".index .sec").focus()`);
        const f = await settle(
          HELD,
          (d, last) => d.focus !== null && last !== null && JSON.stringify(d) === JSON.stringify(last),
          `FL4 ${page} the index link focused`,
        );
        if (!f.focus!.inView || !f.focus!.hit)
          faults.push(
            `${page} at 640: the focused index link ${f.focus!.inView ? "is in the window but takes no hit" : "is out of the window"}`,
          );
      }
    }
  }
  ctx.check(
    "FL4 a room that scrolls down keeps its head cluster, room folio and index where they stand while the text scrolls, down the page and at its end, at 640 and 1280, the window never swinging sideways on its own while the reader scrolls down (the index's ink keeps its row in view by scrolling the index alone), and at 640 a keyboard focus on the index's first link brings it into the window where it takes a hit (Issue #762)",
    faults.length === 0,
    faults.length ? `${faults.length} faults: ${faults.slice(0, 8).join("; ")}` : "the FAQ and the Glossary held",
  );
}

type Displaced = {
  open: boolean;
  running: number;
  bodyTop: number;
  bodyLeft: number;
  stageTop: number;
  stagePageLeft: number;
  focus: string;
};
const DISPLACED: Payload<Displaced> = `(() => {
  const d = document.getElementById("chart-drawer"), st = document.querySelector(".stage").getBoundingClientRect();
  return { open: d.classList.contains("open"), running: d.getAnimations().filter((a) => a.playState === "running").length, bodyTop: document.body.scrollTop, bodyLeft: document.body.scrollLeft,
    stageTop: Math.round(st.top * 10) / 10, stagePageLeft: Math.round((st.left + scrollX) * 10) / 10, focus: document.activeElement ? document.activeElement.id : "" };
})()`;

// Motion on, so the drawer is still sliding up from below the body when the press moves the focus into it; under `overflow: hidden` the body is a scroll container and that focus scrolls it.
export async function fl5KeyboardDrawer(ctx: SuiteContext): Promise<void> {
  await ctx.setTouch(false);
  const settle = makeSettle(ctx);
  const faults: string[] = [];
  const rows: string[] = [];
  await ctx.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });
  try {
    for (const w of [1280, 640]) {
      await open(ctx, "/explorer/", w, 800);
      await ctx.evaluate(`document.getElementById("chart-drawer-tab").focus()`);
      await ctx.send("Input.dispatchKeyEvent", {
        type: "keyDown",
        key: "Enter",
        code: "Enter",
        windowsVirtualKeyCode: 13,
        nativeVirtualKeyCode: 13,
        text: "\r",
      });
      await ctx.send("Input.dispatchKeyEvent", {
        type: "keyUp",
        key: "Enter",
        code: "Enter",
        windowsVirtualKeyCode: 13,
        nativeVirtualKeyCode: 13,
      });
      const d = await settle(
        DISPLACED,
        (x, last) => x.open && x.running === 0 && last !== null && JSON.stringify(x) === JSON.stringify(last),
        `FL5 the drawer opened by keyboard at ${w}`,
      );
      if (d.focus !== "chart-drawer-shut")
        faults.push(`at ${w}: the press left the focus on "${d.focus}", not the drawer's shut press`);
      if (d.bodyTop !== 0 || d.bodyLeft !== 0 || d.stageTop !== 0 || d.stagePageLeft !== 0)
        faults.push(
          `at ${w}: the room moved, the body scrolled to ${d.bodyLeft},${d.bodyTop} and the stage stands at ${d.stagePageLeft},${d.stageTop} on the page`,
        );
      rows.push(`${w}: body ${d.bodyLeft},${d.bodyTop}, stage ${d.stagePageLeft},${d.stageTop}, focus ${d.focus}`);
    }
  } finally {
    await ctx.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  }
  ctx.check(
    "FL5 the Chart Table opened by the keyboard, with motion on, takes the focus to its shut press and leaves the room where it stood: the body does not scroll and the stage keeps the page's corner, at 1280 and at 640 (Issue #762: a staged room's body clips rather than hides, so it is no scroll container under the floor's containment)",
    faults.length === 0,
    `${rows.join(" | ")}${faults.length ? `; ${faults.join("; ")}` : ""}`,
  );
}

// Paper is narrower than 900, so main's narrow blocks dressed it by accident; with them gone each room says what paper drops itself (the step 11 plate read on Issue #762 pull request C, real PDFs at Letter).
const PRINTED: Payload<{ tab: string | null; shadow: string | null; pad: number | null }> =
  `(() => { const t = document.getElementById("chart-drawer-tab"), s = document.querySelector("#sheet"), p = document.querySelector("main .sheet"); return { tab: t ? getComputedStyle(t).display : null, shadow: s ? getComputedStyle(s).boxShadow : null, pad: p ? parseFloat(getComputedStyle(p).paddingLeft) : null }; })()`;

export async function fl6Paper(ctx: SuiteContext): Promise<void> {
  await ctx.setTouch(false);
  const faults: string[] = [];
  const rows: string[] = [];
  for (const page of ["/explorer/", "/explorer/portfolio/", "/faq/", "/glossary/"]) {
    await load(ctx, page, 640, 800);
    const screen = await ctx.evaluate(PRINTED);
    await size(ctx, 816, 1056);
    await ctx.send("Emulation.setEmulatedMedia", { media: "print" });
    const paper = await ctx.evaluate(PRINTED).finally(() =>
      ctx.send("Emulation.setEmulatedMedia", {
        media: "",
        features: [{ name: "prefers-reduced-motion", value: "reduce" }],
      }),
    );
    if (page === "/explorer/" && (paper.tab !== "none" || screen.tab === "none"))
      faults.push(`the Explorer's drawer tab reads ${screen.tab} on screen and ${paper.tab} on paper`);
    if (page === "/explorer/portfolio/" && (paper.shadow !== "none" || screen.shadow === "none"))
      faults.push(`the Portfolio's sheet casts ${screen.shadow} on screen and ${paper.shadow} on paper`);
    if (
      (page === "/faq/" || page === "/glossary/") &&
      (paper.pad === null ||
        Math.abs(paper.pad - 816 * 0.04) > 0.5 ||
        screen.pad === null ||
        Math.abs(screen.pad - 40.96) > 0.5)
    )
      faults.push(`${page} pads its sheet ${screen.pad} on screen at 640 and ${paper.pad} on paper at 816`);
    rows.push(`${page} screen ${JSON.stringify(screen)} paper ${JSON.stringify(paper)}`);
  }
  ctx.check(
    "FL6 on paper a room drops what main's narrow blocks used to drop for it: the Explorer's drawer tab stands down, the Portfolio's sheet casts no shadow, and the Q & A's and the Glossary's sheet pads by paper's own 4vw (32.6 at Letter), while on screen at 640 the tab shows, the shadow casts and the padding keeps its 1024 floor of 40.96, the same-run controls (Issue #762)",
    faults.length === 0,
    `${rows.join(" | ")}${faults.length ? `; ${faults.join("; ")}` : ""}`,
  );
}

// A full-page capture shrinks the viewport to one pixel for a moment, and a layout fired then fitted a zero sheet that threw a deep camera to the map's corner (CD2b's red on this branch, 2 runs in 10 behind the harness's shot); reached here deliberately, by sizing the window to 1x1 and back.
type Cam = { x: number; y: number; k: number };
export async function fl7Degenerate(ctx: SuiteContext): Promise<void> {
  await ctx.setTouch(false);
  const settle = makeSettle(ctx);
  const CAM: Payload<Cam & { w: number }> =
    `(() => { const c = window.__vellumZoomState(); return { x: Math.round(c.x * 10) / 10, y: Math.round(c.y * 10) / 10, k: c.k, w: innerWidth }; })()`;
  await open(ctx, "/explorer/#seed=42&style=antique&legend=1&arms=0&beasts=0&cx=0.5625&cy=0.4375&k=8", 1280, 800);
  const before = await settle(
    CAM,
    (d, last) => d.w === 1280 && last !== null && JSON.stringify(d) === JSON.stringify(last),
    "FL7 the camera at rest",
  );
  await size(ctx, 1, 1);
  await settle(CAM, (d) => d.w === 1, "FL7 the one-pixel window");
  await size(ctx, 1280, 800);
  const after = await settle(
    CAM,
    (d, last) => d.w === 1280 && last !== null && JSON.stringify(d) === JSON.stringify(last),
    "FL7 the camera back at rest",
  );
  ctx.check(
    "FL7 a layout on a window too small to hold any sheet (1x1, as a full-page capture sets for a moment) leaves the room and its camera alone: the Explorer at k 8 sized to one pixel and back holds its camera to the pixel (Issue #762)",
    before.k === 8 &&
      after.k === before.k &&
      Math.abs(after.x - before.x) <= 0.5 &&
      Math.abs(after.y - before.y) <= 0.5,
    JSON.stringify({ before, after }),
  );
}
