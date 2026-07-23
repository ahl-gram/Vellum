// Render worker plumbing. The heavy world-gen + SVG render runs in ./worker.js
// off the main thread so the UI stays responsive. The worker is best-effort: if
// it cannot be constructed (file://, strict CSP, an older browser) we fall back to
// running the same engine inline on the main thread, so the page always works.
// runInline mirrors worker.js exactly (same engine calls, same serializableAtlas)
// so the worker/inline byte-identity check (e2e A2/A3) stays a clean compare.
import { renderMap } from "./engine/render/map-renderer.js";
import { buildPlaceManifest } from "./engine/render/place-manifest.js";
import { buildSurvey } from "./engine/render/survey.js";
import { generateRegionWorld, regionTitle } from "./engine/world/region.js";
import { composeAtlas } from "./engine/atlas/compose.js";
import { serializableAtlas } from "./serializable-atlas.js";
import { worldFor } from "./world-cache.js";

let worker = null;
let reqId = 0;
const pending = new Map();

function onJobMessage(e) {
  const d = e.data;
  if (!d || d.id == null) return; // ignore the ready handshake and stray messages
  const p = pending.get(d.id);
  if (!p) return;
  pending.delete(d.id);
  if (d.ok) p.resolve(d);
  else p.reject(new Error(d.error || "worker error"));
}

export function runInline(msg) {
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

export function runJob(msg) {
  if (worker) {
    const id = ++reqId;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      worker.postMessage({ ...msg, id });
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
export function usesWorker() {
  return worker !== null;
}

// Construct the worker and wait for its ready handshake; resolves null (and falls
// back to inline) on any failure. A crash after handshake nulls `worker` so later
// jobs degrade to inline too.
//
// The spawn is the STATIC import-URL form, verbatim (#208): Vite only detects a
// literal `new Worker(new URL("./worker.js", import.meta.url), ...)` at build
// time, bundles ./worker.js (engine imports inlined) into the ONE emitted worker
// chunk (explorer/worker.bundle.js), and rewrites the URL to it. Hoisting the expression into a
// variable or parameter breaks the static analysis: no worker chunk is emitted,
// the URL survives unrewritten, and every page 404s into a silent inline
// fallback. Both spawning pages (the Explorer and the Print Room, whose bundles
// each inline this module) resolve to the SAME emitted worker.
function connect() {
  return new Promise((resolve) => {
    let w;
    try {
      w = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });
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
    w.onmessage = (e) => {
      if (settled || !e.data || !e.data.ready) return;
      settled = true;
      clearTimeout(timer);
      w.onmessage = onJobMessage;
      w.onerror = (ev) => {
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
export async function initWorker() {
  worker = await connect();
}
