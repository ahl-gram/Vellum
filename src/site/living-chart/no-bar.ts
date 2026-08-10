// #319 (Survey & Story Sub 2): what the engine wires in place of the fused instrument
// when the host hands in NO scrubber. Sub 4's static Explorer mounts the living chart
// for its overlays and the static resting track and has no bar, no Play, no readout and
// no journal; without this the host contract would force it to ship hidden dead controls
// to assistive tech forever just to satisfy a type.
//
// Two stand-ins, because `host.scrubber` feeds TWO consumers: the ages driver
// (panel/playBtn/range/year/strip) and the journal's log panel (panel/sig/strip).
// Skipping createAges alone is not enough, since VoyageDeps.logPanel is non-optional and
// every one of its members is reachable on the resting path.
//
// The DIVISION, ratified 2026-08-09 on #319 and refined at the two entries the
// ratification's list did not name: the INSTRUMENT half goes silent (no bar to move, no
// clock to run, no panel to hide), while the CHART side stays fully live. So exitAges
// and clearAges are not blanket no-ops: they are the composite entries an unmounting or
// redrawing host reaches its chamber painters through, and swallowing them would leak
// the voyage overlay and the verso ink on a host that never had a bar to begin with.
// Nothing here throws: a host that never wires Play cannot press it, so a throw would
// add a failure mode with no reachable trigger.
//
// Neither stand-in touches `document`. That is load-bearing, not incidental: the #191
// Node-import guard constructs the engine where no DOM exists at all.
import { buildVoyageLog } from "../../world/voyage-log.ts";
import type { Ages } from "./ages.ts";
import type { Chronicle } from "./chronicle.ts";
import type { Voyage } from "./voyage.ts";
import type { VoyageLogPanel } from "./voyage-log-panel.ts";

export interface BarlessDeps {
  chronicle: Chronicle;
  voyage: Voyage;
}

/**
 * The ages driver for a host with no bar. Every instrument-side member answers as a
 * silent no-op and both reads answer "off", which is what lets index.ts route its
 * composed entries to their chart-side halves with no bar-less special casing at all:
 * `isActive()` false sends scrubTo to the chronicle's static reveal and syncRestingTrack
 * to the raw voyage sync, and `agesState()` null keeps the address writer and the e2e
 * read hooks on the paths they already take when the instrument is merely disarmed.
 *
 * INVARIANT: the return type is the REAL driver's `Ages`, never a hand-written shape.
 * If createAges grows a member, tsc breaks this file rather than letting a bar-less host
 * silently lose a capability at runtime.
 */
export function barlessAges(deps: BarlessDeps): Ages {
  const { chronicle, voyage } = deps;
  const silent = (): void => {};
  return {
    isActive: () => false,
    isPlaying: () => false,
    // Unreachable through index.ts (its syncRestingTrack gates on isActive), and there
    // is no ages chamber whose rest could decide what the verso shows.
    syncSinkAtRest: silent,
    // A bar-less host arms the chart side directly: rearmVoyage for the static survey
    // rest, applyScrub for the chronicle. Both have been on the engine's public surface
    // since #191, so the instrument's own arm owes nothing here.
    armAges: silent,
    // CHART-SIDE, deliberately not silent: destroy() reaches both chamber painters
    // through here, so an unmounting bar-less host must still lose its voyage overlay
    // and its verso ink.
    exitAges: () => {
      chronicle.exitScrub();
      voyage.exitVoyage();
    },
    // CHART-SIDE for the same reason, and the hotter path of the two: the Explorer calls
    // clearAges after EVERY draw whose instrument is off, so swallowing it would leak a
    // stale session and the sink's ink once per redraw.
    clearAges: () => {
      chronicle.clearScrub();
      voyage.clearVoyage();
    },
    // The voyage owns its own rAF and its own cancel entry (cancelVoyageRaf); the clock
    // that lives in here is the instrument's, and a bar-less host has none.
    cancelRaf: silent,
    pause: silent,
    togglePlay: silent,
    onBarInput: silent,
    dragStart: silent,
    dragEnd: silent,
    // The instrument's snap, which needs a bar position to snap. A bar-less host flips
    // the sheet with voyageSnapToRest instead.
    snapToRest: silent,
    // The INSTRUMENT's year paint. index.ts's scrubTo still resolves, to
    // chronicle.scrubTo, because isActive() is false.
    scrubToYear: silent,
    agesState: () => null,
  };
}

/**
 * The journal for a host with no panel to write it in. No scrubber means no strip and no
 * signature line, but the log itself is world DATA the voyage still needs whether or not
 * anything renders it: paintFrame posts `log.summary` to the status line on a live
 * completion, and voyageLog() is an e2e read hook. So this builds the REAL log (a pure
 * call, the same one the rendering panel makes) and skips only the DOM.
 *
 * A fully hollow sink would also satisfy the engine's types, and it is the wrong choice:
 * the announcement a bar-less host CAN still make is the status summary, and hollowing
 * the log would silently take it away. `rows` is empty because rows are the strip's, so a
 * reader of the snapshot sees real `entries` against `rows: 0` and `visible: false`. That
 * asymmetry is the honest report (the log exists, the panel does not), and it is the one
 * thing a Sub-4 e2e assertion could reasonably have expected to match.
 */
export function barlessLogPanel(): VoyageLogPanel {
  return {
    buildLogPanel: (logPorts, presentYear, seed, subtitle, homecoming = null) => ({
      log: buildVoyageLog(logPorts, presentYear, seed >>> 0, subtitle || "", homecoming),
      // No strip to render into. revealLog and logSnapshot are positional over this
      // array, so an empty one makes both correctly inert with no further guarding.
      rows: [],
    }),
    revealLog: () => {},
    hideLog: () => {},
    logSnapshot: (log) => ({
      attribution: log.attribution,
      summary: log.summary,
      entries: log.entries.map((e) => ({ idx: e.idx, year: e.year, day: e.day, text: e.text })),
      logged: 0,
      rows: 0,
      visible: false,
    }),
  };
}
