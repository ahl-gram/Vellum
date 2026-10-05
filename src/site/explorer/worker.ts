// Render worker: the CPU-heavy world-gen + SVG render off the main thread; worldFor memoizes the last world, and the output stays byte-identical to the inline path.
import { renderMap } from "../../render/map-renderer.ts";
import { buildPlaceManifest } from "../../render/place-manifest.ts";
import { buildSurvey } from "../../render/survey.ts";
import { generateRegionWorld, regionDetailLevel, regionTitle } from "../../world/region.ts";
import { composeAtlas } from "../../atlas/compose.ts";
import { serializableAtlas } from "./serializable-atlas.ts";
import { prospectResultFor } from "./prospect-job.ts";
import { ribbonResultFor } from "./ribbon-job.ts";
import { tourOrderFor } from "./tour-job.ts";
import { worldFor } from "./world-cache.ts";
import { regionChainCache } from "./region-chain-cache.ts";
import type { WorkerRequest, WorkerResponse } from "./worker-client.ts";

// The root tsconfig lib is DOM, so `self` types as Window in that pass (tsconfig.worker.json types it as the worker scope); cast once to the minimal worker-global surface both accept.
const ctx = self as unknown as {
  onmessage: ((e: MessageEvent<WorkerRequest>) => void) | null;
  postMessage(msg: WorkerResponse): void;
};

type Job<K extends WorkerRequest["kind"]> = Extract<WorkerRequest, { kind: K }>;

function answerDraw(msg: Job<"draw">): void {
  const { world } = worldFor(msg.seed, msg.overrides);
  ctx.postMessage({
    id: msg.id,
    ok: true,
    // widthPx reaches renderMap UNCLAMPED by design: callers own that guard (the CLI bounds 400-6000; the Print Room clamps posters to the [2400, 4200] envelope), so a hand-edited width can never ask for a tab-killing render.
    svg: renderMap(world, msg.render),
    manifest: buildPlaceManifest(world, msg.render.widthPx ?? 1500),
    survey: buildSurvey(world.elev, world.seaLevel, world.roads),
    title: world.title.title,
    subtitle: world.title.subtitle,
    mapType: world.recipe.mapType,
    band: world.recipe.band,
  });
}

function answerRegion(msg: Job<"region">): void {
  const { world, cached } = worldFor(msg.seed, msg.overrides);
  const title = msg.title ?? regionTitle(world, msg.window);
  const spec = {
    window: msg.window,
    gridW: msg.gridW,
    gridH: msg.gridH,
    title,
    detail: true,
    chainCache: regionChainCache,
  };
  const region = generateRegionWorld(world, spec);
  const regionRecipe = { window: msg.window, worldGridW: world.recipe.gridW, detail: regionDetailLevel(spec) };
  ctx.postMessage({
    id: msg.id,
    ok: true,
    svg: renderMap(region, { ...msg.render, regionRecipe }),
    manifest: buildPlaceManifest(region, msg.render.widthPx ?? 1500),
    window: msg.window,
    band: msg.band,
    title,
    // The PARENT world's own title, which the region's title does not carry; the same line stands in the inline path so the two stay identical (Issue #169's rule, Issue #521's need).
    worldTitle: world.title.title,
    cached, // whether worldFor skipped generateWorld this call (the cache-timing AC's flag)
  });
}

function answerAtlas(msg: Job<"atlas">): void {
  const { world } = worldFor(msg.seed, msg.overrides);
  ctx.postMessage({
    id: msg.id,
    ok: true,
    atlas: serializableAtlas(composeAtlas(world, { width: msg.width, bannerStyle: msg.bannerStyle })),
  });
}

function answerProspect(msg: Job<"prospect">): void {
  const { world } = worldFor(msg.seed, msg.overrides);
  ctx.postMessage({ id: msg.id, ok: true, ...prospectResultFor(world, msg) });
}

function answerRibbon(msg: Job<"ribbon">): void {
  const { world } = worldFor(msg.seed, msg.overrides);
  ctx.postMessage({ id: msg.id, ok: true, ...ribbonResultFor(world, msg) });
}

function answerTour(msg: Job<"tour">): void {
  ctx.postMessage({ id: msg.id, ok: true, order: tourOrderFor(msg) });
}

ctx.onmessage = (e) => {
  const msg = e.data;
  try {
    switch (msg.kind) {
      case "draw": {
        answerDraw(msg);
        break;
      }
      case "region": {
        answerRegion(msg);
        break;
      }
      case "atlas": {
        answerAtlas(msg);
        break;
      }
      case "prospect": {
        answerProspect(msg);
        break;
      }
      case "ribbon": {
        answerRibbon(msg);
        break;
      }
      case "tour": {
        answerTour(msg);
        break;
      }
    }
  } catch (err) {
    ctx.postMessage({ id: msg.id, ok: false, error: ((err as { message?: string } | null) && (err as { message?: string }).message) || String(err) });
  }
};

// Handshake: the static imports resolved before the module body ran, so the engine is loaded.
ctx.postMessage({ ready: true });
