import { PAGE_RGBA, tokenRgba } from "../../support/pixel.ts";
import type { Rgba } from "../../support/pixel.ts";
import type { Payload } from "../../types.ts";
export type Cam = { k: number; x: number; y: number };
export type Ring = { hover: false; t?: undefined; o?: undefined } | { hover: true; t: string; o: string };
export const ringScale = (r: Ring) => parseFloat(((r.t || "").match(/matrix\(([-\d.]+)/) || [])[1] ?? "NaN");
export const ringAtRest = (r: Ring) => r.hover && parseFloat(r.o) === 1 && Math.abs(ringScale(r) - 1) <= 0.02;

export const INKED: Payload<boolean> = `(() => { const t = document.querySelector("#map .voyage-overlay .voyage-track");
  return !!t && (t.getAttribute("points") || "").length > 0; })()`;

export type Overlay = {
  shadow: string;
  position: string;
  pointerEvents: string;
  zIndex: string;
  overflow: string;
  w: number;
  h: number;
  mapW: number;
  mapH: number;
  track: { fill: string; stroke: number[]; sw: string; dash: string; cap: string; vector: string; opacity: string };
  hull: { fill: number[]; stroke: number[]; sw: string } | null;
  body: { fill: number[]; stroke: number[]; sw: string } | null;
} | null;
export const OVERLAY: Payload<Overlay> = `(() => { const rgba = ${PAGE_RGBA}, cs = (e) => getComputedStyle(e);
  const svg = document.querySelector("#map .voyage-overlay"); if (!svg) return null;
  const s = cs(svg), m = document.getElementById("map");
  const track = document.querySelector("#map .voyage-overlay .voyage-track");
  const part = (sel) => { const p = document.querySelector(sel); if (!p) return null; const c = cs(p); return { fill: rgba(c.fill), stroke: rgba(c.stroke), sw: c.strokeWidth }; };
  const t = cs(track);
  return { shadow: s.boxShadow, position: s.position, pointerEvents: s.pointerEvents, zIndex: s.zIndex, overflow: s.overflow,
    w: svg.getBoundingClientRect().width, h: svg.getBoundingClientRect().height, mapW: m.offsetWidth, mapH: m.offsetHeight,
    track: { fill: t.fill, stroke: rgba(t.stroke), sw: t.strokeWidth, dash: t.strokeDasharray, cap: t.strokeLinecap, vector: t.vectorEffect, opacity: t.opacity },
    hull: part("#map .voyage-ship > path:not([class])"), body: part("#map .voyage-rider > path:not([class])") }; })()`;

export type Seat = {
  idx: number;
  name: string;
  flipH: boolean;
  flipV: boolean;
  dx: string;
  dy: string;
  rested: boolean;
  card: number[];
  map: number[];
  nx: number;
  ny: number;
} | null;
export const PICK = (
  idx: number,
): Payload<Seat> => `(() => { const c = document.getElementById("place-card"), h = document.querySelector('#map .place-hit[data-idx="${idx}"]');
  if (!c || c.hidden || !h) return null;
  const inner = c.querySelector(".pc-inner"), a = inner ? inner.getAnimations() : [], r = c.getBoundingClientRect(), m = document.getElementById("map").getBoundingClientRect();
  return { idx: Number(h.dataset.idx), name: (c.querySelector(".pc-name") || {}).textContent, flipH: c.classList.contains("flip-h"), flipV: c.classList.contains("flip-v"),
    dx: c.style.getPropertyValue("--pc-dx"), dy: c.style.getPropertyValue("--pc-dy"), rested: a.length > 0 && a.every((v) => v.playState === "finished") && c.getAnimations().length === 0,
    card: [r.left, r.top, r.right, r.bottom], map: [m.left, m.top, m.width, m.height], nx: parseFloat(h.style.left) / 100, ny: parseFloat(h.style.top) / 100 }; })()`;

export const PICKS: Payload<number[]> =
  `(() => { const hits = [...document.querySelectorAll("#map .place-hit")].map((h) => ({ idx: Number(h.dataset.idx), x: parseFloat(h.style.left) / 100, y: parseFloat(h.style.top) / 100 }));
  return [[0.30, 0.35], [0.70, 0.35], [0.30, 0.65], [0.70, 0.65]].map(([wx, wy]) => { let best = -1, bd = Infinity;
    for (const h of hits) { const d = Math.hypot(h.x - wx, h.y - wy); if (d < bd) { bd = d; best = h.idx; } } return best; }); })()`;

export const FOCUS = (idx: number): Payload<boolean> =>
  `(() => { const h = document.querySelector('#map .place-hit[data-idx="${idx}"]'); if (!h) return false; h.focus({ preventScroll: true }); return true; })()`;

export const AT_HOME = (
  idx: number,
): Payload<{
  px: number;
  py: number;
} | null> => `(() => { const vp = document.getElementById("map-viewport"), t = document.querySelector('#map .place-hit[data-idx="${idx}"]');
  if (!t) return null; const vr = vp.getBoundingClientRect(), r = t.getBoundingClientRect();
  return { px: r.left + r.width / 2 - vr.left, py: r.top + r.height / 2 - vr.top }; })()`;

export const CENTRE = (idx: number, px: number, py: number): Payload<boolean> =>
  `(() => { const vp = document.getElementById("map-viewport"), t = document.querySelector('#map .place-hit[data-idx="${idx}"]');
  if (!t) return false; window.__vellumZoomTo({ k: 4, x: vp.clientWidth / 2 - 4 * ${px}, y: vp.clientHeight / 2 - 4 * ${py} }); return true; })()`;

export type Part = { cls: string; props: Record<string, string | number[]> };
export const PART = (
  sel: string,
  props: readonly string[],
): Payload<Part | null> => `(() => { const rgba = ${PAGE_RGBA}, e = document.querySelector(${JSON.stringify(sel)}); if (!e) return null;
  const cs = getComputedStyle(e), out = {};
  for (const p of ${JSON.stringify(props)}) { const v = cs.getPropertyValue(p); out[p] = /color$/.test(p) && v ? rgba(v) : v; }
  const r = e.getBoundingClientRect(); out.w = r.width; out.h = r.height; return { cls: e.className, props: out }; })()`;

export type Want = readonly [key: string, want: string | number | Rgba, tolerance?: number];

export const cardWants = (rem: number): readonly Want[] => [
  ["position", "absolute"],
  ["width", 16 * rem, 0.5],
  ["pointer-events", "none"],
];
export const paperWants = (rem: number): readonly Want[] => [
  ["box-sizing", "border-box"],
  ["overflow-y", "auto"],
  ["touch-action", "pan-y"],
  ["background-color", tokenRgba("--control-cream")],
  ["color", tokenRgba("--ink-dark")],
  ["border-top-width", "1px"],
  ["border-top-style", "solid"],
  ["border-top-color", tokenRgba("--ink-dark")],
  ["border-top-left-radius", "4px"],
  ["padding-top", 0.6 * rem],
  ["padding-left", 0.75 * rem],
  ["font-size", 0.9 * rem],
  ["line-height", 1.35 * 0.9 * rem],
  ["animation-name", "paperUnfurl"],
];
export const nameWants = (rem: number): readonly Want[] => [
  ["display", "block"],
  ["letter-spacing", 0.02 * rem],
];
export const rankWants = (rem: number): readonly Want[] => [
  ["display", "block"],
  ["font-style", "italic"],
  ["color", tokenRgba("--ink-brown")],
  ["font-size", 0.82 * rem],
  ["text-transform", "uppercase"],
  ["margin-top", 0.1 * rem],
];
export const foundedWants = (rem: number): readonly Want[] => [
  ["display", "block"],
  ["margin-top", 0.35 * rem],
  ["font-variant-numeric", "tabular-nums"],
];
export const actsWants = (rem: number): readonly Want[] => [
  ["display", "flex"],
  ["flex-direction", "column"],
  ["align-items", "flex-start"],
  ["row-gap", 0.3 * rem],
  ["margin-top", 0.45 * rem],
];
export const prospectWants = (rem: number): readonly Want[] => [
  ["display", "block"],
  ["background-color", tokenRgba("--control-gold")],
  ["border-top-width", "1px"],
  ["border-top-color", tokenRgba("--line-tan")],
  ["font-size", 0.82 * rem],
  ["text-decoration-line", "none"],
  ["pointer-events", "auto"],
  ["color", tokenRgba("--ink-dark")],
];
export const layWants = (rem: number): readonly Want[] => [
  ["background-color", tokenRgba("--control-gold")],
  ["border-top-width", "1px"],
  ["border-top-color", tokenRgba("--line-tan")],
  ["font-size", 0.82 * rem],
  ["text-align", "left"],
  ["pointer-events", "auto"],
];
export const noteWants = (rem: number): readonly Want[] => [
  ["display", "block"],
  ["border-top-width", "1px"],
  ["border-top-style", "solid"],
  ["border-top-color", tokenRgba("--ink-dark", 0.22)],
  ["font-size", 0.8 * rem],
  ["color", tokenRgba("--ink-brown")],
  ["margin-top", 0.45 * rem],
  ["padding-top", 0.4 * rem],
];
export const rootsWants = (rem: number): readonly Want[] => [
  ["font-style", "italic"],
  ["font-size", 0.78 * rem],
  ["color", tokenRgba("--ink-tale")],
];
export const formerWants = (rem: number): readonly Want[] => [
  ["display", "block"],
  ["margin-top", 0.15 * rem],
  ["font-size", 0.81 * rem],
  ["color", tokenRgba("--ink-brown")],
];
export const taleWants = (rem: number): readonly Want[] => [
  ["margin-top", 0.4 * rem],
  ["font-style", "italic"],
  ["color", tokenRgba("--ink-tale")],
];

// Under reduced motion the card's own 0.01ms transition makes the engine's reset-then-measure see the previous town's nudge (Issue #868), so the nudge is zeroed and left a frame to land before each town is focused; a card rests once the inner's roll and the card's own transition have both finished.
export const ZERO_NUDGE: Payload<boolean> = `(async () => { const c = document.getElementById("place-card");
  c.style.setProperty("--pc-dx", "0px"); c.style.setProperty("--pc-dy", "0px");
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); return true; })()`;
