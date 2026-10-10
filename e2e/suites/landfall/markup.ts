// Home's markup as the browser built it (Issue #779 part 2f, the source-text tests moved here): the stations and the marks, the legend and the slips, the shelf, the notice and the how panel, and the hook. Read on the landfall suite's settled home at 1280x800.
import { OG_HOOK_LINES } from "../../../src/render/og-card.ts";
import { homeStage } from "../../../src/site/home/stage-data.ts";
import { homeStations, howStation, unclaimedDots } from "../../../src/site/home/stations.ts";
import type { Payload, SuiteContext } from "../../types.ts";

type Pip = { tag: string; type: string | null; id: string | null; nx: string | null; ny: string | null; sea: boolean };
type Stations = { marks: string | null; layer: boolean | null; pips: Pip[]; dots: number; cards: string[] };

const STATIONS: Payload<Stations> = `(() => ({
  marks: document.querySelector(".lf-marks")?.getAttribute("aria-hidden") ?? null,
  layer: document.querySelector(".lf-stations")?.hasAttribute("aria-hidden") ?? null,
  pips: [...document.querySelectorAll(".lf-stations > *")].map((b) => ({ tag: b.tagName, type: b.getAttribute("type"), id: b.getAttribute("data-station"),
    nx: b.getAttribute("data-nx"), ny: b.getAttribute("data-ny"), sea: b.classList.contains("at-sea") })),
  dots: document.querySelectorAll(".lf-marks > .lf-dot").length,
  cards: [...document.querySelectorAll("aside.lf-card")].map((c) => c.id),
}))()`;

export async function l13Stations({ evaluate, check }: SuiteContext): Promise<void> {
  const r = await evaluate(STATIONS);
  const want = [...homeStations(), howStation()];
  const dots = unclaimedDots(homeStage().dots, homeStations()).length;
  const pipOk = (p: Pip, i: number) =>
    p.tag === "BUTTON" &&
    p.type === "button" &&
    p.id === want[i]!.id &&
    p.nx === String(want[i]!.nx) &&
    p.ny === String(want[i]!.ny) &&
    p.sea === want[i]!.sea;
  check(
    "L13 home's stations are real buttons outside the marks' aria shroud, one per station and the how pip from one template, each carrying its anchor at full precision and the at-sea dress its own sea flag earns, each with its slip, while the marks are every manifest place the stations leave unclaimed (#455, #458, #459)",
    r.marks === "true" &&
      r.layer === false &&
      r.pips.length === want.length &&
      r.pips.every(pipOk) &&
      want.every((s) => r.cards.includes(`lf-card-${s.id}`)) &&
      r.dots === dots,
    JSON.stringify({ ...r, wantDots: dots }),
  );
}

// The page's own words: every text node but a script's or a style's.
const PAGE_TEXT = `(() => { const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let s = ""; while (w.nextNode()) if (!w.currentNode.parentElement.closest("script, style")) s += w.currentNode.textContent; return s; })()`;

type Slip = { id: string; kids: string[]; enter: string | null; arms: string[] };
type Legend = {
  head: string | null;
  gloss: number;
  row: { id: string | null; verb: string; room: string }[];
  slips: Slip[];
};

const LEGEND: Payload<Legend> = `(() => ({
  head: document.querySelector("nav.lf-legend > p.lf-legend-head")?.textContent ?? null,
  gloss: ${PAGE_TEXT}.split("Every seed is a world entire").length - 1,
  row: [...document.querySelectorAll("nav.lf-legend .lf-legend-row > *")].map((b) => ({ id: b.getAttribute("data-station"),
    verb: b.querySelector(".lf-legend-verb")?.textContent ?? "", room: b.querySelector(".lf-legend-room")?.textContent ?? "" })),
  slips: [...document.querySelectorAll("aside.lf-card:not(.lf-card-how)")].map((c) => ({ id: c.id, kids: [...c.children].map((e) => e.className),
    enter: c.querySelector(":scope > a.lf-card-enter")?.getAttribute("href") ?? null, arms: [...c.querySelectorAll(".lf-card-arms img")].map((i) => i.getAttribute("src")) })),
}))()`;

const slipKids = (arms: boolean) => [
  "lf-card-close",
  "lf-card-verb",
  "lf-card-title",
  "lf-card-where",
  "lf-card-prose",
  ...(arms ? ["lf-card-arms"] : []),
  "lf-card-enter",
];

