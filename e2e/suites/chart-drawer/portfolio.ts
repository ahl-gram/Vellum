import type { Payload, SuiteContext } from "../../types.ts";
import { makeSettle } from "../../support/settle.ts";
import { withScriptsOff } from "../../support/scripts-off.ts";
import type { DrawerKit, TableKit } from "./kit.ts";
import { DRAWN, DRESS, ONE } from "./reads.ts";
import {
  BARE_LINE,
  PLATE_SOURCE,
  PLATE_TITLE,
  gatheredLine,
} from "../../../src/site/explorer/portfolio/folio-lines.ts";
import { PLATE_ROOM, PLATE_VERB } from "../../../src/site/explorer/portfolio/how-plate.ts";

type Arrival = {
  path: string;
  ready: string;
  table: string | null;
  seed: string | null;
  items: number | null;
  room: string | null;
};
const ARRIVAL: Payload<Arrival> = `(() => { const p = new URLSearchParams(location.hash.slice(1)); return { path: location.pathname, ready: document.readyState, table: p.get("table"), seed: p.get("seed"), items: window.__vellumPortfolio ? window.__vellumPortfolio().items : null, room: (document.querySelector(".room-name") || {}).textContent || null }; })()`;

/** Waits until the page has LEFT `from` and finished loading, wherever it went, and throws with its last read if it never does; where it landed is the caller's claim, so a road to a missing page reds by naming it. A read the navigation interrupts counts as no read. */
const arrivalFrom = ({ evaluate, sleep }: Pick<TableKit, "evaluate" | "sleep">, from: string): Promise<Arrival> =>
  makeSettle({ evaluate, sleep, tolerant: true })(
    ARRIVAL,
    (d) => d.path !== from && d.ready === "complete",
    `chart-drawer-arrival-from-${from}`,
    DRAWN,
  );

type Roads = { drawn: boolean; hash: string; explorer: string | null; portfolio: string | null };
const ROADS: Payload<Roads> = `(() => { const href = (id) => { const a = document.getElementById(id); return a ? a.getAttribute("href") : null; };
  return { drawn: !!document.querySelector("#pr-preview svg") && document.getElementById("pr-status").textContent === "", hash: location.hash,
    explorer: href("pr-explorer"), portfolio: href("pr-portfolio") }; })()`;

export async function cd49bPrintRoomAddress({ evaluate, send, check, settle, PORT, forget }: TableKit): Promise<void> {
  await forget();
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/print-room/#${DRESS}&table=${ONE}` });
  // Keyed on the draw and never on the roads, so a road the page fails to rewrite reads as a fault here.
  await settle(ROADS, (d) => d.drawn, "chart-drawer-print-room-drawn", DRAWN);
  const r = await evaluate(ROADS);
  const h = r.hash.slice(1);
  const p = new URLSearchParams(h);
  check(
    "CD49b the Print Room's two roads are its own address, table and all: once the proof is drawn, the road back to the Explorer and the road on to the Portfolio each carry the page's whole hash, the table it was handed and the world it shows (#634, Issue #669)",
    r.explorer === `../explorer/#${h}` &&
      r.portfolio === `../explorer/portfolio/#${h}` &&
      p.get("table") === ONE &&
      p.get("seed") === "42",
    JSON.stringify(r),
  );
}

