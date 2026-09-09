// The two stand-ins the engine wires when the host hands in no scrubber: the instrument half goes silent while the chart side stays live (ratified 2026-08-09 on #319), nothing throws, and neither touches document.
import { buildVoyageLog } from "../../world/voyage-log.ts";
import type { Ages } from "./ages.ts";
import type { Chronicle } from "./chronicle.ts";
import type { Voyage } from "./voyage.ts";
import type { VoyageLogPanel } from "./voyage-log-panel.ts";

export interface BarlessDeps {
  chronicle: Chronicle;
  voyage: Voyage;
}

/** Typed as the real driver's `Ages` on purpose, so tsc breaks this file when createAges grows a member rather than a bar-less host silently losing a capability. */
export function barlessAges(deps: BarlessDeps): Ages {
  const { chronicle, voyage } = deps;
  const silent = (): void => {};
  return {
    isActive: () => false,
    isPlaying: () => false,
    syncSinkAtRest: silent,
    armAges: silent,
    exitAges: () => {
      chronicle.exitScrub();
      voyage.exitVoyage();
    },
    clearAges: () => {
      chronicle.clearScrub();
      voyage.clearVoyage();
    },
    cancelRaf: silent,
    pause: silent,
    togglePlay: silent,
    setPace: silent,
    onBarInput: silent,
    dragStart: silent,
    dragEnd: silent,
    snapToRest: silent,
    scrubToYear: silent,
    agesState: () => null,
  };
}

export function barlessLogPanel(): VoyageLogPanel {
  return {
    buildLogPanel: (logPorts, presentYear, seed, subtitle, homecoming = null) => ({
      log: buildVoyageLog(logPorts, presentYear, seed >>> 0, subtitle || "", homecoming),
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