export async function l14Legend({ evaluate, check }: SuiteContext): Promise<void> {
  const r = await evaluate(LEGEND);
  const stations = homeStations();
  const arms = ["charts/arms-42-0.svg", "charts/arms-42-1.svg", "charts/arms-42-2.svg"];
  const slipOk = (s: Slip | undefined, i: number) =>
    !!s &&
    s.id === `lf-card-${stations[i]!.id}` &&
    JSON.stringify(s.kids) === JSON.stringify(slipKids(stations[i]!.arms)) &&
    s.enter === stations[i]!.href &&
    JSON.stringify(s.arms) === JSON.stringify(stations[i]!.arms ? arms : []);
  check(
    "L14 the legend glosses the encounters once, at its head, and lists one press per station in the roster's order, verb then the legend's name, the how pip none; every station slip runs its close, verb, title, where and prose (the Atlas its three arms) and ends at its room's door (#458, #459)",
    !!r.head &&
      r.head.startsWith("Every seed is a world entire") &&
      r.gloss === 1 &&
      JSON.stringify(r.row) === JSON.stringify(stations.map((s) => ({ id: s.id, verb: s.verb, room: s.legendName }))) &&
      r.slips.length === stations.length &&
      stations.every((_, i) => slipOk(r.slips[i], i)),
    JSON.stringify(r),
  );
}

type Shelf = {
  follows: boolean;
  head: string | null;
  figures: { href: string | null; caption: string; status: number; img: Record<string, string | number | null> }[];
  hidden: number;
  inNoscript: boolean;
};

const PLATES = [
  ["charts/chart-42-topographic.svg", "Topographic survey"],
  ["charts/chart-42-ink.svg", "Pen & ink"],
  ["charts/chart-42-nautical.svg", "Nautical chart, with fathom soundings"],
] as const;

// The plates are lazy: each is brought into view and waited on until it has decoded, so its natural size is the file's own.
const SHELF: Payload<Promise<Shelf | null>> = `(async () => {
  const shelf = document.querySelector("section.lf-shelf");
  if (!shelf) return null;
  const imgs = [...shelf.querySelectorAll("img")];
  for (const i of imgs) { i.scrollIntoView({ block: "center" }); await i.decode().catch(() => {}); }
  window.scrollTo(0, 0);
  const figures = await Promise.all([...shelf.querySelectorAll("figure")].map(async (f) => {
    const a = f.querySelector(":scope > a[href]"), i = f.querySelector("img"), href = a ? a.getAttribute("href") : null;
    const status = href ? (await fetch(href, { method: "HEAD" })).status : 0;
    return { href, caption: f.querySelector("figcaption")?.textContent ?? "", status,
      img: i && { loading: i.getAttribute("loading"), priority: i.getAttribute("fetchpriority"), plate: i.classList.contains("plate") ? 1 : 0,
        w: i.getAttribute("width"), h: i.getAttribute("height"), nw: i.naturalWidth, nh: i.naturalHeight, alt: i.getAttribute("alt") } };
  }));
  return { follows: document.querySelector("section.landfall")?.nextElementSibling === shelf, head: shelf.querySelector("h2")?.textContent ?? null,
    figures, hidden: shelf.querySelectorAll("[hidden]").length + (shelf.hidden ? 1 : 0), inNoscript: !!shelf.closest("noscript") };
})()`;

const plated = (img: Record<string, string | number | null> | null) =>
  !!img &&
  img.loading === "lazy" &&
  img.priority === "low" &&
  img.plate === 1 &&
  Number(img.nw) > 0 &&
  img.w === String(img.nw) &&
  img.h === String(img.nh) &&
  typeof img.alt === "string" &&
  img.alt.trim() !== "";

export async function l15Shelf({ evaluate, check }: SuiteContext): Promise<void> {
  const r = await evaluate(SHELF, true);
  check(
    "L15 the shelf is plain flow after the landfall section: its heading and exactly the three survey plates, each linking its own chart (answered 200) under its caption, lazy and low priority, wearing the plate tip, its size attributes the plate's own and its style named, nothing on it hidden (#329, #472)",
    !!r &&
      r.follows &&
      r.head === "One World, Many Charts" &&
      r.figures.length === PLATES.length &&
      r.figures.every(
        (f, i) => f.href === PLATES[i]![0] && f.caption === PLATES[i]![1] && f.status === 200 && plated(f.img),
      ) &&
      r.hidden === 0 &&
      !r.inNoscript,
    JSON.stringify(r),
  );
}

type Notice = {
  stamp: { inStage: boolean; hidden: string | null; head: string | null; body: string[] } | null;
  once: number;
  retired: boolean;
  how: {
    cls: string;
    hidden: boolean;
    kids: string[];
    scroll: { tabindex: string | null; role: string | null; text: string } | null;
    enter: boolean;
  } | null;
  oldHead: boolean;
  noscript: { doors: string[]; sheet: string | null } | null;
  sheetFetched: boolean;
};

