// Render worker plumbing. The heavy world-gen + SVG render runs in ./worker.js
// off the main thread so the UI stays responsive. The worker is best-effort: if
// it cannot be constructed (file://, strict CSP, an older browser) we fall back to
// running the same engine inline on the main thread, so the page always works.
// runInline mirrors worker.js exactly (same engine calls, same serializableAtlas)
// so the worker/inline byte-identity check (e2e A2/A3) stays a clean compare.
import { renderMap, type RenderOptions } from "../../render/map-renderer.ts";
import { buildPlaceManifest, type PlaceManifest } from "../../render/place-manifest.ts";
import { buildSurvey, type Survey } from "../../render/survey.ts";
import { generateRegionWorld, regionTitle } from "../../world/region.ts";
import { composeAtlas } from "../../atlas/compose.ts";
import { serializableAtlas } from "./serializable-atlas.ts";
import { worldFor } from "./world-cache.ts";
import type { AtlasDocumentData } from "../../atlas/document.ts";
import type { ClimateBand } from "../../climate/climate.ts";
import type { StyleName } from "../../render/style.ts";
import type { MapType, UvWindow } from "../../terrain/heightfield.ts";
import type { WorldRecipe } from "../../world/types.ts";

// The message contract between this client and ./worker.ts, shared so the two
// sides cannot drift: worker.ts imports these shapes with "import type" (type
// only, so no runtime cycle). The same job/result shapes serve the inline
// fallback, which is what keeps the worker/inline mirror honest at the type level.
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

export type RenderJob = DrawJob | RegionJob | AtlasJob;

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

export type JobResult = DrawResult | RegionResult | AtlasResult;

/** A job crossing the wire: the client staples on the id the response echoes back. */
export type WorkerRequest =
  | (DrawJob & { readonly id: number })
  | (RegionJob & { readonly id: number })
  | (AtlasJob & { readonly id: number });

// What the worker posts back: a result or failure tagged with its job id, or the
// one id-less ready handshake. The optional never-set fields keep the plain
// `d.id == null` and `e.data.ready` guards below narrowing under strict TS.
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
export function runInline(msg: RenderJob): JobResult;
export function runInline(msg: RenderJob): JobResult {
  if (msg.kind === "draw") {
    const { world } = worldFor(msg.seed, msg.overrides);
    return {
      ok: true,
      svg: renderMap(world, msg.render),
      manifest: buildPlaceManifest(world, msg.render.widthPx ?? 1500),
      survey: buildSurvey(world.elev, world.seaLevel, world.roads), // #120, mirrors worker.js
      title: world.title.title,
      subtitle: world.title.subtitle,
      mapType: world.recipe.mapType,
      band: world.recipe.band,
    };
  }
  if (msg.kind === "region") {
    // #168: an EXPLICIT region branch. Without it a region job would fall through to
    // the atlas path below and silently run the wrong engine in the inline fallback.
    const { world, cached } = worldFor(msg.seed, msg.overrides);
    // #169: derive the title from (world, window), mirroring worker.js exactly so the inline
    // fallback stays byte-identical; msg.title (if given) is honored for back-compat.
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
      band: msg.band, // the LOD band index, mirrors worker.js
      title,
      cached,
    };
  }
  const { world } = worldFor(msg.seed, msg.overrides);
  return { ok: true, atlas: serializableAtlas(composeAtlas(world, { width: msg.width, bannerStyle: msg.bannerStyle })) };
}

export function runJob(msg: DrawJob): Promise<DrawResult>;
export function runJob(msg: RegionJob): Promise<RegionResult>;
export function runJob(msg: AtlasJob): Promise<AtlasResult>;
export function runJob(msg: RenderJob): Promise<JobResult>;
export function runJob(msg: RenderJob): Promise<JobResult> {
  if (worker) {
    const id = ++reqId;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      // Non-null assertion: the truthy check above cannot narrow `worker` inside
      // the closure (the executor runs synchronously, so it still holds).
      worker!.postMessage({ ...msg, id });
    });
  }
  // No worker: defer with a macrotask so the status line paints before the main
  // thread blocks on the inline render.
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

// Construct the worker and wait for its ready handshake; resolves null (and falls
// back to inline) on any failure. A crash after handshake nulls `worker` so later
// jobs degrade to inline too.
//
// The spawn is the STATIC import-URL form, verbatim (#208): Vite only detects a
// literal `new Worker(new URL("./worker.ts", import.meta.url), ...)` at build
// time, bundles ./worker.ts (engine imports inlined) into the ONE emitted worker
// chunk (explorer/worker.bundle.js), and rewrites the URL to it. Hoisting the expression into a
// variable or parameter breaks the static analysis: no worker chunk is emitted,
// the URL survives unrewritten, and every page 404s into a silent inline
// fallback. Both spawning pages (the Explorer and the Print Room, whose bundles
// each inline this module) resolve to the SAME emitted worker.
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

/**
 * Connect the worker (best-effort) and record it as the active transport. The
 * spawn target is Vite's: every caller gets the one emitted worker chunk (#208).
 */
export async function initWorker(): Promise<void> {
  worker = await connect();
}
