// Render worker plumbing: the heavy world-gen + SVG render runs in ./worker.ts off the
// main thread. Best-effort: if the worker cannot be constructed we fall back to the same
// engine inline on the main thread, and runInline mirrors ./worker.ts exactly (same
// engine calls, same serializableAtlas) so the worker/inline byte-identity check
// (e2e R2/R3) stays a clean compare.
import { renderMap, type RenderOptions } from "../../render/map-renderer.ts";
import { buildPlaceManifest, type PlaceManifest } from "../../render/place-manifest.ts";
import { buildSurvey, type Survey } from "../../render/survey.ts";
import { generateRegionWorld, regionTitle } from "../../world/region.ts";
import { composeAtlas } from "../../atlas/compose.ts";
import { serializableAtlas } from "./serializable-atlas.ts";
import { prospectResultFor, type PlateDress, type ProspectPlateResult } from "./prospect-job.ts";
import { ribbonResultFor, type RibbonPlateData } from "./ribbon-job.ts";
import { tourOrderFor } from "./tour-job.ts";
import { worldFor } from "./world-cache.ts";
import type { Site } from "../../render/voyage-route.ts";
import type { AtlasDocumentData } from "../../atlas/document.ts";
import type { ClimateBand } from "../../climate/climate.ts";
import type { StyleName } from "../../render/style.ts";
import type { MapType, UvWindow } from "../../terrain/heightfield.ts";
import type { WorldRecipe } from "../../world/types.ts";

// The message contract, shared so the two sides cannot drift (./worker.ts imports these shapes with "import type"); the same job/result shapes serve the inline fallback.
export interface DrawJob {
  readonly kind: "draw";
  readonly seed: number;
  readonly overrides?: Partial<WorldRecipe>;
  readonly render: RenderOptions;
}

export interface RegionJob {
  readonly kind: "region";
  readonly seed: number;
  readonly overrides?: Partial<WorldRecipe>;
  readonly window: UvWindow;
  readonly gridW: number;
  readonly gridH: number;
  /** The LOD band INDEX (0..3) to echo back, not a climate band. */
  readonly band: number;
  readonly render: RenderOptions;
  /** Honored for back-compat when given (#169); the Explorer's client sends none. */
  readonly title?: string;
}

export interface AtlasJob {
  readonly kind: "atlas";
  readonly seed: number;
  readonly overrides?: Partial<WorldRecipe>;
  readonly width?: number;
  readonly bannerStyle?: StyleName;
}

export interface ProspectJob {
  readonly kind: "prospect";
  readonly seed: number;
  readonly overrides?: Partial<WorldRecipe>;
  readonly index: number | null;
  readonly dress: PlateDress;
  readonly year: number | null;
}

export interface RibbonJob {
  readonly kind: "ribbon";
  readonly seed: number;
  readonly overrides?: Partial<WorldRecipe>;
  readonly from: number | null;
  readonly to: number | null;
  readonly dress: PlateDress;
}

/** #373: the #184 travel matrix, off the main thread. Self-contained on purpose (no seed lookup, no world rebuild): the inputs ARE the world facts the router walks, so the two sides cannot compute over different worlds. */
export interface TourJob {
  readonly kind: "tour";
  readonly seed: number;
  readonly sites: ReadonlyArray<Site>;
  readonly survey: Survey;
  readonly ports: ReadonlyArray<number>;
}

export type RenderJob = DrawJob | RegionJob | AtlasJob | ProspectJob | RibbonJob | TourJob;

export interface DrawResult {
  readonly ok: true;
  readonly svg: string;
  readonly manifest: PlaceManifest;
  readonly survey: Survey;
  readonly title: string;
  readonly subtitle: string;
  readonly mapType: MapType;
  readonly band: ClimateBand;
}

export interface RegionResult {
  readonly ok: true;
  readonly svg: string;
  readonly manifest: PlaceManifest;
  readonly window: UvWindow;
  /** The LOD band index the job carried, echoed for the next hysteresis step. */
  readonly band: number;
  readonly title: string;
  readonly cached: boolean;
}

export interface AtlasResult {
  readonly ok: true;
  readonly atlas: AtlasDocumentData;
}

export type ProspectResult = ProspectPlateResult & { readonly ok: true };

export type RibbonResult = RibbonPlateData & { readonly ok: true };

export interface TourResult {
  readonly ok: true;
  readonly order: ReadonlyArray<number>;
}

export type JobResult = DrawResult | RegionResult | AtlasResult | ProspectResult | RibbonResult | TourResult;

/** A job crossing the wire: the client staples on the id the response echoes back. */
export type WorkerRequest =
  | (DrawJob & { readonly id: number })
  | (RegionJob & { readonly id: number })
  | (AtlasJob & { readonly id: number })
  | (ProspectJob & { readonly id: number })
  | (RibbonJob & { readonly id: number })
  | (TourJob & { readonly id: number });

// The optional never-set fields keep the plain `d.id == null` and `e.data.ready` guards below narrowing under strict TS.
export type WorkerResponse =
  | (JobResult & { readonly id: number; readonly ready?: undefined })
  | { readonly id: number; readonly ok: false; readonly error: string; readonly ready?: undefined }
  | { readonly ready: true; readonly id?: undefined };

let worker: Worker | null = null;
let reqId = 0;
type PendingJob = {
  readonly resolve: (result: JobResult) => void;
  readonly reject: (err: Error) => void;
};
const pending = new Map<number, PendingJob>();

