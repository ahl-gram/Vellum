import { GALLERY_COUNT, GALLERY_SEED } from "../../../src/cli/gallery.ts";
import { luminance, nearRgba, PAGE_RGBA, sampleRow, tokenRgba } from "../../support/pixel.ts";
import { makeSettle } from "../../support/settle.ts";
import type { Payload, Point } from "../../types.ts";
import type { RunningHeadKit } from "./kit.ts";

export async function rh10GalleryScrolled({ evaluate, send, check, sleep, visit }: RunningHeadKit): Promise<void> {
  // The harness window is tall, so this check pins its own viewport; the Gallery is the one chart room that scrolls and this suite its sole visitor.
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: "about:blank" });
  const galleryUp = await visit("/gallery/");
  type GalleryRead = { sh: number; y: number; plate: Point | null; loaded: boolean };
  let scrolled: GalleryRead | null = null;
  for (let i = 0; i < 100 && galleryUp; i++) {
    scrolled = JSON.parse(
      await evaluate<string>(
        `(() => { const sh = document.documentElement.scrollHeight; window.scrollTo(0, Math.min(1200, sh - innerHeight)); const imgs = [...document.querySelectorAll(".grid img")]; const b = imgs.map((el) => el.getBoundingClientRect()).find((r) => r.top > 100 && r.bottom < innerHeight - 20 && r.width > 100); return JSON.stringify({ sh, y: scrollY, plate: b ? { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) } : null, loaded: imgs.length > 0 && imgs.every((el) => el.complete && el.naturalWidth > 0) }); })()`,
      ),
    ) as GalleryRead;
    if (scrolled.plate && scrolled.loaded) break;
    await sleep(100);
  }
  await sleep(300);
  const plateRow = scrolled && scrolled.plate ? await sampleRow(send, scrolled.plate.x, scrolled.plate.y, 8) : [];
  const cornerRow = scrolled ? await sampleRow(send, 8, 8, 8) : [];
  const plateLum = plateRow.length ? Math.round(Math.max(...plateRow.map(luminance))) : -1;
  const cornerLum = cornerRow.length ? Math.round(Math.max(...cornerRow.map(luminance))) : -1;
  check(
    "RH10 the pixel helper reads the Gallery scrolled past a screen: a plate's centre bright (49 on the unfixed clip, 210 fixed) and the corner dark (the pool or the deep, either far from a plate) at one scroll state, which no blank frame is (the sitting's ruling 6, 2026-09-03)",
    !!scrolled && scrolled.y >= 800 && plateLum > 120 && cornerLum > 15 && cornerLum < 90,
    JSON.stringify({
      y: scrolled && scrolled.y,
      sh: scrolled && scrolled.sh,
      plate: scrolled && scrolled.plate,
      plateLum,
      cornerLum,
    }),
  );
}

