// The trail under the nav (Issue #668), read at 1280, 901 and 640, the last two laying out the 1024 page (Issue #762): its links answer a hit-test and one takes a real press, it clears a thumb's 24px round each of its links and the nav's, and the band and the Gallery give it ground. Every target is HIT-TESTED, never clicked through element.click().
import type { Payload, SuiteContext } from "../../types.ts";
import { makeSettle } from "../../support/settle.ts";
import { nearRgba, PAGE_RGBA, sampleRow, tokenRgba } from "../../support/pixel.ts";

type Box = { x: number; y: number; w: number; h: number; right: number; bottom: number };
type Target = Box & { t: string; hit: boolean };
type Trail = {
  path: string;
  whereVisibility: string | null;
  links: Target[];
  navLinks: Target[];
  linkColor: string | null;
  hereColor: string | null;
  hereLine: string | null;
};
export type TrailKit = ReturnType<typeof trailKit>;

const NARROW = 640;
const PARCHMENT = "rgb(239, 230, 207)";
const PARCHMENT_BRIGHT = "rgb(255, 247, 228)";

type Rgb = readonly [number, number, number];
const channel = (c: number) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const lum = ([r, g, b]: Rgb) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
const contrast = (a: Rgb, b: Rgb) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);
const median = (xs: number[]) => [...xs].sort((p, q) => p - q)[Math.floor(xs.length / 2)] ?? NaN;
const parseColour = (css: string): { rgb: Rgb; alpha: number } => {
  const srgb = css.match(/^color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)$/);
  if (srgb)
    return { rgb: [Number(srgb[1]) * 255, Number(srgb[2]) * 255, Number(srgb[3]) * 255], alpha: Number(srgb[4] ?? 1) };
  const rgba = css.match(/^rgba?\(([\d.]+), ([\d.]+), ([\d.]+)(?:, ([\d.]+))?\)$/);
  if (rgba) return { rgb: [Number(rgba[1]), Number(rgba[2]), Number(rgba[3])], alpha: Number(rgba[4] ?? 1) };
  return { rgb: [NaN, NaN, NaN], alpha: NaN };
};

async function underlineContrast(k: TrailKit): Promise<number> {
  const u = await k.evaluate<{ colour: string; line: string; x: number; w: number; bottom: number } | null>(
    `(() => { const a = document.querySelector("header.chrome .also a"); if (!a) return null; const b = a.getBoundingClientRect(); const cs = getComputedStyle(a); return { colour: cs.textDecorationColor, line: cs.textDecorationLine, x: b.x, w: b.width, bottom: b.bottom }; })()`,
  );
  if (!u || !u.line.split(" ").includes("underline")) return NaN;
  const row = await sampleRow(k.send, Math.round(u.x), Math.round(u.bottom + 3), Math.max(1, Math.round(u.w)));
  const ground: Rgb = [median(row.map((p) => p[0])), median(row.map((p) => p[1])), median(row.map((p) => p[2]))];
  const { rgb, alpha } = parseColour(u.colour);
  const ink: Rgb = [
    rgb[0] * alpha + ground[0] * (1 - alpha),
    rgb[1] * alpha + ground[1] * (1 - alpha),
    rgb[2] * alpha + ground[2] * (1 - alpha),
  ];
  return contrast(ink, ground);
}

const READ: Payload<Trail> = `(() => {
  const box = (e) => { const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height, right: b.right, bottom: b.bottom }; };
  const target = (e) => { const b = box(e); const hit = document.elementFromPoint(b.x + b.w / 2, b.y + b.h / 2); return { ...b, t: e.textContent, hit: !!hit && (hit === e || e.contains(hit)) }; };
  const where = document.querySelector("header.chrome .where");
  const here = document.querySelector("header.chrome .trail [aria-current], header.chrome .trail .here"), link = document.querySelector("header.chrome .trail a");
  return { path: location.pathname, whereVisibility: where ? getComputedStyle(where).visibility : null,
    links: [...document.querySelectorAll("header.chrome .where a")].map(target), navLinks: [...document.querySelectorAll("header.chrome nav.rooms a")].map(target),
    linkColor: link ? getComputedStyle(link).color : null, hereColor: here ? getComputedStyle(here).color : null, hereLine: here ? getComputedStyle(here).textDecorationLine : null };
})()`;

const READY: Payload<boolean> = `document.readyState === "complete" && (!document.fonts || document.fonts.status === "loaded") && !!document.querySelector("header.chrome nav.rooms")`;