// With scripts on, the noscript's contents are text, not elements, so its markup goes through the browser's own parser.
const NOTICE: Payload<Notice> = `(() => {
  const stamp = document.querySelector("aside.notice-stamp"), how = document.getElementById("lf-card-how"), text = ${PAGE_TEXT};
  const lines = (p) => p ? [...p.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()) : [];
  const ns = document.querySelector("section.landfall noscript"), parsed = ns && new DOMParser().parseFromString(ns.textContent, "text/html");
  const scroll = how && how.querySelector(":scope > .lf-card-scroll");
  return {
    stamp: stamp && { inStage: !!stamp.closest("#lf-stage"), hidden: stamp.getAttribute("aria-hidden"), head: stamp.querySelector(".stamp-head")?.textContent ?? null, body: lines(stamp.querySelector(".stamp-body")) },
    once: text.split("No feature on this chart exists").length - 1, retired: text.includes("Navigation of these waters"),
    how: how && { cls: how.className, hidden: how.hidden, kids: [...how.children].map((e) => e.className), enter: !!how.querySelector(".lf-card-enter"),
      scroll: scroll && { tabindex: scroll.getAttribute("tabindex"), role: scroll.getAttribute("role"), text: scroll.textContent.replace(/\\s+/g, " ") } },
    oldHead: [...document.querySelectorAll("h2")].some((h) => h.textContent.trim() === "How It Works"),
    noscript: parsed && { doors: [...parsed.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")), sheet: parsed.querySelector("link[rel='stylesheet']")?.getAttribute("href") ?? null },
    sheetFetched: performance.getEntriesByType("resource").some((e) => e.name.endsWith("/home-noscript.css")),
  };
})()`;

const MARKERS = [
  "Vellum surveys worlds",
  "raises land out of noise",
  "Towns settle where any founder would",
  "drafting table",
  "ten invented languages, one per culture",
  "Under the hood",
  "priority-flood",
  "README",
];
const HOW_KIDS = ["lf-card-close", "lf-card-verb", "lf-card-title", "lf-card-where", "lf-card-scroll"];
const DOORS = ["explorer/", "reading-room/", "atlas/", "gallery/"];

const stamped = (s: Notice["stamp"]) =>
  !!s &&
  s.inStage &&
  s.hidden === "true" &&
  s.head === "Notice to Mariners" &&
  JSON.stringify(s.body) === JSON.stringify(["No feature on this chart exists.", "Soundings are imaginary."]);
const paneled = (h: Notice["how"]) =>
  !!h &&
  h.cls === "lf-card lf-card-how" &&
  h.hidden &&
  JSON.stringify(h.kids) === JSON.stringify(HOW_KIDS) &&
  !!h.scroll &&
  h.scroll.tabindex === "0" &&
  h.scroll.role === "region" &&
  MARKERS.every((m) => h.scroll!.text.includes(m)) &&
  !h.enter;

export async function l16NoticeAndPanel({ evaluate, check }: SuiteContext): Promise<void> {
  const r = await evaluate(NOTICE);
  check(
    "L16 the Notice to Mariners is the mockup's stamp on the deep, decorative and the only copy of its words; the how panel is a card slip shipped hidden, its close and head above a keyboard-reachable region that carries the prose, and no door; the noscript carries the four doors and its own sheet, which a reader with scripts on never fetches (#459, #470, Issue #779 ruling M2 of the 2d move)",
    stamped(r.stamp) &&
      r.once === 1 &&
      !r.retired &&
      paneled(r.how) &&
      !r.oldHead &&
      !!r.noscript &&
      JSON.stringify(r.noscript.doors) === JSON.stringify(DOORS) &&
      r.noscript.sheet === "home-noscript.css" &&
      !r.sheetFetched,
    JSON.stringify({
      ...r,
      how: r.how && { ...r.how, scroll: r.how.scroll && { ...r.how.scroll, text: r.how.scroll.text.length } },
    }),
  );
}

const HOOK: Payload<string[] | null> =
  `(() => { const h = document.querySelector(".lf-seed .seed-hook"); return h ? [...h.childNodes].map((n) => n.nodeName === "BR" ? "<br>" : n.textContent.trim()) : null; })()`;

export async function l17Hook({ evaluate, check }: SuiteContext): Promise<void> {
  const hook = await evaluate(HOOK);
  check(
    "L17 the corner's hook is the share card's, line for line, broken where the card breaks it (#490)",
    JSON.stringify(hook) === JSON.stringify([OG_HOOK_LINES[0], "<br>", OG_HOOK_LINES[1]]),
    JSON.stringify(hook),
  );
}
