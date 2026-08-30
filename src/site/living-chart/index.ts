// The Living Chart engine (#191): everything the site animates over a baked chart (#53
// story cards, #54 chronicle scrubber, #117 the voyage), behind ONE host-agnostic
// boundary: the host hands its elements in and the engine never looks anything up by id
// (test/site/living-chart-boundary.test.ts). Construction only STORES the refs. The CSS
// half of the contract (#302): the host links the shared /living-chart.css and puts
// class="living-chart" on the mount (test/site/living-chart-css.test.ts). The baked
// chart string is never mutated for export, and nothing writes the host's status line
// while a draw is settling (the settle signal keys on it being "").
import { createPlaceOverlay, type BuildPlaceOverlayOpts } from "./place-overlay.ts";
import { createChronicle } from "./chronicle.ts";
import { createVoyage, type RestingTrackSink } from "./voyage.ts";
import type { TourOrderSource } from "./voyage-session.ts";
import { createVoyageLogPanel } from "./voyage-log-panel.ts";
import { createAges } from "./ages.ts";
import { barlessAges, barlessLogPanel } from "./no-bar.ts";
import type { AgesPos } from "../../render/ages-track.ts";
import type { PlaceManifest } from "../../render/place-manifest.ts";
import type { Survey } from "../../render/survey.ts";
import type { CardBox } from "../../render/place-card.ts";
import type { ToldEntry } from "./told.ts";

export type { BuildPlaceOverlayOpts, RestingTrackSink, TourOrderSource };
export type { AgesPos, ToldEntry };

/** The fused instrument's elements (#319); createReadingFrame's returned host is the full shape. */
export interface ScrubberRefs {
  panel: HTMLElement;
  playBtn: HTMLButtonElement;
  range: HTMLInputElement;
  year: HTMLElement;
  sig: HTMLElement;
  strip: HTMLElement;
  /** #192: invoked when Play parks, the one rest no input event announces. Optional. */
  onPark?: () => void;
  /** #402/#442: invoked on every instrument paint with the entry the story is telling, a survey day row or a chronicle annal, null when nothing is told yet and on teardown. ONE signal for both chambers, never two channels: a host holding two would have to decide which to trust. Optional. */
  onAgesTold?: (told: ToldEntry | null) => void;
}

export interface LivingChartHost {
  /** The chart mount: overlays are appended as its children and wiped by the host's own innerHTML swap on redraw. */
  mapEl: HTMLElement;
  /** The polite status line; the engine keeps it "" (the host's settle signal) except the voyage's one live-completion summary. */
  statusEl: HTMLElement;
  /** The fused instrument panel (#220); the ONE journal nests INSIDE it, so hiding the panel is the whole reading-column teardown. OPTIONAL since #319: with no scrubber the engine wires the no-bar.ts stand-ins and the chart side stays fully live. */
  scrubber?: ScrubberRefs;
  /** #174: optional second surface the RESTING voyage track mirrors to; painted only at rest, never from the rAF tick. */
  restingTrackSink?: RestingTrackSink;
  /** #242: builds a settlement's way in to the prospect page (world-sheet cards only). Optional: a host with no prospect surface (the Reading Room) passes none. */
  prospectHref?: (idx: number) => string;
  /** #387/#388: the box a shown place card is clamped into, in client coordinates. Optional: a host that never shows a card (the Reading Room, permanently .scrub) passes none. */
  clampBox?: () => CardBox | null;
  /** #373: an order the host prepared off-thread for the survey it is about to arm. Optional: a host that passes none computes the #184 matrix inline, on its own thread, as every host did before. */
  tourOrder?: TourOrderSource;
}

