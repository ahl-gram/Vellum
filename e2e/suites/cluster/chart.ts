// The chart of the atelier (Issue #671): the press in the head cluster opens a small chart of the site's own shape, every place a link but the page's own. Every gesture is a REAL press at a rect read from the page; a property set or a focus taken through evaluate is wiring, and says so at its check.
import type { Payload } from "../../types.ts";
import { nearRgba, PAGE_RGBA, sampleRow, tokenRgba } from "../../support/pixel.ts";
import { PLACES } from "../../../src/layouts/atelier-chart.ts";
import { ROUTE_NAMES } from "../../../src/layouts/nav.ts";
import { withScriptsOff } from "../../support/scripts-off.ts";
import { spacing } from "./trail.ts";
import type { TrailKit } from "./trail.ts";

export type Rect = { x: number; y: number; w: number; h: number; right: number; bottom: number };
type Size = readonly [number, number];

export const RECT = `((e) => { if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height, right: b.right, bottom: b.bottom }; })`;
export const FOLD = `document.querySelector("header.chrome details.atelier-fold")`;
export const PRESS = `${FOLD}.querySelector("summary")`;
export const PANEL = `${FOLD}.querySelector("nav.atelier")`;
export const BIG: Size = [1280, 800];

export const centre = (b: Rect) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });
const near = (a: Rect | null, b: Rect | null): boolean =>
  a === null || b === null
    ? a === b
    : (["x", "y", "w", "h", "right", "bottom"] as const).every((f) => Math.abs(a[f] - b[f]) <= 0.5);

export const sized = (k: TrailKit, [width, height]: Size) =>
  k.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });

export async function pressAt(k: TrailKit, x: number, y: number): Promise<void> {
  await k.send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
  await k.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
}

async function key(k: TrailKit, name: "Enter" | "Tab" | "Escape"): Promise<void> {
  const vk = { Enter: 13, Tab: 9, Escape: 27 }[name];
  const text = name === "Enter" ? { text: "\r", unmodifiedText: "\r" } : {};
  const type = name === "Enter" ? "keyDown" : "rawKeyDown";
  await k.send("Input.dispatchKeyEvent", { type, key: name, code: name, windowsVirtualKeyCode: vk, ...text });
  await k.send("Input.dispatchKeyEvent", { type: "keyUp", key: name, code: name, windowsVirtualKeyCode: vk });
}

export const polled = <T>(k: TrailKit, read: Payload<T>, label: string) =>
  k.settle(read, (d, last) => last !== null && JSON.stringify(d) === JSON.stringify(last), label);

// The Reading Room armed 1.8 s after load here (2026-10-16, Issue #671); its own armed-and-at-rest wait allows 15 s, since a worker that stops answering costs 6 s before the inline fallback arms (`settled` in `e2e/support/room.ts`, Issue #418), so every rest here waits as long before it throws, at 50 ms a poll.
const ARMED = 300;
type Rest = { still: boolean; sheet: Rect | null };
const RESTING: Payload<Rest> = `(() => ({ still: document.querySelector("header.chrome").getAnimations().every((a) => a.playState === "finished") && ![...document.querySelectorAll("#status, .rf-status")].some((s) => s.textContent.trim()) && (!document.querySelector(".rf-status") || !!document.querySelector(".rf-chart svg")), sheet: ${RECT}(document.getElementById("sheet")) }))()`;

export async function arrive(k: TrailKit, page: string, size: Size): Promise<void> {
  await sized(k, size);
  await k.goto(page);
  await k.settle(RESTING, (d, last) => d.still && last !== null && near(d.sheet, last.sheet), `AT rest ${page}`, ARMED);
}

