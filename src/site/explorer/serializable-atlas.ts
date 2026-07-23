// The atlas composition's `world` carries Field methods (at/index/inBounds) that
// are not structured-cloneable; the plates and fragments are plain strings. Both
// the render worker (worker.js) and the main-thread inline path (worker-client.js)
// strip the composed atlas to this fixed plain shape, so the worker/inline
// byte-identity check (e2e A2/A3) stays a clean compare. Shared by BOTH so the two
// paths can never drift.
//
// title/subtitle/seed are lifted out of `world` here so the plain result carries
// everything the atlas document header needs (#136): the Print Room's single-file
// download builds atlasDocument() straight from this, with no access to `world`. The
// shape matches AtlasDocumentData (src/atlas/document.ts). Both transport paths run
// through this one function, so adding these keeps the R2/R3 byte-parity by construction.
import type { AtlasComposition } from "../../atlas/compose.ts";
import type { AtlasDocumentData } from "../../atlas/document.ts";

export function serializableAtlas(a: AtlasComposition): AtlasDocumentData {
  return {
    title: a.world.title.title,
    subtitle: a.world.title.subtitle,
    seed: a.world.recipe.seed,
    hero: a.hero,
    draughtings: a.draughtings,
    themes: a.themes,
    regions: a.regions,
    bannersHtml: a.bannersHtml,
    chronicleHtml: a.chronicleHtml,
    gazetteerHtml: a.gazetteerHtml,
  };
}
