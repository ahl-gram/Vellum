// The chrome's text over the chart, piece by piece, for the contrast reads over a floored sheet (EA4 in stage.ts, NS1 in short.ts) and over a zoomed one (EZ1 and EZ2 in zoomed.ts), the strip's (EZ4 in strip.ts), and home's and the Gallery's clusters (CL1, RH33).
import type { Payload } from "../../types.ts";

export type Glyph = {
  piece: string;
  t: string;
  ink: [number, number, number];
  row: number;
  x: number;
  w: number;
  disabled: boolean;
};
const PIECES = "header.chrome, .corner, .strip, .legend";

// Every text node of the chrome whose box centre stands on the sheet, by piece; decor hidden from assistive technology (the nav's separator dots) is left out, and the ink is the computed colour, so a translucent ancestor reads darker ink than it paints and errs toward passing.
const glyphsOver = (perLine: boolean, sheetOnly: boolean): Payload<Glyph[]> => `(() => {
  const sheet = ${sheetOnly} ? document.getElementById("sheet").getBoundingClientRect() : null;
  const unseen = (el) => { for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) === 0) return true; } return false; };
  const name = (root) => root.matches("header.chrome") ? "cluster" : root.matches(".corner.tr") ? "room folio" : root.matches(".corner.bl") ? "chart folio" : root.matches(".corner.br") ? "Glass" : root.matches(".strip") ? "strip" : root.matches(".legend") ? "Press" : "corner";
  const out = [];
  for (const root of document.querySelectorAll(${JSON.stringify(PIECES)})) {
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      const el = n.parentElement;
      if (!n.textContent.trim() || !el || el.closest("[aria-hidden='true'], option, select, script, style") || unseen(el)) continue;
      const rg = new Range(); rg.selectNodeContents(n);
      for (const b of ${perLine} ? [...rg.getClientRects()] : [rg.getBoundingClientRect()]) {
        if (!(b.width > 0)) continue;
        const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
        if (${sheetOnly} && (cx < sheet.left || cx > sheet.right || cy < sheet.top || cy > sheet.bottom)) continue;
        const m = getComputedStyle(el).color.match(/[0-9.]+/g).map(Number);
        out.push({ piece: name(root), t: (el.classList.contains("fn") ? "the section mark " : "") + n.textContent.trim().slice(0, 24), ink: [m[0], m[1], m[2]], row: Math.round(cy), x: Math.max(0, Math.floor(b.left)), w: Math.max(1, Math.floor(b.width)), disabled: !!el.closest(":disabled") });
      }
    }
    for (const input of root.querySelectorAll("input[type=number], input[type=text], input[type=search], input:not([type])")) {
      if (!input.value || unseen(input)) continue;
      const b = input.getBoundingClientRect(), cs = getComputedStyle(input);
      const x = b.left + parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth), w = b.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth);
      const cx = x + w / 2, cy = b.top + b.height / 2;
      if (!(w > 0) || (${sheetOnly} && (cx < sheet.left || cx > sheet.right || cy < sheet.top || cy > sheet.bottom))) continue;
      const m = cs.color.match(/[0-9.]+/g).map(Number);
      out.push({ piece: name(root), t: "the field " + (input.id || input.name || input.type), ink: [m[0], m[1], m[2]], row: Math.round(cy), x: Math.max(0, Math.floor(x)), w: Math.max(1, Math.floor(w)), disabled: input.disabled });
    }
  }
  return out;
})()`;
export const GLYPHS_OVER_SHEET = glyphsOver(false, true);
// One entry per line box, so a sampled row crosses that line's glyphs and not the gap between two lines of a wrapped node (NS1's painted read; a node's union box put the chart folio's two-line title's row between its lines).
export const GLYPH_LINES_OVER_SHEET = glyphsOver(true, true);
// Every chrome line wherever it stands, one entry per line box, for the zoomed reads, where the chart runs under the chrome past the sheet's fitted box (EZ1 and EZ2 in `e2e/suites/stage/zoomed.ts`), and on home and in the Gallery, which have no #sheet (CL1 in `e2e/suites/cluster.ts`, RH33 in `e2e/suites/runninghead/gallery.ts`).
export const GLYPH_LINES =glyphsOver(true, false);
// Every glyph the instrument strip paints, aria-hidden ones included, since every letter on it but Play carries aria-hidden (the told line, the year readout, the scale's labels) and each is read on screen; one entry per line box (EZ4 in `e2e/suites/stage/strip.ts`).
export const STRIP_INK: Payload<Glyph[]> = `(() => {
  const unseen = (el) => { for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) === 0) return true; } return false; };
  const root = document.querySelector(".strip"), out = [];
  if (!root) return out;
  const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    const el = n.parentElement;
    if (!n.textContent.trim() || !el || el.closest("option, select, script, style") || unseen(el)) continue;
    const rg = new Range(); rg.selectNodeContents(n);
    const kind = el.closest(".rf-told") ? "told " : el.closest(".tick") ? "scale " : "";
    for (const b of rg.getClientRects()) {
      if (!(b.width > 0)) continue;
      const m = getComputedStyle(el).color.match(/[0-9.]+/g).map(Number);
      out.push({ piece: "strip", t: kind + n.textContent.trim().slice(0, 24), ink: [m[0], m[1], m[2]], row: Math.round(b.top + b.height / 2), x: Math.max(0, Math.floor(b.left)), w: Math.max(1, Math.floor(b.width)), disabled: false });
    }
  }
  return out;
})()`;