export const NAMES = {
  at1: "AT1 a real press on the chart of the atelier's press opens it and a second shuts it, at 1280 and at 1024 on the Q & A, the Explorer, the Prospect and home, and nothing in the head cluster that takes a press is dead to the hand: open, the panel stands below the cluster and inside the window, and neither the cluster nor the fitted sheet moves (Issue #671; the Issue #520 class)",
  at2: "AT2 on every page in the tree and on the Specimen, the open chart of the atelier offers every place but the page's own, the Atlas isle among them, as a link that takes the hand at its name and at its pip, counted against the drawing, pins the page's own place and no other, carries no page mark, lets no two of its words overlap, and nothing in the room paints over it (Issue #671; the round's label overlaps, design/nav-wayfinding/README.md)",
  at3: "AT3 the chart of the atelier answers the keyboard and the hand: Enter opens it, Tab walks into its places, Escape shuts it and hands the focus back to its press when the focus was inside it and leaves it where it was when it was not, Tab past its last place shuts it, a click on the panel itself leaves it open, and a click anywhere else on the page shuts it (Issue #671; Alex, 2026-10-16, D1)",
  at4: "AT4 with scripts off the chart of the atelier still opens and shuts by a real press on the Q & A, the scripted run of AT1 its same-run control (Issue #671; Alex, 2026-10-16, D1)",
  at5: "AT5 the chart of the atelier's press clears a thumb's 24px round every link in the head cluster, on its own line under the nav (home, the Specimen) and at the trail's end (the Q & A, the Seed of the Day, the Ribbon, the Prospect), and its box ends with its words (Issue #671; Alex, 2026-10-03, on Issue #668)",
  at6: "AT6 the chart of the atelier's press is parchment on the deep at rest and parchment-bright under the hand; while the chart is open it is lit, dark ink on a painted cream ground, and stays lit under the hand, never in its hover's dress; and under keyboard focus, shut or open, it wears the chrome's ring, 2px solid parchment-bright at a 2px offset (Issue #671; Alex, 2026-10-16, D10; a toggle press is lit when on, never in the dress of its own hover; the focus ring is one face, Issue #324)",
  at7: "AT7 the open chart of the atelier moves with its press and the cluster wherever the page moves under them: on home, whose cluster rides the page, scrolled down at 1280 and sideways in a window narrower than the 1024 page, and sideways on the Explorer and the Q & A, whose cluster stands in a contained room (Issue #671; Issue #764 ruling 2A)",
  at8: "AT8 a reader who leaves by a place on the chart of the atelier and comes Back finds the page as they left it but the chart shut, the page restored from the browser's page cache, its planted marker the witness (Issue #671)",
};

type Rest1 = { open: boolean; press: Rect; cluster: Rect; sheet: Rect | null; dead: string[] };
const AT1_REST: Payload<Rest1> = `(() => ({ open: ${FOLD}.open, press: ${RECT}(${PRESS}), cluster: ${RECT}(document.querySelector("header.chrome")), sheet: ${RECT}(document.getElementById("sheet")),
  dead: [...document.querySelectorAll("header.chrome :is(a, button, summary, input, select, [tabindex])")].filter((e) => getComputedStyle(e).pointerEvents === "none").map((e) => e.tagName + " " + (e.textContent || "").trim().slice(0, 24)) }))()`;
type Open1 = Pick<Rest1, "open" | "cluster" | "sheet"> & {
  shown: boolean;
  panel: Rect;
  innerWidth: number;
  innerHeight: number;
};
const AT1_OPEN: Payload<Open1> = `(() => ({ open: ${FOLD}.open, shown: ${PANEL}.checkVisibility(), panel: ${RECT}(${PANEL}), cluster: ${RECT}(document.querySelector("header.chrome")), sheet: ${RECT}(document.getElementById("sheet")), innerWidth, innerHeight }))()`;

export async function at1Press(k: TrailKit): Promise<void> {
  const rows: string[] = [];
  let ok = true;
  try {
    for (const size of [BIG, [1024, 768]] as const)
      for (const page of ["/faq/", "/explorer/", "/prospect/", "/"]) {
        await arrive(k, page, size);
        const rest = await k.evaluate(AT1_REST);
        const at = centre(rest.press);
        await pressAt(k, at.x, at.y);
        const open = await polled(k, AT1_OPEN, `AT1 open ${size[0]} ${page}`);
        await pressAt(k, at.x, at.y);
        const shut = await polled(k, AT1_OPEN, `AT1 shut ${size[0]} ${page}`);
        const good =
          rest.dead.length === 0 &&
          !rest.open &&
          open.open &&
          open.shown &&
          open.panel.y >= open.cluster.bottom &&
          open.panel.right <= open.innerWidth &&
          open.panel.bottom <= open.innerHeight &&
          near(rest.cluster, open.cluster) &&
          near(rest.sheet, open.sheet) &&
          !shut.open &&
          !shut.shown;
        ok &&= good;
        rows.push(`${size[0]} ${page}: ${good ? "ok" : JSON.stringify({ rest, open, shut })}`);
      }
  } finally {
    await sized(k, BIG);
  }
  k.check(NAMES.at1, ok, rows.join(" | "));
}

