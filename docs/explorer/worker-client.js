// Render worker plumbing. The heavy world-gen + SVG render runs in ./worker.js
// off the main thread so the UI stays responsive. The worker is best-effort: if
// it cannot be constructed (file://, strict CSP, an older browser) we fall back to
// running the same engine inline on the main thread, so the page always works.
// runInline mirrors worker.js exactly (same engine calls, same serializableAtlas)
// so the worker/inline byte-identity check (e2e A2/A3) stays a clean compare.
import { defaultRecipe, generateWorld } from "./engine/world/generate.js";
import { renderMap } from "./engine/render/map-renderer.js";
import { buildPlaceManifest } from "./engine/render/place-manifest.js";
import { composeAtlas } from "./engine/atlas/compose.js";
import { serializableAtlas } from "./serializable-atlas.js";

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
    const recipe = defaultRecipe(msg.seed, msg.overrides);
    const world = generateWorld(recipe);
    return {
      ok: true,
      svg: renderMap(world, msg.render),
      manifest: buildPlaceManifest(world, msg.render.widthPx ?? 1500),
      title: world.title.title,
      mapType: recipe.mapType,
      band: recipe.band,
    };
  }
  const world = generateWorld(defaultRecipe(msg.seed, msg.overrides));
  return { ok: true, atlas: serializableAtlas(composeAtlas(world, { width: msg.width })) };
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
function connect() {
  return new Promise((resolve) => {
    let w;
    try {
      w = new Worker("./worker.js", { type: "module" });
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

/** Connect the worker (best-effort) and record it as the active transport. */
export async function initWorker() {
  worker = await connect();
}
