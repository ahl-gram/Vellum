// The Prospect room's controller: resolves the address, pulls the plate through the SHARED render worker as a blob <img> (never inline <svg>: the cross-chart url(#) id rule), and re-engraves in place when the year control asks; the world itself never changes on this page.
import { runJob, usesWorker, initWorker } from "../explorer/worker-client.ts";
import { plateDressFor, type PlateDress } from "../explorer/prospect-job.ts";
import { countLine, layOnTable, layPressFace, LAY_ON_PAGE } from "../explorer/chart-drawer.ts";
import { emitTable, parseTable, prospectItemFrom, type TableItem, type TableOverrides } from "../shared/table-address.ts";
import { parseProspectAddress, chartTarget, parseYear, ribbonTarget, tableHash, yearHash } from "./address.ts";
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
      roads: boolean;
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
const layPress = $<HTMLButtonElement>("pp-lay");
const layCount = $("pp-lay-count");
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
// ONE object for the job and for the filed item: two copies of this literal is how the page and the card come to spell one plate two ways, which is what TP2's single builder exists to prevent and what a divergent INPUT to it would defeat.
const overrides: TableOverrides = {
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

// Through the same gate a filing takes, for the reason `restore()` in ../explorer/chart-drawer.ts gives: parseTable does not dedupe, so a shared link carrying one sheet twice would leave this page's tally and cap disagreeing with the Explorer's over the same address.
let table: ReadonlyArray<TableItem> = (parseTable(location.hash) ?? []).reduce<ReadonlyArray<TableItem>>((kept, item) => layOnTable(kept, item).items, []);

/** Built from the DRAWN plate, never the address: `addr.index` may be null and would emit no `i`, colliding with a hand-typed capital, and the year is the one actually pressed. */
function filedItem(): TableItem | null {
  return last === null
    ? null
    : prospectItemFrom({ seed, overrides, style: addr.style ?? "antique", index: last.index, year: last.year });
}

function paintLay(): void {
  const item = filedItem();
  if (!item) {
    layPress.style.display = "none";
    return;
  }
  layPress.style.display = "";
  const trial = layOnTable(table, item);
  const face = layPressFace({ holds: trial.reason === "already", full: trial.reason === "full" }, LAY_ON_PAGE);
  layPress.textContent = face.label;
  layPress.classList.toggle("dim", face.refuses);
  layCount.textContent = countLine(table);
}

layPress.addEventListener("click", () => {
  const item = filedItem();
  if (!item) return;
  // Through layOnTable and never a raw append: emitTable and parseTable both end in slice(0, TABLE_CAP), so an over-cap append would drop the sheet on the way home with nothing said.
  const laid = layOnTable(table, item);
  if (laid.refused) {
    paintLay();
    return;
  }
  table = laid.items;
  history.replaceState(null, "", tableHash(location.hash, emitTable(table)));
  // BOTH roads, not just the way home: each caches an href built from the hash at its last draw, so a road left unrefreshed carries the table as it stood before this filing and silently drops the sheet just laid.
  chartLink.href = chartTarget(location.hash);
  if (last) ribbonLink.href = ribbonTarget(location.hash, last.index);
  paintLay();
});

function writeRoads(res: { readonly index: number; readonly name: string; readonly roads: boolean }): void {
  chartLink.href = chartTarget(location.hash);
  ribbonLink.href = ribbonTarget(location.hash, res.index);
  ribbonVerb.textContent = `Take the road from ${res.name} in`;
  ribbonLink.style.display = res.roads ? "" : "none";
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
      writeRoads(res);
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
        roads: res.roads,
        svgLength: res.svg.length,
      };
      // AFTER `last`, never before it: the press files what `last` names, and painted a beat early it reads the previous plate or none at all.
      paintLay();
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
ribbonLink.style.display = "none";
layPress.style.display = "none";
await initWorker();
if (!usesWorker()) warning.hidden = false;
draw(addr.year, false);