type Places = {
  hrefs: { href: string; text: boolean; pip: boolean }[];
  here: { cx: string; cy: string } | null;
  you: boolean;
  marks: number;
  words: Rect[];
  grid: { n: number; outside: number };
};
const AT2_READ: Payload<Places> = `(() => {
  const panel = ${PANEL}, R = ${RECT};
  const hitOn = (a, e) => { const b = e.getBoundingClientRect(); const h = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2); return !!h && (h === a || a.contains(h)); };
  const hrefs = [...panel.querySelectorAll("a.place")].map((a) => ({ href: a.getAttribute("href"), text: hitOn(a, a.querySelector("text")), pip: hitOn(a, a.querySelector(".pip")) }));
  const pip = panel.querySelector(".place.here .pip"), p = panel.getBoundingClientRect();
  let n = 0, outside = 0;
  for (let y = p.top + 1; y < Math.min(p.bottom, innerHeight); y += 8)
    for (let x = p.left + 1; x < Math.min(p.right, innerWidth); x += 8) { n++; if (!panel.contains(document.elementFromPoint(x, y))) outside++; }
  return { hrefs, here: pip ? { cx: pip.getAttribute("cx"), cy: pip.getAttribute("cy") } : null, you: !!panel.querySelector(".you"), marks: panel.querySelectorAll("[aria-current]").length,
    words: [...panel.querySelectorAll("text")].map(R), grid: { n, outside } };
})()`;

type Row = { page: string; size: Size; drawer?: true };
const AT2_ROWS: readonly Row[] = [
  ...[...Object.keys(ROUTE_NAMES), "/specimen/"].map((page): Row => ({ page, size: [1024, 768] })),
  { page: "/explorer/", size: [1280, 720] },
  { page: "/print-room/", size: [1280, 720] },
  { page: "/reading-room/", size: [1024, 650] },
  { page: "/explorer/", size: [1280, 720], drawer: true },
];

const overlaps = (ws: readonly Rect[]): number =>
  ws.reduce(
    (n, a, i) =>
      n +
      ws
        .slice(i + 1)
        .filter(
          (b) =>
            Math.min(a.right, b.right) - Math.max(a.x, b.x) > 0.5 &&
            Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y) > 0.5,
        ).length,
    0,
  );

async function openDrawer(k: TrailKit): Promise<void> {
  const tab = await k.evaluate<Rect>(`${RECT}(document.getElementById("chart-drawer-tab"))`);
  await pressAt(k, centre(tab).x, centre(tab).y);
  const shown: Payload<{ display: string; box: Rect | null }> =
    `({ display: getComputedStyle(document.querySelector(".chart-drawer")).display, box: ${RECT}(document.querySelector(".chart-drawer")) })`;
  await k.settle(
    shown,
    (d, last) => d.display !== "none" && last !== null && near(d.box, last.box),
    "AT2 the drawer opened",
  );
}

// Wiring only: AT1 proves the press, so this opens the fold by its property. Blind spots, both toward passing: two hit points a link, an 8px grid, so a cover narrower than 8px that misses every point passes.
export async function at2Places(k: TrailKit): Promise<void> {
  const rows: string[] = [];
  let ok = true;
  try {
    for (const row of AT2_ROWS) {
      await arrive(k, row.page, row.size);
      if (row.drawer) await openDrawer(k);
      await k.evaluate(`${FOLD}.open = true`);
      await polled(k, `${RECT}(${PANEL})`, `AT2 panel at rest ${row.page}`);
      const d = await k.evaluate(AT2_READ);
      const want = Object.keys(PLACES)
        .filter((r) => r !== row.page)
        .sort();
      const mine = PLACES[row.page];
      const bad = [
        JSON.stringify(d.hrefs.map((h) => h.href).sort()) === JSON.stringify(want) ? "" : "hrefs",
        d.hrefs.every((h) => h.text && h.pip)
          ? ""
          : `missed ${d.hrefs
              .filter((h) => !h.text || !h.pip)
              .map((h) => h.href)
              .join(" ")}`,
        mine ? (d.here?.cx === String(mine.x) && d.here.cy === String(mine.y) ? "" : "pin") : d.here ? "stray pin" : "",
        d.you === !!mine ? "" : "you",
        d.marks === 0 ? "" : "page mark",
        overlaps(d.words) === 0 ? "" : "word overlap",
        d.grid.n > 100 && d.grid.outside === 0 ? "" : `covered ${d.grid.outside} of ${d.grid.n}`,
      ].filter(Boolean);
      ok &&= bad.length === 0;
      rows.push(
        `${row.size.join("x")}${row.drawer ? " drawer" : ""} ${row.page}: ${bad.length ? bad.join(",") : "ok"}`,
      );
    }
  } finally {
    await sized(k, BIG);
  }
  k.check(NAMES.at2, ok, rows.join(" | "));
}

