// The Living Chart engine (#191, Reading Room Sub 1): everything the site animates
// over a baked chart, behind ONE host-agnostic boundary. The three coupled features:
//   #53  story cards       - hover / tap / Tab-focus a place to unfurl a parchment card
//   #54  chronicle scrubber - a year-slider + Play that animates the world growing
//   #117 the Wayfarer's voyage - a ship/rider traces the survey that drew the chart
// They share one overlay substrate (invisible hit-targets positioned by manifest
// fractions over the host's chart mount) and one discipline: the baked chart string is
// never mutated for export, and nothing writes the host's status line while a draw is
// settling (the settle signal and the e2e waitSettled both key on it being "").
//
// ## The host contract (why this boundary exists)
// Before #191 these modules resolved Explorer element ids against the document at
// MODULE scope, so importing them from any other page null-bound them at import time.
// Now the host hands its elements in and the engine never looks anything up by id
// (guarded by test/site/living-chart-boundary.test.ts).
// Construction only STORES the refs, so a host may build the engine before its DOM is
// fully assembled, as long as the elements exist by the first method call.
//
// The contract has a CSS half (#302, the boundary's twin): the engine's overlay
// dressing lives in the SHARED /living-chart.css, so a host page must (1) link that
// sheet (BaseLayout's extraCss prop) and (2) put class="living-chart" on the chart
// mount it hands in, which is what the #155 ink-in rules key on. Without both, the
// engine runs live but renders undressed (UA-default buttons, an unpositioned
// voyage overlay). Guarded by test/site/living-chart-css.test.ts.
//
// ## Capability map for the Reading Room (#190), so Subs 2-5 need not re-open internals
//   arm:      buildPlaceOverlay (per draw), applyScrub / applyVoyage / rearmVoyage
//   step:     voyageStepTo (port-resolution), scrubTo (year-resolution)
//   paint:    voyagePaintAt (continuous t in [0,1]), scrubTo (clamped year)
//   reset:    exitScrub / exitVoyage / voyageSnapToRest / scrubSnapToPresent
//   teardown: clearScrub / clearVoyage (post-wipe), destroy (unmounting host)
//   read:     voyagePlan / voyageLog / voyageLegGeometry / scrubState
// #220's fused instrument owns its own clock and drives voyagePaintAt then scrubTo on
// one continuous timeline; #192's address serializer reads scrubState() for the year;
// #221's page passes its own elements as the host and needs no verso sink. The Explorer
// keeps wiring its own listeners (conductor owns wiring; the engine owns behavior).
import { createPlaceOverlay, type BuildPlaceOverlayOpts } from "./place-overlay.ts";
import { createChronicle } from "./chronicle.ts";
import { createVoyage, type RestingTrackSink } from "./voyage.ts";
import { createVoyageLogPanel, type VoyageLogHost } from "./voyage-log-panel.ts";
import type { PlaceManifest } from "../../render/place-manifest.ts";

export type { BuildPlaceOverlayOpts, RestingTrackSink };

export interface LivingChartHost {
  /** The chart mount (the Explorer's #map): overlays are appended as its children and
   *  wiped by the host's own innerHTML swap on redraw. */
  mapEl: HTMLElement;
  /** The polite status line. The engine posts the voyage's one live-completion summary
   *  here and otherwise keeps it "", the settle signal the host's draw depends on. */
  statusEl: HTMLElement;
  /** The chronicle scrubber panel and its controls. */
  scrubber: {
    panel: HTMLElement;
    playBtn: HTMLButtonElement;
    range: HTMLInputElement;
    year: HTMLElement;
    strip: HTMLElement;
    /** #192: invoked when Play parks (Pause click or the sweep's auto-pause), so the
     *  host's address writer can record the rest no event announces. Optional: a host
     *  with no address simply omits it. */
    onPark?: () => void;
  };
  /** The surveyor's margin-log panel. */
  voyageLog: VoyageLogHost;
  /** Optional second surface the RESTING voyage track mirrors to (the Explorer's verso
   *  bleed-through, #174). Painted only at rest, never from the rAF tick; a page host
   *  with no back face simply omits it. */
  restingTrackSink?: RestingTrackSink;
}

export function createLivingChart(host: LivingChartHost) {
  // The one #53<->#54 coupling pair crosses here: the card is suppressed while a scrub
  // session is active, and the scrubber reads the overlay's manifest data / dismisses
  // its card. Both directions are late-bound closures, so neither module imports the
  // other and the wiring stays in this index.
  const overlay = createPlaceOverlay({
    mapEl: host.mapEl,
    isSuppressed: () => chronicle.isActive(),
  });
  const chronicle = createChronicle({
    mapEl: host.mapEl,
    panel: host.scrubber.panel,
    playBtn: host.scrubber.playBtn,
    range: host.scrubber.range,
    year: host.scrubber.year,
    strip: host.scrubber.strip,
    onPark: host.scrubber.onPark,
    overlay: { data: () => overlay.data(), hideCard: () => overlay.hideCard() },
  });
  const logPanel = createVoyageLogPanel(host.voyageLog);
  const voyage = createVoyage({
    mapEl: host.mapEl,
    statusEl: host.statusEl,
    logPanel,
    restingTrackSink: host.restingTrackSink,
  });

  // Full teardown for an UNMOUNTING host (a page leaving; the Explorer's redraw
  // lifecycle never calls this). Cancels both rAF loops, restores the baked layers,
  // removes every engine-owned node on both faces, and drops the sessions.
  function destroy(): void {
    voyage.exitVoyage();
    chronicle.exitScrub();
    overlay.teardown();
  }

  return {
    // #53 story cards. The doc-level dismiss pair is wired by the host (document
    // listeners are page-global, so attaching them is a host decision).
    buildPlaceOverlay: (manifest: PlaceManifest, opts?: BuildPlaceOverlayOpts) =>
      overlay.buildPlaceOverlay(manifest, opts),
    onDocKeydown: overlay.onDocKeydown,
    onDocClick: overlay.onDocClick,
    // #54 chronicle scrubber
    applyScrub: chronicle.applyScrub,
    exitScrub: chronicle.exitScrub,
    clearScrub: chronicle.clearScrub,
    cancelScrubRaf: chronicle.cancelScrubRaf,
    pauseScrub: chronicle.pauseScrub,
    togglePlay: chronicle.togglePlay,
    onManualScrub: chronicle.onManualScrub,
    scrubTo: chronicle.scrubTo,
    scrubSnapToPresent: chronicle.scrubSnapToPresent,
    scrubState: chronicle.scrubState,
    // the Wayfarer's voyage
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
    voyageLegGeometry: voyage.voyageLegGeometry,
    syncRestingTrack: voyage.syncRestingTrack,
    destroy,
  };
}

export type LivingChart = ReturnType<typeof createLivingChart>;
