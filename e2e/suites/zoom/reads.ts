import { PAGE_RGBA } from "../../support/pixel.ts";
import type { Payload } from "../../types.ts";
export type Cam = { k: number; x: number; y: number };

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
  track: {
    fill: string;
    stroke: number[] | null;
    sw: string;
    dash: string;
    cap: string;
    vector: string;
    opacity: string;
  };
  hull: { fill: number[] | null; stroke: number[] | null; sw: string } | null;
  body: { fill: number[] | null; stroke: number[] | null; sw: string } | null;
} | null;
export const OVERLAY: Payload<Overlay> = `(() => { const colour = ${PAGE_RGBA}, rgba = (css) => { try { return colour(css); } catch { return null; } }, cs = (e) => getComputedStyle(e);
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
    card: [r.left, r.top, r.right, r.bottom], map: [m.left, m.top, m.width, m.height], nx: parseFloat(h.style.getPropertyValue("--nx")), ny: parseFloat(h.style.getPropertyValue("--ny")) }; })()`;

export const PICKS: Payload<number[]> =
  `(() => { const hits = [...document.querySelectorAll("#map .place-hit")].map((h) => ({ idx: Number(h.dataset.idx), x: parseFloat(h.style.getPropertyValue("--nx")), y: parseFloat(h.style.getPropertyValue("--ny")) }));
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

// At depth the town is seated an eighth of the box in from the two edges its card flips away from: the card keeps seven eighths of the box, and the mark moves off the spot it held at rest, so a card that stopped riding the camera would be left behind.
export const SEAT_AT = (px: number, py: number, left: boolean, up: boolean): Payload<boolean> =>
  `(() => { const vp = document.getElementById("map-viewport"), w = vp.clientWidth, h = vp.clientHeight;
  const want = { k: 4, x: (${left} ? w * 7 / 8 : w / 8) - 4 * ${px}, y: (${up} ? h * 7 / 8 : h / 8) - 4 * ${py} };
  window.__vellumZoomTo(want); const s = window.__vellumZoomState(); return s.k === want.k && s.x === want.x && s.y === want.y; })()`;

// Under reduced motion the blanket's 0.01ms makes the map's camera a transition that runs for several frames and the card's own anchor another, so the engine's clamp measures the camera before this one, or the previous town's nudge (Issue #868); before each town is focused the map is waited to rest and the nudge zeroed and left two frames to land.
export const ZERO_NUDGE: Payload<boolean> = `(async () => { const c = document.getElementById("place-card"), m = document.getElementById("map"), frame = () => new Promise((r) => requestAnimationFrame(r));
  for (let i = 0; i < 90 && m.getAnimations().length > 0; i++) await frame();
  c.style.setProperty("--pc-dx", "0px"); c.style.setProperty("--pc-dy", "0px"); await frame(); await frame(); return m.getAnimations().length === 0; })()`;

export const HIDE: Payload<boolean> = `(async () => { const c = document.getElementById("place-card"), frame = () => new Promise((r) => requestAnimationFrame(r));
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  for (let i = 0; i < 30 && !c.hidden; i++) await frame();
  void getComputedStyle(c).display; await frame(); return c.hidden; })()`;
