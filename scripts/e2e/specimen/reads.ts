import type { Payload } from "../types.ts";

export const PAGE = "/specimen/";
export const CHART_ASPECT = 1500 / 1157.931;
export const INK_BROWN = "rgb(107, 90, 64)";
export const CONTROL_GOLD = "rgb(240, 227, 189)";
type Box = { x: number; y: number; w: number; h: number; right: number; bottom: number } | null;
export type Specimen = { st: { state: string; folded: boolean; zoomed: boolean; pill: string } | null; innerW: number; innerH: number; rem: number; chromeX: number; plateLoaded: boolean; plateAspect: number | null; sheet: Box; map: Box; slip: Box; slipVis: string | null; slipDisp: string | null; slipPos: string | null; slipBody: string | null; tabVis: string | null; tabDisp: string | null; folio: Box; chartFolio: Box; chartFolioDisp: string | null; folioRoomPos: string | null; chartFolioText: number | null; glass: Box; glassDisp: string | null; glassOverFolio: [number, number] | null; legend: Box; legendDisp: string | null; legendGround: string | null; legendGroundOn: string | null; legendInSlip: boolean; legendDocked: boolean; folioInset: string[] | null; pool: string | null; poolChrome: string | null; poolGlass: string | null; folioPanel: string | null; folioFilter: string | null; pillDisp: string | null; pillText: string | null; pill: Box; folioLines: boolean[]; crNum: string | null; inked: string | null; unInked: string | null; gold: string | null; disabled: string | null; missDisp: string | null; handleExpanded: string | null; sheetH: string; fog: string | null; vignette: string | null; noX: boolean };
// @ts-expect-error the legend row, the Glass and the booted page are read as present; a null one throws inside SB4's step, which reds SB4 by name
export const atFolded = (from: Specimen) => (d: Specimen, p: Specimen | null): boolean => d.slipVis === "hidden" && d.tabVis === "visible" && d.legend.x !==
  // @ts-expect-error the legend row, the Glass and the booted page are read as present; a null one throws inside SB4's step, which reds SB4 by name
  from.legend.x && !!p &&
  // @ts-expect-error the legend row, the Glass and the booted page are read as present; a null one throws inside SB4's step, which reds SB4 by name
  d.legend.x ===
  // @ts-expect-error the legend row, the Glass and the booted page are read as present; a null one throws inside SB4's step, which reds SB4 by name
  p.legend.x &&
  // @ts-expect-error the legend row, the Glass and the booted page are read as present; a null one throws inside SB4's step, which reds SB4 by name
  d.glass.right ===
  // @ts-expect-error the legend row, the Glass and the booted page are read as present; a null one throws inside SB4's step, which reds SB4 by name
  p.glass.right;

export const READ: Payload<Specimen> = `(() => {
  const r = (sel) => { const e = document.querySelector(sel); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height, right: b.right, bottom: b.bottom }; };
  const cs = (sel, prop, pseudo) => { const e = document.querySelector(sel); return e ? getComputedStyle(e, pseudo || null)[prop] : null; };
  const legend = document.querySelector(".legend");
  const plate = document.getElementById("sb-plate");
  const root = getComputedStyle(document.documentElement);
  return {
    st: window.__vellumSpecimenState ? window.__vellumSpecimenState() : null,
    innerW: innerWidth, innerH: innerHeight, rem: parseFloat(root.fontSize), chromeX: parseFloat(root.getPropertyValue("--chrome-x")),
    plateLoaded: !!plate && plate.complete && plate.naturalWidth > 0, plateAspect: plate && plate.naturalWidth > 0 ? plate.naturalWidth / plate.naturalHeight : null,
    sheet: r("#sheet"), map: r("#map"),
    slip: r(".slip"), slipVis: cs(".slip", "visibility"), slipDisp: cs(".slip", "display"), slipPos: cs(".slip", "position"), slipBody: cs(".slip-body", "display"),
    tabVis: cs(".slip-tab", "visibility"), tabDisp: cs(".slip-tab", "display"),
    folio: r(".corner.tr"), chartFolio: r(".corner.bl"), chartFolioDisp: cs(".corner.bl", "display"), folioRoomPos: cs(".corner.folio-room", "position"),
    // room-seats.ts places the legend from the folio's wrapped TEXT, not its box (a short line leaves the row more room).
    chartFolioText: (() => { const f = document.querySelector(".corner.bl"); if (!f) return null; const range = document.createRange(); let right = null; for (const p of f.querySelectorAll("p")) { if (!p.textContent) continue; range.selectNodeContents(p); const b = range.getBoundingClientRect(); if (b.width > 0) right = Math.max(right ?? 0, b.right); } return right; })(),
    glass: r(".corner.br"), glassDisp: cs(".zoomery", "display"),
    glassOverFolio: (() => { const g = document.querySelector(".corner.br"), f = document.querySelector(".corner.tr"); if (!g || !f) return null; const a = g.getBoundingClientRect(), b = f.getBoundingClientRect(); const w = Math.min(a.right, b.right) - Math.max(a.x, b.x), h = Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y); return w > 0 && h > 0 ? [Math.round(w), Math.round(h)] : null; })(),
    legend: r(".legend"), legendDisp: cs(".legend", "display"), legendGround: cs(".legend", "backgroundImage", "::before"), legendGroundOn: cs(".legend", "content", "::before"), legendInSlip: !!legend && legend.classList.contains("in-slip"), legendDocked: !!legend && !!legend.parentElement && legend.parentElement.classList.contains("legend-dock"),

    folioInset: (() => { const e = document.querySelector(".corner.tr"); if (!e) return null; const c = getComputedStyle(e, "::before"); return [c.top, c.right, c.bottom, c.left]; })(),
    pool: cs(".corner.tr", "content", "::before"), poolChrome: cs("header.chrome", "content", "::before"), poolGlass: cs(".corner.br", "content", "::before"), folioPanel: cs(".corner.tr", "backgroundImage", "::before"), folioFilter: cs(".corner.tr", "filter", "::before"),
    pillDisp: cs("#sb-status", "display"), pillText: (document.getElementById("sb-status") || { textContent: null }).textContent, pill: r("#sb-status"),
    folioLines: [...document.querySelectorAll(".corner.bl p")].map((p) => p.textContent.length > 0),
    crNum: cs(".contents .cr-num", "color"), inked: cs(".index li.inked", "opacity"), unInked: cs(".index > li:not(.inked)", "opacity"),
    gold: cs(".legend-btn.gold", "background-color"), disabled: cs(".legend-btn:disabled", "opacity"), missDisp: cs(".index .terms a.miss", "display"),
    handleExpanded: (document.querySelector(".slip-handle") || { getAttribute() { return null; } }).getAttribute("aria-expanded"),
    sheetH: document.body.style.getPropertyValue("--sheet-h"),
    fog: cs(".fog.a", "display"), vignette: cs(".vignette.top", "display"),
    noX: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  };
})()`;

export const NOSCRIPT_READ: Payload<{ present: false; pill: { disp: string; w: number } | null } | { present: true; disp: string; w: number; text: number; pill: { disp: string; w: number } | null }> = `(() => {
  const n = document.querySelector(".stage noscript .status");
  const p = document.getElementById("sb-status");
  const box = (e) => { const b = e.getBoundingClientRect(); return { disp: getComputedStyle(e).display, w: Math.round(b.width * 100) / 100 }; };
  if (!n) return { present: false, pill: p ? box(p) : null };
  return { present: true, ...box(n), text: n.textContent.trim().length, pill: p ? box(p) : null };
})()`;
