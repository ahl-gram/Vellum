// The Wayfarer's Ribbon page controller: resolves the address, pulls the plate through
// the SHARED render worker, and binds it as a blob <img> (never inline <svg>: the
// cross-chart url(#) id rule). Unlike the prospect it redraws in place when the
// traveller picks a new journey; the world itself never changes on this page.
import { runJob, usesWorker, initWorker } from "../explorer/worker-client.ts";
import { plateDressFor, type PlateDress } from "../explorer/prospect-job.ts";
import { parseRibbonAddress, chartTarget, journeyHash } from "./address.ts";
import { seedForDate } from "../../world/seed-of-the-day.ts";
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
      svgLength: number;
    } | null;
  }
}

const $ = <T extends HTMLElement = HTMLElement>(id: string): T => document.getElementById(id) as T;
const status = $("rb-status");
const plate = $<HTMLImageElement>("rb-plate");
const caption = $("rb-caption");
const chartLink = $<HTMLAnchorElement>("rb-chart-link");
const warning = $("rb-warning");
const fromSel = $<HTMLSelectElement>("rb-from");
const toSel = $<HTMLSelectElement>("rb-to");
const swap = $<HTMLButtonElement>("rb-swap");

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
  status.textContent = "The surveyor unrolls the scroll…";
  runJob({ kind: "ribbon", seed, overrides, from, to, dress })
    .then((res) => {
      if (lastUrl !== null) URL.revokeObjectURL(lastUrl);
      lastUrl = URL.createObjectURL(new Blob([res.svg], { type: "image/svg+xml" }));
      plate.src = lastUrl;
      plate.alt = `The road from ${res.fromName} to ${res.toName}, chart ${seed}`;
      plate.hidden = false;
      caption.textContent =
        `The road from ${res.fromName} to ${res.toName} · ${Math.round(res.leagues)} leagues · ` +
        `${res.title} · seed ${seed}`;
      status.textContent = "";
      fillSelect(fromSel, res, false);
      fillSelect(toSel, res, true);
      fromSel.value = String(res.fromIdx);
      toSel.value = String(res.toIdx);
      history.replaceState(null, "", journeyHash(location.hash, res.fromIdx, res.toIdx));
      chartLink.href = chartTarget(location.hash);
      last = { seed, from: res.fromIdx, to: res.toIdx, leagues: res.leagues, dress, svgLength: res.svg.length };
    })
    .catch((err: Error) => {
      status.textContent = "The surveyor turned back: " + err.message;
    });
}

fromSel.addEventListener("change", () => draw(Number(fromSel.value), null));
toSel.addEventListener("change", () => draw(Number(fromSel.value), Number(toSel.value)));
swap.addEventListener("click", () => {
  if (last === null) return;
  draw(last.to, last.from);
});

status.textContent = "The surveyor unrolls the scroll…";
await initWorker();
if (!usesWorker()) warning.hidden = false;
draw(addr.from, addr.to);