type Keys = { open: boolean; place: boolean; press: boolean; outside: boolean; path: string };
const KEYS: Payload<Keys> = `(() => { const f = ${FOLD}, a = document.activeElement; return { open: f.open, place: !!a && !!a.closest("nav.atelier a.place"), press: a === f.querySelector("summary"), outside: !f.contains(a), path: location.pathname }; })()`;

export async function at3Keys(k: TrailKit): Promise<void> {
  const read = (label: string) => polled(k, KEYS, `AT3 ${label}`);
  const focusPress = () => k.evaluate<undefined>(`${PRESS}.focus()`);
  try {
    await arrive(k, "/faq/", BIG);
    await focusPress();
    await key(k, "Enter");
    const entered = await read("Enter");
    await key(k, "Tab");
    const walked = await read("Tab");
    await key(k, "Escape");
    const escaped = await read("Escape");
    await key(k, "Enter");
    for (let i = 0; i < Object.keys(PLACES).length; i++) await key(k, "Tab");
    const past = await read("Tab past the last place");
    await focusPress();
    await key(k, "Enter");
    const reopened = await read("Enter again");
    const panel = await k.evaluate<Rect>(`${RECT}(${PANEL})`);
    await pressAt(k, panel.x + 6, panel.y + 5);
    const onPanel = await read("a press on the panel");
    await key(k, "Escape");
    const outsideEsc = await read("Escape with the focus outside the chart");
    await focusPress();
    await key(k, "Enter");
    const bare = await k.evaluate<boolean>(`!document.elementFromPoint(700, 60)?.closest("a, button")`);
    await pressAt(k, 700, 60);
    const elsewhere = await read("a press elsewhere");
    k.check(
      NAMES.at3,
      entered.open &&
        walked.place &&
        !escaped.open &&
        escaped.press &&
        !past.open &&
        past.outside &&
        reopened.open &&
        onPanel.open &&
        !outsideEsc.open &&
        !outsideEsc.press &&
        bare &&
        !elsewhere.open &&
        elsewhere.path === "/faq/",
      JSON.stringify({ entered, walked, escaped, past, reopened, onPanel, outsideEsc, bare, elsewhere }),
    );
  } finally {
    await sized(k, BIG);
  }
}

export async function at4ScriptsOff(k: TrailKit): Promise<void> {
  const state: Payload<{ open: boolean; shown: boolean }> =
    `({ open: ${FOLD}.open, shown: ${PANEL}.checkVisibility() })`;
  await sized(k, BIG);
  const { open, shut } = await withScriptsOff(k.send, async () => {
    await k.goto("/faq/");
    const press = await k.evaluate<Rect>(`${RECT}(${PRESS})`);
    await pressAt(k, centre(press).x, centre(press).y);
    const open = await polled(k, state, "AT4 open");
    await pressAt(k, centre(press).x, centre(press).y);
    return { open, shut: await polled(k, state, "AT4 shut") };
  });
  k.check(NAMES.at4, open.open && open.shown && !shut.open && !shut.shown, JSON.stringify({ open, shut }));
}

type Clear = { press: Rect; words: Rect; links: Rect[] };
const AT5_READ: Payload<Clear> = `(() => { const s = ${PRESS}, r = document.createRange(); r.selectNodeContents(s);
  return { press: ${RECT}(s), words: ${RECT}({ getBoundingClientRect: () => r.getBoundingClientRect() }), links: [...document.querySelectorAll("header.chrome :is(nav.rooms, .trail, .also) a")].map(${RECT}) }; })()`;

