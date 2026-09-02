// The Prospect room's controller (#242, a chart room since #463 part 4/4): resolves the address, pulls the plate through the SHARED render worker as a blob <img> (never inline <svg>: the cross-chart url(#) id rule), and re-engraves in place when the year control asks; the world itself never changes on this page.
import { runJob, usesWorker, initWorker } from "../explorer/worker-client.ts";
import { plateDressFor, type PlateDress } from "../explorer/prospect-job.ts";
import { parseProspectAddress, chartTarget, parseYear, ribbonTarget, yearHash } from "./address.ts";
import { seedForDate } from "../../world/seed-of-the-day.ts";
import { bindProspectRoom, showPlate, writeFolio, writeNote, type RoomFurniture } from "./seats.ts";
import type { WorldRecipe } from "../../world/types.ts";

declare global {
  interface Window {
    __vellumProspectUsesWorker?: typeof usesWorker;
    __vellumProspectState?: () => {
      seed: number;
      index: number;
      year: number;
      presentYear: number;
      name: string;
      dress: PlateDress;
      era: string;
      keyRows: number;
      svgLength: number;
    } | null;
  }
}

const $ = <T extends HTMLElement = HTMLElement>(id: string): T => document.getElementById(id) as T;
const status = $("pp-status");
const warning = $("pp-warning");
const chartLink = $<HTMLAnchorElement>("pp-chart-link");
const ribbonLink = $<HTMLAnchorElement>("pp-ribbon-link");
const ribbonVerb = $("pp-ribbon-verb");
const yearForm = $<HTMLFormElement>("pp-year-form");
const yearInput = $<HTMLInputElement>("pp-year");
const furniture: RoomFurniture = {
  stage: document.querySelector<HTMLElement>(".stage")!,
  sheet: $("sheet"),
  viewport: $("map-viewport"),
  map: $("map"),
  plate: $<HTMLImageElement>("pp-plate"),
  noteTitle: $("note-title"),
  noteWhere: document.querySelector<HTMLElement>("#note .card-where")!,
  noteProse: $("pp-note"),
  keyHead: $("pp-key-head"),
  key: $("pp-key"),
  era: $("pp-era"),
  folioTitle: $("folio-title"),
  folioSub: $("folio-sub"),
  pressed: $("pp-pressed"),
};
const sheet = bindProspectRoom(furniture);

const addr = parseProspectAddress(location.hash);
// A bare visit lands on today's seed-of-the-day (UTC) and its capital, the same default world as every other surface.
const seed = (addr.seed ?? seedForDate(new Date())) >>> 0;
const dress = plateDressFor(addr.style ?? "antique");
const overrides: Partial<WorldRecipe> = {
  ...(addr.type ? { mapType: addr.type } : {}),
  ...(addr.band ? { band: addr.band } : {}),
  ...(addr.land != null ? { landFraction: addr.land } : {}),
  ...(addr.coast != null ? { coastWarp: addr.coast } : {}),
};

let last: ReturnType<NonNullable<Window["__vellumProspectState"]>> = null;
let lastUrl: string | null = null;
let drawGen = 0;
window.__vellumProspectUsesWorker = usesWorker;
window.__vellumProspectState = () => last;

function writeRoads(index: number): void {
  chartLink.href = chartTarget(location.hash);
  ribbonLink.href = ribbonTarget(location.hash, index);
}

function draw(year: number | null, writeAddress: boolean): void {
  const myGen = ++drawGen;
  const t0 = performance.now();
  status.textContent = "The engraver is at the plate…";
  runJob({ kind: "prospect", seed, overrides, index: addr.index, dress, year })
    .then((res) => {
      if (myGen !== drawGen) return;
      if (lastUrl !== null) URL.revokeObjectURL(lastUrl);
      lastUrl = URL.createObjectURL(new Blob([res.svg], { type: "image/svg+xml" }));
      showPlate(furniture, res, seed, lastUrl);
      sheet.rebase();
      if (writeAddress) history.replaceState(null, "", yearHash(location.hash, res.year));
      writeRoads(res.index);
      ribbonVerb.textContent = `Take the road from ${res.name} in`;
      yearInput.value = String(res.year);
      writeFolio(furniture, res, seed, dress, Math.round(performance.now() - t0));
      writeNote(furniture, res);
      status.textContent = "";
      sheet.room.layout();
      last = {
        seed,
        index: res.index,
        year: res.year,
        presentYear: res.presentYear,
        name: res.name,
        dress,
        era: res.era,
        keyRows: res.key.length,
        svgLength: res.svg.length,
      };
    })
    .catch((err: Error) => {
      if (myGen !== drawGen) return;
      status.textContent = "The engraver slipped: " + err.message;
    });
}

yearForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const year = parseYear(yearInput.value);
  if (year === null) {
    yearInput.value = last === null ? "" : String(last.year);
    return;
  }
  if (last !== null && year === last.year) return;
  draw(year, true);
});

chartLink.href = chartTarget(location.hash);
await initWorker();
if (!usesWorker()) warning.hidden = false;
draw(addr.year, false);
