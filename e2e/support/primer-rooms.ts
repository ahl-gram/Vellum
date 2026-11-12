// Each room the Primer teaches, as its check opens and rests it (Issue #1250): the token its boot sets, and the read that says nothing is in flight; a step whose address opens a route with no entry here fails by name.
import { DEEPEST_K } from "../../src/world/lod.ts";
import { ZOOM_STEP } from "../../src/site/shared/zoom-keys.ts";
import type { Payload } from "../types.ts";
import { MOVING } from "./primer-reads.ts";

export type Rest = { readonly marks: number; readonly frames: number; readonly quiet: boolean; readonly view: string };

export type PrimerRoom = {
  readonly booted: Payload<{ up: boolean }>;
  readonly rest: Payload<Rest>;
  readonly pickFirst: string | null;
  readonly repeatCap: number;
};

// 2026-11-10, Issue #1250: the camera-settle read below is proven on a fast machine only: without it four of the six steps whose address carries a camera lose it where frames come 200 ms apart or closer, as on this Mac every run, and keep it at 300 ms, as on GitHub's runner, where M5 reds nothing (proof run 42781038629).
const EXPLORER_REST: Payload<Rest> = `(() => {
  const w = window.__primer, z = window.__vellumZoomState();
  const quiet = !document.getElementById("verso-turn").disabled && !!document.querySelector("#map > svg") && !window.__vellumCameraSettling() && !document.querySelector("#map .survey-pencil") && ${MOVING} === 0;
  return { marks: w.marks, frames: w.frames, quiet, view: [z.k.toFixed(4), z.x.toFixed(2), z.y.toFixed(2)].join(",") };
})()`;

const restWhen = (quiet: string): Payload<Rest> =>
  `(() => { const w = window.__primer; const quiet = (${quiet}) && ${MOVING} === 0; return { marks: w.marks, frames: w.frames, quiet, view: "" }; })()`;

export const PRIMER_ROOMS: Readonly<Partial<Record<string, PrimerRoom>>> = {
  "/explorer/": {
    booted: `({ up: typeof window.__vellumUsesWorker === "function" && !!document.querySelector("#map svg") })`,
    rest: EXPLORER_REST,
    pickFirst: "#place-options > li .pl-name",
    repeatCap: Math.ceil(Math.log(DEEPEST_K) / Math.log(ZOOM_STEP)),
  },
  "/prospect/": {
    booted: `({ up: typeof window.__vellumProspectUsesWorker === "function" && typeof window.__vellumProspectState === "function" && window.__vellumProspectState() !== null })`,
    rest: restWhen(
      `window.__vellumProspectState() !== null && document.getElementById("pp-status").textContent === ""`,
    ),
    pickFirst: null,
    repeatCap: 0,
  },
  "/reading-room/": {
    booted: `({ up: typeof window.__vellumReadingRoomAges === "function" && !!window.__vellumReadingRoomState().title })`,
    rest: restWhen(
      `!!window.__vellumReadingRoomState().title && !!document.querySelector(".rf-chart svg") && document.querySelector(".rf-status").textContent === "" && !window.__vellumReadingRoomAges().playing`,
    ),
    pickFirst: null,
    repeatCap: 0,
  },
  "/print-room/": {
    booted: `({ up: typeof window.__vellumPrintRoomUsesWorker === "function" && !!window.__vellumPrintRoomState().title })`,
    rest: restWhen(
      `!!window.__vellumPrintRoomState().title && !!document.querySelector("#pr-preview svg") && document.getElementById("pr-status").textContent === ""`,
    ),
    pickFirst: null,
    repeatCap: 0,
  },
};