export function createLivingChart(host: LivingChartHost) {
  // The one #53<->#54 coupling pair crosses here as late-bound closures, so neither module imports the other.
  const overlay = createPlaceOverlay({
    mapEl: host.mapEl,
    isSuppressed: () => chronicle.isActive(),
    ...(host.prospectHref ? { prospectHref: host.prospectHref } : {}),
    ...(host.clampBox ? { clampBox: host.clampBox } : {}),
  });
  const chronicle = createChronicle({
    mapEl: host.mapEl,
    overlay: { data: () => overlay.data(), hideCard: () => overlay.hideCard() },
  });
  // #319: the ONE place the optional instrument branches; everything downstream is shape-identical for the two host kinds (one boundary, one host type, ratified 2026-08-09).
  const bar = host.scrubber;
  // #220: the journal is ONE document in ONE panel; the log panel's prologue rows and the ages driver's annal rows share the scrubber's strip.
  const logPanel = bar
    ? createVoyageLogPanel({ panel: bar.panel, sig: bar.sig, strip: bar.strip })
    : barlessLogPanel();
  const voyage = createVoyage({
    mapEl: host.mapEl,
    statusEl: host.statusEl,
    logPanel,
    restingTrackSink: host.restingTrackSink,
    ...(host.tourOrder ? { tourOrder: host.tourOrder } : {}),
  });
  const ages = bar
    ? createAges({
        panel: bar.panel,
        playBtn: bar.playBtn,
        range: bar.range,
        readout: bar.year,
        strip: bar.strip,
        onPark: bar.onPark,
        onAgesTold: bar.onAgesTold,
        overlay: { data: () => overlay.data() },
        chronicle,
        voyage,
      })
    : barlessAges({ chronicle, voyage });

  // Full teardown for an UNMOUNTING host (a page leaving); the Explorer's redraw lifecycle never calls this.
  function destroy(): void {
    ages.exitAges(); // tears down both chamber painters with it
    overlay.teardown();
  }

  return {
    // #53: the doc-level dismiss pair is wired by the host (document listeners are page-global, a host decision).
    buildPlaceOverlay: (manifest: PlaceManifest, opts?: BuildPlaceOverlayOpts) =>
      overlay.buildPlaceOverlay(manifest, opts),
    onDocKeydown: overlay.onDocKeydown,
    onDocClick: overlay.onDocClick,
    reclampCard: overlay.reclampCard,
    applyAges: (manifest: PlaceManifest | null, survey: Survey | null, seed: number, subtitle: string) =>
      ages.armAges(manifest, survey, seed, subtitle),
    rearmAges: (
      manifest: PlaceManifest | null,
      survey: Survey | null,
      seed: number,
      subtitle: string,
      opts?: { quiet?: boolean; rest?: AgesPos },
    ) => ages.armAges(manifest, survey, seed, subtitle, opts),
    exitAges: ages.exitAges,
    clearAges: ages.clearAges,
    agesSnapToRest: ages.snapToRest,
    agesState: ages.agesState,
    agesDragStart: ages.dragStart,
    agesDragEnd: ages.dragEnd,
    applyScrub: chronicle.applyScrub,
    exitScrub: chronicle.exitScrub,
    clearScrub: chronicle.clearScrub,
    cancelScrubRaf: ages.cancelRaf,
    pauseScrub: ages.pause,
    togglePlay: ages.togglePlay,
    onManualScrub: ages.onBarInput,
    scrubTo: (year: number) => (ages.isActive() ? ages.scrubToYear(year) : chronicle.scrubTo(year)),
    scrubSnapToPresent: chronicle.scrubSnapToPresent,
    scrubState: () => {
      const s = chronicle.scrubState();
      return s ? { ...s, playing: ages.isPlaying() } : null;
    },
    applyVoyage: voyage.applyVoyage,
    rearmVoyage: voyage.rearmVoyage,
    exitVoyage: voyage.exitVoyage,
    clearVoyage: voyage.clearVoyage,
    cancelVoyageRaf: voyage.cancelVoyageRaf,
    voyageSnapToRest: voyage.voyageSnapToRest,
    voyageStepTo: voyage.voyageStepTo,
    voyagePaintAt: voyage.voyagePaintAt,
    voyagePlan: voyage.voyagePlan,
    voyageLog: voyage.voyageLog,
    voyageDays: voyage.voyageDays,
    voyageLegGeometry: voyage.voyageLegGeometry,
    // #220: chamber-aware while the instrument is armed (an ages-chamber rest shows no recto track for the verso to bleed through, #174); disarmed or bar-less takes the raw voyage sync.
    syncRestingTrack: () => (ages.isActive() ? ages.syncSinkAtRest() : voyage.syncRestingTrack()),
    destroy,
  };
}

export type LivingChart = ReturnType<typeof createLivingChart>;
