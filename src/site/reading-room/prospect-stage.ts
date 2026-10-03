// The prospect stage: the room's engraved plate for whatever the story is telling, a chronicle beat or the port the survey is visiting. Its own element, never the card path; nests inside the instrument panel (ruled 2026-08-22 on Issue #442) and inherits its hidden teardowns on purpose. The plate is a blob <img>, never inline <svg> (the cross-chart url(#) id rule), and a LINK to the full Prospect page. It is handed a PlateSpec and draws it; WHICH plate a told row means is told-plate.ts's rule.
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

interface StageEls { readonly root: HTMLElement; readonly link: HTMLAnchorElement; readonly img: HTMLImageElement }

function blobSeams(opts: Readonly<ProspectStageOpts>) {
  const toUrl =
    opts.toUrl ?? ((svg: string) => URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })));
  const revokeUrl = opts.revokeUrl ?? ((url: string) => URL.revokeObjectURL(url));
  return { toUrl, revokeUrl };
}

function stagePlate() {
  const root = document.createElement("figure");
  root.className = "rr-prospect";
  root.hidden = true;
  const link = document.createElement("a");
  link.className = "rr-prospect-link";
  const img = document.createElement("img");
  img.className = "rr-prospect-plate";
  link.appendChild(img);
  root.appendChild(link);
  return { root, link, img };
}

function revokePrior(prior: Readonly<WorldPlates> | null, revokeUrl: (url: string) => void): void {
  if (prior) {
    for (const bound of prior.cache.values()) {
      bound.then((p) => revokeUrl(p.url)).catch(() => {});
    }
  }
}

function paintPlate(stageEls: StageEls, p: BoundPlate, spec: PlateSpec, w: Readonly<WorldPlates>): void {
  const { img, link, root } = stageEls;
  img.src = p.url;
  img.alt = `The prospect of ${p.name} in the year ${spec.year}`;
  link.href = w.hrefFor(spec);
  root.hidden = false;
}

function stageShown(stageEls: StageEls) {
  const { root } = stageEls;
  let shown: string | null = null;

  function hide(): void {
    shown = null;
    root.hidden = true;
  }
  const setShown = (next: string | null): void => { shown = next; };
  return { shown: (): string | null => shown, setShown, hide };
}

function stageWorld(toUrl: (svg: string) => string, revokeUrl: (url: string) => void, stageEls: StageEls, shown: () => string | null, setShown: (next: string | null) => void, hide: () => void) {
  let world: WorldPlates | null = null;

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

  /** The host calls this once the instrument is armed, so the fetches queue off the settle path. */
  function prefetch(specs: ReadonlyArray<PlateSpec>): void {
    if (world === null) return;
    for (const s of specs) void plateFor(world, s);
  }

  function show(spec: PlateSpec | null): void {
    if (world === null || spec === null) {
      hide();
      return;
    }
    const w = world;
    const key = plateKeyOf(spec);
    if (key === shown()) return;
    setShown(key);
    plateFor(w, spec)
      .then((p) => {
        if (world !== w || shown() !== key) return;
        paintPlate(stageEls, p, spec, w);
      })
      .catch(() => {
        if (world === w && shown() === key) hide();
      });
  }
  const bindWorld = (next: WorldPlates | null): void => { world = next; };
  return { world: (): WorldPlates | null => world, bindWorld, prefetch, show };
}

export function createProspectStage(opts: ProspectStageOpts = {}) {
  const { toUrl, revokeUrl } = blobSeams(opts);
  const { root, link, img } = stagePlate();
  const stageEls: StageEls = { root, link, img };
  const { shown, setShown, hide } = stageShown(stageEls);
  const { world, bindWorld, prefetch, show } = stageWorld(toUrl, revokeUrl, stageEls, shown, setShown, hide);

  function setWorld(
    fetchPlate: (spec: PlateSpec) => Promise<PlateResult>,
    hrefFor: (spec: PlateSpec) => string,
  ): void {
    const prior = world();
    bindWorld({ fetchPlate, hrefFor, cache: new Map() });
    hide();
    revokePrior(prior, revokeUrl);
  }

  return { root, link, img, setWorld, prefetch, show };
}

export type ProspectStage = ReturnType<typeof createProspectStage>;
