// Render worker: runs the CPU-heavy world generation + SVG rendering off the
// main thread so the Explorer stays responsive. Stateless — every job carries
// its own seed + overrides and regenerates the world deterministically, so the
// output is byte-identical to running the same engine on the main thread.
import { defaultRecipe, generateWorld } from "./engine/world/generate.js";
import { renderMap } from "./engine/render/map-renderer.js";
import { buildPlaceManifest } from "./engine/render/place-manifest.js";
import { buildSurvey } from "./engine/render/survey.js";
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
        // msg.render.widthPx is passed to renderMap UNCLAMPED by design: the CLI bounded
        // it 400-6000 (src/cli/main.ts), and callers here own that guard instead. The
        // Explorer draws at fixed widths; the Print Room's poster plates (#134) clamp
        // page-side to the [2400, 4200] envelope in docs/print-room/poster-presets.js
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
        mapType: recipe.mapType,
        band: recipe.band,
      });
    } else if (msg.kind === "atlas") {
      const world = generateWorld(defaultRecipe(msg.seed, msg.overrides));
      self.postMessage({
        id: msg.id,
        ok: true,
        atlas: serializableAtlas(composeAtlas(world, { width: msg.width, bannerStyle: msg.bannerStyle })),
      });
    }
  } catch (err) {
    self.postMessage({ id: msg.id, ok: false, error: (err && err.message) || String(err) });
  }
};

// Handshake: the static imports above have resolved by the time the module body
// runs, so this tells the main thread the engine loaded and the worker is ready.
self.postMessage({ ready: true });