export async function cd49PrintRoomRoad({
  evaluate,
  send,
  check,
  sleep,
  settle,
  PORT,
  forget,
  pressById,
}: TableKit): Promise<void> {
  await forget();
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/print-room/#${DRESS}&table=${ONE}` });
  // The road carries this page's address only once the proof has drawn (`writeHash` in `src/site/print-room/app.ts`), so the press waits for that; where it lands is the claim.
  const written = await settle<{ href: string | null } | null>(
    `(() => { const a = document.getElementById("pr-portfolio"); return a ? { href: a.getAttribute("href") } : null; })()`,
    (d) => typeof d.href === "string" && d.href.indexOf("#") !== -1,
    "chart-drawer-print-room-road-written",
    DRAWN,
  );
  const press = await pressById("pr-portfolio");
  const arrived = await arrivalFrom({ evaluate, sleep }, "/print-room/");
  check(
    "CD49 the Print Room's road to the Portfolio answers a REAL press and lands at the Portfolio's address under the Explorer, carrying the Print Room's own address with it: the table it was handed and the world it shows (Issue #669)",
    press.hit &&
      arrived.path === "/explorer/portfolio/" &&
      arrived.table === ONE &&
      arrived.seed === "42" &&
      arrived.items === 1,
    JSON.stringify({ written: written.href, press, arrived }),
  );
}