export async function rh10cPrinted(
  { evaluate, send, check, sleep }: RunningHeadKit,
  galleryNarrow: boolean,
): Promise<void> {
  await send("Emulation.setEmulatedMedia", { media: "print" });
  const gPrint = galleryNarrow
    ? await evaluate<{
        content: string;
        folioPos: string;
        armed: boolean;
      } | null>(`(()=>{const e=document.querySelector(".corner.tr");if(!e)return null;const c=getComputedStyle(e,"::before");
    return{content:c.content,folioPos:getComputedStyle(e).position,armed:document.body.classList.contains("chart-room")&&!document.querySelector(".stage")};})()`)
    : null;
  type Fit = { scrollW: number; clientW: number; plates: number; maxRight: number; mainPadL: string };
  const FIT_READ: Payload<Fit> = `(()=>{const d=document.documentElement;const m=document.querySelector("main");const imgs=[...document.querySelectorAll(".grid img")];
    return{scrollW:d.scrollWidth,clientW:d.clientWidth,plates:imgs.length,maxRight:imgs.length?Math.round(Math.max(...imgs.map((el)=>el.getBoundingClientRect().right))):-1,mainPadL:m?getComputedStyle(m).paddingLeft:"absent"};})()`;
  // The poll breaks on the resize landing, never on the geometry the check asserts, and on exhaustion hands its last read to the check so a viewport that never resized reds RH10e by name instead of taking the suite.
  const fitAt = async (want: number): Promise<Fit | null> => {
    if (!galleryNarrow) return null;
    let read: Fit | null = null;
    for (let i = 0; i < 40; i++) {
      read = await evaluate(FIT_READ);
      if (read.clientW === want) return read;
      await sleep(50);
    }
    return read;
  };
  const gFit = await fitAt(390);
  await send("Emulation.setDeviceMetricsOverride", { width: 816, height: 1056, deviceScaleFactor: 1, mobile: false });
  const gFitLetter = await fitAt(816);
  await send("Emulation.setEmulatedMedia", { media: "" });
  check(
    "RH10c printed at 390, the Gallery's room folio stands in flow with NO panel (#538): the corner goes static on paper and the panel's absolute box resolved against the whole page (401 wide on the unfixed tree); the stage-less arm still matches under print, read in the same payload, so the none is the stand-down and not a lapsed arm. The page's own width moved to RH10d, which is where the plates' 2px lives (#565)",
    !!gPrint && gPrint.armed && gPrint.folioPos === "static" && gPrint.content === "none",
    JSON.stringify(gPrint),
  );
  check(
    "RH10d printed at 390x844 the Gallery fits its page: the widest plate's right edge lands ON the page's right edge and the document scrolls nowhere sideways (#565, 392 on 390 unfixed, a content-box plate at width 100% plus its 1px border). main's resolved side padding is the control, 16px on screen and 0 under the print block, and the plate reaching the edge is what keeps the fit from passing on a collapsed grid",
    !!gFit &&
      gFit.mainPadL === "0px" &&
      gFit.clientW === 390 &&
      gFit.plates > 0 &&
      gFit.scrollW === gFit.clientW &&
      gFit.maxRight === gFit.clientW,
    JSON.stringify(gFit),
  );
  check(
    "RH10e printed at 816x1056, a Letter page at 96dpi, the same holds across the two-column grid (818 on 816 unfixed: the defect is not width-specific, #565's 2026-09-11 comment). clientW 816 says the resize landed, so this cannot pass at the narrow width",
    !!gFitLetter &&
      gFitLetter.mainPadL === "0px" &&
      gFitLetter.clientW === 816 &&
      gFitLetter.plates > 0 &&
      gFitLetter.scrollW === gFitLetter.clientW &&
      gFitLetter.maxRight === gFitLetter.clientW,
    JSON.stringify(gFitLetter),
  );
}

type Room = {
  body: string[];
  band: boolean;
  footer: boolean;
  names: number;
  nameInMain: boolean;
  tagline: string;
  intro: boolean;
  scripts: string[];
  dateline: string | null;
  controls: boolean;
  inOrder: boolean;
  furniture: string[];
  legend: {
    label: string | null;
    head: string;
    count: number;
    gold: boolean;
    href: string | null;
    verb: string;
    room: string;
  } | null;
};

const ROOM_READ: Payload<Room> = `(() => {
  const q = (s) => document.querySelector(s);
  const before = (a, b) => !!q(a) && !!q(b) && (q(a).compareDocumentPosition(q(b)) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
  const legend = q("nav.legend"), roads = legend ? [...legend.querySelectorAll(".legend-btn")] : [], road = roads[0];
  return { body: [...document.body.classList], band: !!q(".band"), footer: !!q("footer"),
    names: document.querySelectorAll("h1.room-name").length, nameInMain: !!q("main h1"), tagline: q(".room-tagline")?.textContent.trim() ?? "", intro: !!q(".intro"),
    scripts: [...document.scripts].map((s) => s.src || "inline"), dateline: q(".folio-room .dateline")?.textContent.trim() ?? null, controls: !!q(".folio-room .folio-controls"),
    inOrder: before(".fog", ".grid") && before(".folio-room", "nav.legend"),
    furniture: [".vignette", ".stage", "#map-viewport", ".zoomery", ".slip", ".corner.bl", ".legend-dock"].filter((s) => q(s)),
    legend: legend && { label: legend.getAttribute("aria-label"), head: legend.querySelector(".legend-head")?.textContent.trim() ?? "", count: roads.length,
      gold: !!road && road.classList.contains("gold"), href: road?.getAttribute("href") ?? null, verb: road?.querySelector(".verb")?.textContent ?? "", room: road?.querySelector(".room")?.textContent ?? "" } };
})()`;

export async function rh21Room({ evaluate, check }: RunningHeadKit): Promise<void> {
  const g = await evaluate(ROOM_READ);
  check(
    "RH21 the Gallery is a chart room: the chart room's classes, no band, no footer, its one name standing in the corner with its tagline rather than on a sheet, no intro line, and no script but the shell's, the plates being composed at build (Issue #464 ruling 2)",
    g.body.includes("room") &&
      g.body.includes("chart-room") &&
      !g.band &&
      !g.footer &&
      g.names === 1 &&
      !g.nameInMain &&
      g.tagline.length > 0 &&
      !g.intro &&
      g.scripts.length === 1 &&
      g.scripts[0] === "inline",
    JSON.stringify(g),
  );
}

