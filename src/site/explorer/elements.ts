// The Explorer's one getElementById pass (#192), shared by the conductor and its wiring.
// Module scripts are deferred, so the DOM is parsed before this resolves; DOM-bound at module scope by design, so never import this from a unit test.
export const $ = <T extends HTMLElement = HTMLElement>(id: string): T => document.getElementById(id) as T;
export const seedInput = $<HTMLInputElement>("seed");
export const styleSel = $<HTMLSelectElement>("style");
export const typeSel = $<HTMLSelectElement>("type");
export const bandSel = $<HTMLSelectElement>("band");
export const themeSel = $<HTMLSelectElement>("theme");
export const legendChk = $<HTMLInputElement>("legend");
export const armsChk = $<HTMLInputElement>("arms");
export const beastsChk = $<HTMLInputElement>("beasts");
export const landSlider = $<HTMLInputElement>("land");
export const coastSlider = $<HTMLInputElement>("coast");
export const status = $("status");
export const mapDiv = $("map");
export const mapViewport = $("map-viewport"); // #164: the zoom clipping/gesture box wrapping #map
export const sheetEl = $("sheet");
export const innerEl = $("sheet-inner");
export const caption = $("caption");
export const chartDrawer = $("chart-drawer");
export const chartDrawerTab = $<HTMLButtonElement>("chart-drawer-tab");
export const chartDrawerShut = $<HTMLButtonElement>("chart-drawer-shut");
export const chartDrawerCount = $("chart-drawer-count");
export const chartDrawerFull = $("chart-drawer-full");
export const cuttings = $("cuttings");
export const tableRoad = $<HTMLButtonElement>("table-road");
export const tableLeaf = $("table-leaf");
export const broadsideSlip = $("broadside");
export const legendDock = $("legend-dock");
export const tableRoadBand = $("table-road-band");
export const leafBroadsideTab = $<HTMLButtonElement>("leaf-broadside");
export const leafTableTab = $<HTMLButtonElement>("leaf-table");
export const folioTitle = $("folio-title");
export const folioSub = $("folio-sub");
export const stageEl = document.querySelector<HTMLElement>(".stage") as HTMLElement;
export const versoEl = $("verso");
export const versoBtn = $<HTMLButtonElement>("verso-turn");
export const agesChk = $<HTMLInputElement>("ages"); // #321: the survey ink toggle (label `survey`; the id stays for the smallest diff)
export const orderLink = $<HTMLAnchorElement>("order-plates"); // #133: "Take to the Print Room", href kept current in draw()
export const journalLink = $<HTMLAnchorElement>("journal-link"); // #270 ruling 2: the always-visible journal button; href kept current beside the hash write

// #183: the controls readHash/writeHash (hash-sync.ts) mirror to and from location.hash.
export const hashControls = { seedInput, styleSel, typeSel, bandSel, themeSel, legendChk, armsChk, beastsChk, landSlider, coastSlider };
