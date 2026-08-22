// The prospect stage (#402): the room's engraved plate for the story's beats, revealed
// when the chronicle crosses a founding or a ruin. Its own element, never the card path
// (RR11b keeps every place card dead here); mounts as a SIBLING of the instrument panel
// (the #318 colophon rule: the engine hides the panel through every teardown). The plate
// is a blob <img>, never inline <svg> (the cross-chart url(#) id rule), and it is a LINK
// to the full Prospect page, so the picture is an honest doorway (#289/#368). It writes
// nothing to the status line: the reveal decorates the sweep and must never stall it.
import { latestBeatAt, type StoryBeat } from "./beats.ts";

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
  readonly beats: ReadonlyArray<StoryBeat>;
  readonly hrefFor: (beat: StoryBeat) => string;
  readonly cache: Map<StoryBeat, Promise<BoundPlate>>;
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
  let shown: StoryBeat | null = null;

  function hide(): void {
    shown = null;
    root.hidden = true;
  }

  function setWorld(
    beats: ReadonlyArray<StoryBeat>,
    fetchPlate: (beat: StoryBeat) => Promise<PlateResult>,
    hrefFor: (beat: StoryBeat) => string,
  ): void {
    const prior = world;
    const next: WorldPlates = { beats, hrefFor, cache: new Map() };
    world = next;
    hide();
    // A plate resolving after its world left revokes itself on arrival, so the swap needs no ledger of in-flight fetches.
    for (const b of beats) {
      const bound = fetchPlate(b).then((r) => {
        const url = toUrl(r.svg);
        if (world !== next) {
          revokeUrl(url);
          throw new Error("stale world");
        }
        return { url, name: r.name };
      });
      bound.catch(() => {});
      next.cache.set(b, bound);
    }
    if (prior) {
      for (const bound of prior.cache.values()) {
        bound.then((p) => revokeUrl(p.url)).catch(() => {});
      }
    }
  }

  function onYear(year: number | null): void {
    if (world === null || year === null) {
      hide();
      return;
    }
    const w = world;
    const beat = latestBeatAt(w.beats, year);
    if (beat === null) {
      hide();
      return;
    }
    if (beat === shown) return;
    shown = beat;
    w.cache
      .get(beat)!
      .then((p) => {
        if (world !== w || shown !== beat) return;
        img.src = p.url;
        img.alt = `The prospect of ${p.name} in the year ${beat.year}`;
        link.href = w.hrefFor(beat);
        root.hidden = false;
      })
      .catch(() => {
        if (world === w && shown === beat) hide();
      });
  }

  return { root, link, img, setWorld, onYear };
}

export type ProspectStage = ReturnType<typeof createProspectStage>;
