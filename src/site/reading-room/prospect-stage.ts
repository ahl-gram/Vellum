// The prospect stage (#402, widened at #442): the room's engraved plate for whatever
// the story is telling, a chronicle beat or the port the survey is visiting. Its own
// element, never the card path (RR11b keeps every place card dead here); nests inside
// the instrument panel between the strip and the journal (ruled 2026-08-22), inheriting
// the panel's hidden teardowns on purpose. The plate is a blob <img>, never inline <svg>
// (the cross-chart url(#) id rule), and it is a LINK to the full Prospect page, so the
// picture is an honest doorway (#289/#368). It writes nothing to the status line: the
// reveal decorates the sweep and must never stall it.
//
// #442 made the stage plate-shaped rather than beat-shaped: it is handed a PlateSpec and
// draws it, and WHICH plate a told row means is told-plate.ts's rule, not the stage's.
import { plateKeyOf, type PlateSpec } from "./told-plate.ts";

export interface PlateResult {
  readonly svg: string;
  readonly name: string;
}

export interface ProspectStageOpts {
  /** Blob-URL seams, injectable so the swap policy is provable in Node. */
  readonly toUrl?: (svg: string) => string;
  readonly revokeUrl?: (url: string) => void;
}

interface BoundPlate {
  readonly url: string;
  readonly name: string;
}

interface WorldPlates {
  readonly fetchPlate: (spec: PlateSpec) => Promise<PlateResult>;
  readonly hrefFor: (spec: PlateSpec) => string;
  readonly cache: Map<string, Promise<BoundPlate>>;
}

export function createProspectStage(opts: ProspectStageOpts = {}) {
  const toUrl =
    opts.toUrl ?? ((svg: string) => URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })));
  const revokeUrl = opts.revokeUrl ?? ((url: string) => URL.revokeObjectURL(url));

  const root = document.createElement("figure");
  root.className = "rr-prospect";
  root.hidden = true;
  const link = document.createElement("a");
  link.className = "rr-prospect-link";
  const img = document.createElement("img") as HTMLImageElement;
  img.className = "rr-prospect-plate";
  link.appendChild(img);
  root.appendChild(link);

  let world: WorldPlates | null = null;
  let shown: string | null = null;

  function hide(): void {
    shown = null;
    root.hidden = true;
  }

  function plateFor(w: WorldPlates, spec: PlateSpec): Promise<BoundPlate> {
    const key = plateKeyOf(spec);
    const held = w.cache.get(key);
    if (held) return held;
    const bound = w.fetchPlate(spec).then((r) => {
      const url = toUrl(r.svg);
      if (world !== w) {
        revokeUrl(url);
        throw new Error("stale world");
      }
      return { url, name: r.name };
    });
    bound.catch(() => {});
    w.cache.set(key, bound);
    return bound;
  }

  function setWorld(
    fetchPlate: (spec: PlateSpec) => Promise<PlateResult>,
    hrefFor: (spec: PlateSpec) => string,
  ): void {
    const prior = world;
    world = { fetchPlate, hrefFor, cache: new Map() };
    hide();
    if (prior) {
      for (const bound of prior.cache.values()) {
        bound.then((p) => revokeUrl(p.url)).catch(() => {});
      }
    }
  }

  /** Pull every plate the story can reach, ahead of the sweep; the host calls this once the instrument is armed, so the fetches queue off the settle path (#311 forbids a stall). */
  function prefetch(specs: ReadonlyArray<PlateSpec>): void {
    if (world === null) return;
    for (const s of specs) plateFor(world, s);
  }

  /** null is a real state, not an absence: a plain visit opens with no plate at all (ruled 2026-08-22), and a teardown must clear one. */
  function show(spec: PlateSpec | null): void {
    if (world === null || spec === null) {
      hide();
      return;
    }
    const w = world;
    const key = plateKeyOf(spec);
    if (key === shown) return;
    shown = key;
    plateFor(w, spec)
      .then((p) => {
        if (world !== w || shown !== key) return;
        img.src = p.url;
        img.alt = `The prospect of ${p.name} in the year ${spec.year}`;
        link.href = w.hrefFor(spec);
        root.hidden = false;
      })
      .catch(() => {
        if (world === w && shown === key) hide();
      });
  }

  return { root, link, img, setWorld, prefetch, show };
}

export type ProspectStage = ReturnType<typeof createProspectStage>;