export async function cd50ScriptsOffHome({
  evaluate,
  send,
  check,
  sleep,
  settle,
  PORT,
  clickAt,
}: TableKit): Promise<void> {
  await withScriptsOff(send, async () => {
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/portfolio/` });
    // At rest means the document complete and the road still across two reads: read while the page is still interactive, the road sits unstyled at the top right (measured 2026-10-04: 1038,27 at interactive, 809,455 from 100ms on), and a press there lands nowhere.
    const road = await settle<{ x: number; y: number; hit: boolean; href: string | null; ready: string } | null>(
      `(() => { const a = document.querySelector(".stage noscript a"); if (!a) return null; a.scrollIntoView({ block: "center" }); const b = a.getBoundingClientRect(); if (b.width < 1) return null; const x = Math.round(b.x + b.width / 2), y = Math.round(b.y + b.height / 2); const h = document.elementFromPoint(x, y); return { x, y, hit: h === a || a.contains(h), href: a.getAttribute("href"), ready: document.readyState }; })()`,
      (d, last) => d.ready === "complete" && !!last && last.x === d.x && last.y === d.y,
      "chart-drawer-scripts-off-road",
      DRAWN,
    );
    await clickAt(road.x, road.y);
    const arrived = await arrivalFrom({ evaluate, sleep }, "/explorer/portfolio/");
    check(
      "CD50 with scripts off, the Portfolio's notice still has a road home that answers a REAL press and lands on the Explorer, the parent the page now sits under (Issue #669)",
      road.hit && arrived.path === "/explorer/" && arrived.room === "The Explorer",
      JSON.stringify({ road, arrived }),
    );
  });
}

export async function cd18bRoadCarries({ evaluate, check, sleep, clickAt }: DrawerKit, SIX: string): Promise<void> {
  const roadBefore = await evaluate<boolean>(`document.getElementById("table-road").disabled`);
  const roadAt = await evaluate<{
    x: number;
    y: number;
    reachable: boolean;
    room: string | null;
  }>(`(() => { const b = document.getElementById("table-road"); const r = b.getBoundingClientRect();
    const x = Math.round(r.x + r.width / 2), y = Math.round(r.y + r.height / 2);
    const h = document.elementFromPoint(x, y);
    return { x, y, reachable: h === b || b.contains(h), room: (b.querySelector(".room") || {}).textContent || null }; })()`);
  await clickAt(roadAt.x, roadAt.y);
  const arrived = await arrivalFrom({ evaluate, sleep }, "/explorer/");
  check(
    "CD18b the road answers a REAL press and carries the WHOLE gathering to the Portfolio's own address under the Explorer, which is the epic's core insight: the folio is a link, so the page it lands on can draft the same six sheets for anyone; and the road names the room it lands in (Issue #669, ruled 2026-10-04)",
    arrived.path === "/explorer/portfolio/" &&
      arrived.table === SIX &&
      roadAt.reachable &&
      roadAt.room !== null &&
      roadAt.room === arrived.room,
    JSON.stringify({ ...arrived, roadBefore, roadAt }),
  );
}

export async function cd19PortfolioDrafts({ evaluate, check, sleep }: SuiteContext): Promise<void> {
  const PF: Payload<{
    items: number;
    drawn: number;
    rows: number;
    groups: number;
    heads: string[];
    onStage: boolean;
    folio: string | null;
    bound: string | null;
    warned: boolean;
  } | null> = `(() => { const s = window.__vellumPortfolio ? window.__vellumPortfolio() : null; return s ? { ...s,
    warned: !document.getElementById("pf-warning").hidden,
    rows: document.querySelectorAll("#pf-contents .row").length,
    groups: document.querySelectorAll("#pf-contents .group-head").length,
    heads: [...document.querySelectorAll("#pf-contents .group-head span:first-child")].map((e) => e.textContent),
    onStage: !!document.querySelector("#pf-sheet svg"),
    folio: (document.getElementById("folio-title") || {}).textContent || null,
    bound: (document.getElementById("pf-bound") || {}).textContent || null } : null; })()`;
  let pf = await evaluate(PF);
  for (let i = 0; i < DRAWN && (!pf || pf.drawn < 6); i++) {
    await sleep(50);
    pf = await evaluate(PF);
  }
  check(
    "CD19 the Portfolio drafts every gathered sheet from its own number, groups the index by world under the parent world's NAME, and stands one sheet on the stage (#518 ruling 5), on the render worker, whose loss from a moved page would only look slow (Issue #669)",
    // The warning is unhidden right after initWorker() when the worker did not start, and drafting starts after that, so with sheets drawn its state is final.
    !!pf &&
      pf.items === 6 &&
      pf.drawn === 6 &&
      pf.rows === 6 &&
      pf.groups >= 1 &&
      pf.onStage &&
      !pf.warned &&
      // The LITERAL world, not a shape: seed 42's parent is deterministic (measured 2026-09-08), and a shape check passes on
      // the "this world" fallback the page uses before worldTitle arrives, which is the whole thing this pins.
      pf.heads.length === 1 &&
      pf.heads[0] === "From The Isle of Rahai · chart № 42",
    JSON.stringify(pf),
  );
}

export async function cd24PortfolioSays({ evaluate, check, sleep, clickAt }: DrawerKit): Promise<void> {
  // CD24 (Issue #547 ruling 4, Alex 2026-09-13): the Portfolio's "is on top" was the Explorer's defect on a second page, so one shared announcer and ONE kit rule take both lines away. This does not wait the hold out; CD54 watches the line go.
  const pfNext = await evaluate<{ x: number; y: number; reachable: boolean } | null>(
    `(() => { const b = document.getElementById("pf-next"); if (!b) return null; b.scrollIntoView({ block: "center" }); const r = b.getBoundingClientRect(); if (r.width < 1) return null; const x = Math.round(r.x + r.width / 2), y = Math.round(r.y + r.height / 2); const h = document.elementFromPoint(x, y); return { x, y, reachable: h === b || b.contains(h) }; })()`,
  );
  if (pfNext) await clickAt(pfNext.x, pfNext.y);
  const PF_SAID: Payload<{ line: string; fadeMs: string; rest: string; faded: string } | null> =
    `(() => { const s = document.getElementById("pf-status"); if (!s) return null; const was = s.style.transition; s.style.transition = "none"; const rest = getComputedStyle(s).opacity; s.classList.add("fading"); const faded = getComputedStyle(s).opacity; s.classList.remove("fading"); s.style.transition = was; return { line: s.textContent || "", fadeMs: getComputedStyle(s).transitionDuration, rest, faded }; })()`;
  // A bounded poll and not a settle, so a Portfolio that never announces fails CD24 by name rather than throwing outside every step the way its four siblings here already run unstepped. 40 tries is 2s: bringUp says synchronously inside the click handler's own task, so the first or second read has it (measured 2026-09-13, every local run read it on the first).
  let pfSaid = await evaluate(PF_SAID);
  for (let i = 0; i < 40 && (!pfSaid || pfSaid.line === ""); i++) {
    await sleep(50);
    pfSaid = await evaluate(PF_SAID);
  }
  check(
    "CD24 the Portfolio announces the sheet it brought up on a pill that wears the SAME fade the Explorer's does, read as the declared duration AND as the opacity the cascade resolves under the class: a rule keyed to #status alone, or a later arm re-raising THIS page's opacity, would leave this announcement standing over the chart forever and every other guard green (#547 ruling 4)",
    !!pfNext &&
      pfNext.reachable &&
      !!pfSaid &&
      /is on top/.test(pfSaid.line) &&
      pfSaid.fadeMs === "0.45s" &&
      pfSaid.rest === "1" &&
      pfSaid.faded === "0",
    JSON.stringify({ press: pfNext, said: pfSaid }),
  );
}

type BareVisit = { ready: string; fonts: string; app: boolean };
const BARE_READY: Payload<BareVisit> = `({ ready: document.readyState, fonts: document.fonts.status, app: !!window.__vellumPortfolio })`;

export async function bareArrived({ evaluate, send, sleep, PORT, forget }: DrawerKit): Promise<void> {
  await forget();
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/portfolio/` });
  await makeSettle({ evaluate, sleep, tolerant: true })(
    BARE_READY,
    (d) => d.ready === "complete" && d.fonts === "loaded" && d.app,
    "chart-drawer-bare-portfolio-arrived",
  );
}