export async function rh22CornerAndRoad({ evaluate, check }: RunningHeadKit): Promise<void> {
  const g = await evaluate(ROOM_READ);
  const l = g.legend;
  check(
    "RH22 the Gallery's corner carries its name and a dateline counted from the composer's own constants, and no control; the fog hangs before the grid and the corner before the legend, with none of a stage room's furniture; and the legend row is one gold road back to the Explorer (Issue #464 ruling 2)",
    g.dateline === `${GALLERY_COUNT} charts, from seed ${GALLERY_SEED}` &&
      !g.controls &&
      g.inOrder &&
      g.furniture.length === 0 &&
      !!l &&
      l.label === "The road out" &&
      l.head.length > 0 &&
      l.count === 1 &&
      l.gold &&
      l.href === "/explorer/" &&
      l.verb === "Return to" &&
      l.room === "The Explorer",
    JSON.stringify(g),
  );
}

type Shade = { colour: number[]; geometry: string } | null;
type Panel = { stops: number[][]; insets: number[] };
type Dress = {
  padTop: number;
  bandH: number;
  rem: number;
  landing: string;
  border: [string, string, number[]];
  plate: Shade;
  caption: number[];
  title: number[];
  legendLeft: number;
  half: number;
  pool: [number[], string];
  panel: Panel;
  footing: Panel;
};

// Shared by the screen, hover and print reads: a box-shadow split into its colour and its geometry, and a gradient into its stops, each through the canvas normaliser.
const PARTS = `const rgba = ${PAGE_RGBA};
  const shade = (s) => { const m = /^(.+\\)) (-?[\\d.]+px -?[\\d.]+px -?[\\d.]+px -?[\\d.]+px)$/.exec(s); return m ? { colour: rgba(m[1]), geometry: m[2] } : null; };
  const panel = (sel) => { const cs = getComputedStyle(document.querySelector(sel), "::before"); const plain = /^linear-gradient\\((color|rgba?|oklab)\\(/.test(cs.backgroundImage);
    return { stops: plain ? (cs.backgroundImage.match(/(color|rgba?|oklab)\\([^)]*\\)/g) ?? []).map(rgba) : [], insets: [cs.top, cs.right, cs.bottom, cs.left].map(parseFloat) }; };`;

const DRESS_READ: Payload<Dress> = `(() => { ${PARTS}
  const q = (s) => document.querySelector(s), root = getComputedStyle(document.documentElement), rem = parseFloat(root.fontSize);
  const img = getComputedStyle(q("figure img")), pool = getComputedStyle(q("header.chrome"), "::before");
  return { padTop: parseFloat(getComputedStyle(q("main")).paddingTop), bandH: parseFloat(root.getPropertyValue("--band-h")) * rem, rem,
    landing: getComputedStyle(q(".grid")).animationName, border: [img.borderTopWidth, img.borderTopStyle, rgba(img.borderTopColor)], plate: shade(img.boxShadow),
    caption: rgba(getComputedStyle(q("figcaption")).color), title: rgba(getComputedStyle(q("figcaption strong")).color), legendLeft: parseFloat(getComputedStyle(q("nav.legend")).left), half: innerWidth / 2,
    pool: [rgba(pool.backgroundColor), pool.filter], panel: panel(".corner.tr"), footing: panel("nav.legend") };
})()`;

const CHART_INK = (a: number) => tokenRgba("--chart-ink", a);
const shadowOf = (s: Shade, geometry: string, alpha: number) =>
  !!s && s.geometry === geometry && nearRgba(s.colour, CHART_INK(alpha));
const panelOf = (p: Panel, rem: number, insets: readonly number[]) =>
  p.stops.length === 2 &&
  nearRgba(p.stops[0], CHART_INK(0.85)) &&
  nearRgba(p.stops[1], CHART_INK(0.72)) &&
  p.insets.every((v, i) => Math.abs(v - insets[i]! * rem) < 0.05);

