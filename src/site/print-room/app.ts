// The Print Room controller: takes a world by URL hash or seed entry and pulls a modest proof through the SHARED render worker; worker-client is inlined into this bundle, so initWorker takes no URL here.
import { runJob, usesWorker, initWorker, type DrawResult } from "../explorer/worker-client.ts";
import { startArrival } from "../explorer/draw-ceremony.ts";
import { seedForDate } from "../../world/seed-of-the-day.ts";
import { clampPosterWidth } from "./poster-presets.ts";
import {
  initBoundAtlas,
  clearBoundAtlas,
  enableBind,
  sheetAspect,
  type PosterBasis,
  type SheetFace,
} from "./bound-atlas.ts";
import {
  bindPrintRoom,
  matterAspect,
  showMatter,
  showPlate,
  showProof,
  writeFolio,
  type RoomFurniture,
} from "./seats.ts";
import { TABLE_KEY, type TableOverrides } from "../shared/table-address.ts";
import { parsePrintRoomAddress } from "./address.ts";
import {
  NO_LAND_KEYS,
  STYLE_NAMES,
  emitLandKeys,
  oneOf,
  overridesOfLand,
  type LandKeys,
} from "../shared/address-grammar.ts";
import { errorText } from "../shared/error-text.ts";
import { clearPosterStatus, initOrderCounter, refreshOrderControls } from "./order-counter.ts";
import type { MapType } from "../../terrain/heightfield.ts";
import type { ClimateBand } from "../../climate/climate.ts";
import type { StyleName } from "../../render/style.ts";
import type { ThemeName } from "../../render/layers/field.ts";
import { $ } from "../shared/by-id.ts";
import { foundAddress, heldFor, pageFounder, writtenParams, type WrittenWorld } from "../shared/written-world.ts";

declare global {
  interface Window {
    __vellumPrintRoomUsesWorker?: typeof usesWorker;
    __vellumPrintRoomState?: () => { seed: number; title: string };
    __vellumClampPosterWidth?: typeof clampPosterWidth;
  }
}

const PREVIEW_WIDTH = 900; // a modest proof; the real outputs are downloads

const seedInput = $<HTMLInputElement>("pr-seed");
const styleSel = $<HTMLSelectElement>("pr-style");
const status = $("pr-status");
const preview = $("pr-preview");
const warning = $("pr-warning");
const road = $<HTMLAnchorElement>("pr-explorer");
const folioRoad = document.getElementById("pr-portfolio") as HTMLAnchorElement | null;
const furniture: RoomFurniture = {
  stage: document.querySelector<HTMLElement>(".stage")!,
  sheet: $("sheet"),
  viewport: $("map-viewport"),
  map: $("map"),
  preview,
  turned: $<HTMLImageElement>("pr-turned"),
  page: $("pr-page"),
  pageInner: $("pr-page-inner"),
  measure: $("pr-page-measure"),
  folioTitle: $("folio-title"),
  folioSub: $("folio-sub"),
  plateLine: $("pr-plate-line"),
};
const sheet = bindPrintRoom(furniture, () => matterAspect(furniture) ?? sheetAspect());

// Recipe params with no visible control here: carried from a deep link and re-serialized on every draw, so the URL stays a shareable Explorer link (a warped world must print warped).
const carried: {
  type: MapType | "";
  band: ClimateBand | "";
  theme: ThemeName | "";
  legend: boolean;
  arms: boolean;
  beasts: boolean;
  keys: LandKeys;
  table: string | null;
} = { type: "", band: "", theme: "", legend: true, arms: false, beasts: false, keys: NO_LAND_KEYS, table: null };

let written: WrittenWorld | null = null;
let drawGen = 0;
// True from a draw's synchronous start until its own settle: pairs with `ordering` so the order surface stays closed for the whole round-trip.
let drawing = false;
let lastSeed = 0;
let lastTitle = "";

// The world of the CURRENT proof, snapshotted on every successful draw so an order reproduces the sheet on screen, not the live controls at click time; null until the first proof lands (the plate buttons start disabled in the HTML).
let posterBasis: PosterBasis | null = null;

function randomSeed(): number {
  return Math.floor(Math.random() * 0xffffffff);
}

function applyHash(): void {
  const a = parsePrintRoomAddress(location.hash);
  if (a.seed !== null) seedInput.value = String(a.seed);
  if (a.style !== null) styleSel.value = a.style;
  if (a.type !== null) carried.type = a.type;
  if (a.band !== null) carried.band = a.band;
  if (a.theme !== null) carried.theme = a.theme;
  if (a.legend !== null) carried.legend = a.legend;
  if (a.arms !== null) carried.arms = a.arms;
  if (a.beasts !== null) carried.beasts = a.beasts;
  carried.keys = a;
  carried.table = a.table;
}

