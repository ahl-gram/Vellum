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
//   arm:      buildPlaceOverlay (per draw), applyAges / rearmAges (the fused #220
//             instrument; applyScrub / applyVoyage / rearmVoyage remain the chamber
//             painters' own entries)
//   step:     voyageStepTo (port-resolution), scrubTo (year-resolution)
//   paint:    voyagePaintAt (continuous t in [0,1]), scrubTo (clamped year)
//   reset:    exitAges / agesSnapToRest; exitScrub / exitVoyage / voyageSnapToRest /
//             scrubSnapToPresent stay per-chamber
//   teardown: clearAges (post-wipe), destroy (unmounting host)
//   read:     agesState / voyagePlan / voyageLog / voyageLegGeometry / scrubState
// #220 landed the fused instrument as ages.ts: it owns the one clock, the one bar and
// the one journal, and drives the two chamber painters through internal seams. #192's
// address serializer reads agesState() for the chamber and year; #221's page passes
// its own elements as the host and needs no verso sink. The Explorer keeps wiring its
// own listeners (conductor owns wiring; the engine owns behavior).
import { createPlaceOverlay, type BuildPlaceOverlayOpts } from "./place-overlay.ts";
import { createChronicle } from "./chronicle.ts";
import { createVoyage, type RestingTrackSink } from "./voyage.ts";
import { createVoyageLogPanel } from "./voyage-log-panel.ts";
import { createAges } from "./ages.ts";
import type { AgesPos } from "../../render/ages-track.ts";
import type { PlaceManifest } from "../../render/place-manifest.ts";
import type { Survey } from "../../render/survey.ts";

export type { BuildPlaceOverlayOpts, RestingTrackSink };
export type { AgesPos };

export interface LivingChartHost {
  /** The chart mount (the Explorer's #map): overlays are appended as its children and
   *  wiped by the host's own innerHTML swap on redraw. */
  mapEl: HTMLElement;
  /** The polite status line. The engine posts the voyage's one live-completion summary
   *  here and otherwise keeps it "", the settle signal the host's draw depends on. */
  statusEl: HTMLElement;
  /** The fused instrument panel (#220): the bar, Play, the readout, and the ONE
   *  journal (the surveyor's signature line and the strip both blocks render into).
   *  The journal nests INSIDE this panel: hiding the panel is the engine's whole
   *  teardown of the reading column. */
  scrubber: {
    panel: HTMLElement;
    playBtn: HTMLButtonElement;
    range: HTMLInputElement;
    year: HTMLElement;
    sig: HTMLElement;
    strip: HTMLElement;
    /** #192: invoked when Play parks (Pause click or the sweep's auto-pause), so the
     *  host's address writer can record the rest no event announces. Optional: a host
     *  with no address simply omits it. */
    onPark?: () => void;
  };
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
    overlay: { data: () => overlay.data(), hideCard: () => overlay.hideCard() },
  });
  // #220: the journal is ONE document in ONE panel. The prologue rows the log panel
  // builds and the annal rows the ages driver appends share the scrubber's strip, and
  // the log panel's hide/show drives the same panel the instrument lives in.
  const logPanel = createVoyageLogPanel({
    panel: host.scrubber.panel,
    sig: host.scrubber.sig,
    strip: host.scrubber.strip,
  });
  const voyage = createVoyage({
    mapEl: host.mapEl,
    statusEl: host.statusEl,
    logPanel,
    restingTrackSink: host.restingTrackSink,
  });
  const ages = createAges({
    panel: host.scrubber.panel,
    playBtn: host.scrubber.playBtn,
    range: host.scrubber.range,
    readout: host.scrubber.year,
    strip: host.scrubber.strip,
    onPark: host.scrubber.onPark,
    overlay: { data: () => overlay.data() },
    chronicle,
    voyage,
  });

  // Full teardown for an UNMOUNTING host (a page leaving; the Explorer's redraw
  // lifecycle never calls this). Cancels the clock, restores the baked layers,
  // removes every engine-owned node on both faces, and drops the sessions.
  function destroy(): void {
    ages.exitAges(); // tears down both chamber painters with it
    overlay.teardown();
  }

  return {
    // #53 story cards. The doc-level dismiss pair is wired by the host (document
    // listeners are page-global, so attaching them is a host decision).
    buildPlaceOverlay: (manifest: PlaceManifest, opts?: BuildPlaceOverlayOpts) =>
      overlay.buildPlaceOverlay(manifest, opts),
    onDocKeydown: overlay.onDocKeydown,
    onDocClick: overlay.onDocClick,
    // #220 the fused ages instrument: the one arm/exit/clear the Explorer wires.
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
    // #54 chronicle scrubber. The chart-side entries keep their chamber meaning; the
    // instrument-side names (#220) now answer to the fused driver, which owns the one
    // Play clock and the one bar the old chronicle instrument used to hold.
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
    // #220: chamber-aware while the instrument is armed. The Explorer calls this after
    // every non-quiet draw (rebuildVerso wipes the verso track), and the raw voyage
    // sync repaints unconditionally whenever a session exists, which under the fused
    // instrument is ALWAYS while armed: an ages-chamber rest (recto shows no track)
    // would get a survey track bled onto the visible verso (#174). The ages driver
    // knows which chamber rests; disarmed, the raw sync's clear path still runs.
    syncRestingTrack: () => (ages.isActive() ? ages.syncSinkAtRest() : voyage.syncRestingTrack()),
    destroy,
  };
}

export type LivingChart = ReturnType<typeof createLivingChart>;
