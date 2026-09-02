// The Wayfarer's Ribbon room's controller (a chart room since #463 part 4/4): resolves the address, pulls the scroll through the SHARED render worker as a blob <img> (never inline <svg>: the cross-chart url(#) id rule), and redraws in place when the traveller picks a new journey; the world itself never changes on this page.
import { runJob, usesWorker, initWorker } from "../explorer/worker-client.ts";
import { plateDressFor, type PlateDress } from "../explorer/prospect-job.ts";
import { parseRibbonAddress, chartTarget, journeyHash, prospectTarget } from "./address.ts";
import { seedForDate } from "../../world/seed-of-the-day.ts";
import { bindRibbonRoom, markLeaned, showPlate, writeFolio, writeItinerary, type RoomFurniture } from "./seats.ts";
import type { RibbonResult } from "../explorer/worker-client.ts";
import type { WorldRecipe } from "../../world/types.ts";

declare global {
  interface Window {
    __vellumRibbonUsesWorker?: typeof usesWorker;
    __vellumRibbonState?: () => {
      seed: number;
      from: number;
      to: number;
      leagues: number;
      dress: PlateDress;
      rows: number;
      svgLength: number;
    } | null;
  }
}

const $ = <T extends HTMLElement = HTMLElement>(id: string): T => document.getElementById(id) as T;
const status = $("rb-status");
const warning = $("rb-warning");
const chartLink = $<HTMLAnchorElement>("rb-chart-link");
const prospectLink = $<HTMLAnchorElement>("rb-prospect-link");
const prospectVerb = $("rb-prospect-verb");
const fromSel = $<HTMLSelectElement>("rb-from");
const toSel = $<HTMLSelectElement>("rb-to");
const swap = $<HTMLButtonElement>("rb-swap");
const furniture: RoomFurniture = {
  stage: document.querySelector<HTMLElement>(".stage")!,
  sheet: $("sheet"),
  viewport: $("map-viewport"),
  map: $("map"),
  plate: $<HTMLImageElement>("rb-plate"),
  corner: document.querySelector<HTMLElement>(".folio-controls")!,
  journey: $("rb-journey"),
  journeyDock: document.querySelector<HTMLElement>(".journey-dock")!,
  swap,
  slipTitle: $("itinerary-title"),
  slipWhere: document.querySelector<HTMLElement>("#itinerary .card-where")!,
  itinerary: $("rb-itinerary"),
  folioTitle: $("folio-title"),
  folioSub: $("folio-sub"),
  unrolled: $("rb-unrolled"),
};
const sheet = bindRibbonRoom(furniture);

const addr = parseRibbonAddress(location.hash);
// A bare visit lands on today's seed-of-the-day (UTC), the same default world as every other surface.
const seed = (addr.seed ?? seedForDate(new Date())) >>> 0;
const dress = plateDressFor(addr.style ?? "antique");
const overrides: Partial<WorldRecipe> = {
  ...(addr.type ? { mapType: addr.type } : {}),
  ...(addr.band ? { band: addr.band } : {}),
  ...(addr.land != null ? { landFraction: addr.land } : {}),
  ...(addr.coast != null ? { coastWarp: addr.coast } : {}),
};

chartLink.href = chartTarget(location.hash);

let last: ReturnType<NonNullable<Window["__vellumRibbonState"]>> = null;
let lastUrl: string | null = null;
let drawGen = 0;
window.__vellumRibbonUsesWorker = usesWorker;
window.__vellumRibbonState = () => last;

function fillSelect(sel: HTMLSelectElement, res: RibbonResult, toOnly: boolean): void {
  sel.replaceChildren(
    ...res.options
      .filter((o) => (toOnly ? o.i === res.toIdx || res.reachable.includes(o.i) : true))
      .map((o) => {
        const opt = document.createElement("option");
        opt.value = String(o.i);
        opt.textContent = o.name;
        return opt;
      }),
  );
}

function draw(from: number | null, to: number | null): void {
  const myGen = ++drawGen;
  const t0 = performance.now();
  status.textContent = "The surveyor unrolls the scroll…";
  runJob({ kind: "ribbon", seed, overrides, from, to, dress })
    .then((res) => {
      if (myGen !== drawGen) return;
      if (lastUrl !== null) URL.revokeObjectURL(lastUrl);
      lastUrl = URL.createObjectURL(new Blob([res.svg], { type: "image/svg+xml" }));
      showPlate(furniture, res, seed, lastUrl);
      sheet.rebase();
      fillSelect(fromSel, res, false);
      fillSelect(toSel, res, true);
      fromSel.value = String(res.fromIdx);
      toSel.value = String(res.toIdx);
      history.replaceState(null, "", journeyHash(location.hash, res.fromIdx, res.toIdx));
      chartLink.href = chartTarget(location.hash);
      prospectLink.href = prospectTarget(location.hash, res.toIdx);
      prospectVerb.textContent = `See ${res.toName} in`;
      writeFolio(furniture, res, seed, dress, Math.round(performance.now() - t0));
      writeItinerary(furniture, res, (row, li) => { sheet.lean(row.nx, row.ny); markLeaned(furniture, li); });
      status.textContent = "";
      sheet.room.layout();
      last = { seed, from: res.fromIdx, to: res.toIdx, leagues: res.leagues, dress, rows: res.events.length, svgLength: res.svg.length };
    })
    .catch((err: Error) => {
      if (myGen !== drawGen) return;
      status.textContent = "The surveyor turned back: " + err.message;
    });
}

fromSel.addEventListener("change", () => draw(Number(fromSel.value), null));
toSel.addEventListener("change", () => draw(Number(fromSel.value), Number(toSel.value)));
swap.addEventListener("click", () => {
  if (last === null) return;
  draw(last.to, last.from);
});

await initWorker();
if (!usesWorker()) warning.hidden = false;
draw(addr.from, addr.to);
