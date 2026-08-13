// The composed atlas's `world` carries Field methods that are not structured-cloneable,
// so BOTH transports (the worker and the inline path) strip it to this fixed plain shape
// through the ONE shared function, keeping the worker/inline byte-identity (e2e A2/A3) a
// clean compare by construction. title/subtitle/seed are lifted out of `world` so the
// Print Room's single-file download builds atlasDocument() straight from this (#136); the shape matches AtlasDocumentData.
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
