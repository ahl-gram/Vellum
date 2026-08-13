// #319: what the engine wires in place of the fused instrument when the host hands in NO
// scrubber. Two stand-ins, because host.scrubber feeds TWO consumers (the ages driver
// and the journal's log panel). The DIVISION, ratified 2026-08-09 on #319: the
// INSTRUMENT half goes silent while the CHART side stays fully live, so exitAges and
// clearAges are NOT blanket no-ops. Nothing here throws (a host that never wires Play
// cannot press it), and neither stand-in touches `document`: the #191 Node-import guard
// constructs the engine where no DOM exists at all.
import { buildVoyageLog } from "../../world/voyage-log.ts";
import type { Ages } from "./ages.ts";
import type { Chronicle } from "./chronicle.ts";
import type { Voyage } from "./voyage.ts";
import type { VoyageLogPanel } from "./voyage-log-panel.ts";

export interface BarlessDeps {
  chronicle: Chronicle;
  voyage: Voyage;
}

/** The ages driver for a host with no bar: every instrument-side member is a silent no-op and both reads answer "off", which lets index.ts route its composed entries to their chart-side halves with no bar-less special casing. INVARIANT: the return type is the REAL driver's `Ages`, never a hand-written shape, so tsc breaks this file if createAges grows a member rather than a bar-less host silently losing a capability. */
export function barlessAges(deps: BarlessDeps): Ages {
  const { chronicle, voyage } = deps;
  const silent = (): void => {};
  return {
    isActive: () => false,
    isPlaying: () => false,
    // Unreachable through index.ts (its syncRestingTrack gates on isActive), and no ages chamber exists whose rest could decide what the verso shows.
    syncSinkAtRest: silent,
    // A bar-less host arms the chart side directly (rearmVoyage / applyScrub, public since #191).
    armAges: silent,
    // CHART-SIDE, deliberately not silent: destroy() reaches both chamber painters through here.
    exitAges: () => {
      chronicle.exitScrub();
      voyage.exitVoyage();
    },
    // CHART-SIDE, the hotter path: the Explorer calls this after EVERY draw whose instrument is off.
    clearAges: () => {
      chronicle.clearScrub();
      voyage.clearVoyage();
    },
    // The voyage owns its own rAF and cancel entry; the clock that lives here is the instrument's, and a bar-less host has none.
    cancelRaf: silent,
    pause: silent,
    togglePlay: silent,
    onBarInput: silent,
    dragStart: silent,
    dragEnd: silent,
    // The instrument's snap needs a bar position; a bar-less host flips the sheet with voyageSnapToRest instead.
    snapToRest: silent,
    // The INSTRUMENT's year paint; index.ts's scrubTo still resolves, to chronicle.scrubTo, because isActive() is false.
    scrubToYear: silent,
    agesState: () => null,
  };
}

/** The journal for a host with no panel to write it in. The log itself is world DATA the voyage still needs (paintFrame posts `log.summary` to the status line; voyageLog() is an e2e read hook), so this builds the REAL log and skips only the DOM. `rows` stays empty on purpose: real `entries` against `rows: 0` and `visible: false` is the honest report (the log exists, the panel does not). */
export function barlessLogPanel(): VoyageLogPanel {
  return {
    buildLogPanel: (logPorts, presentYear, seed, subtitle, homecoming = null) => ({
      log: buildVoyageLog(logPorts, presentYear, seed >>> 0, subtitle || "", homecoming),
      // revealLog and logSnapshot are positional over this array, so an empty one makes both correctly inert with no further guarding.
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