export function trailKit(ctx: SuiteContext) {
  const settle = makeSettle(ctx);
  const goto = async (path: string): Promise<void> => {
    await ctx.send("Page.navigate", { url: "about:blank" });
    await ctx.send("Page.navigate", { url: `http://127.0.0.1:${ctx.PORT}${path}` });
    const at: Payload<string | null> = `(${READY}) ? location.pathname : null`;
    await settle(at, (d, last) => d === path && last === path, `trail-goto-${path}`);
  };
  return { ...ctx, settle, goto };
}

const centre = (b: Box) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });
const toBox = (p: { x: number; y: number }, b: Box) =>
  Math.hypot(Math.max(b.x - p.x, 0, p.x - b.right), Math.max(b.y - p.y, 0, p.y - b.bottom));
const spacing = (ts: readonly Box[]): number[] =>
  ts.map((a, i) =>
    Math.min(
      ...ts
        .filter((_, j) => j !== i)
        .map((b) => {
          const small = b.w < 24 || b.h < 24;
          return small
            ? Math.hypot(centre(a).x - centre(b).x, centre(a).y - centre(b).y) - 24
            : toBox(centre(a), b) - 12;
        }),
    ),
  );

export async function dr11Wide(k: TrailKit): Promise<void> {
  const { send, evaluate, check } = k;
  const rows: string[] = [];
  let ok = true;
  for (const width of [1280, 901, NARROW]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 800, deviceScaleFactor: 1, mobile: false });
    for (const page of ["/prospect/", "/faq/"]) {
      await k.goto(page);
      const d = await evaluate(READ);
      const margins = spacing([...d.links, ...d.navLinks]);
      const good =
        d.links.length > 0 &&
        d.navLinks.length > 0 &&
        d.links.every((l) => l.hit) &&
        margins.every((m) => m >= 0) &&
        d.linkColor === PARCHMENT &&
        d.hereColor === PARCHMENT_BRIGHT &&
        d.hereLine === "underline";
      ok &&= good;
      rows.push(
        `${width} ${page}: ${d.links.map((l) => `${l.t}=${l.hit}`).join(",")} spacing ${margins.map((m) => m.toFixed(2)).join(",")} link ${d.linkColor} here ${d.hereColor} ${d.hereLine}`,
      );
    }
  }
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await k.goto("/prospect/");
  const underline = await underlineContrast(k);
  const explorer = (await evaluate(READ)).links.find((l) => l.t === "The Explorer");
  if (explorer) {
    const at = centre(explorer);
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x: at.x, y: at.y, button: "left", clickCount: 1 });
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: at.x, y: at.y, button: "left", clickCount: 1 });
  }
  const landed = await arrived(k, "/explorer/");
  check(
    "DR11 at 1280, 901 and 640, the last two laying out the 1024 page (Issue #762), every trail link on the Prospect and the FAQ takes the hand at its centre, a thumb's 24px clears round every trail, alias and nav link (Alex, 2026-10-03, on Issue #668), the links resolve parchment and the page's own segment parchment-bright AND underlined, the alias link's underline, its only cue, reads at least 3:1 over its ground at 1280 (ruling 6), and a REAL press on the Prospect's \"The Explorer\" lands on the Explorer (Issue #668)",
    ok && underline >= 3 && !!explorer && landed,
    `${rows.join(" | ")}; alias underline ${underline.toFixed(2)}:1; press on The Explorer ${explorer ? "sent" : "MISSING"}, landed ${landed}`,
  );
}

async function arrived({ evaluate, sleep }: TrailKit, path: string): Promise<boolean> {
  for (let i = 0; i < 200; i++) {
    const at = await evaluate<string | null>(`document.readyState === "complete" ? location.pathname : null`).catch(
      () => null,
    );
    if (at === path) return true;
    await sleep(50);
  }
  throw new Error(`never arrived at ${path}`);
}

export async function dr12Print(k: TrailKit): Promise<void> {
  const { send, evaluate, check, setNarrowViewport, clearMobile } = k;
  const read = `parseFloat(getComputedStyle(document.body).paddingTop)` as Payload<number>;
  const rows: { width: number; screen: number; print: number }[] = [];
  try {
    for (const width of [1280, NARROW]) {
      if (width === NARROW) await setNarrowViewport(NARROW, 844);
      await k.goto("/faq/");
      const screen = await evaluate(read);
      await send("Emulation.setEmulatedMedia", { media: "print" });
      rows.push({ width, screen, print: await evaluate(read) });
      await send("Emulation.setEmulatedMedia", { media: "" });
    }
  } finally {
    await send("Emulation.setEmulatedMedia", { media: "" }).catch(() => undefined);
    await clearMobile();
    await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  }
  check(
    "DR12 on paper the FAQ's sheet starts at the top of the page: the padding that buys the trail its band is the screen's alone, at 1280 and at 640 (Issue #762 moved it from 390), with the screen read in the same run as the control (Issue #668)",
    rows.length === 2 && rows.every((r) => r.print === 0 && r.screen > 100),
    JSON.stringify(rows),
  );
}