function writeHash(seed: number, style: string): void {
  const p = new URLSearchParams();
  p.set("seed", String(seed));
  p.set("style", style);
  if (carried.type) p.set("type", carried.type);
  if (carried.band) p.set("band", carried.band);
  if (carried.theme) p.set("theme", carried.theme);
  p.set("legend", carried.legend ? "1" : "0");
  p.set("arms", carried.arms ? "1" : "0");
  p.set("beasts", carried.beasts ? "1" : "0");
  emitLandKeys(p, carried.keys);
  if (carried.table !== null) p.set(TABLE_KEY, carried.table);
  const q = writtenParams(p, heldFor(written, seed));
  history.replaceState(null, "", "#" + q.toString());
  road.href = "../explorer/#" + q.toString();
  if (folioRoad) folioRoad.href = "../explorer/portfolio/#" + q.toString();
}

function keepProof(res: DrawResult, seed: number, style: StyleName, overrides: PosterBasis["overrides"]): void {
  // res.svg is engine-rendered markup from the uint32 seed and allowlisted params: no user string reaches the SVG, the same trusted-string injection the Explorer does.
  preview.innerHTML = res.svg;
  showProof(furniture);
  sheet.rebase();
  startArrival(preview.querySelector("svg"));
  written = heldFor(written, seed);
  writeHash(seed, style);
  status.textContent = "";
  writeFolio(furniture, res, seed);
  sheet.room.layout();
  lastSeed = seed;
  lastTitle = res.title;
  // overrides is built fresh per draw and never mutated, so holding the reference is safe.
  posterBasis = {
    seed,
    style,
    overrides,
    legend: carried.legend,
    arms: carried.arms,
    beasts: carried.beasts,
    theme: carried.theme || undefined,
  };
  drawing = false;
  refreshOrderControls(); // the new world is on the desk: re-open the counter (unless an order still holds it)
  enableBind();
}

function draw(): void {
  const seed = Number(seedInput.value) >>> 0;
  const style = oneOf(styleSel.value, STYLE_NAMES) ?? "antique";
  const myGen = ++drawGen;
  drawing = true;
  status.textContent = "Pulling a proof…";
  // A fresh proof supersedes any bound atlas AND any pending poster order; close the whole order surface SYNCHRONOUSLY before the async render, or a plate clicked mid-redraw presses the previous world's poster.
  clearBoundAtlas();
  refreshOrderControls();
  clearPosterStatus(); // a new proof clears any stale poster-order status
  const held = heldFor(written, seed);
  const overrides: TableOverrides =
    held !== null
      ? held.overrides
      : {
          ...(carried.type ? { mapType: carried.type } : {}),
          ...(carried.band ? { band: carried.band } : {}),
          ...overridesOfLand(carried.keys),
        };
  runJob({
    kind: "draw",
    seed,
    overrides,
    render: {
      style,
      widthPx: PREVIEW_WIDTH,
      legend: carried.legend,
      arms: carried.arms,
      beasts: carried.beasts,
      theme: carried.theme || undefined,
    },
  })
    .then((res) => {
      if (myGen !== drawGen) return;
      keepProof(res, seed, style, overrides);
    })
    .catch((err: unknown) => {
      if (myGen !== drawGen) return;
      drawing = false;
      status.textContent = "The press jammed: " + errorText(err);
      // The previous proof is still on the desk and posterBasis still matches it: re-open the order surface, or a worker crash mid-redraw would leave the plates and Bind stuck disabled.
      refreshOrderControls();
      enableBind();
    });
}

$("pr-draw").addEventListener("click", draw);
seedInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") draw();
});
styleSel.addEventListener("change", draw);
$("pr-random").addEventListener("click", () => {
  seedInput.value = String(randomSeed());
  draw();
});
await initWorker();
const face: SheetFace = {
  showProof: () => {
    showProof(furniture);
    sheet.rebase();
    sheet.room.layout();
  },
  showPlate: (plate) => {
    showPlate(furniture, plate);
    sheet.rebase();
    sheet.room.layout();
  },
  showMatter: (matter) => {
    showMatter(furniture, matter);
    sheet.rebase();
    sheet.room.layout();
  },
};
initOrderCounter({ basis: () => posterBasis, drawing: () => drawing, face });
// getBasis reads the LIVE posterBasis at click time, the same snapshot the poster order uses.
initBoundAtlas(() => posterBasis, face);
window.__vellumPrintRoomUsesWorker = usesWorker;
window.__vellumPrintRoomState = () => ({ seed: lastSeed, title: lastTitle });
window.__vellumClampPosterWidth = clampPosterWidth; // e2e: the tab-killing-width guard
if (!usesWorker()) warning.hidden = false; // inline fallback: large plates will pause the tab

written = await foundAddress(location.hash, pageFounder());
applyHash();
if (written !== null) seedInput.value = String(written.seed);
// A bare visit lands on today's seed-of-the-day (UTC), the same default world as the Explorer and the Today page.
if (!seedInput.value) seedInput.value = String(seedForDate(new Date()));
draw();
