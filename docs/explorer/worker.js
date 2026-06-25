// Render worker: runs the CPU-heavy world generation + SVG rendering off the
// main thread so the Explorer stays responsive. Stateless — every job carries
// its own seed + overrides and regenerates the world deterministically, so the
// output is byte-identical to running the same engine on the main thread.
import { defaultRecipe, generateWorld } from "./engine/world/generate.js";
import { renderMap } from "./engine/render/map-renderer.js";
import { buildPlaceManifest } from "./engine/render/place-manifest.js";
import { composeAtlas } from "./engine/atlas/compose.js";
import { serializableAtlas } from "./serializable-atlas.js";

self.onmessage = (e) => {
  const msg = e.data;
  try {
    if (msg.kind === "draw") {
      const recipe = defaultRecipe(msg.seed, msg.overrides);
      const world = generateWorld(recipe);
      self.postMessage({
        id: msg.id,
        ok: true,
        svg: renderMap(world, msg.render),
        manifest: buildPlaceManifest(world, msg.render.widthPx ?? 1500),
        title: world.title.title,
        mapType: recipe.mapType,
        band: recipe.band,
      });
    } else if (msg.kind === "atlas") {
      const world = generateWorld(defaultRecipe(msg.seed, msg.overrides));
      self.postMessage({
        id: msg.id,
        ok: true,
        atlas: serializableAtlas(composeAtlas(world, { width: msg.width })),
      });
    }
  } catch (err) {
    self.postMessage({ id: msg.id, ok: false, error: (err && err.message) || String(err) });
  }
};

// Handshake: the static imports above have resolved by the time the module body
// runs, so this tells the main thread the engine loaded and the worker is ready.
self.postMessage({ ready: true });
