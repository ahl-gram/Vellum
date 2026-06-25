// The atlas composition's `world` carries Field methods (at/index/inBounds) that
// are not structured-cloneable; the plates and fragments are plain strings. Both
// the render worker (worker.js) and the main-thread inline path (worker-client.js)
// strip the composed atlas to this fixed plain shape, so the worker/inline
// byte-identity check (e2e A2/A3) stays a clean compare. Shared by BOTH so the two
// paths can never drift.
export function serializableAtlas(a) {
  return {
    hero: a.hero,
    draughtings: a.draughtings,
    themes: a.themes,
    regions: a.regions,
    bannersHtml: a.bannersHtml,
    chronicleHtml: a.chronicleHtml,
    gazetteerHtml: a.gazetteerHtml,
  };
}