export async function at5Spacing(k: TrailKit): Promise<void> {
  const rows: string[] = [];
  let ok = true;
  const at: readonly (readonly [string, Size])[] = [
    ...["/", "/specimen/", "/faq/", "/seed-of-the-day/", "/ribbon/", "/prospect/"].map((p) => [p, BIG] as const),
    ["/", [1024, 768]],
    ["/prospect/", [1024, 768]],
  ];
  try {
    for (const [page, size] of at) {
      await arrive(k, page, size);
      const d = await k.evaluate(AT5_READ);
      const margin = spacing([d.press, ...d.links])[0]!;
      const good = margin >= 0 && d.press.right <= d.words.right + 1;
      ok &&= good;
      rows.push(
        `${size[0]} ${page}: margin ${margin.toFixed(2)}, box ends ${(d.press.right - d.words.right).toFixed(2)} past its words${good ? "" : " RED"}`,
      );
    }
  } finally {
    await sized(k, BIG);
  }
  k.check(NAMES.at5, ok, rows.join(" | "));
}

type Dress = {
  colour: number[];
  bg: number[];
  shadow: string;
  hovered: boolean;
  moving: number;
  focusVisible: boolean;
  outline: [string, string, string, number[]];
  box: Rect;
};
const DRESS: Payload<Dress> = `(() => { const s = ${PRESS}, cs = getComputedStyle(s), rgba = ${PAGE_RGBA};
  return { colour: rgba(cs.color), bg: rgba(cs.backgroundColor), shadow: cs.boxShadow, hovered: s.matches(":hover"), moving: s.getAnimations().length, focusVisible: s.matches(":focus-visible"),
    outline: [cs.outlineStyle, cs.outlineWidth, cs.outlineOffset, rgba(cs.outlineColor)], box: ${RECT}(s) }; })()`;
const median = (xs: number[]) => [...xs].sort((p, q) => p - q)[Math.floor(xs.length / 2)] ?? NaN;

async function paintedRow(k: TrailKit, b: Rect): Promise<number[]> {
  const row = await sampleRow(k.send, Math.round(b.x + 2), Math.round(b.y + b.h / 2), Math.round(b.w - 4));
  return [median(row.map((p) => p[0])), median(row.map((p) => p[1])), median(row.map((p) => p[2])), 255];
}

async function underHand(k: TrailKit, b: Rect): Promise<Dress> {
  await k.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: centre(b).x, y: centre(b).y, button: "none" });
  try {
    return await k.settle(DRESS, (d) => d.hovered && d.moving === 0, "AT6 hover");
  } finally {
    await k.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 700, button: "none" });
  }
}

const PARCHMENT = tokenRgba("--parchment");
const BRIGHT = tokenRgba("--parchment-bright");
const ringOk = (d: Dress): boolean =>
  d.focusVisible && d.outline.slice(0, 3).join(" ") === "solid 2px 2px" && nearRgba(d.outline[3], BRIGHT);
const litOk = (d: Dress): boolean =>
  nearRgba(d.colour, tokenRgba("--ink-dark")) &&
  nearRgba(d.bg, BRIGHT) &&
  d.shadow.startsWith(`rgb(${BRIGHT.slice(0, 3).join(", ")})`);

export async function at6Dress(k: TrailKit): Promise<void> {
  try {
    await arrive(k, "/faq/", BIG);
    await k.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 700, button: "none" });
    const rest = await k.evaluate(DRESS);
    const restRow = await paintedRow(k, rest.box);
    const hot = await underHand(k, rest.box);
    await k.evaluate(`document.querySelector("header.chrome .trail a").focus()`);
    await key(k, "Tab");
    const shutRing = await polled(k, DRESS, "AT6 ring shut");
    await key(k, "Enter");
    const open = await polled(k, DRESS, "AT6 open");
    const openRow = await paintedRow(k, open.box);
    const openHot = await underHand(k, open.box);
    await key(k, "Escape");
    k.check(
      NAMES.at6,
      nearRgba(rest.colour, PARCHMENT) &&
        rest.bg[3] === 0 &&
        nearRgba(hot.colour, BRIGHT) &&
        litOk(open) &&
        litOk(openHot) &&
        nearRgba(openRow, BRIGHT) &&
        !nearRgba(restRow, BRIGHT) &&
        ringOk(shutRing) &&
        ringOk(open),
      JSON.stringify({ rest, restRow, hot, shutRing, open, openRow, openHot }),
    );
  } finally {
    await sized(k, BIG);
  }
}
