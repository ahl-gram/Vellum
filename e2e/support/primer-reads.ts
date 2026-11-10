// What the Primer check reads in the page (Issue #1250): a control's facts, what lies under a point, and the counters a room's rest is read against.
import type { Payload } from "../types.ts";
import type { Words } from "../../src/site/shared/primer/shape.ts";
import type { Box, Facts } from "./primer-judge.ts";

const at = (css: string, nth = 0): string => `document.querySelectorAll(${JSON.stringify(css)})[${nth}]`;

export const FACTS = (w: Words): Payload<Facts> => `(() => {
  const e = ${at(w.css)};
  const none = { found: false, shown: false, box: null, clip: "", held: false, disabled: false, text: "", aria: null, title: null, placeholder: null, attr: null, label: "", road: ["", ""], options: [] };
  if (!e) return none;
  const s = getComputedStyle(e);
  const shown = !e.closest("[hidden]") && s.display !== "none" && s.visibility !== "hidden";
  if (shown) e.scrollIntoView({ block: "center", inline: "center" });
  const b = e.getBoundingClientRect();
  const l = e.labels && e.labels[0] ? e.labels[0] : e.closest("label");
  const part = (sel) => { const p = e.querySelector(sel); return p ? p.textContent : ""; };
  return {
    found: true, shown, box: { x: b.left, y: b.top, w: b.width, h: b.height }, clip: s.clipPath || "",
    held: !!e.closest(".held"), disabled: e.disabled === true || e.getAttribute("aria-disabled") === "true",
    text: e.textContent || "", aria: e.getAttribute("aria-label"), title: e.getAttribute("title"),
    placeholder: e.getAttribute("placeholder"), attr: ${w.attr === undefined ? "null" : `e.getAttribute(${JSON.stringify(w.attr)})`},
    label: l ? l.textContent || "" : "", road: [part(".verb"), part(".room")],
    options: e.options ? [...e.options].map((o) => ({ text: o.textContent || "", disabled: o.disabled })) : [],
  };
})()`;

export const HIT = (css: string, x: number, y: number): Payload<string> => `(() => {
  const e = ${at(css)};
  if (!e) return "nothing";
  if (${x} < 0 || ${y} < 0 || ${x} >= innerWidth || ${y} >= innerHeight) return "off screen";
  const top = document.elementFromPoint(${x}, ${y});
  if (top === e || (top && e.contains(top))) return "self";
  if (e.labels && [...e.labels].some((l) => l === top || l.contains(top))) return "label";
  return top ? (top.id ? "#" + top.id : top.getAttribute("class") || top.tagName) : "nothing";
})()`;

export type Aim = { readonly box: Box; readonly clip: string } | null;
export const AIM = (css: string, nth = 0): Payload<Aim> => `(() => {
  const e = ${at(css, nth)};
  if (!e) return null;
  e.scrollIntoView({ block: "center", inline: "center" });
  let t = e;
  let b = e.getBoundingClientRect();
  if ((b.width === 0 || b.height === 0) && e.labels && e.labels[0]) { t = e.labels[0]; b = t.getBoundingClientRect(); }
  return { box: { x: b.left, y: b.top, w: b.width, h: b.height }, clip: getComputedStyle(t).clipPath || "" };
})()`;

export type Field = {
  readonly type: string;
  readonly value: string;
  readonly min: number;
  readonly max: number;
  readonly step: number;
};
export const FIELD = (css: string): Payload<Field | null> =>
  `(() => { const e = ${at(css)}; return e ? { type: e.type, value: e.value, min: +e.min, max: +e.max, step: +e.step || 1 } : null; })()`;
// A slider's or a list's value is set in the page with the events a reader's change sends, once the control stands reachable (Issue #1250, ruling D: "Set values from inside the page").
export const SET_VALUE = (css: string, value: string, release: boolean): Payload<boolean> =>
  `(() => { const e = ${at(css)}; e.value = ${JSON.stringify(value)}; e.dispatchEvent(new Event("input", { bubbles: true })); ${release ? `e.dispatchEvent(new Event("change", { bubbles: true }));` : ""} return true; })()`;
export const PICK_OPTION = (css: string, option: string): Payload<boolean> =>
  `(() => { const e = ${at(css)}; const o = [...e.options].find((x) => (x.textContent || "").replace(/\\s+/g, " ").trim() === ${JSON.stringify(option)}); if (!o) return false; e.value = o.value; e.dispatchEvent(new Event("input", { bubbles: true })); e.dispatchEvent(new Event("change", { bubbles: true })); return true; })()`;
export const FOCUS = (css: string, selectAll: boolean): Payload<boolean> =>
  `(() => { const e = ${at(css)}; if (!e) return false; e.focus(); ${selectAll ? "e.select();" : ""} return document.activeElement === e; })()`;
export const CHOSEN = (css: string): Payload<{ text: string }> =>
  `(() => { const e = ${at(css)}; const o = e && e.options[e.selectedIndex]; return { text: o ? (o.textContent || "").replace(/\\s+/g, " ").trim() : "" }; })()`;
export const PRESENT = (css: string): Payload<{ here: boolean }> => `({ here: !!${at(css)} })`;
export const FIRST_ENTRY = (css: string): Payload<{ name: string }> =>
  `(() => { const n = ${at(css)}; return { name: n ? n.textContent || "" : "" }; })()`;
export const HASH: Payload<string> = `location.hash`;
export const BARE: Payload<string> = `(() => { localStorage.clear(); sessionStorage.clear(); return location.origin; })()`;

export const ARM: Payload<boolean> = `(() => {
  const w = (window.__primer = { marks: 0, frames: 0 });
  new MutationObserver((rs) => { w.marks += rs.length; }).observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
  const tick = () => { w.frames++; requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  return true;
})()`;
export const MOVING = `document.getAnimations().filter((a) => a.playState !== "finished" && !(a.effect && a.effect.getTiming().iterations === Infinity)).length`;
