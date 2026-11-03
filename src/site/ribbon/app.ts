// The Wayfarer's Ribbon room's controller: resolves the address, pulls the scroll through the SHARED render worker as a blob <img> (never inline <svg>: the cross-chart url(#) id rule), and redraws in place when the traveller picks a new journey; the world itself never changes on this page.
import { runJob, usesWorker, initWorker } from "../explorer/worker-client.ts";
import { errorText } from "../shared/error-text.ts";
import { plateDressFor } from "../../prospect/dress/context.ts";
import type { PlateDress } from "../explorer/prospect-job.ts";
import { parseRibbonAddress, chartTarget, journeyHash, prospectTarget, rowProspectTarget } from "./address.ts";
import { fallbackNote } from "./fallback-note.ts";
import { bindInk } from "./ink.ts";
import { overridesOfLand } from "../shared/address-grammar.ts";
import { seedForDate } from "../../world/seed-of-the-day.ts";
import { bindRibbonRoom, markLeaned, showPlate, writeFolio, writeItinerary, type RoomFurniture } from "./seats.ts";
import type { RibbonResult } from "../explorer/worker-client.ts";
import type { WorldRecipe } from "../../world/types.ts";
import { $ } from "../shared/by-id.ts";
import { nextObjectUrl } from "../shared/object-url.ts";
import { foundAddress, pageFounder, writtenParams } from "../shared/written-world.ts";

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
  slipTitle: $("itinerary-title"),
  slipWhere: document.querySelector<HTMLElement>("#itinerary .card-where")!,
  fallback: $("rb-fallback"),
  itinerary: $("rb-itinerary"),
  folioTitle: $("folio-title"),
  folioSub: $("folio-sub"),
  unrolled: $("rb-unrolled"),
};
const sheet = bindRibbonRoom(furniture);
const ink = bindInk({ plate: furniture.plate, ground: furniture.map, stage: furniture.stage });

const addr = parseRibbonAddress(location.hash);
const written = await foundAddress(location.hash, pageFounder());
if (written !== null)
  history.replaceState(null, "", "#" + writtenParams(new URLSearchParams(location.hash.slice(1)), written).toString());
// A bare visit lands on today's seed-of-the-day (UTC), the same default world as every other surface.
const seed = (written?.seed ?? addr.seed ?? seedForDate(new Date())) >>> 0;
const dress = plateDressFor(addr.style ?? "antique");
const overrides: Partial<WorldRecipe> =
  written !== null
    ? written.overrides
    : {
        ...(addr.type ? { mapType: addr.type } : {}),
        ...(addr.band ? { band: addr.band } : {}),
        ...overridesOfLand(addr),
      };

chartLink.href = chartTarget(location.hash);
// display, since the kit's .legend-btn display makes the hidden attribute inert.
prospectLink.style.display = "none";

let last: ReturnType<NonNullable<Window["__vellumRibbonState"]>> = null;
let lastUrl: string | null = null;
let drawGen = 0;
window.__vellumRibbonUsesWorker = usesWorker;
window.__vellumRibbonState = () => last;

function fillSelect(sel: HTMLSelectElement, res: RibbonResult, end: "from" | "to"): void {
  sel.replaceChildren(
    ...res.options
      .filter((o) => (end === "to" ? o.i === res.toIdx || res.reachable.includes(o.i) : o.roads))
      .map((o) => {
        const opt = document.createElement("option");
        opt.value = String(o.i);
        opt.textContent = o.name;
        return opt;
      }),
  );
}

function writeJourney(res: RibbonResult): void {
  fillSelect(fromSel, res, "from");
  fillSelect(toSel, res, "to");
  fromSel.value = String(res.fromIdx);
  toSel.value = String(res.toIdx);
  history.replaceState(null, "", journeyHash(location.hash, res.fromIdx, res.toIdx));
  chartLink.href = chartTarget(location.hash);
  prospectLink.href = prospectTarget(location.hash, res.toIdx);
  prospectVerb.textContent = `See ${res.toName} in`;
  prospectLink.style.display = "";
}

function draw(from: number | null, to: number | null, ceremony: boolean): void {
  const myGen = ++drawGen;
  const t0 = performance.now();
  if (ceremony) ink.hold();
  else ink.retire();
  status.textContent = "The surveyor unrolls the scroll…";
  runJob({ kind: "ribbon", seed, overrides, from, to, dress })
    .then((res) => {
      if (myGen !== drawGen) return;
      lastUrl = nextObjectUrl(lastUrl, new Blob([res.svg], { type: "image/svg+xml" }));
      showPlate(furniture, res, seed, lastUrl);
      if (ceremony) ink.begin(res.strips, res.paper);
      sheet.rebase();
      writeJourney(res);
      writeFolio(furniture, res, seed, dress, Math.round(performance.now() - t0));
      writeItinerary(
        furniture,
        res,
        fallbackNote({ from, to }, res),
        (row) => rowProspectTarget(location.hash, row),
        (row, li) => {
          ink.retire();
          sheet.lean(row.nx, row.ny);
          markLeaned(furniture, li);
        },
      );
      status.textContent = "";
      sheet.room.layout();
      last = {
        seed,
        from: res.fromIdx,
        to: res.toIdx,
        leagues: res.leagues,
        dress,
        rows: res.events.length,
        svgLength: res.svg.length,
      };
    })
    .catch((err: unknown) => {
      if (myGen !== drawGen) return;
      ink.retire();
      status.textContent = "The surveyor turned back: " + errorText(err);
    });
}

fromSel.addEventListener("change", () => draw(Number(fromSel.value), null, false));
toSel.addEventListener("change", () => draw(Number(fromSel.value), Number(toSel.value), false));
swap.addEventListener("click", () => {
  if (last === null) return;
  draw(last.to, last.from, true);
});

await initWorker();
if (!usesWorker()) warning.hidden = false;
draw(addr.from, addr.to, true);
