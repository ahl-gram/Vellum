// The Explorer's DOM refs, extracted from app.ts at #192: the one getElementById pass
// over the page, shared by the conductor and its wiring. Module scripts are deferred,
// so the DOM is parsed before this resolves. DOM-bound at module scope by design (the
// sea-level.ts / coast-warp.ts precedent), so never import this from a unit test.
export const $ = <T extends HTMLElement = HTMLElement>(id: string): T => document.getElementById(id) as T;
export const seedInput = $<HTMLInputElement>("seed");
export const styleSel = $<HTMLSelectElement>("style");
export const typeSel = $<HTMLSelectElement>("type");
export const bandSel = $<HTMLSelectElement>("band");
export const themeSel = $<HTMLSelectElement>("theme");
export const legendChk = $<HTMLInputElement>("legend");
export const armsChk = $<HTMLInputElement>("arms");
export const landSlider = $<HTMLInputElement>("land");
export const coastSlider = $<HTMLInputElement>("coast");
export const status = $("status");
export const mapDiv = $("map");
export const mapViewport = $("map-viewport"); // #164: the zoom clipping/gesture box wrapping #map
export const sheetEl = $("sheet");
export const innerEl = $("sheet-inner");
export const caption = $("caption");
export const versoEl = $("verso");
export const versoBtn = $<HTMLButtonElement>("verso-turn");
export const agesChk = $<HTMLInputElement>("ages"); // #321: the survey ink toggle (label `survey`; the id stays for the smallest diff)
export const orderLink = $<HTMLAnchorElement>("order-plates"); // #133: "Take to the Print Room", href kept current in draw()
export const journalLine = $("journal-line"); // #321 decision 3: the caption's quiet pointer to the journal
export const journalLink = $<HTMLAnchorElement>("journal-link"); // its href, kept current beside the hash write

// #183: the controls readHash/writeHash (hash-sync.ts) mirror to and from location.hash.
export const hashControls = { seedInput, styleSel, typeSel, bandSel, themeSel, legendChk, armsChk, landSlider, coastSlider };
