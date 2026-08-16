// Render worker: the CPU-heavy world-gen + SVG render, off the main thread. Memoized but
// deterministic: worldFor (world-cache.ts) is a single-entry cache so a re-survey of the
// SAME world skips regenerating it, and the output stays byte-identical to the inline path.
import { renderMap } from "../../render/map-renderer.ts";
import { buildPlaceManifest } from "../../render/place-manifest.ts";
import { buildSurvey } from "../../render/survey.ts";
import { generateRegionWorld, regionTitle } from "../../world/region.ts";
import { composeAtlas } from "../../atlas/compose.ts";
import { serializableAtlas } from "./serializable-atlas.ts";
import { prospectResultFor } from "./prospect-job.ts";
import { worldFor } from "./world-cache.ts";
import type { WorkerRequest, WorkerResponse } from "./worker-client.ts";

// The project tsconfig lib is DOM (no WebWorker lib), so `self` types as Window here; cast once to the minimal worker-global surface. The message shapes are the shared wire contract in worker-client.ts (imported type-only, so no runtime cycle).
const ctx = self as unknown as {
  onmessage: ((e: MessageEvent<WorkerRequest>) => void) | null;
  postMessage(msg: WorkerResponse): void;
};

ctx.onmessage = (e) => {
  const msg = e.data;
  try {
    if (msg.kind === "draw") {
      const { world } = worldFor(msg.seed, msg.overrides);
      ctx.postMessage({
        id: msg.id,
        ok: true,
        // widthPx reaches renderMap UNCLAMPED by design: callers own that guard (the CLI bounds 400-6000; the Print Room clamps posters to the [2400, 4200] envelope), so a hand-edited width can never ask for a tab-killing render.
        svg: renderMap(world, msg.render),
        manifest: buildPlaceManifest(world, msg.render.widthPx ?? 1500),
        // #120: the world facts the voyage router walks, shipped on EVERY draw because the voyage toggle arms with no redraw; mirrored in worker-client.ts runInline (e2e A2 proves the two agree).
        survey: buildSurvey(world.elev, world.seaLevel, world.roads),
        title: world.title.title,
        subtitle: world.title.subtitle,
        mapType: world.recipe.mapType,
        band: world.recipe.band,
      });
    } else if (msg.kind === "region") {
      // #168: the client supplies a quantized window + band; the worker stays a dumb executor that crops the cached base world at a finer grid.
      const { world, cached } = worldFor(msg.seed, msg.overrides);
      // #169: the title derives from (world, window) so the live redraft and a downloaded sheet's redraw agree byte-for-byte; msg.title, if given, is honored for back-compat (Z15/Z16 pass one).
      const title = msg.title ?? regionTitle(world, msg.window);
      const region = generateRegionWorld(world, {
        window: msg.window,
        gridW: msg.gridW,
        gridH: msg.gridH,
        title,
      });
      // Stamp the window so a downloaded region redraws from seed + window (#168); worldGridW is the PARENT grid, taken explicitly (not the 320 coincidence).
      const regionRecipe = { window: msg.window, worldGridW: world.recipe.gridW };
      ctx.postMessage({
        id: msg.id,
        ok: true,
        svg: renderMap(region, { ...msg.render, regionRecipe }),
        manifest: buildPlaceManifest(region, msg.render.widthPx ?? 1500),
        window: msg.window,
        // NB: the LOD band INDEX (0..3), echoed for the client's next hysteresis step, NOT the climate band a draw returns. Same key, different meaning across kinds.
        band: msg.band,
        title,
        cached, // whether worldFor skipped generateWorld this call (the cache-timing AC's flag)
      });
    } else if (msg.kind === "atlas") {
      const { world } = worldFor(msg.seed, msg.overrides);
      ctx.postMessage({
        id: msg.id,
        ok: true,
        atlas: serializableAtlas(composeAtlas(world, { width: msg.width, bannerStyle: msg.bannerStyle })),
      });
    } else if (msg.kind === "prospect") {
      const { world } = worldFor(msg.seed, msg.overrides);
      ctx.postMessage({ id: msg.id, ok: true, ...prospectResultFor(world, msg) });
    }
  } catch (err) {
    ctx.postMessage({ id: msg.id, ok: false, error: ((err as { message?: string } | null) && (err as { message?: string }).message) || String(err) });
  }
};

// Handshake: the static imports above resolved by the time the module body runs, so the engine loaded and the worker is ready.
ctx.postMessage({ ready: true });