function onJobMessage(e: MessageEvent<WorkerResponse>): void {
  const d = e.data;
  if (!d || d.id == null) return; // ignore the ready handshake and stray messages
  const p = pending.get(d.id);
  if (!p) return;
  pending.delete(d.id);
  if (d.ok) p.resolve(d);
  else p.reject(new Error(d.error || "worker error"));
}

export function runInline(msg: DrawJob): DrawResult;
export function runInline(msg: RegionJob): RegionResult;
export function runInline(msg: AtlasJob): AtlasResult;
export function runInline(msg: ProspectJob): ProspectResult;
export function runInline(msg: RibbonJob): RibbonResult;
export function runInline(msg: TourJob): TourResult;
export function runInline(msg: RenderJob): JobResult;
export function runInline(msg: RenderJob): JobResult {
  if (msg.kind === "tour") return { ok: true, order: tourOrderFor(msg) };
  if (msg.kind === "draw") {
    const { world } = worldFor(msg.seed, msg.overrides);
    return {
      ok: true,
      svg: renderMap(world, msg.render),
      manifest: buildPlaceManifest(world, msg.render.widthPx ?? 1500),
      survey: buildSurvey(world.elev, world.seaLevel, world.roads), // #120, mirrors ./worker.ts
      title: world.title.title,
      subtitle: world.title.subtitle,
      mapType: world.recipe.mapType,
      band: world.recipe.band,
    };
  }
  if (msg.kind === "region") {
    // #168: an EXPLICIT region branch; without it a region job would fall through to the atlas path and silently run the wrong engine in the inline fallback.
    const { world, cached } = worldFor(msg.seed, msg.overrides);
    // #169: the title derives from (world, window), mirroring ./worker.ts exactly so the inline fallback stays byte-identical; msg.title (if given) is honored for back-compat.
    const title = msg.title ?? regionTitle(world, msg.window);
    const region = generateRegionWorld(world, {
      window: msg.window,
      gridW: msg.gridW,
      gridH: msg.gridH,
      title,
    });
    const regionRecipe = { window: msg.window, worldGridW: world.recipe.gridW };
    return {
      ok: true,
      svg: renderMap(region, { ...msg.render, regionRecipe }),
      manifest: buildPlaceManifest(region, msg.render.widthPx ?? 1500),
      window: msg.window,
      band: msg.band, // the LOD band index, echoed back
      title,
      cached,
    };
  }
  if (msg.kind === "prospect") {
    const { world } = worldFor(msg.seed, msg.overrides);
    return { ok: true, ...prospectResultFor(world, msg) };
  }
  if (msg.kind === "ribbon") {
    const { world } = worldFor(msg.seed, msg.overrides);
    return { ok: true, ...ribbonResultFor(world, msg) };
  }
  const { world } = worldFor(msg.seed, msg.overrides);
  return { ok: true, atlas: serializableAtlas(composeAtlas(world, { width: msg.width, bannerStyle: msg.bannerStyle })) };
}

export function runJob(msg: DrawJob): Promise<DrawResult>;
export function runJob(msg: RegionJob): Promise<RegionResult>;
export function runJob(msg: AtlasJob): Promise<AtlasResult>;
export function runJob(msg: ProspectJob): Promise<ProspectResult>;
export function runJob(msg: RibbonJob): Promise<RibbonResult>;
export function runJob(msg: TourJob): Promise<TourResult>;
export function runJob(msg: RenderJob): Promise<JobResult>;
export function runJob(msg: RenderJob): Promise<JobResult> {
  if (worker) {
    const id = ++reqId;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      // Non-null assertion: the truthy check cannot narrow `worker` inside the closure (the executor runs synchronously, so it still holds).
      worker!.postMessage({ ...msg, id });
    });
  }
  // No worker: defer a macrotask so the status line paints before the main thread blocks on the inline render.
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try { resolve(runInline(msg)); }
      catch (err) { reject(err); }
    }, 0);
  });
}

/** Whether the off-thread worker is live (false = the inline fallback is in use). */
export function usesWorker(): boolean {
  return worker !== null;
}

// Resolves null on any failure (inline fallback); a crash after handshake nulls the worker so later jobs degrade too.
function connect(): Promise<Worker | null> {
  return new Promise((resolve) => {
    let w: Worker;
    try {
      w = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
    } catch {
      resolve(null);
      return;
    }
    let settled = false;
    const fail = () => {
      if (settled) return;
      settled = true;
      try { w.terminate(); } catch {}
      resolve(null);
    };
    const timer = setTimeout(fail, 4000);
    w.onerror = fail;
    w.onmessage = (e: MessageEvent<WorkerResponse>) => {
      if (settled || !e.data || !e.data.ready) return;
      settled = true;
      clearTimeout(timer);
      w.onmessage = onJobMessage;
      w.onerror = (ev: { preventDefault?: () => void }) => {
        if (ev.preventDefault) ev.preventDefault();
        worker = null; // a crashed worker degrades to the inline path
        for (const [, p] of pending) p.reject(new Error("the render worker crashed"));
        pending.clear();
      };
      resolve(w);
    };
  });
}

/** Connect the worker (best-effort) and record it as the active transport. */
export async function initWorker(): Promise<void> {
  worker = await connect();
}