type PlateVisit = {
  plate: boolean;
  title: string | null;
  folioTitle: string | null;
  folioSub: string | null;
  bound: string | null;
  where: string | null;
  next: number;
  download: number;
  explorer: number;
  items: number | null;
  hash: string;
  href: string | null;
  workers: number | null;
};
const PLATE_VISIT: Payload<PlateVisit> = `(() => {
  // The RECT of all three, never .hidden: atelier.css sets an author display on .legend-btn, which beats the UA [hidden] rule, so el.hidden = true silently no-ops and a check on that property is a check on its own input (#270's guard-prover find).
  // The road takes the same measure as the two presses because it is the same script decision: its mere presence is an Astro literal the page script never touches, and could not go red however the stand-down was written.
  const width = (id) => { const e = document.getElementById(id); return e ? e.getBoundingClientRect().width : 0; };
  const text = (sel) => (document.querySelector(sel) || {}).textContent || null;
  const a = document.getElementById("pf-explorer");
  return { plate: !!document.querySelector("#pf-sheet svg.how-plate"), title: text("#pf-sheet svg.how-plate .p-title"),
    folioTitle: text("#folio-title"), folioSub: text("#folio-sub"), bound: text("#pf-bound"), where: text("#portfolio .card-where"),
    next: width("pf-next"), download: width("pf-download"), explorer: width("pf-explorer"),
    items: window.__vellumPortfolio ? window.__vellumPortfolio().items : null, hash: location.hash,
    href: a ? a.getAttribute("href") : null, workers: typeof window.__cd20Workers === "number" ? window.__cd20Workers : null };
})()`;
const PLATE_IMAGE: Payload<number | null> =
  `(async () => { const img = document.querySelector("#pf-sheet svg.how-plate image"); if (!img) return null;
  return (await fetch(new URL(img.getAttribute("href"), document.baseURI).href)).status; })()`;
const WORKER_COUNT = `(() => { window.__cd20Workers = 0; const W = window.Worker; window.Worker = class extends W { constructor(...a) { super(...a); window.__cd20Workers++; } }; })();`;
const EXPLORER_ROAD: Payload<{ workers: number | null; verb: string | null; room: string | null }> =
  `(() => ({ workers: typeof window.__cd20Workers === "number" ? window.__cd20Workers : null, verb: (document.querySelector("#table-road .verb") || {}).textContent || null, room: (document.querySelector("#table-road .room") || {}).textContent || null }))()`;

