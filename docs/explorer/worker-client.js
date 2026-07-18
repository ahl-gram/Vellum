// Render worker plumbing. The heavy world-gen + SVG render runs in ./worker.js
// off the main thread so the UI stays responsive. The worker is best-effort: if
// it cannot be constructed (file://, strict CSP, an older browser) we fall back to
// running the same engine inline on the main thread, so the page always works.
// runInline mirrors worker.js exactly (same engine calls, same serializableAtlas)
// so the worker/inline byte-identity check (e2e A2/A3) stays a clean compare.
import { defaultRecipe, generateWorld } from "./engine/world/generate.js";
import { renderMap } from "./engine/render/map-renderer.js";
import { buildPlaceManifest } from "./engine/render/place-manifest.js";
import { buildSurvey } from "./engine/render/survey.js";
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
      survey: buildSurvey(world.elev, world.seaLevel, world.roads), // #120, mirrors worker.js
      title: world.title.title,
      subtitle: world.title.subtitle,
      mapType: recipe.mapType,
      band: recipe.band,
    };
  }
  const world = generateWorld(defaultRecipe(msg.seed, msg.overrides));
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
// workerUrl is the spawn target. `new Worker(str)` resolves str against the DOCUMENT
// base URL, not this module's URL, so the Explorer's default "./worker.bundle.js"
// (document base /explorer/) lands on /explorer/worker.bundle.js, the esbuild twin
// (#163). A page in another directory that reuses this client (the Print Room, #133)
// must pass a root-absolute URL instead, or a bare "./worker.bundle.js" would resolve
// against ITS base (/print-room/) and 404 into a silent inline fallback. The Print Room
// is not put through the press, so it passes "/explorer/worker.js", the native-ESM
// worker. Either worker's own ./engine/... imports resolve against the worker script
// URL (and the twin inlines them), so only the spawn string bites.
function connect(workerUrl) {
  return new Promise((resolve) => {
    let w;
    try {
      w = new Worker(workerUrl, { type: "module" });
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
 * Connect the worker (best-effort) and record it as the active transport.
 * @param {string} [workerUrl] spawn target (default "./worker.bundle.js", the Explorer's
 *   own esbuild twin). A cross-directory reuser (the Print Room) passes the root-absolute
 *   "/explorer/worker.js" (the unbundled worker; the Print Room is not bundled).
 */
export async function initWorker(workerUrl = "./worker.bundle.js") {
  worker = await connect(workerUrl);
}