export async function dr13Gallery(k: TrailKit): Promise<void> {
  const { evaluate, check, setNarrowViewport, clearMobile, send } = k;
  const rows: { width: number; gap: number }[] = [];
  for (const width of [1280, NARROW] as const) {
    if (width === NARROW) await setNarrowViewport(NARROW, 844);
    await k.goto("/gallery/");
    await k.settle(
      `(() => { const a = document.querySelector(".grid")?.getAnimations() ?? []; return a.length > 0 && a.every((x) => x.playState === "finished"); })()`,
      (done) => done === true,
      "the Gallery's grid has landed",
    );
    const gap = await evaluate<number>(
      `document.querySelector(".grid figure").getBoundingClientRect().top - document.querySelector("header.chrome").getBoundingClientRect().bottom`,
    );
    rows.push({ width, gap });
  }
  await clearMobile();
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  check(
    "DR13 the Gallery's first row stands clear of the head cluster with the trail in it, at 1280 and at 640, which lays out the 1024 page (Issue #762; Issue #668; the size of the gap is ruling 3's, provisional until Issue #736)",
    rows.length === 2 && rows.every((r) => r.gap >= 4),
    JSON.stringify(rows),
  );
}

type Ground = { image: string; colour: number[]; layer: string };
const GROUND: Payload<Ground> = `(() => { const cs = getComputedStyle(document.body); return { image: cs.backgroundImage, colour: (${PAGE_RGBA})(cs.backgroundColor), layer: getComputedStyle(document.body, "::before").display }; })()`;

async function printedGround(k: TrailKit): Promise<Ground> {
  try {
    await k.send("Emulation.setEmulatedMedia", { media: "print" });
    return await k.evaluate(GROUND);
  } finally {
    await k.send("Emulation.setEmulatedMedia", { media: "" });
  }
}

export async function dr14PrintIsPaper(k: TrailKit): Promise<void> {
  await k.goto("/faq/");
  const screen = await k.evaluate(GROUND);
  const paper = await printedGround(k);
  k.check(
    "DR14 print is paper all the way down: printed, the Q & A's body drops the dark ground it carries on screen and the fixed walnut layer over it stands down, the screen read in the same run the control (Issue #454 open decision 4)",
    nearRgba(screen.colour, tokenRgba("--chart-ink")) &&
      screen.layer !== "none" &&
      paper.image === "none" &&
      paper.colour[3] === 0 &&
      paper.layer === "none",
    JSON.stringify({ screen, paper }),
  );
}

type Link = { x: number; y: number; hovered: boolean; moving: number; colour: number[] } | null;
const LINK = (selector: string): Payload<Link> =>
  `(() => { const a = document.querySelector(${JSON.stringify(selector)}); if (!a) return null; const b = a.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2, hovered: a.matches(":hover"), moving: a.getAnimations().length, colour: (${PAGE_RGBA})(getComputedStyle(a).color) }; })()`;

async function hovered(k: TrailKit, selector: string): Promise<[number[], number[]]> {
  const at = await k.evaluate(LINK(selector));
  if (!at) throw new Error(`DR15: the Prospect carries no ${selector}`);
  await k.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: at.x, y: at.y, button: "none" });
  try {
    const lit = await k.settle(LINK(selector), (d) => d.hovered && d.moving === 0, `hover ${selector}`, 40);
    return [at.colour, lit.colour];
  } finally {
    await k.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 700, button: "none" });
  }
}

const QUIET = [tokenRgba("--parchment"), tokenRgba("--parchment-bright")];

export async function dr15TrailHover(k: TrailKit): Promise<void> {
  await k.goto("/prospect/");
  const [rest, lit] = await hovered(k, "header.chrome .trail a");
  const alias = await hovered(k, "header.chrome .also a");
  k.check(
    "DR15 a trail link under the hand brightens to parchment-bright, and the alias link under the hand keeps a parchment ink, never a dimmer one (Issue #668)",
    nearRgba(rest, tokenRgba("--parchment")) &&
      nearRgba(lit, tokenRgba("--parchment-bright")) &&
      alias.every((c) => QUIET.some((q) => nearRgba(c, q))),
    JSON.stringify({ rest, lit, alias }),
  );
}
