// The Prospect page controller (#242): resolves the address, pulls the plate through the SHARED render worker, and binds it as a blob <img> (never inline <svg>: the cross-chart url(#) id rule). Drawn ONCE per visit, the room's precedent.
import { runJob, usesWorker, initWorker } from "../explorer/worker-client.ts";
import { plateDressFor, type PlateDress } from "../explorer/prospect-job.ts";
import { parseProspectAddress, chartTarget } from "./address.ts";
import { seedForDate } from "../../world/seed-of-the-day.ts";
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
      svgLength: number;
    } | null;
  }
}

const $ = <T extends HTMLElement = HTMLElement>(id: string): T => document.getElementById(id) as T;
const status = $("pp-status");
const plate = $<HTMLImageElement>("pp-plate");
const caption = $("pp-caption");
const chartLink = $<HTMLAnchorElement>("pp-chart-link");
const warning = $("pp-warning");

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

chartLink.href = chartTarget(location.hash);

let last: ReturnType<NonNullable<Window["__vellumProspectState"]>> = null;
window.__vellumProspectUsesWorker = usesWorker;
window.__vellumProspectState = () => last;

status.textContent = "The engraver is at the plate…";
await initWorker();
if (!usesWorker()) warning.hidden = false;
runJob({ kind: "prospect", seed, overrides, index: addr.index, dress, year: addr.year })
  .then((res) => {
    plate.src = URL.createObjectURL(new Blob([res.svg], { type: "image/svg+xml" }));
    plate.alt = `The prospect of ${res.name}, chart ${seed}`;
    plate.hidden = false;
    const viewed = res.year !== res.presentYear ? ` · viewed in the year ${res.year}` : "";
    const former = res.formerName ? ` · once called ${res.formerName}` : "";
    caption.textContent = `The Prospect of ${res.name}${former} · ${res.title} · seed ${seed}${viewed}`;
    status.textContent = "";
    last = {
      seed,
      index: res.index,
      year: res.year,
      presentYear: res.presentYear,
      name: res.name,
      dress,
      svgLength: res.svg.length,
    };
  })
  .catch((err: Error) => {
    status.textContent = "The engraver slipped: " + err.message;
  });
