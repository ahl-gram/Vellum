// The 1024 floor (Issue #762 pull request C; Alex, 2026-10-06, issuecomment-6010814718), read in the Explorer and the Print Room: a sideways wheel at 640 scrolls the page and reaches every right-hand piece, a keyboard-opened Chart Table leaves the room where it stood, and a one-pixel window leaves the camera alone.
import { makeSettle } from "../../support/settle.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import { LANDED, rest, size } from "../stage/stage.ts";
import { mouseMove, mouseWheel, sendKey } from "../../support/input.ts";
import { bounce } from "../../support/nav.ts";

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
  for (const s of ["header.chrome", "main", ".corner.tr", ".corner.bl", ".corner.br", ".slip", ".slip-tab", ".legend", ".chart-drawer-tab", "#sheet", ".strip", ".sheet h2", "#lf-stage", "#lf-sheet", ".lf-seed", ".lf-legend", "#lf-controls", ".lf-coords", ".notice-stamp", ".lf-shelf"]) {
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

async function still(ctx: SuiteContext, page: string, w: number, h: number, label: string): Promise<Pieces> {
  await rest(ctx, w, h, label);
  return makeSettle(ctx)(
    PIECES,
    (d, last) =>
      d.ready && d.innerW === w && d.innerH === h && last !== null && JSON.stringify(d) === JSON.stringify(last),
    label,
    300,
  );
}

// A read that lands between documents is taken again (lane C on PR #795 caught one with no document element).
export async function load(ctx: SuiteContext, page: string, w: number, h: number): Promise<void> {
  await size(ctx, w, h);
  await bounce(ctx.send, `http://127.0.0.1:${ctx.PORT}${page}`);
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
  await mouseMove(ctx.send, x, y);
  await mouseWheel(ctx.send, x, y, dy, dx);
}

const FL2_ROOMS = ["/explorer/", "/print-room/"];

export async function fl2Reach(ctx: SuiteContext): Promise<void> {
  await ctx.setTouch(false);
  const settle = makeSettle(ctx);
  const faults: string[] = [];
  const rows: string[] = [];
  let control = false;
  for (const page of FL2_ROOMS) {
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
    "FL2 at a 640 window, in the Explorer and in the Print Room, a real sideways wheel over the sheet scrolls the page and does not zoom the chart, where a vertical wheel at the same place in the same run does zoom it (the control), and at the end of the scroll every right-hand piece (the room folio, the slip, the Glass, the drawer's tab) stands wholly in the window, each moved by exactly the scroll (Issue #762)",
    faults.length === 0 && control,
    `${rows.join(" | ")}; the control zoomed ${control}${faults.length ? `; ${faults.length} faults: ${faults.slice(0, 8).join("; ")}` : ""}`,
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
      await sendKey(ctx.send, "Enter", "Enter", 13, { text: "\r", nativeVirtualKeyCode: 13 });
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