const dressed = (d: Dress) =>
  d.bandH > 0 &&
  d.padTop >= d.bandH &&
  d.landing === "sheet-land" &&
  d.border[0] === "1px" &&
  d.border[1] === "solid" &&
  nearRgba(d.border[2], tokenRgba("--line-tan")) &&
  shadowOf(d.plate, "0px 12px 34px 0px", 0.4) &&
  nearRgba(d.caption, tokenRgba("--parchment")) &&
  nearRgba(d.title, tokenRgba("--parchment-bright")) &&
  Math.abs(d.legendLeft - d.half) < 0.5 &&
  nearRgba(d.pool[0], CHART_INK(0.92)) &&
  d.pool[1] === "blur(16px)" &&
  panelOf(d.panel, d.rem, [-0.7, -0.9, -0.8, -0.9]) &&
  panelOf(d.footing, d.rem, [-0.5, -1.1, -0.6, -1.1]);

type Lift = { x: number; y: number; hovered: boolean; moving: number; transform: string; shadow: Shade } | null;
const LIFT_READ: Payload<Lift> = `(() => { ${PARTS}
  const img = [...document.querySelectorAll("figure img")].find((e) => { const b = e.getBoundingClientRect(); return b.top > 120 && b.bottom < innerHeight - 40; });
  if (!img) return null; const b = img.getBoundingClientRect(), cs = getComputedStyle(img);
  return { x: b.x + b.width / 2, y: b.y + b.height / 2, hovered: img.matches(":hover"), moving: img.getAnimations().length, transform: cs.transform, shadow: shade(cs.boxShadow) };
})()`;

async function liftedPlate(k: RunningHeadKit): Promise<Lift> {
  const at = await k.evaluate(LIFT_READ);
  if (!at) throw new Error("no plate in view to lift");
  await k.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: at.x, y: at.y, button: "none" });
  try {
    return await makeSettle(k)(LIFT_READ, (d) => d.hovered && d.moving === 0, "plate-lifted", 40);
  } finally {
    await k.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 1, button: "none" });
  }
}

type Paper = { moving: number; plate: string; caption: number[] };
const PRINT_READ: Payload<Paper> = `(() => { ${PARTS}
  const img = document.querySelector("figure img");
  return { moving: img.getAnimations().length, plate: getComputedStyle(img).boxShadow, caption: rgba(getComputedStyle(document.querySelector("figcaption")).color) };
})()`;

async function printed(k: RunningHeadKit): Promise<Paper> {
  try {
    await k.send("Emulation.setEmulatedMedia", { media: "print" });
    // The plate transitions its box-shadow, so the switch to print starts a fade; paper is read once it has run out, as a printed page never shows one.
    return await makeSettle(k)(PRINT_READ, (d) => d.moving === 0, "gallery-printed", 40);
  } finally {
    await k.send("Emulation.setEmulatedMedia", { media: "" });
  }
}

// RH10 scrolls by script, which an overflow:hidden root still allows; a reader scrolls by the wheel, which it does not.
async function wheeled(k: RunningHeadKit): Promise<[number, number]> {
  const before = await k.evaluate<number>(`scrollY`);
  await k.wheel(640, 400, -300);
  const after = await makeSettle(k)<number>(`scrollY`, (y, last) => y !== before && last === y, "gallery-wheeled", 40);
  return [before, after];
}

export async function rh23Dress(k: RunningHeadKit): Promise<void> {
  const screen = await k.evaluate(DRESS_READ);
  const scroll = await wheeled(k);
  const lift = await liftedPlate(k);
  const paper = await printed(k);
  const turned = /^matrix\(([^)]+)\)$/
    .exec(lift?.transform ?? "")?.[1]
    ?.split(", ")
    .map(Number);
  k.check(
    "RH23 the Gallery's dress as drawn: the plates scroll under a real wheel, the chart room's lock lifted, the first row clears the cluster's band, the plates land as one sheet, each plate a line-tan hairline at the house's sheet depth that a hand tips and raises to the stage depth, captions in parchment and their titles parchment-bright, the legend row centred, the cluster's pool and the corner's and legend's crisp panels the kit's, and on paper no depth and captions in ink, the screen read the control (Issue #464 ruling 2; Issue #367)",
    scroll[1] < scroll[0] &&
      dressed(screen) &&
      !!turned &&
      Math.abs(turned[1]!) > 0.001 &&
      turned[5]! < 0 &&
      shadowOf(lift?.shadow ?? null, "0px 18px 60px 0px", 0.55) &&
      paper.plate === "none" &&
      nearRgba(paper.caption, tokenRgba("--ink-dark")),
    JSON.stringify({ scroll, screen, lift, paper }),
  );
}
