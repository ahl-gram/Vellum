// The Living Chart engine: everything the site animates over a baked chart (story cards, the chronicle scrubber, the voyage), behind one host-agnostic boundary. The host hands its elements in and construction only stores the refs; the baked chart string is never mutated for export.
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

export interface ScrubberRefs {
  panel: HTMLElement;
  playBtn: HTMLButtonElement;
  range: HTMLInputElement;
  year: HTMLElement;
  sig: HTMLElement;
  strip: HTMLElement;
  /** Invoked when Play parks, the one rest no input event announces. */
  onPark?: () => void;
  onAgesTold?: (told: ToldEntry | null) => void;
}

export interface LivingChartHost {
  /** The chart mount: overlays are appended as its children and wiped by the host's own innerHTML swap on redraw. */
  mapEl: HTMLElement;
  /** The polite status line; the engine keeps it "" (the host's settle signal) except the voyage's one live-completion summary. */
  statusEl: HTMLElement;
  scrubber?: ScrubberRefs;
  restingTrackSink?: RestingTrackSink;
  prospectHref?: (idx: number) => string;
  clampBox?: () => CardBox | null;
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
  // The one place the optional instrument branches; everything downstream is shape-identical for the two host kinds (ratified 2026-08-09 on #319).
  const bar = host.scrubber;
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

  function destroy(): void {
    ages.exitAges();
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
    setPace: ages.setPace,
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
    // Chamber-aware while the instrument is armed (an ages-chamber rest shows no recto track for the verso to bleed through, so the sink clears); disarmed or bar-less takes the raw voyage sync.
    syncRestingTrack: () => (ages.isActive() ? ages.syncSinkAtRest() : voyage.syncRestingTrack()),
    destroy,
  };
}

export type LivingChart = ReturnType<typeof createLivingChart>;
