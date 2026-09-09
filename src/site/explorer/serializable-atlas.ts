// The composed atlas's `world` carries Field methods that are not structured-cloneable, so both transports strip it to this plain AtlasDocumentData shape through the one shared function, keeping the worker/inline byte-identity a clean compare by construction.
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
    prospects: a.prospects,
    bannersHtml: a.bannersHtml,
    chronicleHtml: a.chronicleHtml,
    gazetteerHtml: a.gazetteerHtml,
  };
}