async function plateVisit(kt: TableKit): Promise<{ visit: PlateVisit; image: number | null; store: string | null }> {
  await bareArrived(kt);
  const visit = await kt.evaluate(PLATE_VISIT);
  const image = await kt.evaluate(PLATE_IMAGE, true);
  return { visit, image, store: await kt.evaluate(kt.STORE) };
}

export async function cd20PlatePortfolio(kt: TableKit): Promise<void> {
  const { evaluate, send, check, sleep } = kt;
  const { identifier } = await send<{ identifier: string }>("Page.addScriptToEvaluateOnNewDocument", {
    source: WORKER_COUNT,
  });
  try {
    const { visit, image, store } = await plateVisit(kt);
    const press = await kt.pressById("pf-explorer");
    const arrived = await arrivalFrom({ evaluate, sleep }, "/explorer/portfolio/");
    // The Explorer starts its worker at boot, so this count is the instrument's own control: a counter that never counts reds here and not as a pass on the Portfolio.
    const road = await makeSettle({ evaluate, sleep, tolerant: true })(
      EXPLORER_ROAD,
      (d) => (d.workers ?? 0) >= 1,
      "cd20-explorer-worker-control",
      DRAWN,
    );
    check(
      "CD20 a Portfolio reached with nothing gathered on either home lays the drawn plate of the three steps on its stage, its picture the committed chart, with no worker started, while the slip and the road say what they said (the 2026-09-08 bare voice); the device's table stays empty, the address names none, a REAL press on the road lands on the Explorer carrying no table, and the plate's gold press reads as the Explorer's own does (Issue #670)",
      visit.plate &&
        visit.title === PLATE_TITLE &&
        image === 200 &&
        visit.folioTitle === PLATE_TITLE &&
        visit.folioSub === PLATE_SOURCE &&
        visit.bound === BARE_LINE &&
        visit.where === gatheredLine(0) &&
        visit.next <= 0.5 &&
        visit.download <= 0.5 &&
        visit.explorer > 0.5 &&
        visit.items === 0 &&
        visit.hash === "" &&
        visit.href === "../" &&
        visit.workers === 0 &&
        store === null &&
        press.hit &&
        arrived.path === "/explorer/" &&
        arrived.table === null &&
        road.verb === PLATE_VERB &&
        road.room === PLATE_ROOM,
      JSON.stringify({ visit, image, store, press, arrived, road }),
    );
  } finally {
    await send("Page.removeScriptToEvaluateOnNewDocument", { identifier });
  }
}

type PlateWords = { count: number; smallest: number | null; width: number; floor: number };
const PLATE_WORDS: Payload<PlateWords> = `(() => {
  const note = document.querySelector("#portfolio .slip-foot .note");
  const floor = note ? parseFloat(getComputedStyle(note).fontSize) : 0;
  const svg = document.querySelector("#pf-sheet svg.how-plate");
  if (!svg) return { count: 0, smallest: null, width: 0, floor };
  const width = svg.getBoundingClientRect().width;
  const scale = width / svg.viewBox.baseVal.width;
  const sizes = [...svg.querySelectorAll("text")].map((t) => parseFloat(getComputedStyle(t).fontSize) * scale);
  return { count: sizes.length, smallest: sizes.length ? Math.min(...sizes) : null, width, floor };
})()`;

