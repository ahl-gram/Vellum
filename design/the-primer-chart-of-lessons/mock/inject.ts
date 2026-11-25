// Issue #1256 round: the shot scripts that lay a direction over the real built Primer (`src/pages/primer/index.astro` as `npm run build` pressed it), and the probe every still carries. Nothing in the page is edited but what each seat names: the chart is inserted beside the page's own elements, and every rule the round adds is scoped to its own classes.
import { CARD_CSS, NIGHT_CSS, PAPER_CSS, SEAL_DEFS, SEAT_CSS } from "./dress.ts";

export type Seat = "head" | "head-card" | "slip" | "fold" | "fold-shut" | "none";

export interface Laid {
  readonly seat: Seat;
  readonly svg: string;
  readonly card?: string;
  readonly caption?: string;
  readonly cardAt?: { readonly left: string; readonly top: string };
  readonly foldWidth?: string;
  readonly extraCss?: string;
}

const CSS = PAPER_CSS + NIGHT_CSS + CARD_CSS + SEAT_CSS;

export function layScript(l: Laid): string {
  const parts = {
    css: CSS + (l.extraCss ?? ""),
    defs: SEAL_DEFS,
    svg: l.svg,
    card: l.card ?? "",
    caption: l.caption ?? "",
    seat: l.seat,
    cardLeft: l.cardAt?.left ?? "0",
    cardTop: l.cardAt?.top ?? "0",
    foldWidth: l.foldWidth ?? "40rem",
  };
  return `(() => {
  const P = ${JSON.stringify(parts)};
  if (P.seat === "none") return "none";
  const style = document.createElement("style");
  style.textContent = P.css;
  document.head.append(style);
  document.body.insertAdjacentHTML("afterbegin", P.defs);
  if (P.seat === "head" || P.seat === "head-card") {
    const opening = document.querySelector(".primer .opening");
    const card = P.seat === "head-card" ? P.card.replace('class="col-card"', 'class="col-card" style="left:' + P.cardLeft + ';top:' + P.cardTop + '"') : "";
    opening.insertAdjacentHTML("beforebegin", '<div class="col-head col-paper"><div class="col-frame">' + P.svg + card + '</div>' + (P.caption ? '<p class="col-caption">' + P.caption + '</p>' : '') + '</div>');
    dispatchEvent(new Event("scroll"));
  }
  if (P.seat === "slip") {
    const body = document.querySelector("#index .slip-body");
    const list = body.querySelector("ol.index");
    list.insertAdjacentHTML("beforebegin", '<div class="col-slipchart col-paper">' + P.svg + '</div>' + (P.caption ? '<p class="col-caption">' + P.caption + '</p>' : ''));
  }
  if (P.seat === "fold" || P.seat === "fold-shut") {
    const folio = document.querySelector(".corner.tr");
    const line = folio.querySelector(".dateline");
    line.insertAdjacentHTML("afterend", '<p style="margin:0;text-align:right"><span class="col-press' + (P.seat === "fold-shut" ? ' shut' : '') + '">the chart of lessons</span></p>');
    dispatchEvent(new Event("resize"));
    if (P.seat === "fold-shut") return P.seat;
    const r = folio.getBoundingClientRect();
    const card = P.card.replace('class="col-card"', 'class="col-card" style="left:' + P.cardLeft + ';top:' + P.cardTop + '"');
    document.body.insertAdjacentHTML("beforeend", '<div class="col-fold col-night" style="width:' + P.foldWidth + ';right:' + (innerWidth - r.right) + 'px;top:' + (r.bottom + 30 + scrollY) + 'px">' + P.svg + card + '<p class="col-key">the chart of lessons: every room with steps, and how far you have come</p></div>');
  }
  return P.seat;
})()`;
}

export const PRIME = (store: string): string => `(() => { ${store}; return localStorage.length; })()`;

