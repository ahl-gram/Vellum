// Seed-of-the-day controller: today's UTC date is the seed, so a purely static page shows a fresh world each day, rendered inline on the main thread. The Daily Hunt is a deterministic click-to-find puzzle over that already-generated world.
import { defaultRecipe, generateWorld } from "../../world/generate.ts";
import { renderMap } from "../../render/map-renderer.ts";
import { capitalBlurb, datelineFor, seedForDate } from "../../world/seed-of-the-day.ts";
import { createRng } from "../../core/rng.ts";
import { createLoreWriter } from "../../society/lore.ts";
import { setupHunt } from "./app-hunt.ts";
import { startArrival } from "../explorer/draw-ceremony.ts";
import { createZoomController } from "../shared/zoom-controller.ts";
import type { ZoomState } from "../shared/zoom-controller.ts";
import { bindRoom } from "../shared/room.ts";
import { bindGlassKeys } from "../shared/glass-keys.ts";
import { cameraFromTransform, transformFromCamera } from "../explorer/camera.ts";

declare global {
  interface Window {
    __vellumZoomTo: (t: ZoomState) => void;
    __vellumZoomState: () => ZoomState;
    __vellumDispatchSvg?: () => string;
  }
}

const $ = <T extends HTMLElement = HTMLElement>(id: string): T => document.getElementById(id) as T;

const now = new Date();
const seed = seedForDate(now);

$("dateline").textContent = datelineFor(now);
// The roads out carry the seed explicitly, so they keep opening THIS page's world even after UTC midnight rolls the bare-visit default to a new day; the legend row takes it.
const ROADS: Record<string, string> = {
  explorer: `../explorer/#seed=${seed}&style=antique&legend=1`,
  "reading-room": `../reading-room/#seed=${seed}`,
};
for (const a of document.querySelectorAll<HTMLAnchorElement>("a[data-road]")) {
  const href = ROADS[a.dataset.road ?? ""];
  if (href !== undefined) a.href = href;
}

// The SAME shared zoom controller as the Explorer, bound to the STABLE #map-viewport (never wiped by the deferred render) with its live transform landing on #map.
// Deliberately NO onSettle: the Hunt is a FIXED world; a semantic redraft would reveal new places and change clue difficulty, so the magnify stays purely geometric.
// The guess-click math is ratio-based against getBoundingClientRect(), and d3-zoom's click-distance handling keeps a drag-pan from registering as a guess.
const zoomController = createZoomController({
  viewportEl: $("map-viewport"),
  targetEl: $("map"),
  scaleExtent: [1, 8],
  glideMs: () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--glide")),
});
zoomController.attach();
// The chart room around the controller; the sheet is fitted once the chart is drawn.
// The FRAMING is held across a refit, never the raw transform (the RoomCamera contract; the Explorer holds cameraNow the same way).
const viewportBox = () => ({ W: $("map-viewport").clientWidth || 1, H: $("map-viewport").clientHeight || 1 });
const room = bindRoom({ frame: $("map"), sheet: $("sheet"), camera: {
  hold: () => { const { W, H } = viewportBox(); return cameraFromTransform(zoomController.getState(), W, H); },
  restore: (cam) => { const { W, H } = viewportBox(); zoomController.refit(transformFromCamera(cam, W, H)); },
} });
bindGlassKeys($("map-viewport"), zoomController);
// Deterministic zoom hooks for the e2e, mirroring the Explorer's.
window.__vellumZoomTo = (t) => zoomController.zoomTo(t);
window.__vellumZoomState = () => zoomController.getState();

function dryIn(el: HTMLElement | null, delay: string): void {
  if (!el) return;
  el.style.setProperty("--dry-delay", delay);
  el.classList.add("drying");
}

// Defer one macrotask so the "Drafting…" status paints before the main thread blocks on the render.
setTimeout(() => {
  try {
    const world = generateWorld(defaultRecipe(seed));
    $("sheet").innerHTML = renderMap(world, { style: "antique", legend: true });
    startArrival($("sheet").querySelector("svg"));

    dryIn($("folio-title"), "120ms");
    $("folio-title").textContent = world.title.title;
    dryIn($("folio-sub"), "260ms");
    $("folio-sub").textContent = world.title.subtitle;
    dryIn($("folio-coords"), "320ms");
    $("folio-coords").textContent = `Chart № ${seed} · ${world.recipe.mapType === "archipelago" ? "an" : "a"} ${world.recipe.mapType}, ${world.recipe.band}`;

    const capital =
      world.settlements.find((s) => s.kind === "capital") ?? world.settlements[0];
    if (capital) {
      const lore = createLoreWriter(world, createRng(seed).fork("seed-of-the-day"));
      dryIn($("folio-note"), "400ms");
      $("folio-note").textContent = capitalBlurb(capital, lore.settlementNote(capital));
    }
    $("status").textContent = "";
    // Fitted only now: the folio's lines are chrome the fit measures, and an empty folio reserves nothing.
    room.layout();
    setupHunt(world, seed);
  } catch (err) {
    $("status").textContent = "The cartographer spilled the ink: " + (err as Error).message;
  }
}, 0);