export async function cd62PlateReads(k: DrawerKit): Promise<void> {
  const { evaluate, send, check, sleep } = k;
  const settle = makeSettle({ evaluate, sleep });
  // The first read after arrival is still fitting (657.5 against the rest of 655.2 at 1280, measured 2026-10-16), so the width read is taken at rest like the others.
  const wide = await settle(PLATE_WORDS, (d, last) => !!last && d.width === last.width, "cd62-plate-at-1280", DRAWN);
  try {
    await send("Emulation.setDeviceMetricsOverride", { width: 1024, height: 768, deviceScaleFactor: 1, mobile: false });
    const narrow = await settle(
      PLATE_WORDS,
      (d, last) => (wide.width === 0 || Math.abs(d.width - wide.width) > 0.5) && !!last && d.width === last.width,
      "cd62-plate-at-1024",
      DRAWN,
    );
    const reads = (d: PlateWords): boolean =>
      d.count === 16 && d.floor > 0 && d.smallest !== null && d.smallest >= d.floor;
    check(
      "CD62 every word of the plate reads at no less than the page's own smallest body text, the slip foot's note, at 1280x800 and at 1024x768, the windows the plate was ruled at, so there the plate a stranger is shown is never set smaller than the page around it; a window under 692 px tall is a ruled cost in handbook/errata/site.md (Issue #670, ruled from the redrawn stills and on the short window)",
      reads(wide) && reads(narrow),
      JSON.stringify({ wide, narrow }),
    );
  } finally {
    await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
    await settle(
      PLATE_WORDS,
      (d, last) => Math.abs(d.width - wide.width) < 0.5 && !!last && d.width === last.width,
      "cd62-plate-back-at-1280",
      DRAWN,
    );
  }
}

const MAP_TRANSFORM: Payload<{ t: string }> = `({ t: document.getElementById("map").style.transform })`;

export async function cd21PortfolioGlass({ evaluate, check, stable }: DrawerKit): Promise<void> {
  // CD21 (Issue #521): the Portfolio is a chart room, so the kit renders its Glass and the stage's label promises the keys.
  // Both halves are the claim. d3-zoom does NOT set touch-action, so a bound controller with no `touch-action: none`
  // is still dead to a real thumb: the browser's native pan takes the gesture first (Issue #164).
  const glass = await evaluate<{ zoomable: boolean; touch: string; before: string }>(`(() => {
    const v = document.getElementById("map-viewport");
    const before = document.getElementById("map").style.transform;
    document.querySelector('[data-zoom="in"]').click();
    return { zoomable: v.classList.contains("zoomable"), touch: getComputedStyle(v).touchAction, before };
  })()`);
  const glassAfter = (
    await stable(MAP_TRANSFORM, "CD21 the zoom press's glide at rest", { departed: (d) => d.t !== glass.before })
  ).t;
  check(
    "CD21 the Portfolio's Glass is bound AND reachable by a thumb: a zoom press moves the camera, and the viewport takes touch-action none, without which d3 never sees the gesture and three corner presses are decoration (#164, #521)",
    glass.zoomable && glass.touch === "none" && glassAfter !== glass.before && glassAfter !== "",
    JSON.stringify({ ...glass, after: glassAfter }),
  );
}

const PLACED_SHEET: Payload<{ items: number; drawn: number; stage: boolean; outlines: string[] } | null> =
  `(() => { const s = window.__vellumPortfolio ? window.__vellumPortfolio() : null;
  return s ? { items: s.items, drawn: s.drawn, stage: !!document.querySelector("#pf-sheet svg"),
    outlines: performance.getEntriesByType("resource").map((e) => new URL(e.name).pathname).filter((p) => p.includes("/outlines/")) } : null; })()`;

export async function cd64PlaceSheet(k: DrawerKit): Promise<void> {
  const { evaluate, send, check, sleep, PORT, forget } = k;
  await forget();
  await send("Page.navigate", { url: "about:blank" });
  const sheet =
    "k-s.seed-42.type-island.outline-ne-1159315211.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-17.ly-13";
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/portfolio/#table=${sheet}` });
  const read = await makeSettle({ evaluate, sleep, tolerant: true })(
    PLACED_SHEET,
    (d) => d.items === 1 && (d.drawn === 1 || d.outlines.some((p) => p !== "/outlines/ne-1159315211.txt")),
    "cd64-place-sheet",
    DRAWN,
  );
  check(
    "CD64 the Portfolio, a page one level down, drafts a place's sheet from the site's root",
    read.drawn === 1 && read.stage && read.outlines.length === 1 && read.outlines[0] === "/outlines/ne-1159315211.txt",
    JSON.stringify(read),
  );
}