// The probe: the page's width, how far it scrolled, the seals it drew, the chart's box and lettering, the first step's top, and every pair of the chart's labels, waypoints, rings and pips whose boxes overlap, with the overlap's area in square pixels.
export const PROBE = `(() => {
  const box = (el) => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; };
  const chart = document.querySelector(".col-chart");
  const open = document.querySelector(".primer section.room:not(.folded)");
  const firstStep = open ? open.querySelector("li.step") : document.querySelector("li.step");
  const out = {
    scrollWidth: document.documentElement.scrollWidth,
    scrollY: Math.round(scrollY),
    sealed: document.querySelectorAll("li.step.sealed").length,
    openRoom: open ? open.querySelector("h2[id]").id : null,
    firstStepTop: firstStep ? Math.round(firstStep.getBoundingClientRect().top + scrollY) : null,
    shownStepTop: (() => { const li = [...document.querySelectorAll("li.step")].find((x) => x.getClientRects().length > 0); return li ? Math.round(li.getBoundingClientRect().top + scrollY) : null; })(),
    shownStepBottom: (() => { const li = [...document.querySelectorAll("li.step")].find((x) => x.getClientRects().length > 0); return li ? Math.round(li.getBoundingClientRect().bottom + scrollY) : null; })(),
    chart: chart ? box(chart) : null,
    fold: document.querySelector(".col-fold") ? box(document.querySelector(".col-fold")) : null,
    head: document.querySelector(".col-head") ? box(document.querySelector(".col-head")) : null,
    slip: document.getElementById("index") ? box(document.getElementById("index")) : null,
    press: document.querySelector(".col-press") ? box(document.querySelector(".col-press")) : null,
  };
  if (!chart) return out;
  const named = (el, kind) => ({ kind, text: (el.textContent || el.getAttribute("class") || "").trim().slice(0, 40), room: el.closest("a,g") ? (el.closest("a,g").getAttribute("href") || "") : "", b: box(el) });
  const labels = [...chart.querySelectorAll(".col-place text.name")].map((t) => named(t, "label"));
  const ways = [...chart.querySelectorAll(".col-way circle")].map((c) => { const b = box(c); return { kind: "way", text: (c.parentNode.querySelector("title") || c).textContent.trim().slice(0, 40), b, c: { x: b.x + b.w / 2, y: b.y + b.h / 2, r: b.w / 2 } }; });
  const pips = [...chart.querySelectorAll(".col-place .pip")].map((c) => ({ kind: "pip", text: c.closest(".col-place").querySelector("text.name,title").textContent.trim().slice(0, 40), b: box(c) }));
  const ticks0 = [...chart.querySelectorAll(".col-place")].flatMap((g) => { const t = [...g.querySelectorAll(".col-tick")]; if (!t.length) return []; const bs = t.map(box); const x = Math.min(...bs.map((b) => b.x)), y = Math.min(...bs.map((b) => b.y)); return [{ kind: "ring", text: g.querySelector("text.name,title").textContent.trim().slice(0, 40), b: { x, y, w: Math.max(...bs.map((b) => b.x + b.w)) - x, h: Math.max(...bs.map((b) => b.y + b.h)) - y } }]; });
  const ticks = ticks0;
  const k = chart.getScreenCTM().a;
  out.labelPx = labels.length ? Math.min(...[...chart.querySelectorAll(".col-place text.name")].map((t) => parseFloat(getComputedStyle(t).fontSize) * k)) : null;
  out.numeralPx = chart.querySelector(".col-way text") ? parseFloat(getComputedStyle(chart.querySelector(".col-way text")).fontSize) * k : null;
  out.labelWidths = labels.map((l) => [l.text, Math.round(l.b.w * 10) / 10, Math.round(l.b.h * 10) / 10]);
  out.scale = chart.getScreenCTM().a;
  out.wayPx = ways.length ? Math.min(...ways.map((w) => w.b.w)) : null;
  const meet = (a, b) => { const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x); const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y); return w > 0 && h > 0 ? w * h : 0; };
  const pairs = [];
  const check = (A, B, same) => { for (let i = 0; i < A.length; i++) for (let j = same ? i + 1 : 0; j < B.length; j++) { const a = A[i], b = B[j]; const m = meet(a.b, b.b); if (m > 0.5) pairs.push({ a: a.kind + ":" + a.text, b: b.kind + ":" + b.text, px2: Math.round(m * 10) / 10 }); } };
  check(labels, labels, true);
  const here = [...chart.querySelectorAll(".col-here text")].map((t) => named(t, "you-are-here"));
  check(here, labels, false);
  const rectCircle = (a, c) => { const nx = Math.max(a.x, Math.min(c.x, a.x + a.w)); const ny = Math.max(a.y, Math.min(c.y, a.y + a.h)); const d = Math.hypot(c.x - nx, c.y - ny); return d < c.r ? Math.round((c.r - d) * 10) / 10 : 0; };
  for (const l of labels) for (const w of ways) { const d = rectCircle(l.b, w.c); if (d > 0.3) pairs.push({ a: "label:" + l.text, b: "way:" + w.text, depthPx: d }); }
  check(labels, pips, false);
  check(labels, ticks, false);
  const waysOnly = ways;
  for (let i = 0; i < waysOnly.length; i++) for (let j = i + 1; j < waysOnly.length; j++) { const a = waysOnly[i].c, b = waysOnly[j].c; const d = a.r + b.r - Math.hypot(a.x - b.x, a.y - b.y); if (d > 0.3) pairs.push({ a: "way:" + waysOnly[i].text, b: "way:" + waysOnly[j].text, depthPx: Math.round(d * 10) / 10 }); }
  out.wayGapPx = waysOnly.length > 1 ? Math.round(Math.min(...waysOnly.flatMap((w, i) => waysOnly.slice(i + 1).map((v) => Math.hypot(w.c.x - v.c.x, w.c.y - v.c.y) - w.c.r - v.c.r))) * 10) / 10 : null;
  const groups = [...chart.querySelectorAll(".col-place")];
  const marks = groups.flatMap((g, gi) => {
    const name = (g.querySelector("text.name,title") || {}).textContent;
    const ticks = [...g.querySelectorAll(".col-tick")].map(box);
    const ring = ticks.length ? (() => { const x0 = Math.min(...ticks.map((b) => b.x)), x1 = Math.max(...ticks.map((b) => b.x + b.w)), y0 = Math.min(...ticks.map((b) => b.y)), y1 = Math.max(...ticks.map((b) => b.y + b.h)); return [{ g: gi, name, x: (x0 + x1) / 2, y: (y0 + y1) / 2, r: Math.max(x1 - x0, y1 - y0) / 2 }]; })() : [];
    return [...[...g.querySelectorAll(".col-way circle, .pip")].map((c) => { const b = box(c); return { g: gi, name, x: b.x + b.w / 2, y: b.y + b.h / 2, r: b.w / 2 }; }), ...ring];
  });
  let clear = Infinity, clearPair = null;
  for (let i = 0; i < marks.length; i++) for (let j = i + 1; j < marks.length; j++) { const a = marks[i], b = marks[j]; if (a.g === b.g) continue; const d = Math.hypot(a.x - b.x, a.y - b.y) - a.r - b.r; if (d < clear) { clear = d; clearPair = a.name + " / " + b.name; } }
  out.placeClearPx = marks.length > 1 ? Math.round(clear * 10) / 10 : null;
  out.placeClearPair = clearPair;
  const card = document.querySelector(".col-card");
  if (card) { const cb = box(card); out.card = cb; out.cardCovers = [...labels, ...ways, ...pips].filter((x) => meet(cb, x.b) > 0.5).map((x) => x.kind + ":" + x.text); }
  out.overlaps = pairs;
  return out;
})()`;
