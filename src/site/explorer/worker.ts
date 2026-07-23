// Render worker: runs the CPU-heavy world generation + SVG rendering off the
// main thread so the Explorer stays responsive. Memoized but deterministic — the
// base world for a (seed, overrides) is resolved through worldFor (world-cache.js),
// a single-entry cache, so a pan/zoom that re-surveys the SAME world (the Surveyor's
// Glass, #168) skips regenerating it. Every job still carries its own seed +
// overrides and the output is byte-identical to running the same engine on the main
// thread (the cache changes nothing but the time to produce identical bytes).
import { renderMap } from "../../render/map-renderer.ts";
import { buildPlaceManifest } from "../../render/place-manifest.ts";
import { buildSurvey } from "../../render/survey.ts";
import { generateRegionWorld, regionTitle } from "../../world/region.ts";
import { composeAtlas } from "../../atlas/compose.ts";
import { serializableAtlas } from "./serializable-atlas.ts";
import { worldFor } from "./world-cache.ts";
import type { WorkerRequest, WorkerResponse } from "./worker-client.ts";

// This module runs inside a Worker, but the project tsconfig lib is DOM (no
// WebWorker lib), so `self` types as Window here. Cast once to the minimal
// worker-global surface this module uses; the message shapes are the shared
// wire contract in worker-client.ts (imported type-only, so no runtime cycle).
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
        // msg.render.widthPx is passed to renderMap UNCLAMPED by design: the CLI bounded
        // it 400-6000 (src/cli/main.ts), and callers here own that guard instead. The
        // Explorer draws at fixed widths; the Print Room's poster plates (#134) clamp
        // page-side to the [2400, 4200] envelope in src/site/print-room/poster-presets.ts
        // before ordering, so a hand-edited width can never ask for a tab-killing render.
        svg: renderMap(world, msg.render),
        manifest: buildPlaceManifest(world, msg.render.widthPx ?? 1500),
        // #120: the world facts the client's voyage router walks (land mask + roads,
        // grid space). Shipped on EVERY draw, because the voyage toggle enters voyage
        // mode with no redraw, so the client must already hold them when the box is
        // ticked. Mirrored in worker-client.js runInline; e2e A2 proves the two agree.
        survey: buildSurvey(world.elev, world.seaLevel, world.roads),
        title: world.title.title,
        subtitle: world.title.subtitle,
        mapType: world.recipe.mapType,
        band: world.recipe.band,
      });
    } else if (msg.kind === "region") {
      // #168 The finer survey: the client supplies a quantized window + band; the
      // worker stays a dumb executor that crops the cached base world at a finer grid.
      const { world, cached } = worldFor(msg.seed, msg.overrides);
      // #169: the title is derived from (world, window) so the live redraft and a downloaded
      // sheet's redraw agree byte-for-byte (the stamp carries no title). msg.title, if given,
      // is honored for back-compat (Z15/Z16 pass one); the Explorer's client sends none.
      const title = msg.title ?? regionTitle(world, msg.window);
      const region = generateRegionWorld(world, {
        window: msg.window,
        gridW: msg.gridW,
        gridH: msg.gridH,
        title,
      });
      // Stamp the window so a downloaded region redraws from seed + window (#168);
      // worldGridW is the PARENT grid, taken explicitly (not the 320 coincidence).
      const regionRecipe = { window: msg.window, worldGridW: world.recipe.gridW };
      ctx.postMessage({
        id: msg.id,
        ok: true,
        svg: renderMap(region, { ...msg.render, regionRecipe }),
        manifest: buildPlaceManifest(region, msg.render.widthPx ?? 1500),
        window: msg.window,
        // NB: `band` here is the LOD band INDEX (0..3), echoed for the client's next
        // hysteresis step -- NOT the climate band a draw returns. Same key, different
        // meaning across kinds.
        band: msg.band,
        // #169: the derived title, so the client can caption the survey without re-deriving it.
        title,
        // whether worldFor skipped generateWorld this call (the cache-timing AC's flag)
        cached,
      });
    } else if (msg.kind === "atlas") {
      const { world } = worldFor(msg.seed, msg.overrides);
      ctx.postMessage({
        id: msg.id,
        ok: true,
        atlas: serializableAtlas(composeAtlas(world, { width: msg.width, bannerStyle: msg.bannerStyle })),
      });
    }
  } catch (err) {
    ctx.postMessage({ id: msg.id, ok: false, error: ((err as { message?: string } | null) && (err as { message?: string }).message) || String(err) });
  }
};

// Handshake: the static imports above have resolved by the time the module body
// runs, so this tells the main thread the engine loaded and the worker is ready.
ctx.postMessage({ ready: true });
